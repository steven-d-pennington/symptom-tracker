/**
 * Tests for MarkerPreview component
 * Story 3.7.2 - Marker Preview and Positioning
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkerPreview } from '../MarkerPreview';
import { NormalizedCoordinates } from '@/lib/utils/coordinates';

describe('MarkerPreview', () => {
  const mockCoordinates: NormalizedCoordinates = { x: 0.5, y: 0.5 };
  const mockViewBox: [number, number, number, number] = [0, 0, 400, 800];
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('[P1] AC 3.7.2.1: Display preview marker', () => {
    it('should render preview marker at correct coordinates', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      // Calculate expected coordinates
      // viewBox: [0, 0, 400, 800], normalized: [0.5, 0.5]
      // x = 0 + 0.5 * 400 = 200
      // y = 0 + 0.5 * 800 = 400

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker).toBeInTheDocument();
      expect(marker).toHaveAttribute('cx', '200');
      expect(marker).toHaveAttribute('cy', '400');
    });

    it('should convert normalized coordinates to viewBox coordinates correctly', () => {
      const customViewBox: [number, number, number, number] = [100, 200, 300, 600];
      const customCoordinates: NormalizedCoordinates = { x: 0.25, y: 0.75 };

      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={customCoordinates}
            viewBox={customViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      // Expected x = 100 + 0.25 * 300 = 175
      // Expected y = 200 + 0.75 * 600 = 650

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker).toHaveAttribute('cx', '175');
      expect(marker).toHaveAttribute('cy', '650');
    });

    it('should return null when isActive is false', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={false}
          />
        </svg>
      );

      const marker = container.querySelector('.marker-preview');
      expect(marker).not.toBeInTheDocument();
    });

    it('should return null when coordinates is null', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={null}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const marker = container.querySelector('.marker-preview');
      expect(marker).not.toBeInTheDocument();
    });
  });

  describe('[P1] AC 3.7.2.5: Visual distinctiveness', () => {
    it('should render preview marker with translucent styling', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker).toHaveAttribute('fill', '#3b82f6');
      expect(marker).toHaveAttribute('fill-opacity', '0.5');
      expect(marker).toHaveAttribute('stroke', '#2563eb');
    });

    it('should have pulse animation class', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker?.className.baseVal).toContain('animate-pulse');
    });

    it('should render center dot for precision', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const centerDot = container.querySelector('.marker-preview circle[r="0.5"]');
      expect(centerDot).toBeInTheDocument();
      expect(centerDot).toHaveAttribute('cx', '200');
      expect(centerDot).toHaveAttribute('cy', '400');
      expect(centerDot).toHaveAttribute('fill', '#1e40af');
    });
  });

  describe('[P1] Confirm button functionality', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm marker position/i });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation when confirm button is clicked', () => {
      const mockParentClick = jest.fn();

      const { container } = render(
        <svg onClick={mockParentClick}>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm marker position/i });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockParentClick).not.toHaveBeenCalled();
    });

    it('should position confirm button to the right of marker', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      // Confirm button group should be translated to x+6, y
      // Note: The g element doesn't have role="button", the rect inside does
      const allGroups = container.querySelectorAll('.marker-preview > g');
      // First g is confirm button (x+6), second is cancel button (x-6)
      const confirmGroup = allGroups[0];
      expect(confirmGroup).toHaveAttribute('transform', 'translate(206, 400)');
    });
  });

  describe('[P1] Cancel button functionality', () => {
    it('should call onCancel when cancel button is clicked', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel marker placement/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation when cancel button is clicked', () => {
      const mockParentClick = jest.fn();

      const { container } = render(
        <svg onClick={mockParentClick}>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel marker placement/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockParentClick).not.toHaveBeenCalled();
    });

    it('should position cancel button to the left of marker', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      // Cancel button group should be translated to x-6, y
      // Note: The g element doesn't have role="button", the rect inside does
      const allGroups = container.querySelectorAll('.marker-preview > g');
      // First g is confirm button (x+6), second is cancel button (x-6)
      const cancelGroup = allGroups[1];
      expect(cancelGroup).toHaveAttribute('transform', 'translate(194, 400)');
    });
  });

  describe('[P1] Keyboard accessibility', () => {
    it('should call onConfirm when Enter key is pressed on confirm button', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm marker position/i });
      fireEvent.keyDown(confirmButton, { key: 'Enter' });

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when Space key is pressed on confirm button', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm marker position/i });
      fireEvent.keyDown(confirmButton, { key: ' ' });

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Enter key is pressed on cancel button', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel marker placement/i });
      fireEvent.keyDown(cancelButton, { key: 'Enter' });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Space key is pressed on cancel button', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel marker placement/i });
      fireEvent.keyDown(cancelButton, { key: ' ' });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Escape key is pressed on cancel button', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel marker placement/i });
      fireEvent.keyDown(cancelButton, { key: 'Escape' });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should have tabIndex=0 for keyboard navigation', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm marker position/i });
      const cancelButton = screen.getByRole('button', { name: /cancel marker placement/i });

      expect(confirmButton).toHaveAttribute('tabindex', '0');
      expect(cancelButton).toHaveAttribute('tabindex', '0');
    });
  });

  describe('[P1] ARIA labels and accessibility', () => {
    it('should have appropriate ARIA labels on preview marker', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker).toHaveAttribute('aria-label', 'Preview marker position');
    });

    it('should have appropriate ARIA labels on buttons', () => {
      render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm marker position/i });
      const cancelButton = screen.getByRole('button', { name: /cancel marker placement/i });

      expect(confirmButton).toHaveAttribute('aria-label', 'Confirm marker position');
      expect(cancelButton).toHaveAttribute('aria-label', 'Cancel marker placement');
    });

    it('should have role="button" on interactive elements', () => {
      render(
        <svg>
          <MarkerPreview
            coordinates={mockCoordinates}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('[P2] Edge cases', () => {
    it('should handle coordinates at (0, 0)', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={{ x: 0, y: 0 }}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker).toHaveAttribute('cx', '0');
      expect(marker).toHaveAttribute('cy', '0');
    });

    it('should handle coordinates at (1, 1)', () => {
      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={{ x: 1, y: 1 }}
            viewBox={mockViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker).toHaveAttribute('cx', '400');
      expect(marker).toHaveAttribute('cy', '800');
    });

    it('should handle negative viewBox origin', () => {
      const negativeViewBox: [number, number, number, number] = [-100, -200, 400, 800];

      const { container } = render(
        <svg>
          <MarkerPreview
            coordinates={{ x: 0.5, y: 0.5 }}
            viewBox={negativeViewBox}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
            isActive={true}
          />
        </svg>
      );

      // Expected x = -100 + 0.5 * 400 = 100
      // Expected y = -200 + 0.5 * 800 = 200

      const marker = container.querySelector('.marker-preview circle[r="3"]');
      expect(marker).toHaveAttribute('cx', '100');
      expect(marker).toHaveAttribute('cy', '200');
    });
  });
});
