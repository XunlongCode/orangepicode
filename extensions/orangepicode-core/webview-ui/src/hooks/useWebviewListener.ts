import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@root/core/utils/messenger';
import { ToWebviewProtocol } from '../../../src/core/protocol';

export function useWebviewListener<T extends keyof ToWebviewProtocol>(
	messageType: T,
	handler: (data: ToWebviewProtocol[T][0]) => Promise<ToWebviewProtocol[T][1]>,
	dependencies?: any[],
	skip?: boolean,
) {

	const postToIde = (messageType: string, data: any, messageId?: string) => {
		const msg: Message = {
			messageId: messageId ?? uuidv4(),
			messageType,
			data,
		};
		vscode.postMessage(msg);
	}

	useEffect(
		() => {
			let listener: any;

			if (!skip) {
				listener = async (event: { data: Message }) => {
					if (event.data.messageType === messageType) {
						const result = await handler(event.data.data);
						postToIde(messageType, result, event.data.messageId);
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
}
