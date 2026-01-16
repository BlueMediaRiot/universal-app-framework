import { CoreLoader, cleanupCores } from '@universal/core-system';
import { LoggerCore } from '@universal/core-logger';
import { MathCore } from '@universal/core-math';

export const metadata = {
    name: 'app-example',
    version: '0.1.0',
    description: 'Example application demonstrating the Universal App Framework',
    cores: ['core-logger', 'core-math'],
    hasUI: false
};

async function main(): Promise<void> {
    const loader = new CoreLoader();

    const coresToLoad = {
        'core-logger': LoggerCore,
        'core-math': MathCore
    };

    const { cores: loadedCores, context, errors } = await loader.loadCores(
        coresToLoad,
        {
            appName: metadata.name,
            environment: process.env.NODE_ENV || 'development',
            'logger.level': 'info'
        }
    );

    if (errors.length > 0) {
        console.error('Failed to load cores:', errors);
        process.exit(1);
    }

    try {
        console.log('app-example started');
        console.log('Loaded cores:', Object.keys(loadedCores));

        // Example usage
        context.events.emit('app:started', { name: metadata.name });

        // Keep running for a bit
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('app-example completed');
    } finally {
        await cleanupCores(context);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
