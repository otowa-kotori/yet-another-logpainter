import { describe, it, expect } from 'vitest';
import * as processors from '../lib/core/processor';
import { createMessage } from './utils';

describe("RemoveImageProcessor", () => {
    it("should remove [图片] from message", () => {
        const imageProcessor = new processors.RemoveImageProcessor();
        const log = [createMessage({ 
            message: "让我看看这张照片 [图片] 不错", 
            sender: "阿洛",
            raw: "2024-01-01 12:34:56 阿洛\n让我看看这张照片 [图片] 不错"
        })];
        const result = imageProcessor.process(log);
        expect(result).toEqual([createMessage({ 
            message: "让我看看这张照片  不错", 
            sender: "阿洛",
            raw: "2024-01-01 12:34:56 阿洛\n让我看看这张照片 [图片] 不错"
        })]);
    })  
})

describe("RemoveEmptyMessageProcessor", () => {
    it("should remove empty message", () => {
        const emptyProcessor = new processors.RemoveEmptyMessageProcessor();
        const log = [createMessage({ 
            sender: "阿洛",
            raw: "2024-01-01 12:34:56 阿洛\n"
        })];
        const result = emptyProcessor.process(log);
        expect(result).toEqual([]); 
    })
})

describe("ReplaceMeProcessor", () => {
    it("should replace /me with sender", () => {
        const replaceProcessor = new processors.ReplaceMeProcessor();
        const log = [createMessage({ 
            message: "/me 翻了翻书页", 
            sender: "阿洛",
            raw: "2024-01-01 12:34:56 阿洛\n/me 翻了翻书页"
        })];
        const result = replaceProcessor.process(log);
        expect(result).toEqual([createMessage({ 
            message: "阿洛翻了翻书页", 
            sender: "阿洛",
            raw: "2024-01-01 12:34:56 阿洛\n/me 翻了翻书页"
        })]);
    })

    it("should replace /me with sender in the middle of the message", () => {
        const replaceProcessor = new processors.ReplaceMeProcessor();
        const log = [createMessage({ 
            message: "看完了这本书 /me 合上书本", 
            sender: "阿洛",
            raw: "2024-01-01 12:34:56 阿洛\n看完了这本书 /me 合上书本"
        })];
        const result = replaceProcessor.process(log);
        expect(result).toEqual([
            createMessage({ 
                message: "看完了这本书", 
                sender: "阿洛",
                raw: "2024-01-01 12:34:56 阿洛\n看完了这本书 /me 合上书本"
            }),
            createMessage({ 
                message: "阿洛合上书本", 
                sender: "阿洛",
                raw: "2024-01-01 12:34:56 阿洛\n看完了这本书 /me 合上书本"
            })
        ]);
    })
})
