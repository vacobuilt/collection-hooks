// Create a mock fetch function
const mockFetch = jest.fn();

// Assign it to the global object
global.fetch = mockFetch;

// Reset mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
  
  // Setup default fetch mock implementation
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: [] }),
  });
});
