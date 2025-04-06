import dotenv from 'dotenv';
import { configureCollectionHooks, getDatabase, closeConnection } from '../../src/server';
import { useCollection } from '../../src/client';
import { renderHook } from '@testing-library/react-hooks';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Mock fetch for client-side tests
global.fetch = jest.fn();

describe('MongoDB Connection Test', () => {
  // Store collection names for later use in client tests
  let collectionNames: string[] = [];
  
  beforeAll(async () => {
    // Skip tests if no MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn('Skipping MongoDB connection tests: No MONGODB_URI provided');
      return;
    }
    
    try {
      // Configure the connection
      configureCollectionHooks({
        mongodbUri: process.env.MONGODB_URI,
        debug: true // Enable debug logging for visibility
      });
      
      // Test the connection by getting the database
      const db = await getDatabase();
      console.log('Successfully connected to MongoDB');
      
      // Get collections for later use
      const collections = await db.listCollections().toArray();
      collectionNames = collections.map(col => col.name);
      console.log('Available collections:', collectionNames);
    } catch (error) {
      console.error('Error setting up MongoDB connection test:', error);
      throw error;
    }
  });
  
  afterAll(async () => {
    // Clean up the connection
    if (process.env.MONGODB_URI) {
      await closeConnection();
      console.log('MongoDB connection closed');
    }
  });
  
  it('should connect to MongoDB and list collections', async () => {
    // Skip test if no MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn('Skipping test: No MONGODB_URI provided');
      return;
    }
    
    // Test server-side connection
    const db = await getDatabase();
    expect(db).toBeDefined();
    
    // Get collections
    const collections = await db.listCollections().toArray();
    expect(collections).toBeDefined();
    expect(Array.isArray(collections)).toBe(true);
    
    // Get collection names
    const names = collections.map(col => col.name);
    expect(Array.isArray(names)).toBe(true);
    
    // Log the collections for visibility
    console.log('MongoDB collections:', names);
  });
  
  it('should fetch collections using client hooks', async () => {
    // Skip test if no MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn('Skipping test: No MONGODB_URI provided');
      return;
    }
    
    // Mock the fetch response with the real collection names
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: collectionNames.map(name => ({ name }))
      })
    });
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollection('/api/collections')
    );
    
    // Initially should be loading
    expect(result.current.loading).toBe(true);
    
    // Wait for the hook to update
    await waitForNextUpdate();
    
    // Should have data and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
    
    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith('/api/collections');
  });
  
  it('should handle MongoDB connection errors', async () => {
    // Skip test if no MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn('Skipping test: No MONGODB_URI provided');
      return;
    }
    
    // Mock a failed fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: false, 
        error: 'Failed to connect to MongoDB' 
      })
    });
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollection('/api/collections')
    );
    
    // Initially should be loading
    expect(result.current.loading).toBe(true);
    
    // Wait for the hook to update
    await waitForNextUpdate();
    
    // Should have error and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
  });
});
