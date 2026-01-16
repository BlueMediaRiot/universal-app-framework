# Agent Peer Review System - Specification

**Version**: 1.0.0  
**Status**: Draft for Review  
**Date**: January 16, 2026  
**Author**: Claude & Blue  
**Related**: Universal App Framework Specification  
**Purpose**: Quality assurance through automated agent-to-agent code review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [Architecture Overview](#4-architecture-overview)
5. [Review Policy Configuration](#5-review-policy-configuration)
6. [Review Workflow](#6-review-workflow)
7. [MCP Interface Extensions](#7-mcp-interface-extensions)
8. [Dashboard Integration](#8-dashboard-integration)
9. [Review Criteria & Standards](#9-review-criteria--standards)
10. [Agent Role Assignments](#10-agent-role-assignments)
11. [Learning & Optimization](#11-learning--optimization)
12. [Conflict Resolution](#12-conflict-resolution)
13. [Performance & Metrics](#13-performance--metrics)
14. [Implementation Phases](#14-implementation-phases)
15. [Edge Cases & Failure Modes](#15-edge-cases--failure-modes)
16. [Testing Strategy](#16-testing-strategy)
17. [Appendices](#17-appendices)

---

## 1. Executive Summary

### What is This?

The **Agent Peer Review System** adds a quality gate where AI agents review each other's work before merging code. This catches errors early, ensures consistency, and improves overall system quality without requiring constant human intervention.

### Key Innovation

Instead of humans reviewing every change or blindly trusting AI output, **agents review each other**:
- Different agent perspectives catch different issues
- Reviews happen automatically and asynchronously
- System learns which reviews can be skipped over time
- Humans only see escalations and disagreements

### Core Principles

| Principle | Rationale |
|-----------|-----------|
| **Different eyes, different bugs** | Tester spots test gaps, Auditor spots quality issues |
| **Async by default** | Reviewer works while creator moves to next task |
| **Progressive trust** | Skip reviews after proven success patterns |
| **Human escalation only** | Agents resolve 90% of reviews autonomously |
| **Fast feedback** | Reviews complete in <30 minutes |

### Success Metrics

- **Error reduction**: 70%+ fewer bugs reach production
- **Review speed**: <30 min average review time
- **Coverage**: 100% of significant changes reviewed
- **Automation**: 90%+ reviews resolve without human input
- **Learning curve**: After 20 successful reviews, auto-skip enabled

---

## 2. Problem Statement

### Current State (Without Peer Review)

```
Agent creates code
  ↓
Agent commits directly
  ↓
Bug discovered later (maybe)
  ↓
Rollback and fix (expensive)
```

**Problems**:
1. Single perspective misses edge cases
2. Errors discovered too late
3. Inconsistent quality across agents
4. Human must review everything or trust blindly
5. No learning from mistakes

### Desired State (With Peer Review)

```
Agent A creates code
  ↓
Agent B reviews (different perspective)
  ↓
Issues caught early (before merge)
  ↓
High quality code reaches production
  ↓
System learns what works
```

**Benefits**:
1. Multiple perspectives = fewer bugs
2. Errors caught before merge (cheap fix)
3. Consistent quality through peer validation
4. Humans review exceptions only
5. System improves over time

---

## 3. Goals & Non-Goals

### Goals

✅ **Catch errors before merge**  
✅ **Maintain fast development velocity** (async reviews)  
✅ **Reduce human review burden** (90%+ automated)  
✅ **Ensure consistent code quality**  
✅ **Enable progressive trust** (skip reviews for proven patterns)  
✅ **Provide learning feedback** to agents  
✅ **Create audit trail** of all decisions  

### Non-Goals

❌ **Replace human judgment** (escalate complex decisions)  
❌ **Slow down development** (reviews happen async)  
❌ **Create bureaucracy** (skip reviews when confidence is high)  
❌ **Perfect code** (good enough is good enough)  
❌ **Review trivial changes** (typos, formatting don't need review)  

---

## 4. Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│ CREATOR AGENT                                                   │
│ ├── Creates code/spec/architecture                              │
│ ├── Self-validates basic criteria                               │
│ └── Requests review via MCP                                     │
├─────────────────────────────────────────────────────────────────┤
│ REVIEW COORDINATOR (Framework Service)                          │
│ ├── Receives review request                                     │
│ ├── Checks review policy                                        │
│ ├── Assigns reviewer based on role matrix                       │
│ ├── Tracks review status                                        │
│ └── Escalates conflicts to human                                │
├─────────────────────────────────────────────────────────────────┤
│ REVIEWER AGENT                                                  │
│ ├── Receives review notification                                │
│ ├── Analyzes work against criteria                              │
│ ├── Provides structured feedback                                │
│ └── Submits decision (approve/changes/reject)                   │
├─────────────────────────────────────────────────────────────────┤
│ LEARNING ENGINE                                                 │
│ ├── Tracks all review outcomes                                  │
│ ├── Detects success patterns                                    │
│ ├── Suggests auto-skip eligibility                              │
│ └── Updates review policies                                     │
├─────────────────────────────────────────────────────────────────┤
│ DASHBOARD (Human Interface)                                     │
│ ├── Shows pending reviews                                       │
│ ├── Displays review history                                     │
│ ├── Presents conflicts for resolution                           │
│ └── Tracks metrics                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐
│ Creator      │ 1. Creates artifact (code/spec/plan)
│ Agent        │ 2. Self-validates basic criteria
└──────┬───────┘ 3. Calls requestReview()
       │
       ↓
┌──────────────────┐
│ Review           │ 4. Checks review policy
│ Coordinator      │ 5. Assigns reviewer
│ (MCP Server)     │ 6. Creates review record
└──────┬───────────┘ 7. Notifies reviewer
       │
       ↓
┌──────────────┐
│ Reviewer     │ 8. Analyzes work
│ Agent        │ 9. Checks criteria
└──────┬───────┘ 10. Submits review
       │
       ↓
┌──────────────────┐
│ Review           │ 11. Records decision
│ Coordinator      │ 12. Notifies creator
└──────┬───────────┘ 13. Updates learning
       │
       ↓
    ┌─────┴──────┐
    │            │
   ✅          🔄           ❌
APPROVED   CHANGES    REJECTED
    │       NEEDED        │
    ↓            │        ↓
 MERGE       REVISE   ESCALATE
             (goto 1)
```

### Storage Schema

```sql
-- .framework/data/framework.db

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- 'core_creation', 'app_creation', etc.
  creator_agent TEXT NOT NULL,
  reviewer_agent TEXT,
  
  status TEXT NOT NULL,                  -- 'pending', 'in_progress', 'approved', 'changes_requested', 'rejected'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Artifacts
  artifacts_json TEXT,                   -- JSON: { code, tests, docs, plan, ... }
  context_json TEXT,                     -- JSON: { spec_id, dependencies, ... }
  creator_questions TEXT,                -- JSON array of questions
  
  -- Review results
  reviewer_feedback_json TEXT,           -- JSON: { overall, strengths, concerns, suggestions }
  checklist_json TEXT,                   -- JSON: { criterion: boolean }
  confidence INTEGER,                    -- 0-100
  
  -- Metrics
  time_to_review_ms INTEGER,
  revision_count INTEGER DEFAULT 0
);

CREATE TABLE review_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id TEXT REFERENCES reviews(id),
  revision_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changes_requested TEXT,                -- What needed fixing
  changes_made TEXT                      -- What was changed
);

CREATE TABLE review_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  review_type TEXT NOT NULL,
  creator_agent TEXT NOT NULL,
  reviewer_agent TEXT NOT NULL,
  
  total_reviews INTEGER DEFAULT 0,
  approved INTEGER DEFAULT 0,
  changes_requested INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  
  avg_review_time_ms INTEGER,
  avg_confidence INTEGER,
  
  UNIQUE(date, review_type, creator_agent, reviewer_agent)
);

CREATE TABLE auto_skip_patterns (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,             -- 'create_core', 'create_app', etc.
  creator_agent TEXT NOT NULL,
  
  total_attempts INTEGER DEFAULT 0,
  successful_reviews INTEGER DEFAULT 0,
  avg_confidence REAL,
  
  eligible_for_skip BOOLEAN DEFAULT 0,
  skip_enabled BOOLEAN DEFAULT 0,
  skip_enabled_at TIMESTAMP,
  
  last_review_at TIMESTAMP,
  
  UNIQUE(action_type, creator_agent)
);
```

---

## 5. Review Policy Configuration

### Main Configuration File

```yaml
# .framework/review-policy.yaml

# Global settings
enabled: true
default_timeout_minutes: 30
async_reviews: true                      # Reviewer works async, creator continues

# What requires review
review_required:
  actions:
    - create_core
    - create_app
    - architecture_decision
    - major_refactor
    - breaking_change
    - security_change
    - database_migration
    - api_endpoint_change
  
  # Exceptions - skip review even if in actions list
  skip_if:
    # Autonomy-based
    - autonomy_level: aggressive
      except_for: [security_change, breaking_change]
    
    # Action-based
    - action_type: fix_typo
    - action_type: update_formatting
    - action_type: add_comment
    - action_type: update_readme
    
    # Pattern-based (learned)
    - has_auto_skip_pattern: true
      min_confidence: 0.9
      min_successes: 10

# Reviewer assignments
reviewer_matrix:
  # Format: creator → [primary_reviewer, backup_reviewer, escalation_reviewer]
  
  architect:
    primary: optimizer                   # Check for over-engineering
    backup: auditor
    escalate: human
    reasons:
      - "Optimizer ensures practical solutions"
      - "Auditor checks quality standards"
  
  core_developer:
    primary: auditor                     # Code quality expert
    backup: tester                       # Testability perspective
    escalate: architect                  # Design questions
    reasons:
      - "Auditor reviews code quality and conventions"
      - "Tester ensures it's testable"
  
  app_developer:
    primary: architect                   # Design coherence
    backup: core_developer               # Implementation feasibility
    escalate: human
    reasons:
      - "Architect ensures app design makes sense"
      - "Core developer checks for proper core usage"
  
  optimizer:
    primary: architect                   # Prevent over-optimization
    backup: auditor
    escalate: human
    reasons:
      - "Architect checks if optimization is worth complexity"
      - "Auditor ensures code remains readable"
  
  tester:
    primary: core_developer              # Test quality
    backup: auditor
    escalate: architect
    reasons:
      - "Core developer ensures tests actually test the right thing"
      - "Auditor checks test coverage"

# Review criteria by type
criteria:
  create_core:
    required:
      - correct_interface_design: "Interface is intuitive and follows conventions"
      - proper_error_handling: "Errors are caught and handled appropriately"
      - has_comprehensive_tests: "Tests cover happy path and edge cases"
      - follows_naming_conventions: "Names match core-xxx pattern and are descriptive"
      - no_breaking_changes: "Doesn't break existing cores or apps"
      - documentation_complete: "JSDoc comments and metadata are present"
      - single_responsibility: "Core does one thing well"
      - size_appropriate: "Under 300 lines or properly split"
    
    optional:
      - performance_acceptable: "No obvious performance issues"
      - dependencies_justified: "Dependencies are necessary and reasonable"
      - config_schema_clear: "Configuration options are well-documented"
  
  create_app:
    required:
      - uses_right_cores: "Core selection makes sense for requirements"
      - proper_configuration: "App config is complete and valid"
      - has_integration_tests: "Tests verify cores work together"
      - no_duplicate_logic: "Doesn't re-implement existing core functionality"
      - proper_lifecycle: "init/cleanup handled correctly"
    
    optional:
      - ui_quality: "If hasUI, interface is usable (browser tests pass)"
      - error_recovery: "App handles core failures gracefully"
  
  architecture_decision:
    required:
      - problem_clearly_stated: "Problem is well-defined"
      - options_evaluated: "Multiple approaches considered"
      - tradeoffs_documented: "Pros/cons for each option"
      - recommendation_justified: "Chosen approach is well-reasoned"
      - impacts_identified: "Effects on existing system are understood"
    
    optional:
      - alternatives_considered: "Alternative approaches documented"
      - reversibility_noted: "How to undo this decision if needed"
  
  major_refactor:
    required:
      - backwards_compatible: "Existing code still works OR migration path provided"
      - tests_still_pass: "All existing tests pass after refactor"
      - improvement_measurable: "Concrete benefit (performance, clarity, etc.)"
      - no_scope_creep: "Doesn't add features, just improves structure"
    
    optional:
      - rollback_plan: "Clear rollback strategy if issues arise"

# Review standards
standards:
  approve:
    min_checklist_pass_rate: 1.0         # All required criteria must pass
    min_confidence: 80                   # Reviewer confidence >= 80%
    max_critical_concerns: 0             # No critical issues
  
  request_changes:
    conditions:
      - critical_concerns: ">0"          # Any critical issue
      - checklist_pass_rate: "<1.0"      # Required criteria failed
      - confidence: "<60"                # Low confidence it will work
  
  reject:
    conditions:
      - fundamental_flaw: true           # Wrong approach entirely
      - would_break_system: true         # Would cause major issues
      - security_risk: "critical"        # Security vulnerability
      - better_to_start_over: true       # Revision would take longer than restart

# Escalation rules
escalation:
  auto_escalate_to_human:
    - reviewer_status: "REJECT"
      and_creator_disagrees: true
    
    - review_cycles: ">3"                # Back-and-forth >3 times
    
    - time_exceeded: ">2 hours"          # Review taking too long
    
    - confidence_gap: ">40"              # Creator 90% confident, reviewer 50%
  
  human_timeout: 48                      # Hours before auto-approve if human doesn't respond

# Performance targets
performance:
  target_review_time_minutes: 15
  max_review_time_minutes: 30
  parallel_reviews_max: 3                # Reviewer can handle 3 simultaneous reviews
  review_queue_max: 5                    # If >5 pending, pause new reviews

# Learning settings
learning:
  auto_skip_eligibility:
    min_successful_reviews: 10
    min_confidence_avg: 0.9
    lookback_period_days: 30
  
  pattern_confidence_increase_per_success: 0.05
  pattern_confidence_decrease_per_failure: 0.15
  
  suggest_skip_after_eligible_days: 7    # Wait 1 week before suggesting

# Notification settings
notifications:
  notify_creator_on:
    - review_approved
    - review_changes_requested
    - review_rejected
  
  notify_reviewer_on:
    - review_requested
    - creator_revised
  
  notify_human_on:
    - review_escalated
    - review_timeout
    - pattern_eligible_for_skip
```

---

## 6. Review Workflow

### 6.1 Happy Path (Approved on First Try)

```typescript
// CREATOR AGENT: Core Developer

async function createNewCore() {
  // 1. Create the code
  const coreCode = await generateCoreCode({
    name: 'core-email-validator',
    description: 'Validate email addresses with various rules'
  })
  
  const tests = await generateTests(coreCode)
  const docs = await generateDocs(coreCode)
  
  // 2. Self-validate (quick checks)
  const selfCheck = await selfValidate({
    code: coreCode,
    tests: tests,
    criteria: ['syntax_valid', 'has_metadata', 'has_export']
  })
  
  if (!selfCheck.passed) {
    // Fix issues before requesting review
    await fixIssues(selfCheck.issues)
  }
  
  // 3. Request review
  const review = await mcp.review.requestReview({
    id: generateReviewId(),
    type: 'create_core',
    creator: 'core-developer',
    title: 'Review: core-email-validator',
    
    artifacts: {
      code: coreCode,
      tests: tests,
      documentation: docs
    },
    
    context: {
      spec_id: 'spec_042',
      dependencies: ['core-string-utils'],
      estimated_complexity: 'low'
    },
    
    questions: [
      'Is the validation logic comprehensive enough?',
      'Should I support internationalized email addresses?',
      'Are the error messages clear?'
    ]
  })
  
  console.log(`✓ Review requested: ${review.id}`)
  console.log(`  Assigned to: ${review.reviewer}`)
  console.log(`  Moving to next task while review is pending...`)
  
  // 4. Move to next task (async review)
  await startNextTask()
  
  // 5. Wait for review result (background polling or webhook)
  const result = await waitForReview(review.id, { timeout: '30m' })
  
  // 6. Handle result
  if (result.status === 'APPROVED') {
    console.log(`✓ Review approved! (confidence: ${result.confidence}%)`)
    await commitAndMerge({
      branch: 'agent/create-email-validator',
      message: '[core-dev] create: core-email-validator (reviewed by auditor)'
    })
    
    await mcp.dashboard.notify({
      title: 'New core created',
      body: 'core-email-validator merged to develop',
      type: 'success'
    })
  }
}
```

```typescript
// REVIEWER AGENT: Auditor

async function handleReviewRequest(reviewId: string) {
  // 1. Load review
  const review = await mcp.review.getReview(reviewId)
  
  console.log(`📋 New review request: ${review.title}`)
  console.log(`   Creator: ${review.creator}`)
  console.log(`   Type: ${review.type}`)
  
  // 2. Load criteria
  const criteria = await loadCriteria(review.type)
  
  // 3. Analyze code
  const analysis = await analyzeCode({
    code: review.artifacts.code,
    tests: review.artifacts.tests,
    docs: review.artifacts.documentation
  })
  
  // 4. Check each criterion
  const checklist = {}
  for (const [key, criterion] of Object.entries(criteria.required)) {
    checklist[key] = await checkCriterion(analysis, criterion)
  }
  
  // 5. Answer creator's questions
  const answers = []
  for (const question of review.questions) {
    answers.push(await answerQuestion(question, analysis))
  }
  
  // 6. Find issues
  const issues = {
    critical: await findCriticalIssues(analysis),
    moderate: await findModerateIssues(analysis),
    minor: await findMinorIssues(analysis)
  }
  
  // 7. Determine status
  let status = 'APPROVED'
  let confidence = 95
  
  if (issues.critical.length > 0) {
    status = 'CHANGES_REQUESTED'
    confidence = 40
  } else if (issues.moderate.length > 0) {
    status = 'CHANGES_REQUESTED'
    confidence = 60
  } else if (issues.minor.length > 2) {
    status = 'CHANGES_REQUESTED'
    confidence = 75
  }
  
  // 8. Submit review
  await mcp.review.submitReview({
    reviewId,
    reviewer: 'auditor',
    status,
    
    feedback: {
      overall: status === 'APPROVED' 
        ? 'Solid implementation! Well-tested and documented.'
        : 'Good foundation, but needs a few improvements.',
      
      strengths: [
        'Clear interface design',
        'Comprehensive test coverage',
        'Good error messages'
      ],
      
      concerns: issues.critical.concat(issues.moderate),
      
      suggestions: issues.minor,
      
      question_answers: answers
    },
    
    checklist,
    confidence
  })
  
  console.log(`✓ Review submitted: ${status} (${confidence}% confidence)`)
}
```

### 6.2 Revision Path (Changes Requested)

```typescript
// CREATOR AGENT: Core Developer (continued from above)

async function handleChangesRequested(reviewResult) {
  console.log(`🔄 Changes requested by ${reviewResult.reviewer}`)
  console.log(`   Confidence: ${reviewResult.confidence}%`)
  
  // 1. Review feedback
  console.log('\nConcerns:')
  for (const concern of reviewResult.feedback.concerns) {
    console.log(`   - ${concern}`)
  }
  
  console.log('\nSuggestions:')
  for (const suggestion of reviewResult.feedback.suggestions) {
    console.log(`   - ${suggestion}`)
  }
  
  // 2. Make revisions
  const revisions = await makeRevisions({
    code: currentCode,
    concerns: reviewResult.feedback.concerns,
    suggestions: reviewResult.feedback.suggestions
  })
  
  // 3. Request re-review
  await mcp.review.requestReReview({
    reviewId: reviewResult.id,
    revision_number: reviewResult.revision_count + 1,
    changes_made: revisions.summary,
    
    artifacts: {
      code: revisions.updatedCode,
      tests: revisions.updatedTests,
      documentation: revisions.updatedDocs
    },
    
    message: 'Addressed all concerns. Ready for re-review.'
  })
  
  // 4. Wait for re-review
  const reReviewResult = await waitForReview(reviewResult.id)
  
  // Handle recursively
  if (reReviewResult.status === 'APPROVED') {
    await commitAndMerge()
  } else if (reReviewResult.status === 'CHANGES_REQUESTED') {
    // Try again (max 3 cycles before escalation)
    if (reReviewResult.revision_count < 3) {
      await handleChangesRequested(reReviewResult)
    } else {
      await escalateToHuman(reReviewResult)
    }
  } else {
    await handleRejection(reReviewResult)
  }
}
```

### 6.3 Rejection Path

```typescript
async function handleRejection(reviewResult) {
  console.log(`❌ Review rejected by ${reviewResult.reviewer}`)
  console.log(`   Reason: ${reviewResult.feedback.overall}`)
  
  // Option 1: Disagree and escalate
  if (creatorDisagrees(reviewResult)) {
    await mcp.review.escalate({
      reviewId: reviewResult.id,
      reason: 'creator_disagrees',
      creator_argument: 'I believe the approach is correct because...',
      request_human_decision: true
    })
    return
  }
  
  // Option 2: Accept and start over
  console.log('🔄 Accepted rejection. Starting over with different approach.')
  
  await mcp.memory.store({
    type: 'learning',
    category: 'rejected_approach',
    content: `Approach rejected: ${reviewResult.feedback.overall}`,
    tags: [reviewResult.type, 'rejection'],
    confidence: 1.0
  })
  
  await git.deleteBranch('agent/create-email-validator')
  await startOverWithNewApproach()
}
```

---

## 7. MCP Interface Extensions

### New MCP Server: review-server.ts

```typescript
// .mcp/servers/review-server.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ReviewCoordinator } from './review-coordinator.js'
import { ReviewPolicy } from './review-policy.js'
import { LearningEngine } from './learning-engine.js'

const server = new Server(
  {
    name: 'review-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

const coordinator = new ReviewCoordinator()
const policy = new ReviewPolicy()
const learner = new LearningEngine()

// Tool: Check if review required
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'check_review_required') {
    const { action, context } = request.params.arguments
    
    const required = await policy.shouldRequireReview(action, context)
    
    if (!required.needs_review) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            needs_review: false,
            reason: required.skip_reason
          })
        }]
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          needs_review: true,
          reviewer: required.assigned_reviewer,
          estimated_time: required.estimated_time_minutes
        })
      }]
    }
  }
  
  // Tool: Request review
  if (request.params.name === 'request_review') {
    const reviewRequest = request.params.arguments
    
    // Validate request
    const validation = await coordinator.validateRequest(reviewRequest)
    if (!validation.valid) {
      throw new Error(`Invalid review request: ${validation.errors.join(', ')}`)
    }
    
    // Create review
    const review = await coordinator.createReview(reviewRequest)
    
    // Assign reviewer
    const reviewer = await policy.assignReviewer({
      creator: reviewRequest.creator,
      type: reviewRequest.type
    })
    
    review.reviewer = reviewer
    await coordinator.saveReview(review)
    
    // Notify reviewer
    await coordinator.notifyReviewer(review)
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          id: review.id,
          reviewer: reviewer,
          status: 'pending',
          estimated_completion: review.estimated_completion
        })
      }]
    }
  }
  
  // Tool: Submit review
  if (request.params.name === 'submit_review') {
    const { reviewId, reviewer, status, feedback, checklist, confidence } = 
      request.params.arguments
    
    const review = await coordinator.getReview(reviewId)
    if (!review) {
      throw new Error(`Review not found: ${reviewId}`)
    }
    
    // Validate reviewer is assigned
    if (review.reviewer !== reviewer) {
      throw new Error(`Only ${review.reviewer} can review this`)
    }
    
    // Update review
    review.status = status
    review.feedback = feedback
    review.checklist = checklist
    review.confidence = confidence
    review.completed_at = new Date()
    review.time_to_review_ms = review.completed_at - review.started_at
    
    await coordinator.saveReview(review)
    
    // Notify creator
    await coordinator.notifyCreator(review)
    
    // Learn from review
    await learner.recordReview(review)
    
    // Check for escalation
    if (await policy.shouldEscalate(review)) {
      await coordinator.escalateToHuman(review)
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          review_id: reviewId,
          status: status
        })
      }]
    }
  }
  
  // Tool: Get review status
  if (request.params.name === 'get_review') {
    const { reviewId } = request.params.arguments
    const review = await coordinator.getReview(reviewId)
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(review)
      }]
    }
  }
  
  // Tool: Request re-review
  if (request.params.name === 'request_re_review') {
    const { reviewId, revision_number, changes_made, artifacts } = 
      request.params.arguments
    
    const review = await coordinator.getReview(reviewId)
    
    // Create revision record
    await coordinator.createRevision({
      review_id: reviewId,
      revision_number,
      changes_made
    })
    
    // Update review
    review.status = 'pending_re_review'
    review.revision_count = revision_number
    review.artifacts = artifacts
    review.started_at = null
    review.completed_at = null
    
    await coordinator.saveReview(review)
    
    // Notify reviewer
    await coordinator.notifyReviewer(review, { is_revision: true })
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          review_id: reviewId,
          revision_number
        })
      }]
    }
  }
  
  // Tool: Escalate review
  if (request.params.name === 'escalate_review') {
    const { reviewId, reason, creator_argument } = request.params.arguments
    
    const review = await coordinator.getReview(reviewId)
    review.status = 'escalated'
    review.escalation_reason = reason
    review.creator_argument = creator_argument
    
    await coordinator.saveReview(review)
    await coordinator.escalateToHuman(review)
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          escalated: true
        })
      }]
    }
  }
  
  // Tool: Get review metrics
  if (request.params.name === 'get_review_metrics') {
    const { period, agent, type } = request.params.arguments
    const metrics = await coordinator.getMetrics({ period, agent, type })
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(metrics)
      }]
    }
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`)
})

const transport = new StdioServerTransport()
server.connect(transport)
```

