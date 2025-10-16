import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomFoodBadge } from '../CustomFoodBadge';

describe('CustomFoodBadge', () => {
  it('should render with "Custom" text', () => {
    render(<CustomFoodBadge />);
    
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should apply default styling classes', () => {
    render(<CustomFoodBadge />);
    
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('bg-sky-100');
    expect(badge).toHaveClass('text-sky-800');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
  });

  it('should apply custom className prop', () => {
    render(<CustomFoodBadge className="ml-2 mt-1" />);
    
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('ml-2');
    expect(badge).toHaveClass('mt-1');
  });

  it('should merge custom className with default classes', () => {
    render(<CustomFoodBadge className="custom-class" />);
    
    const badge = screen.getByText('Custom');
    // Should still have default classes
    expect(badge).toHaveClass('bg-sky-100');
    expect(badge).toHaveClass('text-sky-800');
    // And custom class
    expect(badge).toHaveClass('custom-class');
  });

  it('should render as a span element', () => {
    render(<CustomFoodBadge />);
    
    const badge = screen.getByText('Custom');
    expect(badge.tagName).toBe('SPAN');
  });
});
