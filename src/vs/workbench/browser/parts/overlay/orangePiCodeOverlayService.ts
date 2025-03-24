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
import { OrangePiCodeOverlayPart } from './orangePiCodeOverlayPart.js';

export const IOrangePiCodeOverlayService = createDecorator<IOrangePiCodeOverlayService>(
	"orangepicodeoverlayOverlayService",
);

export interface IOrangePiCodeOverlayService extends IDisposable {
	readonly _serviceBrand: undefined;

	/**
	 * Returns the FirstLaunchOverlayPart instance.
	 */
	readonly pearOverlayPart: OrangePiCodeOverlayPart;

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

export class OrangePiCodeOverlayService
	extends Disposable
	implements IOrangePiCodeOverlayService {
	declare readonly _serviceBrand: undefined;

	private readonly _pearOverlayPart: OrangePiCodeOverlayPart;

	constructor(
		@IInstantiationService
		private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly _editorService: IEditorService,
		@ITerminalService private readonly _terminalService: ITerminalService,
		// @ICommandService private readonly commandService: ICommandService,
	) {
		super();
		this._pearOverlayPart =
			this.instantiationService.createInstance(OrangePiCodeOverlayPart);
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
		// Register commands for external use e.g. in orangepicodeoverlay submodule
		CommandsRegistry.registerCommand("orangepicodeoverlay.isOverlayVisible", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			return overlayService.isVisible();
		});

		CommandsRegistry.registerCommand("orangepicodeoverlay.showOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			overlayService.show();
		});

		CommandsRegistry.registerCommand("orangepicodeoverlay.hideOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			overlayService.hide();
		});

		CommandsRegistry.registerCommand("orangepicodeoverlay.toggleOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			overlayService.toggle();
		});

		CommandsRegistry.registerCommand("orangepicodeoverlay.lockOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			overlayService.lock();
		});

		CommandsRegistry.registerCommand("orangepicodeoverlay.unlockOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			overlayService.unlock();
		});

		CommandsRegistry.registerCommand("orangepicodeoverlay.isOverlayLocked", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			return overlayService.isLocked();
		});

		CommandsRegistry.registerCommand("orangepicodeoverlay.hideOverlayLoadingMessage", (accessor) => {
			const overlayService = accessor.get(IOrangePiCodeOverlayService);
			overlayService.hideOverlayLoadingMessage();
		});
	}

	get pearOverlayPart(): OrangePiCodeOverlayPart {
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
	IOrangePiCodeOverlayService,
	OrangePiCodeOverlayService,
	InstantiationType.Eager,
);
