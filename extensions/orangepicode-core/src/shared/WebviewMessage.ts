

export interface WebviewMessage {
	type:
	| "hideOnboardingLoading"
	| "unlockOnboardingOverlay"
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
