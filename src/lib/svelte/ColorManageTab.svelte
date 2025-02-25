<script lang="ts">
    import { ColorConfig, YAMLToColorConfig, ColorConfigToYAMLText } from '$lib/core/namecolorer';
    import { default_colors } from '$lib/core/namecolorer';
    import { onMount } from 'svelte';
    import { dropzone } from '$lib/actions/dropzone';
    import { readFileWithEncoding } from '$lib/utils/fileUtils';
    import FloatingCopy from '$lib/svelte/FloatingCopy.svelte';

    export let colorConfig: ColorConfig;
    export let onColorConfigUpdate: (newConfig: ColorConfig) => void;

    // 获取颜色映射并转换为数组
    $: senders = colorConfig.entries;
    function updateColor(name: string, newColor: string) {
        console.log(`Updating color for ${name} to ${newColor}`);
        onColorConfigUpdate(colorConfig.setColor(name, newColor));
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

    // 添加点击外部关闭下拉框的处理函数
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        // 如果点击的不是下拉框相关元素，则关闭下拉框
        if (!target.closest('.color-dropdown') && !target.closest('.color-btn')) {
            activeDropdown = null;
        }
    }

    onMount(() => {
        // 添加全局点击事件监听
        document.addEventListener('click', handleClickOutside);
        return () => {
            // 组件卸载时移除事件监听
            document.removeEventListener('click', handleClickOutside);
        };
    });

    // 处理导入
    function handleImport() {
        const textarea = document.getElementById('color-config-textarea') as HTMLTextAreaElement;
        try {
            const newConfig = YAMLToColorConfig(textarea.value);
            onColorConfigUpdate(newConfig);
        } catch (e) {
            console.error('导入失败:', e);
            alert('导入失败，请检查格式是否正确');
        }
    }
    async function handleFileDrop(dataTransfer: DataTransfer) {
        const textarea = document.getElementById('color-config-textarea') as HTMLTextAreaElement;
        try {
            const text = await readFileWithEncoding(dataTransfer);
            textarea.value = text;
            const newConfig = YAMLToColorConfig(text);
            onColorConfigUpdate(newConfig);
        } catch (e) {
            console.error('导入失败:', e);
            alert(e instanceof Error ? e.message : '导入失败，请检查格式是否正确');
        }
    }
    // 处理导出
    function handleExport() {
        const textarea = document.getElementById('color-config-textarea') as HTMLTextAreaElement;
        const text = ColorConfigToYAMLText(colorConfig);
        textarea.value = text;
    }

    function handleCopySuccess() {
        // 可以添加提示或其他反馈
        console.log('复制成功！');
    }

    function toggleDisabled(name: string, disabled: boolean) {
        console.log(`Toggling disabled for ${name} to ${disabled}`);
        onColorConfigUpdate(colorConfig.setDisabled(name, disabled));
    }

    // 添加新的处理函数
    function handleNameUpdate(oldName: string, newName: string) {
        if (newName.trim() === '') return;
        const newConfig = colorConfig.setName(oldName, newName.trim());
        if (newConfig === colorConfig) {
            // 更新失败，显示提示
            alert(`无法将 "${oldName}" 改名为 "${newName}"，因为该名字已被使用`);
            // 重置输入框为原来的值
            const input = document.querySelector(`input[value="${oldName}"]`) as HTMLInputElement;
            if (input) input.value = oldName;
        } else {
            onColorConfigUpdate(newConfig);
        }
    }

    function handleAliasesUpdate(name: string, aliasesString: string) {
        const newAliases = aliasesString.split(/[,，\s]+/).filter(alias => alias.trim() !== '');
        const newConfig = colorConfig.setAliases(name, newAliases);
        if (newConfig === colorConfig) {
            // 更新失败，显示提示
            alert(`无法更新别名，因为存在冲突的名字或别名`);
            // 重置输入框为原来的值
            const input = document.querySelector(`.aliases-input[value="${colorConfig.getAliases(name).join(', ')}"]`) as HTMLInputElement;
            if (input) input.value = colorConfig.getAliases(name).join(', ');
        } else {
            onColorConfigUpdate(newConfig);
        }
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
                        <input 
                            type="text"
                            class="sender-name-input"
                            style="color: {sender.color}"
                            value={sender.name}
                            on:blur={(e) => handleNameUpdate(sender.name, e.currentTarget.value)}
                            on:keydown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                        />
                        <div class="sender-controls">
                            <label class="toggle">
                                <input
                                    type="checkbox"
                                    checked={!sender.disabled}
                                    on:change={(e) => toggleDisabled(sender.name, !e.currentTarget.checked)}
                                >
                                <span class="toggle-label">启用</span>
                            </label>
                                
                            <button 
                                class="color-btn"
                                style="background-color: {sender.color}"
                                on:click={() => toggleDropdown(sender.name)}
                            >选择颜色</button>
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
                    </div>
                    {#if sender.aliases && sender.aliases.length > 0 || true}
                        <div class="aliases">
                            <input 
                                type="text"
                                class="aliases-input"
                                value={sender.aliases.join(', ')}
                                placeholder="输入别名，用逗号或空格分隔"
                                on:blur={(e) => handleAliasesUpdate(sender.name, e.currentTarget.value)}
                                on:keydown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    <h3>颜色导入/导出</h3>
    <FloatingCopy buttonText="复制" onCopy={handleCopySuccess}>
        <textarea 
            data-floating-copy-content
            class="common-textarea"
            id="color-config-textarea"
            placeholder="在此粘贴颜色配置文本进行导入，或点击导出按钮将当前配置导出到此处，支持拖放txt文件"
            use:dropzone={{
                onDrop: handleFileDrop
            }}
        ></textarea>
    </FloatingCopy>
    <div class="button-group">
        <button class="import-btn" on:click={handleImport}>导入</button>
        <button class="export-btn" on:click={handleExport}>导出</button>
    </div>
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
        padding: 1rem;
    }

    /* 发送者信息布局 */
    .sender-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .sender-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .sender-name {
        font-weight: 500;
        font-size: 0.9rem;
        flex: 1;
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

    .button-group {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .import-btn,
    .export-btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }
    .toggle {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        cursor: pointer;
        user-select: none;
    }

    .toggle input {
        margin: 0;
    }

    .toggle-label {
        font-size: 0.8rem;
        color: #666;
    }

    /* 修改别名样式 */
    .aliases {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        padding-top: 0.25rem;
        border-top: 1px solid #eee;
    }

    .color-name {
        color: #333;
    }

    .sender-name-input {
        font-weight: 500;
        font-size: 0.9rem;
        flex: 1;
        border: 1px solid transparent;
        background: transparent;
        padding: 0.25rem;
        border-radius: 4px;
    }

    .sender-name-input:hover,
    .sender-name-input:focus {
        border-color: #ddd;
        background: white;
    }

    .aliases-input {
        width: 100%;
        font-size: 0.75rem;
        padding: 0.25rem;
        border: 1px solid transparent;
        background: transparent;
        border-radius: 3px;
    }

    .aliases-input:hover,
    .aliases-input:focus {
        border-color: #ddd;
        background: white;
    }

</style> 