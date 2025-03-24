
import * as vscode from 'vscode';
import CoreProvider, { ORANGEPICODE_OVERLAY_VIEWID } from './core/CoreProvider';

let outputChannel: vscode.OutputChannel
let extensionContext: vscode.ExtensionContext

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context
	outputChannel = vscode.window.createOutputChannel("OrangePi Code Core")
	context.subscriptions.push(outputChannel)
	outputChannel.appendLine("OrangePi Code Core activated")

	const provider = new CoreProvider(context, outputChannel)

	// OrangePi Code Core webview
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ORANGEPICODE_OVERLAY_VIEWID,
			provider,
			{
				webviewOptions: { retainContextWhenHidden: true },
			},
		),
	);
}

export function deactivate() {
	outputChannel.appendLine("OrangePi Code Core deactivated")
}
