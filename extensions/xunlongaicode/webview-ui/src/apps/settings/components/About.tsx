import { FC } from 'react';
import { useAppTranslation } from '../../../i18n/TranslationContext';

const About: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='text-[24px] font-medium mb-[24px]'>
			{t("aboutOrangePiAICode", { ns: "settingsApp" })}
		</div>

		<div className='flex flex-col gap-2.5'>
			<a href="https://github.com/XunlongCode/orangepicode" target='_blank' className='text-primary text-[14px] font-medium'>
				{t("userAgreement", { ns: "settingsApp" })}
			</a>
			<a href="https://github.com/XunlongCode/orangepicode" target='_blank' className='text-primary text-[14px] font-medium'>
				{t("privacyPolicy", { ns: "settingsApp" })}
			</a>
			<a href="https://github.com/XunlongCode/orangepicode/blob/main/LICENSE.txt" target='_blank' className='text-primary text-[14px] font-medium'>
				{t("opensourceSoftwareStatement", { ns: "settingsApp" })}
			</a>
		</div>
	</div>
}

export default About
