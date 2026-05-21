import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock fetch for tests
global.fetch = jest.fn();

// Helper to render with query client
const renderWithQueryClient = (component) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    global.fetch.mockClear();
  });

  test('renders TODO App heading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithQueryClient(<App />);

    const headingElement = await screen.findByText(/TODO App/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('displays empty state message when no todos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithQueryClient(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No todos yet/i)).toBeInTheDocument();
    });
  });

  test('calculates and displays correct stats for incomplete todos', async () => {
    const mockTodos = [
      { id: 1, title: 'Test 1', completed: false },
      { id: 2, title: 'Test 2', completed: false },
      { id: 3, title: 'Test 3', completed: true },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    renderWithQueryClient(<App />);

    await waitFor(() => {
      expect(screen.getByText(/2 items left/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/1 completed/i)).toBeInTheDocument();
  });

  test('delete button removes todo from list', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo', completed: false },
    ];

    // First call: initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    // Second call: delete request
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Third call: refetch after delete
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithQueryClient(<App />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Verify delete was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  test('uses relative API URL instead of hardcoded localhost', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithQueryClient(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/todos');
    });
  });

  test('displays error message when API fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithQueryClient(<App />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('edit button allows editing todo title', async () => {
    const mockTodos = [
      { id: 1, title: 'Original Title', completed: false },
    ];

    // Initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    // Edit request
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: 'Updated Title', completed: false }),
    });

    // Refetch after edit
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, title: 'Updated Title', completed: false }],
    });

    renderWithQueryClient(<App />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Should show input field for editing
    await waitFor(() => {
      expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
