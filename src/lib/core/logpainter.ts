import type { Log } from './types';
import { LogParser, LogProcessor, LogFormatter } from './types';

/**
 * 日志处理器类
 */
export class LogPainter {
    private processors: LogProcessor[] = [];

    constructor(private parser: LogParser) {}

    /**
     * 添加处理器
     * @param processor 单个处理器或处理器数组
     */
    pipe(processor: LogProcessor): this {
        this.processors.push(processor);
        return this;
    }

    /**
     * 执行日志处理
     * @param raw 原始日志文本
     * @param formatter 格式化器
     */
    paint<T>(raw: string, formatter: LogFormatter): T {
        return formatter.format(
            this.processors.reduce(
                (log, processor) => processor.process(log),
                this.parser.parse(raw)
            )
        ) as T;
    }

    /**
     * 创建新的LogPainter实例
     * @param parser 解析器
     */
    static create(parser: LogParser): LogPainter {
        return new LogPainter(parser);
    }
}