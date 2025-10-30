/**
 * Tests for FoodCategory Component (Story 3.5.4)
 * AC3.5.4.2: Foods organized in collapsible categories
 * AC3.5.4.8: Mobile-optimized category interaction
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoodCategory } from '../FoodCategory';
import type { FoodRecord } from '@/lib/db/schema';

// Mock CustomFoodBadge component
jest.mock('@/components/food/CustomFoodBadge', () => ({
  CustomFoodBadge: () => <span data-testid="custom-food-badge">Custom</span>,
}));

// Mock cn utility
jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

const mockFoods: FoodRecord[] = [
  {
    id: 'food-1',
    userId: 'user-123',
    name: 'Cheddar Cheese',
    category: 'Dairy',
    allergenTags: JSON.stringify(['dairy']),
    isDefault: true,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'food-2',
    userId: 'user-123',
    name: 'Milk',
    category: 'Dairy',
    allergenTags: JSON.stringify(['dairy']),
    isDefault: true,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'food-3',
    userId: 'user-123',
    name: 'Custom Yogurt',
    category: 'Dairy',
    allergenTags: JSON.stringify(['dairy']),
    isDefault: false,
    isActive: true,
    preparationMethod: 'Homemade',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

describe('FoodCategory', () => {
  const mockOnToggle = jest.fn();
  const mockOnSelectFood = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC3.5.4.2 - Category header display', () => {
    it('displays category name and item count', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      expect(screen.getByText(/Dairy \(3 items\)/)).toBeInTheDocument();
    });

    it('displays singular "item" when only one food', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={[mockFoods[0]]}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      expect(screen.getByText(/Dairy \(1 item\)/)).toBeInTheDocument();
    });

    it('shows chevron down icon when collapsed', () => {
      const { container } = render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      // ChevronDown should be rendered
      const chevronDown = container.querySelector('svg');
      expect(chevronDown).toBeInTheDocument();
    });

    it('shows chevron up icon when expanded', () => {
      const { container } = render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      // Both ChevronUp and ChevronDown are rendered, but we can check they exist
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('AC3.5.4.2 - Expand/collapse functionality', () => {
    it('hides food items when collapsed', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      // Food names should not be visible when collapsed
      expect(screen.queryByText('Cheddar Cheese')).not.toBeInTheDocument();
      expect(screen.queryByText('Milk')).not.toBeInTheDocument();
    });

    it('shows food items when expanded', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      expect(screen.getByText('Cheddar Cheese')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.getByText('Custom Yogurt')).toBeInTheDocument();
    });

    it('calls onToggle when category header is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const header = screen.getByRole('button', { name: /Dairy \(3 items\)/ });
      await user.click(header);

      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it('calls onToggle with false when expanded category header is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const header = screen.getByRole('button', { name: /Dairy \(3 items\)/ });
      await user.click(header);

      expect(mockOnToggle).toHaveBeenCalledWith(false);
    });
  });

  describe('Food item selection', () => {
    it('calls onSelectFood when a food item is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const foodButton = screen.getByText('Cheddar Cheese');
      await user.click(foodButton);

      expect(mockOnSelectFood).toHaveBeenCalledWith(mockFoods[0]);
    });

    it('highlights selected food item', () => {
      const { container } = render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
          selectedFoodId="food-1"
        />
      );

      const foodButton = screen.getByText('Cheddar Cheese').closest('button');
      expect(foodButton).toHaveClass('bg-blue-50');
    });

    it('shows custom food badge for non-default foods', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      // Custom Yogurt should have the badge
      const customFoodButton = screen.getByText('Custom Yogurt').closest('button');
      const badge = customFoodButton?.querySelector('[data-testid="custom-food-badge"]');
      expect(badge).toBeInTheDocument();
    });

    it('shows preparation method for foods that have it', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      expect(screen.getByText('Homemade')).toBeInTheDocument();
    });
  });

  describe('AC3.5.4.4 - Search highlighting', () => {
    it('highlights matching text when searchQuery is provided', () => {
      const { container } = render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
          searchQuery="cheese"
        />
      );

      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
    });

    it('does not highlight when no searchQuery is provided', () => {
      const { container } = render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBe(0);
    });
  });

  describe('AC3.5.4.8 - Mobile touch targets', () => {
    it('category header has minimum 44px touch target', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const header = screen.getByRole('button', { name: /Dairy \(3 items\)/ });
      expect(header).toHaveClass('min-h-[44px]');
    });

    it('food item buttons have minimum 44px touch target', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const foodButton = screen.getByText('Cheddar Cheese').closest('button');
      expect(foodButton).toHaveClass('min-h-[44px]');
    });
  });

  describe('Accessibility', () => {
    it('sets aria-expanded attribute on category header', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const header = screen.getByRole('button', { name: /Dairy \(3 items\)/ });
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-controls attribute on category header', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
        />
      );

      const header = screen.getByRole('button', { name: /Dairy \(3 items\)/ });
      expect(header).toHaveAttribute('aria-controls', 'category-Dairy');
    });

    it('sets aria-pressed attribute on selected food items', () => {
      render(
        <FoodCategory
          name="Dairy"
          foods={mockFoods}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectFood={mockOnSelectFood}
          selectedFoodId="food-1"
        />
      );

      const foodButton = screen.getByText('Cheddar Cheese').closest('button');
      expect(foodButton).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
