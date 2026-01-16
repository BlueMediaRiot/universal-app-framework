# Universal App Framework - Complete Design Specification

**Status**: Final Design - Ready for Implementation  
**Date**: January 15, 2026  
**Author**: Claude (initial design), Claude Opus 4.5 (review and revision)  
**Target Platform**: Google Antigravity (agent-first development platform)  
**Philosophy**: Maximum agent autonomy, human as director

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Philosophy: Human as Director](#2-philosophy-human-as-director)
3. [Architecture Overview](#3-architecture-overview)
4. [Tool Requirements](#4-tool-requirements)
5. [Antigravity Integration](#5-antigravity-integration)
6. [MCP Server Architecture](#6-mcp-server-architecture)
7. [Git Strategy](#7-git-strategy)
8. [Core System Design](#8-core-system-design)
9. [App System Design](#9-app-system-design)
10. [Agent Roles & Workflows](#10-agent-roles--workflows)
11. [Idea Intake System](#11-idea-intake-system)
12. [Autonomy System](#12-autonomy-system)
13. [Decision Learning](#13-decision-learning)
14. [Dashboard System](#14-dashboard-system)
15. [Directives & Automation](#15-directives--automation)
16. [Secrets & Environment](#16-secrets--environment)
17. [Database Strategy](#17-database-strategy)
18. [Testing Strategy](#18-testing-strategy)
19. [Documentation System](#19-documentation-system)
20. [Implementation Checklist](#20-implementation-checklist)
21. [Appendices](#21-appendices)

---

## 1. Executive Summary

### What is This?

The **Universal App Framework** is a modular, agent-driven application architecture designed for:
- **Rapid app development** through reusable Cores
- **Maximum agent autonomy** with human as director
- **Self-improving systems** that learn from decisions
- **Seamless Antigravity integration** with MCP servers

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Cores** | Reusable feature modules (build once, use everywhere) |
| **Apps** | Compositions of Cores that deliver functionality |
| **Agents** | AI workers that plan, code, test, and deploy autonomously |
| **Director** | Human role - provides ideas, makes key decisions |
| **MCP Servers** | Protocol for agents to access external tools/data |

### Key Innovation

Instead of humans writing code with AI assistance, **agents write code autonomously** while humans provide direction. The human's job is to:
- Have ideas
- Make high-level decisions
- Set priorities
- Approve major changes (when configured)

**That's it.** Agents handle everything else.

---

## 2. Philosophy: Human as Director

### The Old Way (Human-Heavy)

```
Human has idea
  → Human writes spec
    → Human tells agent to code
      → Agent codes
        → Human reviews
          → Human tells agent to test
            → Agent tests
              → Human deploys
```

### The New Way (Agent-Autonomous)

```
Human has idea (natural language)
  → Agents plan, code, test, document, deploy
    → Agents report status + suggest next ideas
      → Human approves/adjusts (if needed)
        → Agents continue autonomously
```

### What Humans Do

| Activity | Time | Frequency |
|----------|------|-----------|
| Drop ideas in chat | 2-5 min | When inspired |
| Review inbox decisions | 5 min | Daily |
| Check weekly report | 10 min | Weekly |
| Adjust priorities | 5 min | As needed |

### What Humans Don't Do

- ❌ Write code
- ❌ Write technical specs (agents do this)
- ❌ Run commands
- ❌ Debug (agents do this)
- ❌ Write documentation (agents do this)
- ❌ Manage Git (agents do this)
- ❌ Deploy (agents do this, with approval if configured)

---

## 3. Architecture Overview

### The Three Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: DIRECTIVES (What to do)                                 │
│ ├── Human-written SOPs in Markdown                              │
│ ├── In directives/ folder                                       │
│ ├── Synced to .antigravity/rules/                              │
│ └── Updated automatically as agents learn                       │
├─────────────────────────────────────────────────────────────────┤
│ TIER 2: ORCHESTRATION (Decision making)                         │
│ ├── AI agents (7 roles + background workers)                    │
│ ├── Read directives via Antigravity rules                       │
│ ├── Access tools via MCP servers                                │
│ ├── Use Plan mode for complex, Fast mode for simple             │
│ └── Learn from human decisions over time                        │
├─────────────────────────────────────────────────────────────────┤
│ TIER 3: EXECUTION (Doing the work)                              │
│ ├── Deterministic scripts in execution/                         │
│ ├── MCP servers for external access                             │
│ ├── Git for version control                                     │
│ └── GitHub for collaboration/CI                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Monorepo Structure

```
universal-app-framework/
│
├── .antigravity/                  # Antigravity integration
│   ├── rules/                     # Auto-synced from directives/
│   ├── workflows/                 # Task templates
│   └── knowledge/                 # Auto-populated learnings
│
├── .mcp/                          # MCP server configuration
│   ├── servers/
│   │   ├── framework-server.ts   # Custom framework operations
│   │   └── dashboard-server.ts   # Dashboard operations
│   ├── config.json               # MCP server config
│   └── README.md
│
├── .framework/                    # Framework configuration
│   ├── autonomy.yaml             # Autonomy levels
│   ├── git-strategy.yaml         # Git conventions
│   ├── requirements.yaml         # Tool requirements
│   ├── learned-patterns.yaml     # Decision patterns
│   └── data/
│       ├── framework.db          # SQLite framework data
│       └── memory.db             # Agent memory store
│
├── .dashboard/                    # Human-facing communication
│   ├── inbox/                    # Decisions waiting for human
│   ├── activity/                 # Current agent status
│   ├── suggestions/              # Agent recommendations
│   ├── reports/                  # Status reports
│   └── decisions/                # Decision history log
│
├── .github/                       # GitHub configuration
│   └── workflows/
│       ├── validate.yml
│       └── deploy.yml
│
├── .husky/                        # Git hooks
│   └── pre-commit
│
├── idea-inbox/                    # Human drops ideas here
│   ├── drafts/                   # Work in progress ideas
│   └── quick/                    # Quick ideas for later
│
├── specs/                         # Agent-generated specs
│
├── directives/                    # Agent SOPs (source of truth)
│   ├── create-core.md
│   ├── create-app.md
│   ├── test-core.md
│   ├── test-app.md
│   ├── audit-system.md
│   └── architecture-decision.md
│
├── execution/                     # Automation scripts (TypeScript)
│   ├── check-environment.ts
│   ├── validate-core.ts
│   ├── validate-app.ts
│   ├── validate-all.ts
│   ├── check-dependencies.ts
│   ├── test-core.ts
│   ├── test-app.ts
│   ├── generate-docs.ts
│   ├── sync-antigravity-rules.ts
│   ├── rollback.ts
│   └── tsconfig.json
│
├── packages/
│   ├── core-system/               # Runtime (do not modify)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── core-loader.ts
│   │   │   ├── event-bus.ts
│   │   │   ├── config-store.ts
│   │   │   ├── secret-store.ts
│   │   │   ├── service-registry.ts
│   │   │   └── plugin-registry.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cores/                     # Reusable features
│   │   ├── registry.ts           # Core registry
│   │   ├── core-logger/
│   │   └── [core-name]/
│   │
│   ├── apps/                      # Applications
│   │   ├── app-example/
│   │   └── [app-name]/
│   │
│   └── templates/                 # Templates
│       ├── core-template.ts
│       └── app-template.ts
│
├── docs/                          # Auto-generated documentation
│   ├── README.md
│   ├── QUICK-START.md
│   ├── cores/
│   ├── apps/
│   ├── api/
│   └── architecture/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .env.example                   # Environment template
└── .gitignore
```

---

## 4. Tool Requirements

### Required Tools

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| **Node.js** | 20.x LTS | Runtime | https://nodejs.org or `nvm install 20` |
| **pnpm** | 8.x | Package manager | `npm install -g pnpm` |
| **Git** | 2.40+ | Version control | https://git-scm.com |
| **Antigravity** | Latest | IDE / Agent platform | https://antigravity.google/download |
| **GitHub CLI** | Latest | GitHub integration | `brew install gh` or https://cli.github.com |

### Optional Tools (Auto-installed When Needed)

| Tool | Version | Needed For | Install |
|------|---------|------------|---------|
| **FFmpeg** | 6.x | Video cores | `brew install ffmpeg` |
| **ImageMagick** | 7.x | Image cores | `brew install imagemagick` |
| **SQLite** | 3.x | Database cores | Usually pre-installed |
| **Docker** | 24.x | Isolated testing | https://docker.com |

### Auto-Installed via pnpm

These are installed automatically when you run `pnpm install`:
- TypeScript
- Turbo
- ESLint
- Prettier
- Husky
- MCP SDK
- All type definitions

### Requirements File

```yaml
# .framework/requirements.yaml

system:
  os:
    supported:
      - macOS 12+
      - Windows 10+ (WSL2 recommended)
      - Ubuntu 22.04+
      - Debian 11+

required:
  node:
    version: "20.x"
    verify: "node --version"
    
  pnpm:
    version: "8.x"
    verify: "pnpm --version"
    
  git:
    version: "2.40+"
    verify: "git --version"
    
  antigravity:
    version: "latest"
    verify: "agy --version"
    
  github_cli:
    version: "latest"
    verify: "gh --version"

optional:
  ffmpeg:
    version: "6.x"
    needed_for: ["core-video-*", "core-thumbnail-*"]
    install:
      macos: "brew install ffmpeg"
      ubuntu: "apt install ffmpeg"
      windows: "choco install ffmpeg"
      
  imagemagick:
    version: "7.x"
    needed_for: ["core-image-*"]
    install:
      macos: "brew install imagemagick"
      ubuntu: "apt install imagemagick"
      windows: "choco install imagemagick"

verification:
  script: "pnpm exec ts-node execution/check-environment.ts"
```

### Environment Check Script

```typescript
// execution/check-environment.ts

import { execSync } from 'child_process'

interface ToolCheck {
  name: string
  command: string
  versionPattern: RegExp
  minVersion: string
  required: boolean
  installHint: string
}

const tools: ToolCheck[] = [
  {
    name: 'Node.js',
    command: 'node --version',
    versionPattern: /v(\d+\.\d+\.\d+)/,
    minVersion: '20.0.0',
    required: true,
    installHint: 'https://nodejs.org or: nvm install 20'
  },
  {
    name: 'pnpm',
    command: 'pnpm --version',
    versionPattern: /(\d+\.\d+\.\d+)/,
    minVersion: '8.0.0',
    required: true,
    installHint: 'npm install -g pnpm'
  },
  {
    name: 'Git',
    command: 'git --version',
    versionPattern: /git version (\d+\.\d+)/,
    minVersion: '2.40',
    required: true,
    installHint: 'https://git-scm.com'
  },
  {
    name: 'GitHub CLI',
    command: 'gh --version',
    versionPattern: /gh version (\d+\.\d+\.\d+)/,
    minVersion: '2.0.0',
    required: true,
    installHint: 'brew install gh'
  },
  {
    name: 'Antigravity',
    command: 'agy --version',
    versionPattern: /(\d+\.\d+\.\d+)/,
    minVersion: '1.0.0',
    required: true,
    installHint: 'https://antigravity.google/download'
  },
  {
    name: 'FFmpeg',
    command: 'ffmpeg -version',
    versionPattern: /ffmpeg version (\d+\.\d+)/,
    minVersion: '6.0',
    required: false,
    installHint: 'brew install ffmpeg'
  }
]

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1
    if ((pa[i] || 0) < (pb[i] || 0)) return -1
  }
  return 0
}

async function checkEnvironment(): Promise<void> {
  console.log('🔍 Checking development environment...\n')
  
  let hasErrors = false
  
  console.log('Tool            Status  Details')
  console.log('─'.repeat(60))
  
  for (const tool of tools) {
    try {
      const output = execSync(tool.command, { 
        encoding: 'utf-8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      })
      const match = output.match(tool.versionPattern)
      
      if (match) {
        const version = match[1]
        if (compareVersions(version, tool.minVersion) >= 0) {
          console.log(`${tool.name.padEnd(16)}✅      ${version}`)
        } else {
          console.log(`${tool.name.padEnd(16)}⚠️       ${version} (needs ${tool.minVersion}+)`)
          if (tool.required) hasErrors = true
        }
      }
    } catch {
      if (tool.required) {
        console.log(`${tool.name.padEnd(16)}❌      Not installed`)
        console.log(`                        Install: ${tool.installHint}`)
        hasErrors = true
      } else {
        console.log(`${tool.name.padEnd(16)}⚪      Not installed (optional)`)
      }
    }
  }
  
  // Check GitHub auth
  console.log('')
  try {
    execSync('gh auth status', { stdio: 'pipe' })
    console.log('GitHub Auth     ✅      Authenticated')
  } catch {
    console.log('GitHub Auth     ❌      Not authenticated')
    console.log('                        Run: gh auth login')
    hasErrors = true
  }
  
  console.log('')
  if (hasErrors) {
    console.log('❌ Environment check failed. Install missing tools above.')
    process.exit(1)
  } else {
    console.log('✅ Environment ready!')
  }
}

checkEnvironment()
```

---

## 5. Antigravity Integration

### Overview

Antigravity is an agent-first IDE where AI agents autonomously plan, execute, and verify tasks. This framework integrates deeply with Antigravity through:

1. **Rules** - Directives become Antigravity rules
2. **Workflows** - Predefined task templates
3. **Knowledge Base** - Persistent learnings
4. **Artifacts** - Structured outputs
5. **Notifications** - Native Antigravity notifications

### The .antigravity/ Folder

```
.antigravity/
├── rules/                     # Synced from directives/
│   ├── create-core.md
│   ├── create-app.md
│   ├── test-core.md
│   ├── test-app.md
│   ├── audit-system.md
│   └── architecture-decision.md
│
├── workflows/                 # Task templates
│   ├── new-core.md
│   ├── new-app.md
│   ├── full-test-cycle.md
│   └── release.md
│
└── knowledge/                 # Auto-populated by Antigravity
    ├── code-patterns/
    ├── error-solutions/
    └── project-context/
```

### Plan Mode vs Fast Mode

| Task | Mode | Rationale |
|------|------|-----------|
| Create new core | **Plan** | Complex, needs analysis |
| Create new app | **Plan** | Needs to determine cores |
| Architecture decision | **Plan** | Requires trade-off evaluation |
| Refine idea with human | **Plan** | Interactive conversation |
| Fix typo | **Fast** | Simple change |
| Run validation | **Fast** | Deterministic command |
| Update JSDoc | **Fast** | Simple text change |
| Run tests | **Fast** | Deterministic command |
| Add new method | **Plan** | Interface design needed |
| Debug failing test | **Plan** | Investigation required |

### Directive → Rule Sync

```typescript
// execution/sync-antigravity-rules.ts

import * as fs from 'fs'
import * as path from 'path'

const DIRECTIVES_DIR = './directives'
const RULES_DIR = './.antigravity/rules'

function syncRules(): void {
  fs.mkdirSync(RULES_DIR, { recursive: true })
  
  const directives = fs.readdirSync(DIRECTIVES_DIR)
    .filter(f => f.endsWith('.md'))
  
  for (const file of directives) {
    const source = path.join(DIRECTIVES_DIR, file)
    const dest = path.join(RULES_DIR, file)
    
    let content = fs.readFileSync(source, 'utf-8')
    
    if (!content.includes('**Antigravity Mode**')) {
      const mode = inferMode(file)
      content = `**Antigravity Mode**: ${mode}\n\n${content}`
    }
    
    fs.writeFileSync(dest, content)
    console.log(`✓ Synced: ${file}`)
  }
  
  console.log(`\n✅ Synced ${directives.length} rules to .antigravity/rules/`)
}

function inferMode(filename: string): string {
  const planTasks = ['create', 'architecture', 'refine']
  const fastTasks = ['test', 'validate', 'fix', 'update']
  
  for (const task of planTasks) {
    if (filename.includes(task)) return 'Plan'
  }
  for (const task of fastTasks) {
    if (filename.includes(task)) return 'Fast'
  }
  return 'Plan'
}

syncRules()
```

### Knowledge Base vs Directives

| Store In | What | Examples |
|----------|------|----------|
| **Knowledge Base** (auto) | Project-specific learnings | "This project uses WebP", error solutions |
| **Directives** (manual) | Universal procedures | How to create cores, test apps |

---

## 6. MCP Server Architecture

### What is MCP?

MCP (Model Context Protocol) lets AI agents connect to external tools and data.

```
Without MCP:
  Agent → Limited to conversation context
  
With MCP:
  Agent → MCP Servers → GitHub, Databases, APIs, Memory, etc.
```

### MCP Servers Overview

| Server | Purpose | Type |
|--------|---------|------|
| **github** | GitHub API access | Standard |
| **filesystem** | Enhanced file access | Standard |
| **memory** | Persistent agent memory | Standard |
| **sqlite** | Database queries | Standard |
| **framework** | Framework operations | Custom |
| **dashboard** | Human communication | Custom |

### MCP Configuration

```json
// .mcp/config.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${PROJECT_ROOT}"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", 
               "--db-path", ".framework/data/framework.db"]
    },
    "framework": {
      "command": "node",
      "args": [".mcp/servers/framework-server.js"]
    },
    "dashboard": {
      "command": "node",
      "args": [".mcp/servers/dashboard-server.js"]
    }
  }
}
```

### GitHub MCP Interface

```typescript
interface GitHubMCP {
  // Branches
  createBranch(params: { name: string; from: string }): Promise<void>
  deleteBranch(name: string): Promise<void>
  
  // Commits
  commit(params: { message: string; files: string[] }): Promise<{ sha: string }>
  push(branch: string): Promise<void>
  
  // Pull Requests
  createPR(params: {
    title: string
    head: string
    base: string
    body: string
  }): Promise<{ number: number; url: string }>
  mergePR(number: number): Promise<void>
  getPRComments(number: number): Promise<Comment[]>
  
  // Issues
  createIssue(params: {
    title: string
    body: string
    labels?: string[]
  }): Promise<{ number: number }>
  searchIssues(params: { labels?: string[]; state?: 'open' | 'closed' }): Promise<Issue[]>
  
  // CI Status
  getCheckStatus(sha: string): Promise<{ allPassed: boolean; checks: Check[] }>
}
```

### Framework MCP Interface

```typescript
interface FrameworkMCP {
  // Core operations
  createCore(params: {
    name: string
    description: string
    dependencies?: string[]
    tags?: string[]
  }): Promise<{ path: string }>
  
  validateCore(name: string): Promise<ValidationResult>
  testCore(name: string): Promise<TestResult>
  listCores(): Promise<CoreInfo[]>
  
  // App operations
  createApp(params: {
    name: string
    description: string
    cores: string[]
    hasUI?: boolean
  }): Promise<{ path: string }>
  
  validateApp(name: string): Promise<ValidationResult>
  testApp(name: string): Promise<TestResult>
  listApps(): Promise<AppInfo[]>
  
  // System operations
  getDependencyGraph(): Promise<DependencyGraph>
  getSystemHealth(): Promise<HealthReport>
  
  // Autonomy
  checkAutonomy(params: {
    action: string
    context?: Record<string, any>
  }): Promise<{
    autonomous: boolean
    reason?: string
    requiresApproval?: boolean
  }>
  
  // Registry
  updateRegistry(): Promise<void>
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: { lines: number; methods: number }
}

interface TestResult {
  passed: boolean
  total: number
  passed_count: number
  failed_count: number
  failures: TestFailure[]
}
```

### Dashboard MCP Interface

```typescript
interface DashboardMCP {
  // Decision requests
  requestDecision(params: {
    id: string
    type: string
    title: string
    summary: string
    options: DecisionOption[]
    priority: 'low' | 'normal' | 'high' | 'urgent'
    deadline?: Date
    context?: Record<string, any>
  }): Promise<void>
  
  getDecision(id: string): Promise<Decision | null>
  getPendingDecisions(): Promise<Decision[]>
  
  // Activity updates
  postActivity(params: {
    agent: string
    task: string
    progress: number
    eta?: string
    details?: string
  }): Promise<void>
  
  completeActivity(params: {
    agent: string
    task: string
    result: 'success' | 'failure'
    summary: string
  }): Promise<void>
  
  // Suggestions
  addSuggestion(params: {
    category: 'feature' | 'optimization' | 'tech_debt' | 'security'
    title: string
    rationale: string
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
  }): Promise<void>
  
  // Notifications (Antigravity native)
  notify(params: {
    title: string
    body: string
    type: 'info' | 'success' | 'warning' | 'error'
    action?: { label: string; link: string }
  }): Promise<void>
  
  // Reports
  generateDailyReport(): Promise<string>
  generateWeeklyReport(): Promise<string>
}
```

### Memory MCP Interface

```typescript
interface MemoryMCP {
  // Store learnings
  store(params: {
    type: 'learning' | 'pattern' | 'preference' | 'error_solution'
    category: string
    content: string
    tags?: string[]
    confidence?: number
    source?: string
  }): Promise<{ id: string }>
  
  // Recall relevant memories
  recall(params: {
    query: string
    type?: string
    limit?: number
  }): Promise<Memory[]>
  
  // Track decisions for learning
  trackDecision(params: {
    type: string
    context: Record<string, any>
    decision: string
    timeToDecide: number
  }): Promise<void>
  
  // Preferences
  storePreference(key: string, value: any): Promise<void>
  getPreference(key: string): Promise<any>
  
  // Patterns
  getPatterns(): Promise<Pattern[]>
  updatePatternConfidence(id: string, delta: number): Promise<void>
}
```

---

## 7. Git Strategy

### Branch Structure

```
main                           # Production-ready code
├── develop                    # Integration branch
│   ├── agent/create-xxx      # Agent working branches
│   ├── agent/fix-xxx
│   └── experiment/xxx        # Experiments
└── release/x.x.x             # Release branches
```

### Branch Rules

```yaml
# .framework/git-strategy.yaml

branches:
  main:
    purpose: Production-ready code
    protection:
      - require_tests_pass: true
      - require_audit_pass: true
    who_merges: agents_if_tests_pass
    
  develop:
    purpose: Integration branch
    protection:
      - require_tests_pass: true
    who_merges: agents_autonomous
    
  agent/*:
    purpose: Agent working branches
    naming: "agent/{task-type}-{description}"
    lifecycle:
      - create_from: develop
      - work_and_commit: regular small commits
      - test: run tests before merge
      - merge_to: develop (if tests pass)
      - cleanup: delete after merge
      
  experiment/*:
    purpose: Try risky changes
    naming: "experiment/{id}-{description}"
    rules:
      - never_merge_directly_to_main: true
      - auto_delete_after: "7 days"
      - notify_human_if_successful: true
```

### Commit Message Format

```
[{agent}] {type}: {subject}

Agents: architect, core-dev, app-dev, tester, auditor, optimizer, idea-refiner, system
Types: create, update, fix, test, docs, refactor, experiment, revert

Examples:
  [core-dev] create: core-thumbnail-generator
  [tester] test: add integration tests for video suite
  [system] fix: auto-fix lint errors
```

### Agent Git Workflow

```typescript
async function agentCreateFeature(feature: string) {
  // 1. Create branch
  await mcp.github.createBranch({
    name: `agent/create-${feature}`,
    from: 'develop'
  })
  
  // 2. Do work
  await doWork()
  await mcp.github.commit({
    message: `[core-dev] create: ${feature}`,
    files: [`packages/cores/core-${feature}/*`]
  })
  
  // 3. Test
  const tests = await mcp.framework.testCore(feature)
  
  // 4. Push
  await mcp.github.push(`agent/create-${feature}`)
  
  // 5. Merge if tests pass
  if (tests.passed) {
    const pr = await mcp.github.createPR({...})
    await mcp.github.mergePR(pr.number)
    await mcp.dashboard.notify({
      title: `Core created: ${feature}`,
      body: 'Merged to develop',
      type: 'success'
    })
  }
}
```

### Self-Annealing Through Git

```typescript
async function selfAnneal(bug: Bug, fix: Fix, learning: string) {
  // 1. Fix the bug
  await applyFix(fix)
  await mcp.github.commit({
    message: `[${agent}] fix: ${bug.description}`,
    files: bug.affectedFiles
  })
  
  // 2. Update directive with learning
  await updateDirective(directive, {
    section: 'Edge Cases',
    content: `- **${bug.title}** (discovered ${today})\n  ${learning}`
  })
  await mcp.github.commit({
    message: `[${agent}] docs: add learning to ${directive}`,
    files: [`directives/${directive}.md`]
  })
  
  // 3. Store in memory
  await mcp.memory.store({
    type: 'error_solution',
    category: bug.category,
    content: learning
  })
}
```

### Rollback Capability

```typescript
interface RollbackOptions {
  target: 'commit' | 'core' | 'app' | 'timepoint'
  identifier: string
  reason: string
}

async function rollback(options: RollbackOptions): Promise<void> {
  switch (options.target) {
    case 'commit':
      await git.revert(options.identifier)
      break
    case 'core':
      const lastGood = await findLastGoodCommit(`packages/cores/${options.identifier}`)
      await git.checkout(lastGood, `packages/cores/${options.identifier}`)
      break
    case 'app':
      const lastGoodApp = await findLastGoodCommit(`packages/apps/${options.identifier}`)
      await git.checkout(lastGoodApp, `packages/apps/${options.identifier}`)
      break
    case 'timepoint':
      const commitAtTime = await git.findCommitAtTime(options.identifier)
      await git.revert(`${commitAtTime}..HEAD`)
      break
  }
  
  await mcp.github.commit({
    message: `[system] revert: ${options.reason}`,
    files: ['.']
  })
  
  await mcp.dashboard.notify({
    title: 'Rollback completed',
    body: options.reason,
    type: 'warning'
  })
}
```

### Experimentation

```typescript
async function runExperiment(hypothesis: string, implementation: () => Promise<void>): Promise<void> {
  const experimentId = generateId()
  const branch = `experiment/${experimentId}-${slugify(hypothesis)}`
  
  await mcp.github.createBranch({ name: branch, from: 'develop' })
  
  try {
    await implementation()
    const results = await runTests()
    
    if (results.passed) {
      await mcp.github.commit({
        message: `[optimizer] experiment: ${hypothesis} - SUCCESS`,
        files: ['.']
      })
      await mcp.dashboard.notify({
        title: 'Experiment succeeded!',
        body: hypothesis,
        type: 'success'
      })
    } else {
      await mcp.memory.store({
        type: 'learning',
        category: 'experiment_failure',
        content: `${hypothesis}: ${results.summary}`
      })
      // Branch auto-deletes after 7 days
    }
  } catch (error) {
    await mcp.github.checkout('develop')
  }
}
```

---

## 8. Core System Design

### What is a Core?

A **Core** is a reusable feature module that:
- Does ONE thing well (single responsibility)
- Can be used in multiple apps
- Has a clear, documented interface
- Can be tested independently

### Core Registry

```typescript
// packages/cores/registry.ts

export const coreRegistry = {
  'core-logger': () => import('./core-logger'),
  'core-video-exporter': () => import('./core-video-exporter'),
  'core-ai-api': () => import('./core-ai-api'),
} as const

export type CoreName = keyof typeof coreRegistry
```

### Core Metadata

```typescript
interface CoreMetadata {
  name: string                          // 'core-xxx' format
  version: string                       // Semver
  description: string                   // What it does
  tags: string[]                        // For discovery
  dependencies?: Record<string, string> // Other cores needed
  requiredConfig?: string[]             // Required config keys
  optionalConfig?: string[]             // Optional config keys
  transport?: 'in-process' | 'http'     // Load method
}
```

### Core Definition

```typescript
interface CoreDefinition {
  metadata: CoreMetadata
  
  // Lifecycle (optional)
  init?(context: AppContext): Promise<void>
  cleanup?(context: AppContext): Promise<void>
  onReady?(context: AppContext): Promise<void>
  healthCheck?(context: AppContext): Promise<HealthStatus>
  
  // Methods (core-specific)
  [methodName: string]: any
}
```

### AppContext

```typescript
interface AppContext {
  appName: string
  environment: 'development' | 'staging' | 'production'
  appConfig: Record<string, any>
  
  // Services
  eventBus: EventBus
  configStore: ConfigStore
  secretStore: SecretStore
  serviceRegistry: ServiceRegistry
  pluginRegistry: PluginRegistry
  
  // Utilities
  cores: Record<string, any>
  dryRun: boolean
}
```

### Core Size Guidelines

| Lines | Structure |
|-------|-----------|
| <300 | Single `index.ts` file |
| 300-800 | Split: index.ts, handlers.ts, types.ts |
| >800 | Must split into multiple cores |

### Example Core

```typescript
// packages/cores/core-logger/index.ts

import type { CoreDefinition, AppContext } from '@universal/core-system'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const coreLogger: CoreDefinition = {
  metadata: {
    name: 'core-logger',
    version: '1.0.0',
    description: 'Structured logging for all apps',
    tags: ['logging', 'debug', 'utility'],
    optionalConfig: ['logger.level', 'logger.prefix']
  },

  _config: null as { level: LogLevel; prefix: string } | null,

  async init(context: AppContext): Promise<void> {
    this._config = {
      level: context.configStore.get('logger.level', 'info'),
      prefix: context.configStore.get('logger.prefix', '')
    }
  },

  log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    if (levels.indexOf(level) >= levels.indexOf(this._config?.level || 'info')) {
      const prefix = this._config?.prefix ? `[${this._config.prefix}] ` : ''
      const timestamp = new Date().toISOString()
      console[level](`${timestamp} ${prefix}${level.toUpperCase()}: ${message}`, data || '')
    }
  },

  debug(message: string, data?: Record<string, any>): void { this.log('debug', message, data) },
  info(message: string, data?: Record<string, any>): void { this.log('info', message, data) },
  warn(message: string, data?: Record<string, any>): void { this.log('warn', message, data) },
  error(message: string, data?: Record<string, any>): void { this.log('error', message, data) },

  async healthCheck(): Promise<{ healthy: boolean }> {
    return { healthy: true }
  }
}

export default coreLogger
```

---

## 9. App System Design

### What is an App?

An **App** is a composition of Cores:
- Declares which Cores it uses
- Configures those Cores
- Loads them via CoreLoader
- Handles app lifecycle

### App Metadata

```typescript
interface AppMetadata {
  name: string
  version: string
  description: string
  cores: string[]
  hasUI: boolean
  environment?: 'development' | 'staging' | 'production'
}
```

### Example App

```typescript
// packages/apps/app-example/index.ts

import { CoreLoader, cleanupCores } from '@universal/core-system'
import { coreRegistry } from '../../cores/registry'

export const metadata = {
  name: 'app-example',
  version: '1.0.0',
  description: 'Example application',
  cores: ['core-logger'],
  hasUI: false
}

const appConfig = {
  appName: metadata.name,
  environment: process.env.NODE_ENV || 'development',
  'logger.level': 'debug'
}

async function main(): Promise<void> {
  const loader = new CoreLoader()
  
  const coresToLoad = {
    'core-logger': (await coreRegistry['core-logger']()).default
  }

  const { cores, context, errors } = await loader.loadCores(coresToLoad, appConfig)

  if (errors.length > 0) {
    console.error('Failed to load cores:', errors)
    process.exit(1)
  }

  try {
    const logger = cores['core-logger']
    logger.info('App started')
    // App logic here
    logger.info('App completed')
  } finally {
    await cleanupCores(context)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
```

---

## 10. Agent Roles & Workflows

### The Eight Agent Roles

| Agent | Purpose | Mode | Autonomy |
|-------|---------|------|----------|
| **Idea Refiner** | Chat with human to clarify ideas | Plan | Interactive |
| **Architect** | System design and planning | Plan | Per config |
| **Core Developer** | Build cores | Plan/Fast | Per config |
| **App Developer** | Build apps | Plan/Fast | Per config |
| **Tester** | Test everything | Fast | Aggressive |
| **Auditor** | Quality checks | Plan | Aggressive |
| **Optimizer** | Improve system | Plan | Per config |
| **Learner** | Track decisions, detect patterns | Background | Autonomous |

### Agent Artifacts

| Agent | Produces |
|-------|----------|
| Idea Refiner | Refined idea summary, spec draft |
| Architect | Implementation plan, dependency graph, ADR |
| Core Developer | Code files, test results, registry update |
| App Developer | App code, configuration, integration tests |
| Tester | Test report, coverage, browser walkthrough |
| Auditor | Audit report, quality metrics |
| Optimizer | Refactoring plan, performance comparison |
| Learner | Pattern updates, auto-approval recommendations |

### Workflow: End-to-End Feature

```
1. Human drops idea in chat
   ↓
2. Idea Refiner clarifies with human
   ↓
3. Architect creates implementation plan
   ↓
4. [Optional] Human approves plan
   ↓
5. Core Developer creates cores
   ↓
6. Tester tests cores
   ↓
7. App Developer integrates
   ↓
8. Tester tests app
   ↓
9. Auditor validates quality
   ↓
10. Agents merge to develop
    ↓
11. [If configured] Agents deploy
    ↓
12. Learner tracks the journey
```

---

## 11. Idea Intake System

### How It Works

Human talks to the **Idea Refiner** agent in natural language. The agent asks clarifying questions, then produces a structured spec.

### Example Conversation

```
You: I want to add thumbnail generation to the video app

Idea Refiner: Nice idea! Let me ask a few questions:

1. Should thumbnails generate automatically on upload, 
   or on-demand when requested?

2. What sizes do you need?
   - Small (150x150) for lists
   - Medium (300x200) for previews  
   - Large (1280x720) for hero images

3. Should we pick the "best" frame using AI?
───────────────────────────────────────────────────────
You: Automatic on upload. All three sizes. Yes use AI

Idea Refiner: Perfect! Here's what I captured:

┌─────────────────────────────────────────────────────┐
│ IDEA: Video Thumbnail Generator                     │
│                                                     │
│ • Auto-generate on video upload                     │
│ • Sizes: 150x150, 300x200, 1280x720                │
│ • AI-powered "best frame" selection                 │
│ • New core: core-thumbnail-generator                │
│                                                     │
│ Dependencies: core-video-decoder, core-ai-api       │
│ Estimated effort: 2-3 hours                         │
└─────────────────────────────────────────────────────┘

Does this look right? I can:
• [Send to Architect] - Start planning
• [Refine more] - Keep discussing
• [Save as draft] - Come back later
───────────────────────────────────────────────────────
You: Send to architect

Idea Refiner: Done! Created specs/007-thumbnail-generator.md
You'll get a notification when the plan is ready.
```

### Quick Ideas

```
You: Quick idea: add GIF export support

Idea Refiner: Saved to ideas/quick/gif-export.md
Say "let's discuss gif export" to dive in now.
```

### Draft Ideas

```
You: Save as draft

Idea Refiner: Saved to idea-inbox/drafts/thumbnail-generator.md
I'll remind you in 3 days.
```

---

## 12. Autonomy System

### Autonomy Levels

| Level | What Agents Can Do |
|-------|-------------------|
| **Conservative** | Ask approval for most things |
| **Moderate** | Proceed unless major change |
| **Aggressive** | Do everything, notify after |

### Autonomy Configuration

```yaml
# .framework/autonomy.yaml

default_level: moderate

levels:
  conservative:
    autonomous:
      - fix_lint_errors
      - update_dependencies_patch
      - regenerate_docs
    needs_approval:
      - everything_else
      
  moderate:
    autonomous:
      - fix_lint_errors
      - fix_type_errors
      - update_dependencies_patch
      - update_dependencies_minor
      - add_tests
      - improve_docs
      - create_core
      - refactor_within_core
    needs_approval:
      - delete_core
      - change_public_interface
      - deploy_production
      - update_dependencies_major
      - architecture_change
      
  aggressive:
    autonomous:
      - almost_everything
    needs_approval:
      - delete_core
      - delete_app
      - deploy_production_critical
      - security_changes

overrides:
  agents:
    tester:
      level: aggressive
      
  cores:
    core-ai-api:
      level: conservative
      
  apps:
    app-payment:
      level: conservative
      production_deploy: requires_approval

never_auto_approve:
  - delete_core
  - delete_app  
  - security_sensitive_change
  - cost_increasing_change
```

### Change Autonomy via Chat

```
You: Set autonomy to aggressive

System: Updated global autonomy to aggressive. 
        Safety rails still apply.
───────────────────────────────────────────────────────
You: Set core-ai-api to conservative

System: Updated core-ai-api to conservative.
───────────────────────────────────────────────────────
You: Pause all autonomous work

System: Paused. All agents will ask for approval.
        Say "resume" when ready.
───────────────────────────────────────────────────────
You: What's my current setup?

System: Current autonomy:
        Global: aggressive
        Overrides:
        • core-ai-api: conservative
        • app-payment: conservative
```

---

## 13. Decision Learning

### How It Works

1. Track every human decision
2. Detect patterns over time
3. Offer auto-approval when confidence is high

### Decision Tracking

```yaml
# .framework/decisions/2026-01-15.yaml

- id: dec_001
  timestamp: 2026-01-15T14:30:00Z
  type: approve_core_creation
  context:
    core: core-thumbnail-generator
    category: video
    has_ai_dependency: true
  decision: approved
  time_to_decide_ms: 45000
```

### Pattern Detection

```yaml
# .framework/learned-patterns.yaml

patterns:
  - id: pattern_001
    description: "Approves video-related cores quickly"
    confidence: 0.92
    conditions:
      type: approve_core_creation
      category: video
    predicted_decision: approve
    observed_decisions: 8
    auto_approve_eligible: true
```

### Auto-Approval Suggestions

```
┌─────────────────────────────────────────────────────────────────┐
│ LEARNING UPDATE                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ I've noticed a pattern in your decisions:                       │
│                                                                 │
│ "You approve new video-related cores quickly"                   │
│ • Observed in 8 out of 8 decisions (100%)                       │
│                                                                 │
│ Would you like me to auto-approve similar requests?             │
│                                                                 │
│ [Enable auto-approve] [Keep asking] [Show examples]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Corrections

```
You: Stop auto-approving test additions

System: Done. I'll ask for approval on tests now.
───────────────────────────────────────────────────────
You: You got it wrong about video cores.

System: Reduced confidence from 92% to 60%.
        I'll keep asking and re-learn.
```

---

## 14. Dashboard System

### Folder Structure

```
.dashboard/
├── inbox/                     # Decisions waiting
├── activity/                  # Current status
├── suggestions/               # Recommendations
├── reports/                   # Status reports
└── decisions/                 # History log
```

### Inbox Item Format

```markdown
# Decision Required: Create core-thumbnail-generator

**ID**: dec_001
**Priority**: Normal
**Agent**: Architect

## Summary
To implement video thumbnails, we need a new core.

## Options
1. **Create core-thumbnail-generator** ⭐ Recommended
2. **Add to core-video-exporter**

## Your Response
Reply: "approve option 1" or "approve option 2"
```

### Activity Status

```markdown
# Current Agent Activity

## Running Now

### Creating core-thumbnail-generator
**Agent**: Core Developer  
**Progress**: ████████░░ 80%  
**ETA**: 5 minutes

## Queue
1. Update documentation
2. Integrate into app-video-suite
```

---

## 15. Directives & Automation

### Directive Template

```markdown
# [Action] [Subject]

**Antigravity Mode**: Plan | Fast
**Agent Role**: [Which agent]

## Input
- [What is needed]

## Output  
- [What is produced]

## Process
1. [Steps with MCP calls]

## Validation Checklist
- [ ] [Criteria]

## Edge Cases
- [Known gotchas]
```

### Execution Scripts

```
execution/
├── check-environment.ts
├── validate-core.ts
├── validate-app.ts
├── validate-all.ts
├── check-dependencies.ts
├── test-core.ts
├── test-app.ts
├── generate-docs.ts
├── sync-antigravity-rules.ts
└── rollback.ts
```

---

## 16. Secrets & Environment

### Secret Store

```typescript
interface SecretStore {
  get(key: string): Promise<string | undefined>
  require(key: string): Promise<string>
  has(key: string): Promise<boolean>
}

// Resolution order:
// 1. Environment variables (SECRET_*)
// 2. .env.local file
// 3. Antigravity secure storage
```

### Environment Configuration

```typescript
const appConfig = {
  appName: 'my-app',
  environment: process.env.NODE_ENV || 'development',
  
  environments: {
    development: {
      'logger.level': 'debug',
      'api.baseUrl': 'http://localhost:3000'
    },
    production: {
      'logger.level': 'warn',
      'api.baseUrl': 'https://api.example.com'
    }
  }
}
```

---

## 17. Database Strategy

### Framework Database (SQLite)

Always SQLite for framework tooling:
- Agent memory
- Decision history
- Learned patterns

### App Databases (Flexible)

```typescript
// SQLite (default)
const db = await coreDatabase.connect({ type: 'sqlite', path: './data/app.db' })

// PostgreSQL (production)
const db = await coreDatabase.connect({ type: 'postgres', url: process.env.DATABASE_URL })

// Turso (serverless)
const db = await coreDatabase.connect({ type: 'turso', url: process.env.TURSO_URL })
```

| Scenario | Database |
|----------|----------|
| Framework tooling | SQLite (always) |
| Local/CLI apps | SQLite |
| High-traffic webapp | PostgreSQL |
| Serverless | Turso, PlanetScale |

---

## 18. Testing Strategy

### Core Tests

```typescript
// At bottom of core file
import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('core-logger', () => {
  test('logs at correct level', () => {
    // Test
  })
})
```

### App Tests

```typescript
// packages/apps/app-example/app.test.ts
import { test, describe, before, after } from 'node:test'

describe('app-example', () => {
  test('loads all cores', () => {
    // Test
  })
})
```

### Browser Tests (UI Apps)

For apps with `hasUI: true`, use Antigravity Browser Agent.

---

## 19. Documentation System

### Auto-Generated

```
docs/
├── README.md
├── cores/
│   └── core-logger.md
├── apps/
│   └── app-example.md
├── api/
└── architecture/
```

### Generation Triggers

- On commit
- On new core/app
- Daily full regeneration

---

## 20. Implementation Checklist

### Phase 0: Environment
- [ ] Install tools
- [ ] Configure GitHub (`gh auth login`)
- [ ] Create repository

### Phase 1: Foundation
- [ ] Create folder structure
- [ ] Create `.framework/` config
- [ ] Create `.mcp/config.json`
- [ ] Create `packages/core-system/`
- [ ] Create first core: `core-logger`
- [ ] Create first app: `app-example`

### Phase 2: MCP Servers
- [ ] Configure standard servers
- [ ] Create `framework-server.ts`
- [ ] Create `dashboard-server.ts`

### Phase 3: Git & Automation
- [ ] Create `.husky/pre-commit`
- [ ] Create `.github/workflows/`
- [ ] Create execution scripts

### Phase 4: Directives & Dashboard
- [ ] Create directives
- [ ] Create `.antigravity/` structure
- [ ] Create `.dashboard/` structure

### Phase 5: Autonomy & Learning
- [ ] Create `autonomy.yaml`
- [ ] Implement autonomy checking
- [ ] Create decision tracking
- [ ] Create pattern detection

### Phase 6: Documentation
- [ ] Create `generate-docs.ts`
- [ ] Generate initial docs

### Phase 7: First Real Feature
- [ ] Use Idea Refiner
- [ ] Let agents implement
- [ ] Verify workflow

---

## 21. Appendices

### Appendix A: Core Template

```typescript
// packages/templates/core-template.ts

import type { CoreDefinition, AppContext } from '@universal/core-system'

const core[Name]: CoreDefinition = {
  metadata: {
    name: 'core-[name]',
    version: '0.1.0',
    description: '[Description]',
    tags: [],
    dependencies: {},
    requiredConfig: [],
    optionalConfig: []
  },

  async init(context: AppContext): Promise<void> {},
  async cleanup(context: AppContext): Promise<void> {},

  async methodName(param: string): Promise<string> {
    return 'result'
  }
}

export default core[Name]
```

### Appendix B: App Template

```typescript
// packages/templates/app-template.ts

import { CoreLoader, cleanupCores } from '@universal/core-system'
import { coreRegistry } from '../../cores/registry'

export const metadata = {
  name: 'app-[name]',
  version: '0.1.0',
  description: '[Description]',
  cores: ['core-logger'],
  hasUI: false
}

const appConfig = {
  appName: metadata.name,
  environment: process.env.NODE_ENV || 'development'
}

async function main(): Promise<void> {
  const loader = new CoreLoader()
  const coresToLoad = {
    'core-logger': (await coreRegistry['core-logger']()).default
  }

  const { cores, context, errors } = await loader.loadCores(coresToLoad, appConfig)
  if (errors.length > 0) process.exit(1)

  try {
    cores['core-logger'].info('App started')
  } finally {
    await cleanupCores(context)
  }
}

main().catch(() => process.exit(1))
```

### Appendix C: Autonomy Config

```yaml
# .framework/autonomy.yaml

default_level: moderate

overrides:
  agents:
    tester:
      level: aggressive

never_auto_approve:
  - delete_core
  - delete_app
  - security_sensitive_change
  - cost_increasing_change
```

---

## Quick Reference

### Human Daily Workflow

| When | What | Time |
|------|------|------|
| Morning | Check `.dashboard/inbox/` | 5 min |
| When inspired | Chat with Idea Refiner | 5-10 min |
| Weekly | Review reports | 10 min |

### Chat Commands

```
"Quick idea: [description]"     → Save for later
"Let's discuss [idea]"          → Start refinement
"Set autonomy to [level]"       → Change autonomy
"Pause"                         → Stop agents
"Resume"                        → Resume agents
"What have you learned?"        → View patterns
```

### Key Files

| File | Purpose |
|------|---------|
| `.framework/autonomy.yaml` | Autonomy config |
| `.dashboard/inbox/*` | Pending decisions |
| `idea-inbox/` | Drop ideas here |
| `packages/cores/registry.ts` | All cores |

---

**Ready for implementation in Google Antigravity.**

Start with Phase 0 (Environment Setup).
