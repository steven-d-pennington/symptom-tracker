import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AllergenFilter } from '../AllergenFilter';

describe('AllergenFilter', () => {
  it('renders chips and toggles selection with accessibility attributes', () => {
    const handleChange = jest.fn();
    render(<AllergenFilter selected={null} onChange={handleChange} />);

    const dairyBtn = screen.getByRole('button', { name: /apply dairy allergen filter/i });
    expect(dairyBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(dairyBtn);
    expect(handleChange).toHaveBeenCalledWith('dairy');
  });

  it('shows count when provided and clear button when selected', () => {
    const handleChange = jest.fn();
    render(<AllergenFilter selected={"dairy"} onChange={handleChange} showCount={3} />);

    expect(screen.getByText(/Filter by Allergen \(3\)/i)).toBeInTheDocument();
    const clearBtn = screen.getByRole('button', { name: /clear allergen filter/i });
    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith(null);
  });
});

