import { Collection, Db } from 'mongodb';
import { getDatabase, getCollection } from '../../src/server/database';
import * as configModule from '../../src/config';

// Create a mock database object
const mockDb = {
  collection: jest.fn().mockImplementation((name) => ({
    collectionName: name,
    // Add any other collection methods you need to mock
  })),
};

// Mock the config module's getDatabase function
jest.mock('../../src/config', () => ({
  getDatabase: jest.fn().mockResolvedValue({
    collection: jest.fn().mockImplementation((name) => ({
      collectionName: name,
    })),
  }),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset the mock implementation for each test
  (configModule.getDatabase as jest.Mock).mockResolvedValue(mockDb);
});

describe('Database Module', () => {
  it('should get database from config module', async () => {
    // Call the function we're testing
    const db = await getDatabase();
    
    // Verify the config module's getDatabase was called
    expect(configModule.getDatabase).toHaveBeenCalledTimes(1);
    
    // Verify we got back the mock db
    expect(db).toBe(mockDb);
  });

  it('should get collection with type safety', async () => {
    // Define a test type
    interface TestDocument {
      id: string;
      name: string;
    }
    
    // Create a mock collection result
    const mockCollection = {
      collectionName: 'test-collection',
    };
    
    // Mock the collection method to return our mock collection
    mockDb.collection.mockReturnValueOnce(mockCollection);
    
    // Call the function we're testing
    const collection = await getCollection<TestDocument>('test-collection');
    
    // Verify we got back a collection
    expect(collection).toBeDefined();
    expect(collection.collectionName).toBe('test-collection');
  });

  it('should pass collection name to database.collection', async () => {
    // Reset the mock before this test
    mockDb.collection.mockClear();
    
    // Call the function we're testing
    await getCollection('test-collection');
    
    // Verify db.collection was called with the correct name
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
  });
});
