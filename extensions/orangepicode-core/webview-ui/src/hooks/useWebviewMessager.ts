import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { WebviewMessage } from '../../../src/shared/WebviewMessage';
import { vscode } from '../utils/vscode';

export function useWebviewMessager(
	type: WebviewMessage["type"],
	handler?: (data: WebviewMessage) => Promise<any>,
	dependencies?: any[],
	skip?: boolean,
) {

	const post = (data?: WebviewMessage, messageId?: string) => {
		const msg: WebviewMessage = {
			messageId: messageId ?? uuidv4(),
			type,
			...data,
		};
		vscode.postMessage(msg);
	}

	useEffect(
		() => {
			let listener: any;

			if (!skip) {
				listener = async (event: { data: WebviewMessage }) => {
					if (event.data.type === type && handler) {
						const result = await handler(event.data);
						post(result, event.data.messageId);
					}
				};

				window.addEventListener("message", listener);
			}

			return () => {
				if (listener) {
					window.removeEventListener("message", listener);
				}
			};
		},
		dependencies ? [...dependencies, skip] : [skip],
	);

	return {
		post
	}
}
