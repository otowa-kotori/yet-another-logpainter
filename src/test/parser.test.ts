import { describe, it, expect } from 'vitest';
import { QQTextParser, IRCLogParser, FVTTLogParser, AutoDetectLogParser } from '../lib/core/parser';
import { createMessage } from './utils';

describe("QQTextParser", () => {
    const parser = new QQTextParser();

    it("should parse standard format with QQ number", () => {
        const raw = "2024-01-01 12:34:56 用户A(10001)\n让我看看这张照片";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date('2024-01-01T12:34:56'),
            sender: "用户A",
            message: "让我看看这张照片",
            raw
        })]);
    });

    it("should parse standard format without QQ number", () => {
        const raw = "2024-01-01 12:34:56 用户B\n翻了翻书页";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date('2024-01-01T12:34:56'),
            sender: "用户B",
            message: "翻了翻书页",
            raw
        })]);
    });

    it("should parse multiple messages", () => {
        const raw = "2024-01-01 12:34:56 用户C\n第一条消息\n\n2024-01-01 12:35:00 用户C\n第二条消息";
        const result = parser.parse(raw);
        expect(result).toEqual([
            createMessage({
                time: new Date('2024-01-01T12:34:56'),
                sender: "用户C",
                message: "第一条消息",
                raw: "2024-01-01 12:34:56 用户C\n第一条消息"
            }),
            createMessage({
                time: new Date('2024-01-01T12:35:00'),
                sender: "用户C",
                message: "第二条消息",
                raw: "2024-01-01 12:35:00 用户C\n第二条消息"
            })
        ]);
    });

    it("should parse standard format with single digit hour", () => {
        const raw = "2025-02-16 0:07:33 用户D(10002)\n你好";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date('2025-02-16T00:07:33'),
            sender: "用户D",
            message: "你好",
            raw
        })]);
    });
}); 

describe("IRCLogParser", () => {
    const parser = new IRCLogParser();

    it("should parse basic IRC format", () => {
        const raw = "12:34:56 <用户A> 你好世界";
        const result = parser.parse(raw);
        const today = new Date();
        expect(result).toEqual([createMessage({
            time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 34, 56),
            sender: "用户A",
            message: "你好世界",
            raw
        })]);
    });

    it("should parse multiple messages", () => {
        const raw = "12:34:56 <用户A> 第一条消息\n12:35:00 <用户B> 第二条消息";
        const result = parser.parse(raw);
        const today = new Date();
        expect(result).toEqual([
            createMessage({
                time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 34, 56),
                sender: "用户A", 
                message: "第一条消息",
                raw: "12:34:56 <用户A> 第一条消息"
            }),
            createMessage({
                time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 35, 0),
                sender: "用户B",
                message: "第二条消息", 
                raw: "12:35:00 <用户B> 第二条消息"
            })
        ]);
    });
});

describe("FVTTLogParser", () => {
    const parser = new FVTTLogParser();

    it("should parse basic FVTT format", () => {
        const raw = "[1/24/2025, 10:00:00 AM] 用户A\n这是一条消息\n---------------------------";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date("2025-01-24T10:00:00"),
            sender: "用户A",
            message: "这是一条消息",
            raw: "[1/24/2025, 10:00:00 AM] 用户A\n这是一条消息"
        })]);
    });

    it("should parse multiple messages", () => {
        const raw = "[1/24/2025, 10:00:00 AM] 用户A\n第一条消息\n---------------------------\n[1/24/2025, 10:01:00 AM] 用户B\n第二条消息\n---------------------------";
        const result = parser.parse(raw);
        expect(result).toEqual([
            createMessage({
                time: new Date("2025-01-24T10:00:00"),
                sender: "用户A",
                message: "第一条消息",
                raw: "[1/24/2025, 10:00:00 AM] 用户A\n第一条消息"
            }),
            createMessage({
                time: new Date("2025-01-24T10:01:00"),
                sender: "用户B", 
                message: "第二条消息",
                raw: "[1/24/2025, 10:01:00 AM] 用户B\n第二条消息"
            })
        ]);
    });
});

describe("AutoDetectLogParser", () => {
    const parser = new AutoDetectLogParser();

    it("应该能自动检测并解析QQ格式", () => {
        const raw = "2025-02-15 20:39:56 用户A\n消息内容";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date("2025-02-15T20:39:56"),
            sender: "用户A",
            message: "消息内容",
            raw: "2025-02-15 20:39:56 用户A\n消息内容"
        })]);
    });

    it("应该能自动检测并解析IRC格式", () => {
        const today = new Date();
        const raw = "12:34:56 <用户A> 消息内容";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 34, 56),
            sender: "用户A",
            message: "消息内容",
            raw: "12:34:56 <用户A> 消息内容"
        })]);
    });

    it("应该能自动检测并解析FVTT格式", () => {
        const raw = "[1/24/2025, 10:00:00 AM] 用户A\n消息内容\n---------------------------";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date("2025-01-24T10:00:00"),
            sender: "用户A",
            message: "消息内容",
            raw: "[1/24/2025, 10:00:00 AM] 用户A\n消息内容"
        })]);
    });

    it("当输入多种格式时应该选择解析结果最多的格式", () => {
        const raw = "无效格式\n[1/24/2025, 10:00:00 AM] 用户A\n消息1\n---------------------------\n[1/24/2025, 10:01:00 AM] 用户B\n消息2\n---------------------------";
        const result = parser.parse(raw);
        expect(result.length).toBe(2);
        expect(result[0].sender).toBe("用户A");
        expect(result[1].sender).toBe("用户B");
    });
});
