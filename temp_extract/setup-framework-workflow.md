# Setup Framework Workflow

**Type**: Interactive Setup
**Mode**: Plan
**Agent**: Guide
**Duration**: 45-60 minutes

---

## Workflow Definition

This workflow guides the user through complete Universal App Framework setup with interactive checkpoints and verification.

## Phases

### Phase 0: Environment Check
- **Type**: Automated Check
- **Approval**: None
- **Tools**: bash_tool
- **Outputs**: Environment status report

### Phase 1: Project Init
- **Type**: File Creation
- **Approval**: Project name, GitHub repo decision
- **Tools**: create_file, bash_tool
- **Outputs**: Complete folder structure, root configs

### Phase 2: Core System
- **Type**: Code Generation
- **Approval**: Review after creation
- **Tools**: create_file, bash_tool
- **Outputs**: Working core system package

### Phase 3: First Core
- **Type**: Code Generation
- **Approval**: Review after creation
- **Tools**: create_file, bash_tool
- **Outputs**: core-logger package

### Phase 4: First App
- **Type**: Code Generation
- **Approval**: None (automated)
- **Tools**: create_file, bash_tool
- **Outputs**: app-example package, demonstration

### Phase 5: Dev Tools
- **Type**: Script Creation
- **Approval**: None (automated)
- **Tools**: create_file, bash_tool
- **Outputs**: Execution scripts

### Phase 6: Configuration
- **Type**: Config Creation
- **Approval**: Autonomy level selection
- **Tools**: create_file
- **Outputs**: Framework config files

### Phase 7: MCP Setup
- **Type**: Code Generation
- **Approval**: None (automated)
- **Tools**: create_file, bash_tool
- **Outputs**: MCP servers

### Phase 8: Git Setup
- **Type**: Git Operations
- **Approval**: GitHub repo creation
- **Tools**: bash_tool, github MCP
- **Outputs**: Git repository, branches

### Phase 9: Directives
- **Type**: Documentation
- **Approval**: None (automated)
- **Tools**: create_file, bash_tool
- **Outputs**: Directives, dashboard structure

### Phase 10: Documentation
- **Type**: Documentation
- **Approval**: None (automated)
- **Tools**: create_file
- **Outputs**: README, quick start guide

### Phase 11: Practice Workflow
- **Type**: Interactive Practice
- **Approval**: Idea selection, plan approval
- **Tools**: All tools
- **Outputs**: Practice feature implementation

### Phase 12: Final Verification
- **Type**: Verification
- **Approval**: Final acknowledgment
- **Tools**: bash_tool
- **Outputs**: Status report, next steps guide

---

## Success Criteria

- All required tools installed
- Core system builds successfully  
- Example app runs without errors
- Git repository created and configured
- MCP servers operational
- Antigravity rules synced
- Dashboard functional
- Practice feature works

---

## Rollback Points

Each phase creates a git commit. Can rollback to any phase if needed.

---

## User Interactions

**Decision Points:**
1. Phase 1: Project name
2. Phase 1: Create GitHub repo?
3. Phase 6: Autonomy level preference
4. Phase 8: Confirm GitHub setup
5. Phase 11: Choose practice idea

**Checkpoints (review only):**
- After Phase 2: Review core system
- After Phase 3: Review logger core
- After Phase 4: See app running
- After Phase 12: Final verification

---

## Next Workflow

After completion, user can:
- Start "Create New Core" workflow
- Start "Create New App" workflow  
- Start "Custom Feature" workflow
- Explore independently

---

## Notes for Agent

- Be encouraging and patient
- Explain concepts as you go
- Show concrete examples
- Check understanding before moving forward
- Celebrate completions!
- Remember this is likely the user's first experience with the framework
