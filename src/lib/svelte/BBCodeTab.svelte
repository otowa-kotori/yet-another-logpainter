<script lang="ts">
    export let bbcode: string;
</script>

<div class="bbcode-tab">
    <textarea 
        bind:value={bbcode} 
        readonly 
        class="output-textarea"
        placeholder="转换后的BBCode将显示在这里..."
    ></textarea>
</div>

<style>
    .bbcode-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .output-textarea {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-family: monospace;
        background-color: #f8f8f8;
        font-size: 0.8rem;
    }
</style> 