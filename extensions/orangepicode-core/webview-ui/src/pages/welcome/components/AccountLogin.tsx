import { FC, useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { useTranslation } from 'react-i18next'
import { vscode } from '../../../utils/vscode'
import { useWebviewListener } from '../../../hooks/useWebviewListener'
import { ExtensionMessage } from '../../../../../src/shared/ExtensionMessage'


const AccountLogin: FC<{ onNext: () => void }> = ({ onNext }) => {
	const { t } = useTranslation()
	const [userInfo, setUserInfo] = useState<ExtensionMessage['githubSession']>()

	const onSignin = () => {
		vscode.postMessage({
			type: "githubLogin"
		})
	}

	useEffect(() => {
		vscode.postMessage({ type: "getGitHubSession" })
	}, [])

	useWebviewListener("githubLoginSuccess", async () => {
		vscode.postMessage({ type: "getGitHubSession" })
	})

	useWebviewListener("getGitHubSessionSuccess", async (data) => {
		if (data.githubSession) {
			setUserInfo(data.githubSession)
		}
	})

	return <div>
		<div className='text-2xl font-medium leading-none text-center mb-3'>
			{t("accountSignIn", { ns: "welcome" })}
		</div>
		<div className='text-sm leading-none'>
			{t("accountSignInDescription", { ns: "welcome" })}
		</div>

		<div className='flex flex-col items-center justify-center'>
			<div className='h-[94px]'></div>
			<div className='shrink-0 w-[136px] h-[136px] overflow-hidden bg-foreground bg-opacity-[0.14] flex items-center justify-center rounded-full'>
				{
					userInfo ? <img className='h-full w-full' src={`https://avatars.githubusercontent.com/u/${userInfo.account.id}`} alt="" />
						: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="18.5835" y="3.12354" width="34.8333" height="34.8333" rx="17.4167" stroke="currentColor" strokeWidth="5" />
							<path d="M69 71.836C69 67.5618 68.1464 63.3294 66.488 59.3805C64.8296 55.4316 62.3989 51.8435 59.3345 48.8212C56.2702 45.7988 52.6323 43.4013 48.6286 41.7657C44.6248 40.13 40.3336 39.2881 36 39.2881C31.6664 39.2881 27.3752 40.13 23.3714 41.7657C19.3677 43.4013 15.7298 45.7988 12.6655 48.8212C9.60114 51.8435 7.17038 55.4316 5.51197 59.3805C3.85357 63.3294 3 67.5618 3 71.836" stroke="currentColor" strokeWidth="5" />
						</svg>
				}
			</div>
			<div className='h-[107px]'></div>
		</div>

		<div className='flex flex-col items-center'>
			<Button
				className='h-[34px] w-[200px] text-base'
				onClick={userInfo ? onNext : onSignin}
			>
				{userInfo ? t("complete", { ns: "welcome" }) : t("signIn", { ns: "welcome" })}
			</Button>
			{
				!userInfo && <>
					<div className='h-5'></div>
					<Button className='h-[21px] p-0 w-auto text-sm !no-underline' variant="link" onClick={onNext}>
						<div className='text-foreground opacity-80'> {t("skip", { ns: "welcome" })} </div>
					</Button>
				</>
			}
		</div>
	</div>
}

export default AccountLogin
