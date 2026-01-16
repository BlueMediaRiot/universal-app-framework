// packages/cores/registry.ts

export const coreRegistry: {
    'core-logger': () => Promise<any>;
    'core-math': () => Promise<any>;
    'core-ai-api': () => Promise<any>;
    'core-video-editor': () => Promise<any>;
} = {
    'core-logger': () => import('./core-logger'),
    'core-math': () => import('./core-math'),
    'core-ai-api': () => import('./core-ai-api'),
    'core-video-editor': () => import('./core-video-editor'),
};

export type CoreName = keyof typeof coreRegistry;
