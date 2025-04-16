import * as vscode from "vscode"
import delay from "delay"

import { ClineProvider } from "../core/webview/ClineProvider"
import { Telemetry } from "../core/autocomplete/util/posthog"
import { Battery } from "../core/autocomplete/util/battery"
import {
	getStatusBarStatus,
	getStatusBarStatusFromQuickPickItemLabel,
	quickPickStatusText,
	setupStatusBar,
	StatusBarStatus,
} from "../core/autocomplete/statusBar"

type TelemetryCaptureParams = Parameters<typeof Telemetry.capture>

/**
 * Helper method to add the `isCommandEvent` to all telemetry captures
 */
function captureCommandTelemetry(commandName: TelemetryCaptureParams[0], properties: TelemetryCaptureParams[1] = {}) {
	Telemetry.capture(commandName, { isCommandEvent: true, ...properties })
}

import { registerHumanRelayCallback, unregisterHumanRelayCallback, handleHumanRelayResponse } from "./humanRelay"
import { EXTENSION_NAME } from "../core/autocomplete/control-plane/env"

// Store panel references in both modes
let sidebarPanel: vscode.WebviewView | undefined = undefined
let tabPanel: vscode.WebviewPanel | undefined = undefined
let settingsPanel: vscode.WebviewPanel | undefined = undefined

/**
 * Get the currently active panel
 * @returns WebviewPanel或WebviewView
 */
export function getPanel(): vscode.WebviewPanel | vscode.WebviewView | undefined {
	return tabPanel || sidebarPanel
}

export function getSettingsPanel(): vscode.WebviewPanel | undefined {
	return settingsPanel
}

/**
 * Set panel references
 */
export function setPanel(
	newPanel: vscode.WebviewPanel | vscode.WebviewView | undefined,
	type: "sidebar" | "tab" | "settings",
): void {
	if (type === "sidebar") {
		sidebarPanel = newPanel as vscode.WebviewView
		tabPanel = undefined
	} else if (type === "tab") {
		tabPanel = newPanel as vscode.WebviewPanel
		sidebarPanel = undefined
	} else if (type === "settings") {
		settingsPanel = newPanel as vscode.WebviewPanel
	}
}

export type RegisterCommandOptions = {
	context: vscode.ExtensionContext
	outputChannel: vscode.OutputChannel
	provider: ClineProvider
	battery: Battery
}

export const registerCommands = (options: RegisterCommandOptions, mode?: "chat" | "code") => {
	const { context, outputChannel } = options

	for (const [command, callback] of Object.entries(getCommandsMap(options, mode))) {
		context.subscriptions.push(vscode.commands.registerCommand(command, callback))
	}
}

const getCommandsMap = ({ context, outputChannel, provider, battery }: RegisterCommandOptions, mode?: "chat" | "code") => {
	const onPlusButtonClicked = async () => {
		await provider.removeClineFromStack()
		await provider.postStateToWebview()
		await provider.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
	}

	const onHistoryButtonClicked = async () => {
		await provider.postMessageToWebview({ type: "action", action: "historyButtonClicked" })
	}

	const postStateToWebview = async () => {
		const state = await provider.getStateToPostToWebview()
		await provider.postMessageToWebview({ type: "state", state })
	}

	if (mode === "chat") {
		return {
			"orangepiaicode-chat.plusButtonClicked": onPlusButtonClicked,
			"orangepiaicode-chat.historyButtonClicked": onHistoryButtonClicked,
			"orangepiaicode-chat.postStateToWebview": postStateToWebview,
		}
	} else if (mode === "code") {
		return {
			"orangepiaicode-code.plusButtonClicked": onPlusButtonClicked,
			"orangepiaicode-code.historyButtonClicked": onHistoryButtonClicked,
			"orangepiaicode-code.postStateToWebview": postStateToWebview,
		}
	}

	return {
		"orangepiaicode.postStateToWebview": postStateToWebview,
		"orangepiaicode.plusButtonClicked": onPlusButtonClicked,
		"orangepiaicode.mcpButtonClicked": () => {
			provider.postMessageToWebview({ type: "action", action: "mcpButtonClicked" })
		},
		"orangepiaicode.promptsButtonClicked": () => {
			provider.postMessageToWebview({ type: "action", action: "promptsButtonClicked" })
		},
		"orangepiaicode.popoutButtonClicked": () => openClineInNewTab({ context, outputChannel }),
		"orangepiaicode.openInNewTab": () => openClineInNewTab({ context, outputChannel }),
		"orangepiaicode.openSettings": () => openSettings({ context, outputChannel }),
		"orangepiaicode.settingsButtonClicked": () => {
			provider.postMessageToWebview({ type: "action", action: "settingsButtonClicked" })
		},
		"orangepiaicode.historyButtonClicked": onHistoryButtonClicked,
		"orangepiaicode.helpButtonClicked": () => {
			vscode.env.openExternal(vscode.Uri.parse("https://docs.roocode.com"))
		},
		"orangepiaicode.openTabAutocompleteConfigMenu": async () => {
			captureCommandTelemetry("openTabAutocompleteConfigMenu")

			const config = vscode.workspace.getConfiguration(EXTENSION_NAME)
			const quickPick = vscode.window.createQuickPick()

			// const currentModel = (await provider.getState()).apiConfiguration.apiModelId || undefined

			// Toggle between Disabled, Paused, and Enabled
			const pauseOnBattery = config.get<boolean>("pauseTabAutocompleteOnBattery") && !battery.isACConnected()
			const currentStatus = getStatusBarStatus()

			let targetStatus: StatusBarStatus | undefined
			if (pauseOnBattery) {
				// Cycle from Disabled -> Paused -> Enabled
				targetStatus =
					currentStatus === StatusBarStatus.Paused
						? StatusBarStatus.Enabled
						: currentStatus === StatusBarStatus.Disabled
							? StatusBarStatus.Paused
							: StatusBarStatus.Disabled
			} else {
				// Toggle between Disabled and Enabled
				targetStatus =
					currentStatus === StatusBarStatus.Disabled ? StatusBarStatus.Enabled : StatusBarStatus.Disabled
			}

			quickPick.items = [
				{
					label: "$(comment) Open OrangePi AI Code",
				},
				{
					label: "$(screen-full) Open OrangePi AI Code in new tab",
				},
				{
					label: quickPickStatusText(targetStatus),
				},
			]
			quickPick.onDidAccept(() => {
				const selectedOption = quickPick.selectedItems[0].label
				const targetStatus = getStatusBarStatusFromQuickPickItemLabel(selectedOption)

				if (targetStatus !== undefined) {
					setupStatusBar(targetStatus)
					config.update(
						"enableTabAutocomplete",
						targetStatus === StatusBarStatus.Enabled,
						vscode.ConfigurationTarget.Global,
					)
				} else if (selectedOption === "$(comment) Open OrangePi AI Code") {
					vscode.commands.executeCommand(`${ClineProvider.sideBarId}.focus`)
				} else if (selectedOption === "$(screen-full) Open OrangePi AI Code in new tab") {
					vscode.commands.executeCommand("orangepiaicode.openInNewTab")
				}
				quickPick.dispose()
			})
			quickPick.show()
		},
		"orangepiaicode.showHumanRelayDialog": (params: { requestId: string; promptText: string }) => {
			const panel = getPanel()

			if (panel) {
				panel?.webview.postMessage({
					type: "showHumanRelayDialog",
					requestId: params.requestId,
					promptText: params.promptText,
				})
			}
		},
		"orangepiaicode.registerHumanRelayCallback": registerHumanRelayCallback,
		"orangepiaicode.unregisterHumanRelayCallback": unregisterHumanRelayCallback,
		"orangepiaicode.handleHumanRelayResponse": handleHumanRelayResponse,
	}
}

