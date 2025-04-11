import { renderHook, act } from '@testing-library/react-hooks/dom';
import { useCollection } from '../../src/hooks/useCollection';
import { useCollectionQuery } from '../../src/hooks/useCollectionQuery';
import clientCache from '../../src/utils/clientCache';

// Mock dependencies
jest.mock('../../src/hooks/useCollectionQuery');
jest.mock('../../src/utils/clientCache');

// Mock fetch globally
const mockFetch = jest.fn();
(window as any).fetch = mockFetch;

describe('useCollection', () => {
  // Mock data
  const mockItems = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useCollectionQuery implementation
    (useCollectionQuery as jest.Mock).mockReturnValue({
      data: { success: true, data: mockItems, cached: false },
      error: null,
      loading: false,
      refetch: jest.fn()
    });
    
    // Mock clientCache
    (clientCache.get as jest.Mock).mockReturnValue(null);
    (clientCache.set as jest.Mock).mockImplementation(() => {});
  });

  it('should initialize with default state and fetch data', () => {
    // Render the hook
    const { result } = renderHook(() => 
      useCollection('api/items', [])
    );

    // Check state
    expect(result.current.data).toEqual(mockItems);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    
    // Verify dependencies were called correctly
    expect(useCollectionQuery).toHaveBeenCalledWith('api/items');
    expect(clientCache.set).toHaveBeenCalledWith('collection:items', mockItems, 5 * 60 * 1000);
  });

  it('should use initial data when provided', () => {
    const initialData = [{ id: '3', title: 'Initial Item' }];
    
    // Mock useCollectionQuery to return null data initially
    (useCollectionQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      error: null,
      loading: false,
      refetch: jest.fn()
    });
    
    // Render the hook with initial data
    const { result } = renderHook(() => 
      useCollection('api/items', initialData)
    );

    // Initially it should use the initial data
    expect(result.current.data).toEqual(initialData);
  });

  it('should use cached data when available', () => {
    const cachedData = [{ id: '4', title: 'Cached Item' }];
    (clientCache.get as jest.Mock).mockReturnValue(cachedData);
    
    // Mock useCollectionQuery to return null data initially
    (useCollectionQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      error: null,
      loading: false,
      refetch: jest.fn()
    });
    
    // Mock useCollectionQuery to not return data in this test
    (useCollectionQuery as jest.Mock).mockImplementationOnce(() => ({
      data: null,
      error: null,
      loading: false,
      refetch: jest.fn()
    }));
    
    // Render the hook
    const { result } = renderHook(() => 
      useCollection('api/items', [])
    );

    // It should use the cached data
    expect(result.current.data).toEqual(cachedData);
  });

  it('should apply custom transform function', () => {
    const transformedData = [{ id: '1', title: 'Transformed Item' }];
    const transformResponse = jest.fn().mockReturnValue(transformedData);
    
    // Render the hook with custom transform function
    const { result } = renderHook(() => 
      useCollection('api/items', [], { transformResponse })
    );
    
    // Verify transform function was called and data was transformed
    expect(transformResponse).toHaveBeenCalledWith(mockItems);
    expect(result.current.data).toEqual(transformedData);
    expect(clientCache.set).toHaveBeenCalledWith('collection:items', transformedData, 5 * 60 * 1000);
  });

  it('should use custom cache time', () => {
    const customCacheTime = 10000;
    
    // Render the hook with custom cache time
    renderHook(() => 
      useCollection('api/items', [], { cacheTime: customCacheTime })
    );
    
    // Verify cache was set with custom cache time
    expect(clientCache.set).toHaveBeenCalledWith('collection:items', mockItems, customCacheTime);
  });

  it('should refresh data when refresh is called', async () => {
    // Mock fetch response for refresh
    const refreshedItems = [{ id: '5', title: 'Refreshed Item' }];
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        success: true,
        data: refreshedItems
      })
    });
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollection('api/items', [])
    );
    
    // Call refresh
    act(() => {
      result.current.refresh();
    });
    
    // It should be in refreshing state
    expect(result.current.loading).toBe(true);
    
    // Wait for the refresh to complete
    await waitForNextUpdate();
    
    // After refresh, it should have the new data
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(refreshedItems);
    
    // Verify fetch was called with the correct URL
    expect(mockFetch).toHaveBeenCalledWith('api/items', {
      method: 'POST',
    });
    
    // Verify cache was updated
    expect(clientCache.set).toHaveBeenCalledWith('collection:items', refreshedItems, 5 * 60 * 1000);
  });

  it('should handle refresh errors', async () => {
    // Mock fetch error for refresh
    const mockError = new Error('Refresh error');
    mockFetch.mockRejectedValueOnce(mockError);
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollection('api/items', [])
    );
    
    // Call refresh
    act(() => {
      result.current.refresh();
    });
    
    // It should be in refreshing state
    expect(result.current.loading).toBe(true);
    
    // Wait for the refresh to complete
    await waitForNextUpdate();
    
    // After refresh error, it should not change the data
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockItems);
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error refreshing items:'),
      mockError
    );
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should expose refetch from useCollectionQuery', () => {
    const mockRefetch = jest.fn();
    (useCollectionQuery as jest.Mock).mockReturnValue({
      data: { success: true, data: mockItems, cached: false },
      error: null,
      loading: false,
      refetch: mockRefetch
    });
    
    // Render the hook
    const { result } = renderHook(() => 
      useCollection('api/items', [])
    );
    
    // Call refetch
    result.current.refetch();
    
    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });
});
