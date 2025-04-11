import { HTMLAttributes } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { Bell } from "lucide-react"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { Slider } from "../ui"
import { Checkbox } from '../ui/checkbox'

type NotificationSettingsProps = HTMLAttributes<HTMLDivElement> & {
	ttsEnabled?: boolean
	ttsSpeed?: number
	soundEnabled?: boolean
	soundVolume?: number
	setCachedStateField: SetCachedStateField<"ttsEnabled" | "ttsSpeed" | "soundEnabled" | "soundVolume">
	sectionClassName?: string
}

export const NotificationSettings = ({
	ttsEnabled,
	ttsSpeed,
	soundEnabled,
	soundVolume,
	setCachedStateField,
	...props
}: NotificationSettingsProps) => {
	const { t } = useAppTranslation()
	return (
		<div {...props}>
			<SectionHeader className='px-0 py-0'>
				<div className="flex items-center gap-2">
					{/* <Bell className="w-4" /> */}
					<div>{t("settings:sections.notifications")}</div>
				</div>
			</SectionHeader>

			<Section className={props.sectionClassName}>
				<div>
					<Checkbox
						checked={ttsEnabled}
						onCheckedChange={(e: any) => setCachedStateField("ttsEnabled", e === "indeterminate" ? false : e)}
						data-testid="tts-enabled-checkbox">
						<span className="font-medium">{t("settings:notifications.tts.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:notifications.tts.description")}
					</div>
				</div>

				{ttsEnabled && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div>
							<label className="block font-medium mb-1">
								{t("settings:notifications.tts.speedLabel")}
							</label>
							<div className="flex items-center gap-2">
								<span>10%</span>
								<Slider
									min={0.1}
									max={2.0}
									step={0.01}
									value={[ttsSpeed ?? 1.0]}
									onValueChange={([value]) => setCachedStateField("ttsSpeed", value)}
									data-testid="tts-speed-slider"
								/>
								<span className="w-10">{((ttsSpeed ?? 1.0) * 100).toFixed(0)}%</span>
							</div>
						</div>
					</div>
				)}

				<div>
					<Checkbox
						checked={soundEnabled}
						onCheckedChange={(e: any) => setCachedStateField("soundEnabled", e === "indeterminate" ? false : e)}
						data-testid="sound-enabled-checkbox">
						<span className="font-medium">{t("settings:notifications.sound.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:notifications.sound.description")}
					</div>
				</div>

				{soundEnabled && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div>
							<label className="block font-medium mb-1">
								{t("settings:notifications.sound.volumeLabel")}
							</label>
							<div className="flex items-center gap-2">
								<span>0%</span>
								<Slider
									min={0}
									max={1}
									step={0.01}
									value={[soundVolume ?? 0.5]}
									onValueChange={([value]) => setCachedStateField("soundVolume", value)}
									data-testid="sound-volume-slider"
								/>
								<span className="w-10">{((soundVolume ?? 0.5) * 100).toFixed(0)}%</span>
							</div>
						</div>
					</div>
				)}
			</Section>
		</div>
	)
}
