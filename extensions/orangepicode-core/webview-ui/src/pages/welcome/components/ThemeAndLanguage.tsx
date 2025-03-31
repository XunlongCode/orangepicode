import { FC, useState } from 'react';
import { getVscExtensionPath } from '../../../utils';
import { cn } from '../../../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import VscodeTheme from '../../../components/VscodeTheme';
import { Button } from '../../../components/ui/button';
import { useTranslation } from 'react-i18next';
import { vscode } from '../../../utils/vscode';

const ThemeItem: FC<{
	value: { value: string, label: string },
	isSelected: boolean,
	imgSrc: string,
	onChange: (value: { value: string, label: string }) => void
}> = ({ value, isSelected, imgSrc, onChange }) => {

	return <button className={cn(
		'flex-1 p-2 bg-secondary rounded-[8px] text-left',
		{ 'bg-primary': isSelected }
	)} onClick={() => onChange(value)}>
		<img src={imgSrc} alt="" />
		<div className='flex justify-between items-center mt-[10px]'>
			<div className='text-base font-medium'>{value.label}</div>
			{isSelected && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M4 11.4L9.74359 17L20 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
			</svg>}
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
		return <button className={cn('h-[32px] text-left px-[5px] mx-[5px] rounded-[4px] text-sm hover:bg-primary')} onClick={() => onChange(value)}>
			{value.label}
		</button>
	}

const ThemeAndLanguage: FC<{ onNext: () => void }> = ({ onNext }) => {
	const { t, i18n } = useTranslation()

	const [currentTheme, setCurrentTheme] = useState({
		value: "dark",
		label: t("darkTheme", { ns: "welcome" })
	})

	const initLanguage = window.language?.toLocaleLowerCase() === "zh-cn" ? {
		label: "中文",
		value: "zh-CN"
	} : {
		label: "English",
		value: "en"
	}

	const [currentLanguage, setCurrentLanguage] = useState(initLanguage)
	const [langPopverOpen, setLangPopoverOpen] = useState(false)

	const selectTheme = (value: { value: string, label: string }) => {
		setCurrentTheme(value)
		vscode.postMessage({
			type: "setTheme",
			theme: value.value
		})
	}

	const selectLanguage = (value: { value: string, label: string }) => {
		setCurrentLanguage(value)
		i18n.changeLanguage(value.value)
		vscode.postMessage({
			type: "setLanguage",
			language: value.value.toLowerCase()
		})
	}

	return <div>
		<div className='text-2xl font-medium leading-none text-center'>
			{t("selectThemeAndLanguage", { ns: "welcome" })}
		</div>
		<div className='w-full max-w-[612px]'>
			<div className='leading-none mt-8 text-base font-medium mb-4'>
				{t("selectTheme", { ns: "welcome" })}
			</div>
			<div className='flex'>
				<ThemeItem
					value={{ value: "dark", label: t("darkTheme", { ns: "welcome" }) }}
					isSelected={currentTheme.value === "dark"}
					imgSrc={getVscExtensionPath("src/assets/welcome/theme-dark.png")}
					onChange={selectTheme}
				/>
				<div className='w-[12px]'></div>
				<ThemeItem
					value={{ value: "light", label: t("lightTheme", { ns: "welcome" }) }}
					isSelected={currentTheme.value === "light"}
					imgSrc={getVscExtensionPath("src/assets/welcome/theme-light.png")}
					onChange={selectTheme}
				/>
				<div className='w-[12px]'></div>
				<ThemeItem
					value={{ value: "purple", label: t("purpleTheme", { ns: "welcome" }) }}
					isSelected={currentTheme.value === "purple"}
					imgSrc={getVscExtensionPath("src/assets/welcome/theme-purple.png")}
					onChange={selectTheme}
				/>
			</div>
			<div className='leading-none mt-8 text-base font-medium mb-4'>
				{t("selectTheme", { ns: "welcome" })}
			</div>
			<Popover open={langPopverOpen} onOpenChange={setLangPopoverOpen}>
				<PopoverTrigger className='w-full h-8 bg-secondary flex items-center justify-between rounded px-[10px]'>
					<div className='text-sm'>
						{currentLanguage.label}
					</div>
					<div className={cn({ "rotate-180": langPopverOpen })}>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.2368 4.70752L7 9.94434L1.76318 4.70752" stroke="#DADDE5" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
				</PopoverTrigger>
				<PopoverContent className='p-0 border-none w-[--radix-popover-trigger-width] !animate-none'>
					<VscodeTheme className='w-full flex flex-col text-foreground bg-secondary'>
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
					</VscodeTheme>
				</PopoverContent>
			</Popover>
		</div>

		<div className='flex justify-center mt-[24px]'>
			<Button
				size="sm"
				className="w-[96px]"
				onClick={onNext}
			>
				<div className='text-base font-medium'>
					{t("continue", { ns: "welcome" })}
				</div>
			</Button>
		</div>
	</div>
}

export default ThemeAndLanguage;
