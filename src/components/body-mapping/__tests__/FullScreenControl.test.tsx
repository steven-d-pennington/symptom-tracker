/**
 * Tests for FullScreenControl component
 * Story 3.7.4 - Full-Screen Mode
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FullScreenControl } from '../FullScreenControl';

describe('FullScreenControl', () => {
  describe('AC 3.7.4.1: Full-screen toggle button available', () => {
    it('should render toggle button with maximize icon when not fullscreen', () => {
      const mockToggle = jest.fn();
      render(<FullScreenControl isFullscreen={false} onToggle={mockToggle} />);

      const button = screen.getByRole('button', { name: /enter full screen/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Full Screen')).toBeInTheDocument();
    });

    it('should render toggle button with minimize icon when fullscreen', () => {
      const mockToggle = jest.fn();
      render(<FullScreenControl isFullscreen={true} onToggle={mockToggle} />);

      const button = screen.getByRole('button', { name: /exit full screen/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Exit')).toBeInTheDocument();
    });

    it('should call onToggle when clicked', () => {
      const mockToggle = jest.fn();
      render(<FullScreenControl isFullscreen={false} onToggle={mockToggle} />);

      const button = screen.getByRole('button', { name: /enter full screen/i });
      fireEvent.click(button);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should have appropriate ARIA labels', () => {
      const mockToggle = jest.fn();
      const { rerender } = render(
        <FullScreenControl isFullscreen={false} onToggle={mockToggle} />
      );

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Enter full screen');
      expect(button).toHaveAttribute('title', 'Enter Full Screen');

      rerender(<FullScreenControl isFullscreen={true} onToggle={mockToggle} />);

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Exit full screen');
      expect(button).toHaveAttribute('title', 'Exit Full Screen');
    });
  });

  describe('AC 3.7.4.4: Touch target requirements', () => {
    it('should meet 44x44px touch target minimum', () => {
      const mockToggle = jest.fn();
      render(<FullScreenControl isFullscreen={false} onToggle={mockToggle} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);

      // Check that min-w-[44px] and min-h-[44px] classes are applied
      expect(button.className).toContain('min-w-[44px]');
      expect(button.className).toContain('min-h-[44px]');
    });
  });

  describe('Visual styling', () => {
    it('should apply custom className', () => {
      const mockToggle = jest.fn();
      render(
        <FullScreenControl
          isFullscreen={false}
          onToggle={mockToggle}
          className="custom-class"
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should have hover and transition styles', () => {
      const mockToggle = jest.fn();
      render(<FullScreenControl isFullscreen={false} onToggle={mockToggle} />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:bg-white');
      expect(button.className).toContain('transition-colors');
    });
  });

  describe('Responsive behavior', () => {
    it('should hide text label on small screens', () => {
      const mockToggle = jest.fn();
      render(<FullScreenControl isFullscreen={false} onToggle={mockToggle} />);

      const label = screen.getByText('Full Screen');
      expect(label.className).toContain('hidden');
      expect(label.className).toContain('sm:inline');
    });
  });
});
