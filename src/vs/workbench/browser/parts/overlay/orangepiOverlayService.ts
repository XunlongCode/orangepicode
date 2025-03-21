/* eslint-disable header/header */

import {
	registerSingleton,
	InstantiationType,
} from "../../../../platform/instantiation/common/extensions.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { OrangePiOverlayPart } from "./orangepiOverlayPart.js";
import {
	createDecorator,
	IInstantiationService,
} from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ITerminalService } from "../../../contrib/terminal/browser/terminal.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";

export const IOrangePiOverlayService = createDecorator<IOrangePiOverlayService>(
	"orangepicodeOverlayService",
);

export interface IOrangePiOverlayService extends IDisposable {
	readonly _serviceBrand: undefined;

	/**
	 * Returns the FirstLaunchOverlayPart instance.
	 */
	readonly pearOverlayPart: OrangePiOverlayPart;

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

export class OrangePiOverlayService
	extends Disposable
	implements IOrangePiOverlayService {
	declare readonly _serviceBrand: undefined;

	private readonly _pearOverlayPart: OrangePiOverlayPart;

	constructor(
		@IInstantiationService
		private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly _editorService: IEditorService,
		@ITerminalService private readonly _terminalService: ITerminalService,
		// @ICommandService private readonly commandService: ICommandService,
	) {
		super();
		this._pearOverlayPart =
			this.instantiationService.createInstance(OrangePiOverlayPart);
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
		// Register commands for external use e.g. in orangepicode submodule
		CommandsRegistry.registerCommand("orangepicode.isOverlayVisible", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			return overlayService.isVisible();
		});

		CommandsRegistry.registerCommand("orangepicode.showOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			overlayService.show();
		});

		CommandsRegistry.registerCommand("orangepicode.hideOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			overlayService.hide();
		});

		CommandsRegistry.registerCommand("orangepicode.toggleOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			overlayService.toggle();
		});

		CommandsRegistry.registerCommand("orangepicode.lockOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			overlayService.lock();
		});

		CommandsRegistry.registerCommand("orangepicode.unlockOverlay", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			overlayService.unlock();
		});

		CommandsRegistry.registerCommand("orangepicode.isOverlayLocked", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			return overlayService.isLocked();
		});

		CommandsRegistry.registerCommand("orangepicode.hideOverlayLoadingMessage", (accessor) => {
			const overlayService = accessor.get(IOrangePiOverlayService);
			overlayService.hideOverlayLoadingMessage();
		});
	}

	get pearOverlayPart(): OrangePiOverlayPart {
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
	IOrangePiOverlayService,
	OrangePiOverlayService,
	InstantiationType.Eager,
);
