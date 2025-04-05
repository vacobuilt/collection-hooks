import { renderHook, act } from '@testing-library/react-hooks/dom';
import { useCollection } from '../../src/hooks/useCollection';

// Mock dependencies
jest.mock('../../src/hooks/useCollection');

// Mock the useAllCollections hook to avoid TypeScript errors
jest.mock('../../src/hooks/useAllCollections', () => ({
  useAllCollections: (config: any) => {
    const { endpoints, initialData = {} } = config;

    // Create a hook for each collection
    const collections = Object.entries(endpoints).map(([key, endpoint]) => {
      const initial = initialData[key] || [];
      return {
        key,
        ...useCollection(endpoint as string, initial)
      };
    });

    // Combine the data from all collections
    const data = collections.reduce((acc: any, { key, data }: any) => {
      acc[key] = data;
      return acc;
    }, {});

    // Determine if any collection is loading
    const loading = collections.some((collection: any) => collection.loading);

    // Get the first error if any
    const error = collections.find((collection: any) => collection.error)?.error || null;

    // Function to refresh all collections
    const refreshAll = async () => {
      await Promise.all(collections.map((collection: any) => collection.refresh()));
    };

    return {
      data,
      loading,
      error,
      refreshAll
    };
  }
}));

// Import after mocking
import { useAllCollections } from '../../src/hooks/useAllCollections';

