import { spawn } from 'child_process';
import * as assert from 'assert';
import * as path from 'path';

console.log('🧪 Phase 2 Verification: Framework MCP Server\n');

// Helper to send JSON-RPC request to MCP server
async function sendMCPRequest(server: any, method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params
        };

        let response = '';

        server.stdout.on('data', (data: Buffer) => {
            response += data.toString();
            try {
                const parsed = JSON.parse(response);
                if (parsed.id === request.id) {
                    resolve(parsed.result);
                }
            } catch {
                // Incomplete JSON, wait for more data
            }
        });

        server.stdin.write(JSON.stringify(request) + '\n');

        setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
}

async function runTests() {
    console.log('Starting MCP server...');

    const serverPath = path.join(process.cwd(), '.mcp', 'servers', 'framework-server.ts');
    const server = spawn('tsx', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Test 1: List tools
        console.log('Test 1: List available tools');
        const tools = await sendMCPRequest(server, 'tools/list', {});
        assert.ok(tools.tools, 'Tools list not returned');
        assert.ok(tools.tools.length > 0, 'No tools found');

        const toolNames = tools.tools.map((t: any) => t.name);
        assert.ok(toolNames.includes('list_cores'), 'list_cores tool missing');
        assert.ok(toolNames.includes('create_core'), 'create_core tool missing');
        assert.ok(toolNames.includes('validate_core'), 'validate_core tool missing');
        assert.ok(toolNames.includes('create_app'), 'create_app tool missing');
        console.log(`✅ Found ${tools.tools.length} tools\n`);

        // Test 2: List cores
        console.log('Test 2: List existing cores');
        const coresResult = await sendMCPRequest(server, 'tools/call', {
            name: 'list_cores',
            arguments: {}
        });
        const cores = JSON.parse(coresResult.content[0].text);
        assert.ok(Array.isArray(cores.cores), 'Cores list not an array');
        console.log(`✅ Found ${cores.cores.length} cores\n`);

        // Test 3: Get system health
        console.log('Test 3: Get system health');
        const healthResult = await sendMCPRequest(server, 'tools/call', {
            name: 'get_system_health',
            arguments: {}
        });
        const health = JSON.parse(healthResult.content[0].text);
        assert.strictEqual(health.status, 'healthy', 'System not healthy');
        assert.ok(health.cores, 'Cores health missing');
        assert.ok(health.apps, 'Apps health missing');
        console.log(`✅ System healthy: ${health.cores.total} cores, ${health.apps.total} apps\n`);

        // Test 4: Check autonomy
        console.log('Test 4: Check autonomy for create_core');
        const autonomyResult = await sendMCPRequest(server, 'tools/call', {
            name: 'check_autonomy',
            arguments: { action: 'create_core' }
        });
        const autonomy = JSON.parse(autonomyResult.content[0].text);
        assert.strictEqual(autonomy.autonomous, true, 'create_core should be autonomous');
        console.log('✅ Autonomy check passed\n');

        console.log('✅ Phase 2 Verification Complete!\n');
        console.log('Framework MCP Server is fully functional.');

        server.kill();
        process.exit(0);
    } catch (error) {
        console.error('❌ Phase 2 Verification Failed:', error);
        server.kill();
        process.exit(1);
    }
}

runTests();
