/**
 * Common utility functions
 */

/**
 * Get the entity type from the collection name
 * 
 * @param collectionName The name of the collection
 * @returns The entity type
 */
export function getEntityType(collectionName: string): string {
  // Handle special case for case-studies
  if (collectionName === 'case-studies') {
    return 'case-study';
  }
  
  // Remove trailing 's' for other collections
  return collectionName.endsWith('s')
    ? collectionName.slice(0, -1)
    : collectionName;
}
