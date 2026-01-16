/**
 * ServiceRegistry enables inter-core communication and dependency injection.
 */
export class ServiceRegistry {
    private _services: Map<string, any> = new Map();

    register<T>(id: string, service: T): void {
        if (this._services.has(id)) {
            throw new Error(`Service already registered: ${id}`);
        }
        this._services.set(id, service);
    }

    get<T>(id: string): T | undefined {
        return this._services.get(id) as T | undefined;
    }

    require<T>(id: string): T {
        const service = this.get<T>(id);
        if (!service) {
            throw new Error(`Required service not found: ${id}`);
        }
        return service;
    }

    has(id: string): boolean {
        return this._services.has(id);
    }

    unregister(id: string): boolean {
        return this._services.delete(id);
    }

    list(): string[] {
        return Array.from(this._services.keys());
    }

    clear(): void {
        this._services.clear();
    }
}
