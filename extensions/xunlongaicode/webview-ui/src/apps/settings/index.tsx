import { FC, PropsWithChildren, useState } from 'react'
import { cn } from '../../lib/utils'
import Common from './components/Common'
import OrangePiAI from './components/OrangePiAI'
import Prompts from './components/Prompts'
import MCP from './components/MCP'
import About from './components/About'
import { ExtensionStateContextProvider } from '../../context/ExtensionStateContext'
import TranslationProvider from '../../i18n/TranslationContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const SideItem: FC<PropsWithChildren & {
	active?: boolean
	value: number
	onItemClick?: (value: number) => void
}> = (props) => {
	return <div
		className={cn(
			'w-[160px] h-[28px] flex items-center rounded-[4px] bg-foreground/0 px-[8px] hover:bg-foreground/20 cursor-pointer',
			{
				'bg-foreground/30': props.active
			}
		)}
		onClick={() => {
			if (props.onItemClick) {
				props.onItemClick(props.value)
			}
		}}
	>
		<div>{props.children}</div>
	</div>
}

const Settings: FC = () => {
	const [currentTab, setCurrentTab] = useState(0)
	const labels = {
		0: "通用",
		1: "OrangePi AI",
		2: "提示词",
		3: "MCP",
		4: "关于"
	}

	return (
		<div className='flex'>
			{/* 左侧菜单栏 */}
			<div className='flex flex-col text-[14px] font-medium text-foreground space-y-[4px] mx-[8px] my-[16px]'>
				<SideItem
					value={0}
					active={currentTab === 0}
					onItemClick={setCurrentTab}
				>
					{labels[0]}
				</SideItem>
				<SideItem
					value={1}
					active={currentTab === 1}
					onItemClick={setCurrentTab}
				>
					{labels[1]}
				</SideItem>
				<SideItem
					value={2}
					active={currentTab === 2}
					onItemClick={setCurrentTab}
				>
					{labels[2]}
				</SideItem>
				<SideItem
					value={3}
					active={currentTab === 3}
					onItemClick={setCurrentTab}
				>
					{labels[3]}
				</SideItem>
				<SideItem
					value={4}
					active={currentTab === 4}
					onItemClick={setCurrentTab}
				>
					{labels[4]}
				</SideItem>
			</div>

			{/* 间距 */}
			<div className='w-[24px]'></div>

			{/* 右侧内容 */}
			<div className='pt-[16px] pr-[16px] text-foreground max-h-screen overflow-auto'>
				{currentTab === 0 && <Common />}
				{currentTab === 1 && <OrangePiAI />}
				{currentTab === 2 && <Prompts />}
				{currentTab === 3 && <MCP />}
				{currentTab === 4 && <About />}
			</div>
		</div>
	)
}

const queryClient = new QueryClient()

const SettingsAppWithProviders = () => (
	<ExtensionStateContextProvider>
		<TranslationProvider>
			<QueryClientProvider client={queryClient}>
				<Settings />
			</QueryClientProvider>
		</TranslationProvider>
	</ExtensionStateContextProvider>
)

export default SettingsAppWithProviders
