import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { VscHlThemeContext } from "./context/VscHlTheme";
import { useVscHlTheme } from "./hooks/useVscHlTheme";
import { useEffect } from "react";
import { vscode } from './utils/vscode';
import { useTranslation } from 'react-i18next';

function App() {
	const vscTheme = useVscHlTheme();
	const { i18n } = useTranslation()

	const setLanguage = (language?: string) => {
		language = language?.toLowerCase();
		switch (language) {
			case 'zh-cn':
				i18n.changeLanguage('zh-CN')
				break;

			default:
				i18n.changeLanguage('en')
		}
	}

	useEffect(() => {
		setLanguage(window.language)
		vscode.postMessage({
			type: "webviewDidLaunch"
		})
	}, []);

	return (
		<VscHlThemeContext.Provider value={vscTheme}>
			<RouterProvider router={router} />
		</VscHlThemeContext.Provider>
	);
}

export default App;
