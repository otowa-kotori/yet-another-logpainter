import { describe, it, expect } from 'vitest';
import { ColorConfig, AssignColors, CreateColorConfig, default_colors } from '../lib/core/namecolorer';
import chroma from 'chroma-js';

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
}); 