import vscode from 'vscode';
import CoreProvider, { ORANGEPICODE_SETTINGS_VIEWID } from './core/CoreProvider';

export const CREATE_OVERLAY_COMMAND_ID = 'workbench.action.createOverlay';
export const SHOW_OVERLAY_COMMAND_ID = 'workbench.action.showOverlay';
export const HIDE_OVERLAY_COMMAND_ID = 'workbench.action.hideOverlay';
export const TOGGLE_OVERLAY_COMMAND_ID = 'workbench.action.toggleOverlay';

export type CreateOverlayOptions = {
	id?: string;
	viewId?: string;
	styles?: Record<string, string>;
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
		}
	}
}

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
