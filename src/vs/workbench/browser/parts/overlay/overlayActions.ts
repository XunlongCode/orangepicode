
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { CreateOverlayOptions, IOverlayService } from './overlayService.js';

export const CREATE_OVERLAY_COMMAND_ID = 'workbench.action.createOverlay';
export const SHOW_OVERLAY_COMMAND_ID = 'workbench.action.showOverlay';
export const HIDE_OVERLAY_COMMAND_ID = 'workbench.action.hideOverlay';
export const TOGGLE_OVERLAY_COMMAND_ID = 'workbench.action.toggleOverlay';

export class CreateOverlayAction extends Action2 {
	static readonly ID = CREATE_OVERLAY_COMMAND_ID;

	constructor() {
		super({
			id: CreateOverlayAction.ID,
			title: { value: "Create Overlay", original: "Create Overlay" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor, options: CreateOverlayOptions) {
		console.log("CreateOverlayAction.run");
		const overlayService = accessor.get(IOverlayService);
		console.log(overlayService);
		return overlayService.createOverlay(options)
	}
}

export class ShowOverlayAction extends Action2 {
	static readonly ID = SHOW_OVERLAY_COMMAND_ID;

	constructor() {
		super({
			id: ShowOverlayAction.ID,
			title: { value: "Show Overlay", original: "Show Overlay" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor, viewId: string) {
		const overlayService = accessor.get(IOverlayService);
		return overlayService.show(viewId)
	}
}

export class HideOverlayAction extends Action2 {
	static readonly ID = HIDE_OVERLAY_COMMAND_ID;

	constructor() {
		super({
			id: HideOverlayAction.ID,
			title: { value: "Hide Overlay", original: "Hide Overlay" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor, viewId: string) {
		const overlayService = accessor.get(IOverlayService);
		return overlayService.hide(viewId)
	}
}


export class ToggleOverlayAction extends Action2 {
	static readonly ID = TOGGLE_OVERLAY_COMMAND_ID;

	constructor() {
		super({
			id: ToggleOverlayAction.ID,
			title: { value: "Toggle Overlay", original: "Toggle Overlay" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor, viewId: string) {
		const overlayService = accessor.get(IOverlayService);
		return overlayService.toggle(viewId)
	}
}

registerAction2(CreateOverlayAction);
registerAction2(ShowOverlayAction);
registerAction2(HideOverlayAction);
registerAction2(ToggleOverlayAction);
