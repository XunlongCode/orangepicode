/// <reference types="vite/client" />
declare global {
	interface Window {
		isOnboardingCompleted?: boolean
		vscAssetsUrl: string
	}
}

export default {}
