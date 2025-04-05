# @highspringlabs/collection-hooks

React hooks for MongoDB collections with caching and type safety.

## Installation

```bash
npm install @highspringlabs/collection-hooks
# or
yarn add @highspringlabs/collection-hooks
```

## Features

- Generic collection hooks for fetching and caching data
- Type-safe with full TypeScript support
- Server-side caching
- Client-side caching
- Support for refreshing data and bypassing cache
- Clean separation of client and server code
- Compatible with Next.js 15+ module bundling

## Usage

### Configuration

Before using the hooks, you need to configure the MongoDB connection:

```typescript
// In your app initialization (e.g., _app.tsx for Next.js)
import { configureCollectionHooks } from '@highspringlabs/collection-hooks/server';

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
import { useCollection } from '@highspringlabs/collection-hooks/client';

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
import { useCollection } from '@highspringlabs/collection-hooks/client';

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
import { createCollectionApi } from '@highspringlabs/collection-hooks/server';
import { UserSchema } from '@/schemas';

const { getAll, getById, create, update, remove } = createCollectionApi(
  'users',
  UserSchema,
  {
    cacheTime: 60 * 1000, // 1 minute
    validateOnWrite: true,
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
import { closeConnection } from '@highspringlabs/collection-hooks/server';

// In your app's cleanup code
await closeConnection();
```

## Client-Server Separation (v1.1.0+)

Version 1.1.0 introduces a clean separation between client and server code to prevent server-only modules from being included in client bundles. This is especially important for Next.js 15+ applications, which may encounter errors like:

```
Error: Node.js binary module ./node_modules/mongodb-client-encryption/build/Release/mongocrypt.node is not supported in the browser. Please only use the module on server side
```

### Using Separate Entry Points

To properly separate client and server code, use the specific entry points:

```typescript
// In server components or API routes
import { configureCollectionHooks, createCollectionApi } from '@highspringlabs/collection-hooks/server';

// In client components
import { useCollection, useCollectionQuery } from '@highspringlabs/collection-hooks/client';
```

### Backward Compatibility

The main entry point still works for backward compatibility, but may cause bundling issues in client components:

```typescript
// Not recommended for client components in Next.js 15+
import { useCollection, configureCollectionHooks } from '@highspringlabs/collection-hooks';
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

## Migration from 1.0.0 to 1.1.0

Version 1.1.0 introduces client-server separation. Here's how to migrate:

### Before (1.0.0)

```typescript
// In server code
import { configureCollectionHooks, createCollectionApi } from '@highspringlabs/collection-hooks';

// In client code
import { useCollection, useCollectionQuery } from '@highspringlabs/collection-hooks';
```

### After (1.1.0)

```typescript
// In server code
import { configureCollectionHooks, createCollectionApi } from '@highspringlabs/collection-hooks/server';

// In client code
import { useCollection, useCollectionQuery } from '@highspringlabs/collection-hooks/client';
```

## Migration from 1.1.0 to 1.1.1

Version 1.1.1 removes the field standardization utilities to make the library more schema-agnostic. Here's how to migrate:

### Before (1.1.0)

```typescript
// In client code
import { useCollection, standardizeClientFields } from '@highspringlabs/collection-hooks/client';

// Using standardization in hooks
const { data } = useCollection('/api/users', [], {
  standardizeFields: true,
  fieldMappings: {
    title: 'name'
  }
});

// Using standardization directly
const standardizedData = standardizeClientFields(data, 'user', {
  title: 'name'
});

// In server code
import { createCollectionApi, standardizeServerFields } from '@highspringlabs/collection-hooks/server';

// Using standardization in API
const api = createCollectionApi('users', UserSchema, {
  standardizeFields: true,
  fieldMappings: {
    title: 'name'
  }
});
```

### After (1.1.1)

```typescript
// In client code
import { useCollection } from '@highspringlabs/collection-hooks/client';

// Using transform function instead of standardization
const { data } = useCollection('/api/users', [], {
  transformResponse: (data) => {
    return data.map(item => ({
      ...item,
      name: item.title || item.name
    }));
  }
});

// In server code
import { createCollectionApi } from '@highspringlabs/collection-hooks/server';

// Using hooks instead of standardization
const api = createCollectionApi('users', UserSchema, {
  hooks: {
    afterRead: (data) => {
      return data.map(item => ({
        ...item,
        name: item.title || item.name
      }));
    }
  }
});
```

## License

MIT
