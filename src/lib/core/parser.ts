/**
 * QQ日志解析器
 * 支持两种格式：
 * 1. 标准格式：
 * ```
 * 2025-02-15 20:39:56 角色名
 * 上回说到...
 * ```
 * 或
 * ```
 * 2025-02-15 20:39:56 角色名(QQ号)
 * 上回说到...
 * ```
 * 
 * 2. 替代格式：
 * ```
 * 发送者 2025/2/22 20:45:24
 * 消息文本
 * ```
 * 或
 * ```
 * 【无用信息】发送者 2025/2/22 20:45:24
 * 消息文本
 * ```
 * 
 * @param raw - 原始日志文本字符串
 * @returns {Log} 解析后的日志数组
 */
import { LogParser, type Log } from './types';

export class QQTextParser extends LogParser {
    parse(raw: string): Log {
        // 将所有换行符归一化为\n
        raw = raw.replace(/\r\n|\r/g, '\n');
        const blocks = raw.split('\n\n');
        const log: Log = [];
        
        for (const block of blocks) {
            const lines = block.trim().split('\n');
            if (lines.length < 2) continue;
            
            const headerLine = lines[0];
            const messageLine = lines.slice(1).join('\n');
            
            // 尝试匹配第一种格式：时间在前，(QQ号)可选
            let match = headerLine.match(/^(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2}:\d{1,2})\s+([^(]+?)(?:\([^)]+\))?$/);
            
            if (match) {
                const [_, timeStr, sender] = match;
                log.push({
                    time: new Date(timeStr),
                    sender: sender.trim(),
                    message: messageLine.trim(),
                    raw: block,
                    metadata: {}
                });
                continue;
            }
            
            // 尝试匹配第二种格式：【】可选，时间在后
            match = headerLine.match(/^(?:【[^】]*】)?([^\d]+?)\s+(\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{1,2}:\d{1,2})/);
            
            if (match) {
                const [_, sender, timeStr] = match;
                log.push({
                    time: new Date(timeStr),
                    sender: sender.trim(),
                    message: messageLine.trim(),
                    raw: block,
                    metadata: {}
                });
            }
        }
        
        return log;
    }
}