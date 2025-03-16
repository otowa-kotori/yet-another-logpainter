<script lang="ts">
    import { ColorConfig, YAMLToColorConfig, ColorConfigToYAMLText } from '$lib/core/namecolorer';
    import { dropzone } from '$lib/actions/dropzone';
    import { readFileWithEncoding } from '$lib/utils/fileUtils';
    import FloatingCopy from '$lib/svelte/FloatingCopy.svelte';
    import chroma from 'chroma-js';
    import type { Color } from 'chroma-js';
    import ColorDropdown from './ColorDropdown.svelte';
    import { createDropdownContext } from './dropdownContext';

    export let colorConfig: ColorConfig;
    export let onColorConfigUpdate: (newConfig: ColorConfig) => void;

    // 创建颜色选择器上下文
    createDropdownContext();
    
    // 获取颜色映射并转换为数组
    $: senders = colorConfig.entries;
    function updateColor(name: string, newColor: Color) {
        console.log(`Updating color for ${name} to ${newColor}`);
        onColorConfigUpdate(colorConfig.setColor(name, newColor));
    }

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

    // 添加名字类型的映射
    const nameTypes = {
        "normal": "普通",
        "hidden": "不显示",
        "preserve_alias": "保留别名"
    } as const;

    function handleNameTypeChange(name: string, type: "normal" | "hidden" | "preserve_alias") {
        console.log(`Changing type for ${name} to ${type}`);
        onColorConfigUpdate(colorConfig.setNameType(name, type));
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

    // 处理名字颜色更新
    function handleNameColorToggle(name: string, enabled: boolean) {
        if (enabled) {
            // 启用名字颜色，默认设为白色
            onColorConfigUpdate(colorConfig.setNameColor(name, chroma('white')));
        } else {
            // 禁用名字颜色，设为空值
            onColorConfigUpdate(colorConfig.setNameColor(name, null));
        }
    }

    function updateNameColor(name: string, newColor: Color) {
        console.log(`Updating name color for ${name} to ${newColor}`);
        onColorConfigUpdate(colorConfig.setNameColor(name, newColor));
    }

    // 拖拽相关状态
    let draggedName: string | null = null;
    let dropTargetName: string | null = null;

    function handleDragStart(event: DragEvent, name: string) {
        draggedName = name;
        // 设置拖动时的视觉效果
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', name);
        }
    }

    function handleDragOver(event: DragEvent, targetName: string) {
        event.preventDefault();
        if (draggedName && draggedName !== targetName) {
            dropTargetName = targetName;
        }
    }

    function handleDragLeave() {
        dropTargetName = null;
    }

    function handleDrop(event: DragEvent, targetName: string) {
        event.preventDefault();
        if (!draggedName || draggedName === targetName) return;

        // 确认对话框
        if (confirm(`确定要将"${draggedName}"作为别名合并到"${targetName}"下吗？`)) {
            const sourceName = draggedName;
            const sourceAliases = colorConfig.getAliases(sourceName);
            const newAliases = [sourceName, ...sourceAliases];
            
            // 先删除源
            let newConfig = colorConfig.removeName(sourceName);

            // 然后更新目标的别名
            newConfig = newConfig.setAliases(
                targetName, 
                [...colorConfig.getAliases(targetName), ...newAliases]
            );
            
            
            onColorConfigUpdate(newConfig);
        }

        // 重置状态
        draggedName = null;
        dropTargetName = null;
    }

    function handleDragEnd() {
        draggedName = null;
        dropTargetName = null;
    }
</script>

