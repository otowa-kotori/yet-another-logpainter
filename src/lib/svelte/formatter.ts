/**
 * Svelte专用格式化器
 * 提供日志数据的格式化
 */
import { LogFormatter, type Log } from '../core/types';

export class SvelteFormatter extends LogFormatter {
    format(log: Log): Array<{
        time: string,
        sender: string,
        message: string
    }> {
        return log.map(entry => ({
            time: entry.time.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            sender: entry.sender,
            message: entry.message
        }));
    }
} 