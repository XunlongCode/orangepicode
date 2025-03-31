import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { WebviewService } from '../../../contrib/webview/browser/webviewService.js';
import { IWebviewViewService } from '../../../contrib/webviewView/browser/webviewViewService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkbenchLayoutService, Parts } from '../../../services/layout/browser/layoutService.js';
import { Part } from '../../part.js';

export class OverlayPart extends Part {
	static readonly ID = Parts.ORANGEPICODE_OVERLAY_PART;

	override minimumWidth: number = 0;
	override minimumHeight: number = 0
	override maximumWidth: number = Number.MAX_VALUE;
	override maximumHeight: number = Number.MAX_VALUE;

	private _webviewService: WebviewService | undefined;


	constructor(
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IWebviewViewService
		private readonly _webviewViewService: IWebviewViewService,
		@IInstantiationService
		private readonly _instantiationService: IInstantiationService,
		@IEditorGroupsService
		private readonly _editorGroupsService: IEditorGroupsService,
	) {
		super(
			OverlayPart.ID,
			{ hasTitle: false },
			themeService,
			storageService,
			layoutService,
		);
		this._webviewService =
			this._instantiationService.createInstance(WebviewService);

		this.initialize();
	}

	initialize(): void {

	}





	toJSON(): object {
		return {
			type: Parts.ORANGEPICODE_OVERLAY_PART,
		};
	}
}
