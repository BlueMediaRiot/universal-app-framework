import type { CoreDefinition, AppContext } from '@universal/core-system';

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface AIConfig {
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
}

// Use closure to maintain state
let config: AIConfig | null = null;
let apiKey: string | null = null;

/**
 * Standard AI API interface for the framework.
 * Provides a unified interface for LLM calls across all cores.
 */
const CoreAiApi: CoreDefinition = {
    metadata: {
        name: 'core-ai-api',
        version: '0.1.0',
        description: 'Standard AI API interface for framework cores',
        dependencies: [],
    },

    async setup(context: AppContext): Promise<void> {
        // Load configuration
        config = {
            provider: context.config.get('ai.provider', 'openai'),
            model: context.config.get('ai.model', 'gpt-4'),
            temperature: context.config.get('ai.temperature', 0.7),
            maxTokens: context.config.get('ai.maxTokens', 1000)
        };

        // Load API key from secrets
        if ((context as any).secrets) {
            try {
                apiKey = await (context as any).secrets.require('OPENAI_API_KEY');
            } catch {
                console.warn('AI API key not found in secrets');
            }
        }

        context.events.emit('core-ai-api:setup');
    },

    async start(context: AppContext): Promise<void> {
        context.events.emit('core-ai-api:started');
    },

    async stop(): Promise<void> {
        // Cleanup
        config = null;
        apiKey = null;
    }
};

// Export helper functions separately
export async function complete(messages: AIMessage[], customConfig?: Partial<AIConfig>): Promise<AIResponse> {
    const finalConfig = { ...config, ...customConfig };

    // Mock implementation - in production, this would call actual AI APIs
    const mockResponse: AIResponse = {
        content: `Mock AI response to: ${messages[messages.length - 1].content}`,
        model: finalConfig.model || 'mock-model',
        usage: {
            promptTokens: 50,
            completionTokens: 100,
            totalTokens: 150
        }
    };

    return mockResponse;
}

export async function prompt(userMessage: string, systemMessage?: string): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
    }

    messages.push({ role: 'user', content: userMessage });

    const response = await complete(messages);
    return response.content;
}

export function isConfigured(): boolean {
    return apiKey !== null;
}

export default CoreAiApi;
