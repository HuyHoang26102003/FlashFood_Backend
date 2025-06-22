import { Semaphore } from 'async-mutex';
export declare class SemaphoreService {
    private static instance;
    private semaphores;
    private constructor();
    static getInstance(): SemaphoreService;
    getSemaphore(key: string): Semaphore;
}
