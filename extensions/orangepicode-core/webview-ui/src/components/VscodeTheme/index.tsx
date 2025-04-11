import { FC, PropsWithChildren, useMemo } from "react";
import { useCssVar } from "../../hooks/useCssVar";
import tinycolor from "tinycolor2";
import { round } from "lodash-es";
import { cn } from '../../lib/utils';
import { useVscHlTheme } from '../../hooks/useVscHlTheme';

const convertToHslValue = (value?: string, defaultValue?: string) => {
	if (!value) {
		return defaultValue;
	}

	const c = tinycolor(value);
	if (!c.isValid()) {
		return defaultValue;
	}

	const { h, s, l } = c.toHsl();
	return `${round(h, 1)} ${round(s * 100, 1)}% ${round(l * 100, 1)}%`;
}

const VscodeTheme: FC<PropsWithChildren & { className?: string, style?: React.CSSProperties }> = ({
	children,
	className,
	style,
}) => {
	const background = useCssVar({ name: "--vscode-editor-background" });
	const foreground = useCssVar({ name: "--vscode-editor-foreground" });
	const card = useCssVar({ name: "--vscode-editor-background" });
	const cardForeground = useCssVar({ name: "--vscode-editor-foreground" });
	const popover = useCssVar({ name: "--vscode-editor-background" });
	const popoverForeground = useCssVar({ name: "--vscode-editor-foreground" });
	const primary = useCssVar({ name: "--vscode-button-background" });
	const primaryForeground = useCssVar({ name: "--vscode-button-foreground" });
	const secondary = useCssVar({ name: "--vscode-list-hoverBackground" });
	const secondaryForeground = useCssVar({ name: "--vscode-editor-foreground" });
	const muted = useCssVar({ name: "--vscode-list-hoverBackground" });
	const mutedForeground = useCssVar({ name: "--vscode-descriptionForeground" });
	const accent = useCssVar({ name: "--vscode-list-hoverBackground" });
	const accentForeground = useCssVar({ name: "--vscode-editor-foreground" });
	const destructive = useCssVar({ name: "--destructive" });
	const destructiveForeground = useCssVar({ name: "--destructive-foreground" });
	const border = useCssVar({ name: "--vscode-input-border" });
	const input = useCssVar({ name: "--vscode-input-border" });
	const ring = useCssVar({ name: "--vscode-focusBorder" });
	const chart1 = useCssVar({ name: "--chart-1" });
	const chart2 = useCssVar({ name: "--chart-2" });
	const chart3 = useCssVar({ name: "--chart-3" });
	const chart4 = useCssVar({ name: "--chart-4" });
	const chart5 = useCssVar({ name: "--chart-5" });
	const radius = useCssVar({ name: "--radius" });
	const sidebarBackground = useCssVar({ name: "--vscode-editor-background" });
	const sidebarForeground = useCssVar({ name: "--vscode-editor-foreground" });
	const sidebarPrimary = useCssVar({ name: "--vscode-button-background" });
	const sidebarPrimaryForeground = useCssVar({ name: "--vscode-button-foreground" });
	const sidebarAccent = useCssVar({ name: "--vscode-list-hoverBackground" });
	const sidebarAccentForeground = useCssVar({ name: "--vscode-editor-foreground" });
	const sidebarBorder = useCssVar({ name: "--vscode-input-border" });
	const sidebarRing = useCssVar({ name: "--vscode-focusBorder" });
	const menubackground = useCssVar({ name: "--vscode-menu-background" });
	const menuforeground = useCssVar({ name: "--vscode-menu-foreground" });
	const menuseparatorBackground = useCssVar({ name: "--vscode-menu-separatorBackground" });
	const menuborder = useCssVar({ name: "--vscode-menu-border" });
	const menuselectionBackground = useCssVar({ name: "--vscode-menu-selectionBackground" });
	const menuselectionForeground = useCssVar({ name: "--vscode-menu-selectionForeground" });

	const theme = useVscHlTheme()

	const themeVariables = useMemo(() => {
		return {
			"--background": convertToHslValue(background.get(), "0 0% 100%"),
			"--foreground": convertToHslValue(foreground.get(), "0 0% 3.9%"),
			"--card": convertToHslValue(card.get(), "0 0% 100%"),
			"--card-foreground": convertToHslValue(cardForeground.get(), "0 0% 3.9%"),
			"--popover": convertToHslValue(popover.get(), "0 0% 100%"),
			"--popover-foreground": convertToHslValue(
				popoverForeground.get(),
				"0 0% 3.9%"
			),
			"--primary": convertToHslValue(primary.get(), "0 0% 9%"),
			"--primary-foreground": convertToHslValue(
				primaryForeground.get(),
				"0 0% 98%"
			),
			"--secondary": convertToHslValue(secondary.get(), "0 0% 96.1%"),
			"--secondary-foreground": convertToHslValue(
				secondaryForeground.get(),
				"0 0% 9%"
			),
			"--muted": convertToHslValue(muted.get(), "0 0% 96.1%"),
			"--muted-foreground": convertToHslValue(
				mutedForeground.get(),
				"0 0% 45.1%"
			),
			"--accent": convertToHslValue(accent.get(), "0 0% 96.1%"),
			"--accent-foreground": convertToHslValue(
				accentForeground.get(),
				"0 0% 9%"
			),
			"--destructive": convertToHslValue(destructive.get(), "0 84.2% 60.2%"),
			"--destructive-foreground": convertToHslValue(
				destructiveForeground.get(),
				"0 0% 98%"
			),
			"--border": convertToHslValue(border.get(), "0 0% 89.8%"),
			"--input": convertToHslValue(input.get(), "0 0% 89.8%"),
			"--ring": convertToHslValue(ring.get(), "0 0% 3.9%"),
			"--chart-1": convertToHslValue(chart1.get(), "12 76% 61%"),
			"--chart-2": convertToHslValue(chart2.get(), "173 58% 39%"),
			"--chart-3": convertToHslValue(chart3.get(), "197 37% 24%"),
			"--chart-4": convertToHslValue(chart4.get(), "43 74% 66%"),
			"--chart-5": convertToHslValue(chart5.get(), "27 87% 67%"),
			"--radius": radius.get() ?? "0.5rem",
			"--sidebar-background": convertToHslValue(sidebarBackground.get(), "0 0% 98%"),
			"--sidebar-foreground": convertToHslValue(sidebarForeground.get(), "240 5.3% 26.1%"),
			"--sidebar-primary": convertToHslValue(sidebarPrimary.get(), "240 5.9% 10%"),
			"--sidebar-primary-foreground": convertToHslValue(sidebarPrimaryForeground.get(), "0 0% 98%"),
			"--sidebar-accent": convertToHslValue(sidebarAccent.get(), "240 4.8% 95.9%"),
			"--sidebar-accent-foreground": convertToHslValue(sidebarAccentForeground.get(), "240 5.9% 10%"),
			"--sidebar-border": convertToHslValue(sidebarBorder.get(), "220 13% 91%"),
			"--sidebar-ring": convertToHslValue(sidebarRing.get(), "217.2 91.2% 59.8%"),
			"--menu-background": convertToHslValue(menubackground.get(), "0 0% 98%"),
			"--menu-foreground": convertToHslValue(menuforeground.get(), "0 0% 98%"),
			"--menu-separatorBackground": convertToHslValue(menuseparatorBackground.get(), "0 0% 98%"),
			"--menu-border": convertToHslValue(menuborder.get(), "0 0% 98%"),
			"--menu-selectionBackground": convertToHslValue(menuselectionBackground.get(), "0 0% 98%"),
			"--menu-selectionForeground": convertToHslValue(menuselectionForeground.get(), "0 0% 98%"),
		};
	}, [
		background,
		foreground,
		card,
		cardForeground,
		popover,
		popoverForeground,
		primary,
		primaryForeground,
		secondary,
		secondaryForeground,
		muted,
		mutedForeground,
		accent,
		accentForeground,
		destructive,
		destructiveForeground,
		border,
		input,
		ring,
		chart1,
		chart2,
		chart3,
		chart4,
		chart5,
		radius,
		sidebarBackground,
		sidebarForeground,
		sidebarPrimary,
		sidebarPrimaryForeground,
		sidebarAccent,
		sidebarAccentForeground,
		sidebarBorder,
		sidebarRing,
		theme,
		menubackground,
		menuforeground,
		menuseparatorBackground,
		menuborder,
		menuselectionBackground,
		menuselectionForeground,
	]);

	return (
		<div style={{ ...themeVariables, ...style }} className={cn(className, "h-full w-full")}>
			{children}
		</div>
	);
};

export default VscodeTheme;
