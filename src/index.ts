// Export configuration
export { configureCollectionHooks, closeConnection } from './config';

// Export hooks
export { useCollection } from './hooks/useCollection';
import { useCollection } from './hooks/useCollection';
import { StandardizableFields } from './types';
export { useCollectionQuery } from './hooks/useCollectionQuery';
export { useCollectionMutation } from './hooks/useCollectionMutation';
export { useAllCollections } from './hooks/useAllCollections';

// Export server utilities
export { default as serverCache } from './server/cache';
export { createCollectionApi } from './server/createCollectionApi';

// Export utility functions
export { standardizeFields, standardizeItems, getEntityType } from './utils/standardization';
export { default as clientCache } from './utils/clientCache';

// Export types
export {
  StandardizableFields,
  CollectionOptions,
  CollectionHookResult,
  CollectionQueryResult,
  CollectionMutationResult,
  ApiOptions,
  CollectionApi,
} from './types';

export {
  AllCollectionsConfig,
  AllCollectionsResult,
} from './hooks/useAllCollections';

// Create specialized hooks for common collections
export function createCollectionHook<T extends StandardizableFields>(
  endpoint: string
) {
  return function useSpecificCollection(initialData: T[] = []) {
    return useCollection<T>(endpoint, initialData);
  };
}
