import os
import subprocess
import time
import platform
import sys

# 获取根目录路径
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 定义要执行的命令
commands = [
    {"cmd": "yarn watch", "cwd": root_dir},
    {"cmd": "yarn watch", "cwd": os.path.join(root_dir, 'extensions/xunlongaicode')},
    {"cmd": "yarn build && yarn dev", "cwd": os.path.join(root_dir, 'extensions/xunlongaicode/webview-ui')},
    {"cmd": "yarn watch", "cwd": os.path.join(root_dir, 'extensions/orangepicode-core')},
    {"cmd": "yarn build && yarn dev", "cwd": os.path.join(root_dir, 'extensions/orangepicode-core/webview-ui')}
]

def start_terminal_macos(cmd, cwd):
    """在macOS上启动新终端并执行命令"""
    escaped_cmd = cmd.replace('"', '\\"')
    escaped_cwd = cwd.replace('"', '\\"')

    apple_script = f'''
    tell application "Terminal"
      do script "cd \\"{escaped_cwd}\\" && {escaped_cmd}"
    end tell
    '''

    try:
        subprocess.run(['osascript', '-e', apple_script], check=True)
        print(f"已在新终端中启动: {cmd}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"启动终端失败: {e}")
        return False

def start_terminal_windows(cmd, cwd):
    """在Windows上启动新终端并执行命令"""
    try:
        subprocess.Popen(f'start cmd.exe /K "cd /d "{cwd}" && {cmd}"',
                         shell=True, cwd=cwd)
        print(f"已在新终端中启动: {cmd}")
        return True
    except Exception as e:
        print(f"启动终端失败: {e}")
        return False

def start_terminal_linux(cmd, cwd):
    """在Linux上启动新终端并执行命令"""
    try:
        # 尝试使用gnome-terminal
        subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f'cd "{cwd}" && {cmd}; exec bash'])
        print(f"已在新终端中启动: {cmd}")
        return True
    except FileNotFoundError:
        try:
            # 尝试使用xterm
            subprocess.Popen(['xterm', '-e', f'cd "{cwd}" && {cmd}; bash'])
            print(f"已在新终端中启动: {cmd}")
            return True
        except FileNotFoundError:
            print("无法找到合适的终端模拟器")
            return False

def main():
    """主函数，根据操作系统启动终端"""
    system = platform.system()

    for i, command in enumerate(commands):
        cmd = command["cmd"]
        cwd = command["cwd"]

        print(f"正在启动终端 {i+1}/{len(commands)}...")

        if system == "Darwin":  # macOS
            success = start_terminal_macos(cmd, cwd)
        elif system == "Windows":
            success = start_terminal_windows(cmd, cwd)
        elif system == "Linux":
            success = start_terminal_linux(cmd, cwd)
        else:
            print(f"不支持的操作系统: {system}")
            sys.exit(1)

        if not success:
            print(f"终端 {i+1} 启动失败，继续下一个...")

        # 每次启动终端后等待一段时间
        time.sleep(1)

if __name__ == "__main__":
    main()
