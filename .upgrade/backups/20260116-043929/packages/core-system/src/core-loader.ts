import { RxEventBus } from './event-bus';
import { ConfigStore } from './config-store';
import { SecretStore, ISecretStore } from './secret-store';
import { ServiceRegistry } from './service-registry';
import { PluginRegistry } from './plugin-registry';
import type { CoreDefinition, AppContext } from './types';

export interface CoreLoadResult {
    cores: Record<string, any>;
    context: AppContext;
    errors: Array<{ core: string; error: Error }>;
}

/**
 * CoreLoader dynamically loads and initializes cores.
 */
export class CoreLoader {
    async loadCores(
        coresToLoad: Record<string, CoreDefinition>,
        appConfig: Record<string, any> = {}
    ): Promise<CoreLoadResult> {
        const errors: Array<{ core: string; error: Error }> = [];
        const loadedCores: Record<string, any> = {};

        // Initialize infrastructure
        const eventBus = new RxEventBus();
        const configStore = new ConfigStore(appConfig);
        const secretStore = new SecretStore();
        const serviceRegistry = new ServiceRegistry();
        const pluginRegistry = new PluginRegistry();

        // Build AppContext
        const context: AppContext & {
            secrets: ISecretStore;
            services: ServiceRegistry;
            plugins: PluginRegistry;
        } = {
            events: eventBus,
            config: configStore,
            secrets: secretStore,
            services: serviceRegistry,
            plugins: pluginRegistry,
            registerService: <T>(id: string, service: T) => serviceRegistry.register(id, service),
            getService: <T>(id: string) => serviceRegistry.get<T>(id),
        };

        // Initialize plugins first
        await pluginRegistry.initializePlugins();

        // Load cores in dependency order (simplified - assumes no circular deps)
        const coreNames = Object.keys(coresToLoad);

        for (const coreName of coreNames) {
            try {
                const coreDefinition = coresToLoad[coreName];

                // Validate metadata
                if (!coreDefinition.metadata) {
                    throw new Error(`Core ${coreName} missing metadata`);
                }

                // Call setup lifecycle
                if (coreDefinition.setup) {
                    await coreDefinition.setup(context);
                }

                // Store the core
                loadedCores[coreName] = coreDefinition;

                eventBus.emit('core:loaded', { name: coreName });
            } catch (error) {
                errors.push({
                    core: coreName,
                    error: error instanceof Error ? error : new Error(String(error))
                });
            }
        }

        // Start cores
        for (const coreName of coreNames) {
            if (loadedCores[coreName] && loadedCores[coreName].start) {
                try {
                    await loadedCores[coreName].start(context);
                    eventBus.emit('core:started', { name: coreName });
                } catch (error) {
                    errors.push({
                        core: coreName,
                        error: error instanceof Error ? error : new Error(String(error))
                    });
                }
            }
        }

        return { cores: loadedCores, context, errors };
    }
}

/**
 * Cleanup helper for graceful shutdown
 */
export async function cleanupCores(context: AppContext & {
    plugins?: PluginRegistry;
    cores?: Record<string, CoreDefinition>;
}): Promise<void> {
    // Stop cores
    if (context.cores) {
        for (const core of Object.values(context.cores)) {
            if (core.stop) {
                await core.stop();
            }
        }
    }

    // Cleanup plugins
    if (context.plugins) {
        await context.plugins.cleanupPlugins();
    }
}
