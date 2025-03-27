
export type IProtocol = Record<string, [any, any]>;

export interface FromMessage<
	FromProtocol extends IProtocol,
	T extends keyof FromProtocol,
> {
	messageType: T;
	messageId: string;
	data: FromProtocol[T][1];
}


export interface Message<T = any> {
	messageType: string;
	messageId: string;
	data: T;
}

