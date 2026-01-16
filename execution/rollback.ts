#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import GitWorkflow from './git-workflow';

/**
 * Rollback system for reverting to previous states
 */

export interface RollbackPoint {
    type: 'commit' | 'core' | 'app' | 'timepoint';
    id: string;
    timestamp: string;
    description: string;
    metadata?: any;
}

export class RollbackManager {
    private git: GitWorkflow;
    private rollbackDir: string;

    constructor(private cwd: string = process.cwd()) {
        this.git = new GitWorkflow(cwd);
        this.rollbackDir = path.join(cwd, '.framework', 'rollback');

        if (!fs.existsSync(this.rollbackDir)) {
            fs.mkdirSync(this.rollbackDir, { recursive: true });
        }
    }

    /**
     * Create a rollback point
     */
    createRollbackPoint(type: RollbackPoint['type'], description: string, metadata?: any): RollbackPoint {
        const commit = this.git.getCurrentCommit();
        const point: RollbackPoint = {
            type,
            id: commit,
            timestamp: new Date().toISOString(),
            description,
            metadata
        };

        // Save rollback point
        const pointPath = path.join(this.rollbackDir, `${type}-${Date.now()}.json`);
        fs.writeFileSync(pointPath, JSON.stringify(point, null, 2));

        return point;
    }

    /**
     * List all rollback points
     */
    listRollbackPoints(): RollbackPoint[] {
        if (!fs.existsSync(this.rollbackDir)) {
            return [];
        }

        const files = fs.readdirSync(this.rollbackDir)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();

        return files.map(file => {
            const content = fs.readFileSync(path.join(this.rollbackDir, file), 'utf-8');
            return JSON.parse(content);
        });
    }

    /**
     * Rollback to a specific commit
     */
    rollbackToCommit(commitHash: string, hard: boolean = false): void {
        if (!this.git.isClean() && !hard) {
            throw new Error('Working directory has uncommitted changes. Stash or commit them first.');
        }

        if (hard) {
            execSync(`git reset --hard ${commitHash}`, { cwd: this.cwd });
        } else {
            execSync(`git reset --soft ${commitHash}`, { cwd: this.cwd });
        }

        console.log(`Rolled back to commit: ${commitHash}`);
    }

    /**
     * Rollback to when a core was added
     */
    rollbackCore(coreName: string): void {
        const points = this.listRollbackPoints()
            .filter(p => p.type === 'core' && p.metadata?.coreName === coreName);

        if (points.length === 0) {
            throw new Error(`No rollback point found for core: ${coreName}`);
        }

        const point = points[0];
        this.rollbackToCommit(point.id);
    }

    /**
     * Rollback to when an app was created
     */
    rollbackApp(appName: string): void {
        const points = this.listRollbackPoints()
            .filter(p => p.type === 'app' && p.metadata?.appName === appName);

        if (points.length === 0) {
            throw new Error(`No rollback point found for app: ${appName}`);
        }

        const point = points[0];
        this.rollbackToCommit(point.id);
    }

    /**
     * Rollback to a specific timepoint
     */
    rollbackToTime(timestamp: string): void {
        const points = this.listRollbackPoints()
            .filter(p => p.timestamp <= timestamp)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        if (points.length === 0) {
            throw new Error(`No rollback point found before: ${timestamp}`);
        }

        const point = points[0];
        this.rollbackToCommit(point.id);
    }

    /**
     * Create a snapshot of current state
     */
    snapshot(description: string): RollbackPoint {
        // Ensure everything is committed
        if (!this.git.isClean()) {
            this.git.checkpoint(`Snapshot: ${description}`);
        }

        return this.createRollbackPoint('timepoint', description);
    }
}

// CLI
if (require.main === module) {
    const command = process.argv[2];
    const rollback = new RollbackManager();

    switch (command) {
        case 'list':
            const points = rollback.listRollbackPoints();
            console.log(JSON.stringify(points, null, 2));
            break;

        case 'snapshot':
            const description = process.argv[3] || 'Manual snapshot';
            const point = rollback.snapshot(description);
            console.log(`Snapshot created: ${point.id}`);
            break;

        case 'rollback':
            const commitHash = process.argv[3];
            if (!commitHash) {
                console.error('Usage: rollback.ts rollback <commit-hash>');
                process.exit(1);
            }
            rollback.rollbackToCommit(commitHash);
            break;

        default:
            console.log('Usage: rollback.ts <list|snapshot|rollback>');
            process.exit(1);
    }
}

export default RollbackManager;
