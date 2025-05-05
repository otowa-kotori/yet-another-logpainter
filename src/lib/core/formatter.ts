/**
 * HTML文本格式化器
 * 将日志转化成标准HTML格式，每条日志之间带有换行
 */

// 类型导入
import type { Log } from './types';
import type { Color } from 'chroma-js';

// 基类导入
import { LogFormatter } from './types';

// 工具函数导入
import { formatTime } from '../utils';

export class StandardHTMLFormatter extends LogFormatter {
    
    format(log: Log): string {
        return log
            .map(entry => {
                const parts: string[] = [];
                
                if (this.options.showTime) {
                    const timeStr = formatTime(entry.time, 'short');
                    parts.push(`<span style="color:silver">${timeStr}</span>`);
                }
                
                if (this.options.showSender) {
                    const senderColor = entry.color?.hex() || 'black';
                    parts.push(`<span style="color:${senderColor}">&lt;${entry.sender}&gt;</span>`);
                }
                
                const messageColor = entry.color?.hex() || 'black';
                parts.push(`<span style="color:${messageColor}">${entry.message}</span>`);
                return parts.join('') + '<br>';
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
                const parts: string[] = [];
                if (this.options.showTime) {
                    const timeStr = formatTime(entry.time, 'short');
                    parts.push(`[color=silver]${timeStr}[/color]`);
                }
                if (this.options.showSender) {
                    const senderColor = entry.color?.hex() || 'black';
                    const nameColor = entry.nameColor?.hex();
                    if (!nameColor || nameColor === senderColor) {
                        // 合并发送者和消息
                        parts.push(`[color=${senderColor}]<${entry.sender}>${entry.message}[/color]`);
                        return parts.join('');
                    } else {
                        // 分开发送者和消息
                        parts.push(`[color=${nameColor}]<${entry.sender}>[/color]`);
                    }
                }
                const messageColor = entry.color?.hex() || 'black';
                parts.push(`[color=${messageColor}]${entry.message}[/color]`);
                return parts.join('');
            })
            .join('\n');
    }
}


