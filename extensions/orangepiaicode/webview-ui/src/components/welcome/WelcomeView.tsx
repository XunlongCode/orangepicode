import { useCallback, useState } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import ApiOptions from "../settings/ApiOptions"
import { Tab, TabContent } from "../common/Tab"
import { Alert } from "../common/Alert"
import { useAppTranslation } from "../../i18n/TranslationContext"
import { getVscExtensionPath } from '../../utils'
import { Button } from '../ui'

const WelcomeView = () => {
	const { apiConfiguration, currentApiConfigName, setApiConfiguration, uriScheme } = useExtensionState()
	const { t } = useAppTranslation()

	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

	const handleSubmit = useCallback(() => {
		const error = validateApiConfiguration(apiConfiguration)

		if (error) {
			setErrorMessage(error)
			return
		}

		setErrorMessage(undefined)
		vscode.postMessage({ type: "upsertApiConfiguration", text: currentApiConfigName, apiConfiguration })
	}, [apiConfiguration, currentApiConfigName])

	return (
		<Tab>
			<TabContent className="flex flex-col gap-12">
				<h2 className="m-0 p-0 text-[24px] font-medium">{t("welcome:greeting")}</h2>
				<div className='flex items-center justify-center'>
					<div className='h-[100px] w-[100px]'>
						<img className='h-full w-full' src={getVscExtensionPath("/src/assets/logo.png")} alt="" />
					</div>
				</div>

				<div className='text-[14px]'>
					<div>{t("welcome:introduction")}</div>
					<div className="mt-[44px]">{t("welcome:notice")}</div>
				</div>
				<ApiOptions
					fromWelcomeView
					apiConfiguration={apiConfiguration || {}}
					uriScheme={uriScheme}
					setApiConfigurationField={(field, value) => setApiConfiguration({ [field]: value })}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
				/>
			</TabContent>
			<div className="sticky bottom-0 bg-vscode-sideBar-background p-5">
				<div className="flex flex-col gap-1 text-center">
					<div>
						<Button
							variant={"secondary"}
							onClick={handleSubmit}
							className='min-w-[200px]'
							size={"lg"}
						>
							{t("welcome:start")}
						</Button>
					</div>
					{errorMessage && <div className="text-vscode-errorForeground">{errorMessage}</div>}
				</div>
			</div>
		</Tab>
	)
}

export default WelcomeView
