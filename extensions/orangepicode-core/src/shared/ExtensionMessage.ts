
export interface ExtensionMessage {
	type:
	| "setTheme"
	| "setThemeType"
	theme?: any
	themeType?: string
	messageId?: string
}

