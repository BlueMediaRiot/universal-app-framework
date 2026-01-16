import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IEventBus } from './types';

interface EventPayload {
    name: string;
    data: any;
}

export class RxEventBus implements IEventBus {
    private _subject = new Subject<EventPayload>();
    private _subscriptions = new Map<Function, Subscription>();

    emit(event: string, data?: any) {
        this._subject.next({ name: event, data });
    }

    on(event: string, handler: (data: any) => void) {
        const sub = this._subject.pipe(
            filter(e => e.name === event)
        ).subscribe(e => handler(e.data));

        // We map the handler to the subscription for removal
        this._subscriptions.set(handler, sub);
    }

    off(event: string, handler: (data: any) => void) {
        const sub = this._subscriptions.get(handler);
        if (sub) {
            sub.unsubscribe();
            this._subscriptions.delete(handler);
        }
    }
}
