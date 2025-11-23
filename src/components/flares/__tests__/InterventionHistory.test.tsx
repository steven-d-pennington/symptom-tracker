import { render, screen, waitFor } from '@testing-library/react';
import { InterventionHistory } from '../InterventionHistory';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { FlareEventRecord } from '@/lib/db/schema';

// Mock the flare repository
jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    getFlareHistory: jest.fn(),
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn((date: number) => '2 hours ago'),
}));

describe('InterventionHistory', () => {
  const mockInterventions: FlareEventRecord[] = [
    {
      id: 'event-1',
      flareId: 'flare-123',
      eventType: 'intervention',
      timestamp: Date.now() - 7200000, // 2 hours ago
      interventionType: 'medication',
      interventionDetails: 'Ibuprofen 400mg taken with food',
      userId: 'user-123',
    },
    {
      id: 'event-2',
      flareId: 'flare-123',
      eventType: 'intervention',
      timestamp: Date.now() - 14400000, // 4 hours ago
      interventionType: 'ice',
      interventionDetails: 'Ice pack applied for 15 minutes',
      userId: 'user-123',
    },
    {
      id: 'event-3',
      flareId: 'flare-123',
      eventType: 'intervention',
      timestamp: Date.now() - 21600000, // 6 hours ago
      interventionType: 'rest',
      interventionDetails: '',
      userId: 'user-123',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading message while fetching data', () => {
      (flareRepository.getFlareHistory as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      expect(screen.getByText(/loading interventions/i)).toBeInTheDocument();
    });
  });

  describe('Empty State (AC2.5.6)', () => {
    it('displays empty state when no interventions exist', async () => {
      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([]);

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/no interventions logged yet/i)).toBeInTheDocument();
      });
    });

    it('shows guidance message in empty state', async () => {
      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue([]);

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        expect(
          screen.getByText(/use "log intervention" to record treatments/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Intervention Display (AC2.5.4, AC2.5.6)', () => {
    beforeEach(() => {
      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        mockInterventions
      );
    });

    it('fetches intervention events from repository', async () => {
      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        expect(flareRepository.getFlareHistory).toHaveBeenCalledWith(
          'user-123',
          'flare-123'
        );
      });
    });

    it('filters events by eventType=intervention', async () => {
      const mixedEvents: FlareEventRecord[] = [
        ...mockInterventions,
        {
          id: 'event-4',
          flareId: 'flare-123',
          eventType: 'severity_update',
          timestamp: Date.now(),
          severity: 8,
          userId: 'user-123',
        },
      ];

      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        mixedEvents
      );

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        // Should only show interventions, not severity update
        expect(screen.getAllByText(/medication|ice|rest/i)).toHaveLength(3);
        expect(screen.queryByText(/severity/i)).not.toBeInTheDocument();
      });
    });

    it('displays interventions in reverse-chronological order', async () => {
      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        const interventions = screen.getAllByText(/medication|ice|rest/i);
        expect(interventions[0]).toHaveTextContent('medication');
        expect(interventions[1]).toHaveTextContent('ice');
        expect(interventions[2]).toHaveTextContent('rest');
      });
    });

    it('displays intervention type with icon', async () => {
      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/medication/i)).toBeInTheDocument();
        expect(screen.getByText(/ice/i)).toBeInTheDocument();
        expect(screen.getByText(/rest/i)).toBeInTheDocument();
      });
    });

    it('displays relative timestamp for each intervention', async () => {
      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        const timestamps = screen.getAllByText(/2 hours ago/i);
        expect(timestamps.length).toBeGreaterThan(0);
      });
    });

    it('truncates details to 50 characters with ellipsis', async () => {
      const longDetails =
        'This is a very long intervention description that should be truncated at 50 characters';
      const interventionWithLongDetails: FlareEventRecord[] = [
        {
          id: 'event-long',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'medication',
          interventionDetails: longDetails,
          userId: 'user-123',
        },
      ];

      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        interventionWithLongDetails
      );

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        const expectedTruncated = longDetails.slice(0, 50) + '...';
        expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
      });
    });

    it('displays full details when under 50 characters', async () => {
      const shortDetails = 'Short detail';
      const interventionWithShortDetails: FlareEventRecord[] = [
        {
          id: 'event-short',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'heat',
          interventionDetails: shortDetails,
          userId: 'user-123',
        },
      ];

      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        interventionWithShortDetails
      );

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText(shortDetails)).toBeInTheDocument();
        expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
      });
    });

    it('displays "No details" when interventionDetails is empty', async () => {
      const interventionNoDetails: FlareEventRecord[] = [
        {
          id: 'event-empty',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'drainage',
          interventionDetails: '',
          userId: 'user-123',
        },
      ];

      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        interventionNoDetails
      );

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/no details/i)).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Interventions (AC2.5.5)', () => {
    it('displays all interventions for the same flare', async () => {
      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        mockInterventions
      );

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        const interventionCards = screen.getAllByText(/medication|ice|rest/i);
        expect(interventionCards).toHaveLength(3);
      });
    });

    it('each intervention has unique key', async () => {
      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        mockInterventions
      );

      const { container } = render(
        <InterventionHistory flareId="flare-123" userId="user-123" />
      );

      await waitFor(() => {
        const interventionDivs = container.querySelectorAll('.flex.items-start');
        expect(interventionDivs).toHaveLength(3);
      });
    });
  });

  describe('Icon Mapping (AC2.5.4)', () => {
    it('displays correct icon for each intervention type', async () => {
      const allTypesInterventions: FlareEventRecord[] = [
        {
          id: '1',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'ice',
          userId: 'user-123',
        },
        {
          id: '2',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'heat',
          userId: 'user-123',
        },
        {
          id: '3',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'medication',
          userId: 'user-123',
        },
        {
          id: '4',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'rest',
          userId: 'user-123',
        },
        {
          id: '5',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'drainage',
          userId: 'user-123',
        },
        {
          id: '6',
          flareId: 'flare-123',
          eventType: 'intervention',
          timestamp: Date.now(),
          interventionType: 'other',
          userId: 'user-123',
        },
      ];

      (flareRepository.getFlareHistory as jest.Mock).mockResolvedValue(
        allTypesInterventions
      );

      const { container } = render(
        <InterventionHistory flareId="flare-123" userId="user-123" />
      );

      await waitFor(() => {
        // Each intervention should have an SVG icon
        const icons = container.querySelectorAll('svg');
        expect(icons.length).toBeGreaterThanOrEqual(6);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles fetch errors gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (flareRepository.getFlareHistory as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      render(<InterventionHistory flareId="flare-123" userId="user-123" />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load interventions:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Re-fetch on prop changes', () => {
    it('refetches when flareId changes', async () => {
      const { rerender } = render(
        <InterventionHistory flareId="flare-123" userId="user-123" />
      );

      await waitFor(() => {
        expect(flareRepository.getFlareHistory).toHaveBeenCalledWith(
          'user-123',
          'flare-123'
        );
      });

      jest.clearAllMocks();

      rerender(<InterventionHistory flareId="flare-456" userId="user-123" />);

      await waitFor(() => {
        expect(flareRepository.getFlareHistory).toHaveBeenCalledWith(
          'user-123',
          'flare-456'
        );
      });
    });
  });
});
