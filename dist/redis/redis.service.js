"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let RedisService = class RedisService {
    constructor() {
        this.isConnecting = false;
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: retries => Math.min(retries * 200, 5000),
                connectTimeout: 15000
            }
        });
        this.client.on('error', err => console.error('[RedisService] Error:', err));
        this.client.on('ready', () => console.log('[RedisService] Connected to Redis'));
        this.client.on('end', () => console.log('[RedisService] Disconnected from Redis'));
    }
    async connect() {
        if (this.isConnecting) {
            console.log('[RedisService] Connection in progress, skipping');
            return;
        }
        if (!this.client.isOpen) {
            this.isConnecting = true;
            try {
                await this.client.connect();
            }
            catch (err) {
                console.error('[RedisService] Connection error:', err);
                throw new Error(`Failed to connect to Redis: ${err.message}`);
            }
            finally {
                this.isConnecting = false;
            }
        }
    }
    getClient() {
        return this.client;
    }
    async set(key, value, ttl) {
        try {
            await this.connect();
            const options = ttl ? { PX: ttl } : {};
            const result = await this.client.set(key, value, options);
            return result === 'OK';
        }
        catch (err) {
            console.error('[RedisService] set error:', err);
            return false;
        }
    }
    async setNx(key, value, ttl) {
        try {
            await this.connect();
            const result = await this.client.set(key, value, { NX: true, PX: ttl });
            return result === 'OK';
        }
        catch (err) {
            console.error('[RedisService] setNx error:', err);
            return false;
        }
    }
    async get(key) {
        try {
            await this.connect();
            return await this.client.get(key);
        }
        catch (err) {
            console.error('[RedisService] get error:', err);
            return null;
        }
    }
    async del(key) {
        try {
            await this.connect();
            await this.client.del(key);
        }
        catch (err) {
            console.error('[RedisService] del error:', err);
        }
    }
    async flushAll() {
        try {
            await this.connect();
            await this.client.flushAll();
            console.log('[RedisService] Flushed all Redis cache');
        }
        catch (err) {
            console.error('[RedisService] flushAll error:', err);
        }
    }
    async deleteByPattern(pattern) {
        try {
            await this.connect();
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                console.log(`[RedisService] Deleted ${keys.length} keys matching pattern: ${pattern}`);
            }
            else {
                console.log(`[RedisService] No keys found for pattern: ${pattern}`);
            }
        }
        catch (err) {
            console.error('[RedisService] deleteByPattern error:', err);
        }
    }
    async quit() {
        if (this.client.isOpen) {
            await this.client.quit();
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map