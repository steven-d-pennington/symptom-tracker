import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterventionLogModal } from '../InterventionLogModal';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { FlareRecord } from '@/lib/db/schema';
import { InterventionType } from '@/types/flare';

// Mock the flare repository
jest.mock('@/lib/repositories/flareRepository');

describe('InterventionLogModal', () => {
  const mockFlare: FlareRecord = {
    id: 'flare-123',
    userId: 'user-123',
    startDate: Date.now() - 86400000,
    status: 'active',
    bodyRegionId: 'left-shoulder',
    initialSeverity: 7,
    currentSeverity: 7,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  };

  const mockOnClose = jest.fn();
  const mockOnLog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (flareRepository.addFlareEvent as jest.Mock) = jest.fn().mockResolvedValue({
      id: 'event-123',
      flareId: 'flare-123',
      eventType: 'intervention',
      timestamp: Date.now(),
    });
  });

  describe('Modal Rendering (AC2.5.2)', () => {
    it('renders modal with intervention type dropdown', () => {
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      expect(screen.getByLabelText(/intervention type/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays all intervention types as options', () => {
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const dropdown = screen.getByLabelText(/intervention type/i);
      expect(dropdown).toHaveTextContent('Ice');
      expect(dropdown).toHaveTextContent('Heat');
      expect(dropdown).toHaveTextContent('Medication');
      expect(dropdown).toHaveTextContent('Rest');
      expect(dropdown).toHaveTextContent('Drainage');
      expect(dropdown).toHaveTextContent('Other');
    });

    it('renders details textarea with 500 char limit', () => {
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      expect(screen.getByLabelText(/specific details/i)).toBeInTheDocument();
      expect(screen.getByText(/0\/500 characters/i)).toBeInTheDocument();
    });

    it('renders timestamp field auto-populated', () => {
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const timestampInput = screen.getByLabelText(/timestamp/i);
      expect(timestampInput).toBeInTheDocument();
      expect(timestampInput).toHaveAttribute('type', 'datetime-local');
      expect(timestampInput).toHaveValue(expect.any(String));
    });

    it('renders Save and Cancel buttons', () => {
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      const { container } = render(
        <InterventionLogModal
          isOpen={false}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Form Interaction (AC2.5.2)', () => {
    it('allows selecting different intervention types', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const dropdown = screen.getByLabelText(/intervention type/i);
      await user.selectOptions(dropdown, InterventionType.Medication);

      expect(dropdown).toHaveValue(InterventionType.Medication);
    });

    it('accepts text input in details field', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const details = screen.getByLabelText(/specific details/i);
      await user.type(details, 'Ibuprofen 400mg');

      expect(details).toHaveValue('Ibuprofen 400mg');
    });

    it('truncates details at 500 characters', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const longText = 'a'.repeat(600);
      const details = screen.getByLabelText(/specific details/i);
      await user.type(details, longText);

      expect(details).toHaveValue('a'.repeat(500));
      expect(screen.getByText(/500\/500 characters/i)).toBeInTheDocument();
    });

    it('displays character counter correctly', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const details = screen.getByLabelText(/specific details/i);
      await user.type(details, 'Test');

      expect(screen.getByText(/4\/500 characters/i)).toBeInTheDocument();
    });

    it('allows editing timestamp', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const timestampInput = screen.getByLabelText(/timestamp/i);
      await user.clear(timestampInput);
      await user.type(timestampInput, '2025-10-24T14:30');

      expect(timestampInput).toHaveValue('2025-10-24T14:30');
    });
  });

  describe('Form Submission (AC2.5.3, AC2.5.7)', () => {
    it('calls addFlareEvent with correct eventType on save', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
          onLog={mockOnLog}
        />
      );

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(flareRepository.addFlareEvent).toHaveBeenCalledWith(
          'user-123',
          'flare-123',
          expect.objectContaining({
            eventType: "intervention",
          })
        );
      });
    });

    it('includes interventionType in event', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const dropdown = screen.getByLabelText(/intervention type/i);
      await user.selectOptions(dropdown, InterventionType.Heat);
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(flareRepository.addFlareEvent).toHaveBeenCalledWith(
          'user-123',
          'flare-123',
          expect.objectContaining({
            interventionType: InterventionType.Heat,
          })
        );
      });
    });

    it('includes interventionDetails in event', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      const details = screen.getByLabelText(/specific details/i);
      await user.type(details, 'Took medication with food');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(flareRepository.addFlareEvent).toHaveBeenCalledWith(
          'user-123',
          'flare-123',
          expect.objectContaining({
            interventionDetails: 'Took medication with food',
          })
        );
      });
    });

    it('allows empty details field (optional)', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(flareRepository.addFlareEvent).toHaveBeenCalledWith(
          'user-123',
          'flare-123',
          expect.objectContaining({
            interventionType: InterventionType.Ice,
            interventionDetails: undefined,
          })
        );
      });
    });

    it('closes modal and calls onLog after successful save', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
          onLog={mockOnLog}
        />
      );

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnLog).toHaveBeenCalled();
      });
    });

    it('displays loading state during save', async () => {
      const user = userEvent.setup();
      (flareRepository.addFlareEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('handles save errors gracefully', async () => {
      const user = userEvent.setup();
      (flareRepository.addFlareEvent as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to save intervention/i)).toBeInTheDocument();
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('closes modal without saving on cancel', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
          onLog={mockOnLog}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
      expect(flareRepository.addFlareEvent).not.toHaveBeenCalled();
      expect(mockOnLog).not.toHaveBeenCalled();
    });

    it('closes modal on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Reset (AC2.5.2)', () => {
    it('resets form when modal reopens', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      // Fill form
      const details = screen.getByLabelText(/specific details/i);
      await user.type(details, 'Test details');

      // Close and reopen
      rerender(
        <InterventionLogModal
          isOpen={false}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );
      rerender(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      // Check form is reset
      expect(screen.getByLabelText(/specific details/i)).toHaveValue('');
      expect(screen.getByLabelText(/intervention type/i)).toHaveValue(
        InterventionType.Ice
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-labelledby',
        'intervention-modal-title'
      );
    });

    it('disables form elements during loading', async () => {
      const user = userEvent.setup();
      (flareRepository.addFlareEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <InterventionLogModal
          isOpen={true}
          onClose={mockOnClose}
          flare={mockFlare}
          userId="user-123"
        />
      );

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(screen.getByLabelText(/intervention type/i)).toBeDisabled();
      expect(screen.getByLabelText(/specific details/i)).toBeDisabled();
      expect(screen.getByLabelText(/timestamp/i)).toBeDisabled();
    });
  });
});
