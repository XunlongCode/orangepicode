import { FC } from 'react';
import { ClineMessage } from '../../../../src/exports/roo-code';
import { cn } from '../../lib/utils';
import { getVscExtensionPath } from '../../utils';
import { highlightMentions } from './TaskHeader';
import Thumbnails from '../common/Thumbnails';


export interface ChatRow2Props {
	task: ClineMessage
	align?: "left" | "right"
}

const TaskHeader2: FC<ChatRow2Props> = ({
	task,
	align = "right"
}) => {

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
			<div className='font-medium text-[16px]'>我</div>
			<div className='h-[36px] w-[36px] rounded-full overflow-hidden'>
				<img className='h-full w-full object-cover' src={getVscExtensionPath("src/assets/default-avatar.png")} alt="" />
			</div>
		</div>

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
}

export default TaskHeader2;
