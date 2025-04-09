import subprocess
import sys
import platform

install_dependencies = "i" in sys.argv

base_commands = [
    {"cwd": "extensions/orangepicode-theme", "commands": ["npm i", "npm run build"]},
    {
        "cwd": "extensions/orangepiaicode",
        "commands": [
            "npm run install:all",
            "npm run build:webview",
            "npm run build:esbuild",
        ],
    },
    {"cwd": "extensions/orangepicode-core", "commands": ["npm i", "npm run compile"]},
    {
        "cwd": "extensions/orangepicode-core/webview-ui",
        "commands": ["yarn", "npm run build"],
    },
]


def run_command(cwd, command):
    if not install_dependencies:
        if command == "npm i" or command == "yarn" or command == "npm run install:all":
            return

    print(f"\n* Running: `{command}` in `{cwd}`")
    try:
        return subprocess.run(command, cwd=cwd, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Command failed with exit code {e.returncode}: {command}")
        sys.exit(e.returncode)
    except KeyboardInterrupt:
        sys.exit(130)


def get_package_commands():
    system = platform.system()
    commands = []

    if system == "Windows":
        commands = [
            "npx gulp vscode-win32-x64",
            "npx gulp vscode-win32-x64-inno-updater",
            "npx gulp vscode-win32-x64-user-setup",
        ]
    elif system == "Darwin":
        commands = ["npx gulp vscode-darwin-arm64"]
    elif system == "Linux":
        commands = ["npx gulp vscode-linux-x64"]

    return [{"cwd": ".", "commands": commands}]


def run():
    for group in base_commands:
        cwd = group["cwd"]
        for cmd in group["commands"]:
            run_command(cwd, cmd)

    for group in get_package_commands():
        cwd = group["cwd"]
        for cmd in group["commands"]:
            run_command(cwd, cmd)


if __name__ == "__main__":
    run()
