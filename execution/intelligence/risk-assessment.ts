// execution/intelligence/risk-assessment.ts

import Database from 'better-sqlite3'
import * as crypto from 'crypto'
import * as fs from 'fs'

interface Change {
  type: string
  description: string
  affectedFiles: string[]
  context: any
}

interface RiskFactor {
  name: string
  score: number
  weight: number
  description: string
}

interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  factors: RiskFactor[]
  mitigations: string[]
  requiredApprovals: string[]
  rollbackPlan: string
}

class RiskAssessor {
  private db: Database.Database
  
  constructor() {
    this.db = new Database('.framework/data/intelligence.db')
  }
  
  async assessRisk(change: Change): Promise<RiskAssessment> {
    console.log(`\n🎲 Risk Assessment: ${change.description}\n`)
    
    const factors: RiskFactor[] = []
    
    // Factor 1: Blast Radius
    const blastRadius = this.calculateBlastRadius(change)
    factors.push({
      name: 'Blast Radius',
      score: blastRadius,
      weight: 0.30,
      description: `${Math.round(blastRadius * 100)}% of system affected`
    })
    
    // Factor 2: Reversibility
    const reversibility = this.calculateReversibility(change)
    factors.push({
      name: 'Reversibility',
      score: 1 - reversibility,
      weight: 0.25,
      description: reversibility > 0.8 ? 'Easy to rollback' : 'Difficult to rollback'
    })
    
    // Factor 3: Test Coverage
    const testCoverage = this.calculateTestCoverage(change)
    factors.push({
      name: 'Test Coverage',
      score: 1 - testCoverage,
      weight: 0.20,
      description: `${Math.round(testCoverage * 100)}% test coverage`
    })
    
    // Factor 4: Production Impact
    const productionImpact = this.calculateProductionImpact(change)
    factors.push({
      name: 'Production Impact',
      score: productionImpact,
      weight: 0.15,
      description: productionImpact > 0.7 ? 'High user impact' : 'Low user impact'
    })
    
    // Factor 5: Data Integrity
    const dataIntegrity = this.calculateDataIntegrityRisk(change)
    factors.push({
      name: 'Data Integrity',
      score: dataIntegrity,
      weight: 0.10,
      description: dataIntegrity > 0.5 ? 'Potential data loss' : 'Data safe'
    })
    
    // Calculate weighted risk score
    const riskScore = factors.reduce((sum, factor) => {
      return sum + (factor.score * factor.weight)
    }, 0)
    
    // Determine risk level
    let riskLevel: RiskAssessment['riskLevel']
    if (riskScore >= 0.8) riskLevel = 'critical'
    else if (riskScore >= 0.6) riskLevel = 'high'
    else if (riskScore >= 0.4) riskLevel = 'medium'
    else riskLevel = 'low'
    
    // Display risk analysis
    console.log('Risk Factors:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    factors.forEach(factor => {
      const percentage = Math.round(factor.score * 100)
      const bars = '█'.repeat(Math.floor(percentage / 10))
      const spaces = '░'.repeat(10 - Math.floor(percentage / 10))
      console.log(`${factor.name.padEnd(20)} ${bars}${spaces} ${percentage}%`)
      console.log(`${' '.repeat(20)} ${factor.description}`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\nRISK LEVEL: ${riskLevel.toUpperCase()} (${Math.round(riskScore * 100)}%)`)
    
    // Generate mitigations
    const mitigations = this.generateMitigations(factors, change)
    
    // Determine required approvals
    const requiredApprovals = this.determineRequiredApprovals(riskLevel, factors)
    
    // Create rollback plan
    const rollbackPlan = this.createRollbackPlan(change)
    
    // Save assessment
    await this.saveAssessment(change, riskLevel, riskScore, factors, mitigations)
    
    return {
      riskLevel,
      riskScore,
      factors,
      mitigations,
      requiredApprovals,
      rollbackPlan
    }
  }
  
  private calculateBlastRadius(change: Change): number {
    const totalCores = 20
    const totalApps = 5
    
    const affectedCores = change.context.affected_cores || 0
    const affectedApps = change.context.affected_apps || 0
    
    const coreImpact = affectedCores / totalCores
    const appImpact = affectedApps / totalApps
    
    return Math.max(coreImpact, appImpact)
  }
  
  private calculateReversibility(change: Change): number {
    if (change.type.includes('database') || change.type.includes('migration')) {
      return 0.3
    }
    
    if (change.type.includes('code') || change.type.includes('refactor')) {
      return 0.9
    }
    
    return 0.6
  }
  
  private calculateTestCoverage(change: Change): number {
    return change.context.test_coverage ? parseFloat(change.context.test_coverage) / 100 : 0.5
  }
  
  private calculateProductionImpact(change: Change): number {
    if (change.context.user_facing) return 0.9
    if (change.context.backend_only) return 0.3
    return 0.5
  }
  
  private calculateDataIntegrityRisk(change: Change): number {
    if (change.type.includes('database')) return 0.8
    if (change.type.includes('delete')) return 0.7
    return 0.1
  }
  
  private generateMitigations(factors: RiskFactor[], change: Change): string[] {
    const mitigations: string[] = []
    
    for (const factor of factors) {
      if (factor.score > 0.6) {
        switch (factor.name) {
          case 'Blast Radius':
            mitigations.push('Deploy to staging first')
            mitigations.push('Use feature flags for gradual rollout')
            break
          case 'Reversibility':
            mitigations.push('Create database backup')
            mitigations.push('Write detailed rollback script')
            break
          case 'Test Coverage':
            mitigations.push('Add integration tests')
            mitigations.push('Perform manual QA')
            break
          case 'Production Impact':
            mitigations.push('Schedule during low-traffic window')
            mitigations.push('Prepare incident response plan')
            break
          case 'Data Integrity':
            mitigations.push('Backup all data before change')
            mitigations.push('Verify data integrity after deployment')
            break
        }
      }
    }
    
    return mitigations
  }
  
  private determineRequiredApprovals(riskLevel: string, factors: RiskFactor[]): string[] {
    const approvals: string[] = []
    
    if (riskLevel === 'critical') {
      approvals.push('human_director')
      approvals.push('security_team')
      approvals.push('architect_agent')
    } else if (riskLevel === 'high') {
      approvals.push('human_director')
      approvals.push('architect_agent')
    } else if (riskLevel === 'medium') {
      approvals.push('senior_agent')
    }
    
    const dataFactor = factors.find(f => f.name === 'Data Integrity')
    if (dataFactor && dataFactor.score > 0.5 && !approvals.includes('security_team')) {
      approvals.push('security_team')
    }
    
    return approvals
  }
  
  private createRollbackPlan(change: Change): string {
    let plan = `# Rollback Plan for ${change.description}\n\n`
    
    if (change.type.includes('database')) {
      plan += `1. Stop application\n`
      plan += `2. Restore database from backup (created before change)\n`
      plan += `3. Verify data integrity\n`
      plan += `4. Restart application\n`
      plan += `5. Monitor for issues\n\n`
      plan += `Estimated rollback time: 15-30 minutes\n`
    } else {
      plan += `1. Revert Git commit: ${change.context.commit_sha || 'latest'}\n`
      plan += `2. Run tests to verify\n`
      plan += `3. Deploy reverted version\n`
      plan += `4. Monitor for issues\n\n`
      plan += `Estimated rollback time: 5-10 minutes\n`
    }
    
    return plan
  }
  
  private async saveAssessment(
    change: Change,
    riskLevel: string,
    riskScore: number,
    factors: RiskFactor[],
    mitigations: string[]
  ): Promise<void> {
    const id = crypto.randomBytes(16).toString('hex')
    
    this.db.prepare(`
      INSERT INTO risk_assessments (
        id, change_type, risk_level, risk_score, factors, mitigations, assessed_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      change.type,
      riskLevel,
      riskScore,
      JSON.stringify(factors),
      JSON.stringify(mitigations)
    )
    
    if (riskLevel === 'high' || riskLevel === 'critical') {
      this.createRiskInboxItem(id, change, riskLevel, riskScore, factors, mitigations)
    }
  }
  
  private createRiskInboxItem(
    id: string,
    change: Change,
    riskLevel: string,
    riskScore: number,
    factors: RiskFactor[],
    mitigations: string[]
  ): void {
    const content = `# ⚠️ ${riskLevel.toUpperCase()} Risk Change Requires Approval

**Change**: ${change.description}  
**Risk Score**: ${Math.round(riskScore * 100)}%  
**Risk Level**: ${riskLevel}

## Risk Factors

${factors.map(f => `- **${f.name}**: ${Math.round(f.score * 100)}% - ${f.description}`).join('\n')}

## Required Mitigations

${mitigations.map((m, i) => `${i + 1}. ${m}`).join('\n')}

## Rollback Plan

${this.createRollbackPlan(change)}

## Your Response

Reply "approve risk ${id}" to proceed with mitigations  
Reply "reject risk ${id}" to block this change
`
    
    fs.mkdirSync('.dashboard/inbox', { recursive: true })
    fs.writeFileSync(`.dashboard/inbox/risk_${id}.md`, content)
  }
  
  close(): void {
    this.db.close()
  }
}

// Demo
async function demonstrateRiskAssessment(): Promise<void> {
  const assessor = new RiskAssessor()
  
  const change: Change = {
    type: 'database_migration',
    description: 'Add user_preferences table',
    affectedFiles: ['migrations/001_user_preferences.sql'],
    context: {
      affected_cores: 3,
      affected_apps: 2,
      test_coverage: '65',
      user_facing: true,
      commit_sha: 'abc123'
    }
  }
  
  const assessment = await assessor.assessRisk(change)
  
  console.log(`\n📋 Mitigations Required:`)
  assessment.mitigations.forEach((m, i) => console.log(`   ${i + 1}. ${m}`))
  
  console.log(`\n👥 Required Approvals:`)
  assessment.requiredApprovals.forEach(a => console.log(`   • ${a}`))
  
  assessor.close()
}

demonstrateRiskAssessment().catch(console.error)
