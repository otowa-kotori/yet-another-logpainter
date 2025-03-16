<script lang="ts">
    import { default_colors } from '$lib/core/namecolorer';
    import type { Color } from 'chroma-js';
    import chroma from 'chroma-js';
    import { getDropdownContext } from './dropdownContext';
    import { onMount } from 'svelte';
    
    // 组件属性
    export let color: Color; // 当前颜色值
    export let label: string = "选择颜色"; // 按钮文本
    export let id: string; // 唯一标识符
    
    // 获取上下文
    const activeDropdownId = getDropdownContext();
    
    // 计算当前下拉框是否打开
    $: isOpen = $activeDropdownId === id;
    
    // 事件分发
    export let onColorChange: (color: Color) => void;
    
    // 处理下拉框切换
    function toggleDropdown() {
        if (isOpen) {
            $activeDropdownId = null;
        } else {
            $activeDropdownId = id;
        }
    }
    
    // 处理自定义颜色输入
    function handleCustomColorInput(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        onColorChange(chroma(input.value));
    }
    
    // 选择预设颜色
    function selectPresetColor(colorHex: string) {
        onColorChange(chroma(colorHex));
        $activeDropdownId = null; // 关闭下拉框
    }
    
    // 点击外部关闭下拉框
    function handleClickOutside(e: MouseEvent) {
        if (isOpen && !e.composedPath().includes(dropdownContainer)) {
            $activeDropdownId = null;
        }
    }

    // 打开颜色选择器
    function openColorPicker(event: MouseEvent) {
        const input = (event.currentTarget as HTMLElement)
            .querySelector('input[type="color"]') as HTMLInputElement;
        input.click();
    }
    
    let dropdownContainer: HTMLDivElement;
    
    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });

    // 根据背景颜色计算文本颜色
    function getContrastColor(bgColor: chroma.Color): string {
        // 计算亮度 (0-1)
        const luminance = chroma(bgColor).luminance();
        
        // 如果背景亮度高于阈值，使用深色文本；否则使用浅色文本
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
</script>

<div class="color-btn-container" bind:this={dropdownContainer}>
    <button 
        class="color-btn"
        style="background-color: {color}; color: {getContrastColor(color)}"
        on:click|stopPropagation={toggleDropdown}
    >{label}</button>
    
    {#if isOpen}
        <div class="color-dropdown">
            <button 
                class="color-option"
                on:click={openColorPicker}
            >
                <input 
                    type="color" 
                    value={color}
                    class="color-picker"
                    on:input={handleCustomColorInput}
                >
                <span class="color-preview" style="background-color: {color}"></span>
                <span class="color-name">自定义</span>
            </button>
            
            {#each default_colors as defaultColor}
                <button 
                    class="color-option"
                    on:click={() => selectPresetColor(defaultColor.color.hex())}
                >
                    <span class="color-preview" style="background-color: {defaultColor.color.hex()}"></span>
                    <span class="color-name">{defaultColor.name}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .color-dropdown {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
    }


    .color-name {
        color: #333;
        font-size: 0.85rem;
    }

    /* 按钮样式 */
    .color-btn {
        padding: 0.25rem 0.5rem;
        height: 1.8rem;
        min-width: 6rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* 下拉菜单样式 */
    .color-dropdown {
        position: absolute;
        top: calc(100% + 5px);
        right: 0;
        z-index: 1000;
        max-height: 12rem;
        overflow-y: auto;
        min-width: 8rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

    .color-picker {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        padding: 0;
        margin: 0;
        pointer-events: none;
    }
</style> 