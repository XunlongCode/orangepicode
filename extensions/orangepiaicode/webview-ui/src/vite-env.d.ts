/// <reference types="vite/client" />
declare global {
	interface Window {
		language?: string
		vscExtensionUrl: string
		chatMode?: "chat" | "code"
	}
}

export default {}
