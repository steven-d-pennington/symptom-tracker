import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlareResolveModal } from '../FlareResolveModal';
import { FlareRecord } from '@/lib/db/schema';
import { FlareStatus } from '@/types/flare';
import { flareRepository } from '@/lib/repositories/flareRepository';

jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    addFlareEvent: jest.fn(),
    updateFlare: jest.fn(),
  },
}));

const mockFlare: FlareRecord = {
  id: 'flare-1',
  userId: 'user-123',
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  status: FlareStatus.Active,
  bodyRegionId: 'left-elbow',
  initialSeverity: 5,
  currentSeverity: 7,
  createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
};

describe('FlareResolveModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (flareRepository.addFlareEvent as jest.Mock).mockResolvedValue({});
    (flareRepository.updateFlare as jest.Mock).mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('renders modal with title when open', () => {
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );
      expect(screen.getByText('Mark Flare as Resolved')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      const { container } = render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={false}
          onClose={() => {}}
          userId="user-123"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('displays flare summary context (body region, severity, days active)', () => {
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      expect(screen.getByText(/Body Region:/)).toBeInTheDocument();
      expect(screen.getByText(/Current Severity:/)).toBeInTheDocument();
      expect(screen.getByText(/7\/10/)).toBeInTheDocument();
      expect(screen.getByText(/Days Active:/)).toBeInTheDocument();
      expect(screen.getByText(/7 days/)).toBeInTheDocument();
    });
  });

  describe('Resolution Date', () => {
    it('auto-populates resolution date to today', () => {
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const dateInput = screen.getByLabelText('Select resolution date') as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput.value).toBe(today);
    });

    it('allows editing resolution date via date picker', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const dateInput = screen.getByLabelText('Select resolution date') as HTMLInputElement;
      const newDate = '2025-10-25';
      await user.clear(dateInput);
      await user.type(dateInput, newDate);

      expect(dateInput.value).toBe(newDate);
    });

    it('shows hint text about retroactive resolution', () => {
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      expect(screen.getByText(/Defaults to today. Edit if marking retroactively./)).toBeInTheDocument();
    });
  });

  describe('Resolution Notes', () => {
    it('accepts input in resolution notes textarea', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const notesTextarea = screen.getByLabelText('Resolution notes') as HTMLTextAreaElement;
      await user.type(notesTextarea, 'Fully healed, no pain remaining');

      expect(notesTextarea.value).toBe('Fully healed, no pain remaining');
    });

    it('enforces 500 character limit', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const longText = 'a'.repeat(600);
      const notesTextarea = screen.getByLabelText('Resolution notes') as HTMLTextAreaElement;
      await user.type(notesTextarea, longText);

      expect(notesTextarea.value).toHaveLength(500);
    });

    it('displays character counter correctly', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      expect(screen.getByText('0/500 characters')).toBeInTheDocument();

      const notesTextarea = screen.getByLabelText('Resolution notes') as HTMLTextAreaElement;
      await user.type(notesTextarea, 'Test note');

      expect(screen.getByText('9/500 characters')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error if resolution date is before flare start date', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const dateInput = screen.getByLabelText('Select resolution date') as HTMLInputElement;
      const pastDate = new Date(mockFlare.startDate - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await user.clear(dateInput);
      await user.type(dateInput, pastDate);

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Resolution date cannot be before flare start date/)).toBeInTheDocument();
      });
    });

    it('shows error if resolution date is in the future', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const dateInput = screen.getByLabelText('Select resolution date') as HTMLInputElement;
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await user.clear(dateInput);
      await user.type(dateInput, futureDate);

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Resolution date cannot be in the future/)).toBeInTheDocument();
      });
    });

    it('passes validation when date is between start date and now', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const validDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateInput = screen.getByLabelText('Select resolution date') as HTMLInputElement;

      await user.clear(dateInput);
      await user.type(dateInput, validDate);

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      // Should show confirmation dialog, not error
      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });
    });
  });

  describe('Confirmation Dialog', () => {
    it('displays confirmation dialog when Mark Resolved is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
        expect(screen.getByText(/This will mark the flare as resolved and remove it from active tracking/)).toBeInTheDocument();
      });
    });

    it('returns to form when confirmation Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByLabelText(/Cancel/);
      const confirmationCancelButton = cancelButtons[1]; // Second cancel button is in confirmation
      await user.click(confirmationCancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Are you sure?/)).not.toBeInTheDocument();
        expect(screen.getByLabelText('Select resolution date')).toBeInTheDocument();
      });
    });
  });

  describe('Resolution Persistence', () => {
    it('calls addFlareEvent with eventType=resolved when confirmed', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });

      const confirmButton = screen.getByLabelText('Confirm resolution');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(flareRepository.addFlareEvent).toHaveBeenCalledWith(
          'user-123',
          'flare-1',
          expect.objectContaining({
            eventType: 'resolved',
            resolutionDate: expect.any(Number),
          })
        );
      });
    });

    it('calls updateFlare with status=resolved and endDate', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });

      const confirmButton = screen.getByLabelText('Confirm resolution');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(flareRepository.updateFlare).toHaveBeenCalledWith(
          'user-123',
          'flare-1',
          expect.objectContaining({
            status: FlareStatus.Resolved,
            endDate: expect.any(Number),
          })
        );
      });
    });

    it('includes resolution notes in event when provided', async () => {
      const user = userEvent.setup();
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const notesTextarea = screen.getByLabelText('Resolution notes') as HTMLTextAreaElement;
      await user.type(notesTextarea, 'Fully healed');

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });

      const confirmButton = screen.getByLabelText('Confirm resolution');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(flareRepository.addFlareEvent).toHaveBeenCalledWith(
          'user-123',
          'flare-1',
          expect.objectContaining({
            resolutionNotes: 'Fully healed',
          })
        );
      });
    });

    it('shows loading state during persistence', async () => {
      const user = userEvent.setup();
      (flareRepository.updateFlare as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });

      const confirmButton = screen.getByLabelText('Confirm resolution');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Resolving...')).toBeInTheDocument();
      });
    });

    it('displays error message if persistence fails', async () => {
      const user = userEvent.setup();
      (flareRepository.updateFlare as jest.Mock).mockRejectedValue(new Error('Database error'));

      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });

      const confirmButton = screen.getByLabelText('Confirm resolution');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to mark flare as resolved/)).toBeInTheDocument();
      });
    });
  });

  describe('Callbacks', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={onClose}
          userId="user-123"
        />
      );

      const cancelButton = screen.getByLabelText('Cancel resolution');
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose and onResolve after successful resolution', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      const onResolve = jest.fn();

      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={onClose}
          onResolve={onResolve}
          userId="user-123"
        />
      );

      const resolveButton = screen.getByLabelText('Mark flare as resolved');
      await user.click(resolveButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure?/)).toBeInTheDocument();
      });

      const confirmButton = screen.getByLabelText('Confirm resolution');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onResolve).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on modal', () => {
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'resolve-modal-title');
    });

    it('has proper ARIA labels on form fields and buttons', () => {
      render(
        <FlareResolveModal
          flare={mockFlare}
          isOpen={true}
          onClose={() => {}}
          userId="user-123"
        />
      );

      expect(screen.getByLabelText('Select resolution date')).toBeInTheDocument();
      expect(screen.getByLabelText('Resolution notes')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel resolution')).toBeInTheDocument();
      expect(screen.getByLabelText('Mark flare as resolved')).toBeInTheDocument();
    });
  });
});
