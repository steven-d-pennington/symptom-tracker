/**
 * Tests for SymptomQuickLogForm (Story 3.5.3)
 * AC3.5.3.2: Quick Log mode for essential fields
 * AC3.5.3.3: Add Details expansion
 * AC3.5.3.6: Toast notifications
 * AC3.5.3.8: Mobile responsive with touch targets
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { SymptomQuickLogForm } from '../SymptomQuickLogForm';
import { SymptomRecord } from '@/lib/db/schema';
import { toast } from '@/components/common/Toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/common/Toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockGetActive = jest.fn();
const mockGetRecentNotes = jest.fn();
const mockCreate = jest.fn();

jest.mock('@/lib/repositories/symptomRepository', () => ({
  symptomRepository: {
    getActive: (...args: any[]) => mockGetActive(...args),
  },
}));

jest.mock('@/lib/repositories/symptomInstanceRepository', () => ({
  symptomInstanceRepository: {
    getRecentNotes: (...args: any[]) => mockGetRecentNotes(...args),
    create: (...args: any[]) => mockCreate(...args),
  },
}));

jest.mock('../SymptomSelectionList', () => ({
  SymptomSelectionList: ({
    symptoms,
    selectedSymptom,
    onSymptomSelect,
    isLoading,
  }: any) => (
    <div data-testid="symptom-selection-list">
      {isLoading ? (
        <div>Loading symptoms...</div>
      ) : (
        <div>
          {symptoms.map((symptom: SymptomRecord) => (
            <button
              key={symptom.id}
              onClick={() => onSymptomSelect(symptom)}
              data-testid={`symptom-${symptom.id}`}
            >
              {symptom.name}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockSymptoms: SymptomRecord[] = [
  {
    id: 'symptom-1',
    userId: 'user-123',
    name: 'Fatigue',
    category: 'General',
    description: 'Tiredness',
    commonTriggers: [],
    severityScale: { type: 'numeric', min: 1, max: 10, labels: {} },
    isActive: true,
    isDefault: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'symptom-2',
    userId: 'user-123',
    name: 'Joint Pain',
    category: 'Pain',
    description: 'Pain in joints',
    commonTriggers: [],
    severityScale: { type: 'numeric', min: 1, max: 10, labels: {} },
    isActive: true,
    isDefault: false,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('SymptomQuickLogForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockGetActive.mockResolvedValue(mockSymptoms);
    mockGetRecentNotes.mockResolvedValue([]);
    mockCreate.mockResolvedValue('instance-123');
  });

  describe('AC3.5.3.2 - Quick Log mode', () => {
    it('loads and displays symptoms on mount', async () => {
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(mockGetActive).toHaveBeenCalledWith('user-123');
        expect(screen.getByTestId('symptom-selection-list')).toBeInTheDocument();
      });
    });

    it('shows essential fields after selecting a symptom', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Severity/)).toBeInTheDocument();
        expect(screen.getByLabelText(/When/)).toBeInTheDocument();
        expect(screen.getByText('Save Symptom')).toBeInTheDocument();
      });
    });

    it('displays selected symptom name in form', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      await waitFor(() => {
        expect(screen.getByText(/Logging:/)).toBeInTheDocument();
        expect(screen.getByText('Fatigue')).toBeInTheDocument();
      });
    });

    it('has default severity of 5', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      const severityInput = (await screen.findByLabelText(/Severity/)) as HTMLInputElement;
      expect(severityInput.value).toBe('5');
    });
  });

  describe('AC3.5.3.3 - Add Details expansion', () => {
    it('shows "Add Details" button in collapsed state', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      await waitFor(() => {
        expect(screen.getByText('Add Details')).toBeInTheDocument();
      });

      // Optional fields should not be visible
      expect(screen.queryByLabelText('Body Location')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Notes')).not.toBeInTheDocument();
    });

    it('expands to show optional fields when "Add Details" is clicked', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));
      await waitFor(() => {
        expect(screen.getByText('Add Details')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Add Details'));

      await waitFor(() => {
        expect(screen.getByLabelText('Body Location')).toBeInTheDocument();
        expect(screen.getByLabelText('Notes')).toBeInTheDocument();
        expect(screen.getByText('Hide Details')).toBeInTheDocument();
      });
    });

    it('collapses optional fields when "Hide Details" is clicked', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));
      await user.click(screen.getByText('Add Details'));

      await waitFor(() => {
        expect(screen.getByText('Hide Details')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Hide Details'));

      await waitFor(() => {
        expect(screen.getByText('Add Details')).toBeInTheDocument();
        expect(screen.queryByLabelText('Body Location')).not.toBeInTheDocument();
      });
    });

    it('preserves form data when toggling details', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));
      await user.click(screen.getByText('Add Details'));

      const notesInput = (await screen.findByLabelText('Notes')) as HTMLTextAreaElement;
      await user.type(notesInput, 'Test notes');

      await user.click(screen.getByText('Hide Details'));
      await user.click(screen.getByText('Add Details'));

      const notesInputAgain = (await screen.findByLabelText('Notes')) as HTMLTextAreaElement;
      expect(notesInputAgain.value).toBe('Test notes');
    });

    it('loads and displays recent notes for selected symptom', async () => {
      const user = userEvent.setup();
      mockGetRecentNotes.mockResolvedValue(['Previous note 1', 'Previous note 2']);

      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      await waitFor(() => {
        expect(mockGetRecentNotes).toHaveBeenCalledWith('user-123', 'Fatigue', 10);
      });

      await user.click(screen.getByText('Add Details'));

      await waitFor(() => {
        expect(screen.getByText('Previous note 1')).toBeInTheDocument();
        expect(screen.getByText('Previous note 2')).toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('validates required fields before submission', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-selection-list')).toBeInTheDocument();
      });

      // Try to submit without selecting a symptom
      // (No submit button visible without symptom selection)
      expect(screen.queryByText('Save Symptom')).not.toBeInTheDocument();
    });

    it('creates symptom instance with quick log data only', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      const severityInput = await screen.findByLabelText(/Severity/);
      await user.clear(severityInput);
      await user.type(severityInput, '7');

      await user.click(screen.getByText('Save Symptom'));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user-123',
            name: 'Fatigue',
            category: 'General',
            severity: 7,
          })
        );
      });
    });

    it('includes optional fields when details are expanded', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));
      await user.click(screen.getByText('Add Details'));

      const locationInput = await screen.findByLabelText('Body Location');
      await user.type(locationInput, 'Left arm');

      const notesInput = await screen.findByLabelText('Notes');
      await user.type(notesInput, 'Severe pain');

      await user.click(screen.getByText('Save Symptom'));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            location: 'Left arm',
            notes: 'Severe pain',
          })
        );
      });
    });
  });

  describe('AC3.5.3.6 - Toast notifications', () => {
    it('shows success toast after successful submission', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));
      await user.click(screen.getByText('Save Symptom'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Symptom logged successfully',
          expect.objectContaining({
            description: expect.stringContaining('Fatigue'),
          })
        );
      });
    });

    it('shows error toast on submission failure', async () => {
      const user = userEvent.setup();
      mockCreate.mockRejectedValue(new Error('Network error'));

      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));
      await user.click(screen.getByText('Save Symptom'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to log symptom',
          expect.any(Object)
        );
      });
    });

    it('navigates back after successful submission', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));
      await user.click(screen.getByText('Save Symptom'));

      await waitFor(() => {
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });

  describe('AC3.5.3.8 - Mobile touch targets', () => {
    it('has minimum 44px height for touch targets', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      const saveButton = await screen.findByText('Save Symptom');
      const styles = window.getComputedStyle(saveButton);

      // Button should have minHeight of 44px (inline style)
      expect(saveButton).toHaveStyle({ minHeight: '44px' });
    });
  });

  describe('Empty states', () => {
    it('shows message when no symptoms exist', async () => {
      mockGetActive.mockResolvedValue([]);

      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText(/No symptoms available/)).toBeInTheDocument();
        expect(screen.getByText('Go to Settings')).toBeInTheDocument();
      });
    });

    it('navigates to settings when "Go to Settings" is clicked', async () => {
      const user = userEvent.setup();
      mockGetActive.mockResolvedValue([]);

      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText('Go to Settings')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Go to Settings'));

      expect(mockRouter.push).toHaveBeenCalledWith('/settings');
    });
  });

  describe('Cancel functionality', () => {
    it('navigates back when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<SymptomQuickLogForm userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('symptom-1'));

      const cancelButton = await screen.findByText('Cancel');
      await user.click(cancelButton);

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});
