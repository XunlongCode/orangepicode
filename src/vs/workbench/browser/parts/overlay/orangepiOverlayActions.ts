import { registerAction2, Action2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IOrangePiOverlayService } from "./orangepiOverlayService.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IS_FIRST_LAUNCH_KEY } from "./common.js";
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';

export class CloseFirstLaunchOverlayAction extends Action2 {
	static readonly ID = "workbench.action.closeOverlay";

	constructor() {
		super({
			id: CloseFirstLaunchOverlayAction.ID,
			title: { value: "Close Overlay Popup", original: "Close Overlay Popup" },
			f1: true,
			keybinding: {
				weight: 200,
				primary: KeyCode.Escape,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		const orangepiOverlayService = accessor.get(IOrangePiOverlayService);
		orangepiOverlayService.hide();
	}
}

export class ToggleOrangePiOverlayAction extends Action2 {
	static readonly ID = "workbench.action.toggleOrangePi";

	constructor() {
		super({
			id: ToggleOrangePiOverlayAction.ID,
			title: { value: "Toggle Overlay Popup", original: "Toggle Overlay Popup" },
			f1: true,
			keybinding: {
				weight: 200,
				primary: KeyMod.CtrlCmd | KeyCode.KeyE,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		const orangepiOverlayService = accessor.get(IOrangePiOverlayService);
		orangepiOverlayService.toggle();
	}
}

export class MarkOrangePiFirstLaunchCompleteAction extends Action2 {
	static readonly ID = "workbench.action.markOrangePiFirstLaunchComplete";

	constructor() {
		super({
			id: MarkOrangePiFirstLaunchCompleteAction.ID,
			title: { value: "Mark Overlay First Launch Key Complete", original: "Mark Overlay First Launch Key Complete" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): void {
		const storageService = accessor.get(IStorageService);
		storageService.store(IS_FIRST_LAUNCH_KEY, true, 0, 0);
		// const notificationService = accessor.get(INotificationService);
		// const commandService = accessor.get(ICommandService);  // Get command service early
		// notificationService.notify({
		// 	severity: Severity.Info,
		// 	message: 'Successfully marked Overlay first launch Key complete',
		// 	actions: {
		// 		primary: [{
		// 			id: 'reloadWindow',
		// 			label: 'Reload Window',
		// 			tooltip: 'Reload Window',
		// 			class: '',
		// 			enabled: true,
		// 			run: () => {
		// 				commandService.executeCommand('workbench.action.reloadWindow');
		// 			}
		// 		}]
		// 	}
		// });
	}
}

export class ResetOrangePiFirstLaunchKeyAction extends Action2 {
	static readonly ID = "workbench.action.resetOrangePiFirstLaunchKey";

	constructor() {
		super({
			id: ResetOrangePiFirstLaunchKeyAction.ID,
			title: { value: "Reset Overlay First Launch Key", original: "Reset Overlay First Launch Key" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): void {
		const storageService = accessor.get(IStorageService);
		const notificationService = accessor.get(INotificationService);
		const commandService = accessor.get(ICommandService);  // Get command service early

		storageService.store(IS_FIRST_LAUNCH_KEY, false, 0, 0);
		notificationService.notify({
			severity: Severity.Info,
			message: 'Successfully reset Overlay first launch Key',
			actions: {
				primary: [{
					id: 'reloadWindow',
					label: 'Reload Window',
					tooltip: 'Reload Window',
					class: '',
					enabled: true,
					run: () => {
						commandService.executeCommand('workbench.action.reloadWindow');
					}
				}]
			}
		});
	}
}

export class IsOrangePiFirstLaunchAction extends Action2 {
	static readonly ID = "workbench.action.isOrangePiFirstLaunch";

	constructor() {
		super({
			id: IsOrangePiFirstLaunchAction.ID,
			title: { value: "Is Overlay First Launch", original: "Is Overlay First Launch" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): boolean | undefined {
		const storageService = accessor.get(IStorageService);
		return !storageService.getBoolean(IS_FIRST_LAUNCH_KEY, 0);
	}
}

registerAction2(ToggleOrangePiOverlayAction);
registerAction2(CloseFirstLaunchOverlayAction);

registerAction2(MarkOrangePiFirstLaunchCompleteAction);
registerAction2(ResetOrangePiFirstLaunchKeyAction);
registerAction2(IsOrangePiFirstLaunchAction);