### TypeScript Interfaces

```typescript
// .mcp/servers/types/review.ts

export interface ReviewRequest {
  id: string
  type: ReviewType
  creator: AgentRole
  title: string
  
  artifacts: {
    code?: string
    tests?: string
    documentation?: string
    plan?: string
    spec?: string
    [key: string]: any
  }
  
  context: {
    spec_id?: string
    dependencies?: string[]
    estimated_complexity?: 'low' | 'medium' | 'high'
    related_issues?: string[]
    [key: string]: any
  }
  
  questions?: string[]
}

export type ReviewType = 
  | 'create_core'
  | 'create_app'
  | 'architecture_decision'
  | 'major_refactor'
  | 'breaking_change'
  | 'security_change'
  | 'database_migration'
  | 'api_endpoint_change'

export type AgentRole =
  | 'architect'
  | 'core-developer'
  | 'app-developer'
  | 'tester'
  | 'auditor'
  | 'optimizer'
  | 'idea-refiner'
  | 'learner'

export type ReviewStatus =
  | 'pending'
  | 'in_progress'
  | 'pending_re_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'escalated'

export interface Review {
  id: string
  type: ReviewType
  creator: AgentRole
  reviewer: AgentRole | null
  
  status: ReviewStatus
  
  created_at: Date
  started_at: Date | null
  completed_at: Date | null
  
  artifacts: Record<string, any>
  context: Record<string, any>
  questions: string[]
  
  // Review results
  feedback: ReviewFeedback | null
  checklist: Record<string, boolean> | null
  confidence: number | null
  
  // Metrics
  time_to_review_ms: number | null
  revision_count: number
  
  // Escalation
  escalation_reason: string | null
  creator_argument: string | null
}

export interface ReviewFeedback {
  overall: string
  strengths: string[]
  concerns: string[]
  suggestions: string[]
  question_answers?: string[]
}

export interface ReviewCriteria {
  required: Record<string, string>
  optional: Record<string, string>
}

export interface ReviewMetrics {
  period: string
  total_reviews: number
  approved: number
  changes_requested: number
  rejected: number
  escalated: number
  
  avg_review_time_minutes: number
  avg_confidence: number
  
  by_agent: Record<AgentRole, AgentMetrics>
  by_type: Record<ReviewType, TypeMetrics>
}

export interface AgentMetrics {
  as_creator: {
    total: number
    approved: number
    changes_requested: number
    rejected: number
    avg_revisions: number
  }
  as_reviewer: {
    total: number
    approved: number
    changes_requested: number
    rejected: number
    avg_review_time_minutes: number
    avg_confidence: number
  }
}

export interface TypeMetrics {
  total: number
  approved: number
  changes_requested: number
  rejected: number
  avg_review_time_minutes: number
  avg_revisions: number
}
```

