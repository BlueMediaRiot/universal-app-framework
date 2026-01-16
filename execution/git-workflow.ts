#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Agent-focused Git workflow automation
 * Provides safe, atomic Git operations for autonomous agents
 */

export interface GitStatus {
    branch: string;
    hasChanges: boolean;
    staged: string[];
    unstaged: string[];
    untracked: string[];
}

export interface CommitOptions {
    message: string;
    files?: string[];
    allowEmpty?: boolean;
}

export class GitWorkflow {
    constructor(private cwd: string = process.cwd()) { }

    /**
     * Get current Git status
     */
    getStatus(): GitStatus {
        const branch = execSync('git branch --show-current', {
            cwd: this.cwd,
            encoding: 'utf-8'
        }).trim();

        const statusOutput = execSync('git status --porcelain', {
            cwd: this.cwd,
            encoding: 'utf-8'
        });

        const lines = statusOutput.split('\n').filter(l => l.trim());

        const staged: string[] = [];
        const unstaged: string[] = [];
        const untracked: string[] = [];

        lines.forEach(line => {
            const status = line.substring(0, 2);
            const file = line.substring(3);

            if (status[0] !== ' ' && status[0] !== '?') {
                staged.push(file);
            }
            if (status[1] !== ' ' && status[1] !== '?') {
                unstaged.push(file);
            }
            if (status === '??') {
                untracked.push(file);
            }
        });

        return {
            branch,
            hasChanges: lines.length > 0,
            staged,
            unstaged,
            untracked
        };
    }

    /**
     * Create a safe checkpoint commit
     */
    checkpoint(message: string): string {
        const status = this.getStatus();

        if (!status.hasChanges) {
            console.log('No changes to checkpoint');
            return this.getCurrentCommit();
        }

        // Stage all changes
        execSync('git add -A', { cwd: this.cwd });

        // Commit
        execSync(`git commit -m "${message}"`, { cwd: this.cwd });

        return this.getCurrentCommit();
    }

    /**
     * Create a feature branch
     */
    createBranch(name: string, fromBranch?: string): void {
        if (fromBranch) {
            execSync(`git checkout -b ${name} ${fromBranch}`, { cwd: this.cwd });
        } else {
            execSync(`git checkout -b ${name}`, { cwd: this.cwd });
        }
    }

    /**
     * Switch to a branch
     */
    switchBranch(name: string): void {
        execSync(`git checkout ${name}`, { cwd: this.cwd });
    }

    /**
     * Get current commit hash
     */
    getCurrentCommit(): string {
        return execSync('git rev-parse HEAD', {
            cwd: this.cwd,
            encoding: 'utf-8'
        }).trim();
    }

    /**
     * Get commit history
     */
    getHistory(limit: number = 10): Array<{ hash: string; message: string; date: string }> {
        const output = execSync(`git log -${limit} --format="%H|%s|%ai"`, {
            cwd: this.cwd,
            encoding: 'utf-8'
        });

        return output.split('\n')
            .filter(l => l.trim())
            .map(line => {
                const [hash, message, date] = line.split('|');
                return { hash, message, date };
            });
    }

    /**
     * Create a tag for a release or checkpoint
     */
    createTag(name: string, message?: string): void {
        if (message) {
            execSync(`git tag -a ${name} -m "${message}"`, { cwd: this.cwd });
        } else {
            execSync(`git tag ${name}`, { cwd: this.cwd });
        }
    }

    /**
     * Stash current changes
     */
    stash(message?: string): void {
        if (message) {
            execSync(`git stash push -m "${message}"`, { cwd: this.cwd });
        } else {
            execSync('git stash', { cwd: this.cwd });
        }
    }

    /**
     * Apply stashed changes
     */
    stashPop(): void {
        execSync('git stash pop', { cwd: this.cwd });
    }

    /**
     * Check if working directory is clean
     */
    isClean(): boolean {
        const status = this.getStatus();
        return !status.hasChanges;
    }

    /**
     * Get diff of changes
     */
    getDiff(staged: boolean = false): string {
        const cmd = staged ? 'git diff --cached' : 'git diff';
        return execSync(cmd, { cwd: this.cwd, encoding: 'utf-8' });
    }
}

// CLI
if (require.main === module) {
    const command = process.argv[2];
    const git = new GitWorkflow();

    switch (command) {
        case 'status':
            console.log(JSON.stringify(git.getStatus(), null, 2));
            break;

        case 'checkpoint':
            const message = process.argv[3] || 'Checkpoint';
            const commit = git.checkpoint(message);
            console.log(`Checkpoint created: ${commit}`);
            break;

        case 'history':
            const limit = parseInt(process.argv[3] || '10');
            console.log(JSON.stringify(git.getHistory(limit), null, 2));
            break;

        default:
            console.log('Usage: git-workflow.ts <status|checkpoint|history>');
            process.exit(1);
    }
}

export default GitWorkflow;
