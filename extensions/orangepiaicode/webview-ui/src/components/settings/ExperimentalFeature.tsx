import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { Checkbox } from '../ui/checkbox'

interface ExperimentalFeatureProps {
	enabled: boolean
	onChange: (value: boolean) => void
	// Additional property to identify the experiment
	experimentKey?: string
}

export const ExperimentalFeature = ({ enabled, onChange, experimentKey }: ExperimentalFeatureProps) => {
	const { t } = useAppTranslation()

	// Generate translation keys based on experiment key
	const nameKey = experimentKey ? `settings:experimental.${experimentKey}.name` : ""
	const descriptionKey = experimentKey ? `settings:experimental.${experimentKey}.description` : ""

	return (
		<div>
			<div className="flex items-center gap-2">
				<span className="text-vscode-errorForeground">{t("settings:experimental.warning")}</span>
				<Checkbox checked={enabled} onCheckedChange={(e) => onChange(
					e === "indeterminate" ? false : e
				)}>
					<span className="font-medium">{t(nameKey)}</span>
				</Checkbox>
			</div>
			<p className="text-vscode-descriptionForeground text-sm mt-0">{t(descriptionKey)}</p>
		</div>
	)
}
