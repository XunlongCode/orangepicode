import { useExtensionState } from '../context/ExtensionStateContext'


const useChatMode = () => {
	const { mode } = useExtensionState()

	return window.chatMode || mode
}

export default useChatMode
