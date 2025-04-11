import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, children, ...props }, ref) => {
		return (
			<div>
				{children}
				<input
					type={type}
					className={cn(
						"flex w-full text-vscode-editorWidget-foreground bg-vscode-editorWidget-background rounded-[4px] px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-0 focus-visible:outline-none focus-visible:border-vscode-focusBorder disabled:cursor-not-allowed disabled:opacity-50",
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
