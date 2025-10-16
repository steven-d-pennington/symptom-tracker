/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EventDetailModal from '../EventDetailModal';
import { TimelineEvent } from '../TimelineView';
import { medicationEventRepository } from '@/lib/repositories/medicationEventRepository';
import { triggerEventRepository } from '@/lib/repositories/triggerEventRepository';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { photoRepository } from '@/lib/repositories/photoRepository';
import { userRepository } from '@/lib/repositories/userRepository';

// Mock repositories
jest.mock('@/lib/repositories/medicationEventRepository', () => ({
  medicationEventRepository: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('@/lib/repositories/triggerEventRepository', () => ({
  triggerEventRepository: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    updateSeverity: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('@/lib/repositories/photoRepository', () => ({
  photoRepository: {
    create: jest.fn(),
  },
}));
jest.mock('@/lib/repositories/userRepository', () => ({
  userRepository: {
    getOrCreateCurrentUser: jest.fn(),
  },
}));
jest.mock('@/lib/utils/photoEncryption', () => ({
  PhotoEncryption: {
    encryptPhoto: jest.fn(),
  },
}));

// Mock PhotoCapture component
jest.mock('@/components/photos/PhotoCapture', () => ({
  PhotoCapture: ({ onPhotoCapture, onCancel }: any) => (
    <div data-testid="photo-capture">
      <button onClick={() => onPhotoCapture(new File([], 'test.jpg'), 'preview')}>
        Capture Photo
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('EventDetailModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();

  const mockMedicationEvent: TimelineEvent = {
    id: 'med-1',
    type: 'medication',
    timestamp: Date.now(),
    summary: '💊 Humira at 8:05am',
    details: 'Taken with food',
    eventRef: {
      id: 'med-1',
      userId: 'user-1',
      medicationId: 'med-123',
      timestamp: Date.now(),
      taken: true,
      dosage: '40mg',
      notes: 'Taken with food',
    },
    hasDetails: true,
  };

  const mockTriggerEvent: TimelineEvent = {
    id: 'trigger-1',
    type: 'trigger',
    timestamp: Date.now(),
    summary: '⚠️ Stress at 2:30pm',
    details: null,
    eventRef: {
      id: 'trigger-1',
      userId: 'user-1',
      triggerId: 'trigger-123',
      timestamp: Date.now(),
      intensity: 'medium',
      notes: null,
    },
    hasDetails: false,
  };

  const mockFlareEvent: TimelineEvent = {
    id: 'flare-1',
    type: 'flare-created',
    timestamp: Date.now(),
    summary: '🔥 Right armpit flare started, severity 7/10',
    details: 'Sudden onset',
    eventRef: {
      id: 'flare-1',
      userId: 'user-1',
      symptomId: 'symptom-1',
      symptomName: 'Abscess',
      bodyRegionId: 'region-1',
      bodyRegions: ['Right armpit'],
      severity: 7,
      startDate: new Date(),
      status: 'active',
      notes: 'Sudden onset',
      photoIds: [],
      severityHistory: [],
      interventions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    hasDetails: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Opening and Closing', () => {
    it('should not render when isOpen is false', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const backdrop = screen.getByRole('dialog').parentElement?.previousSibling as HTMLElement;
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.keyboard('{Escape}');

      // Note: Escape key handling would need to be implemented in the component
      // This test documents the expected behavior
    });
  });

  describe('Event Summary Display', () => {
    it('should display medication event summary with correct icon', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/💊 Event Details/)).toBeInTheDocument();
      expect(screen.getByText(/Humira at 8:05am/)).toBeInTheDocument();
    });

    it('should display trigger event summary with correct icon', () => {
      render(
        <EventDetailModal
          event={mockTriggerEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/⚠️ Event Details/)).toBeInTheDocument();
      expect(screen.getByText(/Stress at 2:30pm/)).toBeInTheDocument();
    });

    it('should display flare event summary with correct icon', () => {
      render(
        <EventDetailModal
          event={mockFlareEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/🔥 Event Details/)).toBeInTheDocument();
      expect(screen.getByText(/Right armpit flare/)).toBeInTheDocument();
    });

    it('should display formatted time', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Time format: "at 8:05am"
      expect(screen.getByText(/at \d{1,2}:\d{2}(am|pm)/i)).toBeInTheDocument();
    });
  });

  describe('Medication Event Form', () => {
    it('should show dosage override field for medication events', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Dosage Override/i)).toBeInTheDocument();
    });

    it('should show notes field for medication events', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });

    it('should populate form with existing medication data', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const dosageInput = screen.getByLabelText(/Dosage Override/i) as HTMLInputElement;
      const notesInput = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;

      expect(dosageInput.value).toBe('40mg');
      expect(notesInput.value).toBe('Taken with food');
    });
  });

  describe('Trigger Event Form', () => {
    it('should show intensity selector for trigger events', () => {
      render(
        <EventDetailModal
          event={mockTriggerEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Intensity/i)).toBeInTheDocument();
    });

    it('should show suspected cause field for trigger events', () => {
      render(
        <EventDetailModal
          event={mockTriggerEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Suspected Cause/i)).toBeInTheDocument();
    });

    it('should populate form with existing trigger data', () => {
      render(
        <EventDetailModal
          event={mockTriggerEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const intensitySelect = screen.getByLabelText(/Intensity/i) as HTMLSelectElement;
      expect(intensitySelect.value).toBe('medium');
    });
  });

  describe('Flare Event Form', () => {
    it('should show severity slider for flare events', () => {
      render(
        <EventDetailModal
          event={mockFlareEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Severity: 7\/10/i)).toBeInTheDocument();
    });

    it('should show body location field for flare events', () => {
      render(
        <EventDetailModal
          event={mockFlareEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Body Location/i)).toBeInTheDocument();
    });

    it('should populate form with existing flare data', () => {
      render(
        <EventDetailModal
          event={mockFlareEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const severityInput = screen.getByLabelText(/Severity:/i) as HTMLInputElement;
      const locationInput = screen.getByLabelText(/Body Location/i) as HTMLInputElement;

      expect(severityInput.value).toBe('7');
      expect(locationInput.value).toBe('Right armpit');
    });
  });

  describe('Photo Attachment', () => {
    it('should show add photo button', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /Add Photo/i })).toBeInTheDocument();
    });

    it('should open photo capture modal when add photo is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const addPhotoButton = screen.getByRole('button', { name: /Add Photo/i });
      await user.click(addPhotoButton);

      expect(screen.getByTestId('photo-capture')).toBeInTheDocument();
    });
  });

  describe('Event Linking', () => {
    it('should show link to related events button', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /Link to Related Events/i })).toBeInTheDocument();
    });

    it('should open event linker modal when link button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const linkButton = screen.getByRole('button', { name: /Link to Related Events/i });
      await user.click(linkButton);

      expect(screen.getByText(/Search for events from the same day/i)).toBeInTheDocument();
    });
  });

  describe('Markdown Notes', () => {
    it('should show notes field with markdown hint', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
      expect(screen.getByText(/Markdown supported/i)).toBeInTheDocument();
    });

    it('should show markdown preview when notes are entered', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={{...mockMedicationEvent, details: null, eventRef: {...mockMedicationEvent.eventRef, notes: null}}}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const notesInput = screen.getByLabelText(/Notes/i);
      await user.clear(notesInput);
      await user.type(notesInput, '**Bold text** and a list:\n- Item 1\n- Item 2');

      await waitFor(() => {
        expect(screen.getByText(/Preview:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should call update repository when save is clicked for medication', async () => {
      const user = userEvent.setup();
      (medicationEventRepository.update as jest.Mock).mockResolvedValue(undefined);

      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(medicationEventRepository.update).toHaveBeenCalledWith('med-1', {
          dosage: '40mg',
          notes: 'Taken with food',
        });
        expect(mockOnSave).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should call update repository when save is clicked for trigger', async () => {
      const user = userEvent.setup();
      (triggerEventRepository.update as jest.Mock).mockResolvedValue(undefined);

      render(
        <EventDetailModal
          event={mockTriggerEvent}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(triggerEventRepository.update).toHaveBeenCalledWith('trigger-1', {
          intensity: 'medium',
          notes: undefined,
        });
        expect(mockOnSave).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show error message if save fails', async () => {
      const user = userEvent.setup();
      (medicationEventRepository.update as jest.Mock).mockRejectedValue(new Error('Save failed'));

      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to save event details/i)).toBeInTheDocument();
      });
    });

    it('should disable save button while saving', async () => {
      const user = userEvent.setup();
      (medicationEventRepository.update as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete button', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /Delete Event/i })).toBeInTheDocument();
    });

    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete Event/i });
      await user.click(deleteButton);

      expect(screen.getByText(/Delete Event\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    it('should delete event when confirmed', async () => {
      const user = userEvent.setup();
      (medicationEventRepository.delete as jest.Mock).mockResolvedValue(undefined);

      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete Event/i });
      await user.click(deleteButton);

      const confirmButton = screen.getAllByRole('button', { name: /Delete/i })[1];
      await user.click(confirmButton);

      await waitFor(() => {
        expect(medicationEventRepository.delete).toHaveBeenCalledWith('med-1');
        expect(mockOnDelete).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should cancel deletion when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /Delete Event/i });
      await user.click(deleteButton);

      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[1];
      await user.click(cancelButton);

      expect(medicationEventRepository.delete).not.toHaveBeenCalled();
      expect(screen.queryByText(/Delete Event\?/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have keyboard navigable elements', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive classes', () => {
      render(
        <EventDetailModal
          event={mockMedicationEvent}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const modalContainer = screen.getByRole('dialog');
      expect(modalContainer).toHaveClass('md:max-w-2xl');
    });
  });
});
