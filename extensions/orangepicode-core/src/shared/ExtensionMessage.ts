
export interface ExtensionMessage {
	type:
	| "setTheme"
	| "setThemeType"
	| "onShowUsermenu"
	| "importUserSettingsFromVSCodeDone"
	| "gitHubLoginInfo"  // 添加 GitHub 登录信息消息类型
	| "importUserSettingsFromCursorDone"
	| "changeLanguage"
	| "loginSuccess"
	| "logoutSuccess"
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

