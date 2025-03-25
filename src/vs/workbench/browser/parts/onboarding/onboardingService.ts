/* eslint-disable header/header */

import {
	registerSingleton,
	InstantiationType,
} from "../../../../platform/instantiation/common/extensions.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import {
	createDecorator,
	IInstantiationService,
} from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ITerminalService } from "../../../contrib/terminal/browser/terminal.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { OnboardingPart } from './onboardingPart.js';

export const IOnboardingService = createDecorator<IOnboardingService>(
	"onboardingOverlayService",
);

export interface IOnboardingService extends IDisposable {
	readonly _serviceBrand: undefined;

	/**
	 * Returns the FirstLaunchOverlayPart instance.
	 */
	readonly pearOverlayPart: OnboardingPart;

	/**
	 * Shows the Overlay popup.
	 */
	show(): void;

	/**
	 * Hides the Overlay popup.
	 */
	hide(): void;

	/**
	 * Toggles the visibility of the Overlay popup.
	 */
	toggle(): void;

	/**
	 * Returns true if the Overlay popup is visible.
	 */
	isVisible(): boolean;

	/**
	 * Locks the Overlay popup.
	 */
	lock(): void;

	/**
	 * Unlocks the Overlay popup.
	 */
	unlock(): void;

	/**
	 * Returns true if the Overlay popup is locked.
	 */
	isLocked(): boolean;

	/**
	 * Hides the loading overlay message.
	 */
	hideOverlayLoadingMessage(): void;
}

export class OnboardingService
	extends Disposable
	implements IOnboardingService {
	declare readonly _serviceBrand: undefined;

	private readonly _pearOverlayPart: OnboardingPart;

	constructor(
		@IInstantiationService
		private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly _editorService: IEditorService,
		@ITerminalService private readonly _terminalService: ITerminalService,
		// @ICommandService private readonly commandService: ICommandService,
	) {
		super();
		this._pearOverlayPart =
			this.instantiationService.createInstance(OnboardingPart);
		this.registerListeners();
		this.registerCommands();
	}

	private registerListeners(): void {
		this._register(
			this._editorService.onDidActiveEditorChange(() => {
				this.hide();
			}),
		);

		this._register(
			this._terminalService.onDidFocusInstance(() => {
				this.hide();
			}),
		);
	}

	private registerCommands(): void {
		// Register commands for external use e.g. in onboarding submodule
		CommandsRegistry.registerCommand("onboarding.isOverlayVisible", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			return overlayService.isVisible();
		});

		CommandsRegistry.registerCommand("onboarding.showOverlay", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			overlayService.show();
		});

		CommandsRegistry.registerCommand("onboarding.hideOverlay", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			overlayService.hide();
		});

		CommandsRegistry.registerCommand("onboarding.toggleOverlay", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			overlayService.toggle();
		});

		CommandsRegistry.registerCommand("onboarding.lockOverlay", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			overlayService.lock();
		});

		CommandsRegistry.registerCommand("onboarding.unlockOverlay", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			overlayService.unlock();
		});

		CommandsRegistry.registerCommand("onboarding.isOverlayLocked", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			return overlayService.isLocked();
		});

		CommandsRegistry.registerCommand("onboarding.hideOverlayLoadingMessage", (accessor) => {
			const overlayService = accessor.get(IOnboardingService);
			overlayService.hideOverlayLoadingMessage();
		});
	}

	get pearOverlayPart(): OnboardingPart {
		return this._pearOverlayPart;
	}

	show(): void {
		this._pearOverlayPart.show();
	}

	hide(): void {
		this._pearOverlayPart.hide();
	}

	hideOverlayLoadingMessage(): void {
		this._pearOverlayPart.hideOverlayLoadingMessage();
	}

	toggle(): void {
		this._pearOverlayPart.toggle();
	}

	lock(): void {
		this._pearOverlayPart.lock();
	}

	unlock(): void {
		this._pearOverlayPart.unlock();
	}

	isLocked(): boolean {
		return this._pearOverlayPart.isLocked;
	}

	override dispose(): void {
		super.dispose();
		this._pearOverlayPart.dispose();
	}

	isVisible(): boolean {
		return this._pearOverlayPart.isVisible();
	}
}

registerSingleton(
	IOnboardingService,
	OnboardingService,
	InstantiationType.Eager,
);
