import type { Log } from './types';
import { LogParser, LogProcessor, LogFormatter } from './types';

/**
 * 日志处理器类
 */
export class LogPainter {
    private parser: LogParser;
    private processors: LogProcessor[] = [];
    private formatter?: LogFormatter;

    private constructor(parser: LogParser) {
        this.parser = parser;
    }

    /**
     * 添加处理器
     * @param processor 单个处理器或处理器数组
     */
    pipe(processor: LogProcessor): LogPainter {
        this.processors.push(processor);
        return this;
    }

    /**
     * 设置格式化器
     * @param formatter 格式化器
     */
    withFormatter(formatter: LogFormatter): LogPainter {
        this.formatter = formatter;
        return this;
    }

    /**
     * 执行日志处理
     * @param raw 原始日志文本
     * @throws Error 当未设置格式化器时抛出错误
     */
    paint(raw: string): string {
        if (!this.formatter) {
            throw new Error('Formatter not set');
        }

        return this.formatter.format(
            this.processors.reduce(
                (log, processor) => processor.process(log),
                this.parser.parse(raw)
            )
        );
    }

    /**
     * 创建新的LogPainter实例
     * @param parser 解析器
     */
    static create(parser: LogParser): LogPainter {
        return new LogPainter(parser);
    }
}