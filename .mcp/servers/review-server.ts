
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ReviewCoordinator } from './review-coordinator.js';
import { ReviewPolicy } from './review-policy.js';
import { CriteriaValidator } from './criteria-validator.js';
import { LearningEngine } from './learning-engine.js';


const server = new Server(
    {
        name: 'review-server',
        version: '1.0.0'
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

const coordinator = new ReviewCoordinator();
const policy = new ReviewPolicy();
const learner = new LearningEngine();
const validator = new CriteriaValidator();

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'check_review_required',
                description: 'Check if a specific action requires a peer review',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string' },
                        context: { type: 'object' }
                    },
                    required: ['action']
                }
            },
            {
                name: 'request_review',
                description: 'Submit a new artifact for peer review',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { type: 'string' },
                        creator: { type: 'string' },
                        title: { type: 'string' },
                        artifacts: { type: 'object' },
                        context: { type: 'object' },
                        questions: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['id', 'type', 'creator', 'title']
                }
            },
            {
                name: 'submit_review',
                description: 'Submit feedback and decision for a review',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reviewId: { type: 'string' },
                        reviewer: { type: 'string' },
                        status: { type: 'string', enum: ['approved', 'changes_requested', 'rejected'] },
                        feedback: { type: 'object' },
                        checklist: { type: 'object' },
                        confidence: { type: 'number' }
                    },
                    required: ['reviewId', 'reviewer', 'status']
                }
            },
            {
                name: 'get_review',
                description: 'Get the status and details of a review',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reviewId: { type: 'string' }
                    },
                    required: ['reviewId']
                }
            },
            {
                name: 'start_review',
                description: 'Mark a review as in-progress (reviewer has begun)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reviewId: { type: 'string' },
                        reviewer: { type: 'string' }
                    },
                    required: ['reviewId', 'reviewer']
                }
            },
            {
                name: 'validate_criteria',
                description: 'Validate artifacts against review criteria',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reviewType: { type: 'string' },
                        artifacts: { type: 'object' }
                    },
                    required: ['reviewType', 'artifacts']
                }
            },
            {
                name: 'request_re_review',
                description: 'Request re-review after making changes',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reviewId: { type: 'string' },
                        revisionNumber: { type: 'number' },
                        changesMade: { type: 'string' },
                        artifacts: { type: 'object' }
                    },
                    required: ['reviewId', 'revisionNumber', 'changesMade']
                }
            },
            {
                name: 'escalate_review',
                description: 'Escalate a review to human for decision',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reviewId: { type: 'string' },
                        reason: { type: 'string', enum: ['creator_disagrees', 'too_many_revisions', 'timeout', 'confidence_gap', 'critical_uncertainty'] },
                        creatorArgument: { type: 'string' }
                    },
                    required: ['reviewId', 'reason']
                }
            },
            {
                name: 'get_review_metrics',
                description: 'Get review system metrics and statistics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        period: { type: 'string', enum: ['day', 'week', 'month'] },
                        agent: { type: 'string' },
                        type: { type: 'string' }
                    }
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === 'check_review_required') {
            const { action, context } = request.params.arguments as any;
            const required = await policy.shouldRequireReview(action, context || {});

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(required)
                }]
            };
        }

        if (request.params.name === 'request_review') {
            const reviewRequest = request.params.arguments as any;
            const validation = await coordinator.validateRequest(reviewRequest);

            if (!validation.valid) {
                return {
                    isError: true,
                    content: [{ type: 'text', text: `Invalid review request: ${validation.errors.join(', ')}` }]
                };
            }

            const review = await coordinator.createReview(reviewRequest);
            const reviewer = await policy.assignReviewer({
                creator: reviewRequest.creator,
                type: reviewRequest.type
            });

            review.reviewer = reviewer;
            await coordinator.saveReview(review);
            await coordinator.notifyReviewer(review);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        id: review.id,
                        reviewer: reviewer,
                        status: 'pending',
                        message: 'Review requested successfully'
                    })
                }]
            };
        }

        if (request.params.name === 'submit_review') {
            const { reviewId, reviewer, status, feedback, checklist, confidence } = request.params.arguments as any;

            const review = await coordinator.getReview(reviewId);
            if (!review) {
                throw new Error(`Review not found: ${reviewId}`);
            }

            // Validate that the submitting reviewer is the assigned reviewer
            if (review.reviewer && review.reviewer !== reviewer) {
                throw new Error(`Unauthorized: Only ${review.reviewer} can submit this review`);
            }

            review.status = status;
            review.feedback = feedback;
            review.checklist = checklist;
            review.confidence = confidence;
            review.completed_at = new Date().toISOString();

            // Calculate time taken if started_at exists
            if (review.started_at) {
                const start = new Date(review.started_at).getTime();
                const end = new Date(review.completed_at).getTime();
                review.time_to_review_ms = end - start;
            }

            await coordinator.saveReview(review);
            await coordinator.notifyCreator(review);
            await learner.recordReview(review);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        review_id: reviewId,
                        status: status
                    })
                }]
            };
        }

        if (request.params.name === 'get_review') {
            const { reviewId } = request.params.arguments as any;
            const review = await coordinator.getReview(reviewId);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(review)
                }]
            };
        }

        if (request.params.name === 'start_review') {
            const { reviewId, reviewer } = request.params.arguments as any;
            const review = await coordinator.getReview(reviewId);

            if (!review) {
                throw new Error(`Review not found: ${reviewId}`);
            }

            review.status = 'in_progress';
            review.started_at = new Date().toISOString();
            review.reviewer = reviewer;

            await coordinator.saveReview(review);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        review_id: reviewId,
                        status: 'in_progress',
                        started_at: review.started_at
                    })
                }]
            };
        }

        if (request.params.name === 'validate_criteria') {
            const { reviewType, artifacts } = request.params.arguments as any;
            const validationResult = await validator.validate(reviewType, artifacts);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(validationResult)
                }]
            };
        }

        if (request.params.name === 'request_re_review') {
            const { reviewId, revisionNumber, changesMade, artifacts } = request.params.arguments as any;
            const review = await coordinator.getReview(reviewId);

            if (!review) {
                throw new Error(`Review not found: ${reviewId}`);
            }

            review.status = 'pending_re_review';
            review.revision_count = revisionNumber;

            // Create revision record
            await coordinator.createRevision({
                review_id: reviewId,
                revision_number: revisionNumber,
                changes_made: changesMade
            });
            if (artifacts) {
                review.artifacts = artifacts;
            }
            review.started_at = null;
            review.completed_at = null;

            await coordinator.saveReview(review);
            await coordinator.notifyReviewer(review, { is_revision: true });

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        review_id: reviewId,
                        revision_number: revisionNumber,
                        status: 'pending'
                    })
                }]
            };
        }

        if (request.params.name === 'escalate_review') {
            const { reviewId, reason, creatorArgument } = request.params.arguments as any;
            const review = await coordinator.getReview(reviewId);

            if (!review) {
                throw new Error(`Review not found: ${reviewId}`);
            }

            review.status = 'escalated';
            review.escalation_reason = reason;
            if (creatorArgument) {
                review.creator_argument = creatorArgument;
            }

            await coordinator.saveReview(review);
            await coordinator.escalateToHuman(review);

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        review_id: reviewId,
                        status: 'escalated',
                        reason: reason
                    })
                }]
            };
        }

        if (request.params.name === 'get_review_metrics') {
            const { period, agent, type } = request.params.arguments as any;
            const metrics = await coordinator.getMetrics({ period, agent, type });

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(metrics)
                }]
            };
        }

        throw new Error(`Unknown tool: ${request.params.name}`);
    } catch (error) {
        return {
            isError: true,
            content: [{
                type: 'text',
                text: `Error executing tool ${request.params.name}: ${error instanceof Error ? error.message : String(error)}`
            }]
        };
    }
});

const transport = new StdioServerTransport();
server.connect(transport);
