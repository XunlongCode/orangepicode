import vscode from 'vscode'
import CoreProvider, { ORANGEPICODE_SETTINGS_VIEWID } from './core/CoreProvider'
import { importUserSettingsFromCursor, importUserSettingsFromVSCode } from './utils/copySettings'

export const CREATE_OVERLAY_COMMAND_ID = 'workbench.action.createOverlay'
export const SHOW_OVERLAY_COMMAND_ID = 'workbench.action.showOverlay'
export const HIDE_OVERLAY_COMMAND_ID = 'workbench.action.hideOverlay'
export const TOGGLE_OVERLAY_COMMAND_ID = 'workbench.action.toggleOverlay'

export type CreateOverlayOptions = {
	id?: string
	viewId?: string
	styles?: Record<string, string>
}

export type RegisterCommandOptions = {
	context: vscode.ExtensionContext
	outputChannel: vscode.OutputChannel
	provider: CoreProvider
}

export const registerUsermenuCommands = (options: RegisterCommandOptions) => {
	const { context } = options

	for (const [command, callback] of Object.entries(getUsermenuCommandsMap(options))) {
		context.subscriptions.push(vscode.commands.registerCommand(command, callback))
	}
}


const getUsermenuCommandsMap = ({ context, outputChannel, provider }: RegisterCommandOptions) => {
	const usermenuOverlayOptions: CreateOverlayOptions = {
		id: "orangepicode-core-usermenu",
		viewId: "usermenu_view",
		styles: {
			// top: "45px",
			// left: "calc(100% - 264px)",
			// height: "456px",
			// width: "240px",
		}
	}

	return {
		'orangepicode-core.showUsermenu': async () => {
			await provider.postMessageToWebview({
				type: "onShowUsermenu"
			})

			await vscode.commands.executeCommand(CREATE_OVERLAY_COMMAND_ID, usermenuOverlayOptions)
			await vscode.commands.executeCommand(SHOW_OVERLAY_COMMAND_ID, usermenuOverlayOptions.id)
		},
		'orangepicode-core.hideUsermenu': async () => {
			vscode.commands.executeCommand(HIDE_OVERLAY_COMMAND_ID, usermenuOverlayOptions.id)
		},
		"orangepicode-core.toggleUsermenu": async () => {
			const overlay: any = await vscode.commands.executeCommand(CREATE_OVERLAY_COMMAND_ID, usermenuOverlayOptions)
			if (overlay.isVisible) {
				await vscode.commands.executeCommand("orangepicode-core.hideUsermenu")
			} else {
				await vscode.commands.executeCommand("orangepicode-core.showUsermenu")
			}
		},
		"orangepicode-core.openSettingsInNewTab": async () => {
			openSettingsInNewTab({ context, outputChannel })
		},
		"orangepicode-core.github.login": async () => {
			return await vscode.authentication.getSession('github', ['repo'], { createIfNone: true })
		},
		"orangepicode-core.github.logout": async () => {
			const authConfig = vscode.workspace.getConfiguration('github')
			await authConfig.update('authenticationProvider', undefined, true)

			await provider.postMessageToWebview({
				type: "githubLogoutSuccess"
			})
			return true
		},
		"orangepicode-core.github.getSession": async () => {
			return await vscode.authentication.getSession('github', ['repo'], { createIfNone: false })
		},
		"orangepicode-core.setTheme": async (theme: string) => {
			console.log("Setting theme to:", theme)
			if (!theme) {
				vscode.window.showErrorMessage("Invalid theme")
				return
			}

			try {
				// 使用配置方式更改主题
				await vscode.workspace.getConfiguration().update('workbench.colorTheme', theme, true)
			} catch (error) {
				console.error("切换主题失败:", error)
				vscode.window.showErrorMessage(`${error}`)
			}
		},
		"orangepicode-core.getCurrentTheme": async () => {
			return vscode.workspace.getConfiguration().get('workbench.colorTheme')
		},
		"orangepicode-core.importUserSettingsFromVSCode": async () => {
			let result
			try {
				result = await importUserSettingsFromVSCode()
			} catch (error) {
				result = { ok: false, error: error }
				vscode.window.showErrorMessage(`Failed to import settings: ${error}`)
			}
			return result
		},
		"orangepicode-core.importUserSettingsFromCursor": async () => {
			let result
			try {
				result = await importUserSettingsFromCursor()
			} catch (error) {
				result = { ok: false, error: error }
				vscode.window.showErrorMessage(`Failed to import settings: ${error}`)
			}
			return result
		}
	}
}

// 已弃用，请查看orangepiaicode插件里的实现
const openSettingsInNewTab = async ({ context, outputChannel }: Omit<RegisterCommandOptions, "provider">) => {
	outputChannel.appendLine("Opening Settings in new tab")
	// (This example uses webviewProvider activation event which is necessary to
	// deserialize cached webview, but since we use retainContextWhenHidden, we
	// don't need to use that event).
	// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts
	const tabProvider = new CoreProvider(context, outputChannel, ORANGEPICODE_SETTINGS_VIEWID)
	const newPanel = vscode.window.createWebviewPanel(ORANGEPICODE_SETTINGS_VIEWID, "Settings", 1, {
		enableScripts: true,
		retainContextWhenHidden: true,
		localResourceRoots: [context.extensionUri],
	})

	// TODO: Use better svg icon with light and dark variants (see
	// https://stackoverflow.com/questions/58365687/vscode-extension-iconpath).
	newPanel.iconPath = {
		light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "settings-light.png"),
		dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "settings-dark.png"),
	}

	await tabProvider.resolveWebviewView(newPanel)
}
