<script lang="ts">
    export let buttonText = '复制';
    export let onCopy: (() => void) | undefined = undefined;
    export let onError: ((error: any) => void) | undefined = undefined;

    let slotEl: HTMLElement;

    async function copyText() {
        try {
            const input = slotEl?.querySelector('[data-floating-copy-content]') as HTMLTextAreaElement | HTMLInputElement;
            if (input) {
                await navigator.clipboard.writeText(input.value);
                onCopy?.();
            }
        } catch (error) {
            onError?.(error);
        }
    }
</script>

<div class="floating-copy-wrapper" bind:this={slotEl}>
    <slot />
    <button 
        class="floating-copy-btn"
        on:click={copyText}
    >
        {buttonText}
    </button>
</div>

<style>
    .floating-copy-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    .floating-copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 6px 12px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s;
    }

    .floating-copy-btn:hover {
        background-color: #1976D2;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: translateY(-1px);
    }

    /* 确保全局样式不会影响到按钮 */
    :global([data-floating-copy-content]) {
        width: 100%;
    }
</style> 