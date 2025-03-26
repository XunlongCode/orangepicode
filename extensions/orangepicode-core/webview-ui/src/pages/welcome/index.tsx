import { FC, useEffect } from "react";
import { useWebviewMessager } from "../../hooks/useWebviewMessager";
import VscodeTheme from "../../components/VscodeTheme";

const Welcome: FC = () => {
	const { post: hideOnboardingLoading } = useWebviewMessager(
		"hideOnboardingLoading"
	);
	const { post: unlockOnboardingOverlay } = useWebviewMessager(
		"unlockOnboardingOverlay"
	);

	useEffect(() => {
		hideOnboardingLoading();

		return () => {
			unlockOnboardingOverlay();
		};
	}, []);

	return (
		<VscodeTheme className="flex flex-col h-full w-full select-none items-center justify-center bg-background text-foreground">
			<h1>Welcome to Orange Pi Code</h1>
		</VscodeTheme>
	);
};

export default Welcome;
