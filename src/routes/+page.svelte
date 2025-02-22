<script lang="ts">
    import { QQTextParser, LogPainter, ProcessorGroup, defaultProcessors, SvelteFormatter, StandardHTMLFormatter, BBCodeFormatter } from '$lib';
    import type { Log } from '$lib/core/types';
    // 创建LogPainter实例并配置格式化器
    const parser = new QQTextParser();
    const logPainter = LogPainter.create(parser)
        .pipe(new ProcessorGroup(defaultProcessors));
    let rawLog = '';
    let parsedLogs: Log;
    let formattedLogs: Array<{ time: string, sender: string, message: string }> = [];
    let htmlOutput = '';
    let bbcodeOutput = '';

    function parse_text() {
        parsedLogs = parser.parse(rawLog);
        const htmlFormatter = new StandardHTMLFormatter();
        htmlOutput = logPainter.paint<string>(rawLog, htmlFormatter); 
        const svelteFormatter = new SvelteFormatter(); // HTML渲染
        formattedLogs = logPainter.paint<Array<{ time: string, sender: string, message: string }>>(rawLog, svelteFormatter);  // Svelte渲染
        const bbcodeFormatter = new BBCodeFormatter();
        bbcodeOutput = logPainter.paint<string>(rawLog, bbcodeFormatter);  // BBCode渲染
    }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<textarea bind:value={rawLog}></textarea>
<button on:click={parse_text}>Parse</button>

<!-- HTML渲染输出 -->
<!-- <h2>HTML渲染输出</h2>
<div>{@html htmlOutput}</div> -->
<!-- Svelte渲染输出 -->
<h2>Svelte渲染输出</h2>
{#each formattedLogs as log}
    <div class="log-entry">
        <span class="log-time">{log.time}</span>
        <span class="log-sender">&lt;{log.sender}&gt;</span>
        <span class="log-message">{log.message}</span>
    </div>
{/each}
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

