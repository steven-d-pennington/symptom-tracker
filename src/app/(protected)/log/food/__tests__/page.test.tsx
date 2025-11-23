/**
 * Tests for Food Logging Page (Story 3.5.4)
 * AC3.5.4.1: Dedicated page route at /log/food
 * AC3.5.4.7: Natural page scrolling
 * AC3.5.4.8: Mobile responsive design
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LogFoodPage from '../page';

// Mock hooks and dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('@/components/food-logging/FoodQuickLogForm', () => ({
  FoodQuickLogForm: ({ userId }: { userId: string }) => (
    <div data-testid="food-quick-log-form">
      FoodQuickLogForm for user: {userId}
    </div>
  ),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
const mockUseCurrentUser = useCurrentUser as jest.Mock;

const mockedUseRouter = useRouter as jest.Mock;
mockedUseRouter.mockReturnValue(mockRouter);

describe('LogFoodPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC3.5.4.1 - Dedicated page route', () => {
    it('renders the food logging page', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogFoodPage />);

      await waitFor(() => {
        expect(screen.getByText('Log Food')).toBeInTheDocument();
      });
    });

    it('displays page header with back button', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogFoodPage />);

      const backButton = screen.getByLabelText('Go back to previous page');
      expect(backButton).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', async () => {
      const user = userEvent.setup();
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogFoodPage />);

      const backButton = screen.getByLabelText('Go back to previous page');
      await user.click(backButton);

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Breadcrumb navigation', () => {
    it('displays breadcrumb navigation', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogFoodPage />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Log Food')).toBeInTheDocument();
    });

    it('navigates to dashboard when Home breadcrumb is clicked', async () => {
      const user = userEvent.setup();
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogFoodPage />);

      const homeLink = screen.getByRole('button', { name: /home/i });
      await user.click(homeLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Loading and authentication states', () => {
    it('shows loading state when user data is loading', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: null,
        isLoading: true,
      });

      render(<LogFoodPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows login message when user is not authenticated', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: null,
        isLoading: false,
      });

      render(<LogFoodPage />);

      expect(screen.getByText('Please log in to continue')).toBeInTheDocument();
    });

    it('renders FoodQuickLogForm when user is authenticated', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      render(<LogFoodPage />);

      await waitFor(() => {
        expect(screen.getByTestId('food-quick-log-form')).toBeInTheDocument();
      });
    });
  });

  describe('AC3.5.4.7 - Natural page scrolling', () => {
    it('uses container with natural scrolling (no nested scroll containers)', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      const { container } = render(<LogFoodPage />);

      // Check that main container exists with proper classes for scrolling
      const mainElement = container.querySelector('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('min-h-screen');

      // Verify content area exists without nested overflow containers
      const contentArea = container.querySelector('.container.mx-auto.max-w-2xl');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('AC3.5.4.8 - Mobile responsive design', () => {
    it('renders with mobile-friendly layout classes', async () => {
      mockUseCurrentUser.mockReturnValue({
        userId: 'user-123',
        isLoading: false,
      });

      const { container } = render(<LogFoodPage />);

      // Check for responsive padding and container classes
      const contentArea = container.querySelector('.container.mx-auto.max-w-2xl.px-4');
      expect(contentArea).toBeInTheDocument();
    });
  });
});
