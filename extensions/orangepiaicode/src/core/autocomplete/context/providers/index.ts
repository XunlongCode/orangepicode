import type {
	ContextItem,
	ContextProviderDescription,
	ContextProviderExtras,
	ContextProviderName,
	ContextSubmenuItem,
	IContextProvider,
	LoadSubmenuItemsArgs,
} from "../../index"
import { Providers } from "./providers"

export abstract class BaseContextProvider implements IContextProvider {
	options: { [key: string]: any }

	constructor(options: { [key: string]: any }) {
		this.options = options
	}

	static description: ContextProviderDescription

	get description(): ContextProviderDescription {
		return (this.constructor as any).description
	}

	// Maybe just include the chat message in here. Should never have to go back to the context provider once you have the information.
	abstract getContextItems(query: string, extras: ContextProviderExtras): Promise<ContextItem[]>

	async loadSubmenuItems(args: LoadSubmenuItemsArgs): Promise<ContextSubmenuItem[]> {
		return []
	}
}

// #region core/context/providers/index.ts

export function contextProviderClassFromName(name: ContextProviderName): typeof BaseContextProvider | undefined {
	return Providers.find((cls) => cls.description.title === name)
}

// #endregion
