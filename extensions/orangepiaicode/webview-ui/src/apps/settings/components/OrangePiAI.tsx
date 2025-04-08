import { FC } from 'react';
import { cn } from '../../../lib/utils';
import { useAppTranslation } from '../../../i18n/TranslationContext';
import SettingsView2 from '../../../components/settings/SettingsView2';

const OrangePiAI: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='text-[24px] font-medium mb-[16px] text-vscode-foreground'>
			{t("orangePiAI", { ns: "settingsApp" })}
		</div>
		<SettingsView2 className={cn("relative")} />
	</div>
}

export default OrangePiAI;
