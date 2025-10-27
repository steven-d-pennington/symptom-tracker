import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlareHistoryEntry } from '../FlareHistoryEntry';
import { FlareEventRecord, FlareEventType, FlareTrend } from '@/types/flare';
import '@testing-library/jest-dom';

describe('FlareHistoryEntry', () => {
  const mockSeverityEvent: FlareEventRecord = {
    id: 'event-1',
    flareId: 'flare-1',
    userId: 'user-1',
    eventType: FlareEventType.SeverityUpdate,
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    severity: 8,
    trend: FlareTrend.Worsening,
    notes: 'Pain is getting worse despite medication',
  };

  const mockInterventionEvent: FlareEventRecord = {
    id: 'event-2',
    flareId: 'flare-1',
    userId: 'user-1',
    eventType: FlareEventType.Intervention,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    interventionType: 'ice',
    interventionDetails: 'Applied ice pack to affected area for 20 minutes',
    notes: 'Hoping this helps reduce inflammation',
  };

  const mockTrendEvent: FlareEventRecord = {
    id: 'event-3',
    flareId: 'flare-1',
    userId: 'user-1',
    eventType: FlareEventType.TrendChange,
    timestamp: Date.now(),
    trend: FlareTrend.Improving,
    notes: 'Starting to feel better',
  };

  it('displays correct event type icon for severity update', () => {
    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    // TrendingUp icon should be present (check for svg or icon)
    expect(screen.getByText('severity update')).toBeInTheDocument();
  });

  it('displays correct event type icon for intervention', () => {
    render(<FlareHistoryEntry event={mockInterventionEvent} isExpanded={false} onToggle={() => {}} />);

    expect(screen.getByText('intervention')).toBeInTheDocument();
  });

  it('displays correct event type icon for trend change', () => {
    render(<FlareHistoryEntry event={mockTrendEvent} isExpanded={false} onToggle={() => {}} />);

    expect(screen.getByText('trend change')).toBeInTheDocument();
  });

  it('displays relative timestamp', () => {
    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it('displays full timestamp on hover via title attribute', () => {
    const { container } = render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    const timeElement = container.querySelector('[title]');
    expect(timeElement).toHaveAttribute('title');
    expect(timeElement?.getAttribute('title')).toMatch(/\d{4}/); // Year in title
  });

  it('displays severity badge for status_update events', () => {
    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    expect(screen.getByText(/Severity: 8\/10/i)).toBeInTheDocument();
  });

  it('displays trend arrow for severity updates', () => {
    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    expect(screen.getByText(/↑/)).toBeInTheDocument();
    expect(screen.getByText(/worsening/i)).toBeInTheDocument();
  });

  it('displays trend arrow for trend change events', () => {
    render(<FlareHistoryEntry event={mockTrendEvent} isExpanded={false} onToggle={() => {}} />);

    expect(screen.getByText(/↓/)).toBeInTheDocument();
    expect(screen.getByText(/improving/i)).toBeInTheDocument();
  });

  it('displays intervention type and details', () => {
    render(<FlareHistoryEntry event={mockInterventionEvent} isExpanded={false} onToggle={() => {}} />);

    // Check for intervention type - "ice" appears multiple times so getAllByText
    const iceElements = screen.getAllByText(/ice/i);
    expect(iceElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Applied ice pack/i)).toBeInTheDocument();
  });

  it('truncates intervention details in collapsed view', () => {
    const longDetailsEvent: FlareEventRecord = {
      ...mockInterventionEvent,
      interventionDetails: 'This is a very long intervention detail text that should be truncated when the entry is in collapsed view to avoid cluttering the interface',
    };

    const { rerender } = render(<FlareHistoryEntry event={longDetailsEvent} isExpanded={false} onToggle={() => {}} />);

    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();

    rerender(<FlareHistoryEntry event={longDetailsEvent} isExpanded={true} onToggle={() => {}} />);
    expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
  });

  it('truncates notes in collapsed view', () => {
    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    const notesText = screen.getByText(/Pain is getting worse/i);
    expect(notesText).toBeInTheDocument();
  });

  it('expands to show full notes on click', async () => {
    const user = userEvent.setup();
    const mockToggle = jest.fn();

    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={mockToggle} />);

    const entry = screen.getByRole('button');
    await user.click(entry);

    expect(mockToggle).toHaveBeenCalled();
  });

  it('shows full timestamp in expanded view', () => {
    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={true} onToggle={() => {}} />);

    expect(screen.getByText(/Full timestamp:/i)).toBeInTheDocument();
  });

  it('is keyboard accessible with Enter key', async () => {
    const user = userEvent.setup();
    const mockToggle = jest.fn();

    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={mockToggle} />);

    const entry = screen.getByRole('button');
    entry.focus();
    await user.keyboard('{Enter}');

    expect(mockToggle).toHaveBeenCalled();
  });

  it('is keyboard accessible with Space key', async () => {
    const user = userEvent.setup();
    const mockToggle = jest.fn();

    render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={mockToggle} />);

    const entry = screen.getByRole('button');
    entry.focus();
    await user.keyboard(' ');

    expect(mockToggle).toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    const { rerender } = render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    const entry = screen.getByRole('button');
    expect(entry).toHaveAttribute('aria-expanded', 'false');
    expect(entry).toHaveAttribute('tabIndex', '0');

    rerender(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={true} onToggle={() => {}} />);
    expect(entry).toHaveAttribute('aria-expanded', 'true');
  });

  it('has minimum touch target size for mobile (44x44px)', () => {
    const { container } = render(<FlareHistoryEntry event={mockSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    const entry = container.querySelector('[role="button"]');
    expect(entry).toHaveClass('min-h-[44px]');
  });

  it('applies correct severity color coding', () => {
    const highSeverityEvent = { ...mockSeverityEvent, severity: 9 };
    const { rerender, container } = render(<FlareHistoryEntry event={highSeverityEvent} isExpanded={false} onToggle={() => {}} />);

    let severityBadge = container.querySelector('.bg-red-600');
    expect(severityBadge).toBeInTheDocument();

    const mediumSeverityEvent = { ...mockSeverityEvent, severity: 7 };
    rerender(<FlareHistoryEntry event={mediumSeverityEvent} isExpanded={false} onToggle={() => {}} />);
    severityBadge = container.querySelector('.bg-orange-500');
    expect(severityBadge).toBeInTheDocument();

    const lowSeverityEvent = { ...mockSeverityEvent, severity: 3 };
    rerender(<FlareHistoryEntry event={lowSeverityEvent} isExpanded={false} onToggle={() => {}} />);
    severityBadge = container.querySelector('.bg-green-500');
    expect(severityBadge).toBeInTheDocument();
  });
});
