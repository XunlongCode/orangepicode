import { FC } from 'react';
import { Button } from '../../../components/ui';
import { useAppTranslation } from '../../../i18n/TranslationContext';

const General: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='text-[24px] font-medium mb-[16px]'>
			{t("general", { ns: "settingsApp" })}
		</div>

		<div className='font-medium text-[16px] mb-[12px]'>
			{t("account", { ns: "settingsApp" })}
		</div>

		<div className='text-[14px] mb-[12px] text-foreground/70'>
			{t("currentAccount", { ns: "settingsApp" })}：ZZZ
		</div>

		<div className='mb-[24px]'>
			<Button className='w-[140px] rounded'>
				{t("logout", { ns: "settingsApp" })}
			</Button>
		</div>

		<div className='font-medium text-[16px] mb-[12px]'>
			{t("theme", { ns: "settingsApp" })}
		</div>
	</div>
}

export default General;
