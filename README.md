# @highspringlabs/collection-hooks

React hooks for MongoDB collections with field standardization and caching.

## Installation

```bash
npm install @highspringlabs/collection-hooks
# or
yarn add @highspringlabs/collection-hooks
```

## Features

- Generic collection hooks for fetching and caching data
- Type-safe with full TypeScript support
- Built-in field standardization
- Server-side caching
- Client-side caching
- Support for refreshing data and bypassing cache

## Usage

### Configuration

Before using the hooks, you need to configure the MongoDB connection:

```typescript
// In your app initialization (e.g., _app.tsx for Next.js)
import { configureCollectionHooks } from '@highspringlabs/collection-hooks';

// Simple configuration with MongoDB URI
configureCollectionHooks({
  mongodbUri: 'mongodb://localhost:27017',
  dbName: 'mydatabase',
});

// Or with advanced options
configureCollectionHooks({
  mongodbUri: 'mongodb://username:password@localhost:27017',
  dbName: 'mydatabase',
  options: {
    // MongoDB client options
    connectTimeoutMS: 5000,
  },
});

// Or with an existing database connection
import { Db, MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('mydatabase');

configureCollectionHooks({
  database: db,
});

// Or with a function that returns a database connection
configureCollectionHooks({
  getDatabaseFn: async () => {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    return client.db('mydatabase');
  },
});
```

### Basic Usage

```tsx
import { useCollection } from '@highspringlabs/collection-hooks';

function MyComponent() {
  const { data, loading, error, refresh } = useCollection<User>('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### With Initial Data (SSR)

```tsx
import { useCollection } from '@highspringlabs/collection-hooks';

export async function getServerSideProps() {
  const res = await fetch('http://api.example.com/users');
  const initialUsers = await res.json();
  
  return {
    props: { initialUsers },
  };
}

function MyComponent({ initialUsers }) {
  const { data } = useCollection<User>('/api/users', initialUsers);
  
  // Rest of component
}
```

### Creating Collection API Endpoints

```typescript
// pages/api/users.ts
import { createCollectionApi } from '@highspringlabs/collection-hooks';
import { UserSchema } from '@/schemas';

const { getAll, getById, create, update, remove } = createCollectionApi(
  'users',
  UserSchema,
  {
    cacheTime: 60 * 1000, // 1 minute
    standardizeFields: true,
  }
);

export { getAll, getById, create, update, remove };
```

## API Reference

### Hooks

#### `useCollection<T>(endpoint: string, initialData?: T[], options?: CollectionOptions): CollectionHookResult<T>`

Base hook for fetching and caching collection data.

#### `useCollectionQuery<T>(url: string | null): CollectionQueryResult<T>`

Hook for fetching data from an API endpoint.

#### `useCollectionMutation<T>(url: string): CollectionMutationResult<T>`

Hook for mutating data through an API endpoint.

#### `useAllCollections(): AllCollectionsResult`

Hook for managing multiple collections.

### Server Utilities

#### `createCollectionApi<T>(collectionName: string, schema: z.ZodType<T>, options?: ApiOptions): CollectionApi<T>`

Factory function for creating collection API endpoints.

### Types

#### `CollectionHookResult<T>`

```typescript
{
  data: T[];
  error: Error | null;
  loading: boolean;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
}
```

#### `CollectionQueryResult<T>`

```typescript
{
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => Promise<void>;
}
```

#### `CollectionMutationResult<T>`

```typescript
{
  data: T | null;
  error: Error | null;
  loading: boolean;
  mutate: (body: any) => Promise<T | null>;
}
```

### Closing the Connection

When your application shuts down, you can close the MongoDB connection:

```typescript
import { closeConnection } from '@highspringlabs/collection-hooks';

// In your app's cleanup code
await closeConnection();
```

## Migration from 0.x to 1.0

Version 1.0 introduces a simplified configuration system that makes it easier to use collection-hooks with MongoDB. Here's how to migrate:

### Before (0.x)

```typescript
// Custom database implementation
import { MongoClient } from 'mongodb';

// Manual connection setup
const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('mydatabase');

// Custom override of the database module
jest.mock('@highspringlabs/collection-hooks/server/database', () => ({
  getDatabase: async () => db
}));
```

### After (1.0)

```typescript
import { configureCollectionHooks } from '@highspringlabs/collection-hooks';

// Simple configuration
configureCollectionHooks({
  mongodbUri: 'mongodb://localhost:27017',
  dbName: 'mydatabase'
});

// Or use an existing connection
configureCollectionHooks({
  database: existingDbConnection
});
```

## License

MIT
