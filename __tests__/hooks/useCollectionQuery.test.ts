import { renderHook } from '@testing-library/react-hooks/dom';
import { useCollectionQuery } from '../../src/hooks/useCollectionQuery';

describe('useCollectionQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data from the provided URL', async () => {
    // Mock successful fetch response
    const mockData = { success: true, data: [{ id: 1, name: 'Test' }] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockData)
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollectionQuery('http://localhost/api/test')
    );

    // Initially, it should be in loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for the fetch to complete
    await waitForNextUpdate();

    // After fetch, it should have the data
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();

    // Verify fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith('http://localhost/api/test');
  });

  it('should handle fetch errors', async () => {
    // Mock fetch error
    const mockError = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollectionQuery('http://localhost/api/test')
    );

    // Initially, it should be in loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for the fetch to complete
    await waitForNextUpdate();

    // After fetch error, it should have the error
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should handle HTTP errors', async () => {
    // Mock HTTP error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollectionQuery('http://localhost/api/test')
    );

    // Wait for the fetch to complete
    await waitForNextUpdate();

    // After HTTP error, it should have the error
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('HTTP error');
    expect(result.current.error?.message).toContain('404');
  });

  it('should not fetch if URL is null', () => {
    // Render the hook with null URL
    const { result } = renderHook(() => 
      useCollectionQuery(null)
    );

    // It should not be in loading state
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Verify fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should refetch data when refetch is called', async () => {
    // Mock successful fetch responses
    const mockData1 = { success: true, data: [{ id: 1, name: 'Test 1' }] };
    const mockData2 = { success: true, data: [{ id: 2, name: 'Test 2' }] };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData1)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData2)
      });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useCollectionQuery('http://localhost/api/test')
    );

    // Wait for the initial fetch to complete
    await waitForNextUpdate();
    expect(result.current.data).toEqual(mockData1);

    // Call refetch
    result.current.refetch();

    // It should be in loading state again
    expect(result.current.loading).toBe(true);

    // Wait for the refetch to complete
    await waitForNextUpdate();

    // After refetch, it should have the new data
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData2);
    expect(result.current.error).toBeNull();

    // Verify fetch was called twice with the correct URL
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost/api/test');
  });
});
