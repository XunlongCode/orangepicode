import { registerAction2, Action2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IOnboardingService } from "./onboardingService.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IS_ONBOARDING_COMPLETED_KEY } from "./common.js";
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';

export class CloseOnboardingAction extends Action2 {
	static readonly ID = "workbench.action.closeOnboarding";

	constructor() {
		super({
			id: CloseOnboardingAction.ID,
			title: { value: "Close onboarding", original: "Close onboarding" },
			f1: true,
			keybinding: {
				weight: 200,
				primary: KeyCode.Escape,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		const OnboardingService = accessor.get(IOnboardingService);
		OnboardingService.hide();
	}
}

export class ToggleOnboardingAction extends Action2 {
	static readonly ID = "workbench.action.toggleOnboarding";

	constructor() {
		super({
			id: ToggleOnboardingAction.ID,
			title: { value: "Toggle onboarding", original: "Toggle onboarding" },
			f1: true,
			keybinding: {
				weight: 200,
				primary: KeyMod.CtrlCmd | KeyCode.KeyE,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		const OnboardingService = accessor.get(IOnboardingService);
		OnboardingService.toggle();
	}
}

export class MarkOnboardingCompletedAction extends Action2 {
	static readonly ID = "workbench.action.markOnboardingCompleted";

	constructor() {
		super({
			id: MarkOnboardingCompletedAction.ID,
			title: { value: "Mark onboarding complete", original: "Mark onboarding complete" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): void {
		const storageService = accessor.get(IStorageService);
		storageService.store(IS_ONBOARDING_COMPLETED_KEY, true, 0, 0);
	}
}

export class ResetOnboardingCompletedKeyAction extends Action2 {
	static readonly ID = "workbench.action.resetOnboardingCompletedKey";

	constructor() {
		super({
			id: ResetOnboardingCompletedKeyAction.ID,
			title: { value: "Reset onboarding complete key", original: "Reset onboarding complete key" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): void {
		const storageService = accessor.get(IStorageService);
		const notificationService = accessor.get(INotificationService);
		const commandService = accessor.get(ICommandService);  // Get command service early

		storageService.store(IS_ONBOARDING_COMPLETED_KEY, false, 0, 0);
		notificationService.notify({
			severity: Severity.Info,
			message: 'Successfully reset onboarding complete key',
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

export class IsOnboardingCompletedAction extends Action2 {
	static readonly ID = "workbench.action.isOnboardingCompleted";

	constructor() {
		super({
			id: IsOnboardingCompletedAction.ID,
			title: { value: "Is onboarding complete", original: "Is onboarding complete" },
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): boolean | undefined {
		const storageService = accessor.get(IStorageService);
		return !storageService.getBoolean(IS_ONBOARDING_COMPLETED_KEY, 0);
	}
}

registerAction2(ToggleOnboardingAction);
registerAction2(CloseOnboardingAction);

registerAction2(MarkOnboardingCompletedAction);
registerAction2(ResetOnboardingCompletedKeyAction);
registerAction2(IsOnboardingCompletedAction);
