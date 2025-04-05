import { 
  getEntityType, 
  standardizeFields, 
  standardizeItems 
} from '../../src/utils/standardization';
import { StandardizableFields } from '../../src/types';

describe('Standardization Utilities', () => {
  describe('getEntityType', () => {
    it('should return singular form of collection name', () => {
      expect(getEntityType('users')).toBe('user');
      expect(getEntityType('solutions')).toBe('solution');
      expect(getEntityType('services')).toBe('service');
    });

    it('should handle special case for case-studies', () => {
      expect(getEntityType('case-studies')).toBe('case-study');
    });

    it('should return the original name if already singular', () => {
      expect(getEntityType('user')).toBe('user');
      expect(getEntityType('dashboard')).toBe('dashboard');
    });
  });

  describe('standardizeFields', () => {
    it('should standardize case study fields', () => {
      const caseStudy: StandardizableFields = {
        id: 'cs1',
        title: 'Case Study Title',
        challenge: 'This was a challenge'
      };

      const standardized = standardizeFields(caseStudy, 'case-study');
      
      expect(standardized.name).toBe('Case Study Title');
      expect(standardized.problemStatement).toBe('This was a challenge');
      expect(standardized.title).toBe('Case Study Title');
      expect(standardized.challenge).toBe('This was a challenge');
    });

    it('should standardize solution fields', () => {
      const solution: StandardizableFields = {
        id: 'sol1',
        name: 'Solution Name',
        solutionNarrative: 'Solution description',
        primaryChallenges: ['Challenge 1', 'Challenge 2'],
        outcomeMetrics: ['Metric 1', 'Metric 2']
      };

      const standardized = standardizeFields(solution, 'solution');
      
      expect(standardized.description).toBe('Solution description');
      expect(standardized.problemStatement).toBe('Challenge 1. Challenge 2');
      expect(standardized.keyFeatures).toEqual(['Metric 1', 'Metric 2']);
      expect(standardized.solutionNarrative).toBe('Solution description');
      expect(standardized.primaryChallenges).toEqual(['Challenge 1', 'Challenge 2']);
      expect(standardized.outcomeMetrics).toEqual(['Metric 1', 'Metric 2']);
    });

    it('should standardize service fields', () => {
      const service: StandardizableFields = {
        id: 'svc1',
        title: 'Service Title',
        description: 'Service description',
        benefits: ['Benefit 1', 'Benefit 2']
      };

      const standardized = standardizeFields(service, 'service');
      
      expect(standardized.name).toBe('Service Title');
      expect(standardized.keyFeatures).toEqual(['Benefit 1', 'Benefit 2']);
      expect(standardized.title).toBe('Service Title');
      expect(standardized.benefits).toEqual(['Benefit 1', 'Benefit 2']);
    });

    it('should apply custom field mappings', () => {
      const item: StandardizableFields = {
        id: 'item1',
        customField: 'Custom value',
        anotherField: 'Another value'
      };

      const customMappings = {
        customField: 'mappedField',
        anotherField: 'renamedField'
      };

      const standardized = standardizeFields(item, 'generic', customMappings);
      
      expect(standardized.mappedField).toBe('Custom value');
      expect(standardized.renamedField).toBe('Another value');
      expect(standardized.customField).toBe('Custom value');
      expect(standardized.anotherField).toBe('Another value');
    });

    it('should not overwrite existing fields with mappings', () => {
      const item: StandardizableFields = {
        id: 'item1',
        sourceField: 'Source value',
        targetField: 'Target value'
      };

      const customMappings = {
        sourceField: 'targetField'
      };

      const standardized = standardizeFields(item, 'generic', customMappings);
      
      expect(standardized.sourceField).toBe('Source value');
      expect(standardized.targetField).toBe('Target value');
    });
  });

  describe('standardizeItems', () => {
    it('should standardize an array of items', () => {
      const caseStudies: StandardizableFields[] = [
        {
          id: 'cs1',
          title: 'Case Study 1',
          challenge: 'Challenge 1'
        },
        {
          id: 'cs2',
          title: 'Case Study 2',
          challenge: 'Challenge 2'
        }
      ];

      const standardized = standardizeItems(caseStudies, 'case-study');
      
      expect(standardized.length).toBe(2);
      expect(standardized[0].name).toBe('Case Study 1');
      expect(standardized[0].problemStatement).toBe('Challenge 1');
      expect(standardized[1].name).toBe('Case Study 2');
      expect(standardized[1].problemStatement).toBe('Challenge 2');
    });

    it('should apply custom mappings to all items', () => {
      const items: StandardizableFields[] = [
        {
          id: 'item1',
          sourceField: 'Value 1'
        },
        {
          id: 'item2',
          sourceField: 'Value 2'
        }
      ];

      const customMappings = {
        sourceField: 'targetField'
      };

      const standardized = standardizeItems(items, 'generic', customMappings);
      
      expect(standardized.length).toBe(2);
      expect(standardized[0].targetField).toBe('Value 1');
      expect(standardized[1].targetField).toBe('Value 2');
    });
  });
});
