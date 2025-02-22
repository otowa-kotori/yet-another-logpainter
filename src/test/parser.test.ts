import { describe, it, expect } from 'vitest';
import { QQTextParser } from '../lib/core/parser';
import { createMessage } from './utils';

describe("QQTextParser", () => {
    const parser = new QQTextParser();

    it("should parse standard format with QQ number", () => {
        const raw = "2024-01-01 12:34:56 阿洛(123456)\n让我看看这张照片";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date('2024-01-01T12:34:56'),
            sender: "阿洛",
            message: "让我看看这张照片",
            raw
        })]);
    });

    it("should parse standard format without QQ number", () => {
        const raw = "2024-01-01 12:34:56 阿洛\n翻了翻书页";
        const result = parser.parse(raw);
        expect(result).toEqual([createMessage({
            time: new Date('2024-01-01T12:34:56'),
            sender: "阿洛",
            message: "翻了翻书页",
            raw
        })]);
    });

    it("should parse multiple messages", () => {
        const raw = "2024-01-01 12:34:56 阿洛\n第一条消息\n\n2024-01-01 12:35:00 阿洛\n第二条消息";
        const result = parser.parse(raw);
        expect(result).toEqual([
            createMessage({
                time: new Date('2024-01-01T12:34:56'),
                sender: "阿洛",
                message: "第一条消息",
                raw: "2024-01-01 12:34:56 阿洛\n第一条消息"
            }),
            createMessage({
                time: new Date('2024-01-01T12:35:00'),
                sender: "阿洛",
                message: "第二条消息",
                raw: "2024-01-01 12:35:00 阿洛\n第二条消息"
            })
        ]);
    });
});