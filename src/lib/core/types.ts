import type { Color } from 'chroma-js';

export interface LogEntry {
    /** 日志时间戳 */
    time: Date;
    /** 发送者/来源标识 */
    sender: string;
    /** 日志消息内容 */
    message: string;
    /** 显示颜色（用于UI渲染） */
    color?: Color;
    /** 名字显示颜色（用于UI渲染） */
    nameColor?: Color;
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
 * 格式化器选项
 */
export interface FormatterOptions {
    /** 是否显示时间 */
    showTime?: boolean;
    /** 是否显示发送者名称 */
    showSender?: boolean;
}

/**
 * 日志格式化器基类
 */
export abstract class LogFormatter {
    protected options: FormatterOptions;

    constructor(options: FormatterOptions = {}) {
        this.options = {
            showTime: true,
            showSender: true,
            ...options
        };
    }

    abstract format(log: Log): string;
}