---

## 8. Dashboard Integration

### Dashboard Structure

```
.dashboard/
├── reviews/
│   ├── pending/
│   │   ├── review_001.md              # Waiting for reviewer
│   │   └── review_002.md
│   │
│   ├── in-progress/
│   │   └── review_003.md              # Reviewer working on it
│   │
│   ├── completed/
│   │   ├── 2026-01-16/
│   │   │   ├── review_004.md          # Approved
│   │   │   └── review_005.md          # Changes requested
│   │   └── archive/
│   │
│   └── escalated/
│       └── review_006.md              # Needs human decision
│
├── metrics/
│   ├── daily.md                       # Daily review stats
│   ├── weekly.md                      # Weekly summary
│   └── patterns.md                    # Learned patterns
│
└── README.md                          # Dashboard overview
```

### Review Dashboard Template

```markdown
# Review: core-email-validator

**ID**: review_042  
**Type**: Core Creation  
**Status**: ⏳ In Progress

---

## Participants

**Creator**: Core Developer  
**Reviewer**: Auditor ✅ Assigned  
**Created**: 2026-01-16 10:30 AM  
**Review Started**: 2026-01-16 10:45 AM  
**Est. Completion**: 2026-01-16 11:15 AM (30 min remaining)

---

## What's Being Reviewed

New core for validating email addresses with various validation rules.

**Complexity**: Low  
**Dependencies**: core-string-utils  
**Related Spec**: [spec_042](../../specs/042-email-validator.md)

---

## Artifacts

- 📄 [Code](./artifacts/review_042/code.ts) (245 lines)
- ✅ [Tests](./artifacts/review_042/tests.ts) (18 tests)
- 📖 [Documentation](./artifacts/review_042/docs.md)

---

## Creator's Questions

1. **Is the validation logic comprehensive enough?**  
   _Covers: format, domain existence, disposable check_

2. **Should I support internationalized email addresses?**  
   _Currently only ASCII_

3. **Are the error messages clear?**  
   _Returns specific validation failure reasons_

---

## Review Checklist

### Required Criteria
- [ ] Correct interface design
- [ ] Proper error handling
- [ ] Has comprehensive tests
- [ ] Follows naming conventions
- [ ] No breaking changes
- [ ] Documentation complete
- [ ] Single responsibility
- [ ] Size appropriate

### Optional Criteria
- [ ] Performance acceptable
- [ ] Dependencies justified
- [ ] Config schema clear

---

## Timeline

- **10:30 AM** - Review requested
- **10:45 AM** - Auditor started review
- **11:15 AM** - Target completion

---

## Actions

- [View Full Review Request](./artifacts/review_042/request.json)
- [View in GitHub](https://github.com/user/repo/tree/agent/create-email-validator)

---

_This review is being handled asynchronously. Core Developer can continue with other tasks._
```

