import { HTMLAttributes } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { GitBranch } from "lucide-react"

import { CheckpointStorage } from "../../../../src/shared/checkpoints"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { Checkbox } from '../ui/checkbox'

type CheckpointSettingsProps = HTMLAttributes<HTMLDivElement> & {
	enableCheckpoints?: boolean
	checkpointStorage?: CheckpointStorage
	setCachedStateField: SetCachedStateField<"enableCheckpoints" | "checkpointStorage">
	sectionClassName?: string
}

export const CheckpointSettings = ({
	enableCheckpoints,
	checkpointStorage = "task",
	setCachedStateField,
	...props
}: CheckpointSettingsProps) => {
	const { t } = useAppTranslation()
	return (
		<div {...props}>
			<SectionHeader className='px-0 py-0'>
				<div className="flex items-center gap-2">
					{/* <GitBranch className="w-4" /> */}
					<div>{t("settings:sections.checkpoints")}</div>
				</div>
			</SectionHeader>

			<Section className={props.sectionClassName}>
				<div>
					<Checkbox
						className='mb-1'
						checked={enableCheckpoints}
						onCheckedChange={(e: any) => {
							setCachedStateField("enableCheckpoints", e === "indeterminate" ? false : e)
						}}>
						<span className="font-medium">{t("settings:checkpoints.enable.label")}</span>
					</Checkbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						{t("settings:checkpoints.enable.description")}
					</p>
				</div>
			</Section>
		</div>
	)
}
