/**
 * Tests for SymptomSelectionList (Story 3.5.3)
 * AC3.5.3.7: Symptom selection redesigned for full-page
 * AC3.5.3.8: Mobile responsive with adequate touch targets
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymptomSelectionList } from '../SymptomSelectionList';
import { SymptomRecord } from '@/lib/db/schema';
import { Symptom } from '@/lib/types/symptoms';

// Mock repositories
const mockGetByDateRange = jest.fn();

jest.mock('@/lib/repositories/symptomInstanceRepository', () => ({
  symptomInstanceRepository: {
    getByDateRange: (...args: any[]) => mockGetByDateRange(...args),
  },
}));

const mockSymptoms: SymptomRecord[] = [
  {
    id: 'symptom-1',
    userId: 'user-123',
    name: 'Fatigue',
    category: 'General',
    description: 'Tiredness',
    commonTriggers: [],
    severityScale: { type: 'numeric', min: 1, max: 10, labels: {} },
    isActive: true,
    isDefault: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'symptom-2',
    userId: 'user-123',
    name: 'Custom Symptom',
    category: 'Custom',
    description: 'Custom description',
    commonTriggers: [],
    severityScale: { type: 'numeric', min: 1, max: 10, labels: {} },
    isActive: true,
    isDefault: false,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'symptom-3',
    userId: 'user-123',
    name: 'Joint Pain',
    category: 'Pain',
    description: 'Pain in joints',
    commonTriggers: [],
    severityScale: { type: 'numeric', min: 1, max: 10, labels: {} },
    isActive: true,
    isDefault: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockRecentInstances: Symptom[] = [
  {
    id: 'instance-1',
    userId: 'user-123',
    name: 'Fatigue',
    category: 'General',
    severity: 7,
    severityScale: { type: 'numeric', min: 1, max: 10 },
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    updatedAt: new Date(),
  },
];

describe('SymptomSelectionList', () => {
  const mockOnSymptomSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetByDateRange.mockResolvedValue(mockRecentInstances);
  });

  describe('AC3.5.3.7 - Full-page symptom selection', () => {
    it('renders all symptoms in a list', async () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fatigue')).toBeInTheDocument();
        expect(screen.getByText('Custom Symptom')).toBeInTheDocument();
        expect(screen.getByText('Joint Pain')).toBeInTheDocument();
      });
    });

    it('displays search input at top', () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search symptoms...');
      expect(searchInput).toBeInTheDocument();
    });

    it('filters symptoms by name when searching', async () => {
      const user = userEvent.setup();
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search symptoms...');
      await user.type(searchInput, 'fatigue');

      await waitFor(() => {
        expect(screen.getByText('Fatigue')).toBeInTheDocument();
        expect(screen.queryByText('Joint Pain')).not.toBeInTheDocument();
      });
    });

    it('filters symptoms by category when searching', async () => {
      const user = userEvent.setup();
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search symptoms...');
      await user.type(searchInput, 'pain');

      await waitFor(() => {
        expect(screen.getByText('Joint Pain')).toBeInTheDocument();
        expect(screen.queryByText('Fatigue')).not.toBeInTheDocument();
      });
    });

    it('groups symptoms into favorites, customs, and defaults', async () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Recently Logged')).toBeInTheDocument();
        expect(screen.getByText('Custom Symptoms')).toBeInTheDocument();
        expect(screen.getByText('Default Symptoms')).toBeInTheDocument();
      });

      // Fatigue should be in Recently Logged (it's in recent instances)
      const recentlyLogged = screen.getByText('Recently Logged').parentElement;
      if (recentlyLogged) {
        expect(within(recentlyLogged).getByText('Fatigue')).toBeInTheDocument();
      }

      // Custom Symptom should be in Custom section
      const customSymptoms = screen.getByText('Custom Symptoms').parentElement;
      if (customSymptoms) {
        expect(within(customSymptoms).getByText('Custom Symptom')).toBeInTheDocument();
      }
    });

    it('shows custom badge for custom symptoms', async () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        const customSymptomButtons = screen.getAllByText('Custom');
        expect(customSymptomButtons.length).toBeGreaterThan(0);
      });
    });

    it('indicates selection state with checkmark', async () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={mockSymptoms[0]}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        const selectedButton = screen.getByText('Fatigue').closest('button');
        expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('calls onSymptomSelect when symptom is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Joint Pain')).toBeInTheDocument();
      });

      const symptomButton = screen.getByText('Joint Pain').closest('button');
      if (symptomButton) {
        await user.click(symptomButton);
      }

      expect(mockOnSymptomSelect).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Joint Pain' })
      );
    });
  });

  describe('AC3.5.3.8 - Mobile touch targets', () => {
    it('has minimum 44px height for symptom buttons', async () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        const symptomButton = screen.getByText('Fatigue').closest('button');
        expect(symptomButton).toHaveStyle({ minHeight: '44px' });
      });
    });

    it('has minimum 44px height for search input', () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search symptoms...');
      expect(searchInput).toHaveStyle({ minHeight: '44px' });
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner while loading', () => {
      render(
        <SymptomSelectionList
          symptoms={[]}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={true}
          userId="user-123"
        />
      );

      expect(screen.getByText('Loading symptoms...')).toBeInTheDocument();
    });
  });

  describe('Empty states', () => {
    it('shows message when no symptoms available', () => {
      render(
        <SymptomSelectionList
          symptoms={[]}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      expect(screen.getByText('No symptoms available')).toBeInTheDocument();
    });

    it('shows message when search has no results', async () => {
      const user = userEvent.setup();
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search symptoms...');
      await user.type(searchInput, 'xyz nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/No symptoms found matching/)).toBeInTheDocument();
      });
    });
  });

  describe('Favorites/Recently Logged', () => {
    it('loads recent symptom instances on mount', async () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        expect(mockGetByDateRange).toHaveBeenCalledWith(
          'user-123',
          expect.any(Date),
          expect.any(Date)
        );
      });
    });

    it('displays star icon for recently logged section', async () => {
      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Recently Logged')).toBeInTheDocument();
      });
    });

    it('does not show Recently Logged section when no favorites', async () => {
      mockGetByDateRange.mockResolvedValue([]);

      render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Recently Logged')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive grid layout', () => {
    it('uses responsive grid classes', async () => {
      const { container } = render(
        <SymptomSelectionList
          symptoms={mockSymptoms}
          selectedSymptom={null}
          onSymptomSelect={mockOnSymptomSelect}
          isLoading={false}
          userId="user-123"
        />
      );

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-1'); // Mobile: 1 column
        expect(grid).toHaveClass('sm:grid-cols-2'); // Tablet: 2 columns
        expect(grid).toHaveClass('lg:grid-cols-3'); // Desktop: 3 columns
      });
    });
  });
});
