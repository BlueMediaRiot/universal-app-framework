# Universal App Framework Setup - Interactive Guide

**Workflow Type**: Interactive Setup
**Estimated Time**: 45-60 minutes
**Mode**: Plan (with human checkpoints)

---

## Overview

This workflow will guide you through setting up the Universal App Framework step-by-step. I'll check your environment, create all necessary files, and verify each phase before moving forward.

**What we'll build together:**
- ✅ Complete folder structure
- ✅ Core system runtime
- ✅ Your first reusable core (logger)
- ✅ Your first app
- ✅ MCP servers for agent integration
- ✅ Git workflows and automation
- ✅ Antigravity integration

**Your role:** Approve each phase and answer a few questions
**My role:** Create all files, verify everything works, guide you through

---

## Phase 0: Environment Check

Let me verify you have all required tools installed.

**I will check:**
- Node.js 20.x
- pnpm 8.x
- Git 2.40+
- GitHub CLI
- GitHub authentication

**Action Required:**
Please confirm you're ready to start, and I'll run the environment check.

---

## Phase 1: Project Initialization

**What I'll create:**
- Root package.json with scripts
- Workspace configuration (pnpm-workspace.yaml)
- Turbo configuration for monorepo
- Git configuration (.gitignore)
- Environment template (.env.example)
- Complete folder structure

**Folder structure:**
```
universal-app-framework/
├── .antigravity/          # Antigravity integration
├── .mcp/                  # MCP server config
├── .framework/            # Framework config
├── .dashboard/            # Human-facing communication
├── .github/               # GitHub workflows
├── idea-inbox/            # Drop ideas here
├── specs/                 # Agent-generated specs
├── directives/            # Agent SOPs
├── execution/             # Automation scripts
├── packages/              # Code packages
└── docs/                  # Documentation
```

**Questions:**
1. What would you like to name this project? (default: universal-app-framework)
2. Do you want to create a GitHub repository now? (yes/no)

**After completion, I'll:**
- Install initial dependencies
- Show you the structure
- Verify everything is in place

---

## Phase 2: Core System Foundation

**What I'll create:**
- `packages/core-system/` - The runtime that powers everything
- Type definitions (CoreDefinition, AppContext, etc.)
- Core loader
- Config store
- Event bus
- Secret store
- Service and plugin registries

**This is the heart of the framework.** All apps and cores build on this.

**After creation, I'll:**
- Build the core system
- Run type checking
- Verify compilation
- Show you the key interfaces

**Checkpoint:** I'll explain what each component does and why it matters.

---

## Phase 3: Your First Core (Logger)

**What I'll create:**
- `packages/cores/core-logger/` - Structured logging
- Full implementation with metadata
- Configuration system (log levels, prefixes)
- Health check capability
- Core registry file

**Why logger first?** Every app needs logging, and it's a perfect example of:
- ✅ Single responsibility
- ✅ Reusable across apps
- ✅ Simple but complete
- ✅ Shows all core features

**After creation, I'll:**
- Build the logger
- Show you how it works
- Explain the core pattern
- Update the registry

**Interactive demo:** I'll show you the logger in action!

---

## Phase 4: Your First App

**What I'll create:**
- `packages/apps/app-example/` - Demonstrates the framework
- Loads the logger core
- Shows lifecycle management
- Demonstrates configuration

**This proves everything works!**

**After creation, I'll:**
- Build the app
- Run it for you
- Show you the output
- Explain what's happening

**You'll see:**
```
🚀 Starting app-example...
2026-01-15T... [Example] INFO: Logger initialized
2026-01-15T... [Example] INFO: App started successfully!
...
✅ App completed successfully
```

---

## Phase 5: Development Tools

**What I'll create:**
- `execution/check-environment.ts` - Verifies your setup
- `execution/sync-antigravity-rules.ts` - Syncs directives
- `execution/tsconfig.json` - TypeScript config for scripts
- Package.json scripts for easy access

**Handy commands you'll get:**
```bash
pnpm check-env    # Verify environment
pnpm sync-rules   # Sync directives to Antigravity
pnpm validate     # Validate all code
pnpm test         # Run all tests
```

**After creation, I'll:**
- Run the environment check
- Show you the output
- Test each script

---

## Phase 6: Framework Configuration

**What I'll create:**
- `.framework/autonomy.yaml` - Controls agent autonomy
- `.framework/requirements.yaml` - Tool requirements
- `.framework/git-strategy.yaml` - Git workflows
- `.framework/learned-patterns.yaml` - Decision learning

**Autonomy levels explained:**
- **Conservative**: Agents ask for most approvals
- **Moderate**: Agents proceed unless major change (default)
- **Aggressive**: Agents do everything, notify after

**Question:**
What autonomy level would you like to start with?
- Conservative (safest, most approvals)
- Moderate (balanced, recommended)
- Aggressive (fastest, minimal approvals)

