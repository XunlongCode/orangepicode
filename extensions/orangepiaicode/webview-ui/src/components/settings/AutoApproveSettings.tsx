import { HTMLAttributes, useState } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { CheckCheck } from "lucide-react"

import { vscode } from "@/utils/vscode"
import { Button, Input, Slider } from "@/components/ui"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { Checkbox } from '../ui/checkbox'

type AutoApproveSettingsProps = HTMLAttributes<HTMLDivElement> & {
	alwaysAllowReadOnly?: boolean
	alwaysAllowWrite?: boolean
	writeDelayMs: number
	alwaysAllowBrowser?: boolean
	alwaysApproveResubmit?: boolean
	requestDelaySeconds: number
	alwaysAllowMcp?: boolean
	alwaysAllowModeSwitch?: boolean
	alwaysAllowSubtasks?: boolean
	alwaysAllowExecute?: boolean
	allowedCommands?: string[]
	setCachedStateField: SetCachedStateField<
		| "alwaysAllowReadOnly"
		| "alwaysAllowWrite"
		| "writeDelayMs"
		| "alwaysAllowBrowser"
		| "alwaysApproveResubmit"
		| "requestDelaySeconds"
		| "alwaysAllowMcp"
		| "alwaysAllowModeSwitch"
		| "alwaysAllowSubtasks"
		| "alwaysAllowExecute"
		| "allowedCommands"
	>
	sectionClassName?: string
}

