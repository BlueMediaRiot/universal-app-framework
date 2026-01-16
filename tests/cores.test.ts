import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { CoreLoader } from '../packages/core-system/src/core-loader';
import { LoggerCore } from '../packages/cores/core-logger/src/index';
import { MathCore } from '../packages/cores/core-math/src/index';
import CoreAiApi, { prompt, complete } from '../packages/cores/core-ai-api/src/index';

describe('Core Integration Tests', () => {
    describe('core-logger', async () => {
        it('should load and initialize', async () => {
            const loader = new CoreLoader();
            const result = await loader.loadCores(
                { 'core-logger': LoggerCore },
                { 'logger.level': 'info' }
            );

            assert.strictEqual(result.errors.length, 0);
            assert.ok(result.cores['core-logger']);
        });

        it('should register logger service', async () => {
            const loader = new CoreLoader();
            const result = await loader.loadCores(
                { 'core-logger': LoggerCore },
                { 'logger.level': 'debug' }
            );

            const logger = result.context.getService('logger');
            assert.ok(logger);
        });
    });

    describe('core-math', async () => {
        it('should load and initialize', async () => {
            const loader = new CoreLoader();
            const result = await loader.loadCores(
                { 'core-math': MathCore },
                {}
            );

            assert.strictEqual(result.errors.length, 0);
            assert.ok(result.cores['core-math']);
        });

        it('should register math service', async () => {
            const loader = new CoreLoader();
            const result = await loader.loadCores(
                { 'core-math': MathCore },
                {}
            );

            const math = result.context.getService('math');
            assert.ok(math);
        });
    });

    describe('core-ai-api', async () => {
        it('should load and initialize', async () => {
            const loader = new CoreLoader();
            const result = await loader.loadCores(
                { 'core-ai-api': CoreAiApi },
                { 'ai.provider': 'openai', 'ai.model': 'gpt-4' }
            );

            assert.strictEqual(result.errors.length, 0);
            assert.ok(result.cores['core-ai-api']);
        });

        it('should provide prompt function', async () => {
            const loader = new CoreLoader();
            await loader.loadCores(
                { 'core-ai-api': CoreAiApi },
                { 'ai.provider': 'openai' }
            );

            const response = await prompt('Test prompt');
            assert.ok(response);
            assert.ok(response.includes('Mock AI response'));
        });

        it('should provide complete function', async () => {
            const loader = new CoreLoader();
            await loader.loadCores(
                { 'core-ai-api': CoreAiApi },
                {}
            );

            const messages = [{ role: 'user' as const, content: 'Hello' }];
            const response = await complete(messages);

            assert.ok(response.content);
            assert.ok(response.model);
            assert.ok(response.usage);
        });
    });

    describe('Multiple cores', async () => {
        it('should load multiple cores together', async () => {
            const loader = new CoreLoader();
            const result = await loader.loadCores(
                {
                    'core-logger': LoggerCore,
                    'core-math': MathCore,
                    'core-ai-api': CoreAiApi
                },
                {
                    'logger.level': 'info',
                    'ai.provider': 'openai'
                }
            );

            assert.strictEqual(result.errors.length, 0);
            assert.strictEqual(Object.keys(result.cores).length, 3);
        });

        it('should allow inter-core communication', async () => {
            const loader = new CoreLoader();
            const result = await loader.loadCores(
                {
                    'core-logger': LoggerCore,
                    'core-math': MathCore
                },
                {}
            );

            const logger = result.context.getService('logger');
            const math = result.context.getService('math');

            assert.ok(logger);
            assert.ok(math);
        });
    });
});
