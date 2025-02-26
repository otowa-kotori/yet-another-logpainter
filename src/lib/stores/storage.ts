export interface Storage {
    get<T>(key: string): T | null;
    set<T>(key: string, value: T): void;
}

export class LocalStorage implements Storage {
    get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Failed to load from storage:', e);
            return null;
        }
    }

    set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    }
} 