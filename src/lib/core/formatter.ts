/**
 * HTML文本格式化器
 * 将日志转化成标准HTML格式，每条日志之间带有换行
 */

// 类型导入
import type { Log } from './types';

// 基类导入
import { LogFormatter } from './types';

// 工具函数导入
import { formatTime } from '../utils';

export class StandardHTMLFormatter extends LogFormatter {
    
    format(log: Log): string {
        return log
            .map(entry => {
                const timeStr = formatTime(entry.time, 'short');
                return `<span style="color:silver">${timeStr}</span><span>&lt;${entry.sender}&gt; ${entry.message}</span><br>`;
            })
            .join('\n');
    }
}

/**
 * BBCode格式化器
 * 将日志转化成BBCode格式，每条日志之间带有换行
 */

export class BBCodeFormatter extends LogFormatter {
    format(log: Log): string {
        return log
            .map(entry => {
                const timeStr = formatTime(entry.time, 'short');
                return `[color=silver]${timeStr}][/color] [color=black]<${entry.sender}>${entry.message}[/color]`;
            })
            .join('\n');
    }
}   
