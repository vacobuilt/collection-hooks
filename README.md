# @highspringlabs/collection-hooks

React hooks and server side functions for using MongoDB collections with caching and type safety. Initially built to run in a NextJS environment, this package can be used in any React app (included integration tests assume react-only). See [HOWTO.md](dist/HOWTO.md) for a concise explanation on using this package.

## Quick Reference

| Category | Function | Description | Import From |
|----------|----------|-------------|------------|
| **Client Hooks** | `useCollection` | Base hook for fetching and caching collection data | `@highspringlabs/collection-hooks/client` |
| | `useCollectionQuery` | Low-level hook for fetching data from an API endpoint | `@highspringlabs/collection-hooks/client` |
| | `useCollectionMutation` | Hook for mutating data through an API endpoint | `@highspringlabs/collection-hooks/client` |
| | `useAllCollections` | Hook for managing multiple collections | `@highspringlabs/collection-hooks/client` |
| **Client Utilities** | `createCollectionHook` | Factory function for creating specialized collection hooks | `@highspringlabs/collection-hooks/client` |
| | `clientCache` | Utility for client-side caching | `@highspringlabs/collection-hooks/client` |
| **Server Configuration** | `configureCollectionHooks` | Configure the MongoDB connection | `@highspringlabs/collection-hooks/server` |
| | `getDatabase` | Get the configured database connection | `@highspringlabs/collection-hooks/server` |
| | `closeConnection` | Close the database connection | `@highspringlabs/collection-hooks/server` |
| **Server API** | `createCollectionApi` | Factory function for creating collection API endpoints | `@highspringlabs/collection-hooks/server` |
| | `getCollection` | Get a MongoDB collection with type safety | `@highspringlabs/collection-hooks/server` |
| **Server Utilities** | `serverCache` | Utility for server-side caching | `@highspringlabs/collection-hooks/server` |

