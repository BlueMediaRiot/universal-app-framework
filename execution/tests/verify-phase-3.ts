import { CoreLoader, ConfigStore, SecretStore } from '@universal/core-system';
import type { CoreDefinition, AppContext } from '@universal/core-system';
import CoreAiApi, { prompt, complete } from '@universal/core-ai-api';
import * as assert from 'assert';

console.log('🧪 Phase 3 Verification: Standard Cores & AI\n');

async function runTests() {
    console.log('Test 1: Load core-ai-api');

    const loader = new CoreLoader();
    const { cores, context, errors } = await loader.loadCores(
        { 'core-ai-api': CoreAiApi },
        {
            appName: 'test-app',
            'ai.provider': 'openai',
            'ai.model': 'gpt-4'
        }
    );

    assert.strictEqual(errors.length, 0, `Core loading had errors: ${JSON.stringify(errors)}`);
    assert.ok(cores['core-ai-api'], 'core-ai-api not loaded');
    console.log('✅ core-ai-api loaded successfully\n');

    // Test 2: Test AI API methods
    console.log('Test 2: Test AI API prompt function');

    const response = await prompt('Hello, AI!');
    assert.ok(response, 'No response from AI');
    assert.ok(response.includes('Mock AI response'), 'Unexpected response format');
    console.log(`✅ AI prompt returned: "${response}"\n`);

    // Test 3: Test complete method
    console.log('Test 3: Test complete function');
    const messages = [
        { role: 'user' as const, content: 'Test message' }
    ];
    const completeResponse = await complete(messages);
    assert.ok(completeResponse.content, 'No content in response');
    assert.ok(completeResponse.model, 'No model in response');
    assert.ok(completeResponse.usage, 'No usage stats in response');
    console.log('✅ Complete function working\n');

    console.log('✅ Phase 3 Verification Complete!\n');
    console.log('Standard cores and AI interface functional.');
    process.exit(0);
}

runTests().catch(error => {
    console.error('❌ Phase 3 Verification Failed:', error);
    process.exit(1);
});