### Completed Review Template

```markdown
# Review: core-email-validator

**ID**: review_042  
**Type**: Core Creation  
**Status**: ✅ APPROVED

---

## Review Summary

**Reviewer**: Auditor  
**Completed**: 2026-01-16 11:05 AM  
**Review Time**: 20 minutes  
**Confidence**: 95%  
**Revisions**: 0

---

## Reviewer Feedback

### Overall Assessment

Excellent implementation! The core is well-designed, thoroughly tested, and properly documented. Interface is intuitive and error handling is solid.

### ✅ Strengths

1. **Clean interface** - `validate(email)` is simple and returns detailed results
2. **Comprehensive validation** - Covers format, domain, and disposable email checks
3. **Good error handling** - Clear error messages for each validation failure
4. **Solid tests** - 18 tests covering happy path and edge cases
5. **Well documented** - JSDoc comments are clear and complete

### 💡 Suggestions (Optional)

1. **Internationalized emails**: Consider adding this in v1.1 as optional feature
2. **Performance**: Current implementation is fine for most use cases. Consider caching DNS lookups if used in high-volume scenarios
3. **Disposable email list**: Might want to allow custom blacklists

---

## Questions Answered

### 1. Is the validation logic comprehensive enough?

Yes, absolutely. You're covering:
- Format validation (RFC 5322 compliant)
- Domain existence (DNS MX record check)
- Disposable email detection

This is more than sufficient for most use cases.

### 2. Should I support internationalized email addresses?

Not critical for v1.0. Add it as an optional feature in v1.1 if users request it. The current ASCII-only approach covers 95%+ of use cases.

### 3. Are the error messages clear?

Very clear! Examples:
- "Invalid format: missing @ symbol"
- "Domain does not exist: example.invalid"
- "Disposable email address detected"

These tell users exactly what's wrong.

---

## Checklist Results

### Required (8/8)
- ✅ Correct interface design
- ✅ Proper error handling
- ✅ Has comprehensive tests
- ✅ Follows naming conventions
- ✅ No breaking changes
- ✅ Documentation complete
- ✅ Single responsibility
- ✅ Size appropriate (245 lines)

### Optional (3/3)
- ✅ Performance acceptable
- ✅ Dependencies justified (core-string-utils makes sense)
- ✅ Config schema clear

---

## Decision: ✅ APPROVED

**Recommendation**: Merge to develop

This is production-ready. Consider the suggestions for future versions, but they're not blocking.

---

## Next Steps

1. ✅ Merge to `develop` branch
2. ✅ Update core registry
3. ✅ Generate documentation
4. ✅ Notify human of new feature

---

## Metrics

- **Created**: 2026-01-16 10:30 AM
- **Review Started**: 2026-01-16 10:45 AM
- **Completed**: 2026-01-16 11:05 AM
- **Total Time**: 35 minutes (15 min review, 20 min in queue)
- **Confidence**: 95%
- **Revisions**: 0

---

_Review completed successfully. Core Developer notified._
```

### Escalated Review Template

```markdown
# 🚨 Review Escalation: core-payment-processor

**ID**: review_067  
**Type**: Core Creation  
**Status**: ⚠️ ESCALATED - Human Decision Required

---

## Escalation Reason

**Reviewer and Creator Disagree**

- **Auditor** says: Security concerns with API key handling
- **Core Developer** says: Implementation follows standard practices

**Confidence Gap**: 
- Core Developer: 90% confident
- Auditor: 45% confident

---

## The Disagreement

### Core Developer's Position

"The API key is stored in SecretStore and never logged or exposed. This is the standard approach used in 3 other cores (core-stripe-api, core-sendgrid-api, core-twilio-api). The implementation is secure."

**Supporting Evidence**:
- ✅ Uses SecretStore (encrypted)
- ✅ Never logged
- ✅ Not exposed in errors
- ✅ Consistent with existing cores

### Auditor's Position

"Payment processing is more sensitive than other APIs. We should add additional safeguards: key rotation support, usage logging for audit trail, and automatic key invalidation on suspicious activity."

**Concerns**:
- ⚠️ No key rotation mechanism
- ⚠️ No audit logging of key usage
- ⚠️ No suspicious activity detection
- ⚠️ Payment APIs are higher risk

---

## Technical Details

**Core**: core-payment-processor  
**Purpose**: Process credit card payments via Stripe API  
**Sensitivity**: HIGH (handles payment data)  
**Dependencies**: core-stripe-api, core-encryption  

[View Code](./artifacts/review_067/code.ts)  
[View Auditor's Concerns](./artifacts/review_067/concerns.md)  
[View Creator's Response](./artifacts/review_067/response.md)

---

## Your Decision Needed

### Option 1: Approve As-Is (Core Developer's Position)
**Pros**:
- ✅ Consistent with existing patterns
- ✅ Faster to market
- ✅ Standard industry practice

**Cons**:
- ⚠️ No additional safeguards
- ⚠️ Higher risk if compromised

### Option 2: Request Enhanced Security (Auditor's Position)
**Pros**:
- ✅ Better security posture
- ✅ Audit trail for compliance
- ✅ Key rotation capability

**Cons**:
- ⏱️ Additional 2-3 hours development
- 🔧 More complexity

### Option 3: Compromise
Add just the audit logging for now, defer key rotation to v1.1?

---

## Recommendation System

**Based on learned patterns, you typically**:
- ✅ Prioritize security for payment-related code
- ✅ Favor defensive approaches for sensitive data
- ✅ Accept slower timelines for better security

**Suggested**: Option 2 (Enhanced Security)  
**Confidence**: 75%

---

## Timeline

- **Created**: 2026-01-16 2:00 PM
- **Review Started**: 2026-01-16 2:15 PM
- **Escalated**: 2026-01-16 2:45 PM
- **Decision Timeout**: 2026-01-18 2:45 PM (48 hours)

---

## Actions

[Approve Option 1] [Approve Option 2] [Suggest Option 3] [Provide Custom Decision]

---

_If no decision within 48 hours, system will auto-escalate to conservative default (Option 2)._
```

---

## 9. Review Criteria & Standards

### Core Creation Criteria

