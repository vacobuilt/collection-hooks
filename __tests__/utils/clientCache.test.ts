import clientCache from '../../src/utils/clientCache';

describe('Client Cache', () => {
  beforeEach(() => {
    // Clear the cache before each test
    clientCache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      const testData = { id: 1, name: 'Test Item' };
      clientCache.set('test-key', testData);
      
      const retrieved = clientCache.get<typeof testData>('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = clientCache.get('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should respect TTL and expire items', () => {
      jest.useFakeTimers();
      
      const testData = { id: 1, name: 'Test Item' };
      // Set with a 1000ms TTL
      clientCache.set('test-key', testData, 1000);
      
      // Verify it exists initially
      expect(clientCache.get('test-key')).toEqual(testData);
      
      // Advance time by 1001ms
      jest.advanceTimersByTime(1001);
      
      // Verify it's expired
      expect(clientCache.get('test-key')).toBeNull();
      
      jest.useRealTimers();
    });

    it('should use default TTL if not specified', () => {
      jest.useFakeTimers();
      
      const testData = { id: 1, name: 'Test Item' };
      // Set with default TTL (5 minutes)
      clientCache.set('test-key', testData);
      
      // Verify it exists initially
      expect(clientCache.get('test-key')).toEqual(testData);
      
      // Advance time by 4 minutes (should still exist)
      jest.advanceTimersByTime(4 * 60 * 1000);
      expect(clientCache.get('test-key')).toEqual(testData);
      
      // Advance time by another 2 minutes (should be expired)
      jest.advanceTimersByTime(2 * 60 * 1000);
      expect(clientCache.get('test-key')).toBeNull();
      
      jest.useRealTimers();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      clientCache.set('test-key', 'test-value');
      expect(clientCache.has('test-key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(clientCache.has('non-existent-key')).toBe(false);
    });

    it('should return false for expired keys', () => {
      jest.useFakeTimers();
      
      clientCache.set('test-key', 'test-value', 1000);
      expect(clientCache.has('test-key')).toBe(true);
      
      jest.advanceTimersByTime(1001);
      expect(clientCache.has('test-key')).toBe(false);
      
      jest.useRealTimers();
    });
  });

  describe('delete', () => {
    it('should remove a key from the cache', () => {
      clientCache.set('test-key', 'test-value');
      expect(clientCache.has('test-key')).toBe(true);
      
      clientCache.delete('test-key');
      expect(clientCache.has('test-key')).toBe(false);
    });

    it('should not throw when deleting non-existent keys', () => {
      expect(() => {
        clientCache.delete('non-existent-key');
      }).not.toThrow();
    });
  });

  describe('deleteByPrefix', () => {
    it('should remove all keys with the specified prefix', () => {
      clientCache.set('prefix1:key1', 'value1');
      clientCache.set('prefix1:key2', 'value2');
      clientCache.set('prefix2:key1', 'value3');
      
      clientCache.deleteByPrefix('prefix1:');
      
      expect(clientCache.has('prefix1:key1')).toBe(false);
      expect(clientCache.has('prefix1:key2')).toBe(false);
      expect(clientCache.has('prefix2:key1')).toBe(true);
    });

    it('should not throw when no keys match the prefix', () => {
      expect(() => {
        clientCache.deleteByPrefix('non-existent-prefix:');
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all keys from the cache', () => {
      clientCache.set('key1', 'value1');
      clientCache.set('key2', 'value2');
      
      clientCache.clear();
      
      expect(clientCache.has('key1')).toBe(false);
      expect(clientCache.has('key2')).toBe(false);
      expect(clientCache.size()).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return all keys in the cache', () => {
      clientCache.set('key1', 'value1');
      clientCache.set('key2', 'value2');
      
      const keys = clientCache.keys();
      
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBe(2);
    });

    it('should return an empty array when cache is empty', () => {
      const keys = clientCache.keys();
      expect(keys).toEqual([]);
    });
  });

  describe('size', () => {
    it('should return the number of items in the cache', () => {
      expect(clientCache.size()).toBe(0);
      
      clientCache.set('key1', 'value1');
      expect(clientCache.size()).toBe(1);
      
      clientCache.set('key2', 'value2');
      expect(clientCache.size()).toBe(2);
      
      clientCache.delete('key1');
      expect(clientCache.size()).toBe(1);
      
      clientCache.clear();
      expect(clientCache.size()).toBe(0);
    });
  });
});
