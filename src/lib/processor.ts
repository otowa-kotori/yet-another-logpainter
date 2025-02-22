import { LogProcessor, type Log } from './types';

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
        return log.map(entry => ({ ...entry, message: entry.message.replace(/\[图片\]/g, '') }));
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
        const result: Log = [];
        
        for (const entry of log) {
            // 检查消息是否以 /me 开头
            if (entry.message.trim().startsWith('/me ')) {
                const message = entry.message.trim().substring(4);
                result.push({
                    ...entry,
                    message: `${entry.sender}${message}`
                });
                continue;
            }
            
            // 检查消息中间是否有 /me
            const parts = entry.message.split('/me');
            if (parts.length === 1) {
                // 没有 /me，保持原样
                result.push(entry);
                continue;
            }
            
            // 处理包含 /me 的消息
            parts.forEach((part, index) => {
                const trimmedPart = part.trim();
                if (!trimmedPart) return;
                
                if (index === 0) {
                    // 第一部分作为普通消息
                    result.push({
                        ...entry,
                        message: trimmedPart
                    });
                } else {
                    // 后续部分替换为玩家动作
                    result.push({
                        ...entry,
                        message: `${entry.sender}${trimmedPart}`
                    });
                }
            });
        }
        
        return result;
    }
}

// 处理器优先级组
export const processorGroups = {
    preProcess: [
        new RemoveImageProcessor()
    ],
    mainProcess: [
        new ReplaceMeProcessor()
    ],
    postProcess: [
        new RemoveEmptyMessageProcessor()
    ]
};

// 预定义的处理器配置
export const defaultProcessors = [
    new RemoveImageProcessor(),
    new ReplaceMeProcessor(),
    new RemoveEmptyMessageProcessor()  // 始终保持在最后，清理空消息
];

