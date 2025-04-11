# Getting Started with @highspringlabs/collection-hooks

This guide will walk you through the basic setup and usage of `@highspringlabs/collection-hooks`, a package that provides React hooks for MongoDB collections with caching and type safety.

## 1. Installation

```bash
npm install @highspringlabs/collection-hooks
# or
yarn add @highspringlabs/collection-hooks
```

## 2. Server-Side Configuration

First, configure the MongoDB connection in your server code:

```typescript
// In your server initialization file (e.g., app.ts or server.ts)
import { configureCollectionHooks } from '@highspringlabs/collection-hooks/server';

// Simple configuration with connection string including username, password, and database
configureCollectionHooks({
  mongodbUri: 'mongodb://username:password@localhost:27017/mydatabase',
  debug: true // Optional: enables helpful connection logging
});
```

## 3. Define a Schema with Zod

Create a schema for your data model using Zod:

```typescript
// schemas/User.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
  createdAt: z.date().default(() => new Date())
});

// Derive the TypeScript type from the schema
export type User = z.infer<typeof UserSchema>;
```

### MongoDB Collection Structure

The schema you define corresponds directly to how your documents are stored in MongoDB. For example, with the `User` schema above, your MongoDB collection would contain documents that look like this:

```json
{
  "_id": "ObjectId('60d21b4667d0d8992e610c85')",  // MongoDB's internal ID
  "id": "user-123",                               // Your application's ID field
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "createdAt": "2025-04-11T13:45:00.000Z"
}
```

When you use the `useCollection` hook in your JavaScript/TypeScript code, the data is automatically transformed from the MongoDB document format to match your defined schema type. This gives you type safety throughout your application while maintaining flexibility in how your data is stored.

Note that while MongoDB automatically adds an `_id` field to each document, the package uses your specified `id` field for operations like updates and deletes. This allows you to use your own ID generation strategy (like UUIDs) while still benefiting from MongoDB's indexing.

## 4. Create API Endpoints

Set up API endpoints for your collection:

```typescript
// pages/api/users.ts (for Next.js) or equivalent route handler
import { createCollectionApi } from '@highspringlabs/collection-hooks/server';
import { UserSchema } from '../../schemas/User';

const userApi = createCollectionApi('users', UserSchema);

// Export handlers for API routes
export const { getAll, getById, create, update, remove } = userApi;

// For Next.js App Router
export async function GET(req: Request) {
  return userApi.getAll(req);
}

export async function POST(req: Request) {
  return userApi.create(req);
}

// For Next.js Pages Router
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return userApi.getAll(req, res);
  } else if (req.method === 'POST') {
    return userApi.create(req, res);
  }
  // Handle other methods as needed
}
```

## 5. Using the Collection Hook in React Components

### Retrieving Data

```tsx
// components/UserList.tsx
import { useCollection } from '@highspringlabs/collection-hooks/client';
import { User } from '../schemas/User';

function UserList() {
  const { data, loading, error, refresh } = useCollection<User>('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Users</h1>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {data.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Inserting/Updating Data

```tsx
// components/UserForm.tsx
import { useState } from 'react';
import { useCollectionMutation } from '@highspringlabs/collection-hooks/client';
import { User } from '../schemas/User';
import { v4 as uuidv4 } from 'uuid'; // For generating IDs

function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // For creating new users
  const { mutate: createUser, loading: creating } = 
    useCollectionMutation<User>('/api/users');
  
  // For updating existing users (if you have a user ID)
  const { mutate: updateUser, loading: updating } = 
    useCollectionMutation<User>(`/api/users/${userId}`);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For creating a new user
    const newUser = {
      id: uuidv4(), // Generate a unique ID
      name,
      email,
      createdAt: new Date()
    };
    
    const result = await createUser(newUser);
    
    if (result) {
      // Success! Clear the form
      setName('');
      setEmail('');
      // Optionally refresh the user list
      // userListRefresh();
    }
  };
  
  // Example update function
  const handleUpdate = async () => {
    const updatedUser = {
      id: userId, // Existing user ID
      name,
      email
    };
    
    const result = await updateUser(updatedUser);
    
    if (result) {
      // Success! Handle accordingly
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New User</h2>
      <div>
        <label>
          Name:
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </label>
      </div>
      <button type="submit" disabled={creating}>
        {creating ? 'Adding...' : 'Add User'}
      </button>
    </form>
  );
}
```

## 6. Putting It All Together

Here's a complete example of a component that both displays users and allows adding new ones:

```tsx
// components/UserManager.tsx
import { useState } from 'react';
import { useCollection, useCollectionMutation } from '@highspringlabs/collection-hooks/client';
import { User } from '../schemas/User';
import { v4 as uuidv4 } from 'uuid';

export default function UserManager() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Get all users
  const { 
    data: users, 
    loading, 
    error, 
    refresh 
  } = useCollection<User>('/api/users');
  
  // Create new user
  const { 
    mutate: createUser, 
    loading: creating 
  } = useCollectionMutation<User>('/api/users');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newUser = {
      id: uuidv4(),
      name,
      email,
      createdAt: new Date()
    };
    
    const result = await createUser(newUser);
    
    if (result) {
      setName('');
      setEmail('');
      refresh(); // Refresh the user list
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>User Management</h1>
      
      {/* User List */}
      <div>
        <h2>Users ({users.length})</h2>
        <button onClick={refresh}>Refresh</button>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </div>
      
      {/* User Form */}
      <form onSubmit={handleSubmit}>
        <h2>Add New User</h2>
        <div>
          <label>
            Name:
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </label>
        </div>
        <button type="submit" disabled={creating}>
          {creating ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </div>
  );
}
```

That's it! With just these few steps, you've set up a complete system for working with MongoDB collections in your React application, with type safety, caching, and a clean separation of concerns.
