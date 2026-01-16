// execution/intelligence/analyze-patterns.ts

import Database from 'better-sqlite3'
import * as crypto from 'crypto'
import * as fs from 'fs'

interface Decision {
  id: string
  type: string
  context: string
  decision: string
  time_to_decide_ms: number
  created_at: string
}

interface Pattern {
  id: string
  type: string
  description: string
  conditions: any
  confidence: number
  occurrences: number
  auto_approve_eligible: boolean
}

class PatternAnalyzer {
  private db: Database.Database
  
  constructor() {
    this.db = new Database('.framework/data/intelligence.db')
  }
  
  analyzeDecisions(): void {
    console.log('🔍 Analyzing decision patterns...\n')
    
    // Get all decisions
    const decisions = this.db.prepare(`
      SELECT * FROM decisions 
      WHERE created_at > datetime('now', '-30 days')
      ORDER BY created_at DESC
    `).all() as Decision[]
    
    console.log(`Found ${decisions.length} decisions in last 30 days`)
    
    // Group by type
    const byType: Record<string, Decision[]> = {}
    for (const decision of decisions) {
      if (!byType[decision.type]) {
        byType[decision.type] = []
      }
      byType[decision.type].push(decision)
    }
    
    // Analyze each type
    for (const [type, typeDecisions] of Object.entries(byType)) {
      this.analyzeDecisionType(type, typeDecisions)
    }
  }
  
  private analyzeDecisionType(type: string, decisions: Decision[]): void {
    if (decisions.length < 3) {
      console.log(`⚪ ${type}: Not enough data (${decisions.length} decisions)`)
      return
    }
    
    // Calculate approval rate
    const approvals = decisions.filter(d => d.decision === 'approved').length
    const approvalRate = approvals / decisions.length
    
    // Calculate average decision time
    const avgTime = decisions.reduce((sum, d) => sum + (d.time_to_decide_ms || 0), 0) / decisions.length
    
    // Detect patterns
    if (approvalRate > 0.9 && avgTime < 60000) {
      // Always approve quickly
      this.suggestAutoApproval(type, decisions, approvalRate)
    } else if (approvalRate < 0.2) {
      // Almost always reject
      this.suggestAutoReject(type, decisions, approvalRate)
    } else {
      console.log(`⚪ ${type}: Mixed decisions (${Math.round(approvalRate * 100)}% approval)`)
    }
  }
  
  private suggestAutoApproval(type: string, decisions: Decision[], approvalRate: number): void {
    console.log(`\n✨ PATTERN DETECTED: ${type}`)
    console.log(`   Approval rate: ${Math.round(approvalRate * 100)}%`)
    console.log(`   Occurrences: ${decisions.length}`)
    console.log(`   Confidence: ${Math.round(approvalRate * 100)}%`)
    
    // Extract common conditions
    const contexts = decisions.map(d => JSON.parse(d.context))
    const conditions = this.extractCommonConditions(contexts)
    
    // Create pattern
    const patternId = crypto.randomBytes(16).toString('hex')
    const pattern: Pattern = {
      id: patternId,
      type,
      description: `Auto-approve ${type} (${Math.round(approvalRate * 100)}% approval rate)`,
      conditions,
      confidence: approvalRate,
      occurrences: decisions.length,
      auto_approve_eligible: approvalRate >= 0.85
    }
    
    // Save pattern
    this.db.prepare(`
      INSERT OR REPLACE INTO patterns (
        id, type, description, conditions, confidence, 
        occurrences, auto_approve_eligible, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      pattern.id,
      pattern.type,
      pattern.description,
      JSON.stringify(pattern.conditions),
      pattern.confidence,
      pattern.occurrences,
      pattern.auto_approve_eligible ? 1 : 0
    )
    
    // Create suggestion for human
    this.createAutoApproveSuggestion(pattern)
  }
  
  private suggestAutoReject(type: string, decisions: Decision[], approvalRate: number): void {
    console.log(`\n⛔ PATTERN DETECTED: ${type}`)
    console.log(`   Rejection rate: ${Math.round((1 - approvalRate) * 100)}%`)
    console.log(`   Occurrences: ${decisions.length}`)
    
    // Could auto-block these requests in the future
  }
  
  private extractCommonConditions(contexts: any[]): any {
    // Simplified - would do more sophisticated analysis
    const conditions: any = {}
    
    // Find keys that appear in all contexts
    const allKeys = new Set(contexts.flatMap(c => Object.keys(c)))
    
    for (const key of allKeys) {
      const values = contexts.map(c => c[key]).filter(v => v !== undefined)
      if (values.length === contexts.length) {
        // This key appears in all decisions
        const uniqueValues = [...new Set(values)]
        if (uniqueValues.length === 1) {
          // Same value in all decisions
          conditions[key] = uniqueValues[0]
        }
      }
    }
    
    return conditions
  }
  
  private createAutoApproveSuggestion(pattern: Pattern): void {
    const suggestion = `# 🤖 Auto-Approval Suggestion

## Pattern Detected: ${pattern.description}

**Type**: ${pattern.type}  
**Confidence**: ${Math.round(pattern.confidence * 100)}%  
**Occurrences**: ${pattern.occurrences}

### Conditions
\`\`\`json
${JSON.stringify(pattern.conditions, null, 2)}
\`\`\`

### What This Means
I've noticed you consistently approve these requests quickly. Would you like me to auto-approve similar requests in the future?

### Your Options
1. **Enable auto-approve** - I'll handle these autonomously
2. **Keep asking** - I'll continue requesting approval
3. **Show examples** - Review the decisions I analyzed

**To enable**: Reply "approve pattern ${pattern.id}"  
**To review**: Reply "show examples ${pattern.id}"
`
    
    fs.mkdirSync('.dashboard/suggestions', { recursive: true })
    fs.writeFileSync(
      `.dashboard/suggestions/pattern_${pattern.id}.md`,
      suggestion
    )
    
    console.log(`   💡 Suggestion created: .dashboard/suggestions/pattern_${pattern.id}.md`)
  }
  
  close(): void {
    this.db.close()
  }
}

// Run analysis
const analyzer = new PatternAnalyzer()
analyzer.analyzeDecisions()
analyzer.close()

console.log('\n✅ Pattern analysis complete')
