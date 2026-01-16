import { AppContext, CoreDefinition } from '@universal/core-system';
import { MathService } from './math';
import { IMathService } from './types';

export * from './types';

export const MathCore: CoreDefinition = {
    metadata: {
        name: 'core-math',
        version: '1.0.0',
        description: 'Basic math operations'
    },
    setup: (context: AppContext) => {
        const mathService = new MathService();
        context.registerService<IMathService>('math', mathService);
        console.log('➕ Math Core initialized');
    }
};
