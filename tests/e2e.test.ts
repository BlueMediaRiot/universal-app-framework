import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { CoreLoader, cleanupCores } from '../packages/core-system/src/core-loader';
import { LoggerCore } from '../packages/core-logger/src/index';
import { MathCore } from '../packages/core-math/src/index';

describe('End-to-End Tests', () => {
    describe('Complete application flow', async () => {
        it('should run a complete app lifecycle', async () => {
            const loader = new CoreLoader();

            // Load cores
            const { cores, context, errors } = await loader.loadCores(
                {
                    'core-logger': LoggerCore,
                    'core-math': MathCore
                },
                {
                    appName: 'test-app',
                    environment: 'test',
                    'logger.level': 'info'
                }
            );

            // Verify no errors
            assert.strictEqual(errors.length, 0);

            // Verify cores loaded
            assert.ok(cores['core-logger']);
            assert.ok(cores['core-math']);

            // Verify services registered
            const logger = context.getService('logger');
            const math = context.getService('math');
            assert.ok(logger);
            assert.ok(math);

            // Test event bus
            let eventReceived = false;
            context.events.on('test-event', () => {
                eventReceived = true;
            });
            context.events.emit('test-event');
            assert.strictEqual(eventReceived, true);

            // Cleanup
            await cleanupCores(context);
        });

        it('should handle core dependencies', async () => {
            const loader = new CoreLoader();

            const result = await loader.loadCores(
                {
                    'core-logger': LoggerCore,
                    'core-math': MathCore
                },
                {}
            );

            assert.strictEqual(result.errors.length, 0);

            // Both cores should be able to access each other's services
            const logger = result.context.getService('logger');
            const math = result.context.getService('math');

            assert.ok(logger);
            assert.ok(math);
        });
    });

    describe('Error handling', async () => {
        it('should gracefully handle core failures', async () => {
            const loader = new CoreLoader();

            const badCore = {
                metadata: {
                    name: 'bad-core',
                    version: '1.0.0',
                    description: 'Fails on purpose'
                },
                async setup() {
                    throw new Error('Intentional failure');
                }
            };

            const result = await loader.loadCores(
                {
                    'core-logger': LoggerCore,
                    'bad-core': badCore
                },
                {}
            );

            // Should have one error
            assert.strictEqual(result.errors.length, 1);
            assert.strictEqual(result.errors[0].core, 'bad-core');

            // Logger should still load successfully
            assert.ok(result.cores['core-logger']);
        });
    });

    describe('Configuration', async () => {
        it('should apply environment-specific config', async () => {
            const loader = new CoreLoader();

            const result = await loader.loadCores(
                { 'core-logger': LoggerCore },
                {
                    'logger.level': 'info',
                    environments: {
                        test: {
                            'logger.level': 'debug'
                        }
                    }
                },
                'test'
            );

            assert.strictEqual(result.errors.length, 0);

            // Config should use test environment
            const level = result.context.config.get('logger.level');
            assert.strictEqual(level, 'debug');
        });
    });
});
