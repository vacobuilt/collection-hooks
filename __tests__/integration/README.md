# MongoDB Connection Integration Test

This directory contains integration tests that validate the connection to MongoDB and test the client-side hooks with real data.

## Running the MongoDB Connection Test

The MongoDB connection test requires a real MongoDB connection to run. It will automatically skip if no MongoDB URI is provided.

### Prerequisites

- A MongoDB instance (local, Atlas, or other)
- A connection string with username, password, and database name

### Running the Test

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

### What the Test Does

The test performs the following:

1. **Server-side MongoDB Connection**:
   - Connects to MongoDB using the provided URI
   - Verifies the connection is successful
   - Lists all collections in the database

2. **Client-side Hook Testing**:
   - Mocks the fetch API to simulate a real API call
   - Uses the real collection names from the database
   - Tests the `useCollection` hook with the mocked data
   - Verifies loading states, data retrieval, and error handling

### Skipping the Test

If you don't want to run the MongoDB connection test, simply run the tests without providing the MONGODB_URI environment variable. The test will automatically skip with a warning message.

## Troubleshooting

If you encounter issues with the test:

1. **Connection Errors**: Verify your MongoDB URI is correct and that your IP address is allowed in the MongoDB Atlas network settings (if using Atlas).

2. **Authentication Errors**: Ensure the username and password in the connection string are correct.

3. **Database Access**: Make sure the user has the necessary permissions to list collections in the database.

4. **Network Issues**: Check if your network allows connections to the MongoDB instance.
