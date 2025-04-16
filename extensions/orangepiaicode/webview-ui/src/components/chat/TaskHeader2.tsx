import { FC, useEffect, useState } from 'react';
import { ClineMessage } from '../../../../src/exports/roo-code';
import { cn } from '../../lib/utils';
import { getVscExtensionPath } from '../../utils';
import { highlightMentions } from './TaskHeader';
import Thumbnails from '../common/Thumbnails';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { vscode } from '../../utils/vscode';
import { useExtensionState } from '../../context/ExtensionStateContext';
import { DeleteTaskDialog } from '../history/DeleteTaskDialog';
import { useWebviewListener } from '../../hooks/useWebviewListener';
import { ExtensionMessage } from '../../../../src/shared/ExtensionMessage';


export interface ChatRow2Props {
	task: ClineMessage
	align?: "left" | "right"
}

const TaskHeader2: FC<ChatRow2Props> = ({
	task,
	align = "right"
}) => {
	const { currentTaskItem } = useExtensionState()
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
	const [githubSession, setGitHubSession] = useState<ExtensionMessage["githubSession"]>()

	useWebviewListener("getGitHubSessionSuccess", async (e) => {
		setGitHubSession(e.githubSession)
	})

	useEffect(() => {
		vscode.postMessage({ type: "getGitHubSession" })
	}, [])

	return <div
		className={cn(
			"flex flex-col gap-[12px] text-vscode-foreground",
			{
				"items-end": align === "right",
			}
		)}
	>
		<div
			className={cn(
				"flex flex-row items-center gap-[12px]",
				{
					"justify-end": align === "right",
				}
			)}
		>
			<div className='font-medium text-[16px]'>
				{githubSession?.account.label || "User"}
			</div>
			<div className='h-[36px] w-[36px] rounded-full overflow-hidden'>
				{
					githubSession ? <img className='h-full w-full' src={`https://avatars.githubusercontent.com/u/${githubSession.account.id}`} alt="" />
						: <img className='h-full w-full' src={getVscExtensionPath("src/assets/default-avatar.png")} alt="" />
				}
			</div>
		</div>

		<div className='flex items-start gap-[12px] group'>
			<div className='flex flex-col justify-center min-h-[37px]'>
				<VSCodeButton
					className='opacity-0 group-hover:opacity-100 transition-opacity'
					appearance="icon"
					style={{
						padding: "3px",
						flexShrink: 0,
					}}
					onClick={(e) => {
						e.stopPropagation()

						if (!currentTaskItem?.id) {
							return
						}

						if (e.shiftKey) {
							vscode.postMessage({ type: "deleteTaskWithId", text: currentTaskItem.id })
						} else {
							setDeleteTaskId(currentTaskItem.id)
						}
					}}>
					<span className="codicon codicon-trash"></span>
				</VSCodeButton>
			</div>
			{deleteTaskId && (
				<DeleteTaskDialog
					taskId={deleteTaskId}
					onOpenChange={(open) => !open && setDeleteTaskId(null)}
					open
				/>
			)}

			<div
				className={cn(
					"flex flex-col justify-center gap-[12px]",
					"text-vscode-editor-foreground",
					"bg-vscode-editorWidget-background",
					"p-[8px] rounded-[8px] min-h-[37px]",
					{
						"rounded-tr-none": align === "right",
					}
				)}
			>
				<div>
					{highlightMentions(task.text, false)}
				</div>
				{task.images && task.images.length > 0 && <Thumbnails images={task.images} />}
			</div>
		</div>
	</div>
}

export default TaskHeader2;
