import { CompletionProvider } from "./CompletionProvider"
import { type AutocompleteInput, type AutocompleteOutcome } from "./util/types"
import * as URI from "uri-js"
import { v4 as uuidv4 } from "uuid"
import * as vscode from "vscode"

import { getDefinitionsFromLsp } from "./lsp"
import { RecentlyEditedTracker } from "./recentlyEdited"
import { RecentlyVisitedRangesService } from "./RecentlyVisitedRangesService"
import {
	StatusBarStatus,
	getStatusBarStatus,
	setStatusBarDescription,
	setupStatusBar,
	stopStatusBarLoading,
} from "./statusBar"

import { handleLLMError } from "./util/errorHandling"
import { ClineProvider } from "../webview/ClineProvider"
import { ContextProxy } from "../contextProxy"
import { ApiConfigMeta } from "../../shared/ExtensionMessage"
import { ApiConfiguration } from "../../shared/api"
import { VsCodeIde } from './VsCodeIde'
import { VsCodeWebviewProtocol } from './vscode/webviewProtocol'

const Diff = require("diff")

interface DiffType {
	count: number
	added: boolean
	removed: boolean
	value: string
}

interface VsCodeCompletionInput {
	document: vscode.TextDocument
	position: vscode.Position
	context: vscode.InlineCompletionContext
}

export class ContinueCompletionProvider implements vscode.InlineCompletionItemProvider {
	private ide: VsCodeIde
	webviewProtocolPromise: Promise<VsCodeWebviewProtocol>

	private onError(e: any) {
		if (handleLLMError(e)) {
			return
		}
		let message = e.message

		vscode.window.showErrorMessage(message, "Documentation").then((val) => {
			if (val === "Documentation") {
				vscode.env.openExternal(vscode.Uri.parse("https://docs.continue.dev/features/tab-autocomplete"))
			}
		})
	}

	private completionProvider: CompletionProvider | null = null
	private recentlyVisitedRanges: RecentlyVisitedRangesService
	private recentlyEditedTracker = new RecentlyEditedTracker()

	private contextProxy: ContextProxy

	constructor(
		private readonly provider: ClineProvider,
		private readonly context: vscode.ExtensionContext,
	) {
		this.contextProxy = new ContextProxy(this.context)

		// Tab autocomplete requires
		let resolveWebviewProtocol: any = undefined
		this.webviewProtocolPromise = new Promise<VsCodeWebviewProtocol>((resolve) => {
			resolveWebviewProtocol = resolve
		})

		this.ide = new VsCodeIde(this.webviewProtocolPromise, this.context)
		this.initCompletionProvider()
		this.recentlyVisitedRanges = new RecentlyVisitedRangesService(this.ide)
	}

	_lastShownCompletion: AutocompleteOutcome | undefined

	_lastVsCodeCompletionInput: VsCodeCompletionInput | undefined

