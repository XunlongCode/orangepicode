import * as vscode from 'vscode';

/**
 * 监听 VSCode 语言设置的变化
 * @param callback 语言变化时的回调函数
 * @returns 用于取消监听的 Disposable 对象
 */
export function monitorLanguageChange(callback: (newLocale: string) => void): vscode.Disposable {
    // 获取当前语言设置
    let currentLocale = vscode.workspace.getConfiguration().get<string>('locale') || 'en';

    // 监听配置变更事件
    const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
        // 检查是否是语言设置发生了变化
        if (event.affectsConfiguration('locale')) {
            const newLocale = vscode.workspace.getConfiguration().get<string>('locale') || 'en';
            console.log('');
            // 如果语言确实发生了变化
            if (newLocale !== currentLocale) {
                currentLocale = newLocale;
                callback(newLocale);
            }
        }
    });

    return disposable;
}