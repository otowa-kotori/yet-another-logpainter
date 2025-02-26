export interface ProcessorConfig {
    splitMultiline: boolean;
    removeImage: boolean;
    replaceMe: boolean;
    removeDiceCommand: boolean;
    removeParentheses: boolean;
    removeEmptyMessage: boolean;
}

export const DEFAULT_PROCESSOR_CONFIG: ProcessorConfig = {
    splitMultiline: true,
    removeImage: true,
    replaceMe: true,
    removeDiceCommand: true,
    removeParentheses: true,
    removeEmptyMessage: true
};

export class ConfigManager {
    private static instance: ConfigManager;
    public config: ProcessorConfig;

    private constructor() {
        this.config = DEFAULT_PROCESSOR_CONFIG;
    }

    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    updateConfig(newConfig: ProcessorConfig) {
        this.config = newConfig;
    }
} 