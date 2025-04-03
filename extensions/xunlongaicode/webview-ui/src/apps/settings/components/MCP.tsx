import { FC } from 'react';
import McpView from '../../../components/mcp/McpView';
import { cn } from '../../../lib/utils';
import { useAppTranslation } from '../../../i18n/TranslationContext';

const MCP: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='px-[20px] text-[24px] font-medium mb-[16px]'>
			{t("mcp", { ns: "settingsApp" })}
		</div>
		<McpView className={cn("relative")} />
	</div>
}

export default MCP;
