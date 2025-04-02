import { FC } from 'react'
import { Button } from '../../../components/ui/button'
import { useTranslation } from 'react-i18next'


const AccountLogin: FC<{ onNext: () => void }> = ({ onNext }) => {
	const { t } = useTranslation()

	return <div>
		<div className='text-2xl font-medium leading-none text-center mb-3'>
			{t("accountSignIn", { ns: "welcome" })}
		</div>
		<div className='text-sm leading-none'>
			{t("accountSignInDescription", { ns: "welcome" })}
		</div>

		<div className='h-16'></div>

		<div className='flex flex-col items-center'>
			<Button className='h-[34px] w-[200px] text-base'> { t("signIn", { ns: "welcome" }) } </Button>
			<div className='h-5'></div>
			<Button className='h-[21px] p-0 w-auto text-sm !no-underline' variant="link" onClick={onNext}>
				<div className='text-foreground opacity-80'> {t("skip", { ns: "welcome" })} </div>
			</Button>
		</div>
	</div>
}

export default AccountLogin
