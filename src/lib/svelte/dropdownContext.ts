import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

const DROPDOWN_CONTEXT_KEY = 'dropdown_context';

export function createDropdownContext() {
    const activeDropdownId: Writable<string | null> = writable(null);
    
    setContext(DROPDOWN_CONTEXT_KEY, activeDropdownId);
    
    return activeDropdownId;
}

export function getDropdownContext() {
    return getContext<Writable<string | null>>(DROPDOWN_CONTEXT_KEY);
} 