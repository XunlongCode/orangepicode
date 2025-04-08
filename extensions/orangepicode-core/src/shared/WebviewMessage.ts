

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
	| "githubLogin"
	| "getGitHubSession"  // 添加获取 GitHub 登录信息的消息类型
	| "logout"

	messageId?: string
	theme?: string
	themeType?: string
	language?: string
	setLanguageSkipDialog?: boolean
}
