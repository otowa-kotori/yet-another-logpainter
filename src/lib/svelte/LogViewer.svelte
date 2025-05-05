<script lang="ts">
    import type { Log, FormatterOptions } from '../core/types';
    import { formatTime } from '../utils';
    
    export let log: Log;
    export let options: FormatterOptions = {
        showTime: true,
        showSender: true
    };
</script>

{#each log as entry}
    <div class="log-entry">
        {#if options.showTime}
            <span class="log-time">{formatTime(entry.time, 'short')}</span>
        {/if}
        {#if options.showSender}
            <span class="log-sender" style="color:{entry.nameColor?.hex() || entry.color?.hex() || 'black'}">&lt;{entry.sender}&gt;</span>
        {/if}
        <span class="log-message" style="color:{entry.color?.hex()}">{entry.message}</span>
    </div>
{/each}

<style>
    .log-entry {
        padding: 4px 8px;
        line-height: 1.5;
        word-break: break-word;
        font-size: 0.8rem;
    }
    .log-entry:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
    .log-time {
        color: #888;
        margin-right: 8px;
    }
    .log-sender {
        margin: 0 4px;
        font-weight: 500;
    }
    .log-message {
        margin-left: 4px;
        white-space: pre-wrap;
    }
</style> 