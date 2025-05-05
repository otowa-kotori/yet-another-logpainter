<script lang="ts">
    import type { FormatterOptions } from '../core/types';
    
    export let options: FormatterOptions;
    export let onOptionsUpdate: (options: FormatterOptions) => void;
</script>

<div class="formatter-options">
    <div class="option-group">
        <label>
            <input 
                type="checkbox" 
                bind:checked={options.showTime}
                on:change={() => onOptionsUpdate(options)}
            >
            显示时间
        </label>
    </div>
    
    <div class="option-group">
        <label>
            <input 
                type="checkbox" 
                bind:checked={options.showSender}
                on:change={() => onOptionsUpdate(options)}
            >
            显示发送者
        </label>
    </div>
</div>

<style>
    .formatter-options {
        padding: 1rem;
    }
    
    .option-group {
        margin-bottom: 1rem;
    }
    
    label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }
    
    input[type="checkbox"] {
        width: 1rem;
        height: 1rem;
    }
</style> 