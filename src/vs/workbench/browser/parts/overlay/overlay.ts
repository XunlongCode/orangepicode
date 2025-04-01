import "./media/overlay.css";
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { OverlayPart } from './overlayPart.js';
import { IOverlayWebview, WebviewExtensionDescription } from "../../../contrib/webview/browser/webview.js";
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { URI } from '../../../../base/common/uri.js';
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { WebviewView } from '../../../contrib/webviewView/browser/webviewViewService.js';
import { $ } from '../../../../base/browser/dom.js';

export type OverlayOptions = {
	styles?: Record<string, string>;
	id?: string;
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
		private readonly options?: OverlayOptions
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

		this.webviewView = this.createWebview(webview);

		const source = new CancellationTokenSource(); // todo add to disposables
		await this.overlayPart._webviewViewService.resolve(
			this.viewId,
			this.webviewView,
			source.token,
		);
	}

	get isVisible(): boolean {
		return this.state === 'visible';
	}

	private updateStatus(state: typeof this.state) {
		this.state = state;
		this.overlayPart.onDidOverlayVisibilityChange();
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
				if (this.overlayContainer) {
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
