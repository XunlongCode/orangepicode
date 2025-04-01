import "./media/overlay.css";
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { OverlayPart } from './overlayPart.js';

export type OverlayOptions = {
	styles?: Record<string, string>;
	overlayId?: string;
}

export class Overlay extends Disposable {
	public overlayId: string = generateUuid();

	private overlayContainer: HTMLElement | undefined;
	private contentContainer: HTMLElement | undefined;
	private state: 'visible' | 'hidden' = 'hidden';
	private disposables = new DisposableStore();

	constructor(
		private readonly overlayPart: OverlayPart,
		private readonly viewId: string,
		private readonly options?: OverlayOptions
	) {
		super();

		if (options?.overlayId) {
			this.overlayId = options.overlayId;
		}
	}

	public resolveContent(): void {
		if (!this.overlayContainer || !this.contentContainer) {
			return;
		}
	}

	get isVisible(): boolean {
		return this.state === 'visible';
	}

	private updateStatus(state: typeof this.state) {
		this.state = state;
		if (state === "visible") {
			this.overlayPart.onDidOverlayVisibilityChange(true)
		} else if (state === "hidden") {
			this.overlayPart.onDidOverlayVisibilityChange(false)
		}
	}

	show(): void {
		if (this.state === 'visible') {
			return
		}
		// 显示overlay
		if (this.overlayContainer) {
			this.overlayContainer.classList.add("visible")
			this.overlayContainer.classList.add("active")
		}

		if (this.options?.styles) {
			this.setStyles(this.options.styles);
		}

		this.updateStatus("visible")
	}

	hide(): void {
		if (this.state === 'hidden') {
			return;
		}

		if (this.overlayContainer) {
			this.overlayContainer.classList.remove("visible")

			// 等待动画结束
			setTimeout(() => {
				if (this.overlayContainer && this.state === 'hidden') {
					this.overlayContainer.classList.remove("active")
					this.updateStatus("hidden")
				}
			}, 300);
		}
	}

	toggle(): void {
		if (this.state === 'visible') {
			this.hide();
		} else {
			this.show();
		}
	}

	setStyles(styles: Record<string, string>): void {
		if (!this.overlayContainer) {
			return;
		}

		// 应用样式到遮罩层
		Object.entries(styles).forEach(([key, value]) => {
			(this.overlayContainer!.style as any)[key] = value;
		});
	}

	clearStyles(): void {
		if (!this.overlayContainer) {
			return;
		}

		// 清除样式
		this.overlayContainer.removeAttribute("style")
	}

	override dispose(): void {
		this.disposables.dispose();
		super.dispose();
	}
}
