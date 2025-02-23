<script lang="ts">
    import { QQTextParser, ProcessorGroup, defaultProcessors, StandardHTMLFormatter, BBCodeFormatter } from '$lib';
    import type { Log } from '$lib/core/types';
    import TabContainer from '$lib/svelte/TabContainer.svelte';
    import PreviewTab from '$lib/svelte/PreviewTab.svelte';
    import BBCodeTab from '$lib/svelte/BBCodeTab.svelte';

    const parser = new QQTextParser();
    const processor = new ProcessorGroup(defaultProcessors);
    
    let rawLog = '';
    let processedLogs: Log;
    let bbcodeOutput = '';

    const tabs = [
        { id: 'preview', label: '预览' },
        { id: 'bbcode', label: 'BBCode' }
    ];

    function parse_text() {
        // 解析并处理日志
        const parsedLog = parser.parse(rawLog);
        processedLogs = processor.process(parsedLog);
        
        // 格式化输出
        const bbcodeFormatter = new BBCodeFormatter();
        bbcodeOutput = bbcodeFormatter.format(processedLogs);
    }
</script>
<link rel="stylesheet" href="/pico.min.css">

<main class="container">
    <div class="content">
        <div class="header">
            <h1>QQ跑团记录着色器</h1>
        </div>
        
        <div class="log-container">
            <div class="input-section">
                <textarea 
                    bind:value={rawLog} 
                    placeholder="在此粘贴QQ记录..."
                    class="input-textarea"
                ></textarea>
                <button on:click={parse_text} class="parse-button">转换</button>
            </div>

            <TabContainer {tabs} let:activeTab>
                {#if activeTab === 'preview'}
                    <PreviewTab log={processedLogs} />
                {:else}
                    <BBCodeTab bbcode={bbcodeOutput} />
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
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        padding: 0;
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

    .parse-button {
        width: 100%;
        padding: 0.6rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .parse-button:hover {
        background-color: #45a049;
    }
</style>

