import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import axios from "axios"

import { SingleCompletionHandler } from ".."
import { ApiHandlerOptions, ModelInfo, openAiModelInfoSaneDefaults } from "../../shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { convertToR1Format } from "../transform/r1-format"
import { ApiStream } from "../transform/stream"
import { DEEP_SEEK_DEFAULT_TEMPERATURE } from "./constants"
import { XmlMatcher } from "../../utils/xml-matcher"
import { BaseProvider } from "./base-provider"
import { CompletionOptions } from "../../core/autocomplete"

export class OllamaHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client: OpenAI

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		this.client = new OpenAI({
			baseURL: (this.options.ollamaBaseUrl || "http://localhost:11434") + "/v1",
			apiKey: "ollama",
		})
	}

	override async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const modelId = this.getModel().id
		const useR1Format = modelId.toLowerCase().includes("deepseek-r1")
		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...(useR1Format ? convertToR1Format(messages) : convertToOpenAiMessages(messages)),
		]

		const stream = await this.client.chat.completions.create({
			model: this.getModel().id,
			messages: openAiMessages,
			temperature: this.options.modelTemperature ?? 0,
			stream: true,
		})
		const matcher = new XmlMatcher(
			"think",
			(chunk) =>
				({
					type: chunk.matched ? "reasoning" : "text",
					text: chunk.data,
				}) as const,
		)
		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta

			if (delta?.content) {
				for (const chunk of matcher.update(delta.content)) {
					yield chunk
				}
			}
		}
		for (const chunk of matcher.final()) {
			yield chunk
		}
	}

	override getModel(): { id: string; info: ModelInfo } {
		return {
			id: this.options.ollamaModelId || "",
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
					temperature: this.options.modelTemperature ?? 0,
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
				throw new Error(`Ollama API Error ${error?.code}: ${error?.message}`)
			}

			yield response.choices[0]?.text || ""
		} catch (error) {
			if (signal.aborted) {
				return
			}

			if (error instanceof Error) {
				throw new Error(`Ollama completion error: ${error.message}`)
			}

			throw error
		}
	}

	async completePrompt(prompt: string, signal?: AbortSignal): Promise<string> {
		try {
			const modelId = this.getModel().id
			const useR1Format = modelId.toLowerCase().includes("deepseek-r1")
			const response = await this.client.chat.completions.create(
				{
					model: this.getModel().id,
					messages: useR1Format
						? convertToR1Format([{ role: "user", content: prompt }])
						: [{ role: "user", content: prompt }],
					temperature: this.options.modelTemperature ?? (useR1Format ? DEEP_SEEK_DEFAULT_TEMPERATURE : 0),
					stream: false,
				},
				{ signal },
			)

			return response.choices[0]?.message.content || ""
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Ollama completion error: ${error.message}`)
			}
			throw error
		}
	}
}

export async function getOllamaModels(baseUrl = "http://localhost:11434") {
	try {
		if (!URL.canParse(baseUrl)) {
			return []
		}

		const response = await axios.get(`${baseUrl}/api/tags`)
		const modelsArray = response.data?.models?.map((model: any) => model.name) || []
		return [...new Set<string>(modelsArray)]
	} catch (error) {
		return []
	}
}
