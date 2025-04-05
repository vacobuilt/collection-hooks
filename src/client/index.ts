// Export hooks
export { useCollection } from './hooks/useCollection';
export { useCollectionQuery } from './hooks/useCollectionQuery';
export { useCollectionMutation } from './hooks/useCollectionMutation';
export { useAllCollections } from './hooks/useAllCollections';

// Export client utilities
export { default as clientCache } from './utils/clientCache';

// Export types
export {
  CollectionOptions,
  CollectionHookResult,
  CollectionQueryResult,
  CollectionMutationResult,
} from '../shared/types';

export {
  AllCollectionsConfig,
  AllCollectionsResult,
} from './hooks/useAllCollections';

// Create specialized hooks for common collections
import { useCollection } from './hooks/useCollection';

export function createCollectionHook<T = any>(
  endpoint: string
) {
  return function useSpecificCollection(initialData: T[] = []) {
    return useCollection<T>(endpoint, initialData);
  };
}
