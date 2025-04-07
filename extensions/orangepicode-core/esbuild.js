const esbuild = require("esbuild");
const fs = require("fs")
const path = require("path")

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

// Simple function to copy locale files
function copyLocaleFiles() {
	const srcDir = path.join(__dirname, "src", "i18n", "locales")
	const destDir = path.join(__dirname, "dist", "i18n", "locales")
	const outDir = path.join(__dirname, "out", "i18n", "locales")

	// Ensure source directory exists before proceeding
	if (!fs.existsSync(srcDir)) {
		console.warn(`Source locales directory does not exist: ${srcDir}`)
		return // Exit early if source directory doesn't exist
	}

	// Create destination directories
	fs.mkdirSync(destDir, { recursive: true })
	try {
		fs.mkdirSync(outDir, { recursive: true })
	} catch (e) { }

	// Function to copy directory recursively
	function copyDir(src, dest) {
		const entries = fs.readdirSync(src, { withFileTypes: true })

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name)
			const destPath = path.join(dest, entry.name)

			if (entry.isDirectory()) {
				// Create directory and copy contents
				fs.mkdirSync(destPath, { recursive: true })
				copyDir(srcPath, destPath)
			} else {
				// Copy the file
				fs.copyFileSync(srcPath, destPath)
			}
		}
	}

	// Copy files to dist directory
	copyDir(srcDir, destDir)
	console.log("Copied locale files to dist/i18n/locales")

	// Copy to out directory for debugging
	try {
		copyDir(srcDir, outDir)
		console.log("Copied locale files to out/i18n/locales")
	} catch (e) {
		console.warn("Could not copy to out directory:", e.message)
	}
}

const copyLocalesFiles = {
	name: "copy-locales-files",
	setup(build) {
		build.onEnd(() => {
			copyLocaleFiles()
		})
	},
}

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			// 如果插件有locales文件，取消注释下面这行
			// copyLocalesFiles,
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
