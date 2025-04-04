import { useCallback } from 'react';
import { useCollection } from './useCollection';
import { StandardizableFields } from '../types';

/**
 * Configuration for useAllCollections hook
 */
export interface AllCollectionsConfig<T extends Record<string, any>> {
  endpoints: {
    [K in keyof T]: string;
  };
  initialData?: {
    [K in keyof T]?: T[K][];
  };
}

/**
 * Result of the useAllCollections hook
 */
export interface AllCollectionsResult<T extends Record<string, any>> {
  data: {
    [K in keyof T]: T[K][];
  };
  loading: boolean;
  error: Error | null;
  refreshAll: () => Promise<void>;
}

/**
 * Hook for managing multiple collections
 * 
 * @param config Configuration for the collections
 * @returns Object containing data for all collections, loading state, error, and refreshAll function
 */
export function useAllCollections<T extends Record<string, StandardizableFields[]>>(
  config: AllCollectionsConfig<T>
): AllCollectionsResult<T> {
  const { endpoints, initialData = {} } = config;
  
  // Create a hook for each collection
  const collections = Object.entries(endpoints).map(([key, endpoint]) => {
    const initial = (initialData as any)[key] || [];
    return {
      key,
      ...useCollection(endpoint, initial),
    };
  });
  
  // Combine the data from all collections
  const data = collections.reduce((acc, { key, data }) => {
    acc[key] = data;
    return acc;
  }, {} as any);
  
  // Determine if any collection is loading
  const loading = collections.some(collection => collection.loading);
  
  // Get the first error, if any
  const error = collections.find(collection => collection.error)?.error || null;
  
  // Function to refresh all collections
  const refreshAll = useCallback(async () => {
    await Promise.all(collections.map(collection => collection.refresh()));
  }, [collections]);
  
  return {
    data,
    loading,
    error,
    refreshAll,
  };
}
