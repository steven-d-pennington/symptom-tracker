/**
 * Integration tests for MarkerDetailsForm with Smart Defaults (Story 3.7.3)
 * Tests form behavior with layer-aware defaults, placeholder handling, and persistence
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkerDetailsForm } from '../MarkerDetailsForm';
import {
  getLayerDefaults,
  setLayerDefaults,
  clearLayerDefaults,
} from '@/lib/utils/layer-defaults';

describe('MarkerDetailsForm with Smart Defaults (Story 3.7.3)', () => {
  const mockCoordinates = { x: 0.5, y: 0.5 };
  const mockRegionId = 'right-shoulder';
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock = {};

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Clear any existing defaults
    clearLayerDefaults();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders the form with all required fields', () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Marker Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/Severity:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes \(Optional\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
      expect(screen.getByText('Save Marker')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('displays region ID and coordinates', () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/right shoulder/i)).toBeInTheDocument();
      expect(screen.getByText(/0.500, 0.500/i)).toBeInTheDocument();
    });
  });

  describe('AC 3.7.3.1: Form remembers last-used severity per layer', () => {
    it('loads default severity when defaults exist for layer', () => {
      // Setup: Set defaults for flares layer
      setLayerDefaults('flares', { severity: 8, notes: 'Previous notes' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Verify severity is pre-filled to 8
      const slider = screen.getByLabelText(/Severity level/i) as HTMLInputElement;
      expect(slider.value).toBe('8');

      // Check the severity display (text is split: <span>8</span>/10)
      expect(screen.getByText('8', { selector: '.font-bold' })).toBeInTheDocument();
    });

    it('uses default severity (5) when no defaults exist (first-time user)', () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const slider = screen.getByLabelText(/Severity level/i) as HTMLInputElement;
      expect(slider.value).toBe('5');

      // Check the severity display
      expect(screen.getByText('5', { selector: '.font-bold' })).toBeInTheDocument();
    });
  });

  describe('AC 3.7.3.2: Last-used notes shown as placeholder', () => {
    it('displays last-used notes as placeholder text', () => {
      // Setup: Set defaults with notes
      setLayerDefaults('flares', { severity: 7, notes: 'Painful and swollen' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByPlaceholderText('Painful and swollen');
      expect(notesField).toBeInTheDocument();
    });

    it('shows generic placeholder when no defaults exist', () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByPlaceholderText(
        'Add any details about this symptom...'
      );
      expect(notesField).toBeInTheDocument();
    });

    it('placeholder has gray and italic styling', () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Test placeholder' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByPlaceholderText('Test placeholder');
      expect(notesField).toHaveClass('placeholder:text-gray-400');
      expect(notesField).toHaveClass('placeholder:italic');
    });
  });

  describe('AC 3.7.3.3: Save button enabled immediately', () => {
    it('save button is enabled when form loads with defaults', () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Test' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Save Marker');
      expect(saveButton).toBeEnabled();
    });

    it('save button is enabled even without defaults (first-time user)', () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Save Marker');
      expect(saveButton).toBeEnabled();
    });
  });

  describe('AC 3.7.3.4: User can override defaults', () => {
    it('allows user to change severity from default', () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Test' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Verify defaults loaded
      expect(screen.getByText('7', { selector: '.font-bold' })).toBeInTheDocument();

      const slider = screen.getByLabelText(/Severity level/i);
      fireEvent.change(slider, { target: { value: '9' } });

      // Verify severity updated
      expect(screen.getByText('9', { selector: '.font-bold' })).toBeInTheDocument();
    });

    it('allows user to type different notes than placeholder', async () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Old notes' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByLabelText(/Notes \(Optional\)/i);
      await userEvent.type(notesField, 'New notes');

      expect(notesField).toHaveValue('New notes');
    });

    it('saves new values as updated defaults on submit', async () => {
      setLayerDefaults('flares', { severity: 5, notes: 'Old' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Change severity and notes
      const slider = screen.getByLabelText(/Severity level/i);
      fireEvent.change(slider, { target: { value: '8' } });

      const notesField = screen.getByLabelText(/Notes \(Optional\)/i);
      await userEvent.type(notesField, 'Updated notes');

      // Submit
      const saveButton = screen.getByText('Save Marker');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Verify new defaults saved
      const updated = getLayerDefaults('flares');
      expect(updated).toEqual({ severity: 8, notes: 'Updated notes' });
    });
  });

  describe('AC 3.7.3.5: Placeholder disappears when typing', () => {
    it('placeholder is hidden when user types in field', async () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Placeholder text' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByLabelText(/Notes \(Optional\)/i);

      // Type in field
      await userEvent.type(notesField, 'User input');

      // Placeholder should not be visible (native behavior - value replaces placeholder)
      expect(notesField).toHaveValue('User input');
    });
  });

  describe('AC 3.7.3.6: Placeholder NOT saved unless explicitly kept', () => {
    it('saves empty notes when field is not filled', async () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Placeholder text' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Submit without typing in notes field
      const saveButton = screen.getByText('Save Marker');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: '', // Empty, not placeholder text
          })
        );
      });
    });

    it('saves actual typed notes, not placeholder', async () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Old placeholder' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByLabelText(/Notes \(Optional\)/i);
      await userEvent.type(notesField, 'Actual notes');

      const saveButton = screen.getByText('Save Marker');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: 'Actual notes',
          })
        );
      });
    });
  });

  describe('AC 3.7.3.8: Layer-aware defaults (independent per layer)', () => {
    it('flare defaults do not affect pain defaults', () => {
      // Setup different defaults for each layer
      setLayerDefaults('flares', { severity: 8, notes: 'Flare notes' });
      setLayerDefaults('pain', { severity: 4, notes: 'Pain notes' });

      // Render with flares layer
      const { rerender } = render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      let slider = screen.getByLabelText(/Severity level/i) as HTMLInputElement;
      expect(slider.value).toBe('8');
      expect(screen.getByPlaceholderText('Flare notes')).toBeInTheDocument();

      // Re-render with pain layer
      rerender(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="pain"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      slider = screen.getByLabelText(/Severity level/i) as HTMLInputElement;
      expect(slider.value).toBe('4');
      expect(screen.getByPlaceholderText('Pain notes')).toBeInTheDocument();
    });

    it('changing flare defaults does not affect pain defaults', async () => {
      // Setup initial defaults for both layers
      setLayerDefaults('flares', { severity: 7, notes: 'Initial flare' });
      setLayerDefaults('pain', { severity: 5, notes: 'Initial pain' });

      // Update flares defaults through form
      const { unmount } = render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const slider = screen.getByLabelText(/Severity level/i);
      fireEvent.change(slider, { target: { value: '9' } });

      const notesField = screen.getByLabelText(/Notes \(Optional\)/i);
      await userEvent.type(notesField, 'Updated flare');

      const saveButton = screen.getByText('Save Marker');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      unmount();

      // Verify pain defaults unchanged
      const painDefaults = getLayerDefaults('pain');
      expect(painDefaults).toEqual({ severity: 5, notes: 'Initial pain' });
    });
  });

  describe('Form submission', () => {
    it('calls onSubmit with correct data', async () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const slider = screen.getByLabelText(/Severity level/i);
      fireEvent.change(slider, { target: { value: '7' } });

      const notesField = screen.getByLabelText(/Notes \(Optional\)/i);
      await userEvent.type(notesField, 'Test notes');

      const saveButton = screen.getByText('Save Marker');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            severity: 7,
            notes: 'Test notes',
            timestamp: expect.any(Date),
          })
        );
      });
    });

    it('trims whitespace from notes', async () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesField = screen.getByLabelText(/Notes \(Optional\)/i);
      await userEvent.type(notesField, '  whitespace test  ');

      const saveButton = screen.getByText('Save Marker');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: 'whitespace test',
          })
        );
      });
    });
  });

  describe('Cancel behavior', () => {
    it('calls onCancel when cancel button clicked', () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls onCancel when X button clicked', () => {
      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const closeButton = screen.getByLabelText('Close form');
      fireEvent.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Quick entry workflow (AC 3.7.3.3)', () => {
    it('supports single-tap save with defaults', async () => {
      setLayerDefaults('flares', { severity: 7, notes: 'Quick entry' });

      render(
        <MarkerDetailsForm
          coordinates={mockCoordinates}
          regionId={mockRegionId}
          layer="flares"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // User can immediately click save without any input
      const saveButton = screen.getByText('Save Marker');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            severity: 7,
            notes: '',
          })
        );
      });
    });
  });
});
