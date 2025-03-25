/// <reference types="vite/client" />
declare global {
	interface Window {
		isOnboardingCompleted?: boolean
		vscAssetsUrl: string
		fullColorTheme?: {
			rules?: {
				token?: string;
				foreground?: string;
			}[];
		};
	}
}

export default {}
