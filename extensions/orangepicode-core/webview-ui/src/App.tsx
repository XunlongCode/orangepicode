import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { VscThemeContext } from "./context/VscTheme";
import { useVscTheme } from "./hooks/useVscTheme";

function App() {
	const vscTheme = useVscTheme();

	return (
		<VscThemeContext.Provider value={vscTheme}>
			<RouterProvider router={router} />;
		</VscThemeContext.Provider>
	);
}

export default App;
