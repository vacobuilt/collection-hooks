import { StandardizableFields } from '../types';

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

/**
 * Standardize field names across collections
 * 
 * This function maps various field names to their standardized equivalents
 * based on the entity type. It ensures consistent field naming across
 * different collection types.
 * 
 * @param item The item to standardize
 * @param entityType The type of entity (e.g., 'case-study', 'solution')
 * @param customMappings Optional custom field mappings
 * @returns A new object with standardized field names
 */
export function standardizeFields<T extends StandardizableFields>(
  item: T, 
  entityType: string,
  customMappings: Record<string, string> = {}
): T {
  // Create a copy to avoid mutating the original
  const standardized = { ...item } as T;
  
  // Apply custom mappings first
  for (const [from, to] of Object.entries(customMappings)) {
    if (standardized[from as keyof T] !== undefined && standardized[to as keyof T] === undefined) {
      standardized[to as keyof T] = standardized[from as keyof T];
    }
  }
  
  // Handle name/title standardization
  if (entityType === 'case-study' || entityType === 'service') {
    standardized.name = standardized.name || standardized.title;
  }
  
  // Handle description standardization
  if (entityType === 'solution') {
    standardized.description = standardized.description || standardized.solutionNarrative;
  }
  
  // Handle problem statement standardization
  if (entityType === 'case-study') {
    standardized.problemStatement = standardized.problemStatement || standardized.challenge;
  } else if (entityType === 'solution') {
    standardized.problemStatement = standardized.problemStatement || 
      (standardized.primaryChallenges ? standardized.primaryChallenges.join('. ') : undefined);
  }
  
  // Handle key features standardization
  if (entityType === 'service') {
    standardized.keyFeatures = standardized.keyFeatures || standardized.benefits;
  } else if (entityType === 'solution') {
    standardized.keyFeatures = standardized.keyFeatures || standardized.outcomeMetrics;
  }
  
  return standardized;
}

/**
 * Standardize an array of items
 * 
 * @param items The items to standardize
 * @param entityType The type of entity (e.g., 'case-study', 'solution')
 * @param customMappings Optional custom field mappings
 * @returns A new array with standardized items
 */
export function standardizeItems<T extends StandardizableFields>(
  items: T[], 
  entityType: string,
  customMappings: Record<string, string> = {}
): T[] {
  return items.map(item => standardizeFields(item, entityType, customMappings));
}
