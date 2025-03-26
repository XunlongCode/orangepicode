import { FC } from 'react'
import { Button } from '../../../components/ui/button'


const AccountLogin: FC<{ onNext: () => void }> = ({ onNext }) => {


	return <div>
		<div className='text-2xl font-medium leading-none text-center mb-3'>账号登录</div>
		<div className='text-sm leading-none'>支持Google账号、Github账号、邮箱账号进行登录。</div>

		<div className='h-16'></div>

		<div className='flex flex-col items-center'>
			<Button className='h-[34px] w-[200px] text-base'>登录</Button>
			<div className='h-5'></div>
			<Button className='h-[21px] p-0 w-auto text-sm !no-underline' variant="link" onClick={onNext}>
				<div className='text-foreground opacity-80'>跳过</div>
			</Button>
		</div>
	</div>
}

export default AccountLogin
