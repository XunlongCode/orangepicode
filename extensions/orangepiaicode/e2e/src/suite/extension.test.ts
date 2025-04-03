import * as assert from "assert"
import * as vscode from "vscode"

suite("OrangePi AI Code Extension", () => {
	test("OPENROUTER_API_KEY environment variable is set", () => {
		if (!process.env.OPENROUTER_API_KEY) {
			assert.fail("OPENROUTER_API_KEY environment variable is not set")
		}
	})

	test("Commands should be registered", async () => {
		const expectedCommands = [
			"orangepiaicode.plusButtonClicked",
			"orangepiaicode.mcpButtonClicked",
			"orangepiaicode.historyButtonClicked",
			"orangepiaicode.popoutButtonClicked",
			"orangepiaicode.settingsButtonClicked",
			"orangepiaicode.openInNewTab",
			"orangepiaicode.explainCode",
			"orangepiaicode.fixCode",
			"orangepiaicode.improveCode",
		]

		const commands = await vscode.commands.getCommands(true)

		for (const cmd of expectedCommands) {
			assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`)
		}
	})
})
