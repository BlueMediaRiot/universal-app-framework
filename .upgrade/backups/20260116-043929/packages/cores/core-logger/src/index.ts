import { AppContext, CoreDefinition } from '@universal/core-system';
import { ConsoleLogger } from './logger';
import { ILogger } from './types';

export * from './types';

export const LoggerCore: CoreDefinition = {
    metadata: {
        name: 'core-logger',
        version: '1.0.0',
        description: 'Standard system logger'
    },
    setup: (context: AppContext) => {
        // 1. Get config
        const logLevel = context.config.get<string>('LOG_LEVEL', 'info');

        // 2. Create instance
        const logger = new ConsoleLogger({
            level: logLevel as any
        });

        // 3. Register service
        context.registerService<ILogger>('logger', logger);

        // 4. Log startup using itself
        logger.info('Logger Core initialized');
    }
};
