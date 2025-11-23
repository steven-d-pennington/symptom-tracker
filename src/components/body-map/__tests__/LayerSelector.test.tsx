/**
 * LayerSelector Component Tests (Story 5.3)
 *
 * Comprehensive test suite for layer selector UI component.
 * Tests rendering, interaction, keyboard navigation, accessibility, and mobile optimization.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LayerSelector } from '../LayerSelector';
import { LAYER_CONFIG } from '@/lib/db/schema';

describe('LayerSelector', () => {
  const mockOnLayerChange = jest.fn();

  beforeEach(() => {
    mockOnLayerChange.mockClear();
  });

  describe('Rendering (AC5.3.1, AC5.3.2)', () => {
    it('should render all layer options with icons and labels', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      // Verify all 3 layers are rendered
      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();
      expect(screen.getByText('Inflammation')).toBeInTheDocument();

      // Verify icons are rendered (check for emoji)
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('🟣')).toBeInTheDocument();
    });

    it('should highlight current layer with active state', () => {
      render(
        <LayerSelector
          currentLayer="pain"
          onLayerChange={mockOnLayerChange}
        />
      );

      const painButton = screen.getByRole('radio', { name: /pain layer/i });
      expect(painButton).toHaveAttribute('aria-checked', 'true');

      const flaresButton = screen.getByRole('radio', { name: /flares layer/i });
      expect(flaresButton).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Selection Logic (AC5.3.3, AC5.3.8)', () => {
    it('should call onLayerChange when option clicked', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      fireEvent.click(screen.getByText('Pain'));

      expect(mockOnLayerChange).toHaveBeenCalledTimes(1);
      expect(mockOnLayerChange).toHaveBeenCalledWith('pain');
    });

    it('should update immediately without loading delay', () => {
      const { rerender } = render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      fireEvent.click(screen.getByText('Pain'));

      // Verify callback was called immediately
      expect(mockOnLayerChange).toHaveBeenCalled();

      // Rerender with new layer to simulate parent state update
      rerender(
        <LayerSelector
          currentLayer="pain"
          onLayerChange={mockOnLayerChange}
        />
      );

      // Verify UI updated immediately
      const painButton = screen.getByRole('radio', { name: /pain layer/i });
      expect(painButton).toHaveAttribute('aria-checked', 'true');
    });

    it('should prevent selection when disabled=true', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
          disabled={true}
        />
      );

      fireEvent.click(screen.getByText('Pain'));

      expect(mockOnLayerChange).not.toHaveBeenCalled();
    });

    it('should have disabled attribute on buttons when disabled', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
          disabled={true}
        />
      );

      const buttons = screen.getAllByRole('radio');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Last-Used Badge (AC5.3.4)', () => {
    it('should display last-used badge correctly', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
          lastUsedLayer="pain"
        />
      );

      // Badge should appear
      expect(screen.getByText('Last')).toBeInTheDocument();
    });

    it('should not display badge when lastUsedLayer equals currentLayer', () => {
      render(
        <LayerSelector
          currentLayer="pain"
          onLayerChange={mockOnLayerChange}
          lastUsedLayer="pain"
        />
      );

      // Badge should not appear
      expect(screen.queryByText('Last')).not.toBeInTheDocument();
    });

    it('should not display badge when lastUsedLayer is not provided', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      expect(screen.queryByText('Last')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation (AC5.3.7)', () => {
    it('should navigate with ArrowRight key', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      const radiogroup = screen.getByRole('radiogroup');
      const buttons = screen.getAllByRole('radio');

      // Initial focus on first button
      buttons[0].focus();

      // Press ArrowRight to navigate to next button
      fireEvent.keyDown(radiogroup, { key: 'ArrowRight' });

      expect(document.activeElement).toBe(buttons[1]);
    });

    it('should navigate with ArrowLeft key', () => {
      render(
        <LayerSelector
          currentLayer="pain"
          onLayerChange={mockOnLayerChange}
        />
      );

      const radiogroup = screen.getByRole('radiogroup');
      const buttons = screen.getAllByRole('radio');

      // Focus on second button (Pain)
      buttons[1].focus();

      // Press ArrowLeft to navigate to previous button
      fireEvent.keyDown(radiogroup, { key: 'ArrowLeft' });

      expect(document.activeElement).toBe(buttons[0]);
    });

    it('should wrap around when navigating past last option', () => {
      render(
        <LayerSelector
          currentLayer="inflammation"
          onLayerChange={mockOnLayerChange}
        />
      );

      const radiogroup = screen.getByRole('radiogroup');
      const buttons = screen.getAllByRole('radio');

      // Focus on last button
      buttons[2].focus();

      // Press ArrowRight should wrap to first button
      fireEvent.keyDown(radiogroup, { key: 'ArrowRight' });

      expect(document.activeElement).toBe(buttons[0]);
    });

    it('should select layer with Enter key', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      const radiogroup = screen.getByRole('radiogroup');
      const buttons = screen.getAllByRole('radio');

      // Navigate to Pain option using ArrowRight
      fireEvent.keyDown(radiogroup, { key: 'ArrowRight' });

      // Press Enter to select
      fireEvent.keyDown(radiogroup, { key: 'Enter' });

      expect(mockOnLayerChange).toHaveBeenCalledWith('pain');
    });

    it('should select layer with Space key', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      const radiogroup = screen.getByRole('radiogroup');
      const buttons = screen.getAllByRole('radio');

      // Navigate to Pain option using ArrowRight
      fireEvent.keyDown(radiogroup, { key: 'ArrowRight' });

      // Press Space to select
      fireEvent.keyDown(radiogroup, { key: ' ' });

      expect(mockOnLayerChange).toHaveBeenCalledWith('pain');
    });

    it('should not navigate when disabled', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
          disabled={true}
        />
      );

      const radiogroup = screen.getByRole('radiogroup');

      // Try to navigate
      fireEvent.keyDown(radiogroup, { key: 'ArrowRight' });

      // Callback should not be called
      expect(mockOnLayerChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility (AC5.3.9)', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      // Radiogroup with label
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Layer selector');

      // Radio buttons
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);

      // Each radio should have aria-checked
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('aria-checked');
      });
    });

    it('should have aria-checked="true" on active layer', () => {
      render(
        <LayerSelector
          currentLayer="pain"
          onLayerChange={mockOnLayerChange}
        />
      );

      const painRadio = screen.getByRole('radio', { name: /pain layer/i });
      expect(painRadio).toHaveAttribute('aria-checked', 'true');

      const flaresRadio = screen.getByRole('radio', { name: /flares layer/i });
      expect(flaresRadio).toHaveAttribute('aria-checked', 'false');
    });

    it('should have ARIA live region for announcements', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should announce layer selection', async () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      // Click Pain layer
      fireEvent.click(screen.getByText('Pain'));

      // Check live region updated
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent('Pain layer selected');
      });
    });

    it('should have proper aria-label on each button', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      expect(screen.getByRole('radio', { name: 'Flares layer' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Pain layer' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Inflammation layer' })).toBeInTheDocument();
    });
  });

  describe('Mobile Optimization (AC5.3.6)', () => {
    it('should meet 44x44px minimum touch target size', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      const buttons = screen.getAllByRole('radio');

      buttons.forEach(button => {
        // Check className for min-h-[44px] and min-w-[44px]
        expect(button.className).toMatch(/min-h-\[44px\]/);
        expect(button.className).toMatch(/min-w-\[44px\]/);
      });
    });

    it('should have proper spacing between buttons', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      const radiogroup = screen.getByRole('radiogroup');

      // Check for gap class (should have gap-2)
      expect(radiogroup.className).toMatch(/gap-2/);
    });
  });

  describe('Theme Support', () => {
    it('should render without errors in light theme', () => {
      const { container } = render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should have dark mode classes', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      const buttons = screen.getAllByRole('radio');

      buttons.forEach(button => {
        // Check for dark mode classes in className
        expect(button.className).toMatch(/dark:/);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete user workflow', () => {
      const { rerender } = render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      // User clicks Pain layer
      fireEvent.click(screen.getByText('Pain'));
      expect(mockOnLayerChange).toHaveBeenCalledWith('pain');

      // Parent updates state
      rerender(
        <LayerSelector
          currentLayer="pain"
          lastUsedLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      // Verify Pain is now active and Flares shows "Last used" badge
      const painButton = screen.getByRole('radio', { name: /pain layer/i });
      expect(painButton).toHaveAttribute('aria-checked', 'true');

      expect(screen.getByText('Last')).toBeInTheDocument();
    });

    it('should handle rapid layer changes', () => {
      render(
        <LayerSelector
          currentLayer="flares"
          onLayerChange={mockOnLayerChange}
        />
      );

      // Rapid clicks
      fireEvent.click(screen.getByText('Pain'));
      fireEvent.click(screen.getByText('Inflammation'));
      fireEvent.click(screen.getByText('Flares'));

      expect(mockOnLayerChange).toHaveBeenCalledTimes(3);
      expect(mockOnLayerChange).toHaveBeenNthCalledWith(1, 'pain');
      expect(mockOnLayerChange).toHaveBeenNthCalledWith(2, 'inflammation');
      expect(mockOnLayerChange).toHaveBeenNthCalledWith(3, 'flares');
    });
  });
});
