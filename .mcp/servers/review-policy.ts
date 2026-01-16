import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import Database from 'better-sqlite3';
import { DB_PATH } from '../../execution/db/setup.js';

export interface Review {
    id: string;
    type: string;
    creator: string;
    reviewer: string | null;
    status: string;
    confidence: number | null;
    revision_count: number;
    creator_argument: string | null;
    started_at: string | null;
    created_at: string;
}

export class ReviewPolicy {
    private config: any;
    private db: Database.Database;

    constructor() {
        this.loadConfig();
        this.db = new Database(DB_PATH);
    }

    private loadConfig() {
        try {
            const configPath = path.resolve(process.cwd(), '.framework/review-policy.yaml');
            if (fs.existsSync(configPath)) {
                this.config = yaml.load(fs.readFileSync(configPath, 'utf8'));
            } else {
                this.config = {};
            }
        } catch (error) {
            console.error('Error loading review policy:', error);
            this.config = {};
        }
    }

    async shouldRequireReview(action: string, context: any): Promise<{ needs_review: boolean; skip_reason?: string; assigned_reviewer?: string; estimated_time_minutes?: number }> {
        // Basic check based on action list
        const requiredActions = this.config?.review_required?.actions || [];

        if (!requiredActions.includes(action)) {
            return { needs_review: false, skip_reason: 'Action not in required list' };
        }

        // Check skip conditions
        const skipConditions = this.config?.review_required?.skip_if || [];
        for (const condition of skipConditions) {
            // Autonomy-based skip
            if (condition.autonomy_level && context.autonomy_level === condition.autonomy_level) {
                const exceptions = condition.except_for || [];
                if (!exceptions.includes(action)) {
                    return { needs_review: false, skip_reason: `Autonomy level ${condition.autonomy_level} skips review` };
                }
            }

            // Action-type skip
            if (condition.action_type && condition.action_type === action) {
                return { needs_review: false, skip_reason: `Action type ${action} doesn't require review` };
            }

            // Pattern-based skip (learned)
            if (condition.has_auto_skip_pattern) {
                const skip = await this.checkAutoSkipPattern(action, context.agent, condition.min_confidence, condition.min_successes);
                if (skip.should_skip) {
                    return { needs_review: false, skip_reason: skip.reason };
                }
            }
        }

        // Assign reviewer
        const reviewer = await this.assignReviewer({ type: action, creator: context.agent });

        return {
            needs_review: true,
            assigned_reviewer: reviewer,
            estimated_time_minutes: 15
        };
    }

    private async checkAutoSkipPattern(action: string, creator: string, minConfidence: number = 0.9, minSuccesses: number = 10): Promise<{ should_skip: boolean; reason?: string }> {
        const patternId = `${action}_${creator}`;
        const row = this.db.prepare('SELECT * FROM auto_skip_patterns WHERE id = ?').get(patternId) as any;

        if (!row || !row.skip_enabled) {
            return { should_skip: false };
        }

        if (row.avg_confidence >= minConfidence && row.successful_reviews >= minSuccesses) {
            return {
                should_skip: true,
                reason: `Auto-skip: ${row.successful_reviews} successful reviews, ${Math.round(row.avg_confidence * 100)}% confidence`
            };
        }

        return { should_skip: false };
    }

    async assignReviewer(params: { creator: string, type: string }): Promise<string> {
        const matrix = this.config?.reviewer_matrix || {};
        const creatorConfig = matrix[params.creator];

        if (creatorConfig) {
            // Check if primary reviewer is busy (queue > 3)
            const primaryReviewer = creatorConfig.primary;
            const queueSize = await this.getReviewerQueueSize(primaryReviewer);

            if (queueSize >= 3 && creatorConfig.backup) {
                console.log(`[ReviewPolicy] Primary reviewer ${primaryReviewer} busy (${queueSize} reviews), using backup ${creatorConfig.backup}`);
                return creatorConfig.backup;
            }

            return primaryReviewer;
        }

        // Fallback or default
        return 'auditor';
    }

    private async getReviewerQueueSize(reviewer: string): Promise<number> {
        const result = this.db.prepare(`
            SELECT COUNT(*) as count FROM reviews 
            WHERE reviewer_agent = ? AND status IN ('pending', 'in_progress', 'pending_re_review')
        `).get(reviewer) as any;

        return result?.count || 0;
    }

    async shouldEscalate(review: Review): Promise<{ escalate: boolean; reason?: string }> {
        // Trigger 1: Reviewer rejects and creator disagrees
        if (review.status === 'rejected' && review.creator_argument) {
            return { escalate: true, reason: 'creator_disagrees' };
        }

        // Trigger 2: Too many revision cycles (> 3)
        if (review.revision_count > 3) {
            return { escalate: true, reason: 'too_many_revisions' };
        }

        // Trigger 3: Review time exceeded (> 2 hours)
        if (review.started_at) {
            const startTime = new Date(review.started_at).getTime();
            const elapsed = Date.now() - startTime;
            const twoHours = 2 * 60 * 60 * 1000;
            if (elapsed > twoHours) {
                return { escalate: true, reason: 'timeout' };
            }
        }

        // Trigger 4: Large confidence gap (would need creator_confidence field - check via context)
        // This would require storing creator_confidence in the review

        // Trigger 5: Critical change with low reviewer confidence
        const criticalTypes = ['security_change', 'breaking_change'];
        if (criticalTypes.includes(review.type) && review.confidence !== null && review.confidence < 90) {
            return { escalate: true, reason: 'critical_uncertainty' };
        }

        return { escalate: false };
    }

    async checkTimeouts(): Promise<Review[]> {
        const thirtyMinutes = 30 * 60 * 1000;
        const threshold = new Date(Date.now() - thirtyMinutes).toISOString();

        const timedOut = this.db.prepare(`
            SELECT * FROM reviews 
            WHERE status = 'pending' AND created_at < ?
        `).all(threshold) as any[];

        return timedOut.map(row => ({
            id: row.id,
            type: row.type,
            creator: row.creator_agent,
            reviewer: row.reviewer_agent,
            status: row.status,
            confidence: row.confidence,
            revision_count: row.revision_count || 0,
            creator_argument: row.creator_argument,
            started_at: row.started_at,
            created_at: row.created_at
        }));
    }
}
