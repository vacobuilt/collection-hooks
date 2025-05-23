import { z } from 'zod';

/**
 * Options for the useCollection hook
 */
export interface CollectionOptions {
  cacheTime?: number;         // How long to cache data (in ms)
  staleTime?: number;         // How long until data is considered stale (in ms)
  refetchOnMount?: boolean;   // Whether to refetch data when component mounts
  refetchOnWindowFocus?: boolean; // Whether to refetch data when window regains focus
  transformResponse?: (data: any) => any; // Custom transform function
}

/**
 * Result of the useCollection hook
 */
export interface CollectionHookResult<T> {
  data: T[];
  error: Error | null;
  loading: boolean;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Result of the useCollectionQuery hook
 */
export interface CollectionQueryResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Result of the useCollectionMutation hook
 */
export interface CollectionMutationResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  mutate: (body: any) => Promise<T | null>;
}

/**
 * Options for the createCollectionApi function
 */
export interface ApiOptions {
  cacheTime?: number;
  validateOnWrite?: boolean;
  hooks?: {
    beforeRead?: (query: any) => any;
    afterRead?: (data: any) => any;
    beforeWrite?: (data: any) => any;
    afterWrite?: (data: any) => any;
  };
}

/**
 * Result of the createCollectionApi function
 */
export interface CollectionApi<T> {
  getAll: (req: Request) => Promise<Response>;
  getById: (req: Request, context: { params: { id: string } }) => Promise<Response>;
  create: (req: Request) => Promise<Response>;
  update: (req: Request, context: { params: { id: string } }) => Promise<Response>;
  remove: (req: Request, context: { params: { id: string } }) => Promise<Response>;
  refreshCache: (req: Request) => Promise<Response>;
}
