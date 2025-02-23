import { expect } from 'vitest';
import type { LogEntry } from '../lib/core/types';

interface MessageOptions {
    time?: Date;
    sender?: string;
    message?: string;
    raw?: string;
}

const DEFAULT_TIME = new Date('2024-01-01T00:00:00Z');

// 测试用的常量数据
export const TEST_DATA = {
    SENDER: '阿洛',
    TIME: new Date('2024-02-22T20:45:24'),
    MESSAGE: '这是一条测试消息'
} as const;

// 快速创建消息
export function createMessage(override: Partial<LogEntry> = {}): LogEntry {
    return {
        time: override.time || TEST_DATA.TIME   ,
        sender: override.sender || TEST_DATA.SENDER,
        message: override.message || TEST_DATA.MESSAGE,
        raw: override.raw || '',
        metadata: override.metadata || {},
        ...override
    };
}
