import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymptomLogModal } from '../SymptomLogModal';
import { SymptomRecord } from '@/lib/db/schema';
import { Symptom } from '@/lib/types/symptoms';

// Mock repositories
const mockGetActive = jest.fn();
const mockGetByDateRange = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/repositories/symptomRepository', () => ({
  symptomRepository: {
    getActive: (...args: any[]) => mockGetActive(...args),
  },
}));

jest.mock('@/lib/repositories/symptomInstanceRepository', () => ({
  symptomInstanceRepository: {
    getByDateRange: (...args: any[]) => mockGetByDateRange(...args),
    create: (...args: any[]) => mockCreate(...args),
    update: (...args: any[]) => mockUpdate(...args),
  },
}));

describe('SymptomLogModal', () => {
  const mockUserId = 'user-123';
  const mockOnClose = jest.fn();
  const mockOnLogged = jest.fn();

  const mockSymptoms: SymptomRecord[] = [
    {
      id: 'symptom-1',
      userId: mockUserId,
      name: 'Fatigue',
      category: 'General',
      description: 'Tiredness',
      commonTriggers: [],
      severityScale: { min: 1, max: 10, labels: {} },
      isActive: true,
      isDefault: true,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'symptom-2',
      userId: mockUserId,
      name: 'Joint Pain',
      category: 'Pain',
      description: 'Pain in joints',
      commonTriggers: [],
      severityScale: { min: 1, max: 10, labels: {} },
      isActive: true,
      isDefault: true,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'symptom-3',
      userId: mockUserId,
      name: 'Headache',
      category: 'Pain',
      description: 'Head pain',
      commonTriggers: [],
      severityScale: { min: 1, max: 10, labels: {} },
      isActive: true,
      isDefault: true,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockRecentSymptoms: Symptom[] = [
    {
      id: 'instance-1',
      userId: mockUserId,
      name: 'Fatigue',
      category: 'General',
      severity: 7,
      severityScale: { min: 1, max: 10, labels: {} },
      location: undefined,
      duration: undefined,
      triggers: undefined,
      notes: undefined,
      photos: undefined,
      timestamp: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetActive.mockResolvedValue(mockSymptoms);
    mockGetByDateRange.mockResolvedValue(mockRecentSymptoms);
    mockCreate.mockResolvedValue('instance-new');
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <SymptomLogModal
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
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Log Symptom')).toBeInTheDocument();
    });
  });

  it('should display favorites section first with recently logged symptoms', async () => {
    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Recent / Favorites')).toBeInTheDocument();
      const fatigueButtons = screen.getAllByText('Fatigue');
      expect(fatigueButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display full symptom list with categories', async () => {
    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Pain')).toBeInTheDocument();
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
      expect(screen.getByText('Headache')).toBeInTheDocument();
    });
  });

  it('should log symptom immediately on first tap', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const symptomButton = screen.getByText('Joint Pain');
    await user.click(symptomButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          name: 'Joint Pain',
          category: 'Pain',
          severity: 5,
        })
      );
      expect(mockOnLogged).toHaveBeenCalled();
      expect(screen.getByText(/Joint Pain logged/i)).toBeInTheDocument();
    });
  });

  it('should show progressive disclosure form on second tap', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const symptomButton = screen.getByText('Joint Pain');
    await user.click(symptomButton);

    await waitFor(() => {
      expect(screen.getByText(/Severity:/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Additional details/i)).toBeInTheDocument();
    });
  });

  it('should allow adjusting severity in expanded form', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const symptomButton = screen.getByText('Joint Pain');
    await user.click(symptomButton);

    await waitFor(() => {
      const severitySlider = screen.getByRole('slider');
      expect(severitySlider).toBeInTheDocument();
    });

    const severitySlider = screen.getByRole('slider') as HTMLInputElement;
    await user.clear(severitySlider);
    await user.type(severitySlider, '8');

    expect(severitySlider.value).toBe('8');
  });

  it('should save details when Save Details button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    // Mock getByDateRange to return the newly created instance
    mockGetByDateRange.mockResolvedValue([
      {
        id: 'instance-new',
        userId: mockUserId,
        name: 'Joint Pain',
        category: 'Pain',
        severity: 5,
        severityScale: { min: 1, max: 10, labels: {} },
        location: undefined,
        duration: undefined,
        triggers: undefined,
        notes: undefined,
        photos: undefined,
        timestamp: new Date(),
        updatedAt: new Date(),
      },
    ]);

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const symptomButton = screen.getByText('Joint Pain');
    await user.click(symptomButton);

    await waitFor(() => {
      expect(screen.getByText('Save Details')).toBeInTheDocument();
    });

    const notesField = screen.getByPlaceholderText(/Additional details/i);
    await user.type(notesField, 'Sharp pain in left knee');

    const saveButton = screen.getByText('Save Details');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        'instance-new',
        expect.objectContaining({
          severity: 5,
          notes: 'Sharp pain in left knee',
        })
      );
    });
  });

  it('should filter symptoms based on search query', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
      expect(screen.getByText('Headache')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search symptoms/i);
    await user.type(searchInput, 'joint');

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
      expect(screen.queryByText('Headache')).not.toBeInTheDocument();
    });
  });

  it('should filter symptoms by category in search', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search symptoms/i);
    await user.type(searchInput, 'pain');

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
      expect(screen.getByText('Headache')).toBeInTheDocument();
      // Fatigue should be filtered out (not in Pain category and name doesn't match)
      const generalSection = screen.queryByText('General');
      expect(generalSection).not.toBeInTheDocument();
    });
  });

  it('should show no symptoms message when search returns no results', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search symptoms/i);
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No symptoms found')).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully when loading symptoms fails', async () => {
    mockGetActive.mockRejectedValue(new Error('Database error'));

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load symptoms/i)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully when creating symptom instance fails', async () => {
    const user = userEvent.setup({ delay: null });
    mockCreate.mockRejectedValue(
      new Error('Failed to create instance')
    );

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const symptomButton = screen.getByText('Joint Pain');
    await user.click(symptomButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to log Joint Pain/i)).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Log Symptom')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should cancel expanded form when Cancel button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <SymptomLogModal
        userId={mockUserId}
        isOpen={true}
        onClose={mockOnClose}
        onLogged={mockOnLogged}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Joint Pain')).toBeInTheDocument();
    });

    const symptomButton = screen.getByText('Joint Pain');
    await user.click(symptomButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Save Details')).not.toBeInTheDocument();
    });
  });
});