```yaml
# Loaded from .framework/review-policy.yaml

create_core:
  required:
    correct_interface_design:
      description: "Interface is intuitive and follows framework conventions"
      checks:
        - "Metadata is complete (name, version, description, tags)"
        - "Methods have clear, descriptive names"
        - "Parameters are well-typed"
        - "Return values are predictable"
        - "Async methods return Promises"
      
    proper_error_handling:
      description: "Errors are caught and handled appropriately"
      checks:
        - "Invalid inputs throw descriptive errors"
        - "External failures are caught and handled"
        - "Errors include helpful context"
        - "No silent failures"
      
    has_comprehensive_tests:
      description: "Tests cover happy path and edge cases"
      checks:
        - "At least 5 tests present"
        - "Happy path tested"
        - "Error cases tested"
        - "Edge cases identified and tested"
        - "Tests actually run and pass"
      
    follows_naming_conventions:
      description: "Names match framework standards"
      checks:
        - "Core name: 'core-xxx' format"
        - "File name matches core name"
        - "Methods are camelCase"
        - "Types are PascalCase"
      
    no_breaking_changes:
      description: "Doesn't break existing cores or apps"
      checks:
        - "No modifications to core-system"
        - "No changes to existing core interfaces"
        - "Dependencies are backward compatible"
      
    documentation_complete:
      description: "JSDoc comments and metadata present"
      checks:
        - "Metadata object is complete"
        - "Public methods have JSDoc"
        - "Parameters are documented"
        - "Return values are documented"
      
    single_responsibility:
      description: "Core does one thing well"
      checks:
        - "Core has clear, focused purpose"
        - "No unrelated functionality"
        - "Can explain purpose in one sentence"
      
    size_appropriate:
      description: "Under 300 lines or properly split"
      checks:
        - "Single file <300 lines, OR"
        - "Split into index/handlers/types if >300 lines"
        - "If >800 lines, should be multiple cores"
  
  optional:
    performance_acceptable:
      description: "No obvious performance issues"
      checks:
        - "No synchronous blocking operations"
        - "Large data handled in streams"
        - "Caching used where appropriate"
    
    dependencies_justified:
      description: "Dependencies are necessary and reasonable"
      checks:
        - "Each dependency is actually used"
        - "No duplicate functionality from other cores"
        - "External packages are well-maintained"
    
    config_schema_clear:
      description: "Configuration options well-documented"
      checks:
        - "requiredConfig lists all required keys"
        - "optionalConfig lists optional keys"
        - "Defaults are sensible"
```

### App Creation Criteria

```yaml
create_app:
  required:
    uses_right_cores:
      description: "Core selection makes sense for requirements"
      checks:
        - "All required functionality is covered"
        - "No unnecessary cores included"
        - "No missing cores for stated requirements"
      
    proper_configuration:
      description: "App config is complete and valid"
      checks:
        - "appName is set"
        - "environment is set"
        - "All core config requirements satisfied"
        - "No invalid config keys"
      
    has_integration_tests:
      description: "Tests verify cores work together"
      checks:
        - "At least one integration test"
        - "Tests actually load cores"
        - "Tests verify core interactions"
      
    no_duplicate_logic:
      description: "Doesn't re-implement core functionality"
      checks:
        - "No logic that should be in a core"
        - "Properly delegates to cores"
        - "App is composition, not implementation"
      
    proper_lifecycle:
      description: "init/cleanup handled correctly"
      checks:
        - "Cores are loaded via CoreLoader"
        - "cleanupCores called in finally block"
        - "Errors during load are handled"
  
  optional:
    ui_quality:
      description: "If hasUI, interface is usable"
      checks:
        - "Browser tests pass (if hasUI: true)"
        - "UI is responsive"
        - "Error states are shown"
    
    error_recovery:
      description: "App handles core failures gracefully"
      checks:
        - "Core load errors are caught"
        - "Partial degradation possible"
        - "User sees helpful error messages"
```

### Architecture Decision Criteria

```yaml
architecture_decision:
  required:
    problem_clearly_stated:
      description: "Problem is well-defined"
      checks:
        - "Problem description is clear"
        - "Constraints are identified"
        - "Success criteria defined"
      
    options_evaluated:
      description: "Multiple approaches considered"
      checks:
        - "At least 2 options presented"
        - "Each option is explained"
        - "Options are meaningfully different"
      
    tradeoffs_documented:
      description: "Pros/cons for each option"
      checks:
        - "Each option has pros listed"
        - "Each option has cons listed"
        - "Tradeoffs are realistic"
      
    recommendation_justified:
      description: "Chosen approach is well-reasoned"
      checks:
        - "Clear recommendation provided"
        - "Reasoning is sound"
        - "Addresses the constraints"
      
    impacts_identified:
      description: "Effects on existing system understood"
      checks:
        - "Breaking changes noted"
        - "Migration path outlined (if needed)"
        - "Performance impact estimated"
```

---

## 10. Agent Role Assignments

### Review Matrix

```yaml
# Who reviews whom

architect:
  primary_reviewer: optimizer
  rationale: |
    Optimizer has systems-thinking perspective and can identify
    over-engineering or missed optimizations. Ensures designs are
    practical and maintainable.
  
  backup_reviewer: auditor
  rationale: |
    Auditor checks quality standards and best practices. Good
    secondary perspective on architectural decisions.
  
  escalate_to: human
  escalate_when:
    - "Disagreement on fundamental approach"
    - "Major tradeoff decision"
    - "System-wide impact"

core_developer:
  primary_reviewer: auditor
  rationale: |
    Auditor is the code quality expert. Reviews implementations
    for correctness, testability, maintainability, and adherence
    to conventions.
  
  backup_reviewer: tester
  rationale: |
    Tester ensures code is testable and tests are comprehensive.
    Catches missing edge cases.
  
  escalate_to: architect
  escalate_when:
    - "Design questions arise"
    - "Interface changes needed"
    - "Unclear requirements"

app_developer:
  primary_reviewer: architect
  rationale: |
    Architect ensures app design is coherent and cores are used
    appropriately. Checks for proper separation of concerns.
  
  backup_reviewer: core_developer
  rationale: |
    Core Developer verifies cores are used correctly and no
    functionality is duplicated or misused.
  
  escalate_to: human
  escalate_when:
    - "Conflicting requirements"
    - "Need new core vs use existing"

optimizer:
  primary_reviewer: architect
  rationale: |
    Architect prevents over-optimization and ensures changes
    align with system goals. Balances performance vs complexity.
  
  backup_reviewer: auditor
  rationale: |
    Auditor ensures optimizations don't sacrifice code quality,
    readability, or maintainability.
  
  escalate_to: human
  escalate_when:
    - "Major refactoring proposed"
    - "Performance vs clarity tradeoff"

tester:
  primary_reviewer: core_developer
  rationale: |
    Core Developer ensures tests are actually testing the right
    things and test quality is high.
  
  backup_reviewer: auditor
  rationale: |
    Auditor checks test coverage and organization.
  
  escalate_to: architect
  escalate_when:
    - "Unclear what to test"
    - "Need test infrastructure"

idea_refiner:
  primary_reviewer: architect
  rationale: |
    Architect validates refined ideas are technically feasible
    and align with system architecture.
  
  backup_reviewer: optimizer
  rationale: |
    Optimizer checks if idea is worth the effort and suggests
    simpler alternatives if available.
  
  escalate_to: human
  escalate_when:
    - "Idea unclear even after refinement"
    - "Multiple valid approaches"
```

### Reviewer Responsibilities

```typescript
interface ReviewerResponsibilities {
  auditor: {
    focus: [
      'Code quality',
      'Best practices',
      'Naming conventions',
      'Documentation completeness',
      'Test coverage',
      'Error handling'
    ],
    
    expertise: [
      'Reading code for quality',
      'Identifying tech debt',
      'Spotting anti-patterns',
      'Ensuring consistency'
    ],
    
    typical_feedback: [
      'Naming suggestions',
      'Code organization improvements',
      'Documentation gaps',
      'Test coverage issues',
      'Error handling improvements'
    ]
  },
  
  architect: {
    focus: [
      'Design coherence',
      'System architecture',
      'Core selection',
      'Interface design',
      'Separation of concerns',
      'Long-term maintainability'
    ],
    
    expertise: [
      'System thinking',
      'Design patterns',
      'API design',
      'Component boundaries',
      'Scalability'
    ],
    
    typical_feedback: [
      'Design alternatives',
      'Better core composition',
      'Interface improvements',
      'Architectural concerns',
      'Scalability considerations'
    ]
  },
  
  optimizer: {
    focus: [
      'Performance',
      'Efficiency',
      'Resource usage',
      'Complexity vs benefit',
      'Preventing over-engineering'
    ],
    
    expertise: [
      'Performance analysis',
      'Complexity evaluation',
      'Resource optimization',
      'Practical tradeoffs'
    ],
    
    typical_feedback: [
      'Performance improvements',
      'Simpler alternatives',
      'Unnecessary complexity',
      'Resource usage concerns'
    ]
  },
  
  tester: {
    focus: [
      'Testability',
      'Test coverage',
      'Edge cases',
      'Test quality',
      'Integration testing'
    ],
    
    expertise: [
      'Test design',
      'Edge case identification',
      'Integration scenarios',
      'Test automation'
    ],
    
    typical_feedback: [
      'Missing test cases',
      'Untestable code',
      'Integration test gaps',
      'Test organization'
    ]
  },
  
  core_developer: {
    focus: [
      'Implementation correctness',
      'Core usage',
      'Code functionality',
      'Practical implementation',
      'Debugging potential'
    ],
    
    expertise: [
      'Writing code',
      'Using cores',
      'Debugging',
      'Implementation patterns'
    ],
    
    typical_feedback: [
      'Implementation bugs',
      'Better core usage',
      'Practical concerns',
      'Debugging difficulties'
    ]
  }
}
```

---

## 11. Learning & Optimization

### Pattern Detection

