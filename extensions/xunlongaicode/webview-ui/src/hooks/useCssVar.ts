import { useCallback } from 'react'

export type TGetter = () => string | undefined
export type TSetter = (value: string) => void

type UseCssVarProps = {
	name: `--${string}`
	root?: HTMLElement
}

const defaultRoot = typeof document !== 'undefined' ? document.body : undefined

export const useCssVar = ({
	name,
	root = defaultRoot!,
}: UseCssVarProps): { get: TGetter, set: TSetter } => {
	const get: TGetter = useCallback(
		() => window?.getComputedStyle(root).getPropertyValue(name)?.trim(),
		[],
	)
	const set: TSetter = useCallback(
		(value: string) => root.style.setProperty(name, value),
		[],
	)

	return { get, set }
}
