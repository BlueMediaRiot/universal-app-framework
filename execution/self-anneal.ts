#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import GitWorkflow from './git-workflow';

/**
 * Self-annealing system: When bugs are fixed, update directives to prevent recurrence
 */

export interface BugReport {
    id: string;
    timestamp: string;
    description: string;
    stackTrace?: string;
    context: {
        file?: string;
        function?: string;
        core?: string;
        app?: string;
    };
    fix?: {
        commit: string;
        description: string;
        filesChanged: string[];
    };
}

export interface DirectiveUpdate {
    id: string;
    timestamp: string;
    bugId: string;
    directive: string;
    rationale: string;
    location: string; // Where to add the directive (e.g., '.framework/directives/coding.md')
}

export class SelfAnnealingSystem {
    private bugsDir: string;
    private directivesDir: string;
    private git: GitWorkflow;

    constructor(private cwd: string = process.cwd()) {
        this.bugsDir = path.join(cwd, '.framework', 'bugs');
        this.directivesDir = path.join(cwd, '.framework', 'directives');
        this.git = new GitWorkflow(cwd);

        fs.mkdirSync(this.bugsDir, { recursive: true });
        fs.mkdirSync(this.directivesDir, { recursive: true });
    }

    /**
     * Record a bug
     */
    recordBug(description: string, context: BugReport['context'], stackTrace?: string): BugReport {
        const bug: BugReport = {
            id: `bug-${Date.now()}`,
            timestamp: new Date().toISOString(),
            description,
            stackTrace,
            context
        };

        const bugPath = path.join(this.bugsDir, `${bug.id}.json`);
        fs.writeFileSync(bugPath, JSON.stringify(bug, null, 2));

        console.log(`Bug recorded: ${bug.id}`);
        return bug;
    }

    /**
     * Mark bug as fixed and record the fix
     */
    markFixed(bugId: string, fixDescription: string): void {
        const bugPath = path.join(this.bugsDir, `${bugId}.json`);

        if (!fs.existsSync(bugPath)) {
            throw new Error(`Bug not found: ${bugId}`);
        }

        const bug: BugReport = JSON.parse(fs.readFileSync(bugPath, 'utf-8'));

        // Get diff of changes
        const diff = this.git.getDiff(true);
        const filesChanged = this._extractFilesFromDiff(diff);

        bug.fix = {
            commit: this.git.getCurrentCommit(),
            description: fixDescription,
            filesChanged
        };

        fs.writeFileSync(bugPath, JSON.stringify(bug, null, 2));
        console.log(`Bug marked as fixed: ${bugId}`);

        // Trigger directive generation
        this._suggestDirective(bug);
    }

    /**
     * Suggest a directive based on the bug fix
     */
    private _suggestDirective(bug: BugReport): void {
        if (!bug.fix) return;

        console.log('\n🤖 Analyzing bug fix to suggest directive...\n');

        // Simple heuristics for directive suggestions
        let directive = '';
        let location = '.framework/directives/coding.md';

        if (bug.description.toLowerCase().includes('null') ||
            bug.description.toLowerCase().includes('undefined')) {
            directive = `- Always check for null/undefined before accessing properties in ${bug.context.file || 'files'}`;
        } else if (bug.description.toLowerCase().includes('type')) {
            directive = `- Ensure proper TypeScript types are used in ${bug.context.core || 'cores'}`;
        } else if (bug.description.toLowerCase().includes('async')) {
            directive = `- Always await async functions and handle promise rejections`;
        } else {
            directive = `- Avoid patterns that led to: ${bug.description}`;
        }

        const update: DirectiveUpdate = {
            id: `directive-${Date.now()}`,
            timestamp: new Date().toISOString(),
            bugId: bug.id,
            directive,
            rationale: `Prevents recurrence of bug: ${bug.description}`,
            location
        };

        // Save directive update suggestion
        const updatePath = path.join(this.directivesDir, 'pending', `${update.id}.json`);
        fs.mkdirSync(path.dirname(updatePath), { recursive: true });
        fs.writeFileSync(updatePath, JSON.stringify(update, null, 2));

        console.log(`📝 Directive suggestion saved: ${update.id}`);
        console.log(`   Location: ${location}`);
        console.log(`   Directive: ${directive}`);
        console.log(`\nReview and apply with: self-anneal.ts apply ${update.id}`);
    }

    /**
     * Apply a pending directive update
     */
    applyDirective(updateId: string): void {
        const updatePath = path.join(this.directivesDir, 'pending', `${updateId}.json`);

        if (!fs.existsSync(updatePath)) {
            throw new Error(`Directive update not found: ${updateId}`);
        }

        const update: DirectiveUpdate = JSON.parse(fs.readFileSync(updatePath, 'utf-8'));
        const directivePath = path.join(this.cwd, update.location);

        // Append directive to file
        let content = '';
        if (fs.existsSync(directivePath)) {
            content = fs.readFileSync(directivePath, 'utf-8');
        } else {
            content = `# Coding Directives\n\n`;
        }

        content += `\n## ${new Date().toISOString().split('T')[0]}\n`;
        content += `${update.directive}\n`;
        content += `_Rationale: ${update.rationale}_\n`;

        fs.writeFileSync(directivePath, content);

        // Move to applied
        const appliedPath = path.join(this.directivesDir, 'applied', `${updateId}.json`);
        fs.mkdirSync(path.dirname(appliedPath), { recursive: true });
        fs.renameSync(updatePath, appliedPath);

        console.log(`✅ Directive applied to ${update.location}`);
    }

    /**
     * List pending directive updates
     */
    listPending(): DirectiveUpdate[] {
        const pendingDir = path.join(this.directivesDir, 'pending');

        if (!fs.existsSync(pendingDir)) {
            return [];
        }

        return fs.readdirSync(pendingDir)
            .filter(f => f.endsWith('.json'))
            .map(file => {
                const content = fs.readFileSync(path.join(pendingDir, file), 'utf-8');
                return JSON.parse(content);
            });
    }

    private _extractFilesFromDiff(diff: string): string[] {
        const files: string[] = [];
        const lines = diff.split('\n');

        for (const line of lines) {
            if (line.startsWith('diff --git')) {
                const match = line.match(/b\/(.+)$/);
                if (match) {
                    files.push(match[1]);
                }
            }
        }

        return files;
    }
}

// CLI
if (require.main === module) {
    const command = process.argv[2];
    const system = new SelfAnnealingSystem();

    switch (command) {
        case 'record':
            const description = process.argv[3];
            if (!description) {
                console.error('Usage: self-anneal.ts record "<description>"');
                process.exit(1);
            }
            system.recordBug(description, {});
            break;

        case 'fixed':
            const bugId = process.argv[3];
            const fixDesc = process.argv[4];
            if (!bugId || !fixDesc) {
                console.error('Usage: self-anneal.ts fixed <bug-id> "<fix-description>"');
                process.exit(1);
            }
            system.markFixed(bugId, fixDesc);
            break;

        case 'pending':
            const pending = system.listPending();
            console.log(JSON.stringify(pending, null, 2));
            break;

        case 'apply':
            const updateId = process.argv[3];
            if (!updateId) {
                console.error('Usage: self-anneal.ts apply <update-id>');
                process.exit(1);
            }
            system.applyDirective(updateId);
            break;

        default:
            console.log('Usage: self-anneal.ts <record|fixed|pending|apply>');
            process.exit(1);
    }
}

export default SelfAnnealingSystem;
