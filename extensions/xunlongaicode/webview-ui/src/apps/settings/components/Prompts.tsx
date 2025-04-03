import { FC } from 'react';
import PromptsView from '../../../components/prompts/PromptsView';
import { cn } from '../../../lib/utils';
import { useAppTranslation } from '../../../i18n/TranslationContext';


const Prompts: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='px-[20px] text-[24px] font-medium mb-[16px]'>
			{t("prompts", { ns: "settingsApp" })}
		</div>
		<PromptsView className={cn("relative")} />
	</div>
}

export default Prompts;
