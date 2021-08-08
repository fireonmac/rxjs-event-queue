import { concatMap, delay, filter, Observable, of, Subject, Subscription, tap } from "rxjs";
import { EventItem } from "./interfaces";

export class Queue<T> {
    constructor(
        public list: T[] = []
    ) { }

    enqueue(item: T) {
        this.list.push(item);
    }

    dequeue() {
        return this.list.shift();
    }

    getFirst() {
        if (this.list.length) return this.list[0];
        else return null;
    }

    clear() {
        this.list = [];
    }
}

export class EventQueue extends Queue<Observable<any>> {
    constructor(
        private pendingQueue: PendingQueue,
        private proceedingQueue: ProceedingQueue,
        private completedQueue: CompletedQueue,
        public list$: Subject<Observable<EventItem>> = new Subject(),
        private subscription: Subscription = null
    ) {
        super();
        this.init();
    }

    init() {
        this.subscription = this.list$.pipe(
            concatMap(item => item),
            tap((item) => {
                this.proceedingQueue.dequeue();
                this.completedQueue.enqueue(item);
            })
        ).subscribe();
    }

    enqueue(eventItem$: Observable<EventItem>) {
        this.list$.next(eventItem$);
    }

    addEvent(eventItem: EventItem) {
        this.pendingQueue.enqueue(eventItem);
        
        const eventItem$ = of(eventItem).pipe(
            filter((item: EventItem) => this.pendingQueue.getFirst() && this.pendingQueue.getFirst().id == item.id),
            tap(item => { 
                this.pendingQueue.dequeue();
                this.proceedingQueue.enqueue(item) 
            }),
            delay(eventItem.timer * 1000),
        );

        this.enqueue(eventItem$);
    }

    removeBeforeProceed(id: string) {
        this.pendingQueue.list = this.pendingQueue.list.filter(item => item.id !== id);
    }

    clear() {
        this.subscription.unsubscribe();
        this.pendingQueue.clear();
        this.proceedingQueue.clear();
        this.completedQueue.clear();

        this.init();
    }
}

export class PendingQueue extends Queue<EventItem> {

}

export class ProceedingQueue extends Queue<EventItem> {

}

export class CompletedQueue extends Queue<EventItem> {

}