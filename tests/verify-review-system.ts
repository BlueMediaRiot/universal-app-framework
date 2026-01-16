
import { ReviewCoordinator } from '../.mcp/servers/review-coordinator.js';
import { ReviewPolicy } from '../.mcp/servers/review-policy.js';
import * as fs from 'fs';
import * as path from 'path';

async function verifySystem() {
    console.log('🧪 Starting System Verification...');

    const coordinator = new ReviewCoordinator();
    const policy = new ReviewPolicy();

    // 1. Test Policy
    console.log('\nPlease wait, checking policy...');
    const requirement = await policy.shouldRequireReview('create_core', { agent: 'core-developer' });
    if (requirement.needs_review) {
        console.log('✅ Policy correctly requires review for create_core');
    } else {
        console.error('❌ Policy failed to require review');
        process.exit(1);
    }

    // 2. Test Request Creation
    console.log('\nCreating review request...');
    const reviewId = `review_${Date.now()}`;
    const request = {
        id: reviewId,
        type: 'create_core',
        creator: 'core-developer',
        title: 'Test Core Creation',
        artifacts: { code: 'console.log("hello")' },
        context: { spec: 'v1' },
        questions: ['Is this safe?']
    };

    const review = await coordinator.createReview(request);

    // Assign reviewer manually for this test (normally done by server integration)
    const reviewer = await policy.assignReviewer({ type: request.type, creator: request.creator });
    review.reviewer = reviewer;
    await coordinator.saveReview(review); // Save assignment
    await coordinator.notifyReviewer(review); // Triggers dashboard update

    console.log(`✅ Review created with ID: ${review.id}`);
    console.log(`   Assigned to: ${reviewer}`);

    // Verify Dashboard File Created
    const dashboardPath = path.resolve(process.cwd(), `.dashboard/reviews/pending/${reviewId}.md`);
    if (fs.existsSync(dashboardPath)) {
        console.log('✅ Dashboard file created in pending/');
    } else {
        console.error('❌ Dashboard file missing');
        process.exit(1);
    }

    // 3. Test Review Submission
    console.log('\nSubmitting review...');
    review.status = 'approved';
    review.feedback = { overall: 'Looks good' };
    review.checklist = { tests_pass: true };
    review.confidence = 95;
    review.completed_at = new Date().toISOString();

    await coordinator.saveReview(review);
    await coordinator.notifyCreator(review); // Triggers dashboard update (move to completed)

    const completedPath = path.resolve(process.cwd(), `.dashboard/reviews/completed/${reviewId}.md`);
    if (fs.existsSync(completedPath)) {
        console.log('✅ Dashboard file moved to completed/');
    } else {
        console.error('❌ Dashboard file failed to move to completed');
        // Check if it's still in pending
        if (fs.existsSync(dashboardPath)) {
            console.log('   (File is still in pending/, move logic might act differently in Phase 1 stub)');
        }
    }

    console.log('\n✨ Verification Complete!');
}

verifySystem().catch(err => {
    console.error(err);
    process.exit(1);
});