```typescript
// .mcp/servers/learning-engine.ts

interface LearningEngine {
  // Record review outcome
  async recordReview(review: Review): Promise<void> {
    const pattern = await this.getOrCreatePattern({
      action_type: review.type,
      creator_agent: review.creator
    })
    
    pattern.total_attempts++
    
    if (review.status === 'APPROVED' && review.confidence >= 80) {
      pattern.successful_reviews++
      pattern.confidences.push(review.confidence)
    }
    
    pattern.avg_confidence = 
      pattern.confidences.reduce((a, b) => a + b) / pattern.confidences.length
    
    // Check eligibility for auto-skip
    if (this.isEligibleForSkip(pattern)) {
      pattern.eligible_for_skip = true
      await this.suggestAutoSkip(pattern)
    }
    
    await this.savePattern(pattern)
  }
  
  // Check if pattern eligible for skip
  isEligibleForSkip(pattern: Pattern): boolean {
    const config = this.config.learning.auto_skip_eligibility
    
    return (
      pattern.successful_reviews >= config.min_successful_reviews &&
      pattern.avg_confidence >= config.min_confidence_avg &&
      pattern.total_attempts >= pattern.successful_reviews // No recent failures
    )
  }
  
  // Suggest auto-skip to human
  async suggestAutoSkip(pattern: Pattern): Promise<void> {
    if (pattern.skip_suggested) return
    
    await mcp.dashboard.addSuggestion({
      category: 'optimization',
      title: `Enable auto-skip for ${pattern.creator_agent} ${pattern.action_type}?`,
      rationale: `
        ${pattern.creator_agent} has successfully completed ${pattern.successful_reviews} 
        ${pattern.action_type} reviews with ${(pattern.avg_confidence * 100).toFixed(0)}% 
        average confidence.
        
        Enabling auto-skip would:
        ✅ Save ~${pattern.avg_review_time_minutes} minutes per ${pattern.action_type}
        ✅ Reduce review queue backlog
        ✅ Increase development velocity
        
        Reviews can be re-enabled anytime if quality drops.
      `,
      effort: 'low',
      impact: 'medium',
      action: {
        type: 'enable_auto_skip',
        pattern_id: pattern.id
      }
    })
    
    pattern.skip_suggested = true
    pattern.skip_suggested_at = new Date()
    await this.savePattern(pattern)
  }
  
  // Enable auto-skip
  async enableAutoSkip(patternId: string): Promise<void> {
    const pattern = await this.getPattern(patternId)
    pattern.skip_enabled = true
    pattern.skip_enabled_at = new Date()
    await this.savePattern(pattern)
    
    await mcp.dashboard.notify({
      title: 'Auto-skip enabled',
      body: `${pattern.creator_agent} ${pattern.action_type} will skip peer review`,
      type: 'success'
    })
  }
  
  // Check if review should be skipped
  async shouldSkipReview(request: ReviewRequest): Promise<{
    skip: boolean
    reason?: string
    pattern?: Pattern
  }> {
    const pattern = await this.getPattern({
      action_type: request.type,
      creator_agent: request.creator
    })
    
    if (!pattern || !pattern.skip_enabled) {
      return { skip: false }
    }
    
    // Additional safety: only skip if recent success
    const daysSinceLastReview = 
      (Date.now() - pattern.last_review_at.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceLastReview > 7) {
      // It's been a while, do a review to verify still good
      return { 
        skip: false, 
        reason: 'Pattern check: reviewing after 7 day gap' 
      }
    }
    
    return {
      skip: true,
      reason: `Auto-skip: ${pattern.successful_reviews} successful reviews, ${(pattern.avg_confidence * 100).toFixed(0)}% avg confidence`,
      pattern
    }
  }
  
  // Track confidence changes
  async adjustPatternConfidence(
    pattern: Pattern, 
    outcome: 'success' | 'failure'
  ): Promise<void> {
    const config = this.config.learning
    
    if (outcome === 'success') {
      pattern.avg_confidence = Math.min(
        1.0,
        pattern.avg_confidence + config.pattern_confidence_increase_per_success
      )
    } else {
      pattern.avg_confidence = Math.max(
        0.0,
        pattern.avg_confidence - config.pattern_confidence_decrease_per_failure
      )
      
      // If confidence drops too low, disable auto-skip
      if (pattern.skip_enabled && pattern.avg_confidence < 0.8) {
        pattern.skip_enabled = false
        await this.notifySkipDisabled(pattern)
      }
    }
    
    await this.savePattern(pattern)
  }
}
```

### Learning Feedback Loop

```
Review Completed
    ↓
Record Outcome
    ↓
Update Pattern Stats
    ↓
Check Eligibility
    ↓
    ┌─────────┴─────────┐
    │                   │
Eligible          Not Eligible
    │                   │
    ↓                   ↓
Suggest Skip      Continue
    │             Monitoring
    ↓
Human Approves
    │
    ↓
Enable Auto-Skip
    │
    ↓
Future Reviews
Skip Automatically
    │
    ↓
Monitor Quality
    │
    ├─ Success → Increase Confidence
    └─ Failure → Decrease Confidence
                    │
                    ↓
             If Low Confidence
                    │
                    ↓
            Disable Auto-Skip
                    │
                    ↓
            Notify Human
```

---

## 12. Conflict Resolution

### Escalation Triggers

```yaml
# When to escalate to human

auto_escalate:
  # Status-based
  - condition: reviewer_rejects
    and: creator_disagrees
    reason: "Fundamental disagreement on approach"
  
  # Iteration-based
  - condition: revision_count > 3
    reason: "Too many back-and-forth cycles"
  
  # Time-based
  - condition: review_time > 2_hours
    reason: "Review taking too long"
  
  # Confidence-based
  - condition: |
      creator_confidence - reviewer_confidence > 40
    reason: "Large confidence gap indicates uncertainty"
  
  # Criticality-based
  - condition: review_type in [security_change, breaking_change]
    and: reviewer_confidence < 90
    reason: "Critical change with reviewer uncertainty"
  
  # Complexity-based
  - condition: review_type == architecture_decision
    and: multiple_valid_options
    reason: "Multiple valid approaches, human should choose"

manual_escalate:
  allowed_by: [creator, reviewer]
  requires_reason: true
  
human_response_timeout: 48_hours
timeout_action: conservative_default  # Favor reviewer if tie
```

### Escalation Format

```markdown
# 🚨 Review Escalation Required

**Review**: review_067  
**Type**: Security Change  
**Priority**: High

---

## The Conflict

**Issue**: Disagreement on API key handling approach

**Creator (Core Developer)**: 90% confident  
> "Standard SecretStore approach used in 3 other cores. Proven safe."

**Reviewer (Auditor)**: 45% confident  
> "Payment APIs need additional safeguards. Should add key rotation and audit logging."

---

## Context

**What's at stake**:
- Security of payment processing
- Consistency with existing patterns
- Development timeline (2-3 hours difference)

**Why it matters**:
- Handles sensitive payment data
- Non-compliance could have legal implications
- Balance security vs. development speed

---

## Options

### 1. Approve as-is (Creator's position)
**Time**: Now  
**Risk**: Low-Medium  
**Pros**: Consistent with existing cores, faster to market  
**Cons**: No additional safeguards for sensitive payments

### 2. Enhanced security (Reviewer's position)
**Time**: +2-3 hours  
**Risk**: Very Low  
**Pros**: Better security posture, audit trail  
**Cons**: More complex, delayed timeline

### 3. Compromise
**Time**: +1 hour  
**Risk**: Low  
**Approach**: Add audit logging now, defer key rotation to v1.1

---

## Recommendation

**Based on your patterns**: Option 2  
**Confidence**: 75%

You typically:
- Prioritize security for payment code ✅
- Accept timeline delays for better security ✅
- Favor defensive programming for sensitive data ✅

---

## Your Decision

[Approve Option 1] [Approve Option 2] [Choose Option 3] [Provide Custom Answer]

**Timeout**: 48 hours (auto-chooses Option 2 if no response)
```

### Disagreement Resolution Protocol

```typescript
async function handleDisagreement(review: Review): Promise<void> {
  // 1. Log disagreement
  await db.logDisagreement({
    review_id: review.id,
    creator: review.creator,
    creator_confidence: review.creator_confidence,
    reviewer: review.reviewer,
    reviewer_confidence: review.confidence,
    issue: review.disagreement_summary
  })
  
  // 2. Gather context
  const context = {
    review_type: review.type,
    criticality: assessCriticality(review),
    historical_patterns: await getHistoricalPatterns(review),
    similar_past_decisions: await getSimilarDecisions(review)
  }
  
  // 3. Generate recommendation
  const recommendation = await generateRecommendation(review, context)
  
  // 4. Create escalation
  const escalation = await mcp.dashboard.escalate({
    review_id: review.id,
    reason: 'disagreement',
    creator_position: review.creator_argument,
    reviewer_position: review.feedback.overall,
    recommendation: recommendation,
    context: context,
    timeout: '48h'
  })
  
  // 5. Wait for human decision
  const decision = await waitForHumanDecision(escalation.id, {
    timeout: '48h',
    default: recommendation.conservative_choice
  })
  
  // 6. Apply decision
  await applyDecision(review, decision)
  
  // 7. Learn from decision
  await learner.recordHumanDecision({
    escalation_id: escalation.id,
    decision: decision,
    context: context
  })
}
```

---

## 13. Performance & Metrics

### Key Metrics

```yaml
# What we track

review_metrics:
  # Speed
  time_to_review:
    target: 15_minutes
    max: 30_minutes
    measure: "Time from review request to completion"
  
  queue_time:
    target: 5_minutes
    max: 15_minutes
    measure: "Time waiting for reviewer to start"
  
  # Quality
  approval_rate:
    target: 70_80_percent
    measure: "% approved on first review"
  
  revision_rate:
    target: 1_2_revisions_avg
    max: 3_revisions
    measure: "Average revisions before approval"
  
  confidence:
    target: 85_plus
    measure: "Average reviewer confidence"
  
  # Coverage
  review_coverage:
    target: 100_percent
    measure: "% of required actions reviewed"
  
  skip_rate:
    target: 10_20_percent
    measure: "% of reviews skipped (learned patterns)"
  
  # Human involvement
  escalation_rate:
    target: under_10_percent
    measure: "% of reviews escalated to human"
  
  human_decision_time:
    target: under_24_hours
    measure: "Time for human to respond to escalation"
  
  # Agent performance
  reviewer_accuracy:
    measure: "How often reviewer feedback prevents bugs"
    track: "Bugs found in reviewed vs non-reviewed code"
  
  reviewer_efficiency:
    measure: "Reviews completed per hour"
    track: "Throughput by reviewer agent"

learning_metrics:
  pattern_formation:
    measure: "Time to establish skip-eligible pattern"
    target: 10_15_reviews
  
  skip_safety:
    measure: "Error rate in auto-skipped reviews"
    target: under_5_percent
    check: "Periodic audits of skipped code"
  
  confidence_accuracy:
    measure: "How well confidence predicts success"
    track: "Correlation between confidence and actual bugs"
```

