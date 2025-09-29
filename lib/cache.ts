type CacheItem<T> = {
  data: T;
  expiry: number;
};

export class Cache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  async set<T>(key: string, data: T, ttl = this.defaultTTL): Promise<void> {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new Cache();

// Simple Redis-like interface for rate limiting
class RedisLike {
  private store = new Map<string, { value: number; expiry?: number }>();

  async incr(key: string): Promise<number> {
    const item = this.store.get(key);
    const now = Date.now();
    
    if (!item || (item.expiry && now > item.expiry)) {
      this.store.set(key, { value: 1 });
      return 1;
    }
    
    item.value += 1;
    this.store.set(key, item);
    return item.value;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.store.get(key);
    if (item) {
      item.expiry = Date.now() + (seconds * 1000);
      this.store.set(key, item);
    }
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return String(item.value);
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    const expiry = expirySeconds ? Date.now() + (expirySeconds * 1000) : undefined;
    this.store.set(key, { value: parseInt(value, 10) || 0, expiry });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export const redis = new RedisLike();
