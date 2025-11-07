/**
 * Component tests for LayerLegend
 * Story 5.6: Layer legend and accessibility features
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LayerLegend } from '../LayerLegend';
import { LayerType } from '@/lib/db/schema';

describe('LayerLegend', () => {
  const mockCounts = { flares: 3, pain: 5, inflammation: 0 };

  const defaultProps = {
    visibleLayers: ['flares'] as LayerType[],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window size for each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  describe('AC5.6.1: LayerLegend component displays all layer types', () => {
    it('should render legend items with icon, label, and description for visible layers', () => {
      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          markerCounts={mockCounts}
        />
      );

      // Check flares layer
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.getByText('HS flare tracking')).toBeInTheDocument();

      // Check pain layer
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();
      expect(screen.getByText('General body pain')).toBeInTheDocument();

      // Inflammation should not be visible
      expect(screen.queryByText('Inflammation')).not.toBeInTheDocument();
    });

    it('should display marker counts when provided', () => {
      const { container } = render(
        <LayerLegend
          visibleLayers={['flares', 'pain', 'inflammation']}
          markerCounts={mockCounts}
        />
      );

      const text = container.textContent || '';
      expect(text).toContain('3'); // Flares count
      expect(text).toContain('5'); // Pain count
      expect(text).toContain('0'); // Inflammation count
    });

    it('should use LAYER_CONFIG as single source of truth', () => {
      render(<LayerLegend visibleLayers={['flares']} />);

      // Verify we're using the correct config values
      expect(screen.getByText('🔥')).toBeInTheDocument(); // icon
      expect(screen.getByText('Flares')).toBeInTheDocument(); // label
      expect(screen.getByText('HS flare tracking')).toBeInTheDocument(); // description
    });
  });

  describe('AC5.6.2: Dynamic legend updates with visible layers', () => {
    it('should show only currently visible layers', () => {
      const { rerender } = render(
        <LayerLegend visibleLayers={['flares']} />
      );

      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.queryByText('Pain')).not.toBeInTheDocument();

      // Update visible layers
      rerender(<LayerLegend visibleLayers={['flares', 'pain']} />);

      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();
    });

    it('should update when visibleLayers prop changes', () => {
      const { rerender } = render(
        <LayerLegend visibleLayers={['flares', 'pain']} />
      );

      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();

      // Remove pain layer
      rerender(<LayerLegend visibleLayers={['flares']} />);

      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.queryByText('Pain')).not.toBeInTheDocument();
    });

    it('should handle empty visibleLayers array', () => {
      const { container } = render(<LayerLegend visibleLayers={[]} />);

      // Legend header should still be present
      expect(screen.getByText('Legend')).toBeInTheDocument();

      // No layer items should be rendered
      const listItems = container.querySelectorAll('ul > li');
      expect(listItems).toHaveLength(0);
    });
  });

  describe('AC5.6.3: Responsive mobile design', () => {
    it('should be expanded by default on desktop', () => {
      // Desktop width
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });

      render(<LayerLegend visibleLayers={['flares', 'pain']} />);

      // Legend items should be visible (not collapsed)
      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();
    });

    it('should show collapse button on mobile', () => {
      // Mobile width
      Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });

      const { container } = render(<LayerLegend visibleLayers={['flares']} />);

      // Trigger resize to update state
      fireEvent(window, new Event('resize'));

      // Wait for the component to update
      waitFor(() => {
        const collapseButton = screen.queryByLabelText(/collapse legend|expand legend/i);
        expect(collapseButton).toBeInTheDocument();
      });
    });

    it('should toggle collapsed state when collapse button clicked', () => {
      // Mobile width
      Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });

      render(<LayerLegend visibleLayers={['flares', 'pain']} />);

      // Trigger resize
      fireEvent(window, new Event('resize'));

      waitFor(() => {
        const collapseButton = screen.getByLabelText(/collapse legend/i);

        // Click to collapse
        fireEvent.click(collapseButton);

        // Legend items should be hidden
        expect(screen.queryByText('Flares')).not.toBeInTheDocument();

        // Click to expand
        const expandButton = screen.getByLabelText(/expand legend/i);
        fireEvent.click(expandButton);

        // Legend items should be visible again
        expect(screen.getByText('Flares')).toBeInTheDocument();
      });
    });

    it('should have proper aria-expanded attribute', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });

      render(<LayerLegend visibleLayers={['flares']} />);
      fireEvent(window, new Event('resize'));

      waitFor(() => {
        const collapseButton = screen.getByLabelText(/collapse legend/i);
        expect(collapseButton).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(collapseButton);

        const expandButton = screen.getByLabelText(/expand legend/i);
        expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('AC5.6.4: Interactive legend items', () => {
    it('should call onToggleLayer when interactive item clicked', () => {
      const handleToggle = jest.fn();

      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          onToggleLayer={handleToggle}
          interactive={true}
        />
      );

      // Find and click the Pain layer item
      const painItem = screen.getByText('Pain').closest('li');
      expect(painItem).toBeInTheDocument();

      if (painItem) {
        fireEvent.click(painItem);
        expect(handleToggle).toHaveBeenCalledWith('pain');
      }
    });

    it('should not call onToggleLayer when interactive is false', () => {
      const handleToggle = jest.fn();

      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          onToggleLayer={handleToggle}
          interactive={false}
        />
      );

      const painItem = screen.getByText('Pain').closest('li');
      if (painItem) {
        fireEvent.click(painItem);
        expect(handleToggle).not.toHaveBeenCalled();
      }
    });

    it('should not call onToggleLayer when onToggleLayer prop is undefined', () => {
      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          interactive={true}
        />
      );

      const painItem = screen.getByText('Pain').closest('li');
      if (painItem) {
        // Should not throw error
        expect(() => fireEvent.click(painItem)).not.toThrow();
      }
    });

    it('should have button role when interactive', () => {
      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          onToggleLayer={jest.fn()}
          interactive={true}
        />
      );

      const items = screen.getAllByRole('button');
      // At least the help button and interactive layer items
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it('should not have button role when not interactive', () => {
      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          interactive={false}
        />
      );

      const layerItems = screen.getByText('Flares').closest('li');
      expect(layerItems).not.toHaveAttribute('role', 'button');
    });
  });

  describe('AC5.6.5: WCAG AA color contrast compliance', () => {
    it('should use proper color classes from LAYER_CONFIG', () => {
      const { container } = render(
        <LayerLegend visibleLayers={['flares', 'pain', 'inflammation']} />
      );

      // Check that color classes are applied
      expect(container.textContent).toContain('Flares');
      expect(container.textContent).toContain('Pain');
      expect(container.textContent).toContain('Inflammation');

      // Color classes are applied via LAYER_CONFIG
      const flaresLabel = screen.getByText('Flares');
      expect(flaresLabel).toHaveClass('text-red-500');

      const painLabel = screen.getByText('Pain');
      expect(painLabel).toHaveClass('text-yellow-500');

      const inflammationLabel = screen.getByText('Inflammation');
      expect(inflammationLabel).toHaveClass('text-purple-500');
    });

    it('should supplement colors with icons for colorblind accessibility', () => {
      render(
        <LayerLegend visibleLayers={['flares', 'pain', 'inflammation']} />
      );

      // Each layer should have a distinct icon
      expect(screen.getByText('🔥')).toBeInTheDocument(); // Flares
      expect(screen.getByText('⚡')).toBeInTheDocument(); // Pain
      expect(screen.getByText('🟣')).toBeInTheDocument(); // Inflammation
    });
  });

  describe('AC5.6.6: Screen reader support', () => {
    it('should have proper ARIA region role', () => {
      render(<LayerLegend visibleLayers={['flares']} />);

      const legend = screen.getByRole('region');
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveAttribute('aria-label', 'Layer legend');
    });

    it('should use list semantics for legend items', () => {
      const { container } = render(
        <LayerLegend visibleLayers={['flares', 'pain']} />
      );

      const list = container.querySelector('ul[role="list"]');
      expect(list).toBeInTheDocument();

      const listItems = container.querySelectorAll('ul[role="list"] > li');
      expect(listItems.length).toBe(2);
    });

    it('should have descriptive aria-labels for each legend item', () => {
      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          markerCounts={mockCounts}
        />
      );

      // Find items by their aria-label
      const flaresItem = screen.getByLabelText(/Flares: HS flare tracking, 3 markers?/i);
      expect(flaresItem).toBeInTheDocument();

      const painItem = screen.getByLabelText(/Pain: General body pain, 5 markers?/i);
      expect(painItem).toBeInTheDocument();
    });

    it('should have aria-live region for announcements', () => {
      const { container } = render(<LayerLegend visibleLayers={['flares']} />);

      const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have sr-only class on aria-live region', () => {
      const { container } = render(<LayerLegend visibleLayers={['flares']} />);

      const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toHaveClass('sr-only');
    });
  });

  describe('AC5.6.7: Keyboard navigation', () => {
    it('should be keyboard focusable when interactive', () => {
      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          onToggleLayer={jest.fn()}
          interactive={true}
        />
      );

      const painItem = screen.getByText('Pain').closest('li');
      expect(painItem).toHaveAttribute('tabIndex', '0');
    });

    it('should not be keyboard focusable when not interactive', () => {
      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          interactive={false}
        />
      );

      const painItem = screen.getByText('Pain').closest('li');
      expect(painItem).not.toHaveAttribute('tabIndex');
    });

    it('should toggle layer on Enter key press', () => {
      const handleToggle = jest.fn();

      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          onToggleLayer={handleToggle}
          interactive={true}
        />
      );

      const painItem = screen.getByText('Pain').closest('li');
      if (painItem) {
        painItem.focus();
        fireEvent.keyDown(painItem, { key: 'Enter' });
        expect(handleToggle).toHaveBeenCalledWith('pain');
      }
    });

    it('should toggle layer on Space key press', () => {
      const handleToggle = jest.fn();

      render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          onToggleLayer={handleToggle}
          interactive={true}
        />
      );

      const painItem = screen.getByText('Pain').closest('li');
      if (painItem) {
        painItem.focus();
        fireEvent.keyDown(painItem, { key: ' ' });
        expect(handleToggle).toHaveBeenCalledWith('pain');
      }
    });

    it('should have visible focus indicators', () => {
      const { container } = render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          onToggleLayer={jest.fn()}
          interactive={true}
        />
      );

      const painItem = screen.getByText('Pain').closest('li');
      // Check for focus ring classes
      expect(painItem).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('AC5.6.8: Help tooltip with layer system explanation', () => {
    it('should render help button', () => {
      render(<LayerLegend visibleLayers={['flares']} />);

      const helpButton = screen.getByLabelText('Show layer system help');
      expect(helpButton).toBeInTheDocument();
    });

    it('should show help tooltip when help button clicked', async () => {
      render(<LayerLegend visibleLayers={['flares']} />);

      const helpButton = screen.getByLabelText('Show layer system help');
      fireEvent.click(helpButton);

      // Radix tooltip content (may render multiple times for accessibility)
      await waitFor(() => {
        const tooltipTexts = screen.getAllByText(/Layers separate different tracking types/i);
        expect(tooltipTexts.length).toBeGreaterThan(0);
      });
    });

    it('should dismiss tooltip on Escape key', async () => {
      render(<LayerLegend visibleLayers={['flares']} />);

      const helpButton = screen.getByLabelText('Show layer system help');
      fireEvent.click(helpButton);

      await waitFor(() => {
        const tooltipTexts = screen.queryAllByText(/Layers separate different tracking types/i);
        expect(tooltipTexts.length).toBeGreaterThan(0);
      });

      fireEvent.keyDown(helpButton, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText(/Layers separate different tracking types/i)).not.toBeInTheDocument();
      });
    });

    it('should have proper explanation text', async () => {
      render(<LayerLegend visibleLayers={['flares']} />);

      const helpButton = screen.getByLabelText('Show layer system help');
      fireEvent.click(helpButton);

      await waitFor(() => {
        const expectedText = "Layers separate different tracking types. Switch layers to log different conditions, or view all layers to see comprehensive patterns.";
        const tooltipTexts = screen.getAllByText(expectedText);
        expect(tooltipTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('AC5.6.9: Future integration point for medical exports', () => {
    it('should have data attribute for export integration', () => {
      const { container } = render(<LayerLegend visibleLayers={['flares']} />);

      const legend = container.querySelector('[data-legend-export="true"]');
      expect(legend).toBeInTheDocument();
    });

    it('should have stable structure for screenshot inclusion', () => {
      const { container } = render(
        <LayerLegend
          visibleLayers={['flares', 'pain']}
          markerCounts={mockCounts}
        />
      );

      // Verify expected structure exists
      expect(container.querySelector('[data-legend-export="true"]')).toBeInTheDocument();
      expect(container.querySelector('ul[role="list"]')).toBeInTheDocument();
      expect(container.querySelectorAll('li').length).toBe(2);
    });
  });

  describe('Integration tests', () => {
    it('should work with all props provided', () => {
      const handleToggle = jest.fn();

      render(
        <LayerLegend
          visibleLayers={['flares', 'pain', 'inflammation']}
          onToggleLayer={handleToggle}
          markerCounts={mockCounts}
          interactive={true}
          className="custom-class"
        />
      );

      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();
      expect(screen.getByText('Inflammation')).toBeInTheDocument();

      // Test interaction
      const flaresItem = screen.getByText('Flares').closest('li');
      if (flaresItem) {
        fireEvent.click(flaresItem);
        expect(handleToggle).toHaveBeenCalledWith('flares');
      }
    });

    it('should work with minimal props', () => {
      render(<LayerLegend visibleLayers={['flares']} />);

      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText('Flares')).toBeInTheDocument();
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <LayerLegend visibleLayers={['flares']} markerCounts={{ flares: 3, pain: 0, inflammation: 0 }} />
      );

      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(
        <LayerLegend visibleLayers={['flares']} markerCounts={{ flares: 5, pain: 0, inflammation: 0 }} />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
