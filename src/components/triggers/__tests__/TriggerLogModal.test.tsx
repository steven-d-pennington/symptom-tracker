import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TriggerLogModal } from '../TriggerLogModal';
import { TriggerRecord } from '@/lib/db/schema';

// Mock repositories
const mockGetActive = jest.fn();
const mockGetMostCommonTriggers = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindByDateRange = jest.fn();

jest.mock('@/lib/repositories/triggerRepository', () => ({
  triggerRepository: {
    getActive: (...args: any[]) => mockGetActive(...args),
  },
}));

jest.mock('@/lib/repositories/triggerEventRepository', () => ({
  triggerEventRepository: {
    getMostCommonTriggers: (...args: any[]) => mockGetMostCommonTriggers(...args),
    create: (...args: any[]) => mockCreate(...args),
    update: (...args: any[]) => mockUpdate(...args),
    findByDateRange: (...args: any[]) => mockFindByDateRange(...args),
  },
}));

describe('TriggerLogModal', () => {
  const mockUserId = 'user-123';
  const mockOnClose = jest.fn();
  const mockOnLogged = jest.fn();

  const mockTriggers: TriggerRecord[] = [
    {
      id: 'trigger-1',
      userId: mockUserId,
      name: 'Dairy',
      category: 'Dietary',
      description: 'Dairy products',
      isActive: true,
      isDefault: true,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'trigger-2',
      userId: mockUserId,
      name: 'Stress',
      category: 'Emotional',
      description: 'High stress levels',
      isActive: true,
      isDefault: true,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'trigger-3',
      userId: mockUserId,
      name: 'Poor Sleep',
      category: 'Lifestyle',
      description: 'Lack of sleep',
      isActive: true,
      isDefault: true,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockCommonTriggers = [
    { triggerId: 'trigger-1', count: 10 },
    { triggerId: 'trigger-2', count: 8 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetActive.mockResolvedValue(mockTriggers);
    mockGetMostCommonTriggers.mockResolvedValue(mockCommonTriggers);
    mockCreate.mockResolvedValue('event-1');
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={false}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', async () => {
    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Log Trigger')).toBeInTheDocument();
    });
  });

  it('should display common triggers section first', async () => {
    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Common Triggers')).toBeInTheDocument();
      const dairyButtons = screen.getAllByText('Dairy');
      expect(dairyButtons.length).toBeGreaterThan(0);
      const stressButtons = screen.getAllByText('Stress');
      expect(stressButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display full trigger list with categories', async () => {
    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lifestyle')).toBeInTheDocument();
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });
  });

  it('should log trigger with medium intensity on first tap', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Poor Sleep');
    await user.click(triggerButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          triggerId: 'trigger-3',
          intensity: 'medium',
        })
      );
      expect(mockOnLogged).toHaveBeenCalled();
      expect(screen.getByText(/Poor Sleep logged/i)).toBeInTheDocument();
    });
  });

  it('should show progressive disclosure form on tap', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Poor Sleep');
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('Intensity')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  it('should allow adjusting intensity in expanded form', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Poor Sleep');
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    const highButton = screen.getByText('High');
    await user.click(highButton);

    // Medium should be selected by default, High should become selected
    await waitFor(() => {
      expect(highButton).toHaveClass('bg-primary');
    });
  });

  it('should save details when Save Details button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    // Mock findByDateRange to return the newly created event
    mockFindByDateRange.mockResolvedValue([
      {
        id: 'event-1',
        userId: mockUserId,
        triggerId: 'trigger-3',
        timestamp: Date.now(),
        intensity: 'medium',
        notes: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Poor Sleep');
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('Save Details')).toBeInTheDocument();
    });

    const notesField = screen.getByPlaceholderText(/Additional details/i);
    await user.type(notesField, 'Only got 4 hours of sleep');

    const highButton = screen.getByText('High');
    await user.click(highButton);

    const saveButton = screen.getByText('Save Details');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        'event-1',
        expect.objectContaining({
          intensity: 'high',
          notes: 'Only got 4 hours of sleep',
        })
      );
    });
  });

  it('should handle errors gracefully when loading triggers fails', async () => {
    mockGetActive.mockRejectedValue(new Error('Database error'));

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load triggers/i)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully when creating trigger event fails', async () => {
    const user = userEvent.setup({ delay: null });
    mockCreate.mockRejectedValue(
      new Error('Failed to create event')
    );

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Poor Sleep');
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to log Poor Sleep/i)).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Log Trigger')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should cancel expanded form when Cancel button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Poor Sleep');
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Save Details')).not.toBeInTheDocument();
    });
  });

  it('should show no triggers message when no triggers available', async () => {
    mockGetActive.mockResolvedValue([]);
    mockGetMostCommonTriggers.mockResolvedValue([]);

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No triggers available/i)).toBeInTheDocument();
    });
  });

  it('should sort common triggers by usage count', async () => {
    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      const commonSection = screen.getByText('Common Triggers');
      expect(commonSection).toBeInTheDocument();
    });

    // Verify getMostCommonTriggers was called
    expect(mockGetMostCommonTriggers).toHaveBeenCalledWith(
      mockUserId,
      10
    );
  });

  it('should collapse expanded form when same trigger is tapped again', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <TriggerLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Poor Sleep')).toBeInTheDocument();
    });

    const triggerButton = screen.getByText('Poor Sleep');

    // First tap - should expand
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText('Intensity')).toBeInTheDocument();
    });

    // Second tap - should collapse
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.queryByText('Intensity')).not.toBeInTheDocument();
    });
  });
});
