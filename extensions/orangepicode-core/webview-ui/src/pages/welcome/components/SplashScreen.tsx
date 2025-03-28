import { Button } from "@/components/ui/button";
import { getVscExtensionPath } from "../../../utils";
import { FC } from 'react';
import { useAppTranslation } from '../../../i18n/TranslationContext';

const SplashScreen: FC<{ onNext: () => void }> = ({ onNext }) => {
	const { t } = useAppTranslation();

	return (
		<div className="h-full flex-col justify-center items-center inline-flex overflow-hidden select-none">
			<div className="max-w-2xl mx-auto text-center flex flex-col justify-center">
				<div className="flex-col justify-center items-center gap-7 flex w-[164px] mx-auto ">
					<img src={getVscExtensionPath("src/assets/welcome/logo.png")} alt="" />
				</div>
				<div className="flex flex-col mt-10">
					<div className="text-[40px] text-[#979CA6] leading-none font-medium">
						{t("welcome:welcome")}
					</div>
					<div className="text-[32px] mt-10 leading-none">
						OrangePi AI Code
					</div>
				</div>

				<div>
					<Button
						size="sm"
						className="mt-14 w-[112px]"
						onClick={onNext}
					>
						<div className='text-base font-medium'>下一步</div>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SplashScreen;
