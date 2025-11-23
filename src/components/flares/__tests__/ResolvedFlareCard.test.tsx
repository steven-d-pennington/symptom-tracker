import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolvedFlareCard } from '../ResolvedFlareCard';
import { FlareRecord } from '@/lib/db/schema';
import { flareRepository } from '@/lib/repositories/flareRepository';

// Mock the flare repository
jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    getFlareHistory: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
}));

describe('ResolvedFlareCard', () => {
  const mockUserId = 'test-user-123';
  const mockOnFlareClick = jest.fn();

  const createMockFlare = (overrides?: Partial<FlareRecord>): FlareRecord => ({
    id: 'flare-1',
    userId: mockUserId,
    startDate: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
    endDate: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "resolved",
    bodyRegionId: 'left-groin',
    coordinates: { x: 0.5, y: 0.5 },
    initialSeverity: 6,
    currentSeverity: 4,
    createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([
      { id: '1', severity: 6, timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000) },
      { id: '2', severity: 8, timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000) },
      { id: '3', severity: 4, timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000) },
    ]);
  });

  // AC2.8.2: Test card renders with all required fields
  it('renders body region name, resolution date, duration, and severity badges', async () => {
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    // Body region name should be displayed
    expect(screen.getByText('Left Groin')).toBeInTheDocument();

    // Resolution date should be shown
    expect(screen.getByText(/Resolved/)).toBeInTheDocument();

    // Duration badge should be displayed
    await waitFor(() => {
      expect(screen.getByText(/8 days/)).toBeInTheDocument();
    });

    // Peak severity badge should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Peak: 8\/10/)).toBeInTheDocument();
    });
  });

  // AC2.8.2: Test duration calculation
  it('calculates duration correctly in days', async () => {
    const startDate = Date.now() - (15 * 24 * 60 * 60 * 1000); // 15 days ago
    const endDate = Date.now() - (1 * 24 * 60 * 60 * 1000); // 1 day ago
    const flare = createMockFlare({ startDate, endDate });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    // Should show 14 days (Math.floor of difference)
    await waitFor(() => {
      expect(screen.getByText(/14 days/)).toBeInTheDocument();
    });
  });

  // AC2.8.2: Test peak severity computation from history
  it('computes peak severity from flare history', async () => {
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    // Wait for flare history to be fetched
    await waitFor(() => {
      expect(flareRepository.getFlareHistory).toHaveBeenCalledWith(mockUserId, flare.id);
    });

    // Peak severity should be 8 (max from history)
    await waitFor(() => {
      expect(screen.getByText(/Peak: 8\/10/)).toBeInTheDocument();
    });
  });

  // AC2.8.2: Test fallback to current severity when history is empty
  it('falls back to current severity when history is empty', async () => {
    (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([]);
    const flare = createMockFlare({ currentSeverity: 5 });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    // Should use current severity when history is empty
    await waitFor(() => {
      expect(screen.getByText(/Peak: 5\/10/)).toBeInTheDocument();
    });
  });

  // AC2.8.2: Test body region name lookup
  it('displays correct body region name from bodyRegions data', () => {
    const flare = createMockFlare({ bodyRegionId: 'armpit-right' });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    expect(screen.getByText('Right Armpit')).toBeInTheDocument();
  });

  // AC2.8.2: Test duration badge color coding
  it('applies correct color coding to duration badge - green for < 7 days', () => {
    const startDate = Date.now() - (5 * 24 * 60 * 60 * 1000);
    const endDate = Date.now();
    const flare = createMockFlare({ startDate, endDate });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const durationBadge = screen.getByText(/5 days/);
    expect(durationBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies correct color coding to duration badge - yellow for 7-14 days', () => {
    const startDate = Date.now() - (10 * 24 * 60 * 60 * 1000);
    const endDate = Date.now();
    const flare = createMockFlare({ startDate, endDate });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const durationBadge = screen.getByText(/10 days/);
    expect(durationBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('applies correct color coding to duration badge - orange for > 14 days', () => {
    const startDate = Date.now() - (20 * 24 * 60 * 60 * 1000);
    const endDate = Date.now();
    const flare = createMockFlare({ startDate, endDate });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const durationBadge = screen.getByText(/20 days/);
    expect(durationBadge).toHaveClass('bg-orange-100', 'text-orange-800');
  });

  // AC2.8.2: Test peak severity badge color scale
  it('applies correct color to peak severity badge - green for 1-3', async () => {
    (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([
      { id: '1', severity: 2, timestamp: Date.now() },
    ]);
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    await waitFor(() => {
      const severityBadge = screen.getByText(/Peak: 2\/10/);
      expect(severityBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  it('applies correct color to peak severity badge - yellow for 4-6', async () => {
    (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([
      { id: '1', severity: 5, timestamp: Date.now() },
    ]);
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    await waitFor(() => {
      const severityBadge = screen.getByText(/Peak: 5\/10/);
      expect(severityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  it('applies correct color to peak severity badge - orange for 7-8', async () => {
    (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([
      { id: '1', severity: 7, timestamp: Date.now() },
    ]);
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    await waitFor(() => {
      const severityBadge = screen.getByText(/Peak: 7\/10/);
      expect(severityBadge).toHaveClass('bg-orange-100', 'text-orange-800');
    });
  });

  it('applies correct color to peak severity badge - red for 9-10', async () => {
    (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([
      { id: '1', severity: 10, timestamp: Date.now() },
    ]);
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    await waitFor(() => {
      const severityBadge = screen.getByText(/Peak: 10\/10/);
      expect(severityBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  // AC2.8.2, AC2.8.4: Test onClick handler
  it('calls onFlareClick with flare ID when card is clicked', async () => {
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const card = screen.getByRole('button');
    await userEvent.click(card);

    expect(mockOnFlareClick).toHaveBeenCalledWith(flare.id);
  });

  // AC2.8.4: Test keyboard accessibility - Enter key
  it('calls onFlareClick when Enter key is pressed', async () => {
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const card = screen.getByRole('button');
    card.focus();
    await userEvent.keyboard('{Enter}');

    expect(mockOnFlareClick).toHaveBeenCalledWith(flare.id);
  });

  // AC2.8.2, AC2.8.4: Test ARIA label includes all context
  it('has comprehensive ARIA label with region, date, duration, and severity', async () => {
    const flare = createMockFlare({ bodyRegionId: 'left-groin' });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    await waitFor(() => {
      const card = screen.getByRole('button');
      const ariaLabel = card.getAttribute('aria-label');
      expect(ariaLabel).toContain('Left Groin');
      expect(ariaLabel).toContain('resolved');
      expect(ariaLabel).toContain('days');
      expect(ariaLabel).toContain('peak severity');
    });
  });

  // AC2.8.2: Test card has minimum 44px height for touch targets (NFR001)
  it('has minimum 44px height for touch targets', () => {
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('min-h-[44px]');
  });

  // AC2.8.4: Test card has role="button" and tabIndex for keyboard navigation
  it('has role="button" and is keyboard focusable', () => {
    const flare = createMockFlare();

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  // AC2.8.2: Test resolution date formatting with hover tooltip
  it('displays relative date with full date in title attribute', () => {
    const endDate = Date.now() - (2 * 24 * 60 * 60 * 1000); // 2 days ago
    const flare = createMockFlare({ endDate });

    render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    // Find the element with the relative date text
    const dateElement = screen.getByText(/Resolved/);
    expect(dateElement).toBeInTheDocument();

    // Check for title attribute containing full date
    const parentDiv = dateElement.closest('div[title]');
    expect(parentDiv).toHaveAttribute('title');
    const title = parentDiv?.getAttribute('title');
    // Title should contain a formatted date like "October 25, 2025"
    expect(title).toMatch(/\w+ \d{1,2}, \d{4}/);
  });

  // AC2.8.2: Test gray indicator for resolved status
  it('displays gray indicator matching resolved marker color', () => {
    const flare = createMockFlare();

    const { container } = render(
      <ResolvedFlareCard flare={flare} userId={mockUserId} onFlareClick={mockOnFlareClick} />
    );

    const indicator = container.querySelector('.bg-gray-400');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('w-3', 'h-3', 'rounded-full');
  });
});