<div class="color-manage">
    <h3>颜色管理</h3>
    <ul>
        <li>普通: 正常显示，对于出现在别名列表里的名字，会将别名替换成标准名字</li>
        <li>不显示: 不在log中显示，一般用来处理撤回或系统消息</li>
        <li>保留别名: 正常显示，但不会将别名替换成标准名字，一般用于NPC。</li>
    </ul>
    <p>可以拖拽名字到另一个名字上，用以合并别名</p>
    {#if !senders.length}
        <p class="empty-notice">请先在输入框中粘贴聊天记录</p>
    {:else}
        <div class="sender-list">
            {#each senders as sender}
                <div 
                    role="listitem"
                    class="sender-item"
                    draggable="true"
                    on:dragstart={(e) => handleDragStart(e, sender.name)}
                    on:dragover={(e) => handleDragOver(e, sender.name)}
                    on:dragleave={handleDragLeave}
                    on:drop={(e) => handleDrop(e, sender.name)}
                    on:dragend={handleDragEnd}
                    class:drag-over={dropTargetName === sender.name}
                    class:being-dragged={draggedName === sender.name}
                >
                    <div class="sender-content">
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
                                draggable="true"
                                on:dragstart|preventDefault|stopPropagation
                                on:dragover|preventDefault|stopPropagation
                            />
                            <div class="sender-controls">
                                <select
                                    class="name-type-select"
                                    value={sender.type}
                                    on:change={(e) => handleNameTypeChange(
                                        sender.name, 
                                        e.currentTarget.value as "normal" | "hidden" | "preserve_alias"
                                    )}
                                >
                                    {#each Object.entries(nameTypes) as [value, label]}
                                        <option {value}>{label}</option>
                                    {/each}
                                </select>
                                <div class="color-btn-container">
                                    <ColorDropdown 
                                        id={`color-dropdown-${sender.name}`}
                                        color={sender.color}
                                        onColorChange={(newColor) => updateColor(sender.name, newColor)}
                                    />
                                </div>
                                
                            </div>
                        </div>
                        <div class="name-color-control">
                            <label class="name-color-label">
                                <input 
                                    type="checkbox" 
                                    checked={!!sender.nameColor}
                                    on:change={(e) => handleNameColorToggle(sender.name, e.currentTarget.checked)}
                                />
                                独立名字颜色
                            </label>
                            {#if sender.nameColor}
                                <div class="name-color-picker">
                                    <ColorDropdown 
                                        id={`name-color-dropdown-${sender.name}`}
                                        color={sender.nameColor}
                                        onColorChange={(newColor) => updateNameColor(sender.name, newColor)}
                                    />
                                </div>
                            {/if}
                        </div>
                        {#if sender.aliases && sender.aliases.length > 0 || true}
                            <div class="aliases">
                                <textarea 
                                    class="aliases-input"
                                    value={sender.aliases.join(', ')}
                                    placeholder="输入别名，用逗号或空格分隔"
                                    on:blur={(e) => handleAliasesUpdate(sender.name, e.currentTarget.value)}
                                    on:keydown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    draggable="true"
                                    on:dragstart|preventDefault|stopPropagation
                                    on:dragover|preventDefault|stopPropagation
                                ></textarea>
                            </div>
                        {/if}
                    </div>
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
    .sender-item {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
    }

    /* 列表布局 */
    .sender-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        padding: 1rem;
        position: relative;
        overflow: visible;
    }

    .sender-item {
        display: flex;
        gap: 0.5rem;
        position: relative;
        padding: 0.5rem;
        cursor: move;
        transition: all 0.2s ease;
    }

    .sender-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .sender-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-bottom: 0.25rem;
    }

    .sender-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 0.25rem;
        height: 2rem;
    }

    /* 辅助样式 */
    .empty-notice {
        color: #666;
        font-style: italic;
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

    .name-type-select {
        appearance: auto;
        padding: 0.25rem 0.5rem;
        margin-bottom: 0;
        font-size: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        height: 1.8rem;
    }

    .name-type-select:hover {
        border-color: #bbb;
    }

    /* 修改别名样式 */
    .aliases {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-top: 0.25rem;
        border-top: 1px solid #eee;
        width: 100%;
    }

    .sender-name-input {
        width: 100%;
        font-weight: 500;
        font-size: 0.9rem;
        border: 1px solid transparent;
        background: transparent;
        padding: 0.15rem 0.25rem;
        border-radius: 4px;
        height: 1.5rem;
        margin-bottom: 0;
    }

    .sender-name-input:hover,
    .sender-name-input:focus {
        border-color: #ddd;
        background: white;
    }

    .aliases-input,
    .sender-name-input{
        user-select: text !important;
    }

    .aliases-input {
        width: 100%;
        font-size: 0.75rem;
        padding: 0.5rem;
        border-radius: 3px;
        field-sizing: content;
        word-break: break-all;
    }

    .drag-over {
        background-color: rgba(0, 120, 255, 0.1);
        border: 1px dashed #0078ff;
    }

    .being-dragged {
        opacity: 0.5;
    }

    .sender-info {
        display: flex;
        align-items: center;
    }

    .color-btn-container {
        position: relative;
    }

    /* 名字颜色控制样式 */
    .name-color-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.25rem;
        padding: 0.25rem;
        border-top: 1px solid #eee;
    }

    .name-color-label {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        cursor: pointer;
    }

    .name-color-picker {
        margin-left: auto;
    }
</style> 