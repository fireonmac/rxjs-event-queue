import { concatMap, noop, Observable, Subject, Subscription } from "rxjs";
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

    enqueue(eventItem$: Observable<EventItem>) {
        this.list$.next(eventItem$);
    }

    dequeue() {
        return null;
    }

    clear() {
        this.subscription.unsubscribe();
        this.pendingQueue.clear();
        this.proceedingQueue.clear();
        this.completedQueue.clear();

        this.init();
    }

    init() {
        this.subscription = this.list$.pipe(
            concatMap(item => item),
        ).subscribe({
            next: (item) => {
                const dequeuedItem = this.proceedingQueue.dequeue();
                this.completedQueue.enqueue(item);
                console.log(`${dequeuedItem.count} - Dequeued from ProceedingQueue:`, dequeuedItem);
                console.log(`${item.count} - Enqueued to ComletedQueue: `, item);
            },
            error: err => console.log(err),
            complete: () => { console.log('done') }
        });
    }
}

export class PendingQueue extends Queue<EventItem> {
    removeItem(eventItem: EventItem) {
        return this.list = this.list.filter(item => item.id !== eventItem.id);
    }
}

export class ProceedingQueue extends Queue<EventItem> {

}

export class CompletedQueue extends Queue<EventItem> {

}