import { Disposable } from '../../../../base/common/lifecycle.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator, IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Overlay } from './overlay.js';
import { OverlayPart } from './overlayPart.js';

// 定义服务接口
export const IOverlayService = createDecorator<IOverlayService>('overlayService');

export type CreateOverlayOptions = {
	id?: string;
	viewId?: string;
	styles?: Record<string, string>;
	pointerPass?: boolean // 是否允许指针穿透
}

export interface IOverlayService {
	readonly _serviceBrand: undefined;

	/**
	 * 创建遮罩
	 * */
	createOverlay(options?: CreateOverlayOptions): Overlay | null;
	/**
	 * 显示遮罩
	 */
	show(id: string): Overlay | null;

	/**
	 * 隐藏遮罩
	 */
	hide(id: string): Overlay | null;

	/**
	 * 切换遮罩
	 */
	toggle(id: string): Overlay | null;

	/**
	 * 遮罩是否可见
	 */
	readonly isVisible: boolean;
}

export class OverlayService
	extends Disposable
	implements IOverlayService {
	declare readonly _serviceBrand: undefined;

	private readonly _overlayPart: OverlayPart;


	constructor(
		@IInstantiationService
		private readonly instantiationService: IInstantiationService,
	) {
		super();
		this._overlayPart =
			this.instantiationService.createInstance(OverlayPart);

	}

	get overlayPart(): OverlayPart {
		return this._overlayPart;
	}

	createOverlay(options?: CreateOverlayOptions) {
		return this._overlayPart.createOverlay(options);
	}

	show(viewId: string) {
		return this._overlayPart.show(viewId);
	}

	hide(viewId: string) {
		return this._overlayPart.hide(viewId);
	}

	toggle(viewId: string) {
		return this._overlayPart.toggle(viewId);
	}

	override dispose(): void {
		super.dispose();
		this._overlayPart.dispose();
	}

	get isVisible() {
		return this._overlayPart.isVisible
	}
}

registerSingleton(
	IOverlayService,
	OverlayService,
	InstantiationType.Eager,
);
