import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import { DB_PATH } from './db/setup.js';

export interface MetricsSummary {
    period: string;
    totalReviews: number;
    approved: number;
    changesRequested: number;
    rejected: number;
    escalated: number;
    avgReviewTimeMinutes: number;
    avgConfidence: number;
    byAgent: Record<string, any>;
    byType: Record<string, any>;
    autoSkipPatterns: any[];
}

export class MetricsCollector {
    private db: Database.Database;
    private dashboardDir: string;

    constructor() {
        this.db = new Database(DB_PATH);
        this.dashboardDir = path.resolve(process.cwd(), '.dashboard/metrics');
        this.ensureMetricsDirExists();
    }

    private ensureMetricsDirExists() {
        if (!fs.existsSync(this.dashboardDir)) {
            fs.mkdirSync(this.dashboardDir, { recursive: true });
        }
    }

    async collectMetrics(period: 'daily' | 'weekly' | 'all'): Promise<MetricsSummary> {
        const reviews = this.db.prepare('SELECT * FROM reviews').all() as any[];

        const totalReviews = reviews.length;
        const approved = reviews.filter(r => r.status === 'approved').length;
        const changesRequested = reviews.filter(r => r.status === 'changes_requested').length;
        const rejected = reviews.filter(r => r.status === 'rejected').length;
        const escalated = reviews.filter(r => r.status === 'escalated').length;

        const completedReviews = reviews.filter(r => r.time_to_review_ms);
        const avgReviewTimeMinutes = completedReviews.length > 0
            ? completedReviews.reduce((sum, r) => sum + r.time_to_review_ms, 0) / completedReviews.length / 60000
            : 0;

        const reviewsWithConfidence = reviews.filter(r => r.confidence);
        const avgConfidence = reviewsWithConfidence.length > 0
            ? reviewsWithConfidence.reduce((sum, r) => sum + r.confidence, 0) / reviewsWithConfidence.length
            : 0;

        // Auto-skip patterns
        const patterns = this.db.prepare('SELECT * FROM auto_skip_patterns').all() as any[];

        return {
            period,
            totalReviews,
            approved,
            changesRequested,
            rejected,
            escalated,
            avgReviewTimeMinutes: Math.round(avgReviewTimeMinutes),
            avgConfidence: Math.round(avgConfidence),
            byAgent: this.groupByAgent(reviews),
            byType: this.groupByType(reviews),
            autoSkipPatterns: patterns.map(p => ({
                id: p.id,
                eligible: Boolean(p.eligible_for_skip),
                enabled: Boolean(p.skip_enabled),
                successRate: p.total_attempts > 0 ? (p.successful_reviews / p.total_attempts * 100).toFixed(1) : 0
            }))
        };
    }

    private groupByAgent(reviews: any[]): Record<string, any> {
        const byAgent: Record<string, any> = {};

        reviews.forEach(r => {
            if (!byAgent[r.creator_agent]) {
                byAgent[r.creator_agent] = { created: 0, approved: 0, changesRequested: 0, rejected: 0 };
            }
            byAgent[r.creator_agent].created++;
            if (r.status === 'approved') byAgent[r.creator_agent].approved++;
            if (r.status === 'changes_requested') byAgent[r.creator_agent].changesRequested++;
            if (r.status === 'rejected') byAgent[r.creator_agent].rejected++;
        });

        return byAgent;
    }

    private groupByType(reviews: any[]): Record<string, any> {
        const byType: Record<string, any> = {};

        reviews.forEach(r => {
            if (!byType[r.type]) {
                byType[r.type] = { total: 0, approved: 0, avgTime: 0 };
            }
            byType[r.type].total++;
            if (r.status === 'approved') byType[r.type].approved++;
        });

        return byType;
    }

    async generateReport(): Promise<void> {
        const metrics = await this.collectMetrics('all');
        const reportPath = path.join(this.dashboardDir, 'latest-report.md');

        const content = `# Review System Metrics Report

**Generated**: ${new Date().toISOString()}

## Overview

- **Total Reviews**: ${metrics.totalReviews}
- **Approved**: ${metrics.approved} (${metrics.totalReviews > 0 ? (metrics.approved / metrics.totalReviews * 100).toFixed(1) : 0}%)
- **Changes Requested**: ${metrics.changesRequested}
- **Rejected**: ${metrics.rejected}
- **Escalated**: ${metrics.escalated}
- **Avg Review Time**: ${metrics.avgReviewTimeMinutes} minutes
- **Avg Confidence**: ${metrics.avgConfidence}%

## Auto-Skip Patterns

${metrics.autoSkipPatterns.length > 0 ? metrics.autoSkipPatterns.map(p =>
            `- **${p.id}**: ${p.enabled ? '✅ Enabled' : p.eligible ? '⏳ Eligible' : '❌ Not Eligible'} (Success: ${p.successRate}%)`
        ).join('\n') : '*No patterns yet*'}

## By Agent (Creator)

${Object.entries(metrics.byAgent).map(([agent, stats]: [string, any]) =>
            `- **${agent}**: ${stats.created} created, ${stats.approved} approved (${(stats.approved / stats.created * 100).toFixed(1)}%)`
        ).join('\n')}

## By Type

${Object.entries(metrics.byType).map(([type, stats]: [string, any]) =>
            `- **${type}**: ${stats.total} total, ${stats.approved} approved`
        ).join('\n')}
`;

        fs.writeFileSync(reportPath, content);
        console.log(`[Metrics] Report generated at ${reportPath}`);
    }
}
