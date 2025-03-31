import { Emitter } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Overlay } from './overlay.js';

// 定义服务接口
export const IOverlayService = createDecorator<IOverlayService>('overlayService');

export type CreateOverlayOptions = {
	viewId?: string;
	overlayId?: string;
	styles: Record<string, string>;
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
	show(overlayId: string): Overlay | null;

	/**
	 * 隐藏遮罩
	 */
	hide(overlayId: string): Overlay | null;

	/**
	 * 遮罩是否可见
	 */
	readonly isVisible: boolean;

	/**
	 * 遮罩可见性变化事件
	 */
	readonly onVisibilityChange: Emitter<boolean>;
}