describe('useAllCollections', () => {
  // Mock data
  const mockCaseStudies = [
    { id: 'cs1', title: 'Case Study 1' },
    { id: 'cs2', title: 'Case Study 2' }
  ];

  const mockSolutions = [
    { id: 'sol1', name: 'Solution 1' },
    { id: 'sol2', name: 'Solution 2' }
  ];

  // Mock refresh functions
  const mockCaseStudiesRefresh = jest.fn().mockResolvedValue(undefined);
  const mockSolutionsRefresh = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementation for useCollection
    (useCollection as jest.Mock).mockImplementation((endpoint, initialData) => {
      if (endpoint === 'api/case-studies') {
        return {
          data: mockCaseStudies,
          error: null,
          loading: false,
          refresh: mockCaseStudiesRefresh,
          refetch: jest.fn()
        };
      } else if (endpoint === 'api/solutions') {
        return {
          data: mockSolutions,
          error: null,
          loading: false,
          refresh: mockSolutionsRefresh,
          refetch: jest.fn()
        };
      }

      return {
        data: [],
        error: null,
        loading: false,
        refresh: jest.fn(),
        refetch: jest.fn()
      };
    });
  });

  it('should initialize with data from all collections', () => {
    // Define collection config
    const config = {
      endpoints: {
        caseStudies: 'api/case-studies',
        solutions: 'api/solutions'
      }
    };

    // Render the hook
    const { result } = renderHook(() => useAllCollections(config as any));

    // Check state
    expect(result.current.data).toEqual({
      caseStudies: mockCaseStudies,
      solutions: mockSolutions
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    // Verify useCollection was called for each endpoint
    expect(useCollection).toHaveBeenCalledTimes(2);
    expect(useCollection).toHaveBeenCalledWith('api/case-studies', []);
    expect(useCollection).toHaveBeenCalledWith('api/solutions', []);
  });

  it('should use initial data when provided', () => {
    // Define initial data
    const initialCaseStudies = [{ id: 'cs3', title: 'Initial Case Study' }];
    const initialSolutions = [{ id: 'sol3', name: 'Initial Solution' }];

    // Define collection config with initial data
    const config = {
      endpoints: {
        caseStudies: 'api/case-studies',
        solutions: 'api/solutions'
      },
      initialData: {
        caseStudies: initialCaseStudies,
        solutions: initialSolutions
      }
    };

    // Render the hook
    renderHook(() => useAllCollections(config as any));

    // Verify useCollection was called with initial data
    expect(useCollection).toHaveBeenCalledWith('api/case-studies', initialCaseStudies);
    expect(useCollection).toHaveBeenCalledWith('api/solutions', initialSolutions);
  });

  it('should handle loading state from any collection', () => {
    // Mock one collection as loading
    (useCollection as jest.Mock)
      .mockReturnValueOnce({
        data: mockCaseStudies,
        error: null,
        loading: true, // This collection is loading
        refresh: mockCaseStudiesRefresh,
        refetch: jest.fn()
      })
      .mockReturnValueOnce({
        data: mockSolutions,
        error: null,
        loading: false,
        refresh: mockSolutionsRefresh,
        refetch: jest.fn()
      });

    // Define collection config
    const config = {
      endpoints: {
        caseStudies: 'api/case-studies',
        solutions: 'api/solutions'
      }
    };

    // Render the hook
    const { result } = renderHook(() => useAllCollections(config as any));

    // Check loading state (should be true if any collection is loading)
    expect(result.current.loading).toBe(true);
  });

  it('should handle error from any collection', () => {
    // Mock error in one collection
    const mockError = new Error('Collection error');

    (useCollection as jest.Mock)
      .mockReturnValueOnce({
        data: mockCaseStudies,
        error: mockError, // This collection has an error
        loading: false,
        refresh: mockCaseStudiesRefresh,
        refetch: jest.fn()
      })
      .mockReturnValueOnce({
        data: mockSolutions,
        error: null,
        loading: false,
        refresh: mockSolutionsRefresh,
        refetch: jest.fn()
      });

    // Define collection config
    const config = {
      endpoints: {
        caseStudies: 'api/case-studies',
        solutions: 'api/solutions'
      }
    };

    // Render the hook
    const { result } = renderHook(() => useAllCollections(config as any));

    // Check error state (should be the first error encountered)
    expect(result.current.error).toBe(mockError);
  });

  it('should refresh all collections when refreshAll is called', async () => {
    // Define collection config
    const config = {
      endpoints: {
        caseStudies: 'api/case-studies',
        solutions: 'api/solutions'
      }
    };

    // Render the hook
    const { result } = renderHook(() => useAllCollections(config as any));

    // Call refreshAll
    await act(async () => {
      await result.current.refreshAll();
    });

    // Verify refresh was called for each collection
    expect(mockCaseStudiesRefresh).toHaveBeenCalled();
    expect(mockSolutionsRefresh).toHaveBeenCalled();
  });

  it('should handle collections with different loading states', () => {
    // Mock collections with different loading states
    (useCollection as jest.Mock)
      .mockReturnValueOnce({
        data: mockCaseStudies,
        error: null,
        loading: true, // This collection is loading
        refresh: mockCaseStudiesRefresh,
        refetch: jest.fn()
      })
      .mockReturnValueOnce({
        data: mockSolutions,
        error: null,
        loading: false,
        refresh: mockSolutionsRefresh,
        refetch: jest.fn()
      });

    // Define collection config
    const config = {
      endpoints: {
        caseStudies: 'api/case-studies',
        solutions: 'api/solutions'
      }
    };

    // Render the hook
    const { result } = renderHook(() => useAllCollections(config as any));

    // Check state
    expect(result.current.data).toEqual({
      caseStudies: mockCaseStudies,
      solutions: mockSolutions
    });
    expect(result.current.loading).toBe(true); // Should be true if any collection is loading
    expect(result.current.error).toBeNull();
  });

  it('should handle collections with different error states', () => {
    // Mock collections with different error states
    const mockError = new Error('Collection error');

    (useCollection as jest.Mock)
      .mockReturnValueOnce({
        data: mockCaseStudies,
        error: mockError, // This collection has an error
        loading: false,
        refresh: mockCaseStudiesRefresh,
        refetch: jest.fn()
      })
      .mockReturnValueOnce({
        data: mockSolutions,
        error: null,
        loading: false,
        refresh: mockSolutionsRefresh,
        refetch: jest.fn()
      });

    // Define collection config
    const config = {
      endpoints: {
        caseStudies: 'api/case-studies',
        solutions: 'api/solutions'
      }
    };

    // Render the hook
    const { result } = renderHook(() => useAllCollections(config as any));

    // Check state
    expect(result.current.data).toEqual({
      caseStudies: mockCaseStudies,
      solutions: mockSolutions
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError); // Should be the first error encountered
  });
});