See the [API Reference](#api-reference) section for detailed documentation.

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

// With debug mode enabled
configureCollectionHooks({
  mongodbUri: 'mongodb://localhost:27017',
  dbName: 'mydatabase',
  debug: true, // Logs helpful connection information to the console
});

// Or with advanced options
configureCollectionHooks({
  mongodbUri: 'mongodb://username:password@localhost:27017',
  dbName: 'mydatabase',
  options: {
    // MongoDB client options
    connectTimeoutMS: 5000,
  },
  debug: false, // Debug mode is disabled by default
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

### Client-Side Functions

The following functions are available from the client-side entry point (`@highspringlabs/collection-hooks/client`):

#### Hooks

##### `useCollection<T>(endpoint: string, initialData?: T[], options?: CollectionOptions): CollectionHookResult<T>`

Base hook for fetching and caching collection data.

```typescript
import { useCollection } from '@highspringlabs/collection-hooks/client';

function UsersComponent() {
  const { data, loading, error, refresh, refetch } = useCollection<User>('/api/users');
  
  // Use data, loading, error states
  // Call refresh() to force a refresh from server
  // Call refetch() to refetch data respecting cache settings
}
```

##### `useCollectionQuery<T>(url: string | null): CollectionQueryResult<T>`

Low-level hook for fetching data from an API endpoint.

```typescript
import { useCollectionQuery } from '@highspringlabs/collection-hooks/client';

function DataComponent() {
  const { data, error, loading, refetch } = useCollectionQuery<ApiResponse>('/api/data');
  
  // Use data, loading, error states
  // Call refetch() to refetch data
}
```

##### `useCollectionMutation<T>(url: string): CollectionMutationResult<T>`

Hook for mutating data through an API endpoint.

```typescript
import { useCollectionMutation } from '@highspringlabs/collection-hooks/client';

function CreateUserForm() {
  const { data, error, loading, mutate } = useCollectionMutation<User>('/api/users');
  
  const handleSubmit = async (userData) => {
    const result = await mutate(userData);
    // Handle result
  };
}
```

##### `useAllCollections<T>(config: AllCollectionsConfig<T>): AllCollectionsResult<T>`

Hook for managing multiple collections.

```typescript
import { useAllCollections } from '@highspringlabs/collection-hooks/client';

function DashboardComponent() {
  const { data, loading, error, refreshAll } = useAllCollections({
    endpoints: {
      users: '/api/users',
      posts: '/api/posts',
      comments: '/api/comments'
    },
    initialData: {
      users: [],
      posts: [],
      comments: []
    }
  });
  
  // Access data.users, data.posts, data.comments
  // Call refreshAll() to refresh all collections
}
```

#### Utilities

##### `createCollectionHook<T>(endpoint: string): (initialData?: T[]) => CollectionHookResult<T>`

Factory function for creating specialized collection hooks.

```typescript
import { createCollectionHook } from '@highspringlabs/collection-hooks/client';

// Create a specialized hook for users
const useUsers = createCollectionHook<User>('/api/users');

function UsersComponent() {
  // Use the specialized hook
  const { data, loading, error } = useUsers();
}
```

##### `clientCache`

Utility for client-side caching.

```typescript
import { clientCache } from '@highspringlabs/collection-hooks/client';

// Set cache
clientCache.set('key', data, 60000); // Cache for 60 seconds

// Get from cache
const data = clientCache.get('key');

// Check if cache exists
const exists = clientCache.has('key');

// Delete from cache
clientCache.delete('key');

// Clear all cache
clientCache.clear();
```

### Server-Side Functions

The following functions are available from the server-side entry point (`@highspringlabs/collection-hooks/server`):

#### Configuration

##### `configureCollectionHooks(config: CollectionHooksConfig | AdvancedCollectionHooksConfig): void`

Configure the MongoDB connection.

```typescript
import { configureCollectionHooks } from '@highspringlabs/collection-hooks/server';

// Basic configuration
configureCollectionHooks({
  mongodbUri: 'mongodb://localhost:27017',
  dbName: 'mydatabase',
  debug: true
});

// Advanced configuration
configureCollectionHooks({
  // Option 1: Connection string
  mongodbUri: 'mongodb://username:password@localhost:27017',
  dbName: 'mydatabase',
  
  // OR Option 2: Existing database connection
  // database: existingDbConnection,
  
  // OR Option 3: Function that returns a database connection
  // getDatabaseFn: async () => { return db; },
  
  debug: true
});
```

##### `getDatabase(): Promise<Db>`

Get the configured database connection.

```typescript
import { getDatabase } from '@highspringlabs/collection-hooks/server';

async function getDatabaseInfo() {
  const db = await getDatabase();
  // Use the database connection
}
```

##### `closeConnection(): Promise<void>`

Close the database connection.

```typescript
import { closeConnection } from '@highspringlabs/collection-hooks/server';

// In your app's cleanup code
async function cleanup() {
  await closeConnection();
}
```

#### API Creation

##### `createCollectionApi<T>(collectionName: string, schema: z.ZodType<T>, options?: ApiOptions): CollectionApi<T>`

Factory function for creating collection API endpoints.

```typescript
import { createCollectionApi } from '@highspringlabs/collection-hooks/server';
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// Create API endpoints
const userApi = createCollectionApi('users', UserSchema, {
  cacheTime: 60 * 1000, // 1 minute
  validateOnWrite: true,
  hooks: {
    beforeRead: (query) => ({ ...query, active: true }),
    afterRead: (data) => data.map(user => ({ ...user, displayName: user.name })),
    beforeWrite: (data) => ({ ...data, updatedAt: new Date() }),
    afterWrite: (data) => ({ ...data, processed: true })
  }
});

// Use in API routes
export async function GET(req) {
  return userApi.getAll(req);
}

export async function POST(req) {
  return userApi.create(req);
}
```

##### `getCollection<T>(collectionName: string): Promise<Collection<T>>`

Get a MongoDB collection with type safety.

```typescript
import { getCollection } from '@highspringlabs/collection-hooks/server';

async function getUsersCollection() {
  const collection = await getCollection<User>('users');
  // Use the collection
}
```

#### Utilities

##### `serverCache`

Utility for server-side caching.

```typescript
import { serverCache } from '@highspringlabs/collection-hooks/server';

// Set cache
serverCache.set('key', data, 60000); // Cache for 60 seconds

// Get from cache
const data = serverCache.get('key');

// Check if cache exists
const exists = serverCache.has('key');

// Delete from cache
serverCache.delete('key');

// Clear all cache
serverCache.clear();
```

### Types

#### `CollectionHookResult<T>`

```typescript
{
  data: T[];                      // Collection data
  error: Error | null;            // Error if any
  loading: boolean;               // Loading state
  refresh: () => Promise<void>;   // Force refresh from server
  refetch: () => Promise<void>;   // Refetch respecting cache
}
```

#### `CollectionQueryResult<T>`

```typescript
{
  data: T | null;                 // Query result
  error: Error | null;            // Error if any
  loading: boolean;               // Loading state
  refetch: () => Promise<void>;   // Refetch data
}
```

#### `CollectionMutationResult<T>`

```typescript
{
  data: T | null;                       // Mutation result
  error: Error | null;                  // Error if any
  loading: boolean;                     // Loading state
  mutate: (body: any) => Promise<T | null>; // Mutation function
}
```

#### `AllCollectionsResult<T>`

```typescript
{
  data: {                         // Data for all collections
    [K in keyof T]: T[K][];
  };
  loading: boolean;               // Loading state
  error: Error | null;            // Error if any
  refreshAll: () => Promise<void>; // Refresh all collections
}
```

#### `CollectionApi<T>`

```typescript
{
  getAll: (req: Request) => Promise<Response>;                                  // Get all items
  getById: (req: Request, context: { params: { id: string } }) => Promise<Response>; // Get item by ID
  create: (req: Request) => Promise<Response>;                                  // Create item
  update: (req: Request, context: { params: { id: string } }) => Promise<Response>; // Update item
  remove: (req: Request, context: { params: { id: string } }) => Promise<Response>; // Delete item
  refreshCache: (req: Request) => Promise<Response>;                            // Refresh cache
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

## Testing with a Real MongoDB Connection

The package includes an integration test that validates the connection to MongoDB and tests the client-side hooks with real data. This test is useful for verifying that the package works correctly in a real-world scenario.

### Running the MongoDB Connection Test

There are two ways to provide the MongoDB URI for the test:

#### Option 1: Using a .env.local file

Create a `.env.local` file in the root directory with your MongoDB URI:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

Then run the test:

```bash
npm test -- --testPathPattern=integration
```

The test will automatically load the environment variables from the `.env.local` file.

#### Option 2: Providing the URI directly

Alternatively, you can provide the MongoDB URI directly as an environment variable:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database npm test -- --testPathPattern=integration
```

Replace `mongodb+srv://username:password@cluster.mongodb.net/database` with your actual MongoDB connection string.

The test will:
1. Connect to MongoDB using the provided URI
2. List all collections in the database
3. Test the client-side hooks with the real collection data

If no MongoDB URI is provided, the test will automatically skip with a warning message.

For more details, see the [integration test README](__tests__/integration/README.md).

## License

MIT
