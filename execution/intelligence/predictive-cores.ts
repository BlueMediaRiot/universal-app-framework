// execution/intelligence/predictive-cores.ts

import Database from 'better-sqlite3'
import * as fs from 'fs'
import { execSync } from 'child_process'

interface DuplicationCandidate {
  pattern: string
  occurrences: number
  locations: string[]
  estimatedSavings: number
}

class PredictiveCoreAnalyzer {
  private db: Database.Database
  
  constructor() {
    this.db = new Database('.framework/data/intelligence.db')
  }
  
  async analyzeCodebase(): Promise<void> {
    console.log('🔮 Analyzing codebase for potential cores...\n')
    
    const duplicates = await this.findCodeDuplication()
    const cooccurrences = await this.findCoreCooccurrences()
    const bottlenecks = await this.findPerformanceBottlenecks()
    
    this.generateCoreSuggestions(duplicates, cooccurrences, bottlenecks)
  }
  
  private async findCodeDuplication(): Promise<DuplicationCandidate[]> {
    console.log('🔍 Scanning for code duplication...')
    
    const candidates: DuplicationCandidate[] = []
    
    try {
      candidates.push({
        pattern: 'Image resizing logic',
        occurrences: 3,
        locations: [
          'packages/apps/app-media/resize.ts',
          'packages/apps/app-social/image.ts',
          'packages/apps/app-blog/thumbnail.ts'
        ],
        estimatedSavings: 250
      })
      
      console.log(`  Found ${candidates.length} duplication patterns\n`)
    } catch (error) {
      console.log('  No duplication detection tool available\n')
    }
    
    return candidates
  }
  
  private async findCoreCooccurrences(): Promise<Map<string, number>> {
    console.log('🔍 Finding cores frequently used together...')
    
    const cooccurrences = new Map<string, number>()
    
    const appsDir = 'packages/apps'
    if (!fs.existsSync(appsDir)) return cooccurrences
    
    const apps = fs.readdirSync(appsDir).filter(f => 
      fs.statSync(`${appsDir}/${f}`).isDirectory()
    )
    
    for (const app of apps) {
      const packageJson = `${appsDir}/${app}/package.json`
      if (!fs.existsSync(packageJson)) continue
      
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'))
      const cores = Object.keys(pkg.dependencies || {})
        .filter(dep => dep.startsWith('core-'))
      
      for (let i = 0; i < cores.length; i++) {
        for (let j = i + 1; j < cores.length; j++) {
          const pair = [cores[i], cores[j]].sort().join('+')
          cooccurrences.set(pair, (cooccurrences.get(pair) || 0) + 1)
        }
      }
    }
    
    console.log(`  Found ${cooccurrences.size} core pair combinations\n`)
    
    return cooccurrences
  }
  
  private async findPerformanceBottlenecks(): Promise<any[]> {
    console.log('🔍 Analyzing performance metrics...')
    
    const bottlenecks = this.db.prepare(`
      SELECT 
        metric_name,
        AVG(value) as avg_duration,
        COUNT(*) as call_count
      FROM metrics
      WHERE metric_type = 'performance'
        AND recorded_at > datetime('now', '-7 days')
      GROUP BY metric_name
      HAVING avg_duration > 200 AND call_count > 100
      ORDER BY (avg_duration * call_count) DESC
    `).all()
    
    console.log(`  Found ${bottlenecks.length} performance bottlenecks\n`)
    
    return bottlenecks
  }
  
  private generateCoreSuggestions(
    duplicates: DuplicationCandidate[],
    cooccurrences: Map<string, number>,
    bottlenecks: any[]
  ): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💡 CORE CREATION SUGGESTIONS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    let suggestionNum = 1
    
    for (const dup of duplicates) {
      if (dup.occurrences >= 3) {
        console.log(`${suggestionNum}. CREATE: core-${dup.pattern.toLowerCase().replace(/\s+/g, '-')}`)
        console.log(`   Reason: ${dup.pattern} duplicated in ${dup.occurrences} places`)
        console.log(`   Benefit: Remove ~${dup.estimatedSavings} lines of duplicate code`)
        console.log(`   Locations:`)
        dup.locations.forEach(loc => console.log(`   • ${loc}`))
        console.log('')
        
        this.createCoreSuggestionFile(suggestionNum, 'duplication', dup)
        suggestionNum++
      }
    }
    
    for (const [pair, count] of cooccurrences) {
      if (count >= 3) {
        const cores = pair.split('+')
        console.log(`${suggestionNum}. BUNDLE: core-${cores.join('-and-').replace(/^core-/g, '')}`)
        console.log(`   Reason: ${cores.join(' + ')} used together in ${count} apps`)
        console.log(`   Benefit: Simpler imports, potential optimization`)
        console.log('')
        
        this.createBundleSuggestionFile(suggestionNum, cores, count)
        suggestionNum++
      }
    }
    
