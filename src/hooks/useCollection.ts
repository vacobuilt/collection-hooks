import { useState, useEffect, useCallback } from 'react';
import { useCollectionQuery } from './useCollectionQuery';
import { CollectionOptions, CollectionHookResult, StandardizableFields } from '../types';
import { getEntityType, standardizeItems } from '../utils/standardization';
import clientCache from '../utils/clientCache';

/**
 * Base hook for collection data with client-side caching
 * 
 * @param endpoint API endpoint for the collection
 * @param initialData Initial data for the collection
 * @param options Options for the collection hook
 * @returns Object containing data, error, loading state, and refresh/refetch functions
 */
export function useCollection<T extends StandardizableFields>(
  endpoint: string,
  initialData: T[] = [],
  options: CollectionOptions = {}
): CollectionHookResult<T> {
  const {
    standardizeFields: shouldStandardizeFields = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    fieldMappings = {},
    transformResponse,
  } = options;

  // Extract collection name from endpoint
  const collectionName = endpoint.split('/').pop() || '';

  // Server data fetching with the collection query hook
  const { 
    data: serverData, 
    error, 
    loading, 
    refetch 
  } = useCollectionQuery<{ success: boolean; data: T[]; cached: boolean }>(endpoint);

  // Client-side cache
  const [cachedData, setCachedData] = useState<T[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update client cache when server data changes
  useEffect(() => {
    if (serverData?.success && serverData.data) {
      // Apply field standardization if enabled
      let data = serverData.data;
      
      if (shouldStandardizeFields) {
        data = standardizeItems(data, getEntityType(collectionName), fieldMappings);
      }
      
      // Apply custom transform if provided
      if (transformResponse) {
        data = transformResponse(data);
      }
      
      setCachedData(data as T[]);
      
      // Update client cache
      clientCache.set(`collection:${collectionName}`, data, cacheTime);
    }
  }, [serverData, collectionName, shouldStandardizeFields, transformResponse, cacheTime, fieldMappings]);

  // Check client cache on mount
  useEffect(() => {
    const cachedItems = clientCache.get<T[]>(`collection:${collectionName}`);
    if (cachedItems) {
      setCachedData(cachedItems);
    }
  }, [collectionName]);

  // Force refresh from server (bypassing cache)
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Apply field standardization if enabled
        let data = result.data;
        
        if (shouldStandardizeFields) {
          data = standardizeItems(data, getEntityType(collectionName), fieldMappings);
        }
        
        // Apply custom transform if provided
        if (transformResponse) {
          data = transformResponse(data);
        }
        
        setCachedData(data as T[]);
        
        // Update client cache
        clientCache.set(`collection:${collectionName}`, data, cacheTime);
      }
    } catch (err) {
      console.error(`Error refreshing ${collectionName}:`, err);
    } finally {
      setIsRefreshing(false);
    }
  }, [endpoint, collectionName, shouldStandardizeFields, transformResponse, cacheTime, fieldMappings]);

  return {
    data: cachedData,
    error,
    loading: loading || isRefreshing,
    refresh,
    refetch
  };
}
