

export interface WebviewMessage {
	type:
	| "webviewDidLaunch"
	| "hideOnboardingLoading"
	| "unlockOnboardingOverlay"
	| "completeOnboarding"
	| "setTheme"
	| "setThemeType"
	| "importUserSettingsFromVSCode"
	| "importUserSettingsFromCursor"
	| "setLanguage"
	| "hideUsermenu"
	| "openSettings"
	| "login"
	| "logout"
	| "getGitHubLoginInfo"  // 添加获取 GitHub 登录信息的消息类型

	messageId?: string
	theme?: string
	themeType?: string
	language?: string
}