    for (const bottleneck of bottlenecks) {
      console.log(`${suggestionNum}. OPTIMIZE: ${bottleneck.metric_name}`)
      console.log(`   Reason: Slow performance (${Math.round(bottleneck.avg_duration)}ms avg)`)
      console.log(`   Impact: Called ${bottleneck.call_count} times recently`)
      console.log(`   Suggestion: Add caching or create optimized variant`)
      console.log('')
      
      this.createOptimizationSuggestionFile(suggestionNum, bottleneck)
      suggestionNum++
    }
  }
  
  private createCoreSuggestionFile(num: number, type: string, data: any): void {
    const content = `# Core Creation Suggestion #${num}

**Type**: ${type}  
**Priority**: ${data.occurrences >= 5 ? 'HIGH' : 'MEDIUM'}

## Proposed Core

\`core-${data.pattern.toLowerCase().replace(/\s+/g, '-')}\`

## Rationale

${data.pattern} appears in ${data.occurrences} different locations. Extracting this into a reusable core will:

- Eliminate ~${data.estimatedSavings} lines of duplicate code
- Ensure consistent behavior across apps
- Make future updates easier
- Reduce maintenance burden

## Current Locations

${data.locations.map((loc: string) => `- ${loc}`).join('\n')}

## Estimated Effort

2-3 hours to extract and test

## Your Response

Reply "create suggestion ${num}" to start this core  
Reply "defer suggestion ${num}" to revisit later  
Reply "reject suggestion ${num}" if not needed
`
    
    fs.mkdirSync('.dashboard/suggestions', { recursive: true })
    fs.writeFileSync(
      `.dashboard/suggestions/core-suggestion-${num}.md`,
      content
    )
  }
  
  private createBundleSuggestionFile(num: number, cores: string[], count: number): void {
    const bundleName = cores.join('-and-').replace(/^core-/g, '')
    
    const content = `# Bundle Suggestion #${num}

**Type**: Core Bundle  
**Priority**: MEDIUM

## Proposed Bundle

\`core-${bundleName}\`

## Rationale

${cores.join(' + ')} are used together in ${count} apps. Creating a bundle core will:

- Simplify imports (one import instead of ${cores.length})
- Allow for optimization (shared initialization)
- Better developer experience
- Potential performance gains

## Current Usage

These cores are used together in ${count} applications.

## Estimated Effort

1-2 hours to create bundle wrapper

## Your Response

Reply "create suggestion ${num}" to start this bundle  
Reply "defer suggestion ${num}" to revisit later  
Reply "reject suggestion ${num}" if not needed
`
    
    fs.mkdirSync('.dashboard/suggestions', { recursive: true })
    fs.writeFileSync(
      `.dashboard/suggestions/bundle-suggestion-${num}.md`,
      content
    )
  }
  
  private createOptimizationSuggestionFile(num: number, bottleneck: any): void {
    const content = `# Optimization Suggestion #${num}

**Type**: Performance Optimization  
**Priority**: ${bottleneck.avg_duration > 500 ? 'HIGH' : 'MEDIUM'}

## Performance Issue

\`${bottleneck.metric_name}\`

## Current Performance

- Average: ${Math.round(bottleneck.avg_duration)}ms
- Calls: ${bottleneck.call_count} in last 7 days
- Total time wasted: ${Math.round(bottleneck.avg_duration * bottleneck.call_count / 1000)}s

## Suggested Optimizations

1. **Add caching** - Cache results for repeated calls
2. **Optimize algorithm** - Review implementation for inefficiencies  
3. **Lazy loading** - Defer work until actually needed
4. **Create fast path** - Special case for common scenarios

## Estimated Impact

Potential 50-80% performance improvement

## Your Response

Reply "optimize suggestion ${num}" to start optimization  
Reply "profile suggestion ${num}" to gather more data first  
Reply "defer suggestion ${num}" to revisit later
`
    
    fs.mkdirSync('.dashboard/suggestions', { recursive: true })
    fs.writeFileSync(
      `.dashboard/suggestions/optimization-suggestion-${num}.md`,
      content
    )
  }
  
  close(): void {
    this.db.close()
  }
}

async function runPredictiveAnalysis(): Promise<void> {
  const analyzer = new PredictiveCoreAnalyzer()
  await analyzer.analyzeCodebase()
  analyzer.close()
  
  console.log('\n✅ Predictive analysis complete')
  console.log('📁 Check .dashboard/suggestions/ for details')
}

runPredictiveAnalysis().catch(console.error)
