import { AppContext, CoreDefinition, IEventBus, IConfigStore } from './types';
import { RxEventBus } from './event-bus';
import { InMemoryConfig } from './config';

export class Runtime implements AppContext {
    readonly events: IEventBus;
    readonly config: IConfigStore;
    private _services = new Map<string, any>();
    private _cores = new Map<string, CoreDefinition>();

    constructor() {
        this.events = new RxEventBus();
        this.config = new InMemoryConfig();
    }

    registerService<T>(id: string, service: T) {
        if (this._services.has(id)) {
            console.warn(`Service ${id} is being overwritten.`);
        }
        this._services.set(id, service);
        this.events.emit('system:service-registered', { id });
    }

    getService<T>(id: string): T | undefined {
        return this._services.get(id);
    }

    async loadCore(core: CoreDefinition) {
        console.log(`Payload Core: ${core.metadata.name} v${core.metadata.version}`);
        this._cores.set(core.metadata.name, core);

        // Setup
        await core.setup(this);
        this.events.emit('system:core-loaded', { name: core.metadata.name });
    }

    async start() {
        console.log('Starting Runtime...');
        for (const [name, core] of this._cores) {
            if (core.start) {
                console.log(`Starting Core: ${name}`);
                await core.start(this);
            }
        }
        this.events.emit('system:ready');
        console.log('Runtime Ready.');
    }
}