### Metrics Dashboard

```markdown
# Review System Metrics - Week of Jan 15, 2026

## Overview

**Reviews This Week**: 47  
**Avg Review Time**: 18 minutes ✅ (target: 15)  
**Approval Rate**: 74% ✅ (target: 70-80%)  
**Escalations**: 3 (6.4%) ✅ (target: <10%)

---

## By Type

| Type | Count | Avg Time | Approval | Revisions |
|------|-------|----------|----------|-----------|
| Core Creation | 12 | 22 min | 67% | 1.5 |
| App Creation | 8 | 15 min | 88% | 1.0 |
| Architecture | 5 | 45 min | 40% | 2.4 |
| Refactor | 15 | 12 min | 87% | 1.1 |
| Security | 4 | 38 min | 50% | 2.0 |
| Other | 3 | 10 min | 100% | 0.0 |

---

## By Agent (as Creator)

| Agent | Created | Approved | Changes | Rejected | Avg Revisions |
|-------|---------|----------|---------|----------|---------------|
| Core Developer | 18 | 13 (72%) | 5 | 0 | 1.3 |
| App Developer | 12 | 10 (83%) | 2 | 0 | 1.0 |
| Architect | 8 | 4 (50%) | 3 | 1 | 2.1 |
| Optimizer | 9 | 8 (89%) | 1 | 0 | 1.0 |

---

## By Agent (as Reviewer)

| Agent | Reviewed | Approved | Changes | Rejected | Avg Time | Avg Confidence |
|-------|----------|----------|---------|----------|----------|----------------|
| Auditor | 20 | 14 (70%) | 6 | 0 | 20 min | 88% |
| Architect | 15 | 8 (53%) | 6 | 1 | 35 min | 82% |
| Optimizer | 9 | 7 (78%) | 2 | 0 | 15 min | 90% |
| Tester | 3 | 3 (100%) | 0 | 0 | 12 min | 95% |

---

## Auto-Skip Patterns

**Eligible**: 3 patterns  
**Enabled**: 1 pattern  
**Reviews Skipped**: 5 (10.6%)  
**Errors in Skipped**: 0 ✅

### Patterns

1. **Core Developer → Create Core (Video category)**  
   Status: ✅ Enabled  
   Success: 12/12 (100%)  
   Confidence: 94%  
   Saves: ~22 min per review

2. **App Developer → Create App**  
   Status: ⏳ Eligible (suggested to human)  
   Success: 10/10 (100%)  
   Confidence: 91%

3. **Optimizer → Refactor**  
   Status: ⏳ Eligible (suggested to human)  
   Success: 8/8 (100%)  
   Confidence: 93%

---

## Escalations This Week

### 1. Payment Security (Resolved)
**Type**: Security Change  
**Creator**: Core Developer  
**Reviewer**: Auditor  
**Decision**: Enhanced security (Option 2)  
**Resolution Time**: 4 hours

### 2. Architecture Approach (Resolved)
**Type**: Architecture Decision  
**Creator**: Architect  
**Reviewer**: Optimizer  
**Decision**: Hybrid approach (Option 3)  
**Resolution Time**: 12 hours

### 3. Test Coverage (Pending)
**Type**: Core Creation  
**Creator**: Core Developer  
**Reviewer**: Tester  
**Status**: Awaiting human decision  
**Time Pending**: 6 hours

---

## Trends

📈 **Improving**:
- Review time decreased 12% vs last week
- Approval rate increased 8%
- Escalation rate down from 12% to 6%

📉 **Watch**:
- Architecture reviews taking longer (45 min vs 30 target)
- Security reviews have high revision rate (2.0 avg)

💡 **Recommendations**:
1. Consider stricter criteria for security changes before review
2. Provide architecture template to reduce review time
3. Enable auto-skip for "App Developer → Create App" pattern
```

---

## 14. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Basic review system working

```yaml
deliverables:
  - Review database schema
  - Review MCP server (basic)
  - Dashboard templates
  - Review policy config
  
tasks:
  - Create .framework/review-policy.yaml
  - Create review database tables
  - Implement review-server.ts (core functions)
  - Create dashboard markdown templates
  - Write directive: "Submit for Review"
  - Write directive: "Review Code"
  
validation:
  - Can request review
  - Can submit review
  - Can view review in dashboard
  - Review status tracked in database
```

### Phase 2: Automation (Week 2)

**Goal**: Agents can review autonomously

```yaml
deliverables:
  - Automated reviewer assignment
  - Review criteria checking
  - Async review workflow
  - Creator/reviewer notifications
  
tasks:
  - Implement reviewer matrix
  - Build criteria validation logic
  - Create review notification system
  - Integrate with Antigravity notifications
  - Write tests for review workflow
  
validation:
  - Review auto-assigned to correct agent
  - Criteria checked automatically
  - Agents notified correctly
  - Reviews complete without human
```

### Phase 3: Learning (Week 3)

**Goal**: System learns patterns

```yaml
deliverables:
  - Learning engine
  - Pattern detection
  - Auto-skip suggestions
  - Confidence tracking
  
tasks:
  - Implement learning-engine.ts
  - Create pattern detection algorithm
  - Build auto-skip eligibility checks
  - Implement confidence adjustment
  - Create learning metrics dashboard
  
validation:
  - Patterns detected after 10 reviews
  - Auto-skip suggested appropriately
  - Confidence adjusts based on outcomes
  - Learning metrics visible
```

### Phase 4: Conflict Resolution (Week 4)

**Goal**: Handle disagreements gracefully

```yaml
deliverables:
  - Escalation system
  - Human decision interface
  - Conflict resolution workflows
  - Decision learning
  
tasks:
  - Implement escalation triggers
  - Create escalation dashboard
  - Build human decision interface
  - Implement decision timeout logic
  - Track human decision patterns
  
validation:
  - Conflicts escalate appropriately
  - Human can make decisions easily
  - Timeouts work correctly
  - System learns from human decisions
```

### Phase 5: Optimization (Week 5)

**Goal**: Fast, efficient reviews

```yaml
deliverables:
  - Performance optimization
  - Parallel review support
  - Review queue management
  - Metrics and reporting
  
tasks:
  - Optimize review time
  - Support multiple concurrent reviews
  - Implement queue management
  - Create metrics dashboard
  - Generate weekly reports
  
validation:
  - Review time under 30 min
  - Can handle 3 concurrent reviews
  - Queue doesn't back up
  - Metrics accurate and useful
```

### Phase 6: Polish (Week 6)

**Goal**: Production-ready system

```yaml
deliverables:
  - Error handling
  - Edge case coverage
  - Documentation
  - Monitoring
  
tasks:
  - Handle all edge cases
  - Add comprehensive error handling
  - Write full documentation
  - Set up monitoring/alerts
  - Conduct end-to-end testing
  
validation:
  - All edge cases handled
  - No crashes or hangs
  - Documentation complete
  - Monitoring in place
```

---

## 15. Edge Cases & Failure Modes

### Edge Cases

```yaml
edge_cases:
  # Reviewer unavailable
  reviewer_unavailable:
    scenario: "Assigned reviewer is busy with 3 other reviews"
    handling: |
      1. Check reviewer's queue size
      2. If >3 reviews, assign to backup reviewer
      3. If backup also busy, wait in queue (max 15 min)
      4. If still waiting, escalate to human
  
  # Creator gone before review complete
  creator_unavailable:
    scenario: "Review comes back with changes, but creator offline"
    handling: |
      1. Store review result in dashboard
      2. Notify creator via Antigravity
      3. Wait 24 hours
      4. If no response, escalate to human
  
  # Both agree it's wrong
  mutual_uncertainty:
    scenario: "Both creator and reviewer uncertain (both <60% confident)"
    handling: |
      1. Auto-escalate to human
      2. Request third-party review from different agent
      3. Mark as "needs research"
  
  # Contradictory feedback
  contradictory_reviews:
    scenario: "Re-review contradicts first review"
    handling: |
      1. Log inconsistency
      2. Request clarification from reviewer
      3. If still inconsistent, escalate
      4. Reduce reviewer confidence score
  
  # Review timeout
  review_timeout:
    scenario: "Reviewer hasn't started after 30 min"
    handling: |
      1. Send reminder notification
      2. Wait 15 more minutes
      3. Re-assign to backup reviewer
      4. Log timeout incident
  
  # Infinite revision loop
  infinite_revisions:
    scenario: "3+ revision cycles with no resolution"
    handling: |
      1. Auto-escalate on 4th revision
      2. Human reviews both positions
      3. Makes binding decision
      4. Log as learning example
  
  # Criteria change mid-review
  criteria_change:
    scenario: "Review policy updated while review in progress"
    handling: |
      1. Complete review with original criteria
      2. Note policy changed
      3. Re-review if criteria significantly different
      4. Grandfather in-flight reviews
  
  # Auto-skip failure
  auto_skip_produces_bug:
    scenario: "Auto-skipped review results in bug"
    handling: |
      1. Immediately disable auto-skip for that pattern
      2. Decrease pattern confidence by 30%
      3. Require 10 new successful reviews to re-enable
      4. Notify human of failure
      5. Add to learning: what was missed
```

### Failure Modes

