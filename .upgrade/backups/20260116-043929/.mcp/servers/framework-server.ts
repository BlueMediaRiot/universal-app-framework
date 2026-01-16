import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";

// Define the server
const server = new Server(
    {
        name: "universal-framework-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Helper functions
function getCoresDir(): string {
    return path.join(process.cwd(), "packages", "cores");
}

function getAppsDir(): string {
    return path.join(process.cwd(), "packages", "apps");
}

function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function toPascalCase(str: string): string {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_cores",
                description: "List all available cores in the framework",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "create_core",
                description: "Create a new core from template",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Core name (e.g., 'core-thumbnail-generator')" },
                        description: { type: "string", description: "Core description" },
                        dependencies: {
                            type: "array",
                            items: { type: "string" },
                            description: "Other cores this depends on"
                        },
                        tags: {
                            type: "array",
                            items: { type: "string" },
                            description: "Tags for discovery"
                        }
                    },
                    required: ["name", "description"],
                },
            },
            {
                name: "validate_core",
                description: "Validate a core's structure and exports",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Core name to validate" }
                    },
                    required: ["name"],
                },
            },
            {
                name: "create_app",
                description: "Create a new app from template",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "App name (e.g., 'app-video-processor')" },
                        description: { type: "string", description: "App description" },
                        cores: {
                            type: "array",
                            items: { type: "string" },
                            description: "Cores this app uses"
                        },
                        hasUI: { type: "boolean", description: "Whether app has a UI" }
                    },
                    required: ["name", "description", "cores"],
                },
            },
            {
                name: "get_autonomy_level",
                description: "Get the current autonomy configuration",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "check_autonomy",
                description: "Check if an action can be performed autonomously",
                inputSchema: {
                    type: "object",
                    properties: {
                        action: { type: "string", description: "Action to check (e.g., 'create_core')" },
                        context: { type: "object", description: "Additional context" }
                    },
                    required: ["action"],
                },
            },
            {
                name: "get_system_health",
                description: "Get overall system health status",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            }
        ],
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "list_cores") {
            const coresDir = getCoresDir();
            if (!fs.existsSync(coresDir)) {
                return { content: [{ type: "text", text: JSON.stringify({ cores: [] }) }] };
            }

            const cores = fs.readdirSync(coresDir)
                .filter(item => {
                    const itemPath = path.join(coresDir, item);
                    return fs.statSync(itemPath).isDirectory() && item.startsWith('core-');
                })
                .map(coreName => {
                    const pkgPath = path.join(coresDir, coreName, 'package.json');
                    if (fs.existsSync(pkgPath)) {
                        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                        return {
                            name: coreName,
                            version: pkg.version,
                            description: pkg.description || 'No description'
                        };
                    }
                    return { name: coreName, version: 'unknown', description: 'No package.json' };
                });

            return {
                content: [{ type: "text", text: JSON.stringify({ cores }, null, 2) }],
            };
        }

        if (name === "create_core") {
            const { name: coreName, description, dependencies = [], tags = [] } = args as any;

            if (!coreName || !coreName.startsWith('core-')) {
                throw new Error("Core name must start with 'core-'");
            }

            const coresDir = getCoresDir();
            ensureDir(coresDir);

            const coreDir = path.join(coresDir, coreName);
            if (fs.existsSync(coreDir)) {
                throw new Error(`Core ${coreName} already exists`);
            }

            // Create core directory structure
            ensureDir(coreDir);
            ensureDir(path.join(coreDir, 'src'));

            const pascalName = toPascalCase(coreName);

            // Create package.json
            const packageJson = {
                name: `@universal/${coreName}`,
                version: "0.1.0",
                private: true,
                main: "dist/index.js",
                types: "dist/index.d.ts",
                scripts: {
                    build: "tsc",
                    dev: "tsc -w",
                    clean: "rimraf dist"
                },
                dependencies: {
                    "@universal/core-system": "workspace:*",
                    ...dependencies.reduce((acc: any, dep: string) => {
                        acc[`@universal/${dep}`] = "workspace:*";
                        return acc;
                    }, {})
                },
                devDependencies: {
                    typescript: "^5.3.0",
                    rimraf: "^5.0.0"
                }
            };

            fs.writeFileSync(
                path.join(coreDir, 'package.json'),
                JSON.stringify(packageJson, null, 4)
            );

            // Create tsconfig.json
            const tsconfig = {
                extends: "../../tsconfig.json",
                compilerOptions: {
                    outDir: "./dist",
                    rootDir: "./src"
                },
                include: ["src/**/*"]
            };

            fs.writeFileSync(
                path.join(coreDir, 'tsconfig.json'),
                JSON.stringify(tsconfig, null, 4)
            );

            // Create index.ts
            const indexTs = `import type { CoreDefinition, AppContext } from '@universal/core-system';

/**
 * ${description}
 */
const ${pascalName}: CoreDefinition = {
    metadata: {
        name: '${coreName}',
        version: '0.1.0',
        description: '${description}',
        dependencies: ${JSON.stringify(dependencies)},
    },

    async setup(context: AppContext): Promise<void> {
        // Initialize core
        context.events.emit('${coreName}:setup');
    },

    async start(context: AppContext): Promise<void> {
        // Start core
        context.events.emit('${coreName}:started');
    },

    async stop(): Promise<void> {
        // Cleanup
    }
};

export default ${pascalName};
`;

            fs.writeFileSync(path.join(coreDir, 'src', 'index.ts'), indexTs);

            // Create README.md
            const readme = `# ${coreName}

${description}

## Tags
${tags.map((t: string) => `- ${t}`).join('\n')}

## Dependencies
${dependencies.length > 0 ? dependencies.map((d: string) => `- ${d}`).join('\n') : 'None'}

## Usage

\`\`\`typescript
import ${pascalName} from '@universal/${coreName}';
\`\`\`
`;

            fs.writeFileSync(path.join(coreDir, 'README.md'), readme);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        path: coreDir,
                        message: `Core ${coreName} created successfully`
                    }, null, 2)
                }],
            };
        }

        if (name === "validate_core") {
            const { name: coreName } = args as any;
            const coreDir = path.join(getCoresDir(), coreName);

            if (!fs.existsSync(coreDir)) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            valid: false,
                            errors: [`Core ${coreName} not found`]
                        })
                    }]
                };
            }

            const errors: string[] = [];
            const warnings: string[] = [];

            // Check package.json
            const pkgPath = path.join(coreDir, 'package.json');
            if (!fs.existsSync(pkgPath)) {
                errors.push('Missing package.json');
            }

            // Check src/index.ts
            const indexPath = path.join(coreDir, 'src', 'index.ts');
            if (!fs.existsSync(indexPath)) {
                errors.push('Missing src/index.ts');
            }

            // Check tsconfig.json
            const tsconfigPath = path.join(coreDir, 'tsconfig.json');
            if (!fs.existsSync(tsconfigPath)) {
                warnings.push('Missing tsconfig.json');
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        valid: errors.length === 0,
                        errors,
                        warnings
                    }, null, 2)
                }]
            };
        }

        if (name === "create_app") {
            const { name: appName, description, cores, hasUI = false } = args as any;

            if (!appName || !appName.startsWith('app-')) {
                throw new Error("App name must start with 'app-'");
            }

            const appsDir = getAppsDir();
            ensureDir(appsDir);

            const appDir = path.join(appsDir, appName);
            if (fs.existsSync(appDir)) {
                throw new Error(`App ${appName} already exists`);
            }

            ensureDir(appDir);

            const pascalName = toPascalCase(appName);

            // Create package.json
            const packageJson = {
                name: `@universal/${appName}`,
                version: "0.1.0",
                private: true,
                main: "dist/index.js",
                scripts: {
                    build: "tsc",
                    dev: "tsc -w",
                    start: "node dist/index.js"
                },
                dependencies: {
                    "@universal/core-system": "workspace:*",
                    ...cores.reduce((acc: any, core: string) => {
                        acc[`@universal/${core}`] = "workspace:*";
                        return acc;
                    }, {})
                },
                devDependencies: {
                    typescript: "^5.3.0"
                }
            };

            fs.writeFileSync(
                path.join(appDir, 'package.json'),
                JSON.stringify(packageJson, null, 4)
            );

            // Create index.ts
            const indexTs = `import { CoreLoader, cleanupCores } from '@universal/core-system';
${cores.map((c: string) => `import ${toPascalCase(c)} from '@universal/${c}';`).join('\n')}

export const metadata = {
    name: '${appName}',
    version: '0.1.0',
    description: '${description}',
    cores: ${JSON.stringify(cores)},
    hasUI: ${hasUI}
};

async function main(): Promise<void> {
    const loader = new CoreLoader();
    
    const coresToLoad = {
${cores.map((c: string) => `        '${c}': ${toPascalCase(c)}`).join(',\n')}
    };

    const { cores: loadedCores, context, errors } = await loader.loadCores(
        coresToLoad,
        { appName: metadata.name, environment: process.env.NODE_ENV || 'development' }
    );

    if (errors.length > 0) {
        console.error('Failed to load cores:', errors);
        process.exit(1);
    }

    try {
        // App logic here
        console.log('${appName} started');
    } finally {
        await cleanupCores(context);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
`;

            fs.writeFileSync(path.join(appDir, 'index.ts'), indexTs);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        path: appDir,
                        message: `App ${appName} created successfully`
                    }, null, 2)
                }],
            };
        }

        if (name === "get_autonomy_level") {
            const configPath = path.join(process.cwd(), ".framework", "autonomy.yaml");
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, "utf-8");
                return {
                    content: [{ type: "text", text: content }],
                };
            }
            return { content: [{ type: "text", text: "No autonomy config found." }] };
        }

        if (name === "check_autonomy") {
            const { action, context: actionContext = {} } = args as any;

            // Simple autonomy check - can be enhanced later
            const autonomousActions = [
                'create_core',
                'create_app',
                'validate_core',
                'fix_lint_errors',
                'update_dependencies_patch'
            ];

            const requiresApproval = !autonomousActions.includes(action);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        autonomous: !requiresApproval,
                        requiresApproval,
                        action,
                        reason: requiresApproval ? 'Action not in autonomous list' : 'Action is autonomous'
                    }, null, 2)
                }]
            };
        }

        if (name === "get_system_health") {
            const health = {
                status: 'healthy',
                cores: {
                    total: 0,
                    healthy: 0
                },
                apps: {
                    total: 0,
                    healthy: 0
                },
                timestamp: new Date().toISOString()
            };

            const coresDir = getCoresDir();
            if (fs.existsSync(coresDir)) {
                const cores = fs.readdirSync(coresDir).filter(item => {
                    const itemPath = path.join(coresDir, item);
                    return fs.statSync(itemPath).isDirectory() && item.startsWith('core-');
                });
                health.cores.total = cores.length;
                health.cores.healthy = cores.length; // Simplified
            }

            const appsDir = getAppsDir();
            if (fs.existsSync(appsDir)) {
                const apps = fs.readdirSync(appsDir).filter(item => {
                    const itemPath = path.join(appsDir, item);
                    return fs.statSync(itemPath).isDirectory() && item.startsWith('app-');
                });
                health.apps.total = apps.length;
                health.apps.healthy = apps.length; // Simplified
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(health, null, 2)
                }]
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    error: error instanceof Error ? error.message : String(error)
                })
            }],
            isError: true
        };
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Universal Framework MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
