export interface LoggerConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    prefix?: string;
}

export interface ILogger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    child(prefix: string): ILogger;
}
