import "./media/overlay.css";
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { OverlayPart } from './overlayPart.js';
import { IOverlayWebview, WebviewExtensionDescription } from "../../../contrib/webview/browser/webview.js";
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { URI } from '../../../../base/common/uri.js';
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { WebviewView } from '../../../contrib/webviewView/browser/webviewViewService.js';
import { $, getActiveWindow } from '../../../../base/browser/dom.js';

export type OverlayOptions = {
	styles?: Record<string, string>;
	id?: string;
	pointerPass?: boolean; // 是否允许指针穿透
}

export class Overlay extends Disposable {
	public id: string = generateUuid();

	private overlayContainer: HTMLElement | undefined;
	private contentContainer: HTMLElement | undefined;
	private state: 'visible' | 'hidden' = 'hidden';
	private webviewView: WebviewView | undefined;
	private disposables = new DisposableStore();

	constructor(
		private readonly overlayPart: OverlayPart,
		private readonly viewId: string,
		public readonly options?: OverlayOptions
	) {
		super();

		if (options?.id) {
			this.id = options.id;
		}

		this.initialize()
	}

	private initialize() {
		if (!this.overlayPart.container) {
			return;
		}

		this.overlayContainer = $('div.overlay-container');
		this.overlayContainer.setAttribute('data-id', this.id);
		this.overlayContainer.setAttribute('data-view-id', this.viewId);

		this.contentContainer = $('div.overlay-content');
		this.overlayContainer.appendChild(this.contentContainer);

		this.overlayPart.container.appendChild(this.overlayContainer);
		this.resolveContent()
	}

	public createWebview(webview: IOverlayWebview) {
		webview.container.classList.add("overlay-webview");
		if (this.options?.pointerPass) {
			webview.container.classList.add("pointer-pass");
		}

		const webviewView: WebviewView = {
			webview,
			onDidChangeVisibility: () => {
				return { dispose: () => { } };
			},
			onDispose: () => {
				return { dispose: () => { } };
			},

			get title(): string | undefined {
				return undefined;
			},
			set title(value: string | undefined) { },

			get description(): string | undefined {
				return undefined;
			},
			set description(value: string | undefined) { },

			get badge() {
				return undefined;
			},
			set badge(badge) { },

			dispose: () => { },

			show: (preserveFocus) => { },
		};

		return webviewView
	}

	focus(): void {
		if (this.webviewView) {
			this.webviewView.webview.focus();
		}
	}

	public async resolveContent() {
		if (!this.overlayContainer || !this.contentContainer || !this.viewId) {
			return;
		}

		const extensionDescription: WebviewExtensionDescription = {
			id: new ExtensionIdentifier(this.viewId),
			location: URI.parse(""),
		}

		const webview = this.overlayPart._webviewService.createWebviewOverlay({
			title: undefined,
			options: {
				enableFindWidget: false,
			},
			contentOptions: {
				allowScripts: true,
				localResourceRoots: [],
			},
			extension: extensionDescription,
		});

		webview.claim(this, getActiveWindow(), undefined);

		this.webviewView = this.createWebview(webview);

		const source = new CancellationTokenSource(); // todo add to disposables
		await this.overlayPart._webviewViewService.resolve(
			this.viewId,
			this.webviewView,
			source.token,
		);

		if (this.contentContainer && this.webviewView) {
			this.layoutWebviewOverElement()
			this.focus()
		}
	}

	get isVisible(): boolean {
		return this.state === 'visible';
	}

	public layoutWebviewOverElement() {
		if (this.webviewView && this.contentContainer) {
			this.webviewView.webview.layoutWebviewOverElement(this.contentContainer);
		}
	}

	private updateStatus(state: typeof this.state) {
		this.state = state;
		this.overlayPart.onDidOverlayVisibilityChange();
	}

	show(): void {
		if (this.state === 'visible' || !this.webviewView?.webview || !this.overlayContainer || !this.contentContainer) {
			return
		}

		this.webviewView.webview.container.classList.add("active")

		// 显示overlay
		this.overlayContainer.classList.add("visible")
		this.overlayContainer.classList.add("active")

		// 显示content
		this.contentContainer.classList.add("visible")

		if (this.options?.styles) {
			this.setStyles(this.options.styles);
		}

		this.updateStatus("visible")

		this.layoutWebviewOverElement();
	}

	hide(): void {
		if (this.state === 'hidden') {
			return;
		}

		if (this.contentContainer) {
			this.contentContainer.classList.remove("visible")
		}

		if (this.overlayContainer) {
			this.overlayContainer.classList.remove("visible")

			// 等待动画结束
			setTimeout(() => {
				if (this.overlayContainer && this.webviewView) {
					this.webviewView.webview.container.classList.remove("active")
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

		// 应用自定义样式
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

	toJSON(): object {
		return {
			type: "overlay",
			id: this.id,
			viewId: this.viewId,
			state: this.state,
			isVisible: this.isVisible,
		};
	}
}
