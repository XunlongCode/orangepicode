import * as vscode from "vscode"
import * as dotenvx from "@dotenvx/dotenvx"

// Load environment variables from .env file
try {
	// Specify path to .env file in the project root directory
	const envPath = __dirname + "/../.env"
	dotenvx.config({ path: envPath })
} catch (e) {
	// Silently handle environment loading errors
	console.warn("Failed to load environment variables:", e)
}

import "./utils/path" // Necessary to have access to String.prototype.toPosix.

import { initializeI18n } from "./i18n"
import { ClineProvider } from "./core/webview/ClineProvider"
import { CodeActionProvider } from "./core/CodeActionProvider"
import { DIFF_VIEW_URI_SCHEME } from "./integrations/editor/DiffViewProvider"
import { McpServerManager } from "./services/mcp/McpServerManager"
import { Battery } from "./core/autocomplete/util/battery"
import { chatViewTelemetryService, codeViewTelemetryService, telemetryService } from "./services/telemetry/TelemetryService"
import { TerminalRegistry } from "./integrations/terminal/TerminalRegistry"
import { API } from "./exports/api"

import { handleUri, registerCommands, registerCodeActions, registerTerminalActions } from "./activate"
import { formatLanguage } from "./shared/language"
import { monitorLanguageChange } from "./languageMonitor"
/**
 * Built using https://github.com/microsoft/vscode-webview-ui-toolkit
 *
 * Inspired by:
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra
 */

let outputChannel: vscode.OutputChannel
let extensionContext: vscode.ExtensionContext
let battery: Battery

// This method is called when your extension is activated.
// Your extension is activated the very first time the command is executed.
export function activate(context: vscode.ExtensionContext) {
	extensionContext = context
	outputChannel = vscode.window.createOutputChannel("OrangePiAI-Code")
	context.subscriptions.push(outputChannel)
	outputChannel.appendLine("OrangePiAI-Code extension activated")
	battery = new Battery()

	// Initialize telemetry service after environment variables are loaded.
	telemetryService.initialize()

	// Initialize i18n for internationalization support
	// initializeI18n(context.globalState.get("language") ?? formatLanguage(vscode.env.language))
	initializeI18n(formatLanguage(vscode.env.language))
	// Initialize terminal shell execution handlers.
	TerminalRegistry.initialize()

	// Get default commands from configuration.
	const defaultCommands = vscode.workspace.getConfiguration("orangepiaicode").get<string[]>("allowedCommands") || []

	// Initialize global state if not already set.
	if (!context.globalState.get("allowedCommands")) {
		context.globalState.update("allowedCommands", defaultCommands)
	}

	const provider = new ClineProvider(context, outputChannel, "sidebar")
	telemetryService.setProvider(provider)

	// Validate task history on extension activation
	provider.validateTaskHistory().catch((error) => {
		outputChannel.appendLine(`Failed to validate sidebar task history: ${error}`)
	})

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClineProvider.sideBarId, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	registerCommands({ context, outputChannel, provider, battery })

	// chat 模式
	const chatViewProvider = new ClineProvider(context, outputChannel, "chat")
	chatViewTelemetryService.setProvider(chatViewProvider)

	chatViewProvider.validateTaskHistory().catch((error) => {
		outputChannel.appendLine(`Failed to validate chat task history: ${error}`)
	})

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClineProvider.chatViewId, chatViewProvider, {
			webviewOptions: { retainContextWhenHidden: true },
		})
	)

	// 注册chat模式指令
	// registerCommands({ context, outputChannel, provider: chatViewProvider, battery })

	// code 模式
	const codeViewProvider = new ClineProvider(context, outputChannel, "code")
	codeViewTelemetryService.setProvider(codeViewProvider)

	// Validate task history on extension activation
	codeViewProvider.validateTaskHistory().catch((error) => {
		outputChannel.appendLine(`Failed to validate code task history: ${error}`)
	})

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClineProvider.codeViewId, codeViewProvider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)
	// 注册code模式指令
	// registerCommands({ context, outputChannel, provider: codeViewProvider, battery })

	/**
	 * We use the text document content provider API to show the left side for diff
	 * view by creating a virtual document for the original content. This makes it
	 * readonly so users know to edit the right side if they want to keep their changes.
	 *
	 * This API allows you to create readonly documents in VSCode from arbitrary
	 * sources, and works by claiming an uri-scheme for which your provider then
	 * returns text contents. The scheme must be provided when registering a
	 * provider and cannot change afterwards.
	 *
	 * Note how the provider doesn't create uris for virtual documents - its role
	 * is to provide contents given such an uri. In return, content providers are
	 * wired into the open document logic so that providers are always considered.
	 *
	 * https://code.visualstudio.com/api/extension-guides/virtual-documents
	 */
	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider),
	)

	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))

	// Register code actions provider.
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider({ pattern: "**/*" }, new CodeActionProvider(), {
			providedCodeActionKinds: CodeActionProvider.providedCodeActionKinds,
		}),
	)

	registerCodeActions(context)
	registerTerminalActions(context)


	// 监听语言变化 目前不需要(不需要)
	// const languageMonitor = monitorLanguageChange((newLocale) => {
	// 	console.log(`VSCode 语言已更改为: ${newLocale}`);

	// 	// 在这里处理语言变化后的逻辑
	// 	// 例如更新 WebView 的语言、重新加载翻译资源等
	// 	if (newLocale.startsWith('zh')) {
	// 		// 处理切换到中文的逻辑


	// 	} else if (newLocale.startsWith('en')) {
	// 		// 处理切换到英文的逻辑
	// 	}
	// 	// 可以添加其他语言的处理...
	// });

	// 将监听器添加到订阅列表，以便在扩展停用时自动清理
	// context.subscriptions.push(languageMonitor);

	// Implements the `RooCodeAPI` interface.
	return new API(outputChannel, codeViewProvider)
}

// This method is called when your extension is deactivated
export async function deactivate() {
	outputChannel.appendLine("OrangePiAI-Code extension deactivated")
	// Clean up MCP server manager
	await McpServerManager.cleanup(extensionContext)
	telemetryService.shutdown()

	// Clean up terminal handlers
	TerminalRegistry.cleanup()
}
