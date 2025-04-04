import { useState, useEffect } from 'react';
import { CollectionQueryResult } from '../types';

/**
 * Custom hook for fetching data from API routes
 * 
 * @param url API route URL
 * @returns Object containing data, error, loading state, and refetch function
 */
export function useCollectionQuery<T = any>(url: string | null): CollectionQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url]);

  const refetch = async () => {
    if (url) {
      await fetchData();
    }
  };

  return { data, error, loading, refetch };
}
