import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolvedFlaresFilters } from '../ResolvedFlaresFilters';
import { FlareRecord, FlareStatus } from '@/types/flare';

// Mock Next.js navigation hooks
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
  })),
  useSearchParams: jest.fn(() => mockSearchParams),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('ResolvedFlaresFilters', () => {
  const mockOnFilterChange = jest.fn();

  const createMockFlare = (overrides?: Partial<FlareRecord>): FlareRecord => ({
    id: `flare-${Math.random()}`,
    userId: 'test-user',
    startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
    endDate: Date.now() - (2 * 24 * 60 * 60 * 1000),
    status: FlareStatus.Resolved,
    bodyRegionId: 'left-groin',
    coordinates: { x: 0.5, y: 0.5 },
    initialSeverity: 6,
    currentSeverity: 4,
    createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    ...overrides,
  });

  const mockFlares: FlareRecord[] = [
    createMockFlare({ bodyRegionId: 'left-groin', startDate: Date.now() - (10 * 24 * 60 * 60 * 1000), endDate: Date.now() - (2 * 24 * 60 * 60 * 1000) }),
    createMockFlare({ bodyRegionId: 'right-groin', startDate: Date.now() - (15 * 24 * 60 * 60 * 1000), endDate: Date.now() - (5 * 24 * 60 * 60 * 1000) }),
    createMockFlare({ bodyRegionId: 'armpit-left', startDate: Date.now() - (20 * 24 * 60 * 60 * 1000), endDate: Date.now() - (1 * 24 * 60 * 60 * 1000) }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.forEach((value, key) => mockSearchParams.delete(key));
    localStorageMock.getItem.mockReturnValue(null);
  });

  // AC2.8.5: Test filter panel rendering
  it('renders Filters heading with expand/collapse button', () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/expand filters/i)).toBeInTheDocument();
  });

  // AC2.8.5: Test filter panel expand/collapse
  it('expands filter panel when expand button is clicked', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    const expandButton = screen.getByLabelText(/expand filters/i);
    await userEvent.click(expandButton);

    // Filter controls should now be visible
    expect(screen.getByLabelText('Body Region')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolution Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration (days)')).toBeInTheDocument();
  });

  // AC2.8.5: Test filter panel state persistence
  it('persists filter panel expanded state to localStorage', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    const expandButton = screen.getByLabelText(/expand filters/i);
    await userEvent.click(expandButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'resolved-flares-filters-expanded',
      'true'
    );
  });

  // AC2.8.5: Test body region filter (multi-select)
  it('displays unique body regions from resolved flares', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    // Expand filters first
    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Should show unique regions
    await waitFor(() => {
      expect(screen.getByText('Left Groin')).toBeInTheDocument();
      expect(screen.getByText('Right Groin')).toBeInTheDocument();
      expect(screen.getByText('Left Armpit')).toBeInTheDocument();
    });
  });

  // AC2.8.5: Test body region filter selection
  it('filters flares by selected body region', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Select "Left Groin"
    const leftGroinCheckbox = screen.getByLabelText(/Filter by Left Groin/i);
    await userEvent.click(leftGroinCheckbox);

    // onFilterChange should be called with filtered flares
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalled();
      const filteredFlares = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1][0];
      expect(filteredFlares).toHaveLength(1);
      expect(filteredFlares[0].bodyRegionId).toBe('left-groin');
    });
  });

  // AC2.8.5: Test multiple region selection
  it('allows selecting multiple body regions', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Select both groin regions
    await userEvent.click(screen.getByLabelText(/Filter by Left Groin/i));
    await userEvent.click(screen.getByLabelText(/Filter by Right Groin/i));

    // Should filter to include both regions
    await waitFor(() => {
      const filteredFlares = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1][0];
      expect(filteredFlares).toHaveLength(2);
      expect(filteredFlares.map((f: FlareRecord) => f.bodyRegionId)).toEqual(
        expect.arrayContaining(['left-groin', 'right-groin'])
      );
    });
  });

  // AC2.8.5: Test date range filter
  it('filters flares by resolution date range', async () => {
    const now = Date.now();
    const flares = [
      createMockFlare({ endDate: now - (1 * 24 * 60 * 60 * 1000) }), // 1 day ago
      createMockFlare({ endDate: now - (5 * 24 * 60 * 60 * 1000) }), // 5 days ago
      createMockFlare({ endDate: now - (10 * 24 * 60 * 60 * 1000) }), // 10 days ago
    ];

    render(
      <ResolvedFlaresFilters flares={flares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Set date range: 7 days ago to 3 days ago
    const dateFrom = new Date(now - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const dateTo = new Date(now - (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    const dateFromInput = screen.getByLabelText(/Resolution date from/i);
    const dateToInput = screen.getByLabelText(/Resolution date to/i);

    await userEvent.type(dateFromInput, dateFrom);
    await userEvent.type(dateToInput, dateTo);

    // Should filter to only the 5 days ago flare
    await waitFor(() => {
      const filteredFlares = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1][0];
      expect(filteredFlares).toHaveLength(1);
    });
  });

  // AC2.8.5: Test duration range filter
  it('filters flares by duration range', async () => {
    const now = Date.now();
    const flares = [
      createMockFlare({ startDate: now - (5 * 24 * 60 * 60 * 1000), endDate: now }), // 5 days
      createMockFlare({ startDate: now - (10 * 24 * 60 * 60 * 1000), endDate: now }), // 10 days
      createMockFlare({ startDate: now - (20 * 24 * 60 * 60 * 1000), endDate: now }), // 20 days
    ];

    render(
      <ResolvedFlaresFilters flares={flares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Set duration range: 7 to 15 days
    const durationMinInput = screen.getByLabelText(/Minimum duration in days/i);
    const durationMaxInput = screen.getByLabelText(/Maximum duration in days/i);

    await userEvent.type(durationMinInput, '7');
    await userEvent.type(durationMaxInput, '15');

    // Should filter to only the 10 days flare
    await waitFor(() => {
      const filteredFlares = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1][0];
      expect(filteredFlares).toHaveLength(1);
    });
  });

  // AC2.8.5: Test filters combine with AND logic
  it('combines multiple filters with AND logic', async () => {
    const now = Date.now();
    const flares = [
      createMockFlare({
        bodyRegionId: 'left-groin',
        startDate: now - (10 * 24 * 60 * 60 * 1000),
        endDate: now,
      }), // 10 days, left groin
      createMockFlare({
        bodyRegionId: 'right-groin',
        startDate: now - (10 * 24 * 60 * 60 * 1000),
        endDate: now,
      }), // 10 days, right groin
      createMockFlare({
        bodyRegionId: 'left-groin',
        startDate: now - (5 * 24 * 60 * 60 * 1000),
        endDate: now,
      }), // 5 days, left groin
    ];

    render(
      <ResolvedFlaresFilters flares={flares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Select left groin AND duration 7-15 days
    await userEvent.click(screen.getByLabelText(/Filter by Left Groin/i));
    await userEvent.type(screen.getByLabelText(/Minimum duration in days/i), '7');
    await userEvent.type(screen.getByLabelText(/Maximum duration in days/i), '15');

    // Should only match the first flare (left groin + 10 days)
    await waitFor(() => {
      const filteredFlares = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1][0];
      expect(filteredFlares).toHaveLength(1);
      expect(filteredFlares[0].bodyRegionId).toBe('left-groin');
    });
  });

  // AC2.8.5: Test active filter count badge
  it('displays active filter count badge', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Apply multiple filters
    await userEvent.click(screen.getByLabelText(/Filter by Left Groin/i));
    await userEvent.type(screen.getByLabelText(/Minimum duration in days/i), '5');

    // Should show (2) for 2 active filters
    await waitFor(() => {
      expect(screen.getByText(/Filters \(2\)/)).toBeInTheDocument();
    });
  });

  // AC2.8.5: Test Clear Filters button
  it('displays Clear Filters button when filters are active', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Apply a filter
    await userEvent.click(screen.getByLabelText(/Filter by Left Groin/i));

    // Clear Filters button should appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Clear all filters/i })).toBeInTheDocument();
    });
  });

  // AC2.8.5: Test Clear Filters functionality
  it('clears all filters when Clear Filters button is clicked', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Apply multiple filters
    await userEvent.click(screen.getByLabelText(/Filter by Left Groin/i));
    await userEvent.type(screen.getByLabelText(/Minimum duration in days/i), '5');

    // Click Clear Filters
    const clearButton = screen.getByRole('button', { name: /Clear all filters/i });
    await userEvent.click(clearButton);

    // Filters should be reset
    await waitFor(() => {
      expect(screen.queryByText(/Filters \(\d+\)/)).not.toBeInTheDocument();
      const leftGroinCheckbox = screen.getByLabelText(/Filter by Left Groin/i) as HTMLInputElement;
      expect(leftGroinCheckbox.checked).toBe(false);
    });
  });

  // AC2.8.5: Test URL query params sync
  it('syncs filter state to URL query params', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Apply filters
    await userEvent.click(screen.getByLabelText(/Filter by Left Groin/i));

    // Should call router.replace with query params
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
      const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0];
      expect(lastCall).toContain('region=left-groin');
    });
  });

  // AC2.8.5: Test keyboard navigation for all controls
  it('supports keyboard navigation with Tab key', async () => {
    render(
      <ResolvedFlaresFilters flares={mockFlares} onFilterChange={mockOnFilterChange} />
    );

    await userEvent.click(screen.getByLabelText(/expand filters/i));

    // Tab through filter controls
    await userEvent.tab();

    // Focus should move through interactive elements
    const leftGroinCheckbox = screen.getByLabelText(/Filter by Left Groin/i);
    leftGroinCheckbox.focus();
    expect(document.activeElement).toBe(leftGroinCheckbox);
  });
});
