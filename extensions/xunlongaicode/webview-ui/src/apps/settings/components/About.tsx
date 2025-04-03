import { FC } from 'react';
import { useAppTranslation } from '../../../i18n/TranslationContext';

const About: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='text-[24px] font-medium mb-[16px]'>
			{t("about", { ns: "settingsApp" })}
		</div>
	</div>
}

export default About
