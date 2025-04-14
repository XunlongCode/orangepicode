import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & {
	hasRing?: boolean
}>(
	({ className, type, children, hasRing, ...props }, ref) => {
		hasRing = hasRing ?? true

		return (
			<div>
				{children}
				<input
					type={type}
					className={cn(
						"flex w-full text-vscode-editorWidget-foreground bg-vscode-editorWidget-background rounded-[4px] px-3 py-[6px] text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-0 focus-visible:outline-none focus-visible:border-vscode-focusBorder disabled:cursor-not-allowed disabled:opacity-50",
						hasRing &&
						"ring-1 ring-inset ring-vscode-button-secondaryRing",
						className,
					)}
					ref={ref}
					{...props}
				/>
			</div>
		)
	},
)
Input.displayName = "Input"

export { Input }
