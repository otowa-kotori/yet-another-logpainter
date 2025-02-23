<script lang="ts">
    type Tab = {
        id: string;
        label: string;
    };
    
    export let tabs: Tab[];
    export let defaultTab = tabs[0]?.id;
    
    let activeTab = defaultTab;
</script>

<div class="tabs">
    {#each tabs as tab}
        <button 
            class="tab-button" 
            class:active={activeTab === tab.id}
            on:click={() => activeTab = tab.id}
        >{tab.label}</button>
    {/each}
</div>

<div class="tab-content">
    <slot {activeTab} />
</div>

<style>
    .tabs {
        padding: 0 2rem;
        border-bottom: 1px solid #eee;
        margin-top: 1rem;
    }

    .tab-button {
        padding: 0.6rem 1.2rem;
        border: none;
        background: none;
        cursor: pointer;
        margin-right: 1rem;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.3s;
        font-size: 0.9rem;
    }

    .tab-button.active {
        color: #4CAF50;
        border-bottom: 2px solid #4CAF50;
    }

    .tab-content {
        padding: 0 2rem 2rem 2rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
</style> 