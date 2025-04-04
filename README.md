# @highspring/collection-hooks

React hooks for MongoDB collections with field standardization and caching.

## Installation

```bash
npm install @highspring/collection-hooks
# or
yarn add @highspring/collection-hooks
```

## Features

- Generic collection hooks for fetching and caching data
- Type-safe with full TypeScript support
- Built-in field standardization
- Server-side caching
- Client-side caching
- Support for refreshing data and bypassing cache

## Usage

### Basic Usage

```tsx
import { useCollection } from '@highspring/collection-hooks';

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
import { useCollection } from '@highspring/collection-hooks';

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
import { createCollectionApi } from '@highspring/collection-hooks/server';
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

## License

MIT
