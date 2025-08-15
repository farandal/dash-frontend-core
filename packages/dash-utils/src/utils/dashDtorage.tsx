import { getEnv } from "./envUtils";

interface PersistanceLayer {
    getItem<T = any>(key: string): T | null;
    setItem<T = any>(key: string, value: T): void;
    removeItem(key: string): void;
    clear(): void;
}

class LocalStorageLayer implements PersistanceLayer {
    getItem<T = any>(key: string): T | null {
        const item = window.localStorage.getItem(key);
        if (!item) return null;
        try {
            return JSON.parse(item);
        } catch {
            // Return as string if not valid JSON
            return item as any;
        }
    }
    setItem<T = any>(key: string, value: T): void {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
    removeItem(key: string): void {
        window.localStorage.removeItem(key);
    }
    clear(): void {
        window.localStorage.clear();
    }
}

export class dashStorage {
    private static localLayer = new LocalStorageLayer();

    private static get layer(): PersistanceLayer {
        return dashStorage.localLayer;
    }

    static getItem<T = any>(key: string): T | null {
        return this.layer.getItem<T>(key);
    }
    static setItem<T = any>(key: string, value: T): void {
        this.layer.setItem<T>(key, value);
    }
    static removeItem(key: string): void {
        this.layer.removeItem(key);
    }
    static clear(): void {
        this.layer.clear();
    }
}
