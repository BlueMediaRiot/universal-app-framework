import { IConfigStore } from './types';

export class InMemoryConfig implements IConfigStore {
    private _store: Record<string, any> = {};

    constructor(initial?: Record<string, any>) {
        if (initial) {
            this._store = { ...initial };
        }
    }

    get<T>(key: string, defaultValue?: T): T {
        return (this._store[key] as T) ?? ((defaultValue as unknown) as T);
    }

    set<T>(key: string, value: T): void {
        this._store[key] = value;
    }
}
