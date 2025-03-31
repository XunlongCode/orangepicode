import './media/overlayPart.css';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchLayoutService, Parts } from '../../../services/layout/browser/layoutService.js';
import { Part } from '../../part.js';
import { Emitter } from '../../../../base/common/event.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Overlay } from './overlay.js';
import { CreateOverlayOptions, IOverlayService } from './overlayService.js';
import { generateUuid } from '../../../../base/common/uuid.js';

class OverlayMap extends Map implements Map<string, Overlay> {

	constructor(
		private readonly overlayPart: OverlayPart,
	) {
		super();
	}

	override set(key: string, value: Overlay): this {
		super.set(key, value);
		this.overlayPart.updateVisibility();
		return this;
	}

	override delete(key: string): boolean {
		const ok = super.delete(key);
		this.overlayPart.updateVisibility();
		return ok
	}

	override clear(): void {
		super.clear();
		this.overlayPart.updateVisibility();
	}
}

// 定义上下文键
export const OverlayVisibleContext = 'overlayVisible';

export class OverlayPart extends Part implements IOverlayService {
	static readonly ID = Parts.ORANGEPICODE_OVERLAY_PART;

	readonly _serviceBrand: undefined;

	override minimumWidth: number = 0;
	override minimumHeight: number = 0;
	override maximumWidth: number = Number.MAX_VALUE;
	override maximumHeight: number = Number.MAX_VALUE;

	private partContainer: HTMLElement | undefined;
	private overlaySet: OverlayMap = new OverlayMap(this)

	readonly onVisibilityChange = new Emitter<boolean>();

	private overlayVisibleContextKey: any;

	public isVisible: boolean = false;

	constructor(
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService
	) {
		super(
			OverlayPart.ID,
			{ hasTitle: false },
			themeService,
			storageService,
			layoutService
		);

		// 是否可见上下文
		this.overlayVisibleContextKey = this.contextKeyService.createKey(OverlayVisibleContext, false);
	}

	protected override createContentArea(element: HTMLElement): HTMLElement {
		// 创建覆盖整个VSCode的遮罩容器
		this.partContainer = element;
		this.partContainer.classList.add('overlay-part');
		return this.partContainer;
	}

	override layout(width: number, height: number, top: number, left: number): void {
		super.layout(width, height, top, left);

		if (this.partContainer) {
			this.partContainer.style.width = `${width}px`;
			this.partContainer.style.height = `${height}px`;
		}
	}

	public updateVisibility(): void {
		let isVisible = false;
		for (const overlay of this.overlaySet) {
			if (overlay instanceof Overlay && overlay.isVisible) {
				isVisible = true;
				break;
			}
		}

		this.isVisible = isVisible;

		if (this.isVisible) {
			this.partContainer?.classList.add('active');
		} else {
			this.partContainer?.classList.remove('active');
		}

		this.overlayVisibleContextKey.set(this.isVisible);
		this.onVisibilityChange.fire(this.isVisible);
	}

	public createOverlay(options?: CreateOverlayOptions): Overlay | null {
		if (!this.partContainer) {
			return null;
		}

		const viewId = options?.viewId ?? generateUuid();
		const overlayId = options?.overlayId;
		const styles = options?.styles;

		const overlay = new Overlay(this.partContainer!, viewId, { styles, overlayId });
		this.overlaySet.set(overlay.overlayId, overlay);
		return overlay;
	}

	public show(overlayId: string) {
		const overlay = this.overlaySet.get(overlayId);
		if (overlay) {
			overlay.show();
			return overlay;
		}
		return null;
	}

	public hide(overlayId: string) {
		const overlay = this.overlaySet.get(overlayId);
		if (overlay) {
			overlay.hide();
			return overlay;
		}
		return null;
	}

	override dispose(): void {
		this.overlaySet.forEach(d => d.dispose());
		this.onVisibilityChange.dispose();
		super.dispose();
	}

	toJSON(): object {
		return {
			type: Parts.ORANGEPICODE_OVERLAY_PART,
		};
	}
}
