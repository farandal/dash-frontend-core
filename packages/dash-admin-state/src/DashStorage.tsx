import ElectronStore from 'electron-store';
import { getEnv } from 'dash-constants';
type StorageType = 'localStorage' | 'electronStore';

interface PersistanceLayer {
    getItem<T = any>(key: string): T | null;
    setItem<T = any>(key: string, value: T): void;
    removeItem(key: string): void;
    clear(): void;
}

class LocalStorageLayer implements PersistanceLayer {
    getItem<T = any>(key: string): T | null {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
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

class ElectronStoreLayer implements PersistanceLayer {
    private store: ElectronStore;
    constructor() {
        this.store = new ElectronStore();
    }
    getItem<T = any>(key: string): T | null {
        return this.store.get(key, null) as T | null;
    }
    setItem<T = any>(key: string, value: T): void {
        this.store.set(key, value);
    }
    removeItem(key: string): void {
        this.store.delete(key);
    }
    clear(): void {
        this.store.clear();
    }
}

export class DashStorage implements PersistanceLayer {
    private layer: PersistanceLayer;

    constructor() {
        const storageType = (getEnv('APP_STORAGE_TYPE') as StorageType) || 'localStorage';
        if (storageType === 'electronStore') {
            this.layer = new ElectronStoreLayer();
        } else {
            this.layer = new LocalStorageLayer();
        }
    }

    getItem<T = any>(key: string): T | null {
        return this.layer.getItem<T>(key);
    }
    setItem<T = any>(key: string, value: T): void {
        this.layer.setItem<T>(key, value);
    }
    removeItem(key: string): void {
        this.layer.removeItem(key);
    }
    clear(): void {
        this.layer.clear();
    }
}