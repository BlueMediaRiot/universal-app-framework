import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Database } from "bun:sqlite";

const server = new Server(
    {
        name: "universal-coordination-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

const db = new Database(".framework/data/coordination.db");
db.exec("PRAGMA journal_mode = WAL;");

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "claim_task",
                description: "Claim a task to work on. Returns error if already claimed.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: { type: "string" },
                        agentId: { type: "string" }
                    },
                    required: ["taskId", "agentId"]
                }
            },
            {
                name: "complete_task",
                description: "Mark a task as completed.",
                inputSchema: {
                    type: "object",
                    properties: {
                        taskId: { type: "string" }
                    },
                    required: ["taskId"]
                }
            },
            {
                name: "agent_heartbeat",
                description: "Update agent status and heartbeat.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        taskId: { type: "string" },
                        status: { type: "string" }
                    },
                    required: ["agentId", "status"]
                }
            },
            {
                name: "get_agent_status",
                description: "Get status of all agents.",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            },
            {
                name: "acquire_file_lock",
                description: "Lock a file for reading or writing.",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        agentId: { type: "string" },
                        lockType: { type: "string", enum: ["read", "write"] },
                        durationSeconds: { type: "number" }
                    },
                    required: ["filePath", "agentId", "lockType"]
                }
            },
            {
                name: "release_file_lock",
                description: "Release a file lock.",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        agentId: { type: "string" }
                    },
                    required: ["filePath", "agentId"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const anyArgs = args as any;

    try {
        if (name === "claim_task") {
            const { taskId, agentId } = anyArgs;
            const now = Date.now();

            // Check if claimed
            const existing = db.prepare("SELECT * FROM work_queue WHERE task_id = ?").get(taskId) as any;
            if (existing) {
                if (existing.status === 'completed') throw new Error("Task already completed");
                if (existing.claimed_by && existing.claimed_by !== agentId) throw new Error(`Task already claimed by ${existing.claimed_by}`);
            }

            db.prepare(`
                INSERT INTO work_queue (task_id, claimed_by, claimed_at, heartbeat_at, status)
                VALUES (?, ?, ?, ?, 'in_progress')
                ON CONFLICT(task_id) DO UPDATE SET
                claimed_by = excluded.claimed_by,
                claimed_at = excluded.claimed_at,
                heartbeat_at = excluded.heartbeat_at,
                status = 'in_progress'
             `).run(taskId, agentId, now, now);

            return { content: [{ type: "text", text: `Task ${taskId} claimed by ${agentId}` }] };
        }

        if (name === "complete_task") {
            const { taskId } = anyArgs;
            db.prepare("UPDATE work_queue SET status = 'completed' WHERE task_id = ?").run(taskId);
            return { content: [{ type: "text", text: `Task ${taskId} completed` }] };
        }

        if (name === "agent_heartbeat") {
            const { agentId, taskId, status } = anyArgs;
            const now = Date.now();
            db.prepare(`
                INSERT INTO agent_status (agent_id, current_task, status, last_heartbeat)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(agent_id) DO UPDATE SET
                current_task = excluded.current_task,
                status = excluded.status,
                last_heartbeat = excluded.last_heartbeat
            `).run(agentId, taskId || null, status, now);

            if (taskId) {
                db.prepare("UPDATE work_queue SET heartbeat_at = ? WHERE task_id = ? AND claimed_by = ?").run(now, taskId, agentId);
            }
            return { content: [{ type: "text", text: "Heartbeat received" }] };
        }

        if (name === "get_agent_status") {
            const rows = db.prepare("SELECT * FROM agent_status").all();
            return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
        }

        if (name === "acquire_file_lock") {
            const { filePath, agentId, lockType, durationSeconds = 60 } = anyArgs;
            const now = Date.now();
            const expiresAt = now + (durationSeconds * 1000);

            // Check existing locks
            const existing = db.prepare("SELECT * FROM file_locks WHERE file_path = ?").get(filePath) as any;
            if (existing && existing.expires_at > now && existing.locked_by !== agentId) {
                throw new Error(`File is locked by ${existing.locked_by} until ${new Date(existing.expires_at).toISOString()}`);
            }

            db.prepare(`
                INSERT INTO file_locks (file_path, locked_by, lock_type, expires_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(file_path) DO UPDATE SET
                locked_by = excluded.locked_by,
                lock_type = excluded.lock_type,
                expires_at = excluded.expires_at
             `).run(filePath, agentId, lockType, expiresAt);

            return { content: [{ type: "text", text: `Lock acquired on ${filePath} for ${lockType}` }] };
        }

        if (name === "release_file_lock") {
            const { filePath, agentId } = anyArgs;
            const res = db.prepare("DELETE FROM file_locks WHERE file_path = ? AND locked_by = ?").run(filePath, agentId);
            if (res.changes === 0) {
                return { content: [{ type: "text", text: "No lock held by you." }] };
            }
            return { content: [{ type: "text", text: "Lock released" }] };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true
        };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Universal Coordination MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
