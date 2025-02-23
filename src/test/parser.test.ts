import { describe, it, expect } from 'vitest';
import { QQTextParser } from '../lib/core/parser';
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