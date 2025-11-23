/**
 * Tests for FoodSearchInput Component (Story 3.5.4)
 * AC3.5.4.4: Quick search/filter functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoodSearchInput } from '../FoodSearchInput';

// Increase timeout for debounce tests
jest.setTimeout(10000);

describe('FoodSearchInput', () => {
  const mockOnSearchChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('AC3.5.4.4 - Search input rendering', () => {
    it('renders search input with placeholder', () => {
      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      expect(screen.getByPlaceholderText('Search foods...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <FoodSearchInput
          onSearchChange={mockOnSearchChange}
          placeholder="Find your food..."
        />
      );

      expect(screen.getByPlaceholderText('Find your food...')).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(
        <FoodSearchInput onSearchChange={mockOnSearchChange} />
      );

      // Search icon should be visible
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByLabelText('Search foods');
      expect(input).toBeInTheDocument();
    });
  });

  describe('AC3.5.4.4 - Search functionality', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheese');

      expect(input).toHaveValue('cheese');
    });

    it('is case-insensitive (accepts lowercase input)', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheddar');

      expect(input).toHaveValue('cheddar');
    });

    it('is case-insensitive (accepts uppercase input)', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'CHEDDAR');

      expect(input).toHaveValue('CHEDDAR');
    });
  });

  describe('AC3.5.4.4 - Debounced search (300ms)', () => {
    it('does not call onSearchChange immediately on input', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'c');

      // Should not be called immediately
      expect(mockOnSearchChange).not.toHaveBeenCalled();
    });

    it('calls onSearchChange after 300ms delay', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheese');

      // Fast-forward time by 300ms
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('cheese');
      });
    });

    it('debounces multiple rapid inputs', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');

      // Type multiple characters rapidly
      await user.type(input, 'c');
      jest.advanceTimersByTime(100);

      await user.type(input, 'h');
      jest.advanceTimersByTime(100);

      await user.type(input, 'e');
      jest.advanceTimersByTime(100);

      // Should only call once after final 300ms delay
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
        expect(mockOnSearchChange).toHaveBeenCalledWith('che');
      });
    });

    it('resets debounce timer on new input', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');

      await user.type(input, 'c');
      jest.advanceTimersByTime(200); // Not enough to trigger

      await user.type(input, 'h'); // Resets timer
      jest.advanceTimersByTime(200); // Still not enough

      expect(mockOnSearchChange).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100); // Now 300ms from last input

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('ch');
      });
    });
  });

  describe('AC3.5.4.4 - Clear button functionality', () => {
    it('does not show clear button when input is empty', () => {
      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('shows clear button when input has value', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheese');

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheese');

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });

    it('calls onSearchChange with empty string when cleared', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheese');

      // Wait for debounce
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('cheese');
      });

      mockOnSearchChange.mockClear();

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // Wait for debounce after clear
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('');
      });
    });

    it('hides clear button after clearing', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheese');

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      const { container } = render(
        <FoodSearchInput onSearchChange={mockOnSearchChange} />
      );

      const input = container.querySelector('input');
      expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });

    it('clear button has proper aria-label', async () => {
      const user = userEvent.setup({ delay: null });

      render(<FoodSearchInput onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search foods...');
      await user.type(input, 'cheese');

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton.tagName).toBe('BUTTON');
    });
  });
});
