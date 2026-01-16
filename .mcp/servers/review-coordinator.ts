import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { DB_PATH } from '../../execution/db/setup.js';
import { NotificationDispatcher } from '../../execution/notifications.js';

export interface ReviewRequest {
    id: string;
    type: string;
    creator: string;
    title: string;
    artifacts: any;
    context: any;
    questions?: string[];
}

export interface Review {
    id: string;
    type: string;
    creator: string;
    reviewer: string | null;
    status: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    artifacts: any;
    context: any;
    questions: string[];
    feedback: any;
    checklist: any;
    confidence: number | null;
    time_to_review_ms: number | null;
    revision_count: number;
    escalation_reason: string | null;
    creator_argument: string | null;
}

export class ReviewCoordinator {
    private db: Database.Database;
    private config: any;
    private notifier: NotificationDispatcher;

    constructor() {
        this.db = new Database(DB_PATH);
        this.notifier = new NotificationDispatcher();
        this.loadConfig();
    }

    private loadConfig() {
        try {
            const configPath = path.resolve(process.cwd(), '.framework/review-policy.yaml');
            if (fs.existsSync(configPath)) {
                this.config = yaml.load(fs.readFileSync(configPath, 'utf8'));
            } else {
                console.warn('Warning: Review policy not found, using defaults.');
                this.config = { enabled: true };
            }
        } catch (error) {
            console.error('Error loading review policy:', error);
            this.config = { enabled: true };
        }
    }

