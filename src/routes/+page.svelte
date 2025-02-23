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

<textarea bind:value={rawLog}></textarea>
<button on:click={parse_text}>Parse</button>

<!-- HTML渲染输出 -->
<!-- <h2>HTML渲染输出</h2>
<div>{@html htmlOutput}</div> -->
<!-- Svelte渲染输出 -->
<h2>Svelte渲染输出</h2>
<LogViewer log={processedLogs} />
<h2>BBCode渲染输出</h2>
<textarea bind:value={bbcodeOutput}></textarea>

<style>
    .log-entry {
        /* 样式定义 */
    }
    .log-time {
        color: silver;
    }
    .log-sender {
        margin: 0 4px;
    }
</style>

