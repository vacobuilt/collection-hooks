/**
 * Simple client-side cache implementation
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

class ClientCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (defaults to 5 minutes)
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data: value,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all keys that match a prefix
   * @param prefix Key prefix
   */
  deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all keys in the cache
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get the number of entries in the cache
   * @returns Number of cache entries
   */
  size(): number {
    return this.cache.size;
  }
}

// Create a singleton instance
const clientCache = new ClientCache();

export default clientCache;
