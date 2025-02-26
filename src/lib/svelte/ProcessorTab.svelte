<script lang="ts">
    import type { ProcessorConfig } from '$lib/core/config';

    export let processorConfig: ProcessorConfig;
    export let onConfigUpdate: (config: ProcessorConfig) => void;

    const processors = [
        { id: 'splitMultiline', label: '分割多行消息' },
        { id: 'removeImage', label: '移除图片' },
        { id: 'replaceMe', label: '替换/me命令' },
        { id: 'removeDiceCommand', label: '移除骰子指令' },
        { id: 'removeParentheses', label: '移除括号内容' },
        { id: 'removeEmptyMessage', label: '移除空消息' }
    ];

    function handleChange(id: keyof ProcessorConfig) {
        const newConfig = { ...processorConfig };
        newConfig[id] = !newConfig[id];
        onConfigUpdate(newConfig);
    }
</script>

<div class="processor-settings">
    <h3>文本处理器设置</h3>
    <div class="processor-list">
        {#each processors as processor}
            <label class="processor-item">
                <input
                    type="checkbox"
                    checked={processorConfig[processor.id as keyof ProcessorConfig]}
                    on:change={() => handleChange(processor.id as keyof ProcessorConfig)}
                />
                {processor.label}
            </label>
        {/each}
    </div>
</div>

<style>
    .processor-settings {
        padding: 1rem;
    }

    .processor-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .processor-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    h3 {
        margin-bottom: 1rem;
    }
</style> 