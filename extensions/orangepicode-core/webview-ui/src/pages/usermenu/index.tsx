import { FC } from 'react';
import VscodeTheme from '../../components/VscodeTheme';
import { getVscExtensionPath } from '../../utils';
import { vscode } from '../../utils/vscode';

export const Usermenu: FC = () => {

	const onUsermenuMaskClick = () => {
		vscode.postMessage({
			type: "hideUsermenu"
		})
	}

	return <div className='absolute inset-0'>
		<div className='absolute inset-0' onClick={onUsermenuMaskClick}></div>
		<div className='absolute w-[240px] h-[456px] right-[24px] top-[45px]'>
			<VscodeTheme
				style={{
					boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.25)"
				}}
				className='w-full h-full bg-background text-foreground rounded-[8px] border border-secondary'
			>
				<div className='pt-[16px]'>
					{/* 用户信息 */}
					<div className='flex h-[56px] items-center px-[16px]'>
						<div className='w-[40px] h-[40px] rounded-full overflow-hidden'>
							<img className='h-full w-full' src={getVscExtensionPath('/src/assets/usermenu/default-avatar.png')} alt="" />
						</div>
						<div className='w-[12px]'></div>
						<div className='font-medium text-base'>用户名</div>
					</div>
					{/* 用户菜单 */}
				</div>
			</VscodeTheme>
		</div>
	</div>
}