const openClineInNewTab = async ({ context, outputChannel }: Omit<RegisterCommandOptions, "provider" | "battery">) => {
	outputChannel.appendLine("Opening OrangePi AI Code in new tab")
	// (This example uses webviewProvider activation event which is necessary to
	// deserialize cached webview, but since we use retainContextWhenHidden, we
	// don't need to use that event).
	// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts
	const tabProvider = new ClineProvider(context, outputChannel, "editor")
	const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

	// Check if there are any visible text editors, otherwise open a new group
	// to the right.
	const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0

	if (!hasVisibleEditors) {
		await vscode.commands.executeCommand("workbench.action.newGroupRight")
	}

	const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

	const newPanel = vscode.window.createWebviewPanel(ClineProvider.tabPanelId, "OrangePi AI Code", targetCol, {
		enableScripts: true,
		retainContextWhenHidden: true,
		localResourceRoots: [context.extensionUri],
	})

	// Save as tab type panel.
	setPanel(newPanel, "tab")

	// TODO: Use better svg icon with light and dark variants (see
	// https://stackoverflow.com/questions/58365687/vscode-extension-iconpath).
	newPanel.iconPath = {
		light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "orangepi.png"),
		dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "orangepi.png"),
	}

	await tabProvider.resolveWebviewView(newPanel)

	// Handle panel closing events.
	newPanel.onDidDispose(() => {
		setPanel(undefined, "tab")
	})

	// Lock the editor group so clicking on files doesn't open them over the panel.
	await delay(100)
	await vscode.commands.executeCommand("workbench.action.lockEditorGroup")
}

const openSettings = async ({ context, outputChannel }: Omit<RegisterCommandOptions, "provider" | "battery">) => {
	outputChannel.appendLine("Opening Settings in new tab")

	// 如果面板已经创建，则直接显示
	if (settingsPanel) {
		settingsPanel.reveal()
		return
	}

	// (This example uses webviewProvider activation event which is necessary to
	// deserialize cached webview, but since we use retainContextWhenHidden, we
	// don't need to use that event).
	// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts
	const tabProvider = new ClineProvider(context, outputChannel, "settings")

	const newPanel = vscode.window.createWebviewPanel(ClineProvider.tabPanelId, "Settings", 1, {
		enableScripts: true,
		retainContextWhenHidden: true,
		localResourceRoots: [context.extensionUri],
	})

	// Save as tab type panel.
	setPanel(newPanel, "settings")

	// TODO: Use better svg icon with light and dark variants (see
	// https://stackoverflow.com/questions/58365687/vscode-extension-iconpath).
	newPanel.iconPath = {
		light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "settings-light.png"),
		dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "settings-dark.png"),
	}

	await tabProvider.resolveWebviewView(newPanel)

	// Handle panel closing events.
	newPanel.onDidDispose(() => {
		setPanel(undefined, "settings")
	})
}
