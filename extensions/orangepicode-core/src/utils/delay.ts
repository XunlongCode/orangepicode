const randomInteger = (minimum: number, maximum: number): number =>
	Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);

const createAbortError = (): Error & { name: 'AbortError' } => {
	const error = new Error('Delay aborted') as Error & { name: 'AbortError' };
	error.name = 'AbortError';
	return error;
};

const clearMethods = new WeakMap<Promise<unknown>, () => void>();

type DelayOptions<T = unknown> = {
	value?: T;
	signal?: AbortSignal;
};

type DelayFunction = <T>(milliseconds: number, options?: DelayOptions<T>) => Promise<T>;

type CreateDelayOptions = {
	clearTimeout?: typeof globalThis.clearTimeout;
	setTimeout?: typeof globalThis.setTimeout;
};

export function createDelay({ clearTimeout: defaultClear, setTimeout: defaultSet }: CreateDelayOptions = {}): DelayFunction {
	return <T>(milliseconds: number, { value, signal }: DelayOptions<T> = {}): Promise<T> => {
		if (signal?.aborted) {
			return Promise.reject(createAbortError());
		}

		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let settle: () => void;
		let rejectFunction: (reason?: any) => void;
		const clear = defaultClear ?? clearTimeout;

		const signalListener = () => {
			if (timeoutId !== null) {
				clear(timeoutId);
				timeoutId = null;
			}
			rejectFunction(createAbortError());
		};

		const cleanup = () => {
			if (signal) {
				signal.removeEventListener('abort', signalListener);
			}
		};

		const delayPromise = new Promise<T>((resolve, reject) => {
			settle = () => {
				cleanup();
				resolve(value as T);
			};

			rejectFunction = reject;
			timeoutId = (defaultSet ?? setTimeout)(settle, milliseconds);
		});

		if (signal) {
			signal.addEventListener('abort', signalListener, { once: true });
		}

		clearMethods.set(delayPromise, () => {
			if (timeoutId !== null) {
				clear(timeoutId);
				timeoutId = null;
			}
			settle();
		});

		return delayPromise;
	};
}

const delay = createDelay();
export default delay;

export async function rangeDelay<T>(minimum: number, maximum: number, options?: DelayOptions<T>): Promise<T> {
	return delay(randomInteger(minimum, maximum), options);
}

export function clearDelay(promise: Promise<unknown>): void {
	clearMethods.get(promise)?.();
}
