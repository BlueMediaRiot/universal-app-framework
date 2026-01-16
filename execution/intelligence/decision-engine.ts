// execution/intelligence/decision-engine.ts

import Database from 'better-sqlite3'

interface DecisionCriteria {
  name: string
  weight: number
  measurement: string
}

interface DecisionRequest {
  type: string
  description: string
  context: any
  options: DecisionOption[]
}

interface DecisionOption {
  id: string
  description: string
  metrics?: Record<string, number>
}

interface DecisionAnalysis {
  score: number
  breakdown: Record<string, number>
  confidence: number
  recommendation: 'approve' | 'reject' | 'defer' | 'needs_human'
  reasoning: string[]
  alternatives?: DecisionOption[]
}

class DecisionEngine {
  private db: Database.Database
  private criteria: DecisionCriteria[]
  
  constructor() {
    this.db = new Database('.framework/data/intelligence.db')
    
    // Load criteria from config
    this.criteria = [
      { name: 'performance_impact', weight: 0.25, measurement: 'benchmark_comparison' },
      { name: 'code_quality', weight: 0.20, measurement: 'complexity_score' },
      { name: 'maintainability', weight: 0.20, measurement: 'coupling_cohesion' },
      { name: 'test_coverage', weight: 0.15, measurement: 'coverage_percentage' },
      { name: 'user_impact', weight: 0.10, measurement: 'usage_data' },
      { name: 'technical_debt', weight: 0.10, measurement: 'debt_ratio' }
    ]
  }
  
  async evaluateDecision(request: DecisionRequest): Promise<DecisionAnalysis> {
    console.log(`\n🎯 Evaluating Decision: ${request.type}`)
    console.log(`   ${request.description}\n`)
    
    const scores: Record<string, number> = {}
    const reasoning: string[] = []
    
    // Score each criterion
    for (const criterion of this.criteria) {
      const score = await this.scoreCriterion(criterion, request)
      scores[criterion.name] = score * criterion.weight
      
      const percentage = Math.round(score * 100)
      console.log(`   ${criterion.name.padEnd(20)} ${'█'.repeat(Math.floor(percentage / 10))}${'░'.repeat(10 - Math.floor(percentage / 10))} ${percentage}%`)
      
      // Add reasoning
      if (score > 0.8) {
        reasoning.push(`Strong ${criterion.name} (${percentage}%)`)
      } else if (score < 0.4) {
        reasoning.push(`Weak ${criterion.name} (${percentage}%)`)
      }
    }
    
    // Calculate overall score
    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    const normalizedScore = overallScore * 100
    
    console.log(`\n   Overall Score: ${Math.round(normalizedScore)}/100`)
    
    // Determine recommendation
    let recommendation: DecisionAnalysis['recommendation']
    let confidence: number
    
    if (normalizedScore >= 80) {
      recommendation = 'approve'
      confidence = normalizedScore / 100
      reasoning.push('Benefits significantly outweigh costs')
    } else if (normalizedScore >= 60) {
      recommendation = 'approve'
      confidence = normalizedScore / 100
      reasoning.push('Benefits moderately outweigh costs')
    } else if (normalizedScore >= 40) {
      recommendation = 'defer'
      confidence = 0.5
      reasoning.push('Trade-offs are balanced, needs human judgment')
    } else {
      recommendation = 'reject'
      confidence = (100 - normalizedScore) / 100
      reasoning.push('Costs outweigh benefits')
    }
    
    // Check if needs human review
    if (confidence < 0.7) {
      recommendation = 'needs_human'
      reasoning.push('Low confidence - requires human review')
    }
    
    return {
      score: normalizedScore,
      breakdown: scores,
      confidence,
      recommendation,
      reasoning
    }
  }
  
  private async scoreCriterion(criterion: DecisionCriteria, request: DecisionRequest): Promise<number> {
    // Simplified scoring - in reality would use actual measurements
    switch (criterion.name) {
      case 'performance_impact':
        return this.scorePerformanceImpact(request)
      case 'code_quality':
        return this.scoreCodeQuality(request)
      case 'maintainability':
        return this.scoreMaintainability(request)
      case 'test_coverage':
        return this.scoreTestCoverage(request)
      case 'user_impact':
        return this.scoreUserImpact(request)
      case 'technical_debt':
        return this.scoreTechnicalDebt(request)
      default:
        return 0.5
    }
  }
  
  private scorePerformanceImpact(request: DecisionRequest): number {
    const context = request.context
    
    if (context.performance_gain) {
      const gain = parseFloat(context.performance_gain)
      if (gain > 50) return 1.0
      if (gain > 20) return 0.8
      if (gain > 10) return 0.6
      return 0.5
    }
    
    return 0.5
  }
  
  private scoreCodeQuality(request: DecisionRequest): number {
    const context = request.context
    
    if (context.lines_added) {
      const lines = parseInt(context.lines_added)
      if (lines < 50) return 0.9
      if (lines < 150) return 0.7
      if (lines < 300) return 0.5
      return 0.3
    }
    
    return 0.5
  }
  
  private scoreMaintainability(request: DecisionRequest): number {
    return 0.7
  }
  
  private scoreTestCoverage(request: DecisionRequest): number {
    const context = request.context
    
    if (context.test_coverage) {
      return parseFloat(context.test_coverage) / 100
    }
    
    return 0.5
  }
  
  private scoreUserImpact(request: DecisionRequest): number {
    return 0.6
  }
  
  private scoreTechnicalDebt(request: DecisionRequest): number {
    const context = request.context
    
    if (context.reduces_duplication) {
      return 0.9
    }
    
    return 0.5
  }
  
  async logDecision(request: DecisionRequest, analysis: DecisionAnalysis, finalDecision: string): Promise<void> {
    this.db.prepare(`
      INSERT INTO decisions (
        id, type, context, decision, confidence, auto_approved, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      `dec_${Date.now()}`,
      request.type,
      JSON.stringify(request.context),
      finalDecision,
      analysis.confidence,
      analysis.recommendation !== 'needs_human' ? 1 : 0
    )
  }
  
  close(): void {
    this.db.close()
  }
}

// Example usage
async function demonstrateDecisionEngine(): Promise<void> {
  const engine = new DecisionEngine()
  
  const request: DecisionRequest = {
    type: 'create_core',
    description: 'Create core-redis-cache',
    context: {
      performance_gain: '40',
      lines_added: '120',
      test_coverage: '85',
      reduces_duplication: true
    },
    options: [
      { id: 'create', description: 'Create new core' },
      { id: 'extend', description: 'Extend existing core' }
    ]
  }
  
  const analysis = await engine.evaluateDecision(request)
  
  console.log(`\n📊 Analysis Results:`)
  console.log(`   Recommendation: ${analysis.recommendation.toUpperCase()}`)
  console.log(`   Confidence: ${Math.round(analysis.confidence * 100)}%`)
  console.log(`\n   Reasoning:`)
  analysis.reasoning.forEach(reason => console.log(`   • ${reason}`))
  
  engine.close()
}

demonstrateDecisionEngine().catch(console.error)
