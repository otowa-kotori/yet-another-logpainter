<script lang="ts">
    import { QQTextParser, LogPainter, ProcessorGroup, defaultProcessors, SvelteFormatter, StandardHTMLFormatter } from '$lib';
    import type { Log } from '$lib/core/types';
    // 创建LogPainter实例并配置格式化器
    const parser = new QQTextParser();
    const htmlFormatter = new StandardHTMLFormatter();
    const svelteFormatter = new SvelteFormatter();
    const logPainter = LogPainter.create(parser)
        .pipe(new ProcessorGroup(defaultProcessors));
    let rawLog = '';
    let parsedLogs: Log;
    let formattedLogs: Array<{ time: string, sender: string, message: string }> = [];
    let htmlOutput = '';

    function parse_text() {
        parsedLogs = parser.parse(rawLog);
        htmlOutput = logPainter.paint<string>(rawLog, htmlFormatter);  // HTML渲染
        formattedLogs = logPainter.paint<Array<{ time: string, sender: string, message: string }>>(rawLog, svelteFormatter);  // Svelte渲染
    }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<textarea bind:value={rawLog}></textarea>
<button on:click={parse_text}>Parse</button>

<!-- HTML渲染输出 -->
<h2>HTML渲染输出</h2>
<div>{@html htmlOutput}</div>
<!-- Svelte渲染输出 -->
<h2>Svelte渲染输出</h2>
{#each formattedLogs as log}
    <div class="log-entry">
        <span class="log-time">{log.time}</span>
        <span class="log-sender">&lt;{log.sender}&gt;</span>
        <span class="log-message">{log.message}</span>
    </div>
{/each}

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

