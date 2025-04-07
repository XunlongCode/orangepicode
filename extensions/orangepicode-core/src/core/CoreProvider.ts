import vscode from 'vscode';
import { getUri } from '../utils/getUri';
import { getNonce } from '../utils/getNonce';
import axios from 'axios';
import { ExtensionMessage } from '../shared/ExtensionMessage';
import { WebviewMessage } from '../shared/WebviewMessage';
import { getTheme, getThemeType } from '../utils/getTheme';
import { v4 as uuidv4 } from 'uuid';
import { importUserSettingsFromCursor, importUserSettingsFromVSCode } from '../utils/copySettings';
import { error } from 'console';

export const ORANGEPICODE_ONBOARDING_VIEWID = "onboarding_view";
export const ORANGEPICODE_USERMENU_VIEWID = "usermenu_view";
export const ORANGEPICODE_SETTINGS_VIEWID = "settings_view";

class CoreProvider implements vscode.WebviewViewProvider {
	private view?: vscode.WebviewView | vscode.WebviewPanel;
	private disposables: vscode.Disposable[] = []

	constructor(
		readonly context: vscode.ExtensionContext,
		private readonly outputChannel: vscode.OutputChannel,
		public readonly viewId: string = ORANGEPICODE_ONBOARDING_VIEWID
	) {
		console.log("OrangePi Code CoreProvider for view id: ", this.viewId);
	}

