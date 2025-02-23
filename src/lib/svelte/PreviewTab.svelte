<script lang="ts">
    import type { Log } from '../core/types';
    import LogViewer from './LogViewer.svelte';
    
    export let log: Log;
</script>

<div class="preview-tab">
    <LogViewer {log} />
</div>

<style>
    .preview-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
</style> 