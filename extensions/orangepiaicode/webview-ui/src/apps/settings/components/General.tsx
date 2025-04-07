import { FC, useEffect, useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '../../../components/ui';
import { useAppTranslation } from '../../../i18n/TranslationContext';
import { cn } from '../../../lib/utils';
import { vscode } from '../../../utils/vscode';
import { getVscExtensionPath } from '../../../utils';
import { useWebviewListener } from '../../../hooks/useWebviewListener';

const ThemeItem: FC<{
	value: { value: string, label: string },
	isSelected: boolean,
	imgSrc: string,
	onChange: (value: { value: string, label: string }) => void
	className?: string
}> = ({ value, isSelected, imgSrc, onChange, className }) => {

	return <button className={cn(
		'flex-1 p-2 bg-secondary rounded-[8px] text-left flex items-center hover:bg-primary cursor-pointer w-full',
		{ 'bg-primary': isSelected },
		className
	)} onClick={() => onChange(value)}>
		<img className='w-[33px] mr-[8px]' src={imgSrc} alt="" />
		<div className='flex justify-between items-center'>
			<div className='text-base font-medium'>{value.label}</div>
		</div>
	</button>
}

const LanguageItem: FC<{
	value: { value: string, label: string },
	// isSelected: boolean,
	onChange: (value: { value: string, label: string }) => void
}> = ({
	value,
	//  isSelected,
	onChange
}) => {
		return <button className={cn('h-[32px] text-left px-[5px] mx-[5px] rounded-[4px] text-sm hover:bg-primary cursor-pointer')} onClick={() => onChange(value)}>
			{value.label}
		</button>
	}


const General: FC = () => {
	const { t } = useAppTranslation()
	const [userInfo, setUserInfo] = useState<{ label: string; id: string } | null>(null);

	useEffect(() => {
		vscode.postMessage({
			type: "getGitHubSession"
		})
	}, [])

	useWebviewListener("getGitHubSessionSuccess", async (message) => {
		setUserInfo(message.githubSession?.account ?? null);
	})

	const initLanguage = window.language?.toLocaleLowerCase() === "zh-cn" ? {
		label: "中文",
		value: "zh-CN"
	} : {
		label: "English",
		value: "en"
	}

	const [currentTheme, setCurrentTheme] = useState({
		value: "dark",
		label: t("darkTheme", { ns: "theme" })
	})

	const [currentLanguage, setCurrentLanguage] = useState(initLanguage)
	const [langPopverOpen, setLangPopoverOpen] = useState(false)
	const [themePopverOpen, setThemePopoverOpen] = useState(false)

	const selectTheme = (value: { value: string, label: string }) => {
		setThemePopoverOpen(false)
		setCurrentTheme(value)
		// vscode.postMessage({
		// 	type: "theme",
		// 	theme: value.value
		// })
	}

	const selectLanguage = (value: { value: string, label: string }) => {
		setCurrentLanguage(value)
		vscode.postMessage({
			type: "language",
			text: value.value.toLowerCase()
		})
	}

	// 点击登出
	const onLogout = () => {
		vscode.postMessage({
			type: "logout"
		})
	}

	// 接受登出的回掉
	useWebviewListener("githubLogoutSuccess", async () => {
		setUserInfo(null)
	})

	return <div>
		<div className='text-[24px] font-medium mb-[16px]'>
			{t("general", { ns: "settingsApp" })}
		</div>

		<div className='font-medium text-[16px] mb-[12px]'>
			{t("account", { ns: "settingsApp" })}
		</div>

		{
			userInfo ? <>
				<div className='text-[14px] mb-[12px] text-foreground/70'>
					{t("currentAccount", { ns: "settingsApp" })}: {userInfo?.label}
				</div>
				<div className='mb-[24px]'>
					<Button className='w-[140px] rounded' onClick={onLogout}>
						{t("logout", { ns: "settingsApp" })}
					</Button>
				</div>
			</> :
				<div className='mb-[24px]'>
					<Button className='w-[140px] rounded'>
						{t("login", { ns: "settingsApp" })}
					</Button>
				</div>
		}

		<div className='font-medium text-[16px] mb-[12px]'>
			{t("theme", { ns: "settingsApp" })}
		</div>

		<Popover open={themePopverOpen} onOpenChange={setThemePopoverOpen}>
			<PopoverTrigger asChild className='w-full max-w-[320px]'>
				<div className='w-full h-8 bg-secondary flex items-center justify-between rounded px-[10px] cursor-pointer'>
					<ThemeItem
						className='p-0 !bg-transparent'
						value={currentTheme}
						isSelected={false}
						imgSrc={getVscExtensionPath("src/assets/theme-dark.png")}
						onChange={selectTheme}
					/>
					<div className={cn({ "rotate-180": themePopverOpen })}>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.2368 4.70752L7 9.94434L1.76318 4.70752" stroke="#DADDE5" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
				</div>
			</PopoverTrigger>
			<PopoverContent className='p-0 bg-secondary border-none w-[var(--radix-popover-trigger-width)] !animate-none'>
				<ThemeItem
					value={{ value: "dark", label: t("darkTheme", { ns: "theme", }) }}
					isSelected={currentTheme.value === "dark"}
					imgSrc={getVscExtensionPath("src/assets/theme-dark.png")}
					onChange={selectTheme}
				/>
				<ThemeItem
					value={{ value: "light", label: t("lightTheme", { ns: "theme" }) }}
					isSelected={currentTheme.value === "light"}
					imgSrc={getVscExtensionPath("src/assets/theme-light.png")}
					onChange={selectTheme}
				/>
				<ThemeItem
					value={{ value: "orange", label: t("orangeTheme", { ns: "theme" }) }}
					isSelected={currentTheme.value === "orange"}
					imgSrc={getVscExtensionPath("src/assets/theme-orange.png")}
					onChange={selectTheme}
				/>
			</PopoverContent>
		</Popover>

		<div className='font-medium text-[16px] mb-[12px] mt-[24px]'>
			{t("language", { ns: "settingsApp" })}
		</div>

		<Popover open={langPopverOpen} onOpenChange={setLangPopoverOpen}>
			<PopoverTrigger className='w-full max-w-[320px] h-8 bg-secondary flex items-center justify-between rounded px-[10px] cursor-pointer'>
				<div className='text-sm'>
					{currentLanguage.label}
				</div>
				<div className={cn({ "rotate-180": langPopverOpen })}>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.2368 4.70752L7 9.94434L1.76318 4.70752" stroke="#DADDE5" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			</PopoverTrigger>
			<PopoverContent className='p-0 border-none w-[var(--radix-popover-trigger-width)] !animate-none'>
				<div className='w-full flex flex-col text-foreground bg-secondary'>
					<div className='h-[5px]'></div>
					<LanguageItem
						value={{ value: "zh-CN", label: "简体中文" }}
						onChange={(value) => {
							selectLanguage(value)
							setLangPopoverOpen(false)
						}}
					/>
					<div className='h-[5px]'></div>
					<LanguageItem
						value={{ value: "en", label: "English" }}
						onChange={(value) => {
							selectLanguage(value)
							setLangPopoverOpen(false)
						}}
					/>
					<div className='h-[5px]'></div>
				</div>
			</PopoverContent>
		</Popover>

		<div className='font-medium text-[16px] mb-[12px] mt-[24px]'>
			{t("importSettings", { ns: "settingsApp" })}
		</div>

		<div className='text-[14px] mb-[12px] text-foreground/70'>
			{t("importSettingsDescription", { ns: "settingsApp" })}
		</div>

		<div className='mb-[24px] flex gap-2.5 flex-wrap'>
			<Button className='w-[140px] rounded h-[34px]'>
				{t("importFromVSCode", { ns: "settingsApp" })}
			</Button>
			<Button className='w-[140px] rounded h-[34px]'>
				{t("importFromCursor", { ns: "settingsApp" })}
			</Button>
		</div>

		<div className='font-medium text-[16px] mb-[12px] mt-[24px]'>
			{t("editorSettings", { ns: "settingsApp" })}
		</div>

		<div className='text-[14px] mb-[12px] text-foreground/70'>
			{t("editorSettingsDescription", { ns: "settingsApp" })}
		</div>

		<div className='mb-[24px]'>
			<Button className='w-[140px] rounded h-[34px]'>
				{t("goToSettings", { ns: "settingsApp" })}
			</Button>
		</div>

		<div className='text-[14px] mb-[12px] text-foreground/70'>
			{t("keyboardShortcutsSettings", { ns: "settingsApp" })}
		</div>

		<div className='text-[14px] mb-[12px] text-foreground/70'>
			{t("keyboardShortcutsSettingsDescription", { ns: "settingsApp" })}
		</div>

		<div className='mb-[24px]'>
			<Button className='w-[140px] rounded h-[34px]'>
				{t("goToSettings", { ns: "settingsApp" })}
			</Button>
		</div>
	</div>
}

export default General;
