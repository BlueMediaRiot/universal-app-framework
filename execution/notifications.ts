import * as fs from 'fs';
import * as path from 'path';

export interface Notification {
    id: string;
    type: 'review_requested' | 'review_started' | 'review_completed' | 'changes_requested' | 'escalated';
    recipient: string;
    title: string;
    body: string;
    reviewId?: string;
    timestamp: string;
    read: boolean;
}

export class NotificationDispatcher {
    private inboxDir: string;

    constructor() {
        this.inboxDir = path.resolve(process.cwd(), '.dashboard/inbox');
        this.ensureInboxExists();
    }

    private ensureInboxExists() {
        if (!fs.existsSync(this.inboxDir)) {
            fs.mkdirSync(this.inboxDir, { recursive: true });
        }
    }

    async send(notification: Notification): Promise<void> {
        const filename = `${notification.timestamp.replace(/[:.]/g, '-')}_${notification.id}.md`;
        const filepath = path.join(this.inboxDir, notification.recipient);

        if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath, { recursive: true });
        }

        const content = this.formatNotification(notification);
        fs.writeFileSync(path.join(filepath, filename), content);

        console.log(`[Notification] Sent to ${notification.recipient}: ${notification.title}`);
    }

    private formatNotification(notification: Notification): string {
        const emoji = this.getEmoji(notification.type);
        return `# ${emoji} ${notification.title}

**Type**: ${notification.type}
**Time**: ${notification.timestamp}
**Review ID**: ${notification.reviewId || 'N/A'}

---

${notification.body}

---
*Mark as read by deleting this file.*
`;
    }

    private getEmoji(type: string): string {
        switch (type) {
            case 'review_requested': return '📋';
            case 'review_started': return '🔍';
            case 'review_completed': return '✅';
            case 'changes_requested': return '🔄';
            case 'escalated': return '🚨';
            default: return '📬';
        }
    }

    async notifyReviewRequested(reviewerId: string, reviewId: string, title: string, creator: string): Promise<void> {
        await this.send({
            id: `notif_${Date.now()}`,
            type: 'review_requested',
            recipient: reviewerId,
            title: `New Review Request: ${title}`,
            body: `You have been assigned to review work by **${creator}**.\n\nPlease review the pending item in the dashboard.`,
            reviewId,
            timestamp: new Date().toISOString(),
            read: false
        });
    }

    async notifyReviewCompleted(creatorId: string, reviewId: string, status: string, reviewer: string): Promise<void> {
        const type = status === 'approved' ? 'review_completed' : 'changes_requested';
        await this.send({
            id: `notif_${Date.now()}`,
            type,
            recipient: creatorId,
            title: `Review ${status.toUpperCase()}: ${reviewId}`,
            body: `Your review has been **${status}** by **${reviewer}**.`,
            reviewId,
            timestamp: new Date().toISOString(),
            read: false
        });
    }

    async notifyEscalation(reviewId: string, reason: string): Promise<void> {
        await this.send({
            id: `notif_${Date.now()}`,
            type: 'escalated',
            recipient: 'human',
            title: `Review Escalated: ${reviewId}`,
            body: `A review requires your attention.\n\n**Reason**: ${reason}`,
            reviewId,
            timestamp: new Date().toISOString(),
            read: false
        });
    }
}
