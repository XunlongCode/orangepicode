import { useEffect } from "react";
import { ExtensionMessage } from '../../../src/shared/ExtensionMessage';

// 监听core发送的消息
export function useWebviewListener(
	type: ExtensionMessage["type"],
	handler?: (data: ExtensionMessage) => Promise<any>,
	dependencies?: any[],
	skip?: boolean,
) {
	useEffect(
		() => {
			let listener: any;

			if (!skip) {
				listener = async (event: { data: ExtensionMessage }) => {
					if (event.data.type === type && handler) {
						await handler(event.data);
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
