import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import GitWorkflow from '../execution/git-workflow';
import RollbackManager from '../execution/rollback';
import SelfAnnealingSystem from '../execution/self-anneal';
import IdeaRefiner from '../execution/idea-refiner';
import DecisionLearner from '../execution/learner';
import * as fs from 'fs';
import * as path from 'path';

describe('Automation Scripts Tests', () => {
    const testDir = path.join(process.cwd(), '.test-temp');

    describe('GitWorkflow', () => {
        it('should get current status', () => {
            const git = new GitWorkflow();
            const status = git.getStatus();

            assert.ok(status.branch);
            assert.strictEqual(typeof status.hasChanges, 'boolean');
        });

        it('should get current commit', () => {
            const git = new GitWorkflow();
            const commit = git.getCurrentCommit();

            assert.ok(commit);
            assert.strictEqual(commit.length, 40); // SHA-1 hash
        });

        it('should get history', () => {
            const git = new GitWorkflow();
            const history = git.getHistory(5);

            assert.ok(Array.isArray(history));
            history.forEach(entry => {
                assert.ok(entry.hash);
                assert.ok(entry.message);
                assert.ok(entry.date);
            });
        });

        it('should check if working directory is clean', () => {
            const git = new GitWorkflow();
            const isClean = git.isClean();

            assert.strictEqual(typeof isClean, 'boolean');
        });
    });

    describe('RollbackManager', () => {
        it('should create rollback points', () => {
            const rollback = new RollbackManager();
            const point = rollback.createRollbackPoint(
                'timepoint',
                'Test snapshot'
            );

            assert.ok(point.id);
            assert.strictEqual(point.type, 'timepoint');
            assert.strictEqual(point.description, 'Test snapshot');
        });

        it('should list rollback points', () => {
            const rollback = new RollbackManager();
            rollback.createRollbackPoint('timepoint', 'Test 1');
            rollback.createRollbackPoint('timepoint', 'Test 2');

            const points = rollback.listRollbackPoints();
            assert.ok(points.length >= 2);
        });
    });

    describe('SelfAnnealingSystem', () => {
        it('should record bugs', () => {
            const system = new SelfAnnealingSystem();
            const bug = system.recordBug(
                'Test bug',
                { file: 'test.ts' }
            );

            assert.ok(bug.id);
            assert.strictEqual(bug.description, 'Test bug');
            assert.strictEqual(bug.context.file, 'test.ts');
        });

        it('should list pending directives', () => {
            const system = new SelfAnnealingSystem();
            const pending = system.listPending();

            assert.ok(Array.isArray(pending));
        });
    });

    describe('IdeaRefiner', () => {
        it('should list ideas', () => {
            const refiner = new IdeaRefiner();
            const ideas = refiner.listIdeas();

            assert.ok(Array.isArray(ideas));
        });

        it('should filter ideas by status', () => {
            const refiner = new IdeaRefiner();
            const refined = refiner.listIdeas('refined');

            assert.ok(Array.isArray(refined));
            refined.forEach(idea => {
                assert.strictEqual(idea.status, 'refined');
            });
        });
    });

    describe('DecisionLearner', () => {
        it('should load decisions', () => {
            const learner = new DecisionLearner();
            const decisions = learner.loadDecisions();

            assert.ok(Array.isArray(decisions));
        });

        it('should analyze patterns', () => {
            const learner = new DecisionLearner();
            const patterns = learner.analyzePatterns();

            assert.ok(Array.isArray(patterns));
            patterns.forEach(pattern => {
                assert.ok(pattern.id);
                assert.ok(pattern.description);
                assert.ok(typeof pattern.confidence === 'number');
            });
        });

        it('should get recommendations', () => {
            const learner = new DecisionLearner();
            const recommendations = learner.getRecommendations('test-type');

            assert.ok(Array.isArray(recommendations));
        });
    });
});
