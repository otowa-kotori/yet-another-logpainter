<script lang="ts">
    import type { Log } from '../core/types';
    import { formatTime } from '../utils';
    
    export let log: Log;
</script>

{#each log as entry}
    <div class="log-entry">
        <span class="log-time">{formatTime(entry.time, 'short')}</span>
        <span class="log-sender" style="color:{entry.color?.hex()}">&lt;{entry.sender}&gt;</span>
        <span class="log-message" style="color:{entry.color?.hex()}">{entry.message}</span>
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