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

interface ColorEntryJSON {
    name: string;
    color: string;
    aliases: string[];
    disabled?: boolean;
}

// 新增 ColorEntry 类来管理单个颜色的所有信息
class ColorEntry {
    constructor(
        public readonly name: string,
        public readonly color: chroma.Color,
        public readonly aliases: string[] = [],
        public readonly disabled: boolean
    ) {}

    static fromJSON(json: ColorEntryJSON): ColorEntry {
        return new ColorEntry(
            json.name, 
            chroma(json.color), 
            json.aliases, 
            json.disabled ?? false
        );
    }

    toJSON(): ColorEntryJSON {
        const result: ColorEntryJSON = {
            name: this.name,
            color: this.color.hex(),
            aliases: this.aliases
        };
        
        if (this.disabled) {
            result.disabled = true;
        }
        
        return result;
    }
}

export class ColorConfig {
    private readonly entriesMap: Map<string, ColorEntry>;
    private readonly aliases_to_name: Map<string, string>;
    public readonly entries: ColorEntry[];

    constructor(entries?: ColorEntry[]) {
        this.entries = entries ?? [];
        
        // 构建查找映射
        this.entriesMap = new Map(
            this.entries.map(entry => [entry.name, entry])
        );
        
        // 构建别名映射
        this.aliases_to_name = new Map();
        this.entries.forEach(entry => {
            entry.aliases.forEach(alias => {
                this.aliases_to_name.set(alias, entry.name);
            });
            this.aliases_to_name.set(entry.name, entry.name);
        });
    }

    getAliases(name: string): string[] {
        return this.entriesMap.get(name)?.aliases ?? [];
    }

    getColor(name: string): chroma.Color {
        const standardName = this.getStandardName(name);
        return this.entriesMap.get(standardName)?.color ?? chroma('black');
    }

    hasColor(name: string): boolean {
        return this.entriesMap.has(name);
    }

    getAllColors(): chroma.Color[] {
        return this.entries.map(entry => entry.color);
    }

    getStandardName(name: string): string {
        return this.aliases_to_name.get(name) ?? name;
    }

    merge(other: ColorConfig): ColorConfig {
        const newEntries = [...this.entries];
        const existingNames = new Set(newEntries.map(e => e.name));
        
        other.entries.forEach(entry => {
            const index = newEntries.findIndex(e => e.name === entry.name);
            if (index !== -1) {
                // 合并别名，去重
                const mergedAliases = [...new Set([...newEntries[index].aliases, ...entry.aliases])];
                newEntries[index] = new ColorEntry(
                    entry.name,
                    entry.color,
                    mergedAliases,
                    entry.disabled
                );
            } else if (!existingNames.has(entry.name)) {
                newEntries.push(entry);
            }
        });

        return new ColorConfig(newEntries);
    }

    setColor(name: string, color: chroma.Color | string): ColorConfig {
        const chromaColor = typeof color === 'string' ? chroma(color) : color;
        const index = this.entries.findIndex(e => e.name === name);
        if (index === -1) return this;

        const newEntries = [...this.entries];
        const existingEntry = newEntries[index];
        newEntries[index] = new ColorEntry(
            name,
            chromaColor,
            existingEntry.aliases,
            existingEntry.disabled
        );
        
        return new ColorConfig(newEntries);
    }

    setDisabled(name: string, disabled: boolean): ColorConfig {
        const index = this.entries.findIndex(e => e.name === name);
        if (index === -1) return this;

        const newEntries = [...this.entries];
        const existingEntry = newEntries[index];
        newEntries[index] = new ColorEntry(
            name,
            existingEntry.color,
            existingEntry.aliases,
            disabled
        );
        
        return new ColorConfig(newEntries);
    }

    isDisabled(name: string): boolean {
        return this.entriesMap.get(name)?.disabled ?? false;
    }

    setName(oldName: string, newName: string): ColorConfig {
        const index = this.entries.findIndex(e => e.name === oldName);
        if (index === -1) return this;

        const newEntries = [...this.entries];
        const existingEntry = newEntries[index];
        
        // 检查新名字是否已存在或为别人的别名
        if (this.aliases_to_name.has(newName) && newName !== oldName) {
            console.warn(`Name ${newName} already exists, skipping rename of ${oldName}`);
            return this;
        }

        newEntries[index] = new ColorEntry(
            newName,
            existingEntry.color,
            existingEntry.aliases,
            existingEntry.disabled
        );
        
        return new ColorConfig(newEntries);
    }

    setAliases(name: string, newAliases: string[]): ColorConfig {
        const index = this.entries.findIndex(e => e.name === name);
        if (index === -1) return this;

        const newEntries = [...this.entries];
        const existingEntry = newEntries[index];
        
        // 检查新别名是否与其他条目的名字或别名冲突
        const conflictingAlias = newAliases.find(alias => {
            const owner = this.aliases_to_name.get(alias);
            return owner !== undefined && owner !== name;
        });
        
        if (conflictingAlias) {
            console.warn(`Alias ${conflictingAlias} already exists, skipping rename of ${name}`);
            return this;
        }

        newEntries[index] = new ColorEntry(
            name,
            existingEntry.color,
            newAliases,
            existingEntry.disabled
        );
        
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
    return new ColorConfig([new ColorEntry(name, chromaColor, aliases, false)]);
}

// 修改解析函数
export function ParseColorConfig(text: string): ColorConfig {
    const lines = text.trim().split('\n').map(line => line.trim());
    const entries: ColorEntry[] = [];

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
        
        entries.push(new ColorEntry(name, color, aliases, false));
    }

    return new ColorConfig(entries);
}

// 将YAML格式转化成ColorConfig，使用yaml库
export function YAMLToColorConfig(yamltext: string): ColorConfig {
    const jsonEntries = yaml.parse(yamltext);
    return new ColorConfig(jsonEntries.map((json:any) => ColorEntry.fromJSON(json)));
}

// 将ColorConfig转化成YAML格式，使用yaml库
export function ColorConfigToYAMLText(config: ColorConfig): string {
    const entries = config.entries.map(entry => entry.toJSON());
    return yaml.stringify(entries);
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
