<script lang="ts">
    import type { Log, FormatterOptions } from '../core/types';
    import LogViewer from './LogViewer.svelte';
    
    export let log: Log;
    export let htmlText: string;
    export let options: FormatterOptions;
    import fileSaver from 'file-saver';
    import { asBlob } from 'html-docx-js-typescript'


    async function exportToDocx() {
        // 创建文档
        asBlob(htmlText).then(data =>
            fileSaver.saveAs(data as Blob, '导出日志.docx')
        )
    }
</script>

<div class="export-button">
    <button on:click={exportToDocx}>导出到DOCX</button>
</div>

<div class="preview-tab">
    <LogViewer {log} {options} />
</div>

<style>
    .export-button {
        margin: 10px;
        text-align: right;
    }    

    .preview-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
</style> 