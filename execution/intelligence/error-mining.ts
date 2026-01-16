// execution/intelligence/error-mining.ts

import Database from 'better-sqlite3'
import * as fs from 'fs'

interface ErrorPattern {
  error_type: string
  count: number
  common_contexts: any[]
  root_causes: string[]
  preventions: string[]
}

class ErrorMiner {
  private db: Database.Database
  
  constructor() {
    this.db = new Database('.framework/data/intelligence.db')
  }
  
  mineErrorPatterns(): void {
    console.log('🔍 Mining error patterns...\n')
    
    const errorTypes = this.db.prepare(`
      SELECT 
        error_type,
        COUNT(*) as count,
        GROUP_CONCAT(context) as contexts
      FROM errors
      WHERE occurred_at > datetime('now', '-90 days')
      GROUP BY error_type
      HAVING count >= 3
      ORDER BY count DESC
    `).all() as any[]
    
    console.log(`Found ${errorTypes.length} recurring error patterns:\n`)
    
    for (const errorType of errorTypes) {
      this.analyzeErrorPattern(errorType)
    }
    
    this.generatePreventionStrategies()
  }
  
  private analyzeErrorPattern(errorType: any): void {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`Error: ${errorType.error_type}`)
    console.log(`Occurrences: ${errorType.count} times`)
    
    const contexts = errorType.contexts
      .split(',')
      .filter((c: string) => c)
      .map((c: string) => {
        try {
          return JSON.parse(c)
        } catch {
          return {}
        }
      })
    
    const commonKeys = this.findCommonPatterns(contexts)
    
    if (commonKeys.length > 0) {
      console.log(`\nCommon pattern detected:`)
      commonKeys.forEach(k => console.log(`  • ${k}`))
      
      this.db.prepare(`
        INSERT INTO meta_learnings (
          learning_type, description, impact, confidence, learned_at
        ) VALUES (?, ?, ?, ?, datetime('now'))
      `).run(
        'error_pattern',
        errorType.error_type,
        JSON.stringify({ pattern: commonKeys, count: errorType.count }),
        errorType.count > 10 ? 1.0 : 0.7
      )
    }
    
    console.log('')
  }
  
  private findCommonPatterns(contexts: any[]): string[] {
    const patterns: string[] = []
    
    const hasNullAccess = contexts.some(c => 
      c.message?.includes('Cannot read property') ||
      c.message?.includes('undefined')
    )
    
    if (hasNullAccess) {
      patterns.push('Accessing properties of null/undefined')
    }
    
    const hasAPIErrors = contexts.some(c => 
      c.location?.includes('api') || c.source?.includes('fetch')
    )
    
    if (hasAPIErrors) {
      patterns.push('API response validation missing')
    }
    
    const hasTypeErrors = contexts.some(c =>
      c.message?.includes('TypeError')
    )
    
    if (hasTypeErrors) {
      patterns.push('Type safety issues')
    }
    
    return patterns
  }
  
  private generatePreventionStrategies(): void {
    console.log('\n💡 Prevention Strategies Generated:\n')
    
    const learnings = this.db.prepare(`
      SELECT * FROM meta_learnings
      WHERE learning_type = 'error_pattern'
        AND confidence > 0.7
      ORDER BY learned_at DESC
    `).all() as any[]
    
    const strategies = new Map<string, string[]>()
    
    for (const learning of learnings) {
      const impact = JSON.parse(learning.impact)
      const pattern = impact.pattern[0]
      
      if (pattern?.includes('null/undefined')) {
        if (!strategies.has('null_checks')) {
          strategies.set('null_checks', [
            'Add TypeScript strict null checks',
            'Use optional chaining (?.) everywhere',
            'Create safeAccess() helper function',
            'Validate API responses before use'
          ])
        }
      }
      
      if (pattern?.includes('API response')) {
        if (!strategies.has('api_validation')) {
          strategies.set('api_validation', [
            'Use Zod/Yup for runtime validation',
            'Generate TypeScript types from API schemas',
            'Add response validation middleware',
            'Mock API responses in tests'
          ])
        }
      }
      
      if (pattern?.includes('Type safety')) {
        if (!strategies.has('type_safety')) {
          strategies.set('type_safety', [
            'Enable TypeScript strict mode',
            'Add ESLint type rules',
            'Use branded types for IDs',
            'Prefer unknown over any'
          ])
        }
      }
    }
    
    let strategyNum = 1
    for (const [category, actions] of strategies) {
      console.log(`${strategyNum}. ${category.toUpperCase().replace('_', ' ')}`)
      actions.forEach(action => console.log(`   • ${action}`))
      console.log('')
      strategyNum++
    }
    
    this.createDirectiveUpdates(strategies)
  }
  
  private createDirectiveUpdates(strategies: Map<string, string[]>): void {
    let updates = `# Auto-Generated Error Prevention Guidelines\n\n`
    updates += `Generated: ${new Date().toISOString()}\n\n`
    updates += `## Discovered Patterns\n\n`
    
    for (const [category, actions] of strategies) {
      updates += `### ${category.replace('_', ' ').toUpperCase()}\n\n`
      actions.forEach(action => {
        updates += `- ${action}\n`
      })
      updates += `\n`
    }
    
    fs.mkdirSync('.dashboard/intelligence', { recursive: true })
    fs.writeFileSync(
      '.dashboard/intelligence/error-prevention-guide.md',
      updates
    )
    
    console.log('📝 Created error prevention guide: .dashboard/intelligence/error-prevention-guide.md')
  }
  
  close(): void {
    this.db.close()
  }
}

const miner = new ErrorMiner()
miner.mineErrorPatterns()
miner.close()
