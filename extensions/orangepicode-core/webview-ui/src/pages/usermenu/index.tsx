import { FC, useEffect, useRef, useState } from 'react';
import VscodeTheme from '../../components/VscodeTheme';
import { getVscExtensionPath } from '../../utils';
import { vscode } from '../../utils/vscode';
import { css } from '@emotion/css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

export const Usermenu: FC = () => {
	const { t } = useTranslation()
	const dropdownContiainerRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (dropdownContiainerRef.current) {
			setOpen(true)
		}
	}, [dropdownContiainerRef.current])

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
					<div className='flex h-[56px] items-center px-[16px] border-b border-secondary'>
						<div className='w-[40px] h-[40px] rounded-full overflow-hidden'>
							<img className='h-full w-full' src={getVscExtensionPath('/src/assets/usermenu/default-avatar.png')} alt="" />
						</div>
						<div className='w-[12px]'></div>
						<div className='font-medium text-base'>用户名</div>
					</div>
					{/* 用户菜单 */}
					<div
						ref={dropdownContiainerRef}
						className={css`
							div[data-radix-popper-content-wrapper] {
								/* position: relative !important;
								transform: none !important; */
							}
						`}
					></div>
					<DropdownMenu open={open} modal={false}>
						<DropdownMenuTrigger className='w-full h-0'></DropdownMenuTrigger>
						<DropdownMenuContent
							container={dropdownContiainerRef.current!}
							className="w-[--radix-dropdown-menu-trigger-width] border-none !animate-none p-0"
						>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger className='h-[48px]'>
									{t("theme", { ns: "usermenu" })}
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal container={dropdownContiainerRef.current!}>
									<DropdownMenuSubContent>
										<DropdownMenuItem>{t("darkTheme", { ns: "theme" })}</DropdownMenuItem>
										<DropdownMenuItem>{t("lightTheme", { ns: "theme" })}</DropdownMenuItem>
										<DropdownMenuItem>{t("orangeTheme", { ns: "theme" })}</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger className='h-[48px]'>
									{t("language", { ns: "usermenu" })}
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal container={dropdownContiainerRef.current!}>
									<DropdownMenuSubContent>
										<DropdownMenuItem>English</DropdownMenuItem>
										<DropdownMenuItem>简体中文</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>

							<DropdownMenuSeparator className='m-0' />

							<DropdownMenuItem className='h-[48px]'>
								{t("settings", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px]'>
								{t("keyboardShortcuts", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px]'>
								{t("checkUpdate", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px]'>
								{t("helpDocumentation", { ns: "usermenu" })}
							</DropdownMenuItem>
							<DropdownMenuItem className='h-[48px]'>
								{t("contactUs", { ns: "usermenu" })}
							</DropdownMenuItem>

							<DropdownMenuSeparator className='m-0' />

							<DropdownMenuItem className='h-[48px]'>
								{t("logout", { ns: "usermenu" })}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</VscodeTheme>
		</div>
	</div>
}
