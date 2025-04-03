import { FC } from 'react';
import SettingsView from '../../../components/settings/SettingsView';
import { cn } from '../../../lib/utils';

const OrangePiAI: FC = () => {
	return <div>
		<div className='px-[20px] text-[24px] font-medium mb-[16px]'>OrangePi AI</div>
		<SettingsView className={cn("relative")} />
	</div>
}

export default OrangePiAI;
