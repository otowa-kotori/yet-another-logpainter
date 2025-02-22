/**
 * HTML文本格式化器
 * 将日志转化成标准HTML格式，每条日志之间带有换行
 */

import { LogFormatter, type Log } from './types';

export class StandardHTMLFormatter extends LogFormatter {
    
    format(log: Log): string {
        return log
            .map(entry => {
                const timeStr = entry.time.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                return `<span style="color:silver">${timeStr}</span><span>&lt;${entry.sender}&gt; ${entry.message}</span><br>`;
            })
            .join('\n');
    }
}


