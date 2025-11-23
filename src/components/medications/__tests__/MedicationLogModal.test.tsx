import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MedicationLogModal } from '../MedicationLogModal';
import { MedicationRecord, MedicationEventRecord } from '@/lib/db/schema';

// Mock repositories
const mockGetScheduledForDay = jest.fn();
const mockGetTodayEvents = jest.fn();
const mockGetRecentNotes = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/repositories/medicationRepository', () => ({
  medicationRepository: {
    getScheduledForDay: (...args: any[]) => mockGetScheduledForDay(...args),
  },
}));

jest.mock('@/lib/repositories/medicationEventRepository', () => ({
  medicationEventRepository: {
    getTodayEvents: (...args: any[]) => mockGetTodayEvents(...args),
    getRecentNotes: (...args: any[]) => mockGetRecentNotes(...args),
    create: (...args: any[]) => mockCreate(...args),
    update: (...args: any[]) => mockUpdate(...args),
  },
}));

describe('MedicationLogModal', () => {
  const mockUserId = 'user-123';
  const mockOnClose = jest.fn();
  const mockOnLogged = jest.fn();

  const mockMedications: MedicationRecord[] = [
    {
      id: 'med-1',
      userId: mockUserId,
      name: 'Humira',
      dosage: '40mg',
      frequency: 'weekly',
      schedule: [
        {
          time: '08:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        },
      ],
      sideEffects: [],
      isActive: true,
      isDefault: false, // Story 3.5.1: Add new field
      isEnabled: true,  // Story 3.5.1: Add new field
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'med-2',
      userId: mockUserId,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'daily',
      schedule: [
        {
          time: '20:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        },
      ],
      sideEffects: [],
      isActive: true,
      isDefault: false, // Story 3.5.1: Add new field
      isEnabled: true,  // Story 3.5.1: Add new field
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set a consistent time for testing timing warnings
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-14T10:00:00')); // 10:00 AM

    mockGetScheduledForDay.mockResolvedValue(mockMedications);
    mockGetTodayEvents.mockResolvedValue([]);
    mockGetRecentNotes.mockResolvedValue([]);
    mockCreate.mockResolvedValue('event-1');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <MedicationLogModal
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
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Log Medications')).toBeInTheDocument();
    });
  });

  it('should load and display scheduled medications for today', async () => {
    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Humira')).toBeInTheDocument();
      expect(screen.getByText('Metformin')).toBeInTheDocument();
      expect(screen.getByText('40mg')).toBeInTheDocument();
      expect(screen.getByText('500mg')).toBeInTheDocument();
    });

    expect(mockGetScheduledForDay).toHaveBeenCalledWith(
      mockUserId,
      expect.any(Number)
    );
  });

  it('should show timing warning when medication is taken late', async () => {
    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      // Humira scheduled at 08:00, current time 10:00 = within 2 hours, no warning
      expect(screen.queryByText('Late')).not.toBeInTheDocument();
    });
  });

  it('should show timing warning when medication is taken very late', async () => {
    // Set time to 11:00 AM (3 hours after 08:00 scheduled time)
    jest.setSystemTime(new Date('2025-10-14T11:00:00'));

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Late')).toBeInTheDocument();
    });
  });

  it('should show timing warning when medication is taken early', async () => {
    // Set time to 05:00 AM (3 hours before 08:00 scheduled time)
    jest.setSystemTime(new Date('2025-10-14T05:00:00'));

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Early')).toBeInTheDocument();
    });
  });

  it('should display recent note suggestions as chips', async () => {
    const mockNotes = ['Felt nauseous', 'Took with food', 'No side effects'];
    mockGetRecentNotes.mockResolvedValue(mockNotes);

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Felt nauseous')).toBeInTheDocument();
      expect(screen.getByText('Took with food')).toBeInTheDocument();
      expect(screen.getByText('No side effects')).toBeInTheDocument();
    });
  });

  it('should auto-save when checkbox is toggled', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Humira')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Humira/i);
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          medicationId: 'med-1',
          taken: true,
          dosage: '40mg',
        })
      );
      expect(mockOnLogged).toHaveBeenCalled();
    });
  });

  it('should show success message after logging medication', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Humira')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Humira/i);
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText(/Humira marked as taken/i)).toBeInTheDocument();
    });
  });

  it('should apply note chip text to notes field when clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const mockNotes = ['Took with food'];
    mockGetRecentNotes.mockResolvedValue(mockNotes);

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Took with food')).toBeInTheDocument();
    });

    const chip = screen.getByText('Took with food');
    await user.click(chip);

    const notesFields = screen.getAllByPlaceholderText(/Any notes/i);
    expect(notesFields[0]).toHaveValue('Took with food');
  });

  it('should handle errors gracefully when loading medications fails', async () => {
    mockGetScheduledForDay.mockRejectedValue(
      new Error('Database error')
    );

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load medications/i)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully when creating event fails', async () => {
    const user = userEvent.setup({ delay: null });
    mockCreate.mockRejectedValue(
      new Error('Failed to create event')
    );

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Humira')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/Humira/i);
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText(/Failed to log Humira/i)).toBeInTheDocument();
    });
  });

  it('should show "no medications" message when no medications scheduled', async () => {
    mockGetScheduledForDay.mockResolvedValue([]);

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No medications scheduled for today/i)).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Log Medications')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should mark medications as already taken if events exist for today', async () => {
    const mockTodayEvents: MedicationEventRecord[] = [
      {
        id: 'event-1',
        userId: mockUserId,
        medicationId: 'med-1',
        timestamp: Date.now(),
        taken: true,
        dosage: '40mg',
        notes: undefined,
        timingWarning: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    mockGetTodayEvents.mockResolvedValue(mockTodayEvents);

    render(
      <MedicationLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      const humiraCheckbox = screen.getByLabelText(/Humira/i);
      expect(humiraCheckbox).toBeChecked();

      const metforminCheckbox = screen.getByLabelText(/Metformin/i);
      expect(metforminCheckbox).not.toBeChecked();
    });
  });
});
