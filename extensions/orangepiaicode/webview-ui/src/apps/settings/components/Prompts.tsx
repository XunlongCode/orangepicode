import { FC } from 'react';
import { cn } from '../../../lib/utils';
import { useAppTranslation } from '../../../i18n/TranslationContext';
import PromptsView2 from '../../../components/prompts/PromptsView2';


const Prompts: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='text-[24px] font-medium mb-[16px] text-vscode-foreground'>
			{t("prompts", { ns: "settingsApp" })}
		</div>
		<PromptsView2 className={cn("relative")} />
	</div>
}

export default Prompts;
