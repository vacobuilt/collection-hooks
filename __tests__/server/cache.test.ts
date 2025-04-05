import serverCache from '../../src/server/cache';

describe('Server Cache', () => {
  beforeEach(() => {
    // Clear the cache before each test
    serverCache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      const testData = { id: 1, name: 'Test Item' };
      serverCache.set('test-key', testData);
      
      const retrieved = serverCache.get<typeof testData>('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = serverCache.get('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should respect TTL and expire items', () => {
      jest.useFakeTimers();
      
      const testData = { id: 1, name: 'Test Item' };
      // Set with a 1000ms TTL
      serverCache.set('test-key', testData, 1000);
      
      // Verify it exists initially
      expect(serverCache.get('test-key')).toEqual(testData);
      
      // Advance time by 1001ms
      jest.advanceTimersByTime(1001);
      
      // Verify it's expired
      expect(serverCache.get('test-key')).toBeNull();
      
      jest.useRealTimers();
    });

    it('should use default TTL if not specified', () => {
      jest.useFakeTimers();
      
      const testData = { id: 1, name: 'Test Item' };
      // Set with default TTL (5 minutes)
      serverCache.set('test-key', testData);
      
      // Verify it exists initially
      expect(serverCache.get('test-key')).toEqual(testData);
      
      // Advance time by 4 minutes (should still exist)
      jest.advanceTimersByTime(4 * 60 * 1000);
      expect(serverCache.get('test-key')).toEqual(testData);
      
      // Advance time by another 2 minutes (should be expired)
      jest.advanceTimersByTime(2 * 60 * 1000);
      expect(serverCache.get('test-key')).toBeNull();
      
      jest.useRealTimers();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      serverCache.set('test-key', 'test-value');
      expect(serverCache.has('test-key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(serverCache.has('non-existent-key')).toBe(false);
    });

    it('should return false for expired keys', () => {
      jest.useFakeTimers();
      
      serverCache.set('test-key', 'test-value', 1000);
      expect(serverCache.has('test-key')).toBe(true);
      
      jest.advanceTimersByTime(1001);
      expect(serverCache.has('test-key')).toBe(false);
      
      jest.useRealTimers();
    });
  });

  describe('delete', () => {
    it('should remove a key from the cache', () => {
      serverCache.set('test-key', 'test-value');
      expect(serverCache.has('test-key')).toBe(true);
      
      serverCache.delete('test-key');
      expect(serverCache.has('test-key')).toBe(false);
    });

    it('should not throw when deleting non-existent keys', () => {
      expect(() => {
        serverCache.delete('non-existent-key');
      }).not.toThrow();
    });
  });

  describe('deleteByPrefix', () => {
    it('should remove all keys with the specified prefix', () => {
      serverCache.set('prefix1:key1', 'value1');
      serverCache.set('prefix1:key2', 'value2');
      serverCache.set('prefix2:key1', 'value3');
      
      serverCache.deleteByPrefix('prefix1:');
      
      expect(serverCache.has('prefix1:key1')).toBe(false);
      expect(serverCache.has('prefix1:key2')).toBe(false);
      expect(serverCache.has('prefix2:key1')).toBe(true);
    });

    it('should not throw when no keys match the prefix', () => {
      expect(() => {
        serverCache.deleteByPrefix('non-existent-prefix:');
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all keys from the cache', () => {
      serverCache.set('key1', 'value1');
      serverCache.set('key2', 'value2');
      
      serverCache.clear();
      
      expect(serverCache.has('key1')).toBe(false);
      expect(serverCache.has('key2')).toBe(false);
      expect(serverCache.size()).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return all keys in the cache', () => {
      serverCache.set('key1', 'value1');
      serverCache.set('key2', 'value2');
      
      const keys = serverCache.keys();
      
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });

    it('should return an empty array when cache is empty', () => {
      const keys = serverCache.keys();
      expect(keys).toEqual([]);
    });
  });

  describe('size', () => {
    it('should return the number of items in the cache', () => {
      expect(serverCache.size()).toBe(0);
      
      serverCache.set('key1', 'value1');
      expect(serverCache.size()).toBe(1);
      
      serverCache.set('key2', 'value2');
      expect(serverCache.size()).toBe(2);
      
      serverCache.delete('key1');
      expect(serverCache.size()).toBe(1);
      
      serverCache.clear();
      expect(serverCache.size()).toBe(0);
    });
  });
});
