<script lang="ts">
    import { QQTextParser, LogPainter, ProcessorGroup, defaultProcessors, SvelteFormatter } from '$lib';
    import type { Log } from '$lib/core/types';
    // 创建LogPainter实例并配置格式化器
    const parser = new QQTextParser();
    const formatter = new SvelteFormatter();
    const logPainter = LogPainter.create(parser)
        .withFormatter(formatter)
        .pipe(new ProcessorGroup(defaultProcessors));
    let rawLog = '';
    let parsed_text = '';
    let parsedLogs: Log;  // 添加这个变量来存储解析后的日志对象
    let formattedLogs: Array<{ time: string, sender: string, message: string }> = [];  // 添加这行

    function parse_text() {
        parsedLogs = parser.parse(rawLog);  // 先解析成日志对象
        //parsed_text = logPainter.paint(rawLog);  // 保留原有的HTML渲染
        formattedLogs = parsedLogs ? formatter.format(parsedLogs) : [];
    }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<textarea bind:value={rawLog}></textarea>
<button on:click={parse_text}>Parse</button>
<div>{@html parsed_text}</div>

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
        /* 样式定义 */
        color: #666;
    }
    .log-sender {
        /* 样式定义 */
    }
    .log-message {
        /* 样式定义 */
    }
</style>

