import * as fs from 'fs';
import * as path from 'path';
import { Review } from '../.mcp/servers/review-coordinator.js';
import { NotificationDispatcher } from './notifications.js';

export interface EscalationDecision {
    reviewId: string;
    decision: 'approve_option_1' | 'approve_option_2' | 'custom';
    customInstructions?: string;
    decidedAt: string;
    decidedBy: string;
}

export class EscalationManager {
    private escalationDir: string;
    private notifier: NotificationDispatcher;

    constructor() {
        this.escalationDir = path.resolve(process.cwd(), '.dashboard/reviews/escalated');
        this.notifier = new NotificationDispatcher();
        this.ensureEscalationDirExists();
    }

    private ensureEscalationDirExists() {
        if (!fs.existsSync(this.escalationDir)) {
            fs.mkdirSync(this.escalationDir, { recursive: true });
        }
    }

    async createEscalation(review: Review, reason: string, options?: any): Promise<void> {
        const escalationFile = path.join(this.escalationDir, `${review.id}.md`);

        const content = this.generateEscalationMarkdown(review, reason, options);
        fs.writeFileSync(escalationFile, content);

        await this.notifier.notifyEscalation(review.id, reason);
        console.log(`[Escalation] Created escalation for review ${review.id}`);
    }

    private generateEscalationMarkdown(review: Review, reason: string, options?: any): string {
        return `# 🚨 Review Escalation: ${review.id}

**Type**: ${review.type}
**Status**: ⚠️ ESCALATED - Human Decision Required
**Created**: ${new Date().toISOString()}

---

## Escalation Reason

${reason}

## The Conflict

**Creator**: ${review.creator} (Confidence: ${review.confidence || 'N/A'}%)
**Reviewer**: ${review.reviewer || 'Unknown'}

### Creator's Position
${review.creator_argument || 'No argument provided'}

### Reviewer's Position
${review.feedback?.overall || 'No feedback provided'}

---

## Context

**Review Type**: ${review.type}
**Artifacts**: ${Object.keys(review.artifacts || {}).join(', ')}

---

## Your Decision Needed

Please review the escalation and make a decision:

1. **Approve as-is** (Creator's position)
2. **Request changes** (Reviewer's position)
3. **Provide custom instructions**

**Timeout**: 48 hours (auto-chooses conservative default if no response)

---

## Actions

To resolve, update this file with your decision or use the MCP tool \`resolve_escalation\`.
`;
    }

    async checkEscalationTimeout(review: Review): Promise<boolean> {
        if (!review.created_at) return false;

        const createdTime = new Date(review.created_at).getTime();
        const now = Date.now();
        const hoursSince = (now - createdTime) / (1000 * 60 * 60);

        return hoursSince > 48;
    }

    async resolveEscalation(reviewId: string, decision: EscalationDecision): Promise<void> {
        const escalationFile = path.join(this.escalationDir, `${reviewId}.md`);

        if (fs.existsSync(escalationFile)) {
            // Move to resolved
            const resolvedDir = path.join(this.escalationDir, '../resolved');
            if (!fs.existsSync(resolvedDir)) {
                fs.mkdirSync(resolvedDir, { recursive: true });
            }

            fs.renameSync(escalationFile, path.join(resolvedDir, `${reviewId}.md`));
        }

        console.log(`[Escalation] Resolved escalation for review ${reviewId}: ${decision.decision}`);
    }
}
