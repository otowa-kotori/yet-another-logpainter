<script lang="ts">
    import FloatingCopy from '$lib/svelte/FloatingCopy.svelte';
    import '$lib/styles/common.css';
    export let bbcode: string;
</script>

<div class="bbcode-tab">
    <FloatingCopy>
        <textarea 
            data-floating-copy-content
            bind:value={bbcode} 
            readonly 
            class="common-textarea"
            placeholder="转换后的BBCode将显示在这里..."
        ></textarea>
    </FloatingCopy>
</div>

<style>
    .bbcode-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 200px;
    }
</style> 