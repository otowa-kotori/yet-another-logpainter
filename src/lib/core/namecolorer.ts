/**
 * 根据名称对消息进行着色的管理器
 * 需要管理名称列表和对应颜色，以及每个名字对应的若干别名(alias)
 * 作为参数传递给ColorProcessor
 */

import chroma from 'chroma-js';

// 默认颜色列表
export const default_colors = [
    { color: chroma('red'), name: '红色' },
    { color: chroma('green'), name: '绿色' },
    { color: chroma('pink'), name: '粉红' },
    { color: chroma('orange'), name: '橘色' },
    { color: chroma('purple'), name: '紫色' },
    { color: chroma('black'), name: '黑色' },
    { color: chroma('blue'), name: '蓝色' },
    { color: chroma('yellow'), name: '黄色' },
    { color: chroma('beige'), name: '米色' },
    { color: chroma('brown'), name: '棕色' },
    { color: chroma('teal'), name: '蓝绿' },
    { color: chroma('navy'), name: '深蓝' },
    { color: chroma('maroon'), name: '紫红' },
    { color: chroma('limegreen'), name: '莱姆' },
    { color: chroma('white'), name: '白色' },
    { color: chroma('fuchsia'), name: '桃红' },
    { color: chroma('silver'), name: '灰色' }
];

export class NameColorer {
    private colors: Map<string, chroma.Color>;
    private aliases_to_name: Map<string, string>;
    private readonly MIN_DIFF = 20;

    constructor() {
        this.colors = new Map();
        this.aliases_to_name = new Map();
    }

    addName(name: string, color: string | chroma.Color, alias?: string[]) {
        this.colors.set(name, typeof color === 'string' ? chroma(color) : color);
        if (alias) {
            alias.forEach(a => this.aliases_to_name.set(a, name));
        }
    }

    getColorRaw(name: string) {
        return this.colors.get(name);
    }

    // 获取颜色，如果颜色不存在，则按默认列表顺序选择差异足够大的颜色
    getColorOrAddDefault(name: string) {
        const color = this.getColorRaw(name);
        if (color) return color;

        // 如果没有已使用的颜色，直接使用第一个默认颜色
        const usedColors = Array.from(this.colors.values());
        if (!usedColors.length) {
            const firstColor = default_colors[0].color;
            this.addName(name, firstColor, [name]);
            return firstColor;
        }

        // 预先计算所有已用颜色的deltaE值，避免重复计算
        const selectedColor = default_colors.find(defaultColor => {
            // 只要找到一个小于阈值的差异就可以提前返回false
            return !usedColors.some(usedColor => 
                chroma.deltaE(usedColor, defaultColor.color) <= this.MIN_DIFF
            );
        });

        const finalColor = selectedColor?.color ?? chroma('black');
        this.addName(name, finalColor, [name]);
        return finalColor;
    }

    getAliases(name: string) {
        return this.aliases_to_name.get(name);
    }
    
    getColor(name: string) {
        const converted_name = this.getAliases(name) || name;
        return this.getColorOrAddDefault(converted_name);
    }

    get minDiff() {
        return this.MIN_DIFF;
    }
}
