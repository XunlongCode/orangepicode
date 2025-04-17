import './media/overlayPart.css';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchLayoutService, Parts } from '../../../services/layout/browser/layoutService.js';
import { Part } from '../../part.js';
import { Emitter } from '../../../../base/common/event.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Overlay } from './overlay.js';
import { CreateOverlayOptions, IOverlayService } from './overlayService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { WebviewService } from '../../../contrib/webview/browser/webviewService.js';
import { IWebviewViewService } from '../../../contrib/webviewView/browser/webviewViewService.js';
import { $, append } from '../../../../base/browser/dom.js';

// 定义上下文键
export const OverlayVisibleContext = 'overlayVisible';

export class OverlayPart extends Part implements IOverlayService {
	static readonly ID = Parts.ORANGEPICODE_OVERLAY_PART;

	readonly _serviceBrand: undefined;

	override minimumWidth: number = 0;
	override minimumHeight: number = 0;
	override maximumWidth: number = Number.MAX_VALUE;
	override maximumHeight: number = Number.MAX_VALUE;

	public _webviewService: WebviewService;
	public container: HTMLElement | undefined;
	private overlayMap: Map<string, Overlay> = new Map<string, Overlay>()

	readonly onVisibilityChange = new Emitter<boolean>();

	private overlayVisibleContextKey: any;

	private _isVisible: boolean = false;

	constructor(
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IWebviewViewService
		public readonly _webviewViewService: IWebviewViewService,
		@IInstantiationService
		public readonly _instantiationService: IInstantiationService,
	) {
		super(
			OverlayPart.ID,
			{ hasTitle: false },
			themeService,
			storageService,
			layoutService
		);

		this._webviewService =
			this._instantiationService.createInstance(WebviewService);

		// 是否可见上下文
		this.overlayVisibleContextKey = this.contextKeyService.createKey(OverlayVisibleContext, false);
	}

	get isVisible(): boolean {
		return this._isVisible;
	}

	protected override createContentArea(parent: HTMLElement): HTMLElement {
		const element = append(parent, $('div.overlay-part'))
		// 创建覆盖整个VSCode的遮罩容器
		this.container = element;

		this.container.onclick = () => {
			this.hideAllOverlay();
		}

		return this.container;
	}

	override layout(width: number, height: number, top: number, left: number): void {
		super.layout(width, height, top, left);

		if (this.container) {
			this.container.style.width = `${width}px`;
			this.container.style.height = `${height}px`;
		}

		for (const overlay of this.overlayMap.values()) {
			if (overlay.isVisible) {
				overlay.layoutWebviewOverElement();
			}
		}
	}

	public createOverlay(options?: CreateOverlayOptions): Overlay | null {
		if (!this.container) {
			return null;
		}

		if (options?.id && this.overlayMap.has(options.id)) {
			return this.overlayMap.get(options.id)!;
		}

		const viewId = options?.viewId ?? "";
		const id = options?.id;
		const styles = options?.styles;

		const overlay = new Overlay(this, viewId, { styles, id, pointerPass: options?.pointerPass });
		this.overlayMap.set(overlay.id, overlay);
		return overlay;
	}

	public updateOverlayPointerEvents() {
		if (!this.container) {
			return;
		}

		for (const overlay of this.overlayMap.values()) {
			if (overlay.isVisible && overlay.options?.pointerPass) {
				this.container.classList.add('pointer-pass');
				return
			}
		}
		this.container.classList.remove('pointer-pass');
	}

	public show(id: string) {
		const overlay = this.overlayMap.get(id);
		if (overlay) {
			overlay.show();
			return overlay;
		}
		return null;
	}

	public hide(id: string) {
		const overlay = this.overlayMap.get(id);
		if (overlay) {
			overlay.hide();
			return overlay;
		}
		return null;
	}

	public toggle(id: string) {
		const overlay = this.overlayMap.get(id);
		if (overlay) {
			if (overlay.isVisible) {
				this.hide(id);
			} else {
				this.show(id);
			}
			return overlay;
		}
		return null;
	}

	public hideAllOverlay() {
		for (const overlay of this.overlayMap.values()) {
			this.hide(overlay.id);
		}
	}

	public onDidOverlayVisibilityChange() {
		let isVisible = false
		for (const overlay of this.overlayMap.values()) {
			if (overlay.isVisible) {
				isVisible = true;
				break;
			}
		}
		this._isVisible = isVisible;

		if (this.isVisible) {
			this.container?.classList.add('active');
		} else {
			this.container?.classList.remove('active');
		}

		this.updateOverlayPointerEvents();
		this.overlayVisibleContextKey.set(this.isVisible);
		this.onVisibilityChange.fire(this.isVisible);
	}

	public onDidClearOverlayMap() {
		this.overlayMap.clear();
		this.onDidOverlayVisibilityChange();

		if (this.container) {
			this.container.innerText = ""
		}
	}

	override dispose(): void {
		this.overlayMap.forEach(d => d.dispose());
		this.onDidClearOverlayMap()
		this.onVisibilityChange.dispose();
		super.dispose();
	}

	toJSON(): object {
		return {
			type: Parts.ORANGEPICODE_OVERLAY_PART,
		};
	}
}
