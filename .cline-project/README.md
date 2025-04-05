# Collection Hooks Testing

This document tracks the progress of implementing tests for the `@highspringlabs/collection-hooks` library.

## Project Overview

The `@highspringlabs/collection-hooks` library provides React hooks for working with MongoDB collections, with features like field standardization and caching. The library includes:

- React hooks for fetching and mutating collection data
- Server-side utilities for creating API endpoints
- Caching mechanisms for both client and server
- Field standardization utilities

## Test Implementation

We've implemented comprehensive tests for all components of the library:

### Utility Tests

- **Standardization Tests** (`__tests__/utils/standardization.test.ts`)
  - Tests for `getEntityType`, `standardizeFields`, and `standardizeItems` functions
  - Verifies field mapping and standardization across different entity types

- **Client Cache Tests** (`__tests__/utils/clientCache.test.ts`)
  - Tests for the client-side cache implementation
  - Verifies cache operations like set, get, delete, and expiration

- **Server Cache Tests** (`__tests__/server/cache.test.ts`)
  - Tests for the server-side cache implementation
  - Similar to client cache tests, but for the server-side cache

### API Tests

- **Collection API Tests** (`__tests__/server/createCollectionApi.test.ts`)
  - Tests for the `createCollectionApi` function
  - Verifies CRUD operations, caching, and hooks
  - Uses a mock MongoDB implementation to avoid actual database connections

### Hook Tests

- **Collection Query Hook Tests** (`__tests__/hooks/useCollectionQuery.test.ts`)
  - Tests for the `useCollectionQuery` hook
  - Verifies data fetching, error handling, and loading states

- **Collection Mutation Hook Tests** (`__tests__/hooks/useCollectionMutation.test.ts`)
  - Tests for the `useCollectionMutation` hook
  - Verifies data mutation, error handling, and loading states

- **Collection Hook Tests** (`__tests__/hooks/useCollection.test.ts`)
  - Tests for the main `useCollection` hook
  - Verifies client-side caching, field standardization, and refresh functionality

- **All Collections Hook Tests** (`__tests__/hooks/useAllCollections.test.ts`)
  - Tests for the `useAllCollections` hook
  - Verifies managing multiple collections, aggregating loading states and errors

### Mock Implementations

- **Mock MongoDB** (`__tests__/mocks/mockMongoDB.ts`)
  - In-memory implementation of MongoDB collections
  - Allows testing without actual database connections

- **Mock Data** (`__tests__/mocks/mockData.ts`)
  - Sample data for different collection types
  - Used in tests to simulate database records

- **Test Setup** (`__tests__/mocks/setupTests.ts`)
  - Jest setup file with global mocks
  - Mocks for fetch API and React hooks

## Running Tests

To run the tests:

```bash
npm test
```

## Future Improvements

Potential improvements for the test suite:

1. Add integration tests that test multiple components together
2. Add more edge cases and error scenarios
3. Add performance tests for caching mechanisms
4. Add tests for the `createCollectionHook` factory function
