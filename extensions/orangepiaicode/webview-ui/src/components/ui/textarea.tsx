import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea"> & {
	hasRing?: boolean
}>(
	({ className, hasRing, ...props }, ref) => {
		hasRing = hasRing ?? true

		return (
			<textarea
				className={cn(
					"flex min-h-[60px] w-full rounded-[4px] px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-0 focus-visible:outline-none focus-visible:border-vscode-focusBorder disabled:cursor-not-allowed disabled:opacity-50",
					"focus-visible:border-vscode-focusBorder",
					"bg-vscode-editorWidget-background",
					"text-vscode-editorWidget-foreground",
					hasRing &&
						"ring-1 ring-inset ring-vscode-button-secondaryRing",
					className,
				)}
				ref={ref}
				{...props}
			/>
		)
	},
)
Textarea.displayName = "Textarea"

export { Textarea }
