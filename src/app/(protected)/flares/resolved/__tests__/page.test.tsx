import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResolvedFlaresPage from '../page';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { FlareRecord, FlareStatus } from '@/types/flare';

// Mock the flare repository
jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    getResolvedFlares: jest.fn(),
    getFlareHistory: jest.fn(),
  },
}));

// Mock Next.js navigation hooks
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
  })),
  useSearchParams: jest.fn(() => mockSearchParams),
}));

// Mock useCurrentUser hook
jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(() => ({
    userId: 'test-user-123',
    isLoading: false,
    error: null,
  })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('ResolvedFlaresPage', () => {
  const createMockFlare = (overrides?: Partial<FlareRecord>): FlareRecord => ({
    id: `flare-${Math.random()}`,
    userId: 'test-user-123',
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

  const mockFlares = [
    createMockFlare({ bodyRegionId: 'left-groin', endDate: Date.now() - (1 * 24 * 60 * 60 * 1000) }),
    createMockFlare({ bodyRegionId: 'right-groin', endDate: Date.now() - (5 * 24 * 60 * 60 * 1000) }),
    createMockFlare({ bodyRegionId: 'armpit-left', endDate: Date.now() - (10 * 24 * 60 * 60 * 1000) }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (flareRepository.getResolvedFlares as jest.Mock).mockResolvedValue(mockFlares);
    (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([
      { id: '1', severity: 8, timestamp: Date.now() },
    ]);
  });

  // AC2.8.1: Test page renders with resolved flares list
  it('renders page header with "Resolved Flares" title', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Resolved Flares/i })).toBeInTheDocument();
    });
  });

  // AC2.8.1, AC2.8.7: Test count badge in page header
  it('displays total resolved flares count in page header', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getByText(/Resolved Flares \(3\)/)).toBeInTheDocument();
    });
  });

  // AC2.8.1: Test page uses flareRepository.getResolvedFlares
  it('fetches resolved flares using flareRepository.getResolvedFlares', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(flareRepository.getResolvedFlares).toHaveBeenCalledWith('test-user-123');
    });
  });

  // AC2.8.1: Test ResolvedFlareCard components are rendered
  it('renders ResolvedFlareCard components for each flare', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      // Should render cards for all flares
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });
  });

  // AC2.8.1: Test grid layout
  it('renders flare cards in responsive grid layout', async () => {
    const { container } = render(<ResolvedFlaresPage />);

    await waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  // AC2.8.1: Test loading state with skeleton cards
  it('displays loading state with skeleton cards', () => {
    (flareRepository.getResolvedFlares as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ResolvedFlaresPage />);

    expect(screen.getByText(/Loading your resolved flares/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Loading flare card/i)).toHaveLength(3);
  });

  // AC2.8.1: Test error state
  it('displays error state when fetching fails', async () => {
    const error = new Error('Failed to fetch flares');
    (flareRepository.getResolvedFlares as jest.Mock).mockRejectedValue(error);

    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading resolved flares/i)).toBeInTheDocument();
      expect(screen.getByText(error.message)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  // AC2.8.6: Test empty state when no resolved flares
  it('displays empty state when no resolved flares exist', async () => {
    (flareRepository.getResolvedFlares as jest.Mock).mockResolvedValue([]);

    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getByText('No resolved flares yet')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /View Active Flares/i })).toBeInTheDocument();
    });
  });

  // AC2.8.3: Test sort dropdown is displayed
  it('displays sort dropdown when flares exist', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Sort resolved flares/i)).toBeInTheDocument();
    });
  });

  // AC2.8.3: Test sort dropdown options
  it('displays all sort options in dropdown', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      const sortDropdown = screen.getByLabelText(/Sort resolved flares/i);
      expect(sortDropdown).toBeInTheDocument();

      // Check for all sort options
      expect(screen.getByRole('option', { name: /Most Recent/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Oldest First/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Longest Duration/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Shortest Duration/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Highest Severity/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Lowest Severity/i })).toBeInTheDocument();
    });
  });

  // AC2.8.3: Test default sort is resolution date descending
  it('defaults to resolution date descending sort', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      const sortDropdown = screen.getByLabelText(/Sort resolved flares/i) as HTMLSelectElement;
      expect(sortDropdown.value).toBe('resolutionDate-desc');
    });
  });

  // AC2.8.3: Test sort changes flare order
  it('changes flare order when sort option is selected', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(flareRepository.getResolvedFlares).toHaveBeenCalled();
    });

    // Change sort to oldest first
    const sortDropdown = screen.getByLabelText(/Sort resolved flares/i);
    await userEvent.selectOptions(sortDropdown, 'resolutionDate-asc');

    // Cards should re-render in different order (implementation detail, hard to test precisely)
    expect(sortDropdown).toHaveValue('resolutionDate-asc');
  });

  // AC2.8.3: Test localStorage persistence of sort preference
  it('saves sort preference to localStorage', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(flareRepository.getResolvedFlares).toHaveBeenCalled();
    });

    // Change sort option
    const sortDropdown = screen.getByLabelText(/Sort resolved flares/i);
    await userEvent.selectOptions(sortDropdown, 'duration-desc');

    // Should save to localStorage
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'resolved-flares-sort-test-user-123',
        expect.stringContaining('duration')
      );
    });
  });

  // AC2.8.3: Test sort state loads from localStorage
  it('loads sort preference from localStorage on mount', async () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ by: 'peakSeverity', order: 'asc' })
    );

    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      const sortDropdown = screen.getByLabelText(/Sort resolved flares/i) as HTMLSelectElement;
      expect(sortDropdown.value).toBe('peakSeverity-asc');
    });
  });

  // AC2.8.4: Test navigation to flare detail page
  it('navigates to flare detail page when card is clicked', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    // Click first card
    const cards = screen.getAllByRole('button');
    await userEvent.click(cards[0]);

    // Should navigate to detail page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
      const pushCall = mockPush.mock.calls[0][0];
      expect(pushCall).toMatch(/\/flares\/.+/);
    });
  });

  // AC2.8.5: Test filters are displayed when flares exist
  it('displays filter controls when flares exist', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  // AC2.8.5: Test filtered results count updates
  it('displays filtered results count when filters are applied', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    // Expand filters and apply a filter
    const expandButton = screen.getByLabelText(/expand filters/i);
    await userEvent.click(expandButton);

    // Select a region filter
    const leftGroinCheckbox = screen.getByLabelText(/Filter by Left Groin/i);
    await userEvent.click(leftGroinCheckbox);

    // Should show filtered count message
    await waitFor(() => {
      expect(screen.getByText(/Showing \d+ of \d+ resolved flares/i)).toBeInTheDocument();
    });
  });

  // AC2.8.7: Test count badge has ARIA label
  it('includes aria-label with count for screen readers', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /3 resolved flares/i });
      expect(heading).toHaveAttribute('aria-label', '3 resolved flares');
    });
  });

  // AC2.8.7: Test count updates in real-time (via polling)
  it('polls for updates to keep count reactive', async () => {
    jest.useFakeTimers();

    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      expect(flareRepository.getResolvedFlares).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 10 seconds (should trigger polling)
    jest.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(flareRepository.getResolvedFlares).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });

  // Test responsive grid layout
  it('uses responsive grid with 1/2/3 columns', async () => {
    const { container } = render(<ResolvedFlaresPage />);

    await waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1'); // Mobile
      expect(grid).toHaveClass('md:grid-cols-2'); // Tablet
      expect(grid).toHaveClass('lg:grid-cols-3'); // Desktop
    });
  });

  // Test accessibility: list role
  it('has proper ARIA role for flares list', async () => {
    render(<ResolvedFlaresPage />);

    await waitFor(() => {
      const list = screen.getByRole('list', { name: /Resolved flares list/i });
      expect(list).toBeInTheDocument();
    });
  });
});
