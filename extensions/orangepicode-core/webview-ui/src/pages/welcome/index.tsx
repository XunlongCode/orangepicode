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
		<div>
			<h1>Welcome to OrangePiCode</h1>
		</div>
	);
};

export default Welcome;
