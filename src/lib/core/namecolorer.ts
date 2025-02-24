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
    private aliases: Map<string, string[]>;

    constructor(
        colors?: Map<string, chroma.Color>,
        aliases?: Map<string, string[]>
    ) {
        this.colors = colors ?? new Map();
        this.aliases = aliases ?? new Map();
        
        this.aliases_to_name = new Map();
        this.aliases.forEach((aliasList, standardName) => {
            aliasList.forEach(alias => {
                this.aliases_to_name.set(alias, standardName);
            });
            this.aliases_to_name.set(standardName, standardName);
        });
    }

    getAliases(name: string): string[] {
        return this.aliases.get(name) ?? [];
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
        const newAliases = new Map(this.aliases);

        other.colors.forEach((color, name) => {
            newColors.set(name, color);
        });
        other.aliases.forEach((aliasList, name) => {
            const existingAliases = newAliases.get(name) ?? [];
            newAliases.set(name, [...new Set([...existingAliases, ...aliasList])]);
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
        return new ColorConfig(newColors, this.aliases);
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
    const newAliases = new Map([[name, aliases]]);
    return new ColorConfig(newColors, newAliases);
}

/**  将以下格式的文本，转化成ColorConfig
 * 格式范例：
 * Alice red
 * 爱丽丝$小爱$alice
 * Bob blue
 * 鲍勃$bob
 * 每个定义包含了颜色行和别名行
 * 颜色行用空格分割，第一个为名字，第二个为颜色。
 * 别名行用$分割，分别代表不同的别名。
 * 如果没有别名，别名行为空
 * 如果输入为奇数行，则认为最后空了一个别名行。
 */
export function ParseColorConfig(text: string): ColorConfig {
    const lines = text.trim().split('\n').map(line => line.trim());
    const colors = new Map<string, chroma.Color>();
    const aliases = new Map<string, string[]>();

    // 每两行处理一组配置
    for (let i = 0; i < lines.length; i += 2) {
        // 处理颜色行
        const colorLine = lines[i];
        const [name, colorStr] = colorLine.split(/\s+/);
        if (!name || !colorStr) continue;

        let color: chroma.Color;
        try {
            color = chroma(colorStr);
        } catch (e) {
            // 如果颜色解析失败，使用黑色作为默认值
            color = chroma('black');
            console.warn(`Invalid color format for ${name}: ${colorStr}, using black instead`);
        }
        colors.set(name, color);

        // 处理别名行（如果存在且不为空）
        const aliasLine = lines[i + 1];
        if (aliasLine) {
            const aliasList = aliasLine.split('$').map(a => a.trim()).filter(a => a);
            if (aliasList.length > 0) {
                aliases.set(name, aliasList);
            }
        }
    }

    return new ColorConfig(colors, aliases);
}

/** 将ColorConfig转化成文本
 * 格式范例参见ParseColorConfig
 */
export function ColorConfigToText(config: ColorConfig): string {
    let result = '';
    const entries = config.getColorEntries();
    
    for (const [name, color] of entries) {
        // 添加颜色行
        result += `${name} ${color.hex()}\n`;
        
        // 添加别名行
        const aliasesList = config.getAliases(name);
        if (aliasesList.length > 0) {
            result += aliasesList.join('$');
        }
        result += '\n';
    }
    
    return result;
}

const MIN_DIFF = 20;

// 为多个名字分配颜色
export function AssignColors(config: ColorConfig, names: string[]): ColorConfig {
    let newConfig = config;

    for (const name of names) {
        // 获取标准名称并检查是否已有颜色
        const standardName = newConfig.getStandardName(name);
        if (newConfig.hasColor(standardName)) continue;

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
