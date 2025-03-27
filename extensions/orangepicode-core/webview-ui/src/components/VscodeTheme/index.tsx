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

const VscodeTheme: FC<PropsWithChildren & { className?: string }> = ({
	children,
	className,
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
		theme
	]);

	return (
		<div style={themeVariables} className={cn(className, "h-full w-full")}>
			{children}
		</div>
	);
};

export default VscodeTheme;