    async validateRequest(request: ReviewRequest): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];
        if (!request.id) errors.push('Missing review ID');
        if (!request.type) errors.push('Missing review type');
        if (!request.creator) errors.push('Missing creator');
        if (!request.title) errors.push('Missing title');

        return {
            valid: errors.length === 0,
            errors
        };
    }

    async createReview(request: ReviewRequest): Promise<Review> {
        const insertStmt = this.db.prepare(`
            INSERT INTO reviews (
                id, type, creator_agent, status, title, artifacts_json, context_json, creator_questions
            ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
        `);

        insertStmt.run(
            request.id,
            request.type,
            request.creator,
            request.title,
            JSON.stringify(request.artifacts),
            JSON.stringify(request.context),
            JSON.stringify(request.questions || [])
        );

        return this.getReview(request.id) as Promise<Review>;
    }

    async getReview(id: string): Promise<Review | null> {
        const row = this.db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
        if (!row) return null;

        return this.mapRowToReview(row);
    }

    async saveReview(review: Review): Promise<void> {
        const stmt = this.db.prepare(`
            UPDATE reviews SET
                reviewer_agent = ?,
                status = ?,
                started_at = ?,
                completed_at = ?,
                artifacts_json = ?,
                context_json = ?,
                reviewer_feedback_json = ?,
                checklist_json = ?,
                confidence = ?,
                time_to_review_ms = ?,
                revision_count = ?,
                escalation_reason = ?,
                creator_argument = ?
            WHERE id = ?
        `);

        stmt.run(
            review.reviewer,
            review.status,
            review.started_at,
            review.completed_at,
            JSON.stringify(review.artifacts),
            JSON.stringify(review.context),
            JSON.stringify(review.feedback),
            JSON.stringify(review.checklist),
            review.confidence,
            review.time_to_review_ms,
            review.revision_count,
            review.escalation_reason,
            review.creator_argument,
            review.id
        );
    }

    async notifyReviewer(review: Review, options?: { is_revision: boolean }) {
        await this.notifier.notifyReviewRequested(
            review.reviewer || 'unknown',
            review.id,
            review.type,
            review.creator
        );
        await this.updateDashboard(review);
    }

    async notifyCreator(review: Review) {
        await this.notifier.notifyReviewCompleted(
            review.creator,
            review.id,
            review.status,
            review.reviewer || 'unknown'
        );
        await this.updateDashboard(review);
    }

    async escalateToHuman(review: Review) {
        await this.notifier.notifyEscalation(review.id, review.escalation_reason || 'Unknown reason');
        await this.updateDashboard(review);
    }

    async getMetrics(filters: { period?: string, agent?: string, type?: string }) {
        const whereConditions: string[] = [];
        const params: any[] = [];

        // Build date filter based on period
        if (filters.period) {
            const now = new Date();
            let startDate: Date;
            switch (filters.period) {
                case 'day':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0);
            }
            whereConditions.push('created_at >= ?');
            params.push(startDate.toISOString());
        }

        if (filters.agent) {
            whereConditions.push('(creator_agent = ? OR reviewer_agent = ?)');
            params.push(filters.agent, filters.agent);
        }

        if (filters.type) {
            whereConditions.push('type = ?');
            params.push(filters.type);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get aggregate stats
        const stats = this.db.prepare(`
            SELECT 
                COUNT(*) as total_reviews,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'changes_requested' THEN 1 ELSE 0 END) as changes_requested,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'escalated' THEN 1 ELSE 0 END) as escalated,
                AVG(time_to_review_ms) as avg_review_time_ms,
                AVG(confidence) as avg_confidence,
                AVG(revision_count) as avg_revisions
            FROM reviews ${whereClause}
        `).get(...params) as any;

        return {
            period: filters.period || 'all',
            total_reviews: stats?.total_reviews || 0,
            approved: stats?.approved || 0,
            changes_requested: stats?.changes_requested || 0,
            rejected: stats?.rejected || 0,
            escalated: stats?.escalated || 0,
            avg_review_time_minutes: stats?.avg_review_time_ms ? Math.round(stats.avg_review_time_ms / 60000) : 0,
            avg_confidence: stats?.avg_confidence ? Math.round(stats.avg_confidence) : 0,
            avg_revisions: stats?.avg_revisions ? Math.round(stats.avg_revisions * 10) / 10 : 0,
            approval_rate: stats?.total_reviews > 0 ? Math.round((stats.approved / stats.total_reviews) * 100) : 0
        };
    }

    async createRevision(data: { review_id: string; revision_number: number; changes_made: string; changes_requested?: string }): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO review_revisions (review_id, revision_number, changes_requested, changes_made)
            VALUES (?, ?, ?, ?)
        `);

        stmt.run(
            data.review_id,
            data.revision_number,
            data.changes_requested || null,
            data.changes_made
        );
    }

    private mapRowToReview(row: any): Review {
        return {
            id: row.id,
            type: row.type,
            creator: row.creator_agent,
            reviewer: row.reviewer_agent,
            status: row.status,
            created_at: row.created_at,
            started_at: row.started_at,
            completed_at: row.completed_at,
            artifacts: JSON.parse(row.artifacts_json || '{}'),
            context: JSON.parse(row.context_json || '{}'),
            questions: JSON.parse(row.creator_questions || '[]'),
            feedback: JSON.parse(row.reviewer_feedback_json || 'null'),
            checklist: JSON.parse(row.checklist_json || 'null'),
            confidence: row.confidence,
            time_to_review_ms: row.time_to_review_ms,
            revision_count: row.revision_count || 0,
            escalation_reason: row.escalation_reason,
            creator_argument: row.creator_argument
        };
    }

    // Helper to generate dashboard files (Phase 1 Visualization)
    private async updateDashboard(review: Review) {
        const dashboardDir = path.resolve(process.cwd(), '.dashboard/reviews');
        let subDir = 'pending';

        if (review.status === 'approved' || review.status === 'rejected') subDir = 'completed';
        if (review.status === 'in_progress') subDir = 'in-progress';
        if (review.status === 'escalated') subDir = 'escalated';

        const targetDir = path.join(dashboardDir, subDir);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const content = this.generateDashboardMarkdown(review);
        fs.writeFileSync(path.join(targetDir, `${review.id}.md`), content);
    }

    private generateDashboardMarkdown(review: Review): string {
        return `# Review: ${review.type} (${review.id})
**Status**: ${review.status}
**Creator**: ${review.creator}
**Reviewer**: ${review.reviewer || 'Unassigned'}
**Created**: ${review.created_at}

## Artifacts
\`\`\`json
${JSON.stringify(review.artifacts, null, 2)}
\`\`\`

## Feedback
${review.feedback ? JSON.stringify(review.feedback, null, 2) : '*None yet*'}
`;
    }
}
