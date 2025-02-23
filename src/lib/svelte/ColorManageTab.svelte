<script lang="ts">
    import type { ColorConfig } from '$lib/core/namecolorer';

    export let colorConfig: ColorConfig;

    // 获取颜色映射并转换为数组
    $: senders = Array.from(colorConfig.colors.entries()).map(([name, color]) => ({
        name,
        color
    }));
</script>

<div class="color-manage">
    <h3>颜色管理</h3>
    {#if !senders.length}
        <p class="empty-notice">请先在输入框中粘贴聊天记录</p>
    {:else}
        <div class="sender-list">
            {#each senders as sender}
                <div class="sender-item">
                    <span class="sender-name" style="color: {sender.color}">{sender.name}</span>
                    <div class="color-preview" style="background-color: {sender.color}"></div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .color-manage {
        padding: 1rem 2rem;
    }

    h3 {
        margin: 0 0 1rem 0;
        color: #333;
    }

    .empty-notice {
        color: #666;
        font-style: italic;
    }

    .sender-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }

    .sender-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        border: 1px solid #eee;
        border-radius: 4px;
    }

    .sender-name {
        font-weight: 500;
    }

    .color-preview {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid #ddd;
    }
</style> 