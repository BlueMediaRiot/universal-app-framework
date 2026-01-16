import { z } from 'zod';

export interface CoreMetadata {
    name: string;
    version: string;
    description: string;
    dependencies?: string[];
}

export interface ServiceDefinition<T = any> {
    id: string;
    methods: T;
}

export interface CoreDefinition {
    metadata: CoreMetadata;
    setup: (context: AppContext) => Promise<void> | void;
    start?: (context: AppContext) => Promise<void> | void;
    stop?: () => Promise<void> | void;
}

export interface AppContext {
    events: IEventBus;
    config: IConfigStore;
    registerService: <T>(id: string, service: T) => void;
    getService: <T>(id: string) => T | undefined;
}

export interface IEventBus {
    emit: (event: string, data?: any) => void;
    on: (event: string, handler: (data: any) => void) => void;
    off: (event: string, handler: (data: any) => void) => void;
}

export interface IConfigStore {
    get: <T>(key: string, defaultValue?: T) => T;
    set: <T>(key: string, value: T) => void;
}
