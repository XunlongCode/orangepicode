import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { FormEvent } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { useAppTranslation } from "../../i18n/TranslationContext"
import { vscode } from "../../utils/vscode"
import { Checkbox } from '../ui/checkbox'
import { CheckedState } from '@radix-ui/react-checkbox'

const McpEnabledToggle = () => {
	const { mcpEnabled, setMcpEnabled } = useExtensionState()
	const { t } = useAppTranslation()

	const handleChange = (e: CheckedState) => {
		const checked = e === "indeterminate" ? false : e
		setMcpEnabled(checked)
		vscode.postMessage({ type: "mcpEnabled", bool: checked })
	}

	return (
		<div style={{ marginBottom: "20px" }}>
			<Checkbox checked={mcpEnabled} onCheckedChange={handleChange}>
				<span style={{ fontWeight: "500" }}>{t("mcp:enableToggle.title")}</span>
			</Checkbox>
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("mcp:enableToggle.description")}
			</p>
		</div>
	)
}

export default McpEnabledToggle
