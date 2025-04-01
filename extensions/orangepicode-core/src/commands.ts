import vscode from 'vscode';
import CoreProvider from './core/CoreProvider';

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
			const uuid = await vscode.commands.executeCommand("workbench.action.createOverlay")
			console.log(uuid);
		}
	}
}
