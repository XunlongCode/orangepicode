import { FC } from 'react';
import { cn } from '../../../lib/utils';
import { useAppTranslation } from '../../../i18n/TranslationContext';
import McpView2 from '../../../components/mcp/McpView2';

const MCP: FC = () => {
	const { t } = useAppTranslation()

	return <div>
		<div className='text-[24px] font-medium mb-[16px]'>
			{t("mcp", { ns: "settingsApp" })}
		</div>
		<McpView2 className={cn("relative")} />
	</div>
}

export default MCP;
