import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface CriterionResult {
    key: string;
    description: string;
    passed: boolean;
    reason?: string;
}

export interface ValidationResult {
    passed: boolean;
    requiredResults: CriterionResult[];
    optionalResults: CriterionResult[];
    overallConfidence: number;
}

export class CriteriaValidator {
    private config: any;

    constructor() {
        this.loadConfig();
    }

    private loadConfig() {
        try {
            const configPath = path.resolve(process.cwd(), '.framework/review-policy.yaml');
            if (fs.existsSync(configPath)) {
                this.config = yaml.load(fs.readFileSync(configPath, 'utf8'));
            } else {
                this.config = { criteria: {} };
            }
        } catch (error) {
            console.error('Error loading review policy:', error);
            this.config = { criteria: {} };
        }
    }

    async validate(reviewType: string, artifacts: any): Promise<ValidationResult> {
        const criteria = this.config?.criteria?.[reviewType] || {};
        const requiredCriteria = criteria.required || {};
        const optionalCriteria = criteria.optional || {};

        const requiredResults: CriterionResult[] = [];
        const optionalResults: CriterionResult[] = [];

        // Validate required criteria
        for (const [key, description] of Object.entries(requiredCriteria)) {
            const result = await this.checkCriterion(key, description as string, artifacts);
            requiredResults.push(result);
        }

        // Validate optional criteria
        for (const [key, description] of Object.entries(optionalCriteria)) {
            const result = await this.checkCriterion(key, description as string, artifacts);
            optionalResults.push(result);
        }

        const allRequiredPassed = requiredResults.every(r => r.passed);
        const passedCount = requiredResults.filter(r => r.passed).length + optionalResults.filter(r => r.passed).length;
        const totalCount = requiredResults.length + optionalResults.length;
        const overallConfidence = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

        return {
            passed: allRequiredPassed,
            requiredResults,
            optionalResults,
            overallConfidence
        };
    }

    private async checkCriterion(key: string, description: string, artifacts: any): Promise<CriterionResult> {
        // Heuristic checks based on criterion key
        let passed = false;
        let reason = '';
        const code = artifacts.code || '';
        const tests = artifacts.tests || '';
        const docs = artifacts.documentation || '';

        switch (key) {
            // Core Creation Criteria
            case 'has_comprehensive_tests':
                const testCount = (tests.match(/it\(|test\(|describe\(/g) || []).length;
                passed = tests.length > 50 && testCount >= 3;
                reason = passed ? `${testCount} test cases found` : `Insufficient tests (${testCount} found, need 3+)`;
                break;

            case 'documentation_complete':
                const hasJsDoc = code.includes('/**') && code.includes('*/');
                const hasDescription = docs.length > 20;
                passed = hasJsDoc || hasDescription;
                reason = passed ? 'Documentation present' : 'Missing JSDoc or documentation';
                break;

            case 'proper_error_handling':
                const hasTryCatch = code.includes('try') && code.includes('catch');
                const hasThrow = code.includes('throw');
                passed = hasTryCatch || hasThrow;
                reason = passed ? 'Error handling patterns found' : 'No try/catch or throw statements';
                break;

            case 'follows_naming_conventions':
                const hasMetadata = code.includes('metadata') && code.includes('name:');
                const hasCorePrefix = code.includes("'core-") || code.includes('"core-');
                passed = hasMetadata || hasCorePrefix || !code;
                reason = passed ? 'Naming conventions followed' : 'Missing core- prefix or metadata';
                break;

            case 'size_appropriate':
                const lines = code.split('\n').length;
                passed = lines < 300;
                reason = passed ? `${lines} lines (under 300)` : `${lines} lines exceeds 300 limit`;
                break;

            case 'correct_interface_design':
                const hasExport = code.includes('export');
                const hasAsync = code.includes('async');
                passed = hasExport && (code.includes('interface') || code.includes('type ') || hasAsync);
                reason = passed ? 'Proper exports and types found' : 'Missing exports or type definitions';
                break;

            case 'single_responsibility':
                const classCount = (code.match(/class\s+\w+/g) || []).length;
                const exportCount = (code.match(/export\s+(const|function|class)/g) || []).length;
                passed = classCount <= 2 && exportCount <= 5;
                reason = passed ? 'Single responsibility maintained' : 'Too many classes/exports suggests multiple responsibilities';
                break;

            case 'no_breaking_changes':
                // Can't easily detect without version comparison
                passed = true;
                reason = 'Manual verification recommended';
                break;

            // App Creation Criteria
            case 'uses_right_cores':
                const hasCoreLoader = code.includes('CoreLoader') || code.includes('loadCores');
                passed = hasCoreLoader;
                reason = passed ? 'CoreLoader usage detected' : 'CoreLoader not used';
                break;

            case 'proper_configuration':
                const hasConfig = code.includes('config') || code.includes('Config');
                passed = hasConfig;
                reason = passed ? 'Configuration handling found' : 'No configuration handling found';
                break;

            case 'has_integration_tests':
                const hasIntegration = tests.includes('integration') || tests.includes('loadCores');
                passed = hasIntegration || tests.length > 100;
                reason = passed ? 'Integration tests found' : 'No integration tests detected';
                break;

            case 'no_duplicate_logic':
                // Heuristic: check for common reimplementations
                const hasHttpClient = code.includes('fetch(') || code.includes('axios');
                const hasCoreReference = code.includes('core-');
                passed = !hasHttpClient || hasCoreReference;
                reason = passed ? 'No obvious duplicated logic' : 'May be duplicating core functionality';
                break;

            case 'proper_lifecycle':
                const hasInit = code.includes('init') || code.includes('setup');
                const hasCleanup = code.includes('cleanup') || code.includes('dispose');
                passed = hasInit;
                reason = passed ? (hasCleanup ? 'Proper init/cleanup' : 'Has init but no cleanup') : 'Missing lifecycle methods';
                break;

            // Architecture Decision Criteria
            case 'problem_clearly_stated':
                passed = artifacts.plan?.includes('Problem') || artifacts.plan?.includes('problem');
                reason = passed ? 'Problem statement found' : 'Problem statement missing';
                break;

            case 'options_evaluated':
                const optionCount = (artifacts.plan?.match(/option|alternative|approach/gi) || []).length;
                passed = optionCount >= 2;
                reason = passed ? `${optionCount} options mentioned` : 'Less than 2 options evaluated';
                break;

            case 'tradeoffs_documented':
                const hasProsCons = artifacts.plan?.includes('pros') || artifacts.plan?.includes('cons') || artifacts.plan?.includes('tradeoff');
                passed = hasProsCons || false;
                reason = passed ? 'Tradeoffs documented' : 'No tradeoffs documentation found';
                break;

            case 'recommendation_justified':
                const hasRecommendation = artifacts.plan?.includes('recommend') || artifacts.plan?.includes('chosen');
                passed = hasRecommendation || false;
                reason = passed ? 'Recommendation provided' : 'No clear recommendation';
                break;

            case 'impacts_identified':
                const hasImpacts = artifacts.plan?.includes('impact') || artifacts.plan?.includes('breaking');
                passed = hasImpacts || false;
                reason = passed ? 'Impacts identified' : 'No impact analysis found';
                break;

            default:
                // Default: pass with low confidence
                passed = true;
                reason = 'Auto-passed (manual review recommended)';
        }

        return { key, description, passed, reason };
    }
}
