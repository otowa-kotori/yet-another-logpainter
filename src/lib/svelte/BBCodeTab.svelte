<script lang="ts">
    import { floatingCopy } from '$lib/actions/floatingCopy';
    import '$lib/styles/common.css';
    export let bbcode: string;
</script>

<div class="bbcode-tab">
    <textarea 
        bind:value={bbcode} 
        readonly 
        class="common-textarea"
        placeholder="转换后的BBCode将显示在这里..."
        use:floatingCopy
    ></textarea>
</div>

<style>
    .bbcode-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 200px;
    }
</style> 