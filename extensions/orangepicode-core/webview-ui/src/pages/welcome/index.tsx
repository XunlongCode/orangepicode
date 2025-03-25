import { FC, useEffect } from "react";
import { useWebviewMessager } from "../../hooks/useWebviewMessager";

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
		<div className="flex flex-col h-full w-full select-none items-center justify-center">
			<h1>Welcome to Orange Pi Code</h1>
		</div>
	);
};

export default Welcome;
