import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";

const server = new Server(
    {
        name: "universal-dashboard-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

function getDashboardDir(): string {
    return path.join(process.cwd(), ".dashboard");
}

function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "request_decision",
                description: "Request a decision from the human",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        title: { type: "string" },
                        summary: { type: "string" },
                        options: { type: "array", items: { type: "object" } },
                        priority: { type: "string", enum: ["low", "normal", "high", "urgent"] }
                    },
                    required: ["id", "type", "title", "summary", "options"],
                },
            },
            {
                name: "get_decision",
                description: "Get a decision by ID",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" }
                    },
                    required: ["id"],
                },
            },
            {
                name: "post_activity",
                description: "Post agent activity status",
                inputSchema: {
                    type: "object",
                    properties: {
                        agent: { type: "string" },
                        task: { type: "string" },
                        progress: { type: "number" },
                        eta: { type: "string" },
                        details: { type: "string" }
                    },
                    required: ["agent", "task", "progress"],
                },
            },
            {
                name: "add_suggestion",
                description: "Add a suggestion for the human",
                inputSchema: {
                    type: "object",
                    properties: {
                        category: { type: "string", enum: ["feature", "optimization", "tech_debt", "security"] },
                        title: { type: "string" },
                        rationale: { type: "string" },
                        effort: { type: "string", enum: ["low", "medium", "high"] },
                        impact: { type: "string", enum: ["low", "medium", "high"] }
                    },
                    required: ["category", "title", "rationale", "effort", "impact"],
                },
            }
        ],
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "request_decision") {
            const { id, type, title, summary, options, priority = "normal" } = args as any;

            const dashboardDir = getDashboardDir();
            const inboxDir = path.join(dashboardDir, "inbox");
            ensureDir(inboxDir);

            const decision = {
                id,
                type,
                title,
                summary,
                options,
                priority,
                timestamp: new Date().toISOString(),
                status: "pending"
            };

            const decisionPath = path.join(inboxDir, `${id}.json`);
            fs.writeFileSync(decisionPath, JSON.stringify(decision, null, 2));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ success: true, path: decisionPath })
                }]
            };
        }

        if (name === "get_decision") {
            const { id } = args as any;

            const decisionPath = path.join(getDashboardDir(), "inbox", `${id}.json`);

            if (!fs.existsSync(decisionPath)) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ found: false })
                    }]
                };
            }

            const decision = JSON.parse(fs.readFileSync(decisionPath, 'utf-8'));
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(decision)
                }]
            };
        }

        if (name === "post_activity") {
            const { agent, task, progress, eta, details } = args as any;

            const dashboardDir = getDashboardDir();
            const activityDir = path.join(dashboardDir, "activity");
            ensureDir(activityDir);

            const activity = {
                agent,
                task,
                progress,
                eta,
                details,
                timestamp: new Date().toISOString()
            };

            const activityPath = path.join(activityDir, `${agent}-${Date.now()}.json`);
            fs.writeFileSync(activityPath, JSON.stringify(activity, null, 2));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ success: true })
                }]
            };
        }

        if (name === "add_suggestion") {
            const { category, title, rationale, effort, impact } = args as any;

            const dashboardDir = getDashboardDir();
            const suggestionsDir = path.join(dashboardDir, "suggestions");
            ensureDir(suggestionsDir);

            const suggestion = {
                category,
                title,
                rationale,
                effort,
                impact,
                timestamp: new Date().toISOString(),
                status: "pending"
            };

            const suggestionPath = path.join(suggestionsDir, `${Date.now()}.json`);
            fs.writeFileSync(suggestionPath, JSON.stringify(suggestion, null, 2));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ success: true })
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
    console.error("Universal Dashboard MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
