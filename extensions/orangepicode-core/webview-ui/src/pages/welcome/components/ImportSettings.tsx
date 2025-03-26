import { FC } from 'react'
import { Button } from '../../../components/ui/button'
import { getVscExtensionPath } from '../../../utils'


const ImportSettings: FC<{ onNext: () => void }> = ({ onNext }) => {

	return <div>
		<div className='text-2xl font-medium leading-none text-center mb-3'>导入配置</div>
		<div className='text-sm leading-none'>从VSCode、Cursor中一键导入IDE配置，包括插件、设置、快捷键配置等</div>
		<div className='flex items-center justify-center my-20'>
			<div className='w-[88px] h-[88px] border-foreground border-[1.26px] rounded-[10.08px] p-[12px] bg-secondary'>
				<img src={getVscExtensionPath("src/assets/welcome/settings-logo.png")} />
			</div>
			<div className='px-[24px]'>
				<svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M0.5 9.49987H13V0.5L25.5 13.4999H0.5V9.49987Z" fill="white" />
					<rect x="0.5" y="17.5" width="25" height="4" fill="white" />
				</svg>
			</div>
			<div className='w-[88px] h-[88px] border-foreground border-[1.26px] rounded-[10.08px] p-[12px] bg-secondary'>
				<img src={getVscExtensionPath("src/assets/welcome/logo-small.png")} />
			</div>
		</div>
		<div className='flex flex-col items-center'>
			<Button className='h-[34px] w-[200px] text-base'>从VSCode中导入</Button>
			<div className='h-5'></div>
			<Button className='h-[34px] w-[200px] text-base'>从VSCode中导入</Button>
			<div className='h-5'></div>
			<Button className='h-[21px] p-0 w-auto text-sm !no-underline' variant="link" onClick={onNext}>
				<div className='text-foreground opacity-80'>跳过</div>
			</Button>
		</div>
	</div>
}

export default ImportSettings
