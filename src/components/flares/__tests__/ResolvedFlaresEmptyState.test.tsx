import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResolvedFlaresEmptyState } from '../ResolvedFlaresEmptyState';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ResolvedFlaresEmptyState', () => {
  const mockOnClearFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // AC2.8.6: Test true empty state (no resolved flares exist)
  describe('when hasFilters is false (true empty state)', () => {
    it('displays "No resolved flares yet" message', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      expect(screen.getByText('No resolved flares yet')).toBeInTheDocument();
    });

    it('displays explanatory text about resolving flares', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      expect(
        screen.getByText(/Flares marked as resolved will appear here/)
      ).toBeInTheDocument();
    });

    it('displays link to Active Flares page', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      const link = screen.getByRole('link', { name: /View Active Flares/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/flares');
    });

    it('does not display Clear Filters button', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      expect(
        screen.queryByRole('button', { name: /Clear/i })
      ).not.toBeInTheDocument();
    });

    it('displays Archive icon', () => {
      const { container } = render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      // lucide-react icons render as SVG elements
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // AC2.8.6: Test filtered empty state (no results match filters)
  describe('when hasFilters is true (filtered empty state)', () => {
    it('displays "No results found" message', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('displays message suggesting to adjust or clear filters', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      expect(
        screen.getByText(/No resolved flares match your current filters/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Try adjusting or clearing filters/)
      ).toBeInTheDocument();
    });

    it('displays Clear Filters button', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      const button = screen.getByRole('button', { name: /Clear all filters/i });
      expect(button).toBeInTheDocument();
    });

    it('calls onClearFilters when Clear Filters button is clicked', async () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      const button = screen.getByRole('button', { name: /Clear all filters/i });
      await userEvent.click(button);

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    it('does not display link to Active Flares page', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      expect(
        screen.queryByRole('link', { name: /View Active Flares/i })
      ).not.toBeInTheDocument();
    });

    it('displays Archive icon', () => {
      const { container } = render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      // lucide-react icons render as SVG elements
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // AC2.8.6: Test semantic structure and styling
  describe('semantic structure and styling', () => {
    it('uses semantic heading elements', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('No resolved flares yet');
    });

    it('applies correct background and padding styles', () => {
      const { container } = render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      const emptyState = container.firstChild as HTMLElement;
      expect(emptyState).toHaveClass('bg-gray-50', 'rounded-lg', 'p-8', 'text-center');
    });

    it('has accessible button with proper focus styles', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('has accessible link with proper focus styles', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  // AC2.8.6: Test helpful messaging pattern from Story 0.2
  describe('helpful messaging patterns', () => {
    it('provides actionable guidance in true empty state', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={false} onClearFilters={mockOnClearFilters} />
      );

      // Message should explain what will happen
      expect(
        screen.getByText(/Flares marked as resolved will appear here/)
      ).toBeInTheDocument();

      // Should provide next action
      expect(screen.getByRole('link', { name: /View Active Flares/i })).toBeInTheDocument();
    });

    it('provides actionable guidance in filtered empty state', () => {
      render(
        <ResolvedFlaresEmptyState hasFilters={true} onClearFilters={mockOnClearFilters} />
      );

      // Message should explain why empty
      expect(
        screen.getByText(/No resolved flares match your current filters/)
      ).toBeInTheDocument();

      // Should provide solution
      expect(screen.getByRole('button', { name: /Clear all filters/i })).toBeInTheDocument();
    });
  });
});
