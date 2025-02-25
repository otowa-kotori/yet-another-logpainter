<script lang="ts">
    import { AutoDetectLogParser, ProcessorGroup, BBCodeFormatter } from '$lib';
    import { 
        SplitMultilineProcessor,
        RemoveImageProcessor,
        ReplaceMeProcessor,
        RemoveDiceCommandProcessor,
        RemoveParenthesesProcessor,
        ColorProcessor,
        RemoveEmptyMessageProcessor
    } from '$lib/core/processor';
    import type { Log } from '$lib/core/types';
    import TabContainer from '$lib/svelte/TabContainer.svelte';
    import PreviewTab from '$lib/svelte/PreviewTab.svelte';
    import BBCodeTab from '$lib/svelte/BBCodeTab.svelte';
    import ColorManageTab from '$lib/svelte/ColorManageTab.svelte';
    import { AssignColors, ColorConfig } from '$lib/core/namecolorer';
    import { dropzone } from '$lib/actions/dropzone';
    import '$lib/styles/common.css';
    import { readFileWithEncoding } from '$lib/utils/fileUtils';

    const parser = new AutoDetectLogParser();
    let colorConfig = new ColorConfig();
    
    // 文本处理器
    const textProcessors = [
        new SplitMultilineProcessor(),    
        new RemoveImageProcessor(),
        new ReplaceMeProcessor(),
        new RemoveDiceCommandProcessor(),
        new RemoveParenthesesProcessor(),
        new RemoveEmptyMessageProcessor()
    ];

    const textProcessor = new ProcessorGroup(textProcessors);
    
    let rawLog = '';
    let parsedLogs: Log;
    let processedLogs: Log;
    let coloredLogs: Log;
    let bbcodeOutput = '';

    const tabs = [
        { id: 'preview', label: '预览' },
        { id: 'bbcode', label: 'BBCode' },
        { id: 'color', label: '颜色管理' }
    ];

    function parse_text() {
        // 解析并处理文本
        parsedLogs = parser.parse(rawLog);
        processedLogs = textProcessor.process(parsedLogs);
        // 生成新的颜色配置
        colorConfig = AssignColors(colorConfig, processedLogs.map(entry => entry.sender));
        applyColors();
    }

    function applyColors() {
        if (!processedLogs) return;
        // 仅应用颜色
        const colorProcessor = new ColorProcessor(colorConfig);
        coloredLogs = colorProcessor.process(processedLogs);
        // 更新BBCode输出
        const bbcodeFormatter = new BBCodeFormatter();
        bbcodeOutput = bbcodeFormatter.format(coloredLogs);
    }
    function onColorConfigUpdate(newConfig: ColorConfig) {
        colorConfig = newConfig;
        applyColors();
    }
    function clear_color() {
        colorConfig = new ColorConfig();
        applyColors();
    }
    // 监听颜色配置变化
    $: colorConfig, processedLogs && applyColors();

    async function handleFileDrop(dataTransfer: DataTransfer) {
        try {
            const text = await readFileWithEncoding(dataTransfer);
            rawLog = text;
            parse_text();
        } catch (e) {
            console.error('文件读取失败:', e);
            alert(e instanceof Error ? e.message : '文件读取失败');
        }
    }
</script>
<link rel="stylesheet" href="pico.min.css">

<main class="container">
    <div class="content">
        <div class="header">
            <h1>QQ聊天记录着色器</h1>
            <div class="github-link">
                <a href="https://github.com/otowa-kotori/yet-another-logpainter" target="_blank">在 GitHub 上查看源码</a>
            </div>
        </div>
        <div class="log-container">
            <div class="input-section">
                <textarea 
                    bind:value={rawLog} 
                    placeholder="在此粘贴QQ记录，支持拖放txt文件"
                    class="common-textarea"
                    use:dropzone={{ onDrop: handleFileDrop }}
                ></textarea>
                <div class="button-group">
                    <button on:click={parse_text} class="parse-button">转换</button>
                    <button on:click={clear_color} class="clear-color-button">清空颜色</button>
                </div>
            </div>

            <TabContainer {tabs} let:activeTab>
                {#if activeTab === 'preview'}
                    <PreviewTab log={coloredLogs} />
                {:else if activeTab === 'bbcode'}
                    <BBCodeTab bbcode={bbcodeOutput} />
                {:else}
                    <ColorManageTab {onColorConfigUpdate} colorConfig={colorConfig} />
                {/if}
            </TabContainer>
        </div>
    </div>
</main>

<style>
    .container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: #f9f9f9;
        box-sizing: border-box;
        padding: 1rem;
    }
    
    .content {
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        min-height: calc(100vh - 4rem);
        display: flex;
        flex-direction: column;
    }
    
    .header {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #eee;
    }
    
    .header h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }
    
    .log-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
        overflow: visible;
    }

    /* 自定义滚动条样式 */
    .log-container::-webkit-scrollbar {
        width: 8px;
    }

    .log-container::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .log-container::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }

    .log-container::-webkit-scrollbar-thumb:hover {
        background: #999;
    }

    .input-section {
        padding: 1rem 2rem;
    }

    .button-group{
        width: 100%;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
    }

    .parse-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        flex: 5;
    }

    .clear-color-button {
        flex: 1;
    }

    .parse-button:hover {
        background-color: #45a049;
    }
    .github-link {
        margin-top: 0.5rem;
        font-size: 0.8rem;
    }
    .github-link a {
        color: #333;
    }
</style>

