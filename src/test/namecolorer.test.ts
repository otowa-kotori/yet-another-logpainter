import { describe, it, expect } from 'vitest';
import { ColorConfig, AssignColors, CreateColorConfig, default_colors } from '../lib/core/namecolorer';
import chroma from 'chroma-js';
import { ParseColorConfig } from '../lib/core/namecolorer';
import { ColorConfigToText } from '../lib/core/namecolorer';

describe("ColorConfig", () => {
    it("should return first default color for first name", () => {
        const config = new ColorConfig();
        const newConfig = AssignColors(config, ["Alice"]);
        const color = newConfig.getColor("Alice");
        expect(color.hex()).toBe(default_colors[0].color.hex());
    });

    it("should handle aliases", () => {
        const aliceConfig = CreateColorConfig("Alice", "red", ["A", "艾丽丝"]);
        
        expect(aliceConfig.getColor("A").hex()).toBe(chroma("red").hex());
        expect(aliceConfig.getColor("艾丽丝").hex()).toBe(chroma("red").hex());
        expect(aliceConfig.getColor("Alice").hex()).toBe(chroma("red").hex());
        
        expect(aliceConfig.getAliases("Alice")).toEqual(["A", "艾丽丝"]);
        expect(aliceConfig.getAliases("NonExistent")).toEqual([]);
    });

    it("should add different colors for different names", () => {
        const config = new ColorConfig();
        const newConfig = AssignColors(config, ["Alice", "Bob"]);
        
        const color1 = newConfig.getColor("Alice");
        const color2 = newConfig.getColor("Bob");
        
        expect(color1.hex()).not.toBe(color2.hex());
        expect(chroma.deltaE(color1, color2)).toBeGreaterThan(20);
    });

    it("should use black when no suitable color found", () => {
        let config = new ColorConfig();
        const names = Array.from({length: default_colors.length}, (_, i) => `User${i}`);
        config = AssignColors(config, names);
        config = AssignColors(config, ["ExtraUser"]);
        
        const color = config.getColor("ExtraUser");
        expect(color.hex()).toBe(chroma("black").hex());
    });

    it("should maintain color assignments when merging configs", () => {
        const aliceConfig = CreateColorConfig("Alice", "red");
        const bobConfig = CreateColorConfig("Bob", "blue");
        
        const mergedConfig = aliceConfig.merge(bobConfig);
        
        expect(mergedConfig.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(mergedConfig.getColor("Bob").hex()).toBe(chroma("blue").hex());
    });

    it("should handle similar colors correctly", () => {
        const user1Config = CreateColorConfig("User1", "#FF0000");
        const user2Config = CreateColorConfig("User2", "#FF1010");
        let config = user1Config.merge(user2Config);
        
        config = AssignColors(config, ["User3"]);
        const color3 = config.getColor("User3");
        
        expect(chroma.deltaE(color3, chroma("#FF0000"))).toBeGreaterThan(20);
        expect(chroma.deltaE(color3, chroma("#FF1010"))).toBeGreaterThan(20);
    });

    it("should get standard name through aliases", () => {
        const aliceConfig = CreateColorConfig("Alice", "red", ["A", "艾丽丝"]);
        
        expect(aliceConfig.getStandardName("A")).toBe("Alice");
        expect(aliceConfig.getStandardName("艾丽丝")).toBe("Alice");
        expect(aliceConfig.getStandardName("Bob")).toBe("Bob");
    });

    it("should maintain color assignments and aliases when merging configs", () => {
        const aliceConfig = CreateColorConfig("Alice", "red", ["A", "艾丽丝"]);
        const bobConfig = CreateColorConfig("Bob", "blue", ["B", "鲍勃"]);
        
        const mergedConfig = aliceConfig.merge(bobConfig);
        
        expect(mergedConfig.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(mergedConfig.getColor("Bob").hex()).toBe(chroma("blue").hex());
        
        expect(mergedConfig.getAliases("Alice")).toEqual(["A", "艾丽丝"]);
        expect(mergedConfig.getAliases("Bob")).toEqual(["B", "鲍勃"]);
        
        expect(mergedConfig.getColor("艾丽丝").hex()).toBe(chroma("red").hex());
        expect(mergedConfig.getColor("鲍勃").hex()).toBe(chroma("blue").hex());
    });

    it("should merge aliases without duplicates", () => {
        const config1 = CreateColorConfig("Alice", "red", ["A", "艾丽丝"]);
        const config2 = CreateColorConfig("Alice", "blue", ["A", "alice"]);
        
        const mergedConfig = config1.merge(config2);
        
        expect(mergedConfig.getAliases("Alice")).toEqual(["A", "艾丽丝", "alice"]);
        expect(mergedConfig.getColor("Alice").hex()).toBe(chroma("blue").hex());
    });

    it("should return correct entries", () => {
        const config = CreateColorConfig("Alice", "red", ["A", "艾丽丝"]);
        const entries = config.getEntries();
        
        expect(entries.length).toBe(1);
        const entry = entries[0];
        
        expect(entry.name).toBe("Alice");
        expect(entry.color.hex()).toBe(chroma("red").hex());
        expect(entry.aliases).toEqual(["A", "艾丽丝"]);
    });
});

describe("ParseColorConfig", () => {
    it("should parse basic color config without aliases", () => {
        const input = `
            Alice red
            
            Bob blue
            
        `;
        const config = ParseColorConfig(input);
        
        expect(config.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(config.getColor("Bob").hex()).toBe(chroma("blue").hex());
        expect(config.getAliases("Alice")).toEqual([]);
        expect(config.getAliases("Bob")).toEqual([]);
    });

    it("should parse color config with multiple aliases", () => {
        const input = `
            Alice red
            艾丽丝$A$alice
            Bob blue
            鲍勃$B$bob
        `;
        const config = ParseColorConfig(input);
        
        expect(config.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(config.getColor("艾丽丝").hex()).toBe(chroma("red").hex());
        expect(config.getColor("A").hex()).toBe(chroma("red").hex());
        expect(config.getAliases("Alice")).toEqual(["艾丽丝", "A", "alice"]);
        
        expect(config.getColor("Bob").hex()).toBe(chroma("blue").hex());
        expect(config.getColor("鲍勃").hex()).toBe(chroma("blue").hex());
        expect(config.getAliases("Bob")).toEqual(["鲍勃", "B", "bob"]);
    });

    it("should parse color config with single alias", () => {
        const input = `
            Alice red
            艾丽丝
            Bob blue
            鲍勃
        `;
        const config = ParseColorConfig(input);
        
        expect(config.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(config.getColor("艾丽丝").hex()).toBe(chroma("red").hex());
        expect(config.getAliases("Alice")).toEqual(["艾丽丝"]);
        
        expect(config.getColor("Bob").hex()).toBe(chroma("blue").hex());
        expect(config.getColor("鲍勃").hex()).toBe(chroma("blue").hex());
        expect(config.getAliases("Bob")).toEqual(["鲍勃"]);
    });

    it("should handle invalid color format", () => {
        const input = `
            Alice invalid_color
            艾丽丝
        `;
        const config = ParseColorConfig(input);
        
        expect(config.getColor("Alice").hex()).toBe(chroma("black").hex());
        expect(config.getColor("艾丽丝").hex()).toBe(chroma("black").hex());
        expect(config.getAliases("Alice")).toEqual(["艾丽丝"]);
    });

    it("should handle odd number of lines", () => {
        const input = `
            Alice red
            艾丽丝
            Bob blue
        `;
        const config = ParseColorConfig(input);
        
        expect(config.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(config.getAliases("Alice")).toEqual(["艾丽丝"]);
        expect(config.getColor("Bob").hex()).toBe(chroma("blue").hex());
        expect(config.getAliases("Bob")).toEqual([]);
    });

    it("should ignore empty alias lines", () => {
        const input = `
            Alice red

            Bob blue
            
        `;
        const config = ParseColorConfig(input);
        
        expect(config.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(config.getAliases("Alice")).toEqual([]);
        expect(config.getColor("Bob").hex()).toBe(chroma("blue").hex());
        expect(config.getAliases("Bob")).toEqual([]);
    });

    it("should handle malformed color lines", () => {
        const input = `
            Alice
            艾丽丝
            only_name
            别名
        `;
        const config = ParseColorConfig(input);
        
        // 应该跳过没有颜色值的行
        expect(config.getEntries().length).toBe(0);
    });

    it("should create correct ColorEntry structure", () => {
        const input = `
            Alice red
            艾丽丝$A$alice
        `;
        const config = ParseColorConfig(input);
        
        // 验证标准名称的颜色和别名
        expect(config.getColor("Alice").hex()).toBe(chroma("red").hex());
        expect(config.getAliases("Alice")).toEqual(["艾丽丝", "A", "alice"]);
        
        // 验证所有别名都指向相同的颜色
        const aliceColor = config.getColor("Alice").hex();
        expect(config.getColor("艾丽丝").hex()).toBe(aliceColor);
        expect(config.getColor("A").hex()).toBe(aliceColor);
        expect(config.getColor("alice").hex()).toBe(aliceColor);
    });
});

describe("ColorConfigToText", () => {
    it("should convert basic config without aliases", () => {
        const config = CreateColorConfig("Alice", "#FF0000");
        const text = ColorConfigToText(config);
        const expected = "Alice #ff0000\n\n";
        expect(text).toBe(expected);
    });

    it("should convert config with single alias", () => {
        const config = CreateColorConfig("Alice", "#FF0000", ["艾丽丝"]);
        const text = ColorConfigToText(config);
        const expected = "Alice #ff0000\n艾丽丝\n";
        expect(text).toBe(expected);
    });

    it("should convert config with multiple aliases", () => {
        const config = CreateColorConfig("Alice", "#FF0000", ["艾丽丝", "A", "alice"]);
        const text = ColorConfigToText(config);
        const expected = "Alice #ff0000\n艾丽丝$A$alice\n";
        expect(text).toBe(expected);
    });

    it("should convert merged configs", () => {
        const aliceConfig = CreateColorConfig("Alice", "#FF0000", ["艾丽丝"]);
        const bobConfig = CreateColorConfig("Bob", "#0000FF", ["鲍勃"]);
        const mergedConfig = aliceConfig.merge(bobConfig);
        
        const text = ColorConfigToText(mergedConfig);
        const expected = "Alice #ff0000\n艾丽丝\nBob #0000ff\n鲍勃\n";
        expect(text).toBe(expected);
    });

    it("should handle round trip conversion", () => {
        const originalConfig = CreateColorConfig("Alice", "#FF0000", ["艾丽丝", "A"]);
        const text = ColorConfigToText(originalConfig);
        const parsedConfig = ParseColorConfig(text);
        
        // 验证颜色是否一致
        expect(parsedConfig.getColor("Alice").hex()).toBe(originalConfig.getColor("Alice").hex());
        expect(parsedConfig.getColor("艾丽丝").hex()).toBe(originalConfig.getColor("艾丽丝").hex());
        
        // 验证别名是否一致
        expect(parsedConfig.getAliases("Alice")).toEqual(originalConfig.getAliases("Alice"));
    });
}); 