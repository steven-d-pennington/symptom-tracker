import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditFoodModal } from '../EditFoodModal';
import type { FoodRecord } from '@/lib/db/schema';

describe('EditFoodModal', () => {
  const mockFood: FoodRecord = {
    id: 'food-123',
    userId: 'user-1',
    name: 'Custom Pizza',
    category: 'Snacks',
    allergenTags: JSON.stringify(['gluten', 'dairy']),
    preparationMethod: 'baked',
    isDefault: false,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Custom Food')).toBeInTheDocument();
    });

    it('should display Custom badge', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByLabelText('Custom food badge')).toBeInTheDocument();
    });

    it('should have close button', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  describe('Form Pre-filling', () => {
    it('should pre-fill name from food data', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      expect(nameInput).toHaveValue('Custom Pizza');
    });

    it('should pre-fill category from food data', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const categorySelect = screen.getByLabelText(/Category/i);
      expect(categorySelect).toHaveValue('Snacks');
    });

    it('should pre-fill preparation method from food data', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const prepMethodSelect = screen.getByLabelText(/Preparation Method/i);
      expect(prepMethodSelect).toHaveValue('baked');
    });
  });

  describe('User Interactions', () => {
    it('should update name field when user types', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Pizza');

      expect(nameInput).toHaveValue('Updated Pizza');
    });

    it('should update category when user selects', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const categorySelect = screen.getByLabelText(/Category/i);
      await user.selectOptions(categorySelect, 'Proteins');

      expect(categorySelect).toHaveValue('Proteins');
    });

    it('should update preparation method when user selects', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const prepMethodSelect = screen.getByLabelText(/Preparation Method/i);
      await user.selectOptions(prepMethodSelect, 'fried');

      expect(prepMethodSelect).toHaveValue('fried');
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);

      expect(await screen.findByText('Food name is required')).toBeInTheDocument();
    });

    it('should show error when name is too short', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'A');

      expect(await screen.findByText('Food name must be at least 2 characters')).toBeInTheDocument();
    });

    it('should show error when name is too long', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'A'.repeat(101));

      expect(await screen.findByText('Food name must be less than 100 characters')).toBeInTheDocument();
    });

    it('should disable save button when form is invalid', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when form is valid', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with updated data when submitted', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Pizza Name');

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'Updated Pizza Name',
          category: 'Snacks',
          allergenTags: ['gluten', 'dairy'],
          preparationMethod: 'baked',
        });
      });
    });

    it('should close modal after successful save', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should show saving state while submitting', async () => {
      const user = userEvent.setup();
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });
      mockOnSave.mockReturnValue(savePromise);

      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();

      resolveSave!();
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    it('should not submit when name is invalid', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should default to "Snacks" category if none selected', async () => {
      const user = userEvent.setup();
      const foodWithoutCategory = { ...mockFood, category: '' };
      
      render(
        <EditFoodModal
          food={foodWithoutCategory}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'Snacks',
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'edit-food-modal-title');
    });

    it('should mark required fields', () => {
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      expect(nameInput).toHaveAttribute('aria-required', 'true');
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      
      render(
        <EditFoodModal
          food={mockFood}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText(/Food Name/i);
      await user.clear(nameInput);

      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
    });
  });
});
