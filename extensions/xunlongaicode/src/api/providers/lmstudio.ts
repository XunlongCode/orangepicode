import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import axios from "axios"

import { SingleCompletionHandler } from ".."
import { ApiHandlerOptions, ModelInfo, openAiModelInfoSaneDefaults } from "../../shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import { CompletionOptions } from "../../core/autocomplete"

const LMSTUDIO_DEFAULT_TEMPERATURE = 0

export class LmStudioHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client: OpenAI

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		this.client = new OpenAI({
			baseURL: (this.options.lmStudioBaseUrl || "http://localhost:1234") + "/v1",
			apiKey: "noop",
		})
	}

	override async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...convertToOpenAiMessages(messages),
		]

		try {
			// Create params object with optional draft model
			const params: any = {
				model: this.getModel().id,
				messages: openAiMessages,
				temperature: this.options.modelTemperature ?? LMSTUDIO_DEFAULT_TEMPERATURE,
				stream: true,
			}

			// Add draft model if speculative decoding is enabled and a draft model is specified
			if (this.options.lmStudioSpeculativeDecodingEnabled && this.options.lmStudioDraftModelId) {
				params.draft_model = this.options.lmStudioDraftModelId
			}

			const results = await this.client.chat.completions.create(params)

			// Stream handling
			// @ts-ignore
			for await (const chunk of results) {
				const delta = chunk.choices[0]?.delta
				if (delta?.content) {
					yield {
						type: "text",
						text: delta.content,
					}
				}
			}
		} catch (error) {
			// LM Studio doesn't return an error code/body for now
			throw new Error(
				"Please check the LM Studio developer logs to debug what went wrong. You may need to load the model with a larger context length to work with OrangePi AI Code's prompts.",
			)
		}
	}

	override getModel(): { id: string; info: ModelInfo } {
		return {
			id: this.options.lmStudioModelId || "",
			info: openAiModelInfoSaneDefaults,
		}
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
					temperature: this.options.modelTemperature ?? LMSTUDIO_DEFAULT_TEMPERATURE,
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
				throw new Error(`LM Studio API Error ${error?.code}: ${error?.message}`)
			}

			yield response.choices[0]?.text || ""
		} catch (error) {
			if (signal.aborted) {
				return
			}

			if (error instanceof Error) {
				throw new Error(`LM Studio completion error: ${error.message}`)
			}

			throw error
		}
	}

	async completePrompt(prompt: string, signal?: AbortSignal): Promise<string> {
		try {
			// Create params object with optional draft model
			const params: any = {
				model: this.getModel().id,
				messages: [{ role: "user", content: prompt }],
				temperature: this.options.modelTemperature ?? LMSTUDIO_DEFAULT_TEMPERATURE,
				stream: false,
			}

			// Add draft model if speculative decoding is enabled and a draft model is specified
			if (this.options.lmStudioSpeculativeDecodingEnabled && this.options.lmStudioDraftModelId) {
				params.draft_model = this.options.lmStudioDraftModelId
			}

			const response = await this.client.chat.completions.create(params, {
				signal,
			})

			return response.choices[0]?.message.content || ""
		} catch (error) {
			throw new Error(
				"Please check the LM Studio developer logs to debug what went wrong. You may need to load the model with a larger context length to work with OrangePi AI Code's prompts.",
			)
		}
	}
}

export async function getLmStudioModels(baseUrl = "http://localhost:1234") {
	try {
		if (!URL.canParse(baseUrl)) {
			return []
		}

		const response = await axios.get(`${baseUrl}/v1/models`)
		const modelsArray = response.data?.data?.map((model: any) => model.id) || []
		return [...new Set<string>(modelsArray)]
	} catch (error) {
		return []
	}
}
