/**
 * Tests for FullScreenControlBar component
 * Story 3.7.4 - Full-Screen Mode
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FullScreenControlBar } from '../FullScreenControlBar';

describe('FullScreenControlBar', () => {
  describe('AC 3.7.4.3: Thin control bar at top', () => {
    it('should render control bar with fixed positioning', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
        />
      );

      const toolbar = screen.getByRole('toolbar', { name: /fullscreen controls/i });
      expect(toolbar).toBeInTheDocument();
      expect(toolbar.className).toContain('fixed');
      expect(toolbar.className).toContain('top-0');
    });

    it('should have 40-50px height (h-12 = 48px)', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar.className).toContain('h-12');
    });

    it('should have high contrast background', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar.className).toContain('bg-gray-900');
      expect(toolbar.className).toContain('text-white');
    });

    it('should be positioned above content (z-50)', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar.className).toContain('z-50');
    });
  });

  describe('AC 3.7.4.4: Essential controls included', () => {
    it('should always show Exit Full Screen button', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
        />
      );

      const exitButton = screen.getByRole('button', { name: /exit full screen/i });
      expect(exitButton).toBeInTheDocument();
      expect(screen.getByText('Exit Full Screen')).toBeInTheDocument();
    });

    it('should show Back button when showBackButton is true', () => {
      const mockExit = jest.fn();
      const mockBack = jest.fn();

      render(
        <FullScreenControlBar
          onExit={mockExit}
          onBack={mockBack}
          showBackButton={true}
          showHistoryToggle={false}
        />
      );

      const backButton = screen.getByRole('button', { name: /back to body map/i });
      expect(backButton).toBeInTheDocument();
      expect(screen.getByText('Back to Body Map')).toBeInTheDocument();
    });

    it('should NOT show Back button when showBackButton is false', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
        />
      );

      const backButton = screen.queryByRole('button', { name: /back to body map/i });
      expect(backButton).not.toBeInTheDocument();
    });

    it('should show History toggle when showHistoryToggle is true', () => {
      const mockExit = jest.fn();
      const mockToggle = jest.fn();

      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={true}
          historyVisible={false}
          onHistoryToggle={mockToggle}
        />
      );

      const historyButton = screen.getByRole('button', { name: /show history/i });
      expect(historyButton).toBeInTheDocument();
    });

    it('should update History toggle state based on historyVisible', () => {
      const mockExit = jest.fn();
      const mockToggle = jest.fn();

      const { rerender } = render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={true}
          historyVisible={false}
          onHistoryToggle={mockToggle}
        />
      );

      let historyButton = screen.getByRole('button', { name: /show history/i });
      expect(historyButton).toHaveAttribute('aria-pressed', 'false');

      rerender(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={true}
          historyVisible={true}
          onHistoryToggle={mockToggle}
        />
      );

      historyButton = screen.getByRole('button', { name: /hide history/i });
      expect(historyButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should call callbacks when buttons are clicked', () => {
      const mockExit = jest.fn();
      const mockBack = jest.fn();
      const mockToggle = jest.fn();

      render(
        <FullScreenControlBar
          onExit={mockExit}
          onBack={mockBack}
          showBackButton={true}
          showHistoryToggle={true}
          historyVisible={false}
          onHistoryToggle={mockToggle}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /back to body map/i }));
      expect(mockBack).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /show history/i }));
      expect(mockToggle).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /exit full screen/i }));
      expect(mockExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC 3.7.4.4: Touch target requirements', () => {
    it('should ensure all controls meet 44x44px minimum', () => {
      const mockExit = jest.fn();
      const mockBack = jest.fn();
      const mockToggle = jest.fn();

      render(
        <FullScreenControlBar
          onExit={mockExit}
          onBack={mockBack}
          showBackButton={true}
          showHistoryToggle={true}
          historyVisible={false}
          onHistoryToggle={mockToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toContain('min-w-[44px]');
        expect(button.className).toContain('min-h-[44px]');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on all buttons', () => {
      const mockExit = jest.fn();
      const mockBack = jest.fn();
      const mockToggle = jest.fn();

      render(
        <FullScreenControlBar
          onExit={mockExit}
          onBack={mockBack}
          showBackButton={true}
          showHistoryToggle={true}
          historyVisible={false}
          onHistoryToggle={mockToggle}
        />
      );

      expect(screen.getByRole('button', { name: /back to body map/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /show history/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /exit full screen/i })).toHaveAttribute('aria-label');
    });

    it('should have toolbar role with label', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Fullscreen controls');
    });
  });

  describe('Visual styling', () => {
    it('should apply custom className', () => {
      const mockExit = jest.fn();
      render(
        <FullScreenControlBar
          onExit={mockExit}
          showBackButton={false}
          showHistoryToggle={false}
          className="custom-class"
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar.className).toContain('custom-class');
    });
  });
});
