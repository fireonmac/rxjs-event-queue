import { delay, map, Observable, Subject, Subscriber, tap, timer } from "rxjs";
import { getRandomInt, makeId } from "./helpers"
import { EventItem } from "./interfaces";
import { CompletedQueue, EventQueue, PendingQueue, ProceedingQueue } from "./queues";

(window as any).app = {
    eventVisualizer() {
        return {
            count: 0, // 로그 출력 용
            pendingQueue: null,
            proceedingQueue: null,
            completedQueue: null,
            eventQueue: null,

            clearAll() {
                this.eventQueue.clear();
            },
    
            addEvent() {
                console.log('Button Clicked!');
                this.count += 1;

                const eventItem = {
                    count: this.count,
                    id: makeId(7),
                    timer: getRandomInt(2, 5),
                }

                this.pendingQueue.enqueue(eventItem);
                console.log(`${eventItem.count} - Enqueued to PendingQueue: `, eventItem);

                const eventItem$ = new Observable(subscriber => {
                    subscriber.next(eventItem);
                    subscriber.complete();
                }).pipe(
                    tap((item: EventItem) => {
                        const dequeuedItem = this.pendingQueue.dequeue();
                        this.proceedingQueue.enqueue(item);

                        console.log(`${dequeuedItem.count} - Dequeued from PendingQueue:`, dequeuedItem);
                        console.log(`${item.count} - Enqueued to ProceedingQueue: `, item);
                    }),
                    delay(eventItem.timer * 1000),
                );
                    
                this.eventQueue.enqueue(eventItem$);
            },
    
            init() {
                this.pendingQueue = new PendingQueue();
                this.proceedingQueue = new ProceedingQueue();
                this.completedQueue = new CompletedQueue();
                this.eventQueue = new EventQueue(
                    this.pendingQueue,
                    this.proceedingQueue,
                    this.completedQueue
                );
            },
        }
    },

    eventItem(item: EventItem) {
        return {
            item: item,

            cancelPendingItem() {
                this.pendingQueue.removeItem(item);
            }
        }
    }
}