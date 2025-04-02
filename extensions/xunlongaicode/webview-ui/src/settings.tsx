import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import "./apps/settings/index.css";
import "@vscode/codicons/dist/codicon.css"
import Settings from './apps/settings'

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Settings />
	</StrictMode>,
)
