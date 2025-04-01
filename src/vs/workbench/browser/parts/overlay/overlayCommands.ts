
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOverlayService } from './overlayService.js';

export const CREATE_OVERLAY_COMMAND_ID = 'workbench.action.createOverlay';
export const SHOW_OVERLAY_COMMAND_ID = 'workbench.action.showOverlay';
export const HIDE_OVERLAY_COMMAND_ID = 'workbench.action.hideOverlay';

// 注册命令
export function registerOverlayCommands() {
	// 创建新遮罩
	CommandsRegistry.registerCommand({
		id: CREATE_OVERLAY_COMMAND_ID,
		handler: (accessor: ServicesAccessor, options?: Parameters<IOverlayService['createOverlay']>[0]) => {
			const overlayService = accessor.get(IOverlayService);
			overlayService.createOverlay(options);
		}
	});

	// 显示遮罩
	CommandsRegistry.registerCommand({
		id: SHOW_OVERLAY_COMMAND_ID,
		handler: (accessor: ServicesAccessor, viewId: string) => {
			const overlayService = accessor.get(IOverlayService);
			overlayService.show(viewId);
		}
	});

	// 隐藏遮罩
	CommandsRegistry.registerCommand({
		id: HIDE_OVERLAY_COMMAND_ID,
		handler: (accessor: ServicesAccessor, viewId: string) => {
			const overlayService = accessor.get(IOverlayService);
			overlayService.hide(viewId);
		}
	});
}
