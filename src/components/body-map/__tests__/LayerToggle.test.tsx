/**
 * Component tests for LayerToggle
 * Story 5.5: Multi-layer view controls
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { LayerToggle } from '../LayerToggle';
import { LayerType } from '@/lib/db/schema';

describe('LayerToggle', () => {
  const mockCounts = { flares: 3, pain: 5, inflammation: 0 };

  const defaultProps = {
    visibleLayers: ['flares'] as LayerType[],
    onToggleLayer: jest.fn(),
    markerCounts: mockCounts,
    viewMode: 'single' as const,
    onViewModeChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC5.5.1: Layer checkboxes with counts', () => {
    it('should render marker counts for each layer', () => {
      const { container } = render(<LayerToggle {...defaultProps} viewMode="all" visibleLayers={['flares', 'pain']} />);

      // Check counts are displayed (using getAllByText to handle duplicates with keyboard shortcuts)
      const text = container.textContent;
      expect(text).toContain('Flares');
      expect(text).toContain('(3)'); // Flares count
      expect(text).toContain('Pain');
      expect(text).toContain('(5)'); // Pain count
      expect(text).toContain('Inflammation');
      expect(text).toContain('(0)'); // Inflammation count
    });

    it('should render layer icons and labels', () => {
      render(<LayerToggle {...defaultProps} viewMode="all" />);

      expect(screen.getByText('🔥')).toBeInTheDocument(); // Flares icon
      expect(screen.getByText('⚡')).toBeInTheDocument(); // Pain icon
      expect(screen.getByText('🟣')).toBeInTheDocument(); // Inflammation icon

      expect(screen.getByText('Flares')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();
      expect(screen.getByText('Inflammation')).toBeInTheDocument();
    });
  });

  describe('AC5.5.2: View mode selector', () => {
    it('should render view mode radio buttons', () => {
      render(<LayerToggle {...defaultProps} />);

      const singleLayerRadio = screen.getByRole('radio', { name: /single layer/i });
      const allLayersRadio = screen.getByRole('radio', { name: /all layers/i });

      expect(singleLayerRadio).toBeInTheDocument();
      expect(allLayersRadio).toBeInTheDocument();
    });

    it('should show correct view mode selected', () => {
      const { rerender } = render(<LayerToggle {...defaultProps} viewMode="single" />);

      const singleLayerRadio = screen.getByRole('radio', { name: /single layer/i }) as HTMLInputElement;
      expect(singleLayerRadio.checked).toBe(true);

      rerender(<LayerToggle {...defaultProps} viewMode="all" />);

      const allLayersRadio = screen.getByRole('radio', { name: /all layers/i }) as HTMLInputElement;
      expect(allLayersRadio.checked).toBe(true);
    });

    it('should call onViewModeChange when view mode changed', () => {
      const handleChange = jest.fn();
      render(<LayerToggle {...defaultProps} onViewModeChange={handleChange} viewMode="single" />);

      const allLayersRadio = screen.getByRole('radio', { name: /all layers/i });
      fireEvent.click(allLayersRadio);

      expect(handleChange).toHaveBeenCalledWith('all');
    });
  });

  describe('AC5.5.3: Individual layer visibility toggles', () => {
    it('should show layer checkboxes only in all mode', () => {
      const { rerender } = render(<LayerToggle {...defaultProps} viewMode="single" />);

      // In single mode, checkboxes hidden
      expect(screen.queryByText('Visible Layers')).not.toBeInTheDocument();

      // In all mode, checkboxes shown
      rerender(<LayerToggle {...defaultProps} viewMode="all" />);
      expect(screen.getByText('Visible Layers')).toBeInTheDocument();
    });

    it('should reflect correct checked state for visible layers', () => {
      render(
        <LayerToggle
          {...defaultProps}
          viewMode="all"
          visibleLayers={['flares', 'pain']}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // Flares
      expect(checkboxes[1]).toBeChecked(); // Pain
      expect(checkboxes[2]).not.toBeChecked(); // Inflammation
    });

    it('should call onToggleLayer when checkbox clicked', () => {
      const handleToggle = jest.fn();
      render(
        <LayerToggle
          {...defaultProps}
          onToggleLayer={handleToggle}
          viewMode="all"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Click pain checkbox

      expect(handleToggle).toHaveBeenCalledWith('pain');
    });
  });

  describe('AC5.5.7: Keyboard shortcuts', () => {
    it('should toggle layers with number keys 1-3', () => {
      const handleToggle = jest.fn();
      render(
        <LayerToggle
          {...defaultProps}
          onToggleLayer={handleToggle}
          viewMode="all"
        />
      );

      // Simulate pressing '1' for flares
      fireEvent.keyDown(window, { key: '1' });
      expect(handleToggle).toHaveBeenCalledWith('flares');

      // Simulate pressing '2' for pain
      fireEvent.keyDown(window, { key: '2' });
      expect(handleToggle).toHaveBeenCalledWith('pain');

      // Simulate pressing '3' for inflammation
      fireEvent.keyDown(window, { key: '3' });
      expect(handleToggle).toHaveBeenCalledWith('inflammation');
    });

    it('should toggle view mode with A key', () => {
      const handleModeChange = jest.fn();
      render(
        <LayerToggle
          {...defaultProps}
          onViewModeChange={handleModeChange}
          viewMode="single"
        />
      );

      // Simulate pressing 'A'
      fireEvent.keyDown(window, { key: 'A' });
      expect(handleModeChange).toHaveBeenCalledWith('all');

      // Test lowercase 'a' as well
      fireEvent.keyDown(window, { key: 'a' });
      expect(handleModeChange).toHaveBeenCalledWith('all');
    });

    it('should not trigger shortcuts when typing in input field', () => {
      const handleToggle = jest.fn();
      const { container } = render(
        <div>
          <input type="text" />
          <LayerToggle
            {...defaultProps}
            onToggleLayer={handleToggle}
            viewMode="all"
          />
        </div>
      );

      const input = container.querySelector('input')!;
      input.focus();

      // Simulate pressing '1' while focused on input
      fireEvent.keyDown(input, { key: '1' });

      // Should not call toggle handler
      expect(handleToggle).not.toHaveBeenCalled();
    });

    it('should show keyboard shortcut hints', () => {
      render(<LayerToggle {...defaultProps} viewMode="all" />);

      expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      expect(screen.getByText(/1-3/i)).toBeInTheDocument();
      expect(screen.getByText(/toggle layers/i)).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('should disable all controls when disabled prop is true', () => {
      render(<LayerToggle {...defaultProps} disabled={true} viewMode="all" />);

      const radios = screen.getAllByRole('radio');
      const checkboxes = screen.getAllByRole('checkbox');

      radios.forEach(radio => expect(radio).toBeDisabled());
      checkboxes.forEach(checkbox => expect(checkbox).toBeDisabled());
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<LayerToggle {...defaultProps} viewMode="all" />);

      // Radio buttons should have proper role
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);

      // Checkboxes should have proper role
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(3);
    });

    it('should be keyboard navigable', () => {
      render(<LayerToggle {...defaultProps} viewMode="all" />);

      const firstRadio = screen.getByRole('radio', { name: /single layer/i });
      firstRadio.focus();
      expect(document.activeElement).toBe(firstRadio);
    });
  });

  describe('Visual feedback', () => {
    it('should show keyboard shortcut numbers next to layers', () => {
      const { container } = render(<LayerToggle {...defaultProps} viewMode="all" />);

      // Check for shortcut hints (1), (2), (3) in the layer list
      const layerShortcuts = container.querySelectorAll('.space-y-2 .text-xs.text-gray-400');
      expect(layerShortcuts.length).toBe(3);
      expect(layerShortcuts[0].textContent).toContain('(1)');
      expect(layerShortcuts[1].textContent).toContain('(2)');
      expect(layerShortcuts[2].textContent).toContain('(3)');
    });
  });
});