export const AutoApproveSettings = ({
	alwaysAllowReadOnly,
	alwaysAllowWrite,
	writeDelayMs,
	alwaysAllowBrowser,
	alwaysApproveResubmit,
	requestDelaySeconds,
	alwaysAllowMcp,
	alwaysAllowModeSwitch,
	alwaysAllowSubtasks,
	alwaysAllowExecute,
	allowedCommands,
	setCachedStateField,
	className,
	...props
}: AutoApproveSettingsProps) => {
	const { t } = useAppTranslation()
	const [commandInput, setCommandInput] = useState("")

	const handleAddCommand = () => {
		const currentCommands = allowedCommands ?? []
		if (commandInput && !currentCommands.includes(commandInput)) {
			const newCommands = [...currentCommands, commandInput]
			setCachedStateField("allowedCommands", newCommands)
			setCommandInput("")
			vscode.postMessage({ type: "allowedCommands", commands: newCommands })
		}
	}

	return (
		<div {...props}>
			<SectionHeader description={t("settings:autoApprove.description")} className='px-0 py-0'>
				<div className="flex items-center gap-2">
					{/* <CheckCheck className="w-4" /> */}
					<div>{t("settings:sections.autoApprove")}</div>
				</div>
			</SectionHeader>

			<Section className={props.sectionClassName}>
				<div>
					<Checkbox
						checked={alwaysAllowReadOnly}
						onCheckedChange={(e: any) => setCachedStateField("alwaysAllowReadOnly", e === "indeterminate" ? false : e)}
						data-testid="always-allow-readonly-checkbox">
						<span className="font-medium">{t("settings:autoApprove.readOnly.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:autoApprove.readOnly.description")}
					</div>
				</div>

				<div>
					<Checkbox
						checked={alwaysAllowWrite}
						onCheckedChange={(e: any) => setCachedStateField("alwaysAllowWrite", e === "indeterminate" ? false : e)}
						data-testid="always-allow-write-checkbox">
						<span className="font-medium">{t("settings:autoApprove.write.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:autoApprove.write.description")}
					</div>
				</div>

				{alwaysAllowWrite && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div>
							<div className="flex items-center gap-2">
								<span>0ms</span>
								<Slider
									min={0}
									max={5000}
									step={100}
									value={[writeDelayMs]}
									onValueChange={([value]) => setCachedStateField("writeDelayMs", value)}
									data-testid="write-delay-slider"
								/>
								<span className="w-20">{writeDelayMs}ms</span>
							</div>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.write.delayLabel")}
							</div>
						</div>
					</div>
				)}

				<div>
					<Checkbox
						checked={alwaysAllowBrowser}
						onCheckedChange={(e: any) => setCachedStateField("alwaysAllowBrowser", e === "indeterminate" ? false : e)}
						data-testid="always-allow-browser-checkbox">
						<span className="font-medium">{t("settings:autoApprove.browser.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						<div>{t("settings:autoApprove.browser.description")}</div>
						<div>{t("settings:autoApprove.browser.note")}</div>
					</div>
				</div>

				<div>
					<Checkbox
						checked={alwaysApproveResubmit}
						onCheckedChange={(e: any) => setCachedStateField("alwaysApproveResubmit", e === "indeterminate" ? false : e)}
						data-testid="always-approve-resubmit-checkbox">
						<span className="font-medium">{t("settings:autoApprove.retry.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:autoApprove.retry.description")}
					</div>
				</div>

				{alwaysApproveResubmit && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div>
							<div className="flex items-center gap-2">
								<span>5s</span>
								<Slider
									min={5}
									max={100}
									step={1}
									value={[requestDelaySeconds]}
									onValueChange={([value]) => setCachedStateField("requestDelaySeconds", value)}
									data-testid="request-delay-slider"
								/>
								<span className="w-20">{requestDelaySeconds}s</span>
							</div>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.retry.delayLabel")}
							</div>
						</div>
					</div>
				)}

				<div>
					<Checkbox
						checked={alwaysAllowMcp}
						onCheckedChange={(e: any) => setCachedStateField("alwaysAllowMcp", e === "indeterminate" ? false : e)}
						data-testid="always-allow-mcp-checkbox">
						<span className="font-medium">{t("settings:autoApprove.mcp.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:autoApprove.mcp.description")}
					</div>
				</div>

				{/* <div>
					<Checkbox
						checked={alwaysAllowModeSwitch}
						onCheckedChange={(e: any) => setCachedStateField("alwaysAllowModeSwitch", e === "indeterminate" ? false : e)}
						data-testid="always-allow-mode-switch-checkbox">
						<span className="font-medium">{t("settings:autoApprove.modeSwitch.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:autoApprove.modeSwitch.description")}
					</div>
				</div> */}

				<div>
					<Checkbox
						checked={alwaysAllowSubtasks}
						onCheckedChange={(e: any) => setCachedStateField("alwaysAllowSubtasks", e === "indeterminate" ? false : e)}
						data-testid="always-allow-subtasks-checkbox">
						<span className="font-medium">{t("settings:autoApprove.subtasks.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:autoApprove.subtasks.description")}
					</div>
				</div>

				<div>
					<Checkbox
						checked={alwaysAllowExecute}
						onCheckedChange={(e) => setCachedStateField("alwaysAllowExecute", e === "indeterminate" ? false : e)}
						data-testid="always-allow-execute-checkbox">
						<span className="font-medium">{t("settings:autoApprove.execute.label")}</span>
					</Checkbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:autoApprove.execute.description")}
					</div>
				</div>

				{alwaysAllowExecute && (
					<div className="flex flex-col gap-3 pl-3 border-l-2 border-vscode-button-background">
						<div>
							<label className="block font-medium mb-1" data-testid="allowed-commands-heading">
								{t("settings:autoApprove.execute.allowedCommands")}
							</label>
							<div className="text-vscode-descriptionForeground text-sm mt-1">
								{t("settings:autoApprove.execute.allowedCommandsDescription")}
							</div>
						</div>

						<div className="flex gap-2">
							<Input
								value={commandInput}
								onInput={(e: any) => setCommandInput(e.target.value)}
								onKeyDown={(e: any) => {
									if (e.key === "Enter") {
										e.preventDefault()
										handleAddCommand()
									}
								}}
								placeholder={t("settings:autoApprove.execute.commandPlaceholder")}
								className="grow"
								data-testid="command-input"
							/>
							<Button variant={"secondary"} onClick={handleAddCommand} data-testid="add-command-button">
								{t("settings:autoApprove.execute.addButton")}
							</Button>
						</div>

						<div className="flex flex-wrap gap-2">
							{(allowedCommands ?? []).map((cmd, index) => (
								<div
									key={index}
									className="border-none bg-vscode-editorWidget-background text-vscode-editorWidget-foreground flex items-center gap-1 rounded-[4px] px-1.5 p-0.5">
									<span>{cmd}</span>
									<VSCodeButton
										appearance="icon"
										className="text-vscode-button-secondaryForeground"
										data-testid={`remove-command-${index}`}
										onClick={() => {
											const newCommands = (allowedCommands ?? []).filter((_, i) => i !== index)
											setCachedStateField("allowedCommands", newCommands)
											vscode.postMessage({ type: "allowedCommands", commands: newCommands })
										}}>
										<span className="codicon codicon-close" />
									</VSCodeButton>
								</div>
							))}
						</div>
					</div>
				)}
			</Section>
		</div>
	)
}
