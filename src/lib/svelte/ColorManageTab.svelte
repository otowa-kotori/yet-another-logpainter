<script lang="ts">
    import { ColorConfig } from '$lib/core/namecolorer';
    import { default_colors } from '$lib/core/namecolorer';

    export let colorConfig: ColorConfig;
    export let onColorUpdate: (name: string, newColor: string) => void;

    // 获取颜色映射并转换为数组
    $: senders = Array.from(colorConfig.colors.entries()).map(([name, color]) => ({
        name,
        color
    }));
    function updateColor(name: string, newColor: string) {
        console.log(`Updating color for ${name} to ${newColor}`);
        onColorUpdate(name, newColor);
    }

    // 控制下拉菜单的显示
    let activeDropdown: string | null = null;

    function toggleDropdown(name: string) {
        activeDropdown = activeDropdown === name ? null : name;
    }

    function openColorPicker(event: MouseEvent) {
        const input = (event.currentTarget as HTMLElement)
            .querySelector('input[type="color"]') as HTMLInputElement;
        input.click();
    }
</script>

<div class="color-manage">
    <h3>颜色管理</h3>
    {#if !senders.length}
        <p class="empty-notice">请先在输入框中粘贴聊天记录</p>
    {:else}
        <div class="sender-list">
            {#each senders as sender}
                <div class="sender-item">
                    <div class="sender-info">
                        <span class="sender-name" style="color: {sender.color}">{sender.name}</span>
                        <button 
                            class="color-btn"
                            style="background-color: {sender.color}"
                            on:click={() => toggleDropdown(sender.name)}
                        >选择颜色</button>
                    </div>
                    {#if activeDropdown === sender.name}
                        <div class="color-dropdown">
                            <button 
                                class="color-option"
                                on:click={openColorPicker}
                            >
                                <input 
                                    type="color" 
                                    value={sender.color}
                                    class="color-picker"
                                    on:input={(e) => {
                                        updateColor(sender.name, e.currentTarget.value);
                                        toggleDropdown(sender.name);
                                    }}
                                >
                                <span class="color-preview" style="background-color: {sender.color}"></span>
                                <span class="color-name">自定义</span>
                            </button>
                            {#each default_colors as color}
                                <button 
                                    class="color-option"
                                    on:click={() => {
                                        updateColor(sender.name, color.color.hex());
                                        toggleDropdown(sender.name);
                                    }}
                                >
                                    <span class="color-preview" style="background-color: {color.color.hex()}"></span>
                                    <span class="color-name">{color.name}</span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    <h3>颜色导入/导出(未实现)</h3>
    <textarea class="input-textarea" id="color-config-textarea"></textarea>
    <button class="import-btn">导入</button>
    <button class="export-btn">导出</button>
</div>

<style>
    /* 基础样式 */
    .color-manage {
        padding: 1rem;
    }

    h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.2rem;
    }

    /* 合并共同的边框和背景样式 */
    .sender-item,
    .color-dropdown {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
    }

    /* 列表布局 */
    .sender-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        padding: 1rem;
        position: relative;
        overflow: visible;
    }

    .sender-item {
        position: relative;
        padding: 0.75rem;
    }

    /* 发送者信息布局 */
    .sender-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* 合并文本样式 */
    .sender-name,
    .color-name {
        color: #333;
    }

    .sender-name {
        font-weight: 500;
        font-size: 0.9rem;
    }

    .color-name {
        font-size: 0.85rem;
    }

    /* 按钮样式 */
    .color-btn {
        padding: 0.25rem 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        color: white;
        height: 28px;
        line-height: 1;
    }

    /* 下拉菜单样式 */
    .color-dropdown {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        right: 0;
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
    }

    /* 颜色选项样式 */
    .color-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.5rem;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 4px;
    }

    .color-option:hover {
        background-color: #f5f5f5;
    }

    .color-preview {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
    }

    /* 辅助样式 */
    .empty-notice {
        color: #666;
        font-style: italic;
    }

    .color-picker {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        padding: 0;
        margin: 0;
        pointer-events: none;
    }

    .input-textarea {
        width: 100%;
        min-height: 150px;
        margin-bottom: 1rem;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-size: 0.8rem;
    }
</style> 