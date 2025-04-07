
export interface ExtensionMessage {
	type:
	| "setTheme"
	| "setThemeType"
	| "onShowUsermenu"
	| "importUserSettingsFromVSCodeDone"
	| "getGitHubSessionSuccess"  // 添加 GitHub 登录信息消息类型
	| "importUserSettingsFromCursorDone"
	| "changeLanguage"
	| "githubLoginSuccess"
	| "githubLogoutSuccess"
	theme?: any
	themeType?: string
	importUserSettingsFromVSCodeResult?: { ok: boolean, error?: any }
	importUserSettingsFromCursorResult?: { ok: boolean, error?: any }
	githubSession?: {
		id: any,
		scopes: any,
		account: {
			label: any,
			id: any
		}
	} | null
	messageId?: string

}

