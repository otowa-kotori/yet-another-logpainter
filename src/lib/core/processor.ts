import { LogProcessor, type Log } from './types';
import { ColorConfig } from './namecolorer';

// Processor组，处理一个列表里的Processor
export class ProcessorGroup extends LogProcessor {
    constructor(private processors: LogProcessor[]) {
        super();
    }
    process(log: Log): Log {
        return this.processors.reduce((acc, processor) => processor.process(acc), log);
    }
}

//消除日志里的[图片]
export class RemoveImageProcessor extends LogProcessor {
    process(log: Log): Log {
        return log.map(entry => ({ ...entry, message: entry.message.replace(/\[图片\]/g, '').trim() }));
    }
}

// 过滤掉以.<字母>开头的消息，这些消息是骰子指令消息
export class RemoveDiceCommandProcessor extends LogProcessor {
    process(log: Log): Log {
        return log.filter(entry => !/^\.[a-zA-Z]/.test(entry.message))  // 过滤掉以.字母开头的消息
    }
}

// 过滤掉以（开头的消息，包括中文和英文括号
export class RemoveParenthesesProcessor extends LogProcessor {
    process(log: Log): Log {
        return log.filter(entry => !/^[\(（]/.test(entry.message))  // 过滤掉以（开头的消息
    }
}

// 消除空消息
export class RemoveEmptyMessageProcessor extends LogProcessor {
    process(log: Log): Log {
        return log.filter(entry => entry.message.trim() !== '');
    }
}

/**
 * 替换日志中的 /me 为玩家名 
 * 如果消息中以 /me 开头，则替换为玩家名。
 * 如果消息中间存在 /me ，则将前面的部分作为一条消息，后面的部分拆分成另一条消息，且第二条消息的/me 替换为玩家名。
 */
export class ReplaceMeProcessor extends LogProcessor {
    process(log: Log): Log {
        return log.flatMap(entry => {
            const message = entry.message.trim();
            
            // 处理以 /me 开头的消息
            if (message.startsWith('/me ')) {
                return [{
                    ...entry,
                    message: `${entry.sender}${message.substring(4)}`
                }];
            }
            
            // 处理包含 /me 的消息
            const parts = message.split('/me').map(part => part.trim()).filter(Boolean);
            if (parts.length === 1) return [entry];
            
            return parts.map((part, i) => ({
                ...entry,
                message: i === 0 ? part : `${entry.sender}${part}`
            }));
        });
    }
}

// 将多行消息拆分成单行消息
export class SplitMultilineProcessor extends LogProcessor {
    process(log: Log): Log {
        return log.flatMap(entry => {
            const lines = entry.message.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length <= 1) {
                return [entry];
            }

            return lines.map(line => ({
                ...entry,
                message: line
            }));
        });
    }
}

/**
 * 为消息添加颜色
 * 根据发送者名字分配颜色，相同的发送者使用相同的颜色
 */
export class ColorProcessor extends LogProcessor {
    constructor(private colorConfig: ColorConfig) {
        super();
    }

    process(log: Log): Log {
        return log
            // 过滤掉type为hidden的条目
            .filter(entry => {
                const standardName = this.colorConfig.getStandardName(entry.sender);
                return this.colorConfig.getNameType(standardName) !== "hidden";
            })
            // 替换发送者名字和颜色
            .map(entry => {
                const standardName = this.colorConfig.getStandardName(entry.sender);
                const nameType = this.colorConfig.getNameType(standardName);
                
                // 获取标准名称对应的条目
                const colorEntry = this.colorConfig.getColorEntry(entry.sender);
                
                return {
                    ...entry,
                    // 如果type为preserve_alias则保留原始名字,否则使用标准名字
                    sender: nameType === "preserve_alias" ? entry.sender : standardName,
                    color: this.colorConfig.getColor(entry.sender),
                    // 如果有设置nameColor则使用，否则使用color
                    nameColor: colorEntry?.nameColor
                };
            });
    }
}
