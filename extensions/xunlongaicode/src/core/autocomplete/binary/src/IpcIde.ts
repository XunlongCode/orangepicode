import { TODO } from "../../util"
import { MessageIde } from "../../protocol/messenger/messageIde"

export class IpcIde extends MessageIde {
	constructor(messenger: TODO) {
		super(messenger.request.bind(messenger), messenger.on.bind(messenger))
	}
}
