import { IConfigStore } from './types';

/**
 * ConfigStore with environment-aware configuration support.
 * Supports dot-notation keys like 'logger.level' and environment-specific overrides.
 */
export class ConfigStore implements IConfigStore {
    private _store: Record<string, any> = {};
    private _environment: string;

    constructor(config?: Record<string, any>, environment?: string) {
        this._environment = environment || process.env.NODE_ENV || 'development';

        if (config) {
            // First copy base config (excluding environments)
            const { environments, ...baseConfig } = config;
            this._store = { ...baseConfig };

            // Then apply environment-specific overrides using set() to handle dot-notation
            if (environments && environments[this._environment]) {
                const envConfig = environments[this._environment];
                for (const [key, value] of Object.entries(envConfig)) {
                    this.set(key, value);
                }
            }
        }
    }

    get<T>(key: string, defaultValue?: T): T {
        const value = this._getNestedValue(key);
        return (value !== undefined ? value : defaultValue) as T;
    }

    set<T>(key: string, value: T): void {
        this._setNestedValue(key, value);
    }

    private _getNestedValue(key: string): any {
        const keys = key.split('.');
        let current: any = this._store;

        for (const k of keys) {
            if (current === undefined || current === null) {
                return undefined;
            }
            current = current[k];
        }

        return current;
    }

    private _setNestedValue(key: string, value: any): void {
        const keys = key.split('.');
        let current: any = this._store;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }

        current[keys[keys.length - 1]] = value;
    }

    getAll(): Record<string, any> {
        return { ...this._store };
    }

    getEnvironment(): string {
        return this._environment;
    }
}
