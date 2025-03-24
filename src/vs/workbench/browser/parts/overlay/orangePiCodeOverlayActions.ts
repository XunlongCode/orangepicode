import { registerAction2, Action2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IOrangePiCodeOverlayService } from "./orangePiCodeOverlayService.js";
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
			title: { value: "Close Overlay", original: "Close Overlay" },
			f1: true,
			keybinding: {
				weight: 200,
				primary: KeyCode.Escape,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		const OrangePiCodeOverlayService = accessor.get(IOrangePiCodeOverlayService);
		OrangePiCodeOverlayService.hide();
	}
}

export class ToggleOrangePiCodeOverlayAction extends Action2 {
	static readonly ID = "workbench.action.toggleOrangePiCodeOverlay";

	constructor() {
		super({
			id: ToggleOrangePiCodeOverlayAction.ID,
			title: { value: "Toggle Overlay", original: "Toggle Overlay" },
			f1: true,
			keybinding: {
				weight: 200,
				primary: KeyMod.CtrlCmd | KeyCode.KeyE,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		const OrangePiCodeOverlayService = accessor.get(IOrangePiCodeOverlayService);
		OrangePiCodeOverlayService.toggle();
	}
}

export class MarkOrangePiCodeOverlayFirstLaunchCompleteAction extends Action2 {
	static readonly ID = "workbench.action.markOrangePiCodeOverlayFirstLaunchComplete";

	constructor() {
		super({
			id: MarkOrangePiCodeOverlayFirstLaunchCompleteAction.ID,
			title: { value: "Mark Overlay First Launch Key Complete", original: "Mark Overlay First Launch Key Complete" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): void {
		const storageService = accessor.get(IStorageService);
		storageService.store(IS_FIRST_LAUNCH_KEY, true, 0, 0);
	}
}

export class ResetOrangePiCodeOverlayFirstLaunchKeyAction extends Action2 {
	static readonly ID = "workbench.action.resetOrangePiCodeOverlayFirstLaunchKey";

	constructor() {
		super({
			id: ResetOrangePiCodeOverlayFirstLaunchKeyAction.ID,
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

export class IsOrangePiCodeOverlayFirstLaunchAction extends Action2 {
	static readonly ID = "workbench.action.isOrangePiCodeOverlayFirstLaunch";

	constructor() {
		super({
			id: IsOrangePiCodeOverlayFirstLaunchAction.ID,
			title: { value: "Is Overlay First Launch", original: "Is Overlay First Launch" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): boolean | undefined {
		const storageService = accessor.get(IStorageService);
		return !storageService.getBoolean(IS_FIRST_LAUNCH_KEY, 0);
	}
}

registerAction2(ToggleOrangePiCodeOverlayAction);
registerAction2(CloseFirstLaunchOverlayAction);

registerAction2(MarkOrangePiCodeOverlayFirstLaunchCompleteAction);
registerAction2(ResetOrangePiCodeOverlayFirstLaunchKeyAction);
registerAction2(IsOrangePiCodeOverlayFirstLaunchAction);
