import vscode, { AuthenticationGetSessionOptions } from 'vscode'
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
	pointerPass?: boolean // 是否允许指针穿透
}

export type RegisterCommandOptions = {
	context: vscode.ExtensionContext
	outputChannel: vscode.OutputChannel
	provider: CoreProvider
}

export type LanguagePack = {
	id: string; // "zh-cn",
	label?: string; // "中文(简体)",
	description?: string; // "(zh-cn)",
	extensionId?: string; // "ms-ceintl.vscode-language-pack-zh-hans",
	/**
	 * [
				{
					"tooltip": "More Info",
					"iconClass": "codicon-info"
				}
			]
	 */
	buttons?: {
		tooltip: string;
		iconClass: string;
	}[];
}

export const registerUsermenuCommands = (options: RegisterCommandOptions) => {
	const { context } = options

	for (const [command, callback] of Object.entries(getUsermenuCommandsMap(options))) {
		context.subscriptions.push(vscode.commands.registerCommand(command, callback))
	}
}

const getLanguagePackById = (id: string): LanguagePack => {
	id = id.toLowerCase()

	switch (id) {
		case "zh-cn":
			return {
				id: "zh-cn",
				label: "中文(简体)",
				description: "(zh-cn)",
				extensionId: "ms-ceintl.vscode-language-pack-zh-hans",
			}

		default:
			return {
				id: id,
				label: id,
				description: `${id}`,
			}
	}
}

const getGithubSession = async (options?: AuthenticationGetSessionOptions) => {
	return await vscode.authentication.getSession('github', ['read:user', 'user:email'], options)
}

const getUsermenuCommandsMap = ({ context, outputChannel, provider }: RegisterCommandOptions) => {
	const usermenuOverlayOptions: CreateOverlayOptions = {
		id: "orangepicode-core-usermenu",
		pointerPass: true,
		viewId: "usermenu_view",
		styles: {
			// top: "45px",
			// left: "calc(100% - 264px)",
			// height: "456px",
			// width: "240px",
		},
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
			const githubSession = await getGithubSession({
				forceNewSession: true
			})
			return githubSession
		},
		"orangepicode-core.github.logout": async () => {
			// 退出登录 GitHub
			const githubSession = await getGithubSession({ createIfNone: false })
			if (githubSession) {
				await vscode.commands.executeCommand('_signOutOfAccountWithoutConfirmation',
					{ providerId: 'github', accountLabel: githubSession.account.label })
			}

			await provider.postMessageToWebview({
				type: "githubLogoutSuccess"
			})
			return true
		},
		"orangepicode-core.github.getSession": async () => {
			return await getGithubSession({ createIfNone: false })
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
		},
		"orangepicode-core.setLanguageById": async (languageId: string, skipDialog?: boolean) => {
			await vscode.commands.executeCommand(
				"workbench.action.setLocale",
				getLanguagePackById(languageId),
				Boolean(skipDialog)
			)
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
