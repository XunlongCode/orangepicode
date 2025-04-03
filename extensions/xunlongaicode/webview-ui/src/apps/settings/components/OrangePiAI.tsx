import { FC } from 'react';
import SettingsView from '../../../components/settings/SettingsView';
import { cn } from '../../../lib/utils';
import { useAppTranslation } from '../../../i18n/TranslationContext';

const OrangePiAI: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='px-[20px] text-[24px] font-medium mb-[16px]'>
			{t("orangePiAI", { ns: "settingsApp" })}
		</div>
		<SettingsView className={cn("relative")} />
	</div>
}

export default OrangePiAI;
