/**
 * Svelte专用格式化器
 * 提供日志数据的格式化
 */
import { LogFormatter, type Log } from '../core/types';
import { formatTime } from '../utils';

export class SvelteFormatter extends LogFormatter {
    format(log: Log): Array<{
        time: string,
        sender: string,
        message: string
    }> {
        return log.map(entry => ({
            time: formatTime(entry.time, 'short'),
            sender: entry.sender,
            message: entry.message
        }));
    }
} 