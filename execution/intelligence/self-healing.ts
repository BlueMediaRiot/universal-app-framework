// execution/intelligence/self-healing.ts

import Database from 'better-sqlite3'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

interface HealingConfig {
  enabled: boolean
  monitors: Monitor[]
  auto_recovery_actions: Record<string, RecoveryAction[]>
}

interface Monitor {
  name: string
  check_interval_seconds: number
  enabled: boolean
}

interface RecoveryAction {
  action: string
  condition?: string
  max_attempts?: number
  priority?: string
  confidence_required?: number
}

class SelfHealingSystem {
  private db: Database.Database
  private config: HealingConfig
  
  constructor() {
    this.db = new Database('.framework/data/intelligence.db')
    const configFile = fs.readFileSync('.framework/self-healing-config.yaml', 'utf-8')
    this.config = yaml.load(configFile) as HealingConfig
  }
  
  async monitorTestFailures(): Promise<void> {
    console.log('🔍 Checking for test failures...')
    
    try {
      // Run tests
      execSync('pnpm test', { stdio: 'pipe' })
      console.log('✅ All tests passing')
    } catch (error) {
      console.log('❌ Tests failing - initiating recovery')
      await this.handleTestFailure()
    }
  }
  
  private async handleTestFailure(): Promise<void> {
    const actions = this.config.auto_recovery_actions.test_failure
    
    for (const action of actions) {
      console.log(`🔧 Attempting: ${action.action}`)
      
      switch (action.action) {
        case 'rollback_last_commit':
          await this.rollbackLastCommit()
          break
          
        case 'run_git_bisect':
          await this.runGitBisect()
          break
          
        case 'notify_human':
          await this.notifyHuman('Test failure - auto-heal failed', action.priority || 'normal')
          break
      }
      
      // Check if tests pass now
      try {
        execSync('pnpm test', { stdio: 'pipe' })
        console.log('✅ Tests fixed!')
        await this.logRecovery(action.action, true)
        return
      } catch {
        console.log(`❌ ${action.action} didn't fix it`)
        await this.logRecovery(action.action, false)
      }
    }
  }
  
  private async rollbackLastCommit(): Promise<void> {
    const lastCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
    execSync('git revert --no-commit HEAD')
    
    this.db.prepare(`
      INSERT INTO decisions (id, type, context, decision, auto_approved, created_at)
      VALUES (?, 'auto_rollback', ?, 'reverted', 1, datetime('now'))
    `).run(
      `rollback_${Date.now()}`,
      JSON.stringify({ commit: lastCommit, reason: 'test_failure' })
    )
  }
  
  private async runGitBisect(): Promise<void> {
    // Simplified git bisect - in reality would be more complex
    console.log('Running git bisect to find failing commit...')
    // Implementation would use git bisect run with test command
  }
  
  private async notifyHuman(message: string, priority: string): Promise<void> {
    const notification = {
      id: `notify_${Date.now()}`,
      title: '🚨 Self-Healing: Human Intervention Needed',
      body: message,
      priority,
      timestamp: new Date().toISOString()
    }
    
    fs.mkdirSync('.dashboard/inbox', { recursive: true })
    fs.writeFileSync(
      `.dashboard/inbox/healing_${notification.id}.md`,
      `# ${notification.title}\n\n${notification.body}\n\n**Priority**: ${priority}\n**Time**: ${notification.timestamp}`
    )
  }
  
  private async logRecovery(action: string, success: boolean): Promise<void> {
    this.db.prepare(`
      INSERT INTO meta_learnings (learning_type, description, impact, confidence, learned_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(
      'self_healing',
      `Action: ${action}`,
      success ? 'successful_recovery' : 'failed_recovery',
      success ? 1.0 : 0.0
    )
  }
  
  async monitorPerformance(): Promise<void> {
    console.log('📊 Checking performance metrics...')
    
    // Get baseline
    const baseline = this.db.prepare(`
      SELECT baseline_value FROM performance_baselines 
      WHERE metric_name = 'api_response_time'
    `).get() as { baseline_value: number } | undefined
    
    if (!baseline) {
      console.log('⚠️  No baseline established yet')
      return
    }
    
    // Get current performance (mock - would be real metrics)
    const currentPerf = this.getCurrentPerformance()
    
    if (currentPerf > baseline.baseline_value * 2) {
      console.log('🚨 Performance regression detected!')
      await this.handlePerformanceRegression(baseline.baseline_value, currentPerf)
    } else {
      console.log('✅ Performance within acceptable range')
    }
  }
  
  private getCurrentPerformance(): number {
    // Mock implementation - would pull from real metrics
    return 100
  }
  
  private async handlePerformanceRegression(baseline: number, current: number): Promise<void> {
    console.log(`Baseline: ${baseline}ms, Current: ${current}ms`)
    
    // Capture profile
    console.log('📸 Capturing performance profile...')
    
    // Analyze
    const analysis = await this.analyzePerformanceRegression()
    
    if (analysis.confidence > 0.8) {
      console.log('💡 High-confidence fix found')
      await this.applySuggestedFix(analysis.suggestedFix)
    } else {
      await this.notifyHuman(`Performance regression: ${baseline}ms → ${current}ms`, 'high')
    }
  }
  
  private async analyzePerformanceRegression(): Promise<any> {
    // Mock analysis
    return {
      confidence: 0.85,
      suggestedFix: 'add_caching_to_hot_path'
    }
  }
  
  private async applySuggestedFix(fix: string): Promise<void> {
    console.log(`🔧 Applying fix: ${fix}`)
    // Implementation would apply the actual fix
  }
  
  close(): void {
    this.db.close()
  }
}

// Run monitors
async function runMonitors(): Promise<void> {
  const healer = new SelfHealingSystem()
  
  console.log('🏥 Self-Healing System Starting...\n')
  
  await healer.monitorTestFailures()
  await healer.monitorPerformance()
  
  healer.close()
  console.log('\n✅ Monitoring complete')
}

runMonitors().catch(console.error)
