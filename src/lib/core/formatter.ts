/**
 * HTML文本格式化器
 * 将日志转化成标准HTML格式，每条日志之间带有换行
 */

import { LogFormatter, type Log } from './types';

export class StandardHTMLFormatter extends LogFormatter {
    
    format(log: Log): string {
        return log
            .map(entry => 
                `<div class="log-entry">
                    ${entry.time.toLocaleString()} ${entry.sender}: ${entry.message}
                </div>`
            )
            .join('\n');
    }
}


