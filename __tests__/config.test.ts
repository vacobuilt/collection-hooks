// Import the module under test
import { configureCollectionHooks, getDatabase, closeConnection } from '../src/config';
import type { Db } from 'mongodb';

// Create mock objects
const mockDb = {
  collection: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
  }),
};

const mockClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  db: jest.fn().mockReturnValue(mockDb),
  close: jest.fn().mockResolvedValue(undefined),
};

// Mock MongoDB completely to avoid TextEncoder issues
jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    Db: jest.fn(),
  };
});

// Get the mocked MongoClient constructor
const { MongoClient } = require('mongodb');

describe('Configuration Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
    // Reset the module between tests
    jest.resetModules();
  });

  it('should configure with MongoDB URI', async () => {
    // Configure with URI
    configureCollectionHooks({
      mongodbUri: 'mongodb://localhost:27017',
      dbName: 'testdb',
    });

    // Get the database
    const db = await getDatabase();
    
    // Verify MongoClient was created with correct URI
    expect(MongoClient).toHaveBeenCalledWith('mongodb://localhost:27017', {});
    
    // Verify db is defined
    expect(db).toBeDefined();
  });

  it('should configure with existing database connection', async () => {
    // Create a mock database
    const mockDb = {} as Db;
    
    // Configure with existing database
    configureCollectionHooks({
      database: mockDb,
    });

    // Get the database
    const db = await getDatabase();
    
    // Verify the database is the same as the one we provided
    expect(db).toBe(mockDb);
  });

  it('should configure with database function', async () => {
    // Create a mock database
    const mockDb = {} as Db;
    
    // Configure with function that returns a database
    configureCollectionHooks({
      getDatabaseFn: () => Promise.resolve(mockDb),
    });

    // Get the database
    const db = await getDatabase();
    
    // Verify the database is the same as the one returned by the function
    expect(db).toStrictEqual(mockDb);
  });

  it('should throw error if not configured', async () => {
    // Reset the module to clear any previous configuration
    jest.resetModules();
    
    // Import the module again
    const { getDatabase } = require('../src/config');
    
    // Attempt to get the database without configuring
    await expect(getDatabase()).rejects.toThrow('Database not configured');
  });

  it('should close the connection', async () => {
    // Configure with URI
    configureCollectionHooks({
      mongodbUri: 'mongodb://localhost:27017',
    });

    // Close the connection
    // This should not throw an error
    await expect(closeConnection()).resolves.not.toThrow();
  });

  it('should throw error if invalid configuration', () => {
    // Attempt to configure with invalid options
    expect(() => {
      configureCollectionHooks({} as any);
    }).toThrow('Invalid configuration');
  });
});
