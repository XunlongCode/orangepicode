import { FC } from 'react';
import PromptsView from '../../../components/prompts/PromptsView';
import { cn } from '../../../lib/utils';


const Prompts: FC = () => {
	return <PromptsView className={cn("relative")} />
}

export default Prompts;
