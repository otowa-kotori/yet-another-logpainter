import { describe, it, expect } from 'vitest';
import { NameColorer, default_colors } from '../lib/core/namecolorer';
import chroma from 'chroma-js';

describe("NameColorer", () => {
    it("should return first default color for first name", () => {
        const colorer = new NameColorer();
        const color = colorer.getColor("Alice");
        expect(color.hex()).toBe(default_colors[0].color.hex());
    });

    it("should handle aliases", () => {
        const colorer = new NameColorer();
        colorer.addName("Alice", "red", ["A", "艾丽丝"]);
        
        expect(colorer.getColor("A").hex()).toBe(chroma("red").hex());
        expect(colorer.getColor("艾丽丝").hex()).toBe(chroma("red").hex());
        expect(colorer.getColor("Alice").hex()).toBe(chroma("red").hex());
    });

    it("should add different colors for different names", () => {
        const colorer = new NameColorer();
        const color1 = colorer.getColor("Alice");
        const color2 = colorer.getColor("Bob");
        
        expect(color1.hex()).not.toBe(color2.hex());
        expect(chroma.deltaE(color1, color2)).toBeGreaterThan(colorer.minDiff);
    });

    it("should use black when no suitable color found", () => {
        const colorer = new NameColorer();
        // 添加所有默认颜色
        default_colors.forEach((c, i) => {
            colorer.getColor(`User${i}`);
        });
        
        // 下一个用户应该得到黑色
        const color = colorer.getColor("ExtraUser");
        expect(color.hex()).toBe(chroma("black").hex());
    });

    it("should accept both string and chroma.Color", () => {
        const colorer = new NameColorer();
        colorer.addName("User1", "red");
        colorer.addName("User2", chroma("blue"));
        
        expect(colorer.getColor("User1").hex()).toBe(chroma("red").hex());
        expect(colorer.getColor("User2").hex()).toBe(chroma("blue").hex());
    });

    it("should maintain color assignments", () => {
        const colorer = new NameColorer();
        const color1 = colorer.getColor("Alice");
        const color2 = colorer.getColor("Alice");
        
        expect(color1.hex()).toBe(color2.hex());
    });

    it("should handle similar colors correctly", () => {
        const colorer = new NameColorer();
        
        colorer.addName("User1", "#FF0000");
        colorer.addName("User2", "#FF1010");
        
        const color3 = colorer.getColor("User3");
        
        expect(chroma.deltaE(color3, chroma("#FF0000"))).toBeGreaterThan(colorer.minDiff);
        expect(chroma.deltaE(color3, chroma("#FF1010"))).toBeGreaterThan(colorer.minDiff);
    });

    it("should skip similar colors in default list", () => {
        const colorer = new NameColorer();
        
        colorer.addName("User1", "#FF1010");
        
        const color2 = colorer.getColor("User2");
        expect(chroma.deltaE(color2, default_colors[0].color)).toBeGreaterThan(colorer.minDiff);
    });
}); 