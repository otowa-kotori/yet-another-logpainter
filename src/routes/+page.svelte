<script>
    import { StandardHTMLFormatter } from '$lib/formatter';
    import { QQTextParser } from '$lib/parser';
    import { LogPainter } from '$lib/logpainter';
    import { ProcessorGroup, defaultProcessors } from '$lib/processor';

    // 创建LogPainter实例并配置格式化器
    const parser = new QQTextParser();
    const formatter = new StandardHTMLFormatter();
    const logPainter = LogPainter.create(parser)
        .withFormatter(formatter)
        .pipe(new ProcessorGroup(defaultProcessors));
    let rawLog = '';
    let parsed_text = '';

    function parse_text() {
        parsed_text = logPainter.paint(rawLog);
    }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<textarea bind:value={rawLog}></textarea>
<button on:click={parse_text}>Parse</button>
<div>{@html parsed_text}</div>

