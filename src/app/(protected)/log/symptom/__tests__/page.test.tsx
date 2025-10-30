/**
 * Tests for Symptom Logging Page (Story 3.5.3)
 * AC3.5.3.1: Dedicated page route at /log/symptom
 * AC3.5.3.4: Natural page scrolling
 * AC3.5.3.8: Mobile responsive design
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LogSymptomPage from '../page';

// Mock hooks and dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('@/components/symptom-logging/SymptomQuickLogForm', () => ({
  SymptomQuickLogForm: ({ userId }: { userId: string }) => (
    <div data-testid="symptom-quick-log-form">
      SymptomQuickLogForm for user: {userId}
    </div>
  ),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockUseCurrentUser = require('@/lib/hooks/useCurrentUser').useCurrentUser;

describe('LogSymptomPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('AC3.5.3.1 - Dedicated page route', () => {
    it('renders the symptom logging page', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogSymptomPage />);

      await waitFor(() => {
        expect(screen.getByText('Log Symptom')).toBeInTheDocument();
      });
    });

    it('displays page header with back button', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogSymptomPage />);

      const backButton = screen.getByLabelText('Go back to previous page');
      expect(backButton).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', async () => {
      const user = userEvent.setup();
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogSymptomPage />);

      const backButton = screen.getByLabelText('Go back to previous page');
      await user.click(backButton);

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('AC3.5.3.5 - Breadcrumb navigation', () => {
    it('displays breadcrumb navigation', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogSymptomPage />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Log Symptom')).toBeInTheDocument();
    });

    it('navigates to dashboard when Home breadcrumb is clicked', async () => {
      const user = userEvent.setup();
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogSymptomPage />);

      const homeButton = screen.getByText('Home');
      await user.click(homeButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Loading and authentication states', () => {
    it('shows loading state while user data is loading', () => {
      mockUseCurrentUser.mockReturnValue({
        userId: null,
        isLoading: true,
      });

      render(<LogSymptomPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows message when user is not authenticated', () => {
      mockUseCurrentUser.mockReturnValue({
        userId: null,
        isLoading: false,
      });

      render(<LogSymptomPage />);

      expect(screen.getByText('Please log in to continue')).toBeInTheDocument();
    });

    it('renders form when user is authenticated', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogSymptomPage />);

      await waitFor(() => {
        expect(screen.getByTestId('symptom-quick-log-form')).toBeInTheDocument();
      });
    });
  });

  describe('AC3.5.3.4 - Natural page scrolling', () => {
    it('uses full-page layout without modal constraints', () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      const { container } = render(<LogSymptomPage />);

      // Check that the main element has min-h-screen (full viewport)
      const main = container.querySelector('main');
      expect(main).toHaveClass('min-h-screen');

      // Verify no modal overlay classes
      expect(container.querySelector('.fixed.inset-0.z-50')).not.toBeInTheDocument();
    });
  });

  describe('AC3.5.3.8 - Mobile responsive design', () => {
    it('applies responsive classes for mobile-first design', () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      const { container } = render(<LogSymptomPage />);

      // Check container has max-width constraints for desktop
      const contentContainer = container.querySelector('.container.mx-auto.max-w-2xl');
      expect(contentContainer).toBeInTheDocument();
    });
  });
});
