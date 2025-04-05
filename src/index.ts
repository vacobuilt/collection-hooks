// Re-export everything from client and server for backward compatibility
// WARNING: Using this entry point in client components may cause bundling issues
// with server-only modules. Use the specific client or server entry points instead.

// Client exports
export * from './client';

// Server exports
export * from './server';
