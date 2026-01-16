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
                name: "get_autonomy_level",
                description: "Get the current autonomy configuration",
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

    if (name === "list_cores") {
        const coresDir = path.join(process.cwd(), "packages", "cores");
        if (!fs.existsSync(coresDir)) {
            return { content: [{ type: "text", text: "No cores found." }] };
        }
        const cores = fs.readdirSync(coresDir);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(cores, null, 2),
                },
            ],
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

    throw new Error(`Tool not found: ${name}`);
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
