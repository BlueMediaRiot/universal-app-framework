import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { ConfigStore } from '../packages/core-system/src/config-store';
import { SecretStore } from '../packages/core-system/src/secret-store';
import { ServiceRegistry } from '../packages/core-system/src/service-registry';
import { PluginRegistry } from '../packages/core-system/src/plugin-registry';
import { CoreLoader } from '../packages/core-system/src/core-loader';
import type { CoreDefinition } from '../packages/core-system/src/types';

describe('Core System Tests', () => {
    describe('ConfigStore', () => {
        it('should get and set values', () => {
            const config = new ConfigStore({ test: 'value' });
            assert.strictEqual(config.get('test'), 'value');

            config.set('new', 'data');
            assert.strictEqual(config.get('new'), 'data');
        });

        it('should handle dot-notation keys', () => {
            const config = new ConfigStore({ 'app.name': 'test-app' });
            assert.strictEqual(config.get('app.name'), 'test-app');
        });

        it('should handle environment-specific config', () => {
            const config = new ConfigStore({
                'logger.level': 'info',
                environments: {
                    development: {
                        'logger.level': 'debug'
                    }
                }
            }, 'development');

            assert.strictEqual(config.get('logger.level'), 'debug');
        });

        it('should return default values', () => {
            const config = new ConfigStore({});
            assert.strictEqual(config.get('missing', 'default'), 'default');
        });
    });

    describe('SecretStore', async () => {
        it('should get secrets from environment', async () => {
            process.env.SECRET_TEST = 'secret-value';
            const secrets = new SecretStore();

            const value = await secrets.get('TEST');
            assert.strictEqual(value, 'secret-value');

            delete process.env.SECRET_TEST;
        });

        it('should check if secret exists', async () => {
            process.env.SECRET_EXISTS = 'yes';
            const secrets = new SecretStore();

            assert.strictEqual(await secrets.has('EXISTS'), true);
            assert.strictEqual(await secrets.has('MISSING'), false);

            delete process.env.SECRET_EXISTS;
        });

        it('should throw on required missing secret', async () => {
            const secrets = new SecretStore();

            await assert.rejects(
                async () => await secrets.require('MISSING_SECRET'),
                /Required secret not found/
            );
        });
    });

    describe('ServiceRegistry', () => {
        it('should register and retrieve services', () => {
            const registry = new ServiceRegistry();
            const service = { name: 'test' };

            registry.register('test-service', service);
            assert.strictEqual(registry.get('test-service'), service);
        });

        it('should throw on duplicate registration', () => {
            const registry = new ServiceRegistry();
            registry.register('test', {});

            assert.throws(
                () => registry.register('test', {}),
                /already registered/
            );
        });

        it('should list all services', () => {
            const registry = new ServiceRegistry();
            registry.register('service1', {});
            registry.register('service2', {});

            const list = registry.list();
            assert.strictEqual(list.length, 2);
            assert.ok(list.includes('service1'));
            assert.ok(list.includes('service2'));
        });

        it('should unregister services', () => {
            const registry = new ServiceRegistry();
            registry.register('test', {});

            assert.strictEqual(registry.unregister('test'), true);
            assert.strictEqual(registry.has('test'), false);
        });
    });

    describe('PluginRegistry', () => {
        it('should register and retrieve plugins', () => {
            const registry = new PluginRegistry();
            const plugin = { name: 'test-plugin', version: '1.0.0' };

            registry.registerPlugin(plugin);
            assert.strictEqual(registry.getPlugin('test-plugin'), plugin);
        });

        it('should execute hooks', async () => {
            const registry = new PluginRegistry();
            let called = false;

            registry.registerHook('test-hook', () => {
                called = true;
                return 'result';
            });

            const results = await registry.executeHook('test-hook');
            assert.strictEqual(called, true);
            assert.strictEqual(results[0], 'result');
        });

        it('should initialize plugins', async () => {
            const registry = new PluginRegistry();
            let initialized = false;

            registry.registerPlugin({
                name: 'test',
                version: '1.0.0',
                init: async () => { initialized = true; }
            });

            await registry.initializePlugins();
            assert.strictEqual(initialized, true);
        });
    });

    describe('CoreLoader', async () => {
        it('should load cores successfully', async () => {
            const loader = new CoreLoader();
            let setupCalled = false;
            let startCalled = false;

            const mockCore: CoreDefinition = {
                metadata: {
                    name: 'test-core',
                    version: '1.0.0',
                    description: 'Test'
                },
                async setup(context) {
                    setupCalled = true;
                },
                async start(context) {
                    startCalled = true;
                }
            };

            const result = await loader.loadCores(
                { 'test-core': mockCore },
                { appName: 'test' }
            );

            assert.strictEqual(result.errors.length, 0);
            assert.strictEqual(setupCalled, true);
            assert.strictEqual(startCalled, true);
        });

        it('should handle core loading errors', async () => {
            const loader = new CoreLoader();

            const badCore: CoreDefinition = {
                metadata: {
                    name: 'bad-core',
                    version: '1.0.0',
                    description: 'Bad'
                },
                async setup() {
                    throw new Error('Setup failed');
                }
            };

            const result = await loader.loadCores(
                { 'bad-core': badCore },
                {}
            );

            assert.strictEqual(result.errors.length, 1);
            assert.strictEqual(result.errors[0].core, 'bad-core');
        });
    });
});
