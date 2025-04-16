import { memo, useMemo } from "react"
import { getLanguageFromPath } from "../../utils/getLanguageFromPath"
import CodeBlock, { CODE_BLOCK_BG_COLOR, CODE_BLOCK_FG_COLOR } from "./CodeBlock"
import { ToolProgressStatus } from "../../../../src/shared/ExtensionMessage"
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { useClipboard } from '../ui/hooks'
import { useCopyToClipboard } from '../../utils/clipboard'
import { vscode } from '../../utils/vscode'

interface CodeAccordianProps {
	code?: string
	diff?: string
	language?: string | undefined
	path?: string
	isFeedback?: boolean
	isConsoleLogs?: boolean
	isExpanded: boolean
	onToggleExpand: () => void
	isLoading?: boolean
	progressStatus?: ToolProgressStatus
}

/*
We need to remove leading non-alphanumeric characters from the path in order for our leading ellipses trick to work.
^: Anchors the match to the start of the string.
[^a-zA-Z0-9]+: Matches one or more characters that are not alphanumeric.
The replace method removes these matched characters, effectively trimming the string up to the first alphanumeric character.
*/
export const removeLeadingNonAlphanumeric = (path: string): string => path.replace(/^[^a-zA-Z0-9]+/, "")

const CodeAccordian = ({
	code,
	diff,
	language,
	path,
	isFeedback,
	isConsoleLogs,
	isExpanded,
	onToggleExpand,
	isLoading,
	progressStatus,
}: CodeAccordianProps) => {
	const inferredLanguage = useMemo(
		() => code && (language ?? (path ? getLanguageFromPath(path) : undefined)),
		[path, language, code],
	)

	const { copyWithFeedback } = useCopyToClipboard(200)

	return (
		<div
			style={{
				borderRadius: 8,
				backgroundColor: CODE_BLOCK_BG_COLOR,
				color: CODE_BLOCK_FG_COLOR,
				overflow: "hidden", // This ensures the inner scrollable area doesn't overflow the rounded corners
			}}
		>
			{(path || isFeedback || isConsoleLogs) && (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						padding: "9px 10px",
						cursor: isLoading ? "wait" : "unset",
						opacity: isLoading ? 0.7 : 1,
						// pointerEvents: isLoading ? "none" : "auto",
						userSelect: "none",
						WebkitUserSelect: "none",
						MozUserSelect: "none",
						msUserSelect: "none",
					}}
				// className='border-b border-[var(--vscode-statusBar-border)] border-x-[8px] border-x-transparent'
				>
					{isFeedback || isConsoleLogs ? (
						<div style={{ display: "flex", alignItems: "center" }}>
							<span
								className={`codicon codicon-${isFeedback ? "feedback" : "output"}`}
								style={{ marginRight: "6px" }}></span>
							<span
								style={{
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
									marginRight: "8px",
								}}>
								{isFeedback ? "User Edits" : "Console Logs"}
							</span>
						</div>
					) : (
						<>
							{path?.startsWith(".") && <span>.</span>}
							<span
								style={{
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
									marginRight: "8px",
									// trick to get ellipsis at beginning of string
									direction: "rtl",
									textAlign: "left",
								}}>
								{removeLeadingNonAlphanumeric(path ?? "") + "\u200E"}
							</span>
						</>
					)}
					<div style={{ flexGrow: 1 }}></div>
					{progressStatus && progressStatus.text && (
						<>
							{progressStatus.icon && <span className={`codicon codicon-${progressStatus.icon} mr-1`} />}
							<span className="mr-1 ml-auto text-vscode-descriptionForeground">
								{progressStatus.text}
							</span>
						</>
					)}
					<div className='flex items-center gap-[12px]'>
						<VSCodeButton
							appearance="icon"
							disabled={isLoading}
							onClick={() => {
								copyWithFeedback(code ?? diff ?? "")
							}}
						>
							<span className={`codicon codicon-copy`}></span>
						</VSCodeButton>
						<VSCodeButton
							appearance="icon"
							disabled={isLoading}
							onClick={() => {
								vscode.postMessage({
									type: "insertText",
									text: code ?? diff ?? "",
								})
							}}
						>
							<span className={`codicon codicon-insert`}></span>
						</VSCodeButton>
						<VSCodeButton
							appearance="icon"
							disabled={isLoading}
							onClick={() => {
								vscode.postMessage({
									type: "insertTextToNewFile",
									text: code ?? diff ?? "",
								})
							}}
						>
							<span className={`codicon codicon-new-file`}></span>
						</VSCodeButton>
						<VSCodeButton
							appearance="icon"
							disabled={isLoading}
							onClick={isLoading ? undefined : onToggleExpand}
						>
							<span className={`codicon codicon-chevron-${isExpanded ? "up" : "down"}`}></span>
						</VSCodeButton>
					</div>
				</div>
			)}
			{
				isExpanded && <div
					className='h-px w-full px-[8px]'
				>
					<div className='h-full w-full bg-[var(--vscode-statusBar-border)]'></div>
				</div>
			}
			{(!(path || isFeedback || isConsoleLogs) || isExpanded) && (
				<div
					//className="code-block-scrollable" this doesn't seem to be necessary anymore, on silicon macs it shows the native mac scrollbar instead of the vscode styled one
					style={{
						overflowX: "auto",
						overflowY: "hidden",
						maxWidth: "100%",
					}}>
					<CodeBlock
						source={`${"```"}${diff !== undefined ? "diff" : inferredLanguage}\n${(
							code ??
							diff ??
							""
						).trim()}\n${"```"}`}
					/>
				</div>
			)}
		</div>
	)
}

// memo does shallow comparison of props, so if you need it to re-render when a nested object changes, you need to pass a custom comparison function
export default memo(CodeAccordian)
