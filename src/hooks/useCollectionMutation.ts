import { useState } from 'react';
import { CollectionMutationResult } from '../types';

/**
 * Custom hook for mutating data through API routes
 * 
 * @param url API route URL
 * @returns Object containing data, error, loading state, and mutate function
 */
export function useCollectionMutation<T = any>(url: string): CollectionMutationResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const mutate = async (body: any): Promise<T | null> => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setData(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, mutate };
}
