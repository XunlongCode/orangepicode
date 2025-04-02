import { defaultHeaders, OpenAiHandler, OpenAiHandlerOptions } from "./openai"
import { deepSeekModels, deepSeekDefaultModelId, ModelInfo } from "../../shared/api"
import { ApiStreamUsageChunk } from "../transform/stream" // Import for type
import { getModelParams } from "../index"
import OpenAI from "openai"
import { CompletionOptions } from "../../core/autocomplete"
import { DEEP_SEEK_DEFAULT_TEMPERATURE } from "./constants"

export class DeepSeekHandler extends OpenAiHandler {
	private dsClient: OpenAI

	constructor(options: OpenAiHandlerOptions) {
		super({
			...options,
			openAiApiKey: options.deepSeekApiKey ?? "not-provided",
			openAiModelId: options.apiModelId ?? deepSeekDefaultModelId,
			openAiBaseUrl: options.deepSeekBaseUrl ?? "https://api.deepseek.com",
			openAiStreamingEnabled: true,
			includeMaxTokens: true,
		})

		this.dsClient = new OpenAI({
			baseURL: options.deepSeekBaseUrl ?? "https://api.deepseek.com/v1",
			apiKey: options.deepSeekApiKey ?? "not-provided",
			defaultHeaders: defaultHeaders,
		})
	}

	supportsFim(): boolean {
		return true
	}

	protected async *_createFim(
		prefix: string,
		suffix: string,
		signal: AbortSignal,
		completionOptions?: CompletionOptions,
	): AsyncGenerator<string> {
		try {
			const model = this.getModel()

			const response = await this.dsClient.request<any, any>({
				path: new URL("/beta/completions", this.dsClient.baseURL).toString(),
				method: "post",
				body: {
					prompt: prefix,
					suffix,
					model: model.id,
					max_tokens: this.options.includeMaxTokens ? completionOptions?.maxTokens : undefined,
					stop: completionOptions?.stop,
					temperature: this.options.modelTemperature ?? DEEP_SEEK_DEFAULT_TEMPERATURE,
					frequency_penalty: completionOptions?.frequencyPenalty,
					presence_penalty: completionOptions?.presencePenalty,
					top_p: completionOptions?.topP,
					stream: false,
				},
				signal,
			})

			if ("error" in response) {
				const error = response.error as { message?: string; code?: number }
				throw new Error(`Deepseek API Error ${error?.code}: ${error?.message}`)
			}

			let content = ""
			const choices0 = response.choices?.[0]
			if (choices0) {
				content = choices0.text ?? ""
			}

			yield content
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

	override getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.apiModelId ?? deepSeekDefaultModelId
		const info = deepSeekModels[modelId as keyof typeof deepSeekModels] || deepSeekModels[deepSeekDefaultModelId]

		return {
			id: modelId,
			info,
			...getModelParams({ options: this.options, model: info }),
		}
	}

	// Override to handle DeepSeek's usage metrics, including caching.
	protected override processUsageMetrics(usage: any): ApiStreamUsageChunk {
		return {
			type: "usage",
			inputTokens: usage?.prompt_tokens || 0,
			outputTokens: usage?.completion_tokens || 0,
			cacheWriteTokens: usage?.prompt_tokens_details?.cache_miss_tokens,
			cacheReadTokens: usage?.prompt_tokens_details?.cached_tokens,
		}
	}
}
