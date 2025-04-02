
import * as vscode from 'vscode';
import CoreProvider, { ORANGEPICODE_ONBOARDING_VIEWID, ORANGEPICODE_USERMENU_VIEWID } from './core/CoreProvider';
import { registerUsermenuCommands } from './commands';

let outputChannel: vscode.OutputChannel
let extensionContext: vscode.ExtensionContext

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context
	outputChannel = vscode.window.createOutputChannel("OrangePi Code Core")
	context.subscriptions.push(outputChannel)
	outputChannel.appendLine("OrangePi Code Core activated")

	// OrangePi Code Core onboarding webview
	// 首次启动欢迎页面
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ORANGEPICODE_ONBOARDING_VIEWID,
			new CoreProvider(context, outputChannel),
			{
				webviewOptions: { retainContextWhenHidden: true },
			},
		),
	);

	// 用户点击头像菜单
	const usermenuProvider = new CoreProvider(context, outputChannel, ORANGEPICODE_USERMENU_VIEWID);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ORANGEPICODE_USERMENU_VIEWID,
			usermenuProvider,
			{
				webviewOptions: { retainContextWhenHidden: true },
			},
		),
	);

	registerUsermenuCommands({ context, outputChannel, provider: usermenuProvider })
}

export function deactivate() {
	outputChannel.appendLine("OrangePi Code Core deactivated")
}
