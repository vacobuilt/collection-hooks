import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { ApiOptions } from '../types';
import { getEntityType, standardizeFields } from '../utils/standardization';
import cache from './cache';
import { getCollection } from './database';

/**
 * Create a collection API endpoint factory
 * 
 * This function creates API endpoints for a MongoDB collection with standardized
 * field names and caching.
 * 
 * @param collectionName The name of the MongoDB collection
 * @param schema The Zod schema for validating documents
 * @param options Options for the collection API
 * @returns API endpoint handlers for the collection
 */
export function createCollectionApi<T extends { id: string }>(
  collectionName: string,
  schema: z.ZodType<T>,
  options: ApiOptions = {}
) {
  const {
    cacheTime = 60 * 60 * 1000, // 1 hour default cache time
    standardizeFields: shouldStandardizeFields = true,
    validateOnWrite = true,
    fieldMappings = {},
    hooks = {},
  } = options;

  /**
   * Get all items from the collection
   */
  async function getAll(req: Request) {
    const skipCache = req.method === 'POST';
    const cacheKey = `collection:${collectionName}:all`;

    // Check cache first if not skipping
    if (!skipCache) {
      const cachedData = cache.get<{ success: boolean; data: T[]; cached: boolean }>(cacheKey);
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    try {
      // Prepare query
      let query = {};
      
      // Apply beforeRead hook if provided
      if (hooks.beforeRead) {
        query = hooks.beforeRead(query);
      }
      
      // Fetch data from MongoDB
      const collection = await getCollection(collectionName);
      const items = await collection.find(query).toArray();
      
      // Convert MongoDB documents to plain objects and standardize fields
      const data = items.map((item: any) => {
        const plainItem = { ...item, _id: item._id?.toString() };
        
        // Apply field standardization if enabled
        return shouldStandardizeFields
          ? standardizeFields(plainItem, getEntityType(collectionName), fieldMappings)
          : plainItem;
      });
      
      // Apply afterRead hook if provided
      const processedData = hooks.afterRead ? hooks.afterRead(data) : data;
      
      const result = {
        success: true,
        data: processedData,
        cached: false,
      };
      
      // Cache the result if not skipping cache
      if (!skipCache) {
        cache.set(cacheKey, result, cacheTime);
      }
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch ${collectionName}` }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Get a single item by ID
   */
  async function getById(req: Request, context: { params: { id: string } }) {
    const { id } = context.params;
    const skipCache = req.method === 'POST';
    const cacheKey = `collection:${collectionName}:${id}`;

    // Check cache first if not skipping
    if (!skipCache) {
      const cachedData = cache.get<{ success: boolean; data: T; cached: boolean }>(cacheKey);
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    try {
      // Fetch data from MongoDB
      const collection = await getCollection(collectionName);
      const item = await collection.findOne({ id });
      
      if (!item) {
        return new Response(
          JSON.stringify({ success: false, error: `Item with ID ${id} not found` }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Convert MongoDB document to plain object and standardize fields
      const plainItem = { ...item, _id: item._id?.toString() };
      const data = shouldStandardizeFields
        ? standardizeFields(plainItem, getEntityType(collectionName), fieldMappings)
        : plainItem;
      
      // Apply afterRead hook if provided
      const processedData = hooks.afterRead ? hooks.afterRead(data) : data;
      
      const result = {
        success: true,
        data: processedData,
        cached: false,
      };
      
      // Cache the result if not skipping cache
      if (!skipCache) {
        cache.set(cacheKey, result, cacheTime);
      }
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(`Error fetching ${collectionName} item:`, error);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch ${collectionName} item` }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Create a new item
   */
  async function create(req: Request) {
    try {
      // Handle both real and mock Request objects
      let body;
      try {
        body = await req.json();
      } catch (jsonError) {
        // If req.json() fails, try to access the body directly (for tests)
        body = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
      }
      
      // Apply beforeWrite hook if provided
      const processedBody = hooks.beforeWrite ? hooks.beforeWrite(body) : body;
      
      // Validate the request body against the schema
      let validatedData: T;
      if (validateOnWrite) {
        validatedData = schema.parse(processedBody);
      } else {
        validatedData = processedBody as T;
      }
      
      // Insert data into MongoDB
      const collection = await getCollection(collectionName);
      const result = await collection.insertOne(validatedData);
      
      // Apply afterWrite hook if provided
      const processedResult = hooks.afterWrite 
        ? hooks.afterWrite({ ...validatedData, _id: result.insertedId.toString() })
        : { ...validatedData, _id: result.insertedId.toString() };
      
      // Invalidate cache
      cache.delete(`collection:${collectionName}:all`);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: processedResult,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`Error creating ${collectionName} item:`, error);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create ${collectionName} item` }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Update an existing item
   */
  async function update(req: Request, context: { params: { id: string } }) {
    const { id } = context.params;
    
    try {
      // Handle both real and mock Request objects
      let body;
      try {
        body = await req.json();
      } catch (jsonError) {
        // If req.json() fails, try to access the body directly (for tests)
        body = req.body ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : {};
      }
      
      // Apply beforeWrite hook if provided
      const processedBody = hooks.beforeWrite ? hooks.beforeWrite(body) : body;
      
      // Validate the request body against the schema
      let validatedData: T;
      if (validateOnWrite) {
        validatedData = schema.parse({ ...processedBody, id });
      } else {
        validatedData = { ...processedBody, id } as T;
      }
      
      // Update data in MongoDB
      const collection = await getCollection(collectionName);
      const result = await collection.updateOne({ id }, { $set: validatedData });
      
      if (result.matchedCount === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `Item with ID ${id} not found` }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Apply afterWrite hook if provided
      const processedResult = hooks.afterWrite 
        ? hooks.afterWrite(validatedData)
        : validatedData;
      
      // Invalidate cache
      cache.delete(`collection:${collectionName}:all`);
      cache.delete(`collection:${collectionName}:${id}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: processedResult,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`Error updating ${collectionName} item:`, error);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to update ${collectionName} item` }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Delete an item
   */
  async function remove(req: Request, context: { params: { id: string } }) {
    const { id } = context.params;
    
    try {
      // Delete data from MongoDB
      const collection = await getCollection(collectionName);
      const result = await collection.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `Item with ID ${id} not found` }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Invalidate cache
      cache.delete(`collection:${collectionName}:all`);
      cache.delete(`collection:${collectionName}:${id}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: { id },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`Error deleting ${collectionName} item:`, error);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to delete ${collectionName} item` }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * Refresh the cache for the collection
   */
  async function refreshCache(req: Request) {
    try {
      const cacheKey = `collection:${collectionName}:all`;
      
      // Delete the cache entry
      cache.delete(cacheKey);
      
      // Fetch fresh data from MongoDB
      const collection = await getCollection(collectionName);
      const items = await collection.find({}).toArray();
      
      // Convert MongoDB documents to plain objects and standardize fields
      const data = items.map((item: any) => {
        const plainItem = { ...item, _id: item._id?.toString() };
        
        // Apply field standardization if enabled
        return shouldStandardizeFields
          ? standardizeFields(plainItem, getEntityType(collectionName), fieldMappings)
          : plainItem;
      });
      
      // Apply afterRead hook if provided
      const processedData = hooks.afterRead ? hooks.afterRead(data) : data;
      
      const result = {
        success: true,
        data: processedData,
        cached: false,
      };
      
      // Cache the fresh result
      cache.set(cacheKey, result, cacheTime);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(`Error refreshing ${collectionName} cache:`, error);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to refresh ${collectionName} cache` }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    refreshCache,
  };
}
