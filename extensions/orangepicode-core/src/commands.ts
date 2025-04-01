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

export const registerCommands = (options: RegisterCommandOptions) => {
	const { context } = options

	for (const [command, callback] of Object.entries(getCommandsMap(options))) {
		context.subscriptions.push(vscode.commands.registerCommand(command, callback))
	}
}


const getCommandsMap = ({ context, outputChannel, provider }: RegisterCommandOptions) => {
	return {
		'orangepicode-core.usermenuClicked': async () => {
			const createOverlayOptions: CreateOverlayOptions = {
				id: "orangepicode-core-usermenu"
			}

			await vscode.commands.executeCommand(CREATE_OVERLAY_COMMAND_ID, createOverlayOptions)
			await vscode.commands.executeCommand(SHOW_OVERLAY_COMMAND_ID, createOverlayOptions.id)

			setTimeout(() => {
				console.log("Hiding overlay");
				vscode.commands.executeCommand(HIDE_OVERLAY_COMMAND_ID, createOverlayOptions.id)
			}, 10000);
		}
	}
}
