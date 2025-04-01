/// <reference types="vite/client" />
declare global {
	interface Window {
		language?: string
		isOnboardingCompleted?: boolean
		vscExtensionUrl: string
		viewId?: string
		fullColorTheme?: {
			rules?: {
				token?: string;
				foreground?: string;
			}[];
		};
	}
}

export default {}
