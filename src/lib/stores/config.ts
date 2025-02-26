import { writable } from 'svelte/store';
import type { ProcessorConfig } from '$lib/core/config';
import { DEFAULT_PROCESSOR_CONFIG } from '$lib/core/config';
import { LocalStorage } from './storage';

const PROCESSOR_CONFIG_KEY = 'logpainter_processor_config';
const storage = new LocalStorage();

function createConfigStore() {
    const savedConfig = storage.get<ProcessorConfig>(PROCESSOR_CONFIG_KEY);
    const initialConfig = savedConfig ? { ...DEFAULT_PROCESSOR_CONFIG, ...savedConfig } : DEFAULT_PROCESSOR_CONFIG;
    
    const { subscribe, set } = writable<ProcessorConfig>(initialConfig);

    return {
        subscribe,
        update: (newConfig: ProcessorConfig) => {
            storage.set(PROCESSOR_CONFIG_KEY, newConfig);
            set(newConfig);
        }
    };
}

export const processorConfig = createConfigStore(); 