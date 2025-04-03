import { CompletionOptions, ILLM } from ".."
import { ApiHandler } from "../../../api"
import { ApiConfiguration } from "../../../shared/api"
import { StreamTransformPipeline } from "../filtering/streamTransforms/StreamTransformPipeline"
import { HelperVars } from "../util/HelperVars"

import { GeneratorReuseManager } from "./GeneratorReuseManager"

export class CompletionStreamer {
	private streamTransformPipeline = new StreamTransformPipeline()
	private generatorReuseManager: GeneratorReuseManager

	constructor(onError: (err: any) => void) {
		this.generatorReuseManager = new GeneratorReuseManager(onError)
	}

	async *streamCompletionWithFilters(
		token: AbortSignal,
		apiHandler: ApiHandler,
		prefix: string,
		suffix: string,
		prompt: string,
		multiline: boolean,
		completionOptions: Partial<CompletionOptions> | undefined,
		helper: HelperVars,
	) {
		// Try to reuse pending requests if what the user typed matches start of completion
		// 判断是否支持 FIM，使用 FIM 接口，例如：https://api-docs.deepseek.com/zh-cn/api/create-completion
		const generator = this.generatorReuseManager.getGenerator(
			prefix,
			(abortSignal: AbortSignal) => {
				const model = apiHandler.getModel()

				if (completionOptions) {
					completionOptions.model = model.id
					completionOptions.maxTokens = model.info.maxTokens
				}

				return apiHandler.supportsFim()
					? apiHandler.createFim(prefix, suffix, abortSignal, completionOptions)
					: apiHandler.createComplete(prompt, abortSignal, completionOptions)
			},
			multiline,
		)

		// Full stop means to stop the LLM's generation, instead of just truncating the displayed completion
		const fullStop = () => this.generatorReuseManager.currentGenerator?.cancel()

		// LLM
		const generatorWithCancellation = async function* () {
			for await (const update of generator) {
				if (token.aborted) {
					return
				}
				yield update
			}
		}

		const initialGenerator = generatorWithCancellation()
		const transformedGenerator = helper.options.transform
			? this.streamTransformPipeline.transform(
				initialGenerator,
				prefix,
				suffix,
				multiline,
				completionOptions?.stop || [],
				fullStop,
				helper,
			)
			: initialGenerator

		for await (const update of transformedGenerator) {
			yield update
		}
	}
}
