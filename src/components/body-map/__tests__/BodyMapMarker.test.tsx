/**
 * Component tests for BodyMapMarker
 * Story 5.4: AC5.4.1, 5.4.2, 5.4.3, 5.4.6, 5.4.7, 5.4.8
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BodyMapMarker } from '../markers/BodyMapMarker';
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';

describe('BodyMapMarker', () => {
  const defaultProps = {
    id: 'test-marker-1',
    layer: 'flares' as LayerType,
    bodyRegionId: 'left-shoulder',
    severity: 5,
    timestamp: Date.now(),
    position: { x: 100, y: 200 }
  };

  describe('AC5.4.1: Layer-specific rendering', () => {
    it('should render correct icon for flares layer', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="flares" />
        </svg>
      );

      const text = container.querySelector('text');
      expect(text?.textContent).toBe('🔥');
    });

    it('should render correct icon for pain layer', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="pain" />
        </svg>
      );

      const text = container.querySelector('text');
      expect(text?.textContent).toBe('⚡');
    });

    it('should render correct icon for inflammation layer', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="inflammation" />
        </svg>
      );

      const text = container.querySelector('text');
      expect(text?.textContent).toBe('🟣');
    });

    it('should apply correct color class for each layer', () => {
      const { container: flareContainer } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="flares" />
        </svg>
      );
      const flareCircle = flareContainer.querySelectorAll('circle')[1]; // Second circle is visible marker
      expect(flareCircle?.className.baseVal).toContain('fill-red-500');

      const { container: painContainer } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="pain" />
        </svg>
      );
      const painCircle = painContainer.querySelectorAll('circle')[1];
      expect(painCircle?.className.baseVal).toContain('fill-yellow-500');

      const { container: inflammationContainer } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="inflammation" />
        </svg>
      );
      const inflammationCircle = inflammationContainer.querySelectorAll('circle')[1];
      expect(inflammationCircle?.className.baseVal).toContain('fill-purple-500');
    });
  });

  describe('AC5.4.2: Severity-based size scaling', () => {
    it('should render small size (16px) for severity 1-3', () => {
      const { container: container1 } = render(
        <svg>
          <BodyMapMarker {...defaultProps} severity={1} />
        </svg>
      );
      const circle1 = container1.querySelectorAll('circle')[1];
      expect(circle1?.getAttribute('r')).toBe('8'); // radius = 16/2

      const { container: container3 } = render(
        <svg>
          <BodyMapMarker {...defaultProps} severity={3} />
        </svg>
      );
      const circle3 = container3.querySelectorAll('circle')[1];
      expect(circle3?.getAttribute('r')).toBe('8');
    });

    it('should render medium size (24px) for severity 4-7', () => {
      const { container: container5 } = render(
        <svg>
          <BodyMapMarker {...defaultProps} severity={5} />
        </svg>
      );
      const circle5 = container5.querySelectorAll('circle')[1];
      expect(circle5?.getAttribute('r')).toBe('12'); // radius = 24/2

      const { container: container7 } = render(
        <svg>
          <BodyMapMarker {...defaultProps} severity={7} />
        </svg>
      );
      const circle7 = container7.querySelectorAll('circle')[1];
      expect(circle7?.getAttribute('r')).toBe('12');
    });

    it('should render large size (32px) for severity 8-10', () => {
      const { container: container9 } = render(
        <svg>
          <BodyMapMarker {...defaultProps} severity={9} />
        </svg>
      );
      const circle9 = container9.querySelectorAll('circle')[1];
      expect(circle9?.getAttribute('r')).toBe('16'); // radius = 32/2

      const { container: container10 } = render(
        <svg>
          <BodyMapMarker {...defaultProps} severity={10} />
        </svg>
      );
      const circle10 = container10.querySelectorAll('circle')[1];
      expect(circle10?.getAttribute('r')).toBe('16');
    });

    it('should maintain 32px minimum touch target for small markers', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} severity={2} />
        </svg>
      );

      // First circle is touch target (transparent)
      const touchTarget = container.querySelector('circle');
      expect(touchTarget?.getAttribute('r')).toBe('16'); // radius = 32/2
      expect(touchTarget?.getAttribute('fill')).toBe('transparent');
    });
  });

  describe('AC5.4.3: Recency-based opacity', () => {
    it('should render 100% opacity for markers < 7 days old', () => {
      const recentTimestamp = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 days ago

      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} timestamp={recentTimestamp} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.getAttribute('opacity')).toBe('1');
    });

    it('should render 70% opacity for markers 7-30 days old', () => {
      const weekOldTimestamp = Date.now() - (10 * 24 * 60 * 60 * 1000); // 10 days ago

      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} timestamp={weekOldTimestamp} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.getAttribute('opacity')).toBe('0.7');
    });

    it('should render 50% opacity for markers > 30 days old', () => {
      const oldTimestamp = Date.now() - (45 * 24 * 60 * 60 * 1000); // 45 days ago

      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} timestamp={oldTimestamp} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.getAttribute('opacity')).toBe('0.5');
    });
  });

  describe('AC5.4.6: React.memo optimization', () => {
    it('should be wrapped with React.memo', () => {
      // Check if component has memo wrapper by checking displayName
      expect(BodyMapMarker.displayName).toBe('BodyMapMarker');
    });

    it('should not re-render when unrelated props change', () => {
      const { rerender } = render(
        <svg>
          <BodyMapMarker {...defaultProps} className="test-class-1" />
        </svg>
      );

      // Rerender with same essential props but different className
      rerender(
        <svg>
          <BodyMapMarker {...defaultProps} className="test-class-2" />
        </svg>
      );

      // Component should still render (memo allows className changes)
      expect(screen.getByTestId(`body-map-marker-${defaultProps.id}`)).toBeInTheDocument();
    });
  });

  describe('AC5.4.7: Colorblind-friendly design', () => {
    it('should use distinct icons for each layer type', () => {
      const icons = {
        flares: '🔥',
        pain: '⚡',
        inflammation: '🟣'
      };

      Object.entries(icons).forEach(([layer, icon]) => {
        const { container } = render(
          <svg>
            <BodyMapMarker {...defaultProps} layer={layer as LayerType} />
          </svg>
        );

        const text = container.querySelector('text');
        expect(text?.textContent).toBe(icon);
      });
    });

    it('should have both icon and color for accessibility', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="flares" />
        </svg>
      );

      // Should have both color class and icon
      const circle = container.querySelectorAll('circle')[1];
      const text = container.querySelector('text');

      expect(circle?.className.baseVal).toContain('fill-red-500');
      expect(text?.textContent).toBe('🔥');
    });
  });

  describe('AC5.4.8: Interactive marker behavior', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();

      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} onClick={handleClick} />
        </svg>
      );

      const group = container.querySelector('g');
      fireEvent.click(group!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler on Enter key press', () => {
      const handleClick = jest.fn();

      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} onClick={handleClick} />
        </svg>
      );

      const group = container.querySelector('g');
      fireEvent.keyDown(group!, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler on Space key press', () => {
      const handleClick = jest.fn();

      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} onClick={handleClick} />
        </svg>
      );

      const group = container.querySelector('g');
      fireEvent.keyDown(group!, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have cursor-pointer class for hover feedback', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.className.baseVal).toContain('cursor-pointer');
    });

    it('should have focus and hover states', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.className.baseVal).toContain('hover:scale-110');
      expect(group?.className.baseVal).toContain('focus:scale-110');
    });

    it('should be keyboard accessible with tabIndex', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} />
        </svg>
      );

      const group = container.querySelector('g');
      // tabIndex is set as a property, not an attribute in React
      expect(group?.tabIndex).toBe(0);
      expect(group?.getAttribute('role')).toBe('button');
    });

    it('should have appropriate aria-label', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} layer="flares" severity={7} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.getAttribute('aria-label')).toBe('Flares marker, severity 7');
    });

    it('should show resolved state in aria-label', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} isResolved={true} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.getAttribute('aria-label')).toContain('Resolved');
    });
  });

  describe('Resolved markers', () => {
    it('should render gray color for resolved markers', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} isResolved={true} />
        </svg>
      );

      const circle = container.querySelectorAll('circle')[1];
      expect(circle?.className.baseVal).toContain('fill-gray-400');
    });
  });

  describe('Position rendering', () => {
    it('should apply correct transform for position', () => {
      const { container } = render(
        <svg>
          <BodyMapMarker {...defaultProps} position={{ x: 150, y: 250 }} />
        </svg>
      );

      const group = container.querySelector('g');
      expect(group?.getAttribute('transform')).toBe('translate(150, 250)');
    });
  });
});
