import { FC } from 'react';
import { Button } from '../../../components/ui';

const Common: FC = () => {
	return <div>
		<div className='text-[24px] font-medium mb-[16px]'>通用</div>

		<div className='font-medium text-[16px] mb-[12px]'>账户</div>

		<div className='text-[14px] mb-[12px] text-foreground/70'>
			当前登录账号：ZZZ
		</div>

		<div className='mb-[24px]'>
			<Button className='w-[140px] rounded'>退出登录</Button>
		</div>

		<div className='font-medium text-[16px] mb-[12px]'>主题</div>
	</div>
}

export default Common;
