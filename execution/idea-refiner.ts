#!/usr/bin/env ts-node

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interactive idea refinement system
 * Helps refine vague ideas into concrete, actionable specifications
 */

export interface Idea {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    category: 'feature' | 'core' | 'app' | 'improvement' | 'other';
    status: 'draft' | 'refined' | 'approved' | 'implemented';
    refinement?: {
        problem: string;
        solution: string;
        alternatives: string[];
        requirements: string[];
        acceptance: string[];
        effort: 'low' | 'medium' | 'high';
        impact: 'low' | 'medium' | 'high';
    };
}

export class IdeaRefiner {
    private ideasDir: string;
    private rl: readline.Interface;

    constructor(private cwd: string = process.cwd()) {
        this.ideasDir = path.join(cwd, '.framework', 'ideas');
        fs.mkdirSync(this.ideasDir, { recursive: true });

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Ask a question and get user input
     */
    private async ask(question: string): Promise<string> {
        return new Promise(resolve => {
            this.rl.question(question, answer => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Start interactive refinement session
     */
    async refine(): Promise<Idea> {
        console.log('\n🎯 Idea Refinement Session\n');
        console.log('Let\'s turn your idea into a concrete specification.\n');

        // Basic info
        const title = await this.ask('What\'s the idea? (brief title): ');
        const description = await this.ask('Describe it in one sentence: ');
        const categoryInput = await this.ask('Category (feature/core/app/improvement/other): ');
        const category = (categoryInput || 'other') as Idea['category'];

        const idea: Idea = {
            id: `idea-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title,
            description,
            category,
            status: 'draft'
        };

        console.log('\n📝 Now let\'s refine it...\n');

        // Refinement questions
        const problem = await this.ask('What problem does this solve? ');
        const solution = await this.ask('How does it solve the problem? ');

        const alternatives: string[] = [];
        let addMore = true;
        while (addMore) {
            const alt = await this.ask('Any alternative approaches? (or press Enter to skip): ');
            if (alt) {
                alternatives.push(alt);
            } else {
                addMore = false;
            }
        }

        const requirements: string[] = [];
        console.log('\nList requirements (one per line, empty line to finish):');
        addMore = true;
        while (addMore) {
            const req = await this.ask('  - ');
            if (req) {
                requirements.push(req);
            } else {
                addMore = false;
            }
        }

        const acceptance: string[] = [];
        console.log('\nList acceptance criteria (one per line, empty line to finish):');
        addMore = true;
        while (addMore) {
            const acc = await this.ask('  - ');
            if (acc) {
                acceptance.push(acc);
            } else {
                addMore = false;
            }
        }

        const effortInput = await this.ask('Effort estimate (low/medium/high): ');
        const effort = (effortInput || 'medium') as 'low' | 'medium' | 'high';

        const impactInput = await this.ask('Impact estimate (low/medium/high): ');
        const impact = (impactInput || 'medium') as 'low' | 'medium' | 'high';

        idea.refinement = {
            problem,
            solution,
            alternatives,
            requirements,
            acceptance,
            effort,
            impact
        };

        idea.status = 'refined';

        // Save idea
        const ideaPath = path.join(this.ideasDir, `${idea.id}.json`);
        fs.writeFileSync(ideaPath, JSON.stringify(idea, null, 2));

        console.log(`\n✅ Idea refined and saved: ${idea.id}\n`);

        this.rl.close();
        return idea;
    }

    /**
     * List all ideas
     */
    listIdeas(status?: Idea['status']): Idea[] {
        const files = fs.readdirSync(this.ideasDir)
            .filter(f => f.endsWith('.json'));

        const ideas = files.map(file => {
            const content = fs.readFileSync(path.join(this.ideasDir, file), 'utf-8');
            return JSON.parse(content) as Idea;
        });

        if (status) {
            return ideas.filter(i => i.status === status);
        }

        return ideas;
    }

    /**
     * Get a specific idea
     */
    getIdea(id: string): Idea | null {
        const ideaPath = path.join(this.ideasDir, `${id}.json`);

        if (!fs.existsSync(ideaPath)) {
            return null;
        }

        const content = fs.readFileSync(ideaPath, 'utf-8');
        return JSON.parse(content);
    }

    /**
     * Update idea status
     */
    updateStatus(id: string, status: Idea['status']): void {
        const idea = this.getIdea(id);
        if (!idea) {
            throw new Error(`Idea not found: ${id}`);
        }

        idea.status = status;
        const ideaPath = path.join(this.ideasDir, `${id}.json`);
        fs.writeFileSync(ideaPath, JSON.stringify(idea, null, 2));
    }
}

// CLI
if (require.main === module) {
    const command = process.argv[2];
    const refiner = new IdeaRefiner();

    (async () => {
        switch (command) {
            case 'refine':
                await refiner.refine();
                break;

            case 'list':
                const status = process.argv[3] as Idea['status'] | undefined;
                const ideas = refiner.listIdeas(status);
                console.log(JSON.stringify(ideas, null, 2));
                break;

            case 'show':
                const id = process.argv[3];
                if (!id) {
                    console.error('Usage: idea-refiner.ts show <idea-id>');
                    process.exit(1);
                }
                const idea = refiner.getIdea(id);
                console.log(JSON.stringify(idea, null, 2));
                break;

            default:
                console.log('Usage: idea-refiner.ts <refine|list|show>');
                process.exit(1);
        }
    })();
}

export default IdeaRefiner;
