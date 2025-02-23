<script lang="ts">
    import { QQTextParser, ProcessorGroup, defaultProcessors, StandardHTMLFormatter, BBCodeFormatter } from '$lib';
    import LogViewer from '$lib/svelte/LogViewer.svelte';
    import type { Log } from '$lib/core/types';

    const parser = new QQTextParser();
    const processor = new ProcessorGroup(defaultProcessors);
    
    let rawLog = '';
    let processedLogs: Log;
    let htmlOutput = '';
    let bbcodeOutput = '';
    let activeTab = 'preview'; // 'preview' 或 'bbcode'

    function parse_text() {
        // 解析并处理日志
        const parsedLog = parser.parse(rawLog);
        processedLogs = processor.process(parsedLog);
        
        // 格式化输出
        const htmlFormatter = new StandardHTMLFormatter();
        htmlOutput = htmlFormatter.format(processedLogs);
        
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

            <div class="tabs">
                <button 
                    class="tab-button" 
                    class:active={activeTab === 'preview'}
                    on:click={() => activeTab = 'preview'}
                >预览</button>
                <button 
                    class="tab-button" 
                    class:active={activeTab === 'bbcode'}
                    on:click={() => activeTab = 'bbcode'}
                >BBCode</button>
            </div>

            <div class="tab-content">
                {#if activeTab === 'preview'}
                    <div class="preview-tab">
                        <LogViewer log={processedLogs} />
                    </div>
                {:else}
                    <div class="bbcode-tab">
                        <textarea 
                            bind:value={bbcodeOutput} 
                            readonly 
                            class="output-textarea"
                            placeholder="转换后的BBCode将显示在这里..."
                        ></textarea>
                    </div>
                {/if}
            </div>
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

    .tabs {
        padding: 0 2rem;
        border-bottom: 1px solid #eee;
        margin-top: 1rem;
    }

    .tab-button {
        padding: 0.6rem 1.2rem;
        border: none;
        background: none;
        cursor: pointer;
        margin-right: 1rem;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.3s;
        font-size: 0.9rem;
    }

    .tab-button.active {
        color: #4CAF50;
        border-bottom: 2px solid #4CAF50;
    }

    .tab-content {
        padding: 0 2rem 2rem 2rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .preview-tab, .bbcode-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .output-textarea {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-family: monospace;
        background-color: #f8f8f8;
        font-size: 0.8rem;
    }

</style>

