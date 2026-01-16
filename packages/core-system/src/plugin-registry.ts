/**
 * PluginRegistry for core extensibility.
 * Allows cores to register hooks and plugins that other cores can use.
 */
export interface Plugin {
    name: string;
    version: string;
    init?: () => Promise<void> | void;
    cleanup?: () => Promise<void> | void;
}

export class PluginRegistry {
    private _plugins: Map<string, Plugin> = new Map();
    private _hooks: Map<string, Array<(...args: any[]) => any>> = new Map();

    registerPlugin(plugin: Plugin): void {
        if (this._plugins.has(plugin.name)) {
            throw new Error(`Plugin already registered: ${plugin.name}`);
        }
        this._plugins.set(plugin.name, plugin);
    }

    getPlugin(name: string): Plugin | undefined {
        return this._plugins.get(name);
    }

    hasPlugin(name: string): boolean {
        return this._plugins.has(name);
    }

    listPlugins(): Plugin[] {
        return Array.from(this._plugins.values());
    }

    // Hook system
    registerHook(hookName: string, handler: (...args: any[]) => any): void {
        if (!this._hooks.has(hookName)) {
            this._hooks.set(hookName, []);
        }
        this._hooks.get(hookName)!.push(handler);
    }

    async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
        const handlers = this._hooks.get(hookName) || [];
        const results: any[] = [];

        for (const handler of handlers) {
            const result = await handler(...args);
            results.push(result);
        }

        return results;
    }

    removeHook(hookName: string, handler: (...args: any[]) => any): boolean {
        const handlers = this._hooks.get(hookName);
        if (!handlers) return false;

        const index = handlers.indexOf(handler);
        if (index === -1) return false;

        handlers.splice(index, 1);
        return true;
    }

    async initializePlugins(): Promise<void> {
        for (const plugin of this._plugins.values()) {
            if (plugin.init) {
                await plugin.init();
            }
        }
    }

    async cleanupPlugins(): Promise<void> {
        for (const plugin of this._plugins.values()) {
            if (plugin.cleanup) {
                await plugin.cleanup();
            }
        }
    }
}
