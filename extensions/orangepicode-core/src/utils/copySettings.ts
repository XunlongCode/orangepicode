import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const extensionsDir = path.join(os.homedir(), '.orangepicode', 'extensions');

function getSettingsDir() {
	const platform = process.platform;
	const appDataDirname = "OrangePi Code"
	if (platform === 'win32') {
		return path.join(process.env.APPDATA || '', appDataDirname, 'User');
	} else if (platform === 'darwin') {
		return path.join(os.homedir(), 'Library', 'Application Support', appDataDirname, 'User');
	} else {
		return path.join(os.homedir(), '.config', appDataDirname, 'User');
	}
}

function getVSCodeExtensionsDir() {
	return path.join(os.homedir(), '.vscode', 'extensions');
}

function getCursorExtensionsDir() {
	return path.join(os.homedir(), '.cursor', 'extensions');
}

function excludeExtensions() {
	const baseExclusions = new Set([
		'xunlongcode.orangepiaicode',
		'ms-python.vscode-pylance',
		'ms-python.python',
		'codeium',
		'github.copilot',
		'continue',
		'roo-cline',
		'cline',
	]);

	// Add platform specific exclusions
	if (process.platform === 'darwin' && process.arch === 'arm64') {
		baseExclusions.add('ms-python.vscode-pylance');
		baseExclusions.add('ms-python.python');
		baseExclusions.add('ms-vscode-remote.remote-ssh');
		baseExclusions.add('ms-vscode-remote.remote-ssh-edit');
	}

	// Add platform specific exclusions
	if (process.platform === 'darwin' && process.arch === 'x64') {
		baseExclusions.add('ms-python.vscode-pylance');
		baseExclusions.add('ms-python.python');
		baseExclusions.add('ms-vscode-remote.remote-ssh');
		baseExclusions.add('ms-vscode-remote.remote-ssh-edit');
	}
	// // Add Windows specific exclusions
	// if (process.platform === 'win32') {
	// }

	// Add Linux specific exclusions
	// if (process.platform === 'linux') {
	// }

	return baseExclusions
}

function getVSCodeSettingsDir() {
	const platform = process.platform;
	if (platform === 'win32') {
		return path.join(process.env.APPDATA || '', 'Code', 'User');
	} else if (platform === 'darwin') {
		return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User');
	} else {
		return path.join(os.homedir(), '.config', 'Code', 'User');
	}
}

async function copyVSCodeSettings() {
	const vscodeSettingsDir = getVSCodeSettingsDir();
	const settingsDir = getSettingsDir();
	const vscodeExtensionsDir = getVSCodeExtensionsDir();

	await fs.promises.mkdir(settingsDir, { recursive: true });
	await fs.promises.mkdir(extensionsDir, { recursive: true });

	const itemsToCopy = ['settings.json', 'keybindings.json', 'snippets', 'sync', 'globalStorage/state.vscdb', 'globalStorage/state.vscdb.backup'];

	for (const item of itemsToCopy) {
		const source = path.join(vscodeSettingsDir, item);
		const destination = path.join(settingsDir, item);

		try {
			if (await fs.promises.access(source).then(() => true).catch(() => false)) {
				const stats = await fs.promises.lstat(source);
				if (stats.isDirectory()) {
					await copyDirectoryRecursiveSync(source, destination);
				} else {
					await fs.promises.copyFile(source, destination);
				}
			}
		} catch (error) {
			console.error(`Error copying ${item}: ${error}`);
		}
	}

	await copyDirectoryRecursiveSync(vscodeExtensionsDir, extensionsDir, Array.from(excludeExtensions()));
}

function getCursorSettingsDir() {
	const platform = process.platform;
	if (platform === 'win32') {
		return path.join(process.env.APPDATA || '', 'Cursor', 'User');
	} else if (platform === 'darwin') {
		return path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'User');
	} else {
		return path.join(os.homedir(), '.config', 'Cursor', 'User');
	}
}


async function copyCursorSettings() {
	const cursorSettingsDir = getCursorSettingsDir();
	const settingsDir = getSettingsDir();
	const cursorExtensionsDir = getCursorExtensionsDir();

	await fs.promises.mkdir(settingsDir, { recursive: true });
	await fs.promises.mkdir(extensionsDir, { recursive: true });

	const itemsToCopy = ['settings.json', 'keybindings.json', 'snippets', 'sync', 'globalStorage/state.vscdb', 'globalStorage/state.vscdb.backup'];

	for (const item of itemsToCopy) {
		const source = path.join(cursorSettingsDir, item);
		const destination = path.join(settingsDir, item);

		try {
			if (await fs.promises.access(source).then(() => true).catch(() => false)) {
				const stats = await fs.promises.lstat(source);
				if (stats.isDirectory()) {
					await copyDirectoryRecursiveSync(source, destination);
				} else {
					await fs.promises.copyFile(source, destination);
				}
			}
		} catch (error) {
			console.error(`Error copying ${item}: ${error}`);
		}
	}

	await copyDirectoryRecursiveSync(cursorExtensionsDir, extensionsDir, Array.from(excludeExtensions()));
}


async function copyDirectoryRecursiveSync(source: string, destination: string, exclusions: string[] = []) {
	await fs.promises.mkdir(destination, { recursive: true });

	const items = await fs.promises.readdir(source);
	for (const item of items) {
		const sourcePath = path.join(source, item);
		const destinationPath = path.join(destination, item);

		const shouldExclude = exclusions.some(exclusion =>
			sourcePath.toLowerCase().includes(exclusion.toLowerCase())

		);

		if (!shouldExclude) {
			const stats = await fs.promises.lstat(sourcePath);
			if (stats.isDirectory()) {
				await copyDirectoryRecursiveSync(sourcePath, destinationPath, exclusions);
			} else {
				await fs.promises.copyFile(sourcePath, destinationPath);
			}
		}
	}
}

export async function importUserSettingsFromVSCode() {
	try {
		await Promise.all([
			new Promise((resolve) => setTimeout(resolve, 1000)), // Take at least one second
			copyVSCodeSettings(),
		]);
		return Promise.resolve({ ok: true, error: null });
	} catch (error) {
		// vscode.window.showErrorMessage(`Failed to copy settings: ${error}`);
		return Promise.reject(error);
	}
}

export async function importUserSettingsFromCursor() {
	try {
		await Promise.all([
			new Promise((resolve) => setTimeout(resolve, 1000)), // Take at least one second
			copyCursorSettings(),
		]);
		return Promise.resolve({ ok: true, error: null });
	} catch (error) {
		// vscode.window.showErrorMessage(`Failed to copy settings: ${error}`);
		return Promise.reject(error);
	}
}
