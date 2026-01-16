import { ILogger, LoggerConfig } from './types';

export class ConsoleLogger implements ILogger {
    private level: number;
    private prefix: string;

    private levels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    };

    constructor(config?: LoggerConfig) {
        this.prefix = config?.prefix || '';
        this.level = this.levels[config?.level || 'info'];
    }

    private format(level: string, message: string, args: any[]) {
        const timestamp = new Date().toISOString();
        const prefix = this.prefix ? `[${this.prefix}] ` : '';
        return `[${timestamp}] ${prefix}${level.toUpperCase()}: ${message}`;
    }

    debug(message: string, ...args: any[]) {
        if (this.level <= this.levels.debug) {
            console.debug(this.format('debug', message, args), ...args);
        }
    }

    info(message: string, ...args: any[]) {
        if (this.level <= this.levels.info) {
            console.info(this.format('info', message, args), ...args);
        }
    }

    warn(message: string, ...args: any[]) {
        if (this.level <= this.levels.warn) {
            console.warn(this.format('warn', message, args), ...args);
        }
    }

    error(message: string, ...args: any[]) {
        if (this.level <= this.levels.error) {
            console.error(this.format('error', message, args), ...args);
        }
    }

    child(prefix: string): ILogger {
        return new ConsoleLogger({
            level: Object.keys(this.levels).find(key => this.levels[key as keyof typeof this.levels] === this.level) as any,
            prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix
        });
    }
}