	private async getAutocompleteApiConfiguration() {
		const { autocompleteApiConfigId, apiConfiguration, listApiConfigMeta } = await this.provider.getState()

		if (!autocompleteApiConfigId) {
			return apiConfiguration
		}

		try {
			let configToUse: ApiConfiguration = apiConfiguration
			const config = listApiConfigMeta?.find((c: ApiConfigMeta) => c.id === autocompleteApiConfigId)
			if (config?.name) {
				const loadedConfig = await this.provider.configManager.loadConfig(config.name)
				if (loadedConfig.apiProvider) {
					configToUse = loadedConfig
				}
			}
			return configToUse
		} catch (error) {
			this.provider.onWrite(
				`Error load autocomplete api configuration: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
			)
			vscode.window.showErrorMessage("Failed to load autocomplete api configuration")
			return apiConfiguration
		}
	}

	private async initCompletionProvider() {
		if (!this.contextProxy.isInitialized) {
			await this.contextProxy.initialize()
		}

		this.completionProvider = new CompletionProvider(
			this.ide,
			await this.getAutocompleteApiConfiguration(),
			this.onError.bind(this),
			getDefinitionsFromLsp,
		)
	}

	public async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken,
		//@ts-ignore
	): ProviderResult<InlineCompletionItem[] | InlineCompletionList> {
		const enableTabAutocomplete = getStatusBarStatus() === StatusBarStatus.Enabled
		if (token.isCancellationRequested || !enableTabAutocomplete) {
			return null
		}

		if (!this.completionProvider) {
			return null
		}

		if (document.uri.scheme === "vscode-scm") {
			return null
		}

		// Don't autocomplete with multi-cursor
		const editor = vscode.window.activeTextEditor
		if (editor && editor.selections.length > 1) {
			return null
		}

		// If the text at the range isn't a prefix of the intellisense text,
		// no completion will be displayed, regardless of what we return
		if (
			context.selectedCompletionInfo &&
			!context.selectedCompletionInfo.text.startsWith(document.getText(context.selectedCompletionInfo.range))
		) {
			return null
		}

		let injectDetails: string | undefined = undefined

		// The first time intellisense dropdown shows up, and the first choice is selected,
		// we should not consider this. Only once user explicitly moves down the list
		const newVsCodeInput = {
			context,
			document,
			position,
		}
		const selectedCompletionInfo = context.selectedCompletionInfo
		this._lastVsCodeCompletionInput = newVsCodeInput

		try {
			const abortController = new AbortController()
			const signal = abortController.signal
			token.onCancellationRequested(() => abortController.abort())

			// Handle notebook cells
			const pos = {
				line: position.line,
				character: position.character,
			}
			let manuallyPassFileContents: string | undefined = undefined
			if (document.uri.scheme === "vscode-notebook-cell") {
				const notebook = vscode.workspace.notebookDocuments.find((notebook) =>
					notebook
						.getCells()
						.some((cell) => URI.equal(cell.document.uri.toString(), document.uri.toString())),
				)
				if (notebook) {
					const cells = notebook.getCells()
					manuallyPassFileContents = cells
						.map((cell) => {
							const text = cell.document.getText()
							if (cell.kind === vscode.NotebookCellKind.Markup) {
								return `"""${text}"""`
							} else {
								return text
							}
						})
						.join("\n\n")
					for (const cell of cells) {
						if (URI.equal(cell.document.uri.toString(), document.uri.toString())) {
							break
						} else {
							pos.line += cell.document.getText().split("\n").length + 1
						}
					}
				}
			}

			// Manually pass file contents for unsaved, untitled files
			if (document.isUntitled) {
				manuallyPassFileContents = document.getText()
			}

			// Handle commit message input box
			let manuallyPassPrefix: string | undefined = undefined

			const input: AutocompleteInput = {
				pos,
				manuallyPassFileContents,
				manuallyPassPrefix,
				selectedCompletionInfo,
				injectDetails,
				isUntitledFile: document.isUntitled,
				completionId: uuidv4(),
				filepath: document.uri.toString(),
				recentlyVisitedRanges: this.recentlyVisitedRanges.getSnippets(),
				recentlyEditedRanges: await this.recentlyEditedTracker.getRecentlyEditedRanges(),
			}

			setupStatusBar(undefined, true)
			console.log("completionProvider.ts:provideInlineCompletionItems: 6", input)
			console.log("completionProvider.ts:provideInlineCompletionItems: 7", this.completionProvider)
			const outcome = await this.completionProvider.provideInlineCompletionItems(input, signal)
			console.log("completionProvider.ts:provideInlineCompletionItems: 8", outcome)

			if (!outcome || !outcome.completion) {
				setStatusBarDescription("No suggestion")
				return null
			}

			setStatusBarDescription("")

			// VS Code displays dependent on selectedCompletionInfo (their docstring below)
			// We should first always make sure we have a valid completion, but if it goes wrong we
			// want telemetry to be correct
			/**
			 * Provides information about the currently selected item in the autocomplete widget if it is visible.
			 *
			 * If set, provided inline completions must extend the text of the selected item
			 * and use the same range, otherwise they are not shown as preview.
			 * As an example, if the document text is `console.` and the selected item is `.log` replacing the `.` in the document,
			 * the inline completion must also replace `.` and start with `.log`, for example `.log()`.
			 *
			 * Inline completion providers are requested again whenever the selected item changes.
			 */
			if (selectedCompletionInfo) {
				outcome.completion = selectedCompletionInfo.text + outcome.completion
			}
			const willDisplay = this.willDisplay(document, selectedCompletionInfo, signal, outcome)
			if (!willDisplay) {
				return null
			}

			// Mark displayed
			this.completionProvider.markDisplayed(input.completionId, outcome)
			this._lastShownCompletion = outcome

			// Construct the range/text to show
			const startPos = selectedCompletionInfo?.range.start ?? position
			let range = new vscode.Range(startPos, startPos)
			let completionText = outcome.completion
			const isSingleLineCompletion = outcome.completion.split("\n").length <= 1

			if (isSingleLineCompletion) {
				const lastLineOfCompletionText = completionText.split("\n").pop()
				const currentText = document.lineAt(startPos).text.substring(startPos.character)
				const diffs: DiffType[] = Diff.diffWords(currentText, lastLineOfCompletionText)

				if (diffPatternMatches(diffs, ["+"])) {
					// Just insert, we're already at the end of the line
				} else if (diffPatternMatches(diffs, ["+", "="]) || diffPatternMatches(diffs, ["+", "=", "+"])) {
					// The model repeated the text after the cursor to the end of the line
					range = new vscode.Range(startPos, document.lineAt(startPos).range.end)
				} else if (diffPatternMatches(diffs, ["+", "-"]) || diffPatternMatches(diffs, ["-", "+"])) {
					// We are midline and the model just inserted without repeating to the end of the line
					// We want to move the cursor to the end of the line
					// range = new vscode.Range(
					//   startPos,
					//   document.lineAt(startPos).range.end,
					// );
					// // Find the last removed part of the diff
					// const lastRemovedIndex = findLastIndex(
					//   diffs,
					//   (diff) => diff.removed === true,
					// );
					// const lastRemovedContent = diffs[lastRemovedIndex].value;
					// completionText += lastRemovedContent;
				} else {
					// Diff is too complicated, just insert the first added part of the diff
					// This is the safe way to ensure that it is displayed
					if (diffs[0]?.added) {
						completionText = diffs[0].value
					} else {
						// If the first part of the diff isn't an insertion, then the model is
						// probably rewriting other parts of the line
						// return undefined; - Let's assume it's simply an insertion
					}
				}
			} else {
				// Extend the range to the end of the line for multiline completions
				range = new vscode.Range(startPos, document.lineAt(startPos).range.end)
			}

			const completionItem = new vscode.InlineCompletionItem(completionText, range, {
				title: "Log Autocomplete Outcome",
				command: "continue.logAutocompleteOutcome",
				arguments: [input.completionId, this.completionProvider],
			})

				; (completionItem as any).completeBracketPairs = true
			return [completionItem]
		} finally {
			stopStatusBarLoading()
		}
	}

	willDisplay(
		document: vscode.TextDocument,
		selectedCompletionInfo: vscode.SelectedCompletionInfo | undefined,
		abortSignal: AbortSignal,
		outcome: AutocompleteOutcome,
	): boolean {
		if (selectedCompletionInfo) {
			const { text, range } = selectedCompletionInfo
			if (!outcome.completion.startsWith(text)) {
				console.log(
					`Won't display completion because text doesn't match: ${text}, ${outcome.completion}`,
					range,
				)
				return false
			}
		}

		if (abortSignal.aborted) {
			return false
		}

		return true
	}
}

type DiffPartType = "+" | "-" | "="

function diffPatternMatches(diffs: DiffType[], pattern: DiffPartType[]): boolean {
	if (diffs.length !== pattern.length) {
		return false
	}

	for (let i = 0; i < diffs.length; i++) {
		const diff = diffs[i]
		const diffPartType: DiffPartType = !diff.added && !diff.removed ? "=" : diff.added ? "+" : "-"

		if (diffPartType !== pattern[i]) {
			return false
		}
	}

	return true
}

let inlineCompletionItemProvider: vscode.Disposable

export function registerInlineCompletionItemProvider(
	provider: ClineProvider,
	context: vscode.ExtensionContext
) {
	inlineCompletionItemProvider?.dispose()
	inlineCompletionItemProvider = vscode.languages.registerInlineCompletionItemProvider(
		[{ pattern: "**" }],
		new ContinueCompletionProvider(provider, context),
	)

	context.subscriptions.push(inlineCompletionItemProvider)
}
