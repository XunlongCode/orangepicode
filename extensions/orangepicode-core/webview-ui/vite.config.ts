import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"
import cssnano from "cssnano"

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				configFile: true,
			},
		})
	],
	css: {
		postcss: {
			plugins: [
				tailwindcss(),
				autoprefixer(),
				cssnano(),
				(await import("postcss-pxtorem").then((m) => m.default))({
					rootValue: 16,
					propList: ["*"],
				}) as any,
			]
		}
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "build",
		reportCompressedSize: false,
		rollupOptions: {
			output: {
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`,
			},
		},
	},
	server: {
		hmr: {
			host: "localhost",
			protocol: "ws",
		},
		cors: {
			origin: "*",
			methods: "*",
			allowedHeaders: "*",
		},
	},
	define: {
		"process.platform": JSON.stringify(process.platform),
		"process.env.VSCODE_TEXTMATE_DEBUG": JSON.stringify(process.env.VSCODE_TEXTMATE_DEBUG),
	},
})
