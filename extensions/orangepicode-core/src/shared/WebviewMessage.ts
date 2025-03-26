

export interface WebviewMessage {
	type:
	| "webviewDidLaunch"
	| "hideOnboardingLoading"
	| "unlockOnboardingOverlay"
	| "completeOnboarding"
	| "setTheme"
	| "setThemeType"
	messageId?: string
	theme?: {
		rules?: {
			token?: string;
			foreground?: string;
		}[]
	}
	themeType?: string
}
