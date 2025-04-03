const { exec } = require('child_process');
const path = require('path');
const { fileURLToPath } = require('url');

// 需要修改 __dirname 的获取方式，因为在 CommonJS 中它是全局变量
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const commands = [
  { cmd: 'yarn watch', cwd: rootDir },
  { cmd: 'yarn watch', cwd: path.join(rootDir, 'extensions/xunlongaicode') },
  { cmd: 'yarn build && yarn dev', cwd: path.join(rootDir, 'extensions/xunlongaicode/webview-ui') },
  { cmd: 'yarn watch', cwd: path.join(rootDir, 'extensions/orangepicode-core') },
  { cmd: 'yarn build && yarn dev', cwd: path.join(rootDir, 'extensions/orangepicode-core/webview-ui') }
];

// 添加延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 使用异步函数按顺序启动终端
async function startTerminals() {
  for (let i = 0; i < commands.length; i++) {
    const { cmd, cwd } = commands[i];
    const escapedCmd = cmd.replace(/"/g, '\\"');
    const escapedCwd = cwd.replace(/"/g, '\\"');

    const appleScript = `
      tell application "Terminal"
        do script "cd \\"${escapedCwd}\\" && ${escapedCmd}"
      end tell
    `;

    try {
      await new Promise((resolve, reject) => {
        exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
          if (error) {
            console.error(`启动终端 ${i} 失败: ${error.message}`);
            reject(error);
            return;
          }
          console.log(`已在新终端 ${i} 中启动: ${cmd}`);
          resolve();
        });
      });

      // 每次启动终端后等待一段时间
      await delay(1000);
    } catch (err) {
      console.error(`终端 ${i} 启动过程中出错: ${err}`);
    }
  }
}

startTerminals().catch(err => {
  console.error('启动终端过程中发生错误:', err);
});
