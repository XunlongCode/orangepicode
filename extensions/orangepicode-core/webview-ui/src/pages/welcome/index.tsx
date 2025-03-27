import { FC, useEffect, useState } from "react";
import VscodeTheme from "../../components/VscodeTheme";
import { vscode } from '../../utils/vscode';
import SplashScreen from './components/SplashScreen';
import ThemeAndLanguage from './components/ThemeAndLanguage';
import ImportSettings from './components/ImportSettings';
import AccountLogin from './components/AccountLogin';

const Welcome: FC = () => {
	const [currentStep, setCurrentStep] = useState(0)

	useEffect(() => {
		vscode.postMessage({ type: "hideOnboardingLoading" })

		return () => {
			vscode.postMessage({ type: "unlockOnboardingOverlay" })
		};
	}, []);

	const onCompletion = () => {
		vscode.postMessage({ type: 'completeOnboarding' })
	}

	const onNext = () => {
		if (currentStep === 3) {
			onCompletion()
			return
		}

		setCurrentStep(currentStep + 1)
	}

	return (
		<VscodeTheme className="flex flex-col h-full w-full select-none items-center justify-center bg-background text-foreground p-5">
			{currentStep === 0 && <SplashScreen onNext={onNext} />}
			{currentStep === 1 && <ThemeAndLanguage onNext={onNext} />}
			{currentStep === 2 && <ImportSettings onNext={onNext} />}
			{currentStep === 3 && <AccountLogin onNext={onNext} />}
		</VscodeTheme>
	);
};

export default Welcome;
