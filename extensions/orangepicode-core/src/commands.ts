import vscode from 'vscode';
import CoreProvider from './core/CoreProvider';

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
			await vscode.commands.executeCommand(CREATE_OVERLAY_COMMAND_ID, usermenuOverlayOptions)
			await vscode.commands.executeCommand(SHOW_OVERLAY_COMMAND_ID, usermenuOverlayOptions.id)
		},
		'orangepicode-core.hideUsermenu': async () => {
			vscode.commands.executeCommand(HIDE_OVERLAY_COMMAND_ID, usermenuOverlayOptions.id)
		}
	}
}
