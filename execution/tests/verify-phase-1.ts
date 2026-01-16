import { CoreLoader, ConfigStore, SecretStore, ServiceRegistry, RxEventBus } from '@universal/core-system';
import type { CoreDefinition, AppContext } from '@universal/core-system';
import * as assert from 'assert';

console.log('🧪 Phase 1 Verification: Core Runtime\n');

// Test 1: ConfigStore
console.log('Test 1: ConfigStore with dot-notation and environments');
const config = new ConfigStore({
    appName: 'test-app',
    'logger.level': 'info',
    environments: {
        development: {
            'logger.level': 'debug'
        }
    }
}, 'development');

assert.strictEqual(config.get('logger.level'), 'debug', 'Environment override failed');
assert.strictEqual(config.get('appName'), 'test-app', 'Basic config failed');
assert.strictEqual(config.get('missing', 'default'), 'default', 'Default value failed');
console.log('✅ ConfigStore passed\n');

// Test 2: SecretStore
console.log('Test 2: SecretStore with environment variables');
process.env.SECRET_TEST_KEY = 'test-value';
const secrets = new SecretStore();

(async () => {
    const value = await secrets.get('TEST_KEY');
    assert.strictEqual(value, 'test-value', 'Secret resolution failed');

    const hasKey = await secrets.has('TEST_KEY');
    assert.strictEqual(hasKey, true, 'Secret existence check failed');

    console.log('✅ SecretStore passed\n');

    // Test 3: ServiceRegistry
    console.log('Test 3: ServiceRegistry');
    const registry = new ServiceRegistry();

    const mockService = { name: 'test', doSomething: () => 'done' };
    registry.register('test-service', mockService);

    const retrieved = registry.get('test-service');
    assert.strictEqual(retrieved, mockService, 'Service retrieval failed');
    assert.strictEqual(registry.has('test-service'), true, 'Service check failed');

    console.log('✅ ServiceRegistry passed\n');

    // Test 4: CoreLoader
    console.log('Test 4: CoreLoader with mock core');

    let setupCalled = false;
    let startCalled = false;

    const mockCore: CoreDefinition = {
        metadata: {
            name: 'core-test',
            version: '1.0.0',
            description: 'Test core'
        },
        setup: async (context: AppContext) => {
            setupCalled = true;
            assert.ok(context.config, 'Context missing config');
            assert.ok(context.events, 'Context missing events');
        },
        start: async (context: AppContext) => {
            startCalled = true;
        }
    };

    const loader = new CoreLoader();
    const result = await loader.loadCores(
        { 'core-test': mockCore },
        { appName: 'test-app', 'logger.level': 'debug' }
    );

    assert.strictEqual(result.errors.length, 0, `Core loading had errors: ${JSON.stringify(result.errors)}`);
    assert.strictEqual(setupCalled, true, 'Core setup not called');
    assert.strictEqual(startCalled, true, 'Core start not called');
    assert.ok(result.cores['core-test'], 'Core not loaded');

    console.log('✅ CoreLoader passed\n');

    console.log('✅ Phase 1 Verification Complete!\n');
    console.log('All core runtime systems functional.');
    process.exit(0);
})().catch(error => {
    console.error('❌ Phase 1 Verification Failed:', error);
    process.exit(1);
});
