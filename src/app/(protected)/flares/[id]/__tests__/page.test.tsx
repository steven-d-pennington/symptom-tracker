import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlareDetailPage from '../page';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'flare-1' }),
}));

// Mock hooks
jest.mock('@/lib/hooks/useFlare', () => ({
  useFlare: jest.fn(() => ({
    data: {
      id: 'flare-1',
      userId: 'user-1',
      currentSeverity: 7,
      status: 'active',
      startDate: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ userId: 'user-1' }),
}));

// Mock components
jest.mock('@/components/flares/FlareUpdateModal', () => ({
  FlareUpdateModal: () => <div data-testid="update-modal">Update Modal</div>,
}));

jest.mock('@/components/flares/InterventionLogModal', () => ({
  InterventionLogModal: () => <div data-testid="intervention-modal">Intervention Modal</div>,
}));

jest.mock('@/components/flares/InterventionHistory', () => ({
  InterventionHistory: () => <div data-testid="intervention-history">Intervention History</div>,
}));

jest.mock('@/components/flares/FlareHistory', () => ({
  FlareHistory: ({ flareId, userId }: any) => (
    <div data-testid="flare-history">
      Flare History for {flareId} and {userId}
    </div>
  ),
}));

describe('FlareDetailPage Tab Navigation', () => {

  it('renders Details tab by default', () => {
    render(<FlareDetailPage />);

    const detailsTab = screen.getByRole('tab', { name: /Details/i });
    expect(detailsTab).toHaveAttribute('aria-selected', 'true');

    // Details content should be visible
    expect(screen.getByText(/Severity:/i)).toBeInTheDocument();
  });

  it('switches to History tab when clicked', async () => {
    const user = userEvent.setup();
    render(<FlareDetailPage />);

    const historyTab = screen.getByRole('tab', { name: /History/i });
    await user.click(historyTab);

    expect(historyTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('flare-history')).toBeInTheDocument();
  });

  it('History tab displays FlareHistory component', async () => {
    const user = userEvent.setup();
    render(<FlareDetailPage />);

    const historyTab = screen.getByRole('tab', { name: /History/i });
    await user.click(historyTab);

    expect(screen.getByTestId('flare-history')).toBeInTheDocument();
    expect(screen.getByText(/Flare History for flare-1 and user-1/i)).toBeInTheDocument();
  });

  it('has proper ARIA attributes for tablist', () => {
    render(<FlareDetailPage />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
  });

  it('maintains touch-friendly button sizes (44x44px)', () => {
    render(<FlareDetailPage />);

    const detailsTab = screen.getByRole('tab', { name: /Details/i });
    const historyTab = screen.getByRole('tab', { name: /History/i });

    expect(detailsTab).toHaveClass('min-h-[44px]');
    expect(historyTab).toHaveClass('min-h-[44px]');
  });
});
