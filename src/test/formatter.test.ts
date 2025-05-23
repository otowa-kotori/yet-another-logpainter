import { describe, it, expect } from 'vitest';
import { StandardHTMLFormatter, BBCodeFormatter } from '../lib/core/formatter';
import type { Log, FormatterOptions } from '../lib/core/types';

describe('FormatterOptions', () => {
    const log: Log = [
        {
            time: new Date('2024-01-01T12:00:00Z'),
            sender: 'Alice',
            message: 'Hello, world!',
            color: { hex: () => '#ff0000' } as any,
            nameColor: { hex: () => '#00ff00' } as any,
            raw: 'raw1',
            metadata: {}
        },
        {
            time: new Date('2024-01-01T12:01:00Z'),
            sender: 'Bob',
            message: 'Hi, Alice!',
            color: { hex: () => '#0000ff' } as any,
            nameColor: undefined,
            raw: 'raw2',
            metadata: {}
        },
        {
            time: new Date('2024-01-01T12:02:00Z'),
            sender: 'Clair',
            message: '合并颜色',
            color: { hex: () => '#123456' } as any,
            nameColor: { hex: () => '#123456' } as any,
            raw: 'raw3',
            metadata: {}
        }
    ];

    const timeStr1 = '12:00'; // 假设formatTime短格式输出
    const timeStr2 = '12:01';

    it('StandardHTMLFormatter: 默认显示时间和人名', () => {
        const formatter = new StandardHTMLFormatter();
        const html = formatter.format(log);
        expect(html).toContain('color:silver');
        expect(html).toContain('&lt;Alice&gt;');
        expect(html).toContain('&lt;Bob&gt;');
        expect(html).toContain('color:#ff0000');
        expect(html).toContain('color:#0000ff');
    });

    it('StandardHTMLFormatter: 不显示时间', () => {
        const options: FormatterOptions = { showTime: false };
        const formatter = new StandardHTMLFormatter(options);
        const html = formatter.format(log);
        expect(html).not.toContain('color:silver');
        expect(html).toContain('&lt;Alice&gt;');
    });

    it('StandardHTMLFormatter: 不显示人名', () => {
        const options: FormatterOptions = { showSender: false };
        const formatter = new StandardHTMLFormatter(options);
        const html = formatter.format(log);
        expect(html).not.toContain('&lt;Alice&gt;');
        expect(html).toContain('color:silver');
    });

    it('StandardHTMLFormatter: 只显示消息', () => {
        const options: FormatterOptions = { showTime: false, showSender: false };
        const formatter = new StandardHTMLFormatter(options);
        const html = formatter.format(log);
        expect(html).not.toContain('color:silver');
        expect(html).not.toContain('&lt;Alice&gt;');
        expect(html).toContain('Hello, world!');
    });

    it('BBCodeFormatter: 默认显示时间和人名', () => {
        const formatter = new BBCodeFormatter();
        const bbcode = formatter.format(log);
        expect(bbcode).toContain('[color=silver]');
        expect(bbcode).toContain('<Alice>');
        expect(bbcode).toContain('Hello, world!');
        expect(bbcode).toContain('Hi, Alice!');
    });

    it('BBCodeFormatter: 不显示时间', () => {
        const options: FormatterOptions = { showTime: false };
        const formatter = new BBCodeFormatter(options);
        const bbcode = formatter.format(log);
        expect(bbcode).not.toContain('[color=silver]');
        expect(bbcode).toContain('<Alice>');
    });

    it('BBCodeFormatter: 不显示人名', () => {
        const options: FormatterOptions = { showSender: false };
        const formatter = new BBCodeFormatter(options);
        const bbcode = formatter.format(log);
        expect(bbcode).not.toContain('<Alice>');
        expect(bbcode).toContain('[color=silver]');
    });

    it('BBCodeFormatter: 只显示消息', () => {
        const options: FormatterOptions = { showTime: false, showSender: false };
        const formatter = new BBCodeFormatter(options);
        const bbcode = formatter.format(log);
        expect(bbcode).not.toContain('[color=silver]');
        expect(bbcode).not.toContain('<Alice>');
        expect(bbcode).toContain('Hello, world!');
    });

    it('BBCodeFormatter: nameColor不存在时合并包裹', () => {
        const formatter = new BBCodeFormatter();
        const bbcode = formatter.format(log);
        // Bob没有nameColor，应该合并包裹
        expect(bbcode).toContain('[color=#0000ff]<Bob>Hi, Alice![/color]');
        // 不应出现[color=#0000ff]<Bob>[/color][color=#0000ff]Hi, Alice![/color]
        expect(bbcode).not.toContain('[color=#0000ff]<Bob>[/color][color=#0000ff]Hi, Alice![/color]');
    });

    it('BBCodeFormatter: nameColor和senderColor相同时合并包裹', () => {
        const formatter = new BBCodeFormatter();
        const bbcode = formatter.format(log);
        // Clair的<Clair>和消息应该被同一个color包裹
        expect(bbcode).toContain('[color=#123456]<Clair>合并颜色[/color]');
        expect(bbcode).not.toContain('[color=#123456]<Clair>[/color][color=#123456]合并颜色[/color]');
    });

    it('BBCodeFormatter: nameColor和senderColor不同时分开包裹', () => {
        const formatter = new BBCodeFormatter();
        const bbcode = formatter.format(log);
        // Alice的<sender>和消息应该分开包裹
        expect(bbcode).toContain('[color=#00ff00]<Alice>[/color][color=#ff0000]Hello, world![/color]');
    });
}); 