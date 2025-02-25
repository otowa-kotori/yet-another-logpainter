import { LogParser, type Log, type LogEntry } from './types';

function normalizeNewlines(raw: string): string {
    // 将所有换行符归一化为\n
    return raw.replace(/\r\n|\r/g, '\n');
}

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
 */
export class QQTextParser extends LogParser {
    parse(raw: string): Log {
        raw = normalizeNewlines(raw);
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

/**
 * IRC消息解释器
 * 支持形如：
 * 0:10:00 <发送者> 消息
 * 的解析格式
 */
export class IRCLogParser extends LogParser {
    parse(raw: string): Log {
        raw = normalizeNewlines(raw);
        const lines = raw.split('\n');
        const log: Log = [];
        for (const line of lines) {
            // 跳过空行
            if (!line.trim()) continue;
            // 匹配 "时:分:秒 <发送者> 消息" 格式
            const match = line.match(/^(\d{1,2}:\d{1,2}:\d{1,2})\s+<([^>]+)>\s+(.+)$/);
            if (!match) continue;
            const [_, timeStr, sender, message] = match;
            // 构建日期对象,由于IRC日志通常只有时间没有日期,使用当天日期
            const today = new Date();
            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            const time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
            log.push({
                time,
                sender: sender.trim(),
                message: message.trim(),
                raw: line,
                metadata: {}
            });
        }

        return log;
    }
}

/**
 * FVTT日志解释器
 * 支持形如：
 * [1/24/2025, 10:00:00 AM] 发送者
 * 文本
 * ---------------------------
 * 的解析格式
 */
export class FVTTLogParser extends LogParser {
    parse(raw: string): Log {
        raw = normalizeNewlines(raw);
        const lines = raw.split('\n');
        const log: Log = [];
        let currentEntry: LogEntry | null = null;

        for (const line of lines) {
            // 跳过空行
            if (!line.trim()) continue;

            // 匹配 "[月/日/年, 时:分:秒 AM/PM] 发送者" 格式
            const headerMatch = line.match(/^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s+(\d{1,2}:\d{1,2}:\d{1,2}\s+[AP]M)\]\s+(.+)$/);

            if (headerMatch) {
                // 如果有未完成的条目，先保存
                if (currentEntry) {
                    log.push(currentEntry);
                }

                const [_, dateStr, timeStr, sender] = headerMatch;
                // 解析日期时间
                const time = new Date(`${dateStr} ${timeStr}`);

                // 创建新条目
                currentEntry = {
                    time,
                    sender: sender.trim(),
                    message: '',
                    raw: line,
                    metadata: {}
                };
            } else if (line.match(/^-+$/)) {
                // 遇到分隔线，保存当前条目
                if (currentEntry) {
                    log.push(currentEntry);
                    currentEntry = null;
                }
            } else if (currentEntry) {
                // 将行添加到当前消息中
                currentEntry.message += (currentEntry.message ? '\n' : '') + line.trim();
                currentEntry.raw += '\n' + line;
            }
        }

        // 保存最后一个条目
        if (currentEntry) {
            log.push(currentEntry);
        }

        return log;
    }
}   

/**
 * 自动检测日志
 */
export class AutoDetectLogParser extends LogParser {
    parse(raw: string): Log {
        const parsers = [new QQTextParser(), new IRCLogParser(), new FVTTLogParser()];
        // 尝试每个解析器并选择结果最多的
        let bestResult: Log = [];
        for (const parser of parsers) {
            try {
                const result = parser.parse(raw);
                if (result.length > bestResult.length) {
                    bestResult = result;
                }
            } catch (e) {
                console.warn(`解析器 ${parser.constructor.name} 解析失败:`, e);
            }
        }
        return bestResult;
    }
}