**After creation, I'll:**
- Explain each configuration file
- Show you how to adjust settings
- Explain the decision learning system

---

## Phase 7: MCP Server Setup

**What I'll create:**
- `.mcp/config.json` - MCP server configuration
- `.mcp/servers/framework-server.ts` - Custom framework tools
- Integration with standard MCP servers (GitHub, filesystem, memory)

**MCP Servers give agents superpowers:**
- 🔗 GitHub: Create branches, PRs, commits
- 📁 Filesystem: Enhanced file operations  
- 🧠 Memory: Persistent learning
- 🛠️ Framework: Custom framework operations

**After creation, I'll:**
- Build the framework server
- Test MCP connectivity
- Show you available tools
- Explain how agents use them

---

## Phase 8: Git & Automation

**What I'll create:**
- Git branch structure (main, develop)
- `.github/workflows/validate.yml` - CI validation
- `.husky/pre-commit` - Pre-commit hooks
- Git commit message templates

**Branch strategy:**
```
main         # Production-ready
└── develop  # Integration branch
    └── agent/* # Agent working branches
```

**Question:**
Do you want to create a GitHub repository now? (if not done in Phase 1)

**After creation, I'll:**
- Initialize Git
- Create branches
- Push to GitHub (if configured)
- Show you the Git workflow

---

## Phase 9: Directives & Dashboard

**What I'll create:**
- `directives/create-core.md` - How to create cores
- `directives/create-app.md` - How to create apps
- `directives/test-core.md` - Testing procedures
- `.antigravity/rules/` - Synced directives
- `.dashboard/` - Human communication hub

**Dashboard folders:**
- `inbox/` - Decisions waiting for you
- `activity/` - Current agent status
- `suggestions/` - Agent recommendations
- `reports/` - Status reports

**After creation, I'll:**
- Sync directives to Antigravity rules
- Create sample dashboard items
- Show you how to interact with agents
- Explain the communication flow

---

## Phase 10: Documentation

**What I'll create:**
- `README.md` - Project overview
- `docs/QUICK-START.md` - Quick start guide
- `docs/cores/` - Core documentation (auto-generated)
- `docs/apps/` - App documentation (auto-generated)

**After creation, I'll:**
- Show you the documentation structure
- Explain auto-generation
- Point out key sections

---

## Phase 11: First Idea Workflow (Practice)

**Now let's test the whole system!**

I'll guide you through your first idea-to-implementation workflow:

1. **You:** Share an idea (we can use a simple one for practice)
2. **Me (Idea Refiner role):** Ask clarifying questions
3. **Me (Architect role):** Create implementation plan
4. **You:** Approve the plan
5. **Me (Core Developer role):** Implement the feature
6. **Me (Tester role):** Test everything
7. **Me:** Show you the results

**Practice idea suggestions:**
- "Add a timestamp formatter core"
- "Create a math utilities core"
- "Build a greeting app that uses logger"

**This proves the entire workflow works!**

---

## Phase 12: Final Verification & Handoff

**I'll verify:**
- ✅ All tools installed
- ✅ All packages build successfully
- ✅ Example app runs
- ✅ Git configured correctly
- ✅ MCP servers operational
- ✅ Antigravity rules synced
- ✅ Dashboard ready

**Final checklist:**
```bash
# These should all work:
pnpm check-env              ✅
cd packages/apps/app-example && pnpm dev  ✅
git log --oneline           ✅
cat .dashboard/inbox/*      ✅
```

**I'll provide you with:**
- 📋 Quick reference card
- 🎯 Next steps guide
- 💡 Ideas for first real features
- 🆘 Where to get help

---

## Your Quick Reference

**Daily workflow:**
```bash
# Check pending decisions
cat .dashboard/inbox/*

# Run environment check
pnpm check-env

# Sync rules after editing directives
pnpm sync-rules

# Navigate and run apps
cd packages/apps/xxx
pnpm dev
```

**Chat commands:**
```
"I want to build [feature]"     → Start new feature
"Quick idea: [description]"     → Save for later
"Set autonomy to [level]"       → Change autonomy
"What have you learned?"        → View patterns
"Show me the cores"             → List all cores
```

**Key files:**
- `.framework/autonomy.yaml` - Adjust agent autonomy
- `.dashboard/inbox/` - Your pending decisions
- `idea-inbox/` - Drop ideas here
- `directives/` - Agent procedures

---

## Let's Get Started!

**Ready to begin?** Just say:
- "Let's start the setup" - I'll begin with Phase 0
- "I have questions first" - I'll answer anything
- "Show me a quick demo" - I'll show key concepts first

**Remember:** 
- I'll check with you before each major phase
- You can pause anytime and resume later
- I'll explain everything as we go
- There are no wrong questions!

**What would you like to do?**
