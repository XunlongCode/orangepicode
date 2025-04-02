import { FC } from 'react';
import PromptsView from '../../../components/prompts/PromptsView';
import { cn } from '../../../lib/utils';


const Prompts: FC = () => {
	return <div>
		<div className='px-[20px] text-[24px] font-medium mb-[16px]'>提示词</div>
		<PromptsView className={cn("relative")} />
	</div>
}

export default Prompts;
