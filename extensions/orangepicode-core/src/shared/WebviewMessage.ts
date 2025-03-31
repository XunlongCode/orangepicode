

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
	messageId?: string
	theme?: string
	themeType?: string
	language?: string
}
