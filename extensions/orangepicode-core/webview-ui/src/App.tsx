import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { VscHlThemeContext } from "./context/VscHlTheme";
import { useVscHlTheme } from "./hooks/useVscHlTheme";
import { useWebviewMessager } from "./hooks/useWebviewMessager";
import { useEffect } from "react";

function App() {
	const vscTheme = useVscHlTheme();
	const onDidLaunch = useWebviewMessager("webviewDidLaunch");

	useEffect(() => {
		onDidLaunch.post();
	}, []);

	return (
		<VscHlThemeContext.Provider value={vscTheme}>
			<RouterProvider router={router} />
		</VscHlThemeContext.Provider>
	);
}

export default App;
