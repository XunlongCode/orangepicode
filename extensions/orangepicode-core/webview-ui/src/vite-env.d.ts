/// <reference types="vite/client" />

interface vscode {
	postMessage(message: any): vscode;
}

declare const vscode: any;
