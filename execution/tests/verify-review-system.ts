import * as assert from 'assert';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { DB_PATH } from '../db/setup.js';

console.log('🧪 Review System Verification\n');

const db = new Database(DB_PATH);

async function runTests() {
    try {
        // Test 1: Database Schema
        console.log('Test 1: Verify database schema exists');
        const tables = db.prepare(`
            SELECT name FROM sqlite_master WHERE type='table' AND name IN ('reviews', 'review_revisions', 'review_metrics', 'auto_skip_patterns')
        `).all() as any[];

        assert.strictEqual(tables.length, 4, `Expected 4 tables, found ${tables.length}`);
        console.log('✅ All 4 review tables exist\n');

        // Test 2: Insert a test review
        console.log('Test 2: Create and retrieve a review');
        const testReviewId = `test_review_${Date.now()}`;

        db.prepare(`
            INSERT INTO reviews (id, type, creator_agent, status, title, artifacts_json, context_json)
            VALUES (?, 'create_core', 'core-developer', 'pending', 'Test Review', '{}', '{}')
        `).run(testReviewId);

        const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(testReviewId) as any;
        assert.ok(review, 'Review not found');
        assert.strictEqual(review.status, 'pending', 'Status mismatch');
        console.log('✅ Review creation works\n');

        // Test 3: Update review status
        console.log('Test 3: Update review status');
        db.prepare('UPDATE reviews SET status = ?, reviewer_agent = ? WHERE id = ?')
            .run('approved', 'auditor', testReviewId);

        const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(testReviewId) as any;
        assert.strictEqual(updated.status, 'approved', 'Status not updated');
        assert.strictEqual(updated.reviewer_agent, 'auditor', 'Reviewer not set');
        console.log('✅ Review update works\n');

        // Test 4: Create revision record
        console.log('Test 4: Create revision record');
        db.prepare(`
            INSERT INTO review_revisions (review_id, revision_number, changes_made)
            VALUES (?, 1, 'Fixed error handling')
        `).run(testReviewId);

        const revision = db.prepare('SELECT * FROM review_revisions WHERE review_id = ?').get(testReviewId) as any;
        assert.ok(revision, 'Revision not found');
        assert.strictEqual(revision.revision_number, 1, 'Revision number mismatch');
        console.log('✅ Revision tracking works\n');

        // Test 5: Auto-skip pattern
        console.log('Test 5: Auto-skip pattern tracking');
        const patternId = `create_core_test-agent_${Date.now()}`;

        db.prepare(`
            INSERT INTO auto_skip_patterns (id, action_type, creator_agent, total_attempts, successful_reviews, avg_confidence)
            VALUES (?, 'create_core', 'test-agent', 10, 10, 0.95)
        `).run(patternId);

        const pattern = db.prepare('SELECT * FROM auto_skip_patterns WHERE id = ?').get(patternId) as any;
        assert.ok(pattern, 'Pattern not found');
        assert.ok(pattern.avg_confidence >= 0.9, 'Confidence threshold check failed');
        console.log('✅ Pattern tracking works\n');

        // Test 6: Review policy config
        console.log('Test 6: Verify review policy config exists');
        const policyPath = path.resolve(process.cwd(), '.framework/review-policy.yaml');
        assert.ok(fs.existsSync(policyPath), 'Review policy file not found');
        console.log('✅ Review policy config exists\n');

        // Test 7: Dashboard structure
        console.log('Test 7: Verify dashboard structure');
        const dashboardPath = path.resolve(process.cwd(), '.dashboard/reviews');
        const pendingPath = path.join(dashboardPath, 'pending');
        const completedPath = path.join(dashboardPath, 'completed');
        const escalatedPath = path.join(dashboardPath, 'escalated');

        assert.ok(fs.existsSync(pendingPath), 'Pending folder missing');
        assert.ok(fs.existsSync(completedPath), 'Completed folder missing');
        assert.ok(fs.existsSync(escalatedPath), 'Escalated folder missing');
        console.log('✅ Dashboard structure exists\n');

        // Cleanup test data
        console.log('Cleaning up test data...');
        db.prepare('DELETE FROM review_revisions WHERE review_id = ?').run(testReviewId);
        db.prepare('DELETE FROM reviews WHERE id = ?').run(testReviewId);
        db.prepare('DELETE FROM auto_skip_patterns WHERE id = ?').run(patternId);
        console.log('✅ Test data cleaned up\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Review System Verification Complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nAll review system components are functional:\n');
        console.log('  • Database schema: ✅ All 4 tables');
        console.log('  • Review CRUD operations: ✅ Working');
        console.log('  • Revision tracking: ✅ Working');
        console.log('  • Pattern tracking: ✅ Working');
        console.log('  • Configuration: ✅ Loaded');
        console.log('  • Dashboard: ✅ Structure exists');

        process.exit(0);
    } catch (error) {
        console.error('❌ Review System Verification Failed:', error);
        process.exit(1);
    }
}

runTests();
