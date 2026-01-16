import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export interface ISecretStore {
    get(key: string): Promise<string | undefined>;
    require(key: string): Promise<string>;
    has(key: string): Promise<boolean>;
}

/**
 * SecretStore resolves secrets in this order:
 * 1. Environment variables (SECRET_*)
 * 2. .env.local file
 * 3. .env file
 */
export class SecretStore implements ISecretStore {
    private _cache: Map<string, string> = new Map();
    private _loaded = false;

    constructor(private _rootDir?: string) { }

    private _load(): void {
        if (this._loaded) return;

        // Load .env files
        const rootDir = this._rootDir || process.cwd();
        const envLocalPath = path.join(rootDir, '.env.local');
        const envPath = path.join(rootDir, '.env');

        if (fs.existsSync(envLocalPath)) {
            config({ path: envLocalPath });
        } else if (fs.existsSync(envPath)) {
            config({ path: envPath });
        }

        this._loaded = true;
    }

    async get(key: string): Promise<string | undefined> {
        this._load();

        // Check cache first
        if (this._cache.has(key)) {
            return this._cache.get(key);
        }

        // Check environment variables (with SECRET_ prefix)
        const envKey = `SECRET_${key.toUpperCase()}`;
        const value = process.env[envKey] || process.env[key];

        if (value) {
            this._cache.set(key, value);
            return value;
        }

        return undefined;
    }

    async require(key: string): Promise<string> {
        const value = await this.get(key);
        if (!value) {
            throw new Error(`Required secret not found: ${key}`);
        }
        return value;
    }

    async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== undefined;
    }
}
