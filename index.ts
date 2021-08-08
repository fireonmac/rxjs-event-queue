import { getRandomInt, makeId } from "./helpers"
import { CompletedQueue, EventQueue, PendingQueue, ProceedingQueue } from "./queues";

(window as any).app = {
    eventVisualizer() {
        return {
            count: 0,
            pendingQueue: new PendingQueue(),
            proceedingQueue: new ProceedingQueue(),
            completedQueue: new CompletedQueue(),
            eventQueue: null,

            clearAll() {
                this.eventQueue.clear();
            },
    
            addEvent() {    
                this.eventQueue.addEvent({
                    count: this.count,
                    id: makeId(7),
                    timer: getRandomInt(3, 6),
                });

                this.count += 1;
            },

            removeEventBeforeProceed(id: string) {
                this.eventQueue.removeBeforeProceed(id);
            },
    
            init() {
                this.eventQueue = new EventQueue(
                    this.pendingQueue,
                    this.proceedingQueue,
                    this.completedQueue
                );
            },
        }
    },
}