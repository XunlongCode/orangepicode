import { FC } from 'react';
import McpView from '../../../components/mcp/McpView';
import { cn } from '../../../lib/utils';

const MCP: FC = () => {
	return <McpView className={cn("relative")} />
}

export default MCP;
