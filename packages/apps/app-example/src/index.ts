import { Runtime } from '@universal/core-system';
import { LoggerCore, ILogger } from '@universal/core-logger';

async function main() {
    console.log('🚀 Initializing Universal App Framework...');

    // 1. Create Runtime
    const runtime = new Runtime();

    // 2. Configure
    runtime.config.set('LOG_LEVEL', 'debug');

    // 3. Load Cores
    await runtime.loadCore(LoggerCore);

    // 4. Start
    await runtime.start();

    // 5. Use Services
    const logger = runtime.getService<ILogger>('logger');

    if (logger) {
        logger.info('App started successfully!');
        logger.debug('Debug mode is enabled');

        // Demonstrate child logger
        const appLogger = logger.child('MyApp');
        appLogger.warn('This is a warning from the app namespace');

        appLogger.info('✨ System is fully operational');
    } else {
        console.error('❌ Failed to get logger service');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
