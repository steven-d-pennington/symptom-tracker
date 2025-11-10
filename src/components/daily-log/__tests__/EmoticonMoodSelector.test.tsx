/**
 * Tests for EmoticonMoodSelector Component (Story 6.2 - Task 11)
 *
 * Tests rendering, mood selection, keyboard navigation, and accessibility.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmoticonMoodSelector } from '../EmoticonMoodSelector';

describe('EmoticonMoodSelector', () => {
  it('should render 5 mood options with emojis', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    // Should render all 5 mood radio buttons
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(5);

    // Check for specific emojis
    expect(screen.getByText('😢')).toBeInTheDocument();
    expect(screen.getByText('😟')).toBeInTheDocument();
    expect(screen.getByText('😐')).toBeInTheDocument();
    expect(screen.getByText('🙂')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('should render mood labels', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    expect(screen.getByText('Bad')).toBeInTheDocument();
    expect(screen.getByText('Poor')).toBeInTheDocument();
    expect(screen.getByText('Okay')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Great')).toBeInTheDocument();
  });

  it('should call onChange when mood is selected', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    // Click on "Good" mood (value 4)
    fireEvent.click(screen.getByLabelText('Good mood'));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should call onChange for each mood value', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Bad mood'));
    expect(onChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText('Poor mood'));
    expect(onChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByLabelText('Okay mood'));
    expect(onChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByLabelText('Good mood'));
    expect(onChange).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByLabelText('Great mood'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('should show visual highlight for selected mood', () => {
    const onChange = jest.fn();
    const { rerender } = render(<EmoticonMoodSelector value={3} onChange={onChange} />);

    const okayButton = screen.getByLabelText('Okay mood');
    expect(okayButton.className).toContain('ring-2'); // Selected state has ring

    // Change selection
    rerender(<EmoticonMoodSelector value={5} onChange={onChange} />);

    const greatButton = screen.getByLabelText('Great mood');
    expect(greatButton.className).toContain('ring-2');
  });

  it('should handle keyboard navigation with arrow keys', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    const firstButton = screen.getByLabelText('Bad mood');
    act(() => {
      firstButton.focus();
    });

    // Press ArrowRight to move focus
    fireEvent.keyDown(firstButton, { key: 'ArrowRight' });

    // Focus should move to next button
    const secondButton = screen.getByLabelText('Poor mood');
    expect(secondButton).toHaveFocus();
  });

  it('should handle ArrowLeft key navigation', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    const thirdButton = screen.getByLabelText('Okay mood');
    act(() => {
      thirdButton.focus();
    });

    // Press ArrowLeft to move focus back
    fireEvent.keyDown(thirdButton, { key: 'ArrowLeft' });

    const secondButton = screen.getByLabelText('Poor mood');
    expect(secondButton).toHaveFocus();
  });

  it('should select mood with Enter key', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    const goodButton = screen.getByLabelText('Good mood');
    act(() => {
      goodButton.focus();
    });

    fireEvent.keyDown(goodButton, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should select mood with Space key', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    const greatButton = screen.getByLabelText('Great mood');
    act(() => {
      greatButton.focus();
    });

    fireEvent.keyDown(greatButton, { key: ' ' });

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('should have ARIA labels for accessibility', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    expect(screen.getByLabelText('Bad mood')).toHaveAttribute('aria-label', 'Bad mood');
    expect(screen.getByLabelText('Poor mood')).toHaveAttribute('aria-label', 'Poor mood');
    expect(screen.getByLabelText('Okay mood')).toHaveAttribute('aria-label', 'Okay mood');
    expect(screen.getByLabelText('Good mood')).toHaveAttribute('aria-label', 'Good mood');
    expect(screen.getByLabelText('Great mood')).toHaveAttribute('aria-label', 'Great mood');
  });

  it('should have ARIA checked state for selected mood', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector value={4} onChange={onChange} />);

    const goodButton = screen.getByLabelText('Good mood');
    expect(goodButton).toHaveAttribute('aria-checked', 'true');

    const badButton = screen.getByLabelText('Bad mood');
    expect(badButton).toHaveAttribute('aria-checked', 'false');
  });

  it('should disable all buttons when disabled prop is true', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector disabled onChange={onChange} />);

    const buttons = screen.getAllByRole('radio');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should not call onChange when disabled', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector disabled onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Good mood'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const onChange = jest.fn();
    const { container } = render(
      <EmoticonMoodSelector className="custom-class" onChange={onChange} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should wrap focus from last to first option with ArrowRight', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    const lastButton = screen.getByLabelText('Great mood');
    act(() => {
      lastButton.focus();
    });

    // Press ArrowRight on last button
    fireEvent.keyDown(lastButton, { key: 'ArrowRight' });

    // Focus should wrap to first button
    const firstButton = screen.getByLabelText('Bad mood');
    expect(firstButton).toHaveFocus();
  });

  it('should wrap focus from first to last option with ArrowLeft', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    const firstButton = screen.getByLabelText('Bad mood');
    act(() => {
      firstButton.focus();
    });

    // Press ArrowLeft on first button
    fireEvent.keyDown(firstButton, { key: 'ArrowLeft' });

    // Focus should wrap to last button
    const lastButton = screen.getByLabelText('Great mood');
    expect(lastButton).toHaveFocus();
  });

  it('should update focused index when value changes', () => {
    const onChange = jest.fn();
    const { rerender } = render(<EmoticonMoodSelector value={1} onChange={onChange} />);

    // Initial value is 1 (Bad)
    const badButton = screen.getByLabelText('Bad mood');
    expect(badButton.className).toContain('ring-2');

    // Change to value 5
    rerender(<EmoticonMoodSelector value={5} onChange={onChange} />);

    const greatButton = screen.getByLabelText('Great mood');
    expect(greatButton.className).toContain('ring-2');
  });

  it('should have accessible radiogroup label for screen readers', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);

    // Check for radiogroup with ARIA label
    const radiogroup = screen.getByRole('radiogroup', { name: /How was your mood today/i });
    expect(radiogroup).toBeInTheDocument();
    expect(radiogroup).toHaveAttribute('aria-required', 'true');
  });
});
