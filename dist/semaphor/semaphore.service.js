"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemaphoreService = void 0;
const async_mutex_1 = require("async-mutex");
class SemaphoreService {
    constructor() {
        this.semaphores = new Map();
    }
    static getInstance() {
        if (!SemaphoreService.instance) {
            SemaphoreService.instance = new SemaphoreService();
        }
        return SemaphoreService.instance;
    }
    getSemaphore(key) {
        if (!this.semaphores.has(key)) {
            this.semaphores.set(key, new async_mutex_1.Semaphore(1));
        }
        return this.semaphores.get(key);
    }
}
exports.SemaphoreService = SemaphoreService;
//# sourceMappingURL=semaphore.service.js.map