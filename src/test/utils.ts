import { expect } from 'vitest';

interface MessageOptions {
    time?: Date;
    sender?: string;
    message?: string;
    raw?: string;
}

const DEFAULT_TIME = new Date('2024-01-01T00:00:00Z');

// 快速创建消息
export function createMessage(options: MessageOptions = {}) {
    const {
        time = DEFAULT_TIME,
        sender = 'default_sender',
        message = '',
        raw = ''
    } = options;

    return {
        time,
        sender,
        message,
        raw,
        metadata: {}
    }
}
