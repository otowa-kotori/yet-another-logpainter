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
    private colors: Map<string, chroma.Color>;
    private aliases_to_name: Map<string, string>;

    constructor(
        colors?: Map<string, chroma.Color>,
        aliases_to_name?: Map<string, string>
    ) {
        this.colors = colors ?? new Map();
        this.aliases_to_name = aliases_to_name ?? new Map();
    }

    // 获取某个名字对应的颜色
    getColor(name: string): chroma.Color {
        const standardName = this.getStandardName(name);
        return this.colors.get(standardName) ?? chroma('black');
    }

    hasColor(name: string): boolean {
        return this.colors.has(name);
    }

    getAllColors(): chroma.Color[] {
        return Array.from(this.colors.values());
    }

    // 获取名字的标准形式（通过别名映射）
    getStandardName(name: string): string {
        return this.aliases_to_name.get(name) ?? name;
    }

    // 创建新的配置
    merge(other: ColorConfig): ColorConfig {
        const newColors = new Map(this.colors);
        const newAliases = new Map(this.aliases_to_name);

        other.colors.forEach((color, name) => {
            newColors.set(name, color);
        });
        other.aliases_to_name.forEach((standardName, alias) => {
            newAliases.set(alias, standardName);
        });

        return new ColorConfig(newColors, newAliases);
    }

    // 获取所有名字和颜色
    getColorEntries(): [string, chroma.Color][] {
        return Array.from(this.colors.entries());
    }

    setColor(name: string, color: chroma.Color | string): ColorConfig {
        const newColors = new Map(this.colors);
        newColors.set(name, typeof color === 'string' ? chroma(color) : color);
        return new ColorConfig(newColors, this.aliases_to_name);
    }
}

// 创建单个名字的配置
export function CreateColorConfig(
    name: string,
    color: chroma.Color | string,
    aliases: string[] = []
): ColorConfig {
    const chromaColor = typeof color === 'string' ? chroma(color) : color;
    
    const newColors = new Map([[name, chromaColor]]);
    const newAliases = new Map(
        [name, ...aliases].map(alias => [alias, name])
    );

    return new ColorConfig(newColors, newAliases);
}

const MIN_DIFF = 20;

// 为多个名字分配颜色
export function AssignColors(config: ColorConfig, names: string[]): ColorConfig {
    let newConfig = config;

    for (const name of names) {
        if (newConfig.hasColor(name)) continue;

        // 如果没有已使用的颜色，直接使用第一个默认颜色
        const usedColors = newConfig.getAllColors();
        if (!usedColors.length) {
            newConfig = newConfig.merge(CreateColorConfig(name, default_colors[0].color));
            continue;
        }

        // 寻找差异足够大的颜色
        const selectedColor = default_colors.find(defaultColor => {
            return !usedColors.some(usedColor => 
                chroma.deltaE(usedColor, defaultColor.color) <= MIN_DIFF
            );
        });

        const finalColor = selectedColor?.color ?? chroma('black');
        newConfig = newConfig.merge(CreateColorConfig(name, finalColor));
    }

    return newConfig;
}
