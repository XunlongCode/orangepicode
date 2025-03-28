import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { VscHlThemeContext } from "./context/VscHlTheme";
import { useVscHlTheme } from "./hooks/useVscHlTheme";
import { useEffect } from "react";
import { vscode } from './utils/vscode';
import TranslationProvider from './i18n/TranslationContext';

function App() {
	const vscTheme = useVscHlTheme();

	useEffect(() => {
		vscode.postMessage({
			type: "webviewDidLaunch"
		})
	}, []);

	return (
		<TranslationProvider>
			<VscHlThemeContext.Provider value={vscTheme}>
				<RouterProvider router={router} />
			</VscHlThemeContext.Provider>
		</TranslationProvider>
	);
}

export default App;
