import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { ApiHandlerOptions, mindieModelInfoSaneDefaults, ModelInfo } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs"
import { convertToMindIEMessages } from "../transform/mindie-format"
import axios from "axios"
import { convertToR1Format } from "../transform/r1-format"
import { CompletionOptions } from "../../core/autocomplete"
import { BaseProvider } from "./base-provider"
import { DEEP_SEEK_DEFAULT_TEMPERATURE } from "./constants"
import { SingleCompletionHandler } from ".."

const MINDIE_DEFAULT_TEMPERATURE = 0

export class MindieHandler extends BaseProvider implements SingleCompletionHandler {
	private options: ApiHandlerOptions
	private client: OpenAI

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		this.client = new OpenAI({
			baseURL: (this.options.mindieBaseUrl || "http://localhost:1025") + "/v1",
			apiKey: "mindie",
		})
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...convertToMindIEMessages(messages),
		]

		const body: ChatCompletionCreateParamsStreaming = {
			model: this.getModel().id,
			messages: openAiMessages,
			temperature: this.options.modelTemperature ?? 0,
			stream: true,
		}

		const stream = await this.client.chat.completions.create(body)
		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}
		}
	}

	getModel(): { id: string; info: ModelInfo } {
		return {
			id: this.options.mindieModelId || "",
			info: mindieModelInfoSaneDefaults,
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
					temperature: this.options.modelTemperature ?? MINDIE_DEFAULT_TEMPERATURE,
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
				throw new Error(`Deepseek API Error ${error?.code}: ${error?.message}`)
			}

			yield response.choices[0]?.text || ""
		} catch (error) {
			if (signal.aborted) {
				return
			}

			if (error instanceof Error) {
				throw new Error(`Deepseek completion error: ${error.message}`)
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
					temperature:
						this.options.modelTemperature ??
						(useR1Format ? DEEP_SEEK_DEFAULT_TEMPERATURE : MINDIE_DEFAULT_TEMPERATURE),
					stream: false,
				},
				{ signal },
			)
			return response.choices[0]?.message.content || ""
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Deepseek completion error: ${error.message}`)
			}
			throw error
		}
	}
}

// mindie
export async function getMindieModels(baseUrl?: string) {
	try {
		if (!baseUrl) {
			baseUrl = "http://localhost:1025"
		}
		if (!URL.canParse(baseUrl)) {
			return []
		}
		const response = await axios.get(`${baseUrl}/v1/models`)
		const modelsArray = response.data?.data?.map((model: any) => model.id) || []
		const models = [...new Set<string>(modelsArray)]
		return models
	} catch (error) {
		return []
	}
}
