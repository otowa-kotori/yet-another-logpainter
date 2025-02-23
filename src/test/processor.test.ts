import { describe, it, expect } from 'vitest';
import * as processors from '../lib/core/processor';
import { createMessage } from './utils';

describe("RemoveImageProcessor", () => {
    it("should remove [图片] from message", () => {
        const imageProcessor = new processors.RemoveImageProcessor();
        const log = [createMessage({ 
            message: "让我看看这张照片 [图片] 不错"
        })];
        const result = imageProcessor.process(log);
        expect(result).toEqual([createMessage({ 
            message: "让我看看这张照片  不错"
        })]);
    })  
})

describe("RemoveEmptyMessageProcessor", () => {
    it("should remove empty message", () => {
        const emptyProcessor = new processors.RemoveEmptyMessageProcessor();
        const log = [createMessage({
            message: ""
        })];
        const result = emptyProcessor.process(log);
        expect(result).toEqual([]); 
    })
})

describe("ReplaceMeProcessor", () => {
    it("should replace /me with sender", () => {
        const replaceProcessor = new processors.ReplaceMeProcessor();
        const log = [createMessage({ 
            sender: "A",
            message: "/me 翻了翻书页"
        })];
        const result = replaceProcessor.process(log);
        expect(result).toEqual([createMessage({ 
            sender: "A",
            message: "A翻了翻书页"
        })]);
    })

    it("should replace /me with sender in the middle of the message", () => {
        const replaceProcessor = new processors.ReplaceMeProcessor();
        const log = [createMessage({ 
            sender: "B",
            message: "看完了这本书 /me 合上书本"
        })];
        const result = replaceProcessor.process(log);
        expect(result).toEqual([
            createMessage({
                sender: "B",
                message: "看完了这本书"
            }),
            createMessage({ 
                sender: "B",
                message: "B合上书本"
            })
        ]);
    })
})

describe("RemoveDiceCommandProcessor", () => {
    it("should remove dice command", () => {
        const removeProcessor = new processors.RemoveDiceCommandProcessor();
        const log = [createMessage({ 
            message: ".rd20"
        })];
        const result = removeProcessor.process(log);
        expect(result).toEqual([]);
    })
})

describe("RemoveParenthesesProcessor", () => {
    it("should remove parentheses", () => {
        const removeProcessor = new processors.RemoveParenthesesProcessor();
        const log = [createMessage({
            message: "(掷骰子)"
        })];
        const result = removeProcessor.process(log);
        expect(result).toEqual([]);
    })
})

describe("SplitMultilineProcessor", () => {
    it("should split multiline message into multiple messages", () => {
        const splitProcessor = new processors.SplitMultilineProcessor();
        const log = [createMessage({ 
            message: "第一行\n第二行\n第三行"
        })];
        const result = splitProcessor.process(log);
        expect(result).toEqual([
            createMessage({ message: "第一行" }),
            createMessage({ message: "第二行" }),
            createMessage({ message: "第三行" })
        ]);
    })

    it("should handle empty lines", () => {
        const splitProcessor = new processors.SplitMultilineProcessor();
        const log = [createMessage({ 
            message: "第一行\n\n第三行"
        })];
        const result = splitProcessor.process(log);
        expect(result).toEqual([
            createMessage({ message: "第一行" }),
            createMessage({ message: "第三行" })
        ]);
    })

    it("should preserve single line message", () => {
        const splitProcessor = new processors.SplitMultilineProcessor();
        const log = [createMessage({ 
            message: "单行消息"
        })];
        const result = splitProcessor.process(log);
        expect(result).toEqual([
            createMessage({ message: "单行消息" })
        ]);
    })
})
