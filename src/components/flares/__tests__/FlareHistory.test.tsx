import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FlareHistory } from '../FlareHistory';
import { flareRepository } from '@/lib/repositories';
import '@testing-library/jest-dom';

// Mock the child components
jest.mock('../FlareHistoryEntry', () => ({
  FlareHistoryEntry: ({ event, isExpanded, onToggle }: any) => {
    const testId = 'entry-' + event.id;
    return (
      <div data-testid={testId} onClick={onToggle}>
        {event.eventType} - {isExpanded ? 'expanded' : 'collapsed'}
      </div>
    );
  },
}));

jest.mock('../FlareHistoryChart', () => ({
  FlareHistoryChart: ({ events }: any) => (
    <div data-testid="chart">Chart with {events.length} events</div>
  ),
}));

// Mock flareRepository
jest.mock('@/lib/repositories', () => ({
  flareRepository: {
    getFlareHistory: jest.fn(),
  },
}));

const mockFlareRepository = flareRepository as jest.Mocked<typeof flareRepository>;

describe('FlareHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const mockEvents = [
    {
      id: 'event-1',
      flareId: 'flare-1',
      userId: 'user-1',
      eventType: 'severity_update',
      timestamp: Date.now() - 1000 * 60 * 60,
      severity: 7,
      trend: 'worsening',
      notes: 'Getting worse',
    },
    {
      id: 'event-2',
      flareId: 'flare-1',
      userId: 'user-1',
      eventType: 'intervention',
      timestamp: Date.now() - 1000 * 60 * 30,
      interventionType: 'ice',
      interventionDetails: 'Applied ice pack',
      notes: '',
    },
    {
      id: 'event-3',
      flareId: 'flare-1',
      userId: 'user-1',
      eventType: 'severity_update',
      timestamp: Date.now(),
      severity: 5,
      trend: 'improving',
      notes: 'Feeling better',
    },
  ];

  it('fetches events on mount', async () => {
    mockFlareRepository.getFlareHistory.mockResolvedValue(mockEvents);
    render(<FlareHistory flareId="flare-1" userId="user-1" />);
    await waitFor(() => {
      expect(mockFlareRepository.getFlareHistory).toHaveBeenCalledWith('user-1', 'flare-1');
    });
  });

  it('displays skeleton UI during loading', () => {
    mockFlareRepository.getFlareHistory.mockImplementation(() => new Promise(() => {}));
    render(<FlareHistory flareId="flare-1" userId="user-1" />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays empty state when no events', async () => {
    mockFlareRepository.getFlareHistory.mockResolvedValue([]);
    render(<FlareHistory flareId="flare-1" userId="user-1" />);
    await waitFor(() => {
      expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
    });
  });
});
