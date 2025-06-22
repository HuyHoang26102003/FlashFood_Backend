export declare class RedisService {
    private client;
    private isConnecting;
    constructor();
    connect(): Promise<void>;
    getClient(): any;
    set(key: string, value: string, ttl?: number): Promise<boolean>;
    setNx(key: string, value: string, ttl: number): Promise<boolean>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    flushAll(): Promise<void>;
    deleteByPattern(pattern: string): Promise<void>;
    quit(): Promise<void>;
}
