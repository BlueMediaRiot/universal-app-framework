// packages/cores/registry.ts

export const coreRegistry = {
    'core-logger': () => import('./core-logger'),
    'core-math': () => import('./core-math'),
    'core-ai-api': () => import('./core-ai-api'),
    'core-video-editor': () => import('./core-video-editor'),
} as const;

export type CoreName = keyof typeof coreRegistry;
