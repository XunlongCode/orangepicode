import { FC } from 'react';
import McpView from '../../../components/mcp/McpView';
import { cn } from '../../../lib/utils';

const MCP: FC = () => {
	return <div>
		<div className='px-[20px] text-[24px] font-medium mb-[16px]'>MCP</div>
		<McpView className={cn("relative")} />
	</div>
}

export default MCP;
