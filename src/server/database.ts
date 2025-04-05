/**
 * Database connection module
 */

import { Collection, Db } from 'mongodb';
import { getDatabase as getConfiguredDatabase } from './config';

/**
 * Get the database connection
 * @returns Promise that resolves to the database connection
 */
export async function getDatabase(): Promise<Db> {
  return getConfiguredDatabase();
}

/**
 * Get a collection with type safety
 * @param collectionName The name of the collection
 * @returns Promise that resolves to the collection
 */
export async function getCollection<T extends Record<string, any>>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}
