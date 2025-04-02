import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { SingleCompletionHandler } from ".."
import {
	ApiHandlerOptions,
	ModelInfo,
	openAiNativeDefaultModelId,
	OpenAiNativeModelId,
	openAiNativeModels,
} from "../../shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import { CompletionOptions } from "../../core/autocomplete"

const OPENAI_NATIVE_DEFAULT_TEMPERATURE = 0

export class OpenAiNativeHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client: OpenAI

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		const apiKey = this.options.openAiNativeApiKey ?? "not-provided"
		this.client = new OpenAI({ apiKey })
	}

	override async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const modelId = this.getModel().id

		if (modelId.startsWith("o1")) {
			yield* this.handleO1FamilyMessage(modelId, systemPrompt, messages)
			return
		}

		if (modelId.startsWith("o3-mini")) {
			yield* this.handleO3FamilyMessage(modelId, systemPrompt, messages)
			return
		}

		yield* this.handleDefaultModelMessage(modelId, systemPrompt, messages)
	}

	private async *handleO1FamilyMessage(
		modelId: string,
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
	): ApiStream {
		// o1 supports developer prompt with formatting
		// o1-preview and o1-mini only support user messages
		const isOriginalO1 = modelId === "o1"
		const response = await this.client.chat.completions.create({
			model: modelId,
			messages: [
				{
					role: isOriginalO1 ? "developer" : "user",
					content: isOriginalO1 ? `Formatting re-enabled\n${systemPrompt}` : systemPrompt,
				},
				...convertToOpenAiMessages(messages),
			],
			stream: true,
			stream_options: { include_usage: true },
		})

		yield* this.handleStreamResponse(response)
	}

	private async *handleO3FamilyMessage(
		modelId: string,
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
	): ApiStream {
		const stream = await this.client.chat.completions.create({
			model: "o3-mini",
			messages: [
				{
					role: "developer",
					content: `Formatting re-enabled\n${systemPrompt}`,
				},
				...convertToOpenAiMessages(messages),
			],
			stream: true,
			stream_options: { include_usage: true },
			reasoning_effort: this.getModel().info.reasoningEffort,
		})

		yield* this.handleStreamResponse(stream)
	}

	private async *handleDefaultModelMessage(
		modelId: string,
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
	): ApiStream {
		const stream = await this.client.chat.completions.create({
			model: modelId,
			temperature: this.options.modelTemperature ?? OPENAI_NATIVE_DEFAULT_TEMPERATURE,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			stream: true,
			stream_options: { include_usage: true },
		})

		yield* this.handleStreamResponse(stream)
	}

	private async *yieldResponseData(response: OpenAI.Chat.Completions.ChatCompletion): ApiStream {
		yield {
			type: "text",
			text: response.choices[0]?.message.content || "",
		}
		yield {
			type: "usage",
			inputTokens: response.usage?.prompt_tokens || 0,
			outputTokens: response.usage?.completion_tokens || 0,
		}
	}

	private async *handleStreamResponse(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>): ApiStream {
		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}

			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
				}
			}
		}
	}

	override getModel(): { id: OpenAiNativeModelId; info: ModelInfo } {
		const modelId = this.options.apiModelId
		if (modelId && modelId in openAiNativeModels) {
			const id = modelId as OpenAiNativeModelId
			return { id, info: openAiNativeModels[id] }
		}
		return { id: openAiNativeDefaultModelId, info: openAiNativeModels[openAiNativeDefaultModelId] }
	}

	protected async *_createComplete(
		prompt: string,
		signal: AbortSignal,
		completionOptions?: CompletionOptions,
	): AsyncGenerator<string> {
		try {
			const model = this.getModel()

			const response = await this.client.completions.create(
				{
					prompt,
					model: model.id,
					max_tokens: this.options.includeMaxTokens ? model.info.maxTokens : undefined,
					temperature: this.options.modelTemperature ?? OPENAI_NATIVE_DEFAULT_TEMPERATURE,
					top_p: completionOptions?.topP,
					frequency_penalty: completionOptions?.frequencyPenalty,
					presence_penalty: completionOptions?.presencePenalty,
					stream: false,
					stop: completionOptions?.stop,
				},
				{ signal },
			)

			if ("error" in response) {
				const error = response.error as { message?: string; code?: number }
				throw new Error(`OpenAI Native API Error ${error?.code}: ${error?.message}`)
			}

			yield response.choices[0]?.text || ""
		} catch (error) {
			if (signal.aborted) {
				return
			}

			if (error instanceof Error) {
				throw new Error(`OpenAI Native completion error: ${error.message}`)
			}

			throw error
		}
	}

	async completePrompt(prompt: string, signal?: AbortSignal): Promise<string> {
		try {
			const modelId = this.getModel().id
			let requestOptions: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming

			if (modelId.startsWith("o1")) {
				requestOptions = this.getO1CompletionOptions(modelId, prompt)
			} else if (modelId.startsWith("o3-mini")) {
				requestOptions = this.getO3CompletionOptions(modelId, prompt)
			} else {
				requestOptions = this.getDefaultCompletionOptions(modelId, prompt)
			}

			const response = await this.client.chat.completions.create(requestOptions, { signal })
			return response.choices[0]?.message.content || ""
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`OpenAI Native completion error: ${error.message}`)
			}
			throw error
		}
	}

	private getO1CompletionOptions(
		modelId: string,
		prompt: string,
	): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
		return {
			model: modelId,
			messages: [{ role: "user", content: prompt }],
		}
	}

	private getO3CompletionOptions(
		modelId: string,
		prompt: string,
	): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
		return {
			model: "o3-mini",
			messages: [{ role: "user", content: prompt }],
			reasoning_effort: this.getModel().info.reasoningEffort,
		}
	}

	private getDefaultCompletionOptions(
		modelId: string,
		prompt: string,
	): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
		return {
			model: modelId,
			messages: [{ role: "user", content: prompt }],
			temperature: this.options.modelTemperature ?? OPENAI_NATIVE_DEFAULT_TEMPERATURE,
		}
	}
}
