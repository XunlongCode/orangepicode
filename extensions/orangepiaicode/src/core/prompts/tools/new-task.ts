import { ToolArgs } from "./types"

// Description: Create a new task with a specified starting mode and initial message. This tool instructs the system to create a new Cline instance in the given mode with the provided message.
// - mode: (required) The slug of the mode to start the new task in (e.g., "code", "ask", "architect").

export function getNewTaskDescription(args: ToolArgs): string {
	return `## new_task
Description: Create a new task with current mode (chat or code) and initial message. This tool instructs the system to create a new Cline instance in the given mode with the provided message.

Parameters:
- mode: (required) The slug of the mode to start the new task, it must be consistent with the current mode and cannot be used to switch modes.
- message: (required) The initial user message or instructions for this new task.

Usage:
<new_task>
<mode>your-mode-slug-here</mode>
<message>Your initial instructions here</message>
</new_task>

Example:
<new_task>
<mode>code</mode>
<message>Implement a new feature for the application.</message>
</new_task>
`
}
