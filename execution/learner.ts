#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

/**
 * Decision learning system
 * Analyzes decision history to detect patterns and improve future decisions
 */

export interface Decision {
    id: string;
    timestamp: string;
    type: string;
    title: string;
    options: Array<{
        id: string;
        description: string;
        pros: string[];
        cons: string[];
    }>;
    chosen: string;
    rationale: string;
    outcome?: {
        success: boolean;
        notes: string;
        timestamp: string;
    };
}

export interface Pattern {
    id: string;
    type: string;
    description: string;
    confidence: number;
    examples: string[]; // Decision IDs
    recommendation: string;
}

export class DecisionLearner {
    private decisionsDir: string;
    private patternsDir: string;

    constructor(private cwd: string = process.cwd()) {
        this.decisionsDir = path.join(cwd, '.dashboard', 'decisions');
        this.patternsDir = path.join(cwd, '.framework', 'patterns');

        fs.mkdirSync(this.decisionsDir, { recursive: true });
        fs.mkdirSync(this.patternsDir, { recursive: true });
    }

    /**
     * Load all decisions
     */
    loadDecisions(): Decision[] {
        const files = fs.readdirSync(this.decisionsDir)
            .filter(f => f.endsWith('.json'));

        return files.map(file => {
            const content = fs.readFileSync(path.join(this.decisionsDir, file), 'utf-8');
            return JSON.parse(content);
        });
    }

    /**
     * Analyze decisions to detect patterns
     */
    analyzePatterns(): Pattern[] {
        const decisions = this.loadDecisions();
        const patterns: Pattern[] = [];

        // Pattern 1: Successful decision types
        const successByType = new Map<string, { success: number; total: number }>();

        decisions.forEach(d => {
            if (d.outcome) {
                const stats = successByType.get(d.type) || { success: 0, total: 0 };
                stats.total++;
                if (d.outcome.success) {
                    stats.success++;
                }
                successByType.set(d.type, stats);
            }
        });

        successByType.forEach((stats, type) => {
            if (stats.total >= 3) { // Need at least 3 examples
                const confidence = stats.success / stats.total;
                const examples = decisions
                    .filter(d => d.type === type && d.outcome?.success)
                    .map(d => d.id)
                    .slice(0, 3);

                patterns.push({
                    id: `pattern-${type}-success`,
                    type,
                    description: `${type} decisions have ${(confidence * 100).toFixed(0)}% success rate`,
                    confidence,
                    examples,
                    recommendation: confidence > 0.7
                        ? `Continue with ${type} decisions - they work well`
                        : `Review ${type} decision process - success rate is low`
                });
            }
        });

        // Pattern 2: Common rationales for successful decisions
        const successfulRationales = decisions
            .filter(d => d.outcome?.success)
            .map(d => d.rationale.toLowerCase());

        const rationaleWords = new Map<string, number>();
        successfulRationales.forEach(rationale => {
            const words = rationale.split(/\s+/).filter(w => w.length > 4);
            words.forEach(word => {
                rationaleWords.set(word, (rationaleWords.get(word) || 0) + 1);
            });
        });

        // Find common themes
        const commonWords = Array.from(rationaleWords.entries())
            .filter(([_, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (commonWords.length > 0) {
            patterns.push({
                id: 'pattern-rationale-themes',
                type: 'rationale',
                description: `Common themes in successful decisions: ${commonWords.map(([w]) => w).join(', ')}`,
                confidence: 0.6,
                examples: decisions.filter(d => d.outcome?.success).map(d => d.id).slice(0, 3),
                recommendation: 'Consider these themes when making future decisions'
            });
        }

        // Save patterns
        const patternsPath = path.join(this.patternsDir, 'detected-patterns.json');
        fs.writeFileSync(patternsPath, JSON.stringify(patterns, null, 2));

        return patterns;
    }

    /**
     * Get recommendations for a decision type
     */
    getRecommendations(decisionType: string): string[] {
        const patternsPath = path.join(this.patternsDir, 'detected-patterns.json');

        if (!fs.existsSync(patternsPath)) {
            return ['No patterns detected yet. Make more decisions to build learning data.'];
        }

        const patterns: Pattern[] = JSON.parse(fs.readFileSync(patternsPath, 'utf-8'));

        return patterns
            .filter(p => p.type === decisionType || p.type === 'rationale')
            .map(p => p.recommendation);
    }

    /**
     * Record decision outcome
     */
    recordOutcome(decisionId: string, success: boolean, notes: string): void {
        const decisionPath = path.join(this.decisionsDir, `${decisionId}.json`);

        if (!fs.existsSync(decisionPath)) {
            throw new Error(`Decision not found: ${decisionId}`);
        }

        const decision: Decision = JSON.parse(fs.readFileSync(decisionPath, 'utf-8'));
        decision.outcome = {
            success,
            notes,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(decisionPath, JSON.stringify(decision, null, 2));
        console.log(`Outcome recorded for decision: ${decisionId}`);

        // Trigger pattern analysis
        this.analyzePatterns();
    }
}

// CLI
if (require.main === module) {
    const command = process.argv[2];
    const learner = new DecisionLearner();

    switch (command) {
        case 'analyze':
            const patterns = learner.analyzePatterns();
            console.log(JSON.stringify(patterns, null, 2));
            break;

        case 'recommend':
            const type = process.argv[3];
            if (!type) {
                console.error('Usage: learner.ts recommend <decision-type>');
                process.exit(1);
            }
            const recommendations = learner.getRecommendations(type);
            recommendations.forEach(r => console.log(`- ${r}`));
            break;

        case 'outcome':
            const decisionId = process.argv[3];
            const success = process.argv[4] === 'true';
            const notes = process.argv[5] || '';

            if (!decisionId) {
                console.error('Usage: learner.ts outcome <decision-id> <true|false> "<notes>"');
                process.exit(1);
            }

            learner.recordOutcome(decisionId, success, notes);
            break;

        default:
            console.log('Usage: learner.ts <analyze|recommend|outcome>');
            process.exit(1);
    }
}

export default DecisionLearner;
