/// <reference types="vite/client" />
declare global {
	interface Window {
		isOnboardingCompleted?: boolean
		vscExtensionUrl: string
		fullColorTheme?: {
			rules?: {
				token?: string;
				foreground?: string;
			}[];
		};
	}
}

export default {}
