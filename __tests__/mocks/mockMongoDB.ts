/**
 * Mock MongoDB implementation for testing
 * 
 * This provides a simple in-memory implementation of MongoDB collections
 * that can be used for testing without connecting to a real database.
 */

// In-memory store for collections
const collections: Record<string, any[]> = {};

// Mock MongoDB client
export const mockMongoDB = {
  // Mock collection method
  collection: (name: string) => {
    // Initialize collection if it doesn't exist
    if (!collections[name]) {
      collections[name] = [];
    }

    return {
      // Find documents in the collection
      find: (query = {}) => {
        // Simple implementation that returns all documents
        // In a real implementation, we would filter based on the query
        return {
          toArray: async () => {
            return collections[name].map(doc => ({ ...doc }));
          }
        };
      },

      // Find a single document
      findOne: async (query: any) => {
        // Simple implementation that finds by id
        const id = query.id || query._id;
        if (id) {
          const doc = collections[name].find(doc => 
            doc.id === id || (doc._id && doc._id.toString() === id.toString())
          );
          return doc ? { ...doc } : null;
        }
        return collections[name][0] || null;
      },

      // Insert a document
      insertOne: async (doc: any) => {
        const newDoc = { ...doc };
        // Generate a mock _id if not provided
        if (!newDoc._id) {
          newDoc._id = `mock-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        collections[name].push(newDoc);
        return {
          insertedId: newDoc._id,
          acknowledged: true
        };
      },

      // Update a document
      updateOne: async (query: any, update: any) => {
        const id = query.id || query._id;
        const index = collections[name].findIndex(doc => 
          doc.id === id || (doc._id && doc._id.toString() === id.toString())
        );
        
        if (index !== -1) {
          // Handle $set operator
          if (update.$set) {
            collections[name][index] = {
              ...collections[name][index],
              ...update.$set
            };
          } else {
            // Direct update
            collections[name][index] = {
              ...collections[name][index],
              ...update
            };
          }
          
          return {
            matchedCount: 1,
            modifiedCount: 1,
            acknowledged: true
          };
        }
        
        return {
          matchedCount: 0,
          modifiedCount: 0,
          acknowledged: true
        };
      },

      // Delete a document
      deleteOne: async (query: any) => {
        const id = query.id || query._id;
        const initialLength = collections[name].length;
        
        collections[name] = collections[name].filter(doc => 
          !(doc.id === id || (doc._id && doc._id.toString() === id.toString()))
        );
        
        const deletedCount = initialLength - collections[name].length;
        
        return {
          deletedCount,
          acknowledged: true
        };
      },

      // Delete all documents
      deleteMany: async (query: any = {}) => {
        const initialLength = collections[name].length;
        
        // Simple implementation that deletes all documents
        // In a real implementation, we would filter based on the query
        collections[name] = [];
        
        return {
          deletedCount: initialLength,
          acknowledged: true
        };
      }
    };
  },

  // Reset all collections (useful between tests)
  reset: () => {
    Object.keys(collections).forEach(key => {
      collections[key] = [];
    });
  },

  // Add test data to a collection
  addTestData: (collectionName: string, data: any[]) => {
    collections[collectionName] = [...data];
  }
};

// Mock MongoDB database
export const mockDatabase = {
  collection: mockMongoDB.collection
};

// Mock function to get the database
export const getDatabase = jest.fn().mockResolvedValue(mockDatabase);
