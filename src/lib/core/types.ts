export interface LogEntry {
    /** 日志时间戳 */
    time: Date;
    /** 发送者/来源标识 */
    sender: string;
    /** 日志消息内容 */
    message: string;
    /** 显示颜色（用于UI渲染） */
    color?: string;
    /** 原始日志文本 */
    raw: string;
    /** 额外的元数据信息，键值对形式 */
    metadata: Record<string, string>;
}

// 日志条目的数组类型
export type Log = LogEntry[];

/**
 * 日志解析器基类
 */
export abstract class LogParser {
    abstract parse(raw: string): Log;
}

/**
 * 日志处理器基类
 */
export abstract class LogProcessor {
    abstract process(log: Log): Log;
}

/**
 * 日志格式化器基类
 */
export abstract class LogFormatter {
    abstract format(log: Log): string | Array<{
        time: string,
        sender: string,
        message: string
    }>;
}

