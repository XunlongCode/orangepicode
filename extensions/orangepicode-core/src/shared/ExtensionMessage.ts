
export interface ExtensionMessage {
	type:
	| "setTheme"
	| "setThemeType"
	| "importUserSettingsFromVSCodeDone"
	| "importUserSettingsFromCursorDone"
	| "changeLanguage"
	theme?: any
	themeType?: string
	importUserSettingsFromVSCodeResult?: { ok: boolean, error?: any }
	importUserSettingsFromCursorResult?: { ok: boolean, error?: any }
	messageId?: string
}

