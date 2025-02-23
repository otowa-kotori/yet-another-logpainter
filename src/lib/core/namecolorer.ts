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

export class ColorConfig {
    public colors: Map<string, chroma.Color>;
    public aliases_to_name: Map<string, string>;
    private _version = 0;

    constructor() {
        this.colors = new Map();
        this.aliases_to_name = new Map();
    }

    get version() {
        return this._version;
    }

    incrementVersion() {
        this._version++;
    }
}

const MIN_DIFF = 20;

// 为多个名字分配颜色
export function AssignColors(config: ColorConfig, names: string[]): ColorConfig {
    const newConfig = new ColorConfig();
    newConfig.colors = new Map(config.colors);
    newConfig.aliases_to_name = new Map(config.aliases_to_name);

    for (const name of names) {
        if (newConfig.colors.has(name)) continue;

        // 如果没有已使用的颜色，直接使用第一个默认颜色
        const usedColors = Array.from(newConfig.colors.values());
        if (!usedColors.length) {
            newConfig.colors.set(name, default_colors[0].color);
            newConfig.aliases_to_name.set(name, name);
            continue;
        }

        // 寻找差异足够大的颜色
        const selectedColor = default_colors.find(defaultColor => {
            return !usedColors.some(usedColor => 
                chroma.deltaE(usedColor, defaultColor.color) <= MIN_DIFF
            );
        });

        const finalColor = selectedColor?.color ?? chroma('black');
        newConfig.colors.set(name, finalColor);
        newConfig.aliases_to_name.set(name, name);
    }

    newConfig.incrementVersion();
    return newConfig;
}

// 获取名字的标准形式（通过别名映射）
export function GetStandardName(config: ColorConfig, name: string): string {
    return config.aliases_to_name.get(name) || name;
}

// 获取某个名字对应的颜色
export function GetColor(config: ColorConfig, name: string): chroma.Color {
    const standardName = GetStandardName(config, name);
    return config.colors.get(standardName) || chroma('black');
}
