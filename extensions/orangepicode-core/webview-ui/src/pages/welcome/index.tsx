import { FC, useEffect, useState } from "react";
import VscodeTheme from "../../components/VscodeTheme";
import { vscode } from '../../utils/vscode';
import SplashScreen from './components/SplashScreen';
import ThemeAndLanguage from './components/ThemeAndLanguage';

const Welcome: FC = () => {
	const [currentStep, setCurrentStep] = useState(0)

	useEffect(() => {
		vscode.postMessage({ type: "hideOnboardingLoading" })

		return () => {
			vscode.postMessage({ type: "unlockOnboardingOverlay" })
		};
	}, []);

	const onNext = () => {
		setCurrentStep(currentStep + 1)
	}

	return (
		<VscodeTheme className="flex flex-col h-full w-full select-none items-center justify-center bg-background text-foreground p-5">
			{currentStep === 0 && <SplashScreen onNext={onNext} />}
			{currentStep === 1 && <ThemeAndLanguage onNext={onNext} />}
		</VscodeTheme>
	);
};

export default Welcome;
