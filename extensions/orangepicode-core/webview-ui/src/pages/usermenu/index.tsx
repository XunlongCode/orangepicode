import { FC, useEffect, useRef, useState } from 'react';
import VscodeTheme from '../../components/VscodeTheme';
import { getVscExtensionPath } from '../../utils';
import { vscode } from '../../utils/vscode';
import { css } from '@emotion/css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import tw from "twin.macro";
import { useWebviewListener } from '../../hooks/useWebviewListener';
import { cn } from '../../lib/utils';

export const Usermenu: FC = () => {
	const { t,
		// i18n
	} = useTranslation()
	const dropdownContiainerRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false)
	const [themeSubOpen, setThemeSubOpen] = useState(false)
	const [languageSubOpen, setLanguageSubOpen] = useState(false)

	// 添加用户登录状态和用户信息的状态变量
	const [userInfo, setUserInfo] = useState<{ label: string; id: string } | null>(null);

	// 避免两个子菜单同时开启
	useEffect(() => {
		if (themeSubOpen) {
			setLanguageSubOpen(false)
		}
		if (languageSubOpen) {
			setThemeSubOpen(false)
		}
	}, [themeSubOpen, languageSubOpen])

	useWebviewListener("onShowUsermenu", async () => {
		setLanguageSubOpen(false)
		setThemeSubOpen(false)
	})

	useEffect(() => {
		vscode.postMessage({
			type: "getGitHubSession"
		})
	}, [])

	useWebviewListener("getGitHubSessionSuccess", async (message) => {
		setUserInfo(message.githubSession?.account ?? null);
	})

	useEffect(() => {
		if (dropdownContiainerRef.current) {
			setOpen(true)
		}
	}, [dropdownContiainerRef.current])

	// 点击遮罩，关闭菜单
	const hideUsermenu = () => {
		setThemeSubOpen(false)
		setLanguageSubOpen(false)

		vscode.postMessage({
			type: "hideUsermenu"
		})
	}

	// 选择语言
	const setLanguage = (lang: string) => {
		// i18n.changeLanguage(lang)
		vscode.postMessage({
			type: "setLanguage",
			language: lang
		})
		hideUsermenu()
	}

	//选择主题
	const onSelectTheme = (theme: string) => {
		vscode.postMessage({
			type: "setTheme",
			theme: theme
		})
	}

	// 点击设置
	const openSettings = () => {
		vscode.postMessage({
			type: "openSettings"
		})
		hideUsermenu()
	}

	// 点击登出
	const onLogout = () => {
		vscode.postMessage({
			type: "logout"
		})
		hideUsermenu()
	}

	// 点击登录
	const onLogin = () => {
		if (userInfo) {
			console.log("已经登录过了无须登录");
			return;
		}

		vscode.postMessage({
			type: "githubLogin"
		})
	}

	// 接受登录成功的回调用
	useWebviewListener("githubLoginSuccess", async () => {
		vscode.postMessage({
			type: "getGitHubSession"
		})
	})

	// 接受登出的回掉
	useWebviewListener("githubLogoutSuccess", async () => {
		setUserInfo(null)
	})

	return <div className='absolute inset-0'>
		<div className='absolute inset-0' onClick={hideUsermenu}></div>
		<div className='absolute w-[240px] h-[468px] right-[24px] top-[45px]'>
			<VscodeTheme
				style={{
					boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.25)"
				}}
				className='w-full h-full bg-background text-foreground rounded-[8px] border border-secondary'
			>
				<div className='pt-[16px]'>
					{/* 用户信息 */}
					<div className={cn(
						'flex h-[56px] items-center px-[16px] border-b border-secondary cursor-pointer',
						{ 'cursor-text': userInfo }
					)} onClick={onLogin}>
						<div className='w-[40px] h-[40px] rounded-full overflow-hidden'>
							{
								userInfo ? <img className='h-full w-full' src={`https://avatars.githubusercontent.com/u/${userInfo.id}`} alt="" />
									: <img className='h-full w-full' src={getVscExtensionPath('/src/assets/usermenu/default-avatar.png')} alt="" />
							}
						</div>
						<div className='w-[12px]'></div>
						{userInfo ? userInfo.label : t("notLoggedIn", { ns: "usermenu", defaultValue: "未登录" })}
					</div>
					{/* 用户菜单 */}
					<div
						ref={dropdownContiainerRef}
						className={css`
							div[data-radix-popper-content-wrapper] {
								&:first-of-type {
									position: relative !important;
									transform: none !important;
								}

								div[role="menuitem"][data-highlighted],
								div[role="menuitem"][data-state="open"] {
									${tw`text-foreground`};
									background-color: var(--vscode-activityBar-background);
								}
							}
						`}
					></div>
					<DropdownMenu open={open} modal={false}>
						<DropdownMenuTrigger className='w-full h-0'>.</DropdownMenuTrigger>
						<DropdownMenuContent
							container={dropdownContiainerRef.current!}
							className="w-[--radix-dropdown-menu-trigger-width] border-none !animate-none"
						>
							<DropdownMenuSub open={themeSubOpen} onOpenChange={setThemeSubOpen}>
								<DropdownMenuSubTrigger className='h-[48px] cursor-pointer' onClick={() => setThemeSubOpen(!themeSubOpen)}>
									{t("theme", { ns: "usermenu" })}
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal container={dropdownContiainerRef.current!}>
									<DropdownMenuSubContent className='!animate-none'>
										<DropdownMenuItem className='cursor-pointer' onClick={() => onSelectTheme("OrangePi Dark")}>{t("darkTheme", { ns: "theme" })}</DropdownMenuItem>
										<DropdownMenuItem className='cursor-pointer' onClick={() => onSelectTheme("OrangePi Light")}>{t("lightTheme", { ns: "theme" })}</DropdownMenuItem>
										<DropdownMenuItem className='cursor-pointer' onClick={() => onSelectTheme("OrangePi Orange")}>{t("orangeTheme", { ns: "theme" })}</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>

							<DropdownMenuSub open={languageSubOpen} onOpenChange={setLanguageSubOpen}>
								<DropdownMenuSubTrigger className='h-[48px] cursor-pointer' onClick={() => setLanguageSubOpen(!languageSubOpen)}>
									{t("language", { ns: "usermenu" })}
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal container={dropdownContiainerRef.current!}>
									<DropdownMenuSubContent className='!animate-none'>
										<DropdownMenuItem className='cursor-pointer' onClick={() => setLanguage("en")}>English</DropdownMenuItem>
										<DropdownMenuItem className='cursor-pointer' onClick={() => setLanguage("zh-CN")}>简体中文</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>

							<DropdownMenuSeparator className='m-0' />

							<DropdownMenuItem className='h-[48px] cursor-pointer' onClick={openSettings}>
								{t("settings", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px] cursor-pointer'>
								{t("keyboardShortcuts", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px] cursor-pointer'>
								{t("checkUpdate", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px] cursor-pointer'>
								{t("helpDocumentation", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px] cursor-pointer'>
								{t("contactUs", { ns: "usermenu" })}
							</DropdownMenuItem>

							<DropdownMenuSeparator className='m-0' />

							<DropdownMenuItem className='h-[48px] cursor-pointer' onClick={onLogout}>
								{t("logout", { ns: "usermenu" })}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</VscodeTheme>
		</div >
	</div >
}
