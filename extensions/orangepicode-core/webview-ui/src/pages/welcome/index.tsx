import { FC, useEffect } from "react";
import VscodeTheme from "../../components/VscodeTheme";
import { vscode } from '../../utils/vscode';

const Welcome: FC = () => {
	useEffect(() => {
		vscode.postMessage({ type: "hideOnboardingLoading" })

		return () => {
			vscode.postMessage({ type: "unlockOnboardingOverlay" })
		};
	}, []);

	return (
		<VscodeTheme className="flex flex-col h-full w-full select-none items-center justify-center bg-background text-foreground">
			<h1>Welcome to Orange Pi Code</h1>
		</VscodeTheme>
	);
};

export default Welcome;
