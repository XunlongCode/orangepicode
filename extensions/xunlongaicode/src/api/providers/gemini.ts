import { Anthropic } from "@anthropic-ai/sdk"
import { FunctionDeclaration, GoogleGenerativeAI, Tool } from "@google/generative-ai"
import { SingleCompletionHandler } from "../"
import { ApiHandlerOptions, geminiDefaultModelId, GeminiModelId, geminiModels, ModelInfo } from "../../shared/api"
import { convertAnthropicMessageToGemini } from "../transform/gemini-format"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import { CompletionOptions } from "../../core/autocomplete"

const GEMINI_DEFAULT_TEMPERATURE = 0

export class GeminiHandler extends BaseProvider implements SingleCompletionHandler {
	protected options: ApiHandlerOptions
	private client: GoogleGenerativeAI

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		this.client = new GoogleGenerativeAI(options.geminiApiKey ?? "not-provided")
	}

	override async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const model = this.client.getGenerativeModel(
			{
				model: this.getModel().id,
				systemInstruction: systemPrompt,
			},
			{
				baseUrl: this.options.googleGeminiBaseUrl || undefined,
			},
		)
		const result = await model.generateContentStream({
			contents: messages.map(convertAnthropicMessageToGemini),
			generationConfig: {
				// maxOutputTokens: this.getModel().info.maxTokens,
				temperature: this.options.modelTemperature ?? GEMINI_DEFAULT_TEMPERATURE,
			},
		})

		for await (const chunk of result.stream) {
			yield {
				type: "text",
				text: chunk.text(),
			}
		}

		const response = await result.response
		yield {
			type: "usage",
			inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
			outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
		}
	}

	override getModel(): { id: GeminiModelId; info: ModelInfo } {
		const modelId = this.options.apiModelId
		if (modelId && modelId in geminiModels) {
			const id = modelId as GeminiModelId
			return { id, info: geminiModels[id] }
		}
		return { id: geminiDefaultModelId, info: geminiModels[geminiDefaultModelId] }
	}

	protected async *_createComplete(
		prompt: string,
		signal: AbortSignal,
		completionOptions?: CompletionOptions,
	): AsyncGenerator<string> {
		try {
			const model = this.client.getGenerativeModel(
				{
					model: this.getModel().id,
				},
				{
					baseUrl: this.options.googleGeminiBaseUrl || undefined,
				},
			)

			const functions: FunctionDeclaration[] = []
			let tools: Tool[] = []
			completionOptions?.tools?.forEach((tool) => {
				if (tool.function.description && tool.function.name) {
					const fn: FunctionDeclaration = {
						description: tool.function.description,
						name: tool.function.name,
					}

					if (
						tool.function.parameters &&
						"type" in tool.function.parameters
						// && typeof tool.function.parameters.type === "string"
					) {
						// const paramType =  "TYPE_UNSPECIFIED"
						// | "STRING"
						// | "NUMBER"
						// | "INTEGER"
						// | "BOOLEAN"
						// | "ARRAY"
						// | "OBJECT"

						if (tool.function.parameters.type === "object") {
							// Gemini can't take an empty object
							// So if empty object param is present just don't add parameters
							if (JSON.stringify(tool.function.parameters.properties) === "{}") {
								functions.push(fn)
								return
							}
						}
						// Helper function to recursively clean JSON Schema objects
						const cleanJsonSchema = (schema: any): any => {
							if (!schema || typeof schema !== "object") return schema

							if (Array.isArray(schema)) {
								return schema.map(cleanJsonSchema)
							}

							const { $schema, additionalProperties, default: defaultValue, ...rest } = schema

							// Recursively clean nested properties
							if (rest.properties) {
								rest.properties = Object.entries(rest.properties).reduce(
									(acc, [key, value]) => ({
										...acc,
										[key]: cleanJsonSchema(value),
									}),
									{},
								)
							}

							// Clean items in arrays
							if (rest.items) {
								rest.items = cleanJsonSchema(rest.items)
							}

							return rest
						}

						// Clean the parameters and convert type to uppercase
						const cleanedParams = cleanJsonSchema(tool.function.parameters)
						fn.parameters = {
							...cleanedParams,
							type: tool.function.parameters.type.toUpperCase(),
						}
					}
					functions.push(fn)
				}
			})

			if (functions.length) {
				tools = [
					{
						functionDeclarations: functions,
					},
				]
			}

			const response = await model.generateContent(
				{
					contents: [
						{
							role: "user",
							parts: [{ text: prompt }],
						},
					],
					generationConfig: {
						temperature:
							completionOptions?.temperature ??
							this.options.modelTemperature ??
							GEMINI_DEFAULT_TEMPERATURE,
						topP: completionOptions?.topP,
						topK: completionOptions?.topK,
						stopSequences: completionOptions?.stop,
						maxOutputTokens: this.options.includeMaxTokens ? completionOptions?.maxTokens : undefined,
					},
					tools,
				},
				{ signal },
			)

			yield response.response.text()
		} catch (error) {
			if (signal.aborted) {
				return
			}

			if (error instanceof Error) {
				throw new Error(`Gemini completion error: ${error.message}`)
			}

			throw error
		}
	}

	async completePrompt(prompt: string, signal?: AbortSignal): Promise<string> {
		try {
			const model = this.client.getGenerativeModel({
				model: this.getModel().id,
			})

			const response = await model.generateContent(
				{
					contents: [{ role: "user", parts: [{ text: prompt }] }],
					generationConfig: {
						temperature: this.options.modelTemperature ?? GEMINI_DEFAULT_TEMPERATURE,
					},
				},
				{
					signal,
				},
			)

			return response.response.text()
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Gemini completion error: ${error.message}`)
			}
			throw error
		}
	}
}
