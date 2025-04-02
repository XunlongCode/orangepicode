

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
	messageId?: string
	theme?: string
	themeType?: string
	language?: string
}
