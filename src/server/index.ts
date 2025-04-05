// Export configuration
export { configureCollectionHooks, getDatabase, closeConnection } from './config';

// Export server utilities
export { default as serverCache } from './cache';
export { createCollectionApi } from './createCollectionApi';
export { getCollection } from './database';

// Export types
export {
  ApiOptions,
  CollectionApi,
} from '../shared/types';
