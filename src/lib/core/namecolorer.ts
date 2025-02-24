/**
 * 根据名称对消息进行着色的管理器
 * 需要管理名称列表和对应颜色，以及每个名字对应的若干别名(alias)
 * 作为参数传递给ColorProcessor
 */

import chroma from 'chroma-js';
import yaml from 'yaml';

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

// 新增 ColorEntry 类来管理单个颜色的所有信息
class ColorEntry {
    constructor(
        public readonly name: string,
        public readonly color: chroma.Color,
        public readonly aliases: string[] = []
    ) {}
}

export class ColorConfig {
    private readonly entries: Map<string, ColorEntry>;
    private readonly aliases_to_name: Map<string, string>;

    constructor(entries?: Map<string, ColorEntry>) {
        this.entries = entries ?? new Map();
        
        // 重构别名映射的构建
        let aliases_to_name = new Map();
        this.entries.forEach(entry => {
            entry.aliases.forEach(alias => {
                aliases_to_name.set(alias, entry.name);
            });
            aliases_to_name.set(entry.name, entry.name);
        });
        this.aliases_to_name = aliases_to_name;
    }

    getAliases(name: string): string[] {
        return this.entries.get(name)?.aliases ?? [];
    }

    getColor(name: string): chroma.Color {
        const standardName = this.getStandardName(name);
        return this.entries.get(standardName)?.color ?? chroma('black');
    }

    hasColor(name: string): boolean {
        return this.entries.has(name);
    }

    getAllColors(): chroma.Color[] {
        return Array.from(this.entries.values()).map(entry => entry.color);
    }

    getStandardName(name: string): string {
        return this.aliases_to_name.get(name) ?? name;
    }

    merge(other: ColorConfig): ColorConfig {
        const newEntries = new Map(this.entries);
        
        other.entries.forEach((entry, name) => {
            const existingEntry = newEntries.get(name);
            if (existingEntry) {
                // 合并别名，去重
                const mergedAliases = [...new Set([...existingEntry.aliases, ...entry.aliases])];
                newEntries.set(name, new ColorEntry(name, entry.color, mergedAliases));
            } else {
                newEntries.set(name, entry);
            }
        });

        return new ColorConfig(newEntries);
    }

    getEntries(): ColorEntry[] {
        return Array.from(this.entries.values());
    }

    setColor(name: string, color: chroma.Color | string): ColorConfig {
        const chromaColor = typeof color === 'string' ? chroma(color) : color;
        const existingEntry = this.entries.get(name);
        const newEntries = new Map(this.entries);
        
        newEntries.set(name, new ColorEntry(
            name,
            chromaColor,
            existingEntry?.aliases ?? []
        ));
        
        return new ColorConfig(newEntries);
    }
}

// 修改创建单个颜色配置的函数
export function CreateColorConfig(
    name: string,
    color: chroma.Color | string,
    aliases: string[] = []
): ColorConfig {
    const chromaColor = typeof color === 'string' ? chroma(color) : color;
    const entries = new Map([[name, new ColorEntry(name, chromaColor, aliases)]]);
    return new ColorConfig(entries);
}

// 修改解析函数
export function ParseColorConfig(text: string): ColorConfig {
    const lines = text.trim().split('\n').map(line => line.trim());
    const entries = new Map<string, ColorEntry>();

    for (let i = 0; i < lines.length; i += 2) {
        const colorLine = lines[i];
        const [name, colorStr] = colorLine.split(/\s+/);
        if (!name || !colorStr) continue;

        let color: chroma.Color;
        try {
            color = chroma(colorStr);
        } catch (e) {
            color = chroma('black');
            console.warn(`Invalid color format for ${name}: ${colorStr}, using black instead`);
        }

        const aliasLine = lines[i + 1];
        const aliases = aliasLine ? aliasLine.split('$').map(a => a.trim()).filter(a => a) : [];
        
        entries.set(name, new ColorEntry(name, color, aliases));
    }

    return new ColorConfig(entries);
}

/** 将ColorConfig转化成YAML格式，使用yaml库
 */
export function ColorConfigToYAML(config: ColorConfig): string {
    return yaml.stringify(config.getEntries());
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
