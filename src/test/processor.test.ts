import { describe, it, expect } from 'vitest';
import * as processors from '../lib/core/processor';
import { createMessage } from './utils';
import { ColorConfig, AssignColors, CreateColorConfig } from '../lib/core/namecolorer';
import chroma from 'chroma-js';

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

describe("ColorProcessor", () => {
    it("should add color to messages", () => {
        const colorConfig = CreateColorConfig("Alice", "red");
        const colorProcessor = new processors.ColorProcessor(colorConfig);
        const log = [
            createMessage({ sender: "Alice", message: "Hello" }),
            createMessage({ sender: "Bob", message: "Hi" })
        ];

        const result = colorProcessor.process(log);
        
        // 检查是否添加了颜色
        expect(result[0].color).toBeDefined();
        expect(result[1].color).toBeDefined();
        // 检查相同发送者是否获得正确颜色
        expect(result[0].color?.hex()).toBe(chroma("red").hex());
    });

    it("should maintain same color for same sender", () => {
        let colorConfig = new ColorConfig();
        colorConfig = AssignColors(colorConfig, ["Alice", "Bob"]);
        const colorProcessor = new processors.ColorProcessor(colorConfig);
        const log = [
            createMessage({ sender: "Alice", message: "First message" }),
            createMessage({ sender: "Bob", message: "Hi" }),
            createMessage({ sender: "Alice", message: "Second message" })
        ];

        const result = colorProcessor.process(log);
        
        // 检查同一发送者的两条消息颜色是否相同
        expect(result[0].color?.hex()).toBe(result[2].color?.hex());
        // 检查不同发送者的颜色是否不同
        expect(result[0].color?.hex()).not.toBe(result[1].color?.hex());
    });

    it("should preserve message content", () => {
        const colorConfig = new ColorConfig();
        const colorProcessor = new processors.ColorProcessor(colorConfig);
        const originalMessage = createMessage({ 
            sender: "Alice", 
            message: "Test message"
        });

        const [result] = colorProcessor.process([originalMessage]);
        
        expect(result.message).toBe(originalMessage.message);
        expect(result.sender).toBe(originalMessage.sender);
    });
    it("should handle disabled entries", () => {
        const colorConfig = CreateColorConfig("Alice", "red", [], "hidden");
        const colorProcessor = new processors.ColorProcessor(colorConfig);
        const log = [
            createMessage({ sender: "Alice", message: "Hello" }),
        ]
        const result = colorProcessor.process(log);
        expect(result).toEqual([]);
    })
    it("should handle preserve_alias entries", () => {
        const colorConfig = CreateColorConfig("Alice", "red", ["艾丽丝"], "preserve_alias");
        const colorProcessor = new processors.ColorProcessor(colorConfig);
        const log = [
            createMessage({ sender: "艾丽丝", message: "Hello" }),
        ]
        const result = colorProcessor.process(log);
        expect(result[0].sender).toBe("艾丽丝");
    })
});