```yaml
failure_modes:
  # Database unavailable
  database_down:
    impact: "Can't record or retrieve reviews"
    mitigation: |
      - Use in-memory fallback
      - Log to file system
      - Sync when database recovers
    recovery: |
      - Automatic reconnection
      - Replay file logs to database
  
  # MCP server crash
  mcp_server_crash:
    impact: "Can't request/submit reviews"
    mitigation: |
      - Auto-restart via Antigravity
      - Queue requests during downtime
      - Retry on reconnection
    recovery: |
      - Process queued requests
      - Resume in-progress reviews
  
  # Reviewer agent crash
  reviewer_agent_crash:
    impact: "Review incomplete"
    mitigation: |
      - Detect crash (timeout after 60 min)
      - Re-assign to backup reviewer
      - Preserve progress if any
    recovery: |
      - New reviewer sees partial work
      - Can build on progress or start over
  
  # Human abandons escalation
  human_no_response:
    impact: "Decision blocked indefinitely"
    mitigation: |
      - 48 hour timeout
      - Auto-choose conservative default
      - Notify human of auto-decision
    recovery: |
      - Human can override auto-decision later
      - System learns from override
  
  # Conflicting simultaneous edits
  concurrent_modifications:
    impact: "Review refers to outdated code"
    mitigation: |
      - Lock branch during review
      - Detect conflicts on commit
      - Re-review if code changed
    recovery: |
      - Request fresh review
      - Merge both changes carefully
  
  # Learning database corruption
  learning_data_corrupt:
    impact: "Auto-skip patterns lost"
    mitigation: |
      - Daily backups
      - Validate data integrity
      - Rebuild from review history
    recovery: |
      - Restore from backup
      - Recompute patterns from logs
      - Temporarily disable auto-skip
```

---

## 16. Testing Strategy

### Unit Tests

```typescript
// test/review-system.test.ts

describe('Review System', () => {
  describe('Review Request', () => {
    it('creates review with correct reviewer assignment', async () => {
      const review = await mcp.review.requestReview({
        type: 'create_core',
        creator: 'core-developer',
        // ...
      })
      
      expect(review.reviewer).toBe('auditor') // Primary reviewer
    })
    
    it('assigns backup reviewer if primary busy', async () => {
      // Setup: Auditor has 4 reviews in queue
      await fillReviewQueue('auditor', 4)
      
      const review = await mcp.review.requestReview({
        type: 'create_core',
        creator: 'core-developer',
        // ...
      })
      
      expect(review.reviewer).toBe('tester') // Backup reviewer
    })
    
    it('skips review for eligible auto-skip pattern', async () => {
      await enableAutoSkip('create_core', 'core-developer')
      
      const result = await mcp.review.checkReviewRequired({
        action: 'create_core',
        creator: 'core-developer'
      })
      
      expect(result.needs_review).toBe(false)
      expect(result.skip_reason).toContain('Auto-skip')
    })
  })
  
  describe('Review Submission', () => {
    it('approves when all criteria pass', async () => {
      const review = await createTestReview()
      
      await mcp.review.submitReview({
        reviewId: review.id,
        reviewer: 'auditor',
        status: 'APPROVED',
        checklist: { /* all true */ },
        confidence: 95
      })
      
      const updated = await mcp.review.getReview(review.id)
      expect(updated.status).toBe('approved')
    })
    
    it('requests changes when criteria fail', async () => {
      const review = await createTestReview()
      
      await mcp.review.submitReview({
        reviewId: review.id,
        reviewer: 'auditor',
        status: 'CHANGES_REQUESTED',
        checklist: { proper_error_handling: false },
        confidence: 60
      })
      
      const updated = await mcp.review.getReview(review.id)
      expect(updated.status).toBe('changes_requested')
    })
  })
  
  describe('Escalation', () => {
    it('escalates when reviewer rejects and creator disagrees', async () => {
      const review = await createTestReview()
      
      await mcp.review.submitReview({
        reviewId: review.id,
        status: 'REJECTED',
        // ...
      })
      
      await mcp.review.escalate({
        reviewId: review.id,
        reason: 'creator_disagrees'
      })
      
      const escalation = await mcp.dashboard.getEscalation(review.id)
      expect(escalation).toBeDefined()
      expect(escalation.reason).toBe('creator_disagrees')
    })
    
    it('escalates after 3 revision cycles', async () => {
      const review = await createTestReview()
      review.revision_count = 3
      
      const shouldEscalate = await policy.shouldEscalate(review)
      expect(shouldEscalate).toBe(true)
    })
  })
  
  describe('Learning', () => {
    it('detects pattern after 10 successful reviews', async () => {
      for (let i = 0; i < 10; i++) {
        await recordSuccessfulReview('create_core', 'core-developer')
      }
      
      const pattern = await learner.getPattern('create_core', 'core-developer')
      expect(pattern.successful_reviews).toBe(10)
      expect(pattern.eligible_for_skip).toBe(true)
    })
    
    it('decreases confidence on failure', async () => {
      const pattern = await createTestPattern({ avg_confidence: 0.9 })
      
      await learner.adjustPatternConfidence(pattern, 'failure')
      
      expect(pattern.avg_confidence).toBeLessThan(0.9)
    })
    
    it('disables auto-skip when confidence drops too low', async () => {
      const pattern = await createTestPattern({ 
        skip_enabled: true,
        avg_confidence: 0.82
      })
      
      // Two failures should drop below 0.8 threshold
      await learner.adjustPatternConfidence(pattern, 'failure')
      await learner.adjustPatternConfidence(pattern, 'failure')
      
      expect(pattern.skip_enabled).toBe(false)
    })
  })
})
```

### Integration Tests

```typescript
describe('End-to-End Review Workflow', () => {
  it('completes full review cycle: request → review → approve → merge', async () => {
    // 1. Creator requests review
    const review = await mcp.review.requestReview({
      type: 'create_core',
      creator: 'core-developer',
      artifacts: { code: '...' }
    })
    
    expect(review.status).toBe('pending')
    expect(review.reviewer).toBe('auditor')
    
    // 2. Reviewer reviews
    await mcp.review.submitReview({
      reviewId: review.id,
      reviewer: 'auditor',
      status: 'APPROVED',
      confidence: 90
    })
    
    const approved = await mcp.review.getReview(review.id)
    expect(approved.status).toBe('approved')
    
    // 3. Creator merges
    await git.merge(review.branch)
    
    // 4. Learning recorded
    const pattern = await learner.getPattern('create_core', 'core-developer')
    expect(pattern.successful_reviews).toBeGreaterThan(0)
  })
  
  it('handles revision cycle', async () => {
    // Request → Changes → Revise → Approve
    const review = await mcp.review.requestReview({ /* ... */ })
    
    // First review: changes needed
    await mcp.review.submitReview({
      reviewId: review.id,
      status: 'CHANGES_REQUESTED'
    })
    
    // Creator revises
    await mcp.review.requestReReview({
      reviewId: review.id,
      revision_number: 1,
      changes_made: 'Fixed error handling'
    })
    
    // Re-review: approved
    await mcp.review.submitReview({
      reviewId: review.id,
      status: 'APPROVED'
    })
    
    const final = await mcp.review.getReview(review.id)
    expect(final.status).toBe('approved')
    expect(final.revision_count).toBe(1)
  })
})
```

### Performance Tests

```typescript
describe('Review System Performance', () => {
  it('completes review in under 30 minutes', async () => {
    const start = Date.now()
    
    const review = await mcp.review.requestReview({ /* ... */ })
    await simulateReview(review.id)
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(30 * 60 * 1000) // 30 minutes
  })
  
  it('handles 10 concurrent reviews', async () => {
    const reviews = []
    
    for (let i = 0; i < 10; i++) {
      reviews.push(mcp.review.requestReview({ /* ... */ }))
    }
    
    await Promise.all(reviews)
    
    // All should complete without errors
    for (const review of reviews) {
      const status = await mcp.review.getReview(review.id)
      expect(status).toBeDefined()
    }
  })
})
```

---

## 17. Appendices

### Appendix A: Full Example Review

See earlier sections for complete review examples.

### Appendix B: Dashboard File Structure

```
.dashboard/
├── reviews/
│   ├── pending/
│   ├── in-progress/
│   ├── completed/
│   └── escalated/
├── metrics/
├── patterns/
└── README.md
```

### Appendix C: Configuration Reference

See section 5 for complete configuration YAML.

### Appendix D: MCP Tools Reference

```typescript
// Available MCP tools for review system

mcp.review.checkReviewRequired(action, context)
mcp.review.requestReview(request)
mcp.review.submitReview(reviewId, result)
mcp.review.getReview(reviewId)
mcp.review.requestReReview(reviewId, revision)
mcp.review.escalate(reviewId, reason)
mcp.review.getMetrics(filters)
```

### Appendix E: Metrics Schema

See section 13 for complete metrics tracking.

### Appendix F: Learning Algorithm

```typescript
// Pattern detection algorithm

function detectPattern(reviews: Review[]): Pattern {
  const successful = reviews.filter(r => 
    r.status === 'approved' && r.confidence >= 80
  )
  
  const avgConfidence = 
    successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length
  
  const eligibleForSkip = 
    successful.length >= 10 &&
    avgConfidence >= 90 &&
    reviews.length === successful.length // No recent failures
  
  return {
    action_type: reviews[0].type,
    creator_agent: reviews[0].creator,
    total_attempts: reviews.length,
    successful_reviews: successful.length,
    avg_confidence: avgConfidence / 100,
    eligible_for_skip: eligibleForSkip
  }
}
```

---

## Next Steps

1. **Review this spec** with the team
2. **Gather feedback** on approach
3. **Adjust** based on feedback
4. **Begin Phase 1** implementation
5. **Iterate** based on real-world usage

---

**End of Specification**

Questions? Feedback? Let's discuss!