	public async resolveWebviewView(webviewView: vscode.WebviewView | vscode.WebviewPanel) {
		console.log("CoreProvider resolveWebviewView", this.context.extensionUri);
		this.outputChannel.appendLine("Resolving webview view");
		this.view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri],
		}

		const isDev = this.context.extensionMode === vscode.ExtensionMode.Development || process.env.VSCODE_DEV === '1'
		webviewView.webview.html = isDev
			? await this.getHMRHtmlContent(webviewView.webview)
			: await this.getHtmlContent(webviewView.webview)

		this.setWebviewMessageListener(webviewView.webview)

		this.outputChannel.appendLine("Webview view resolved");
	}

	public async postMessageToWebview(message: ExtensionMessage) {
		message.messageId = message.messageId ?? uuidv4()
		await this.view?.webview.postMessage(message)
	}

	private onWebviewDidLaunch() {
		vscode.window.onDidChangeActiveColorTheme(async (e) => {
			const theme = await getTheme(this.context)
			const themeType = getThemeType()
			this.postMessageToWebview({
				type: "setTheme",
				theme
			})
			this.postMessageToWebview({
				type: "setThemeType",
				themeType,
			})
		})

		vscode.workspace.onDidChangeConfiguration(async () => { })
	}

	private setWebviewMessageListener(webview: vscode.Webview) {
		webview.onDidReceiveMessage(async (message: WebviewMessage) => {
			console.log("=== Received message from webview ===", message);

			switch (message.type) {
				case "webviewDidLaunch": {
					console.log("Webview did launch");
					this.onWebviewDidLaunch();
					break;
				}
				case "hideOnboardingLoading": {
					await vscode.commands.executeCommand("onboarding.hideLoadingOverlay")
					break;
				}
				case "completeOnboarding": {
					await vscode.commands.executeCommand("onboarding.unlockOverlay")
					await vscode.commands.executeCommand("onboarding.hideOverlay")
					await vscode.commands.executeCommand("workbench.action.markOnboardingCompleted")
					break;
				}
				case "importUserSettingsFromVSCode": {
					let result
					try {
						result = await importUserSettingsFromVSCode()
					} catch (error) {
						result = { ok: false, error: error }
						vscode.window.showErrorMessage(`Failed to import settings: ${error}`)
					}
					this.postMessageToWebview({
						type: "importUserSettingsFromVSCodeDone",
						importUserSettingsFromVSCodeResult: result
					})
					break;
				}
				case "importUserSettingsFromCursor": {
					let result
					try {
						result = await importUserSettingsFromCursor()
					} catch (error) {
						result = { ok: false, error: error }
						vscode.window.showErrorMessage(`Failed to import settings: ${error}`)
					}
					this.postMessageToWebview({
						type: "importUserSettingsFromVSCodeDone",
						importUserSettingsFromCursorResult: result
					})
					break
				}
				case "hideUsermenu": {
					await vscode.commands.executeCommand("orangepicode-core.hideUsermenu")
					break
				}
				case "openSettings": {
					await vscode.commands.executeCommand("orangepiaicode.openSettings")
					break
				}

				case "login": {
					try {
						// 使用 VS Code 认证 API
						const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone: true });
						if (session) {
							// vscode.window.showInformationMessage("GitHub 登录成功");
							console.log("GitHub 登录成功 ", session);
							// 可以将会话信息发送回 webview
							this.postMessageToWebview({
								type: "loginSuccess",
								githubSession: {
									id: session.id,
									scopes: session.scopes,
									account: {
										label: session.account.label,
										id: session.account.id
									}
								}
							});
						}
					} catch (error) {
						console.error("GitHub 登录失败:", error);
						// vscode.window.showErrorMessage(`GitHub 登录失败: ${error}`);
					}
					break;
				}
				case "logout": {
					try {
						// 尝试清除 GitHub 认证信息
						const authConfig = vscode.workspace.getConfiguration('github');
						authConfig.update('authenticationProvider', undefined, true)
							.then(() => {
								console.log("已清除 GitHub 认证信息");
								// vscode.window.showInformationMessage("已清除 GitHub 认证信息，请重启 VS Code 以完成注销");

								// 通知 webview 注销成功
								this.postMessageToWebview({
									type: "logoutSuccess"
								});
							}, (error) => {

								console.error("清除认证信息失败:", error);
								vscode.window.showErrorMessage(`注销失败: ${error.message}`);
							}
							)

					} catch (error) {
						console.error("注销失败:", error);
						vscode.window.showErrorMessage(`注销失败: ${error}`);
					}
					break;
				}
				case "setTheme": {
					console.log("Setting theme to:", message["theme"]);
					var themeName = "";
					if (message.theme === "darkTheme") {
						themeName = "OrangePi Dark";
					}
					if (message.theme === "lightTheme") {
						themeName = "OrangePi Light";
					}
					if (message.theme === "orangeTheme") {
						themeName = "OrangePi Orange";
					}
					if (themeName === "") {
						// vscode.window.showErrorMessage(`无效主题`);
						return;
					}

					// 使用配置方式更改主题
					vscode.workspace.getConfiguration().update('workbench.colorTheme', themeName, true)
						.then(
							() => {
								// vscode.window.showInformationMessage(`已切换到主题: ${themeName}`);
							},
							(error) => {
								console.error("切换主题失败:", error);
								// vscode.window.showErrorMessage(`切换主题失败: ${error.message}`);

								// 如果直接设置失败，尝试打开主题选择器
								// vscode.commands.executeCommand('workbench.action.selectTheme');
							}
						);

					break
				}
				case "setLanguage": {
					console.log("Setting language to:", message["language"]);

					// 通过安装语言包扩展来切换语言
					if (message["language"] === "en" || message["language"] === "zh-CN") {
						console.log("当前执行", message["language"]);

						// 根据语言选择对应的语言包扩展ID
						const languageExtensionId = message["language"] === "en"
							? "ms-ceintl.vscode-language-pack-en"
							: "MS-CEINTL.vscode-language-pack-zh-hans";

						// 显示正在切换语言的消息
						vscode.window.showInformationMessage(`正在切换到${message["language"] === "en" ? "英文" : "中文"}界面...`);

						// 使用命令安装语言包扩展
						vscode.commands.executeCommand('workbench.extensions.installExtension', languageExtensionId)
							.then(
								() => {
									// 安装成功后，直接修改配置文件
									return vscode.workspace.getConfiguration().update('locale', message["language"], vscode.ConfigurationTarget.Global);
								}
							)
							.then(
								() => {
									const msg = message["language"] === "en"
										? '已切换到英文界面，请重启 VS Code 以应用更改'
										: '已切换到中文界面，请重启 VS Code 以应用更改';
									vscode.window.showInformationMessage(msg);

									// 提示用户重启 VS Code
									vscode.window.showInformationMessage('需要重启 VS Code 以应用语言更改', '重启').then(selection => {
										if (selection === '重启') {
											vscode.commands.executeCommand('workbench.action.reloadWindow');
										}
									});
								},
								(error) => {
									console.error("Failed to set language:", error);
									vscode.window.showErrorMessage(`切换语言失败: ${error.message}`);

									// 如果失败，尝试打开语言设置界面
									vscode.commands.executeCommand('workbench.action.configureLocale')
										.then(() => {
											vscode.window.showInformationMessage(`请在设置中手动将语言设置为: ${message["language"]}`);
										});
								}
							);
					} else {
						console.warn("不支持的语言:", message["language"]);
						vscode.window.showWarningMessage(`不支持的语言: ${message["language"]}`);
					}
					break;
				}


				case "getGitHubLoginInfo": {
					try {
						// 使用 VS Code 认证 API 获取 GitHub 会话信息
						vscode.authentication.getSession('github', ['repo'], { createIfNone: false })
							.then(session => {
								if (session) {
									console.log("获取到 GitHub 登录信息");
									// 将登录信息发送回 webview
									this.postMessageToWebview({
										type: "gitHubLoginInfo",
										githubSession: {
											id: session.id,
											scopes: session.scopes,
											account: {
												label: session.account.label,
												id: session.account.id
											}
										}
									});
								} else {
									console.log("未获取到 GitHub 登录信息，用户可能未登录");
									this.postMessageToWebview({
										type: "gitHubLoginInfo",
										githubSession: null
									});
								}
							}, error => {
								console.error("获取 GitHub 登录信息失败:", error);
								vscode.window.showErrorMessage(`获取 GitHub 登录信息失败: ${error.message}`);
							})

					} catch (error) {
						console.error("获取 GitHub 登录信息失败:", error);
						vscode.window.showErrorMessage(`获取 GitHub 登录信息失败: ${error}`);
					}
					break;
				}

			}
		})
	}

	private async getHtmlCommonHead(webview: vscode.Webview, nonce: string): Promise<string> {
		const vscExtensionUrl: string = getUri(webview, this.context.extensionUri, ["webview-ui"])
			.toString();
		const isOnboardingCompleted = await vscode.commands.executeCommand("workbench.action.isOnboardingCompleted")
		const codiconsUri = getUri(webview, this.context.extensionUri, [
			"node_modules",
			"@vscode",
			"codicons",
			"dist",
			"codicon.css",
		])

		const stylesUri = getUri(webview, this.context.extensionUri, [
			"webview-ui",
			"build",
			"assets",
			"index.css",
		])
		const currentTheme = await getTheme(this.context);

		const language = vscode.env.language;

		return /* html */`
			<link href="${codiconsUri}" rel="stylesheet" />
			<link rel="stylesheet" type="text/css" href="${stylesUri}">
			<script nonce="${nonce}">localStorage.setItem("ide", '"vscode"')</script>
			<script nonce="${nonce}">window.vscExtensionUrl = "${vscExtensionUrl}"</script>
			<script nonce="${nonce}">window.isOnboardingCompleted = ${isOnboardingCompleted}</script>
			<script nonce="${nonce}">window.fullColorTheme = ${JSON.stringify(currentTheme)}</script>
			<script nonce="${nonce}">window.language = "${language}"</script>
			<script nonce="${nonce}">window.viewId = "${this.viewId}"</script>
		`
	}

	private async getHtmlContent(webview: vscode.Webview): Promise<string> {
		// Get the local path to main script run in the webview,
		// then convert it to a uri we can use in the webview.

		// The CSS file from the React build output

		// The JS file from the React build output
		const scriptUri = getUri(webview, this.context.extensionUri, ["webview-ui", "build", "assets", "index.js"])

		// The codicon font from the React build output
		// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-codicons-sample/src/extension.ts
		// we installed this package in the extension so that we can access it how its intended from the extension (the font file is likely bundled in vscode), and we just import the css fileinto our react app we don't have access to it
		// don't forget to add font-src ${webview.cspSource};

		// const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "main.js"))

		// const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "reset.css"))
		// const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "vscode.css"))

		// // Same for stylesheet
		// const stylesheetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "main.css"))

		// Use a nonce to only allow a specific script to be run.
		/*
		content security policy of your webview to only allow scripts that have a specific nonce
		create a content security policy meta tag so that only loading scripts with a nonce is allowed
		As your extension grows you will likely want to add custom styles, fonts, and/or images to your webview. If you do, you will need to update the content security policy meta tag to explicity allow for these resources. E.g.
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
		- 'unsafe-inline' is required for styles due to vscode-webview-toolkit's dynamic style injection
		- since we pass base64 images to the webview, we need to specify img-src ${webview.cspSource} data:;

		in meta tag we add nonce attribute: A cryptographic nonce (only used once) to allow scripts. The server must generate a unique nonce value each time it transmits a policy. It is critical to provide a nonce that cannot be guessed as bypassing a resource's policy is otherwise trivial.
		*/
		const nonce = getNonce()

		// Tip: Install the es6-string-html VS Code extension to enable code highlighting below
		return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
            <meta name="theme-color" content="#000000">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https://avatars.githubusercontent.com data:; script-src 'nonce-${nonce}' https://us-assets.i.posthog.com; connect-src https://openrouter.ai https://us.i.posthog.com https://us-assets.i.posthog.com;">
						${await this.getHtmlCommonHead(webview, nonce)}
            <title>OrangePi Code Core</title>
          </head>
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
          </body>
        </html>
      `
	}

	private async getHMRHtmlContent(webview: vscode.Webview): Promise<string> {
		const localPort = "5173"
		const localServerUrl = `localhost:${localPort}`

		// Check if local dev server is running.
		try {
			await axios.get(`http://${localServerUrl}`)
		} catch (error) {
			vscode.window.showErrorMessage("HMR server is not running.")

			return this.getHtmlContent(webview)
		}

		const nonce = getNonce()

		const file = "src/main.tsx"
		const scriptUri = `http://${localServerUrl}/${file}`

		const reactRefresh = /*html*/ `
			<script nonce="${nonce}" type="module">
				import RefreshRuntime from "http://localhost:${localPort}/@react-refresh"
				RefreshRuntime.injectIntoGlobalHook(window)
				window.$RefreshReg$ = () => {}
				window.$RefreshSig$ = () => (type) => type
				window.__vite_plugin_react_preamble_installed__ = true
			</script>
		`

		const csp = [
			"default-src 'none'",
			`font-src ${webview.cspSource}`,
			`style-src ${webview.cspSource} 'unsafe-inline' https://* http://${localServerUrl} http://0.0.0.0:${localPort}`,
			`img-src ${webview.cspSource} https://avatars.githubusercontent.com data:`,
			`script-src 'unsafe-eval' https://* https://*.posthog.com http://${localServerUrl} http://0.0.0.0:${localPort} 'nonce-${nonce}'`,
			`connect-src https://* https://*.posthog.com ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`,
		]

		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
					<meta http-equiv="Content-Security-Policy" content="${csp.join("; ")}">
					${await this.getHtmlCommonHead(webview, nonce)}
					<title>OrangePi Code Core</title>
				</head>
				<body>
					<div id="root"></div>
					${reactRefresh}
					<script type="module" src="${scriptUri}"></script>
				</body>
			</html>
		`;
	}

	async dispose() {
		if (this.view && "dispose" in this.view) {
			this.view.dispose()
		}

		while (this.disposables.length) {
			const x = this.disposables.pop()

			if (x) {
				x.dispose()
			}
		}
	}
}

export default CoreProvider;
