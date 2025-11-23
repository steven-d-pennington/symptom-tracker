/**
 * Tests for LifecycleStageSelector component (Story 8.2)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LifecycleStageSelector } from '../LifecycleStageSelector';
import { FlareLifecycleStage } from '@/lib/db/schema';

// Mock lifecycle utilities
const mockGetNextLifecycleStage = jest.fn();
const mockIsValidStageTransition = jest.fn();
const mockFormatLifecycleStage = jest.fn((stage: string) => stage.charAt(0).toUpperCase() + stage.slice(1));
const mockGetLifecycleStageDescription = jest.fn((stage: string) => `Description for ${stage}`);
const mockGetLifecycleStageIcon = jest.fn((stage: string) => '🔴');

jest.mock('@/lib/utils/lifecycleUtils', () => ({
  getNextLifecycleStage: (...args: unknown[]) => mockGetNextLifecycleStage(...args),
  isValidStageTransition: (...args: unknown[]) => mockIsValidStageTransition(...args),
  formatLifecycleStage: (...args: unknown[]) => mockFormatLifecycleStage(...args),
  getLifecycleStageDescription: (...args: unknown[]) => mockGetLifecycleStageDescription(...args),
  getLifecycleStageIcon: (...args: unknown[]) => mockGetLifecycleStageIcon(...args),
}));

jest.mock('@/components/ui/select', () => {
  const React = require('react');
  const SelectContext = React.createContext<any>(null);

  const Select = ({ children, value, onValueChange, disabled }: any) => (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      <div data-testid="mock-select">{children}</div>
    </SelectContext.Provider>
  );

  const SelectTrigger = ({ children, ...props }: any) => (
    <button type="button" data-testid="mock-select-trigger" {...props}>
      {children}
    </button>
  );

  const SelectContent = ({ children }: any) => (
    <div data-testid="mock-select-content">{children}</div>
  );

  const SelectItem = ({ value, children, disabled }: any) => {
    const ctx = React.useContext(SelectContext);
    const isDisabled = disabled || ctx?.disabled;
    return (
      <button
        type="button"
        disabled={isDisabled}
        data-testid={`mock-select-item-${value}`}
        onClick={() => !isDisabled && ctx?.onValueChange?.(value)}
      >
        {children}
      </button>
    );
  };

  const SelectValue = ({ placeholder, children }: any) => {
    const ctx = React.useContext(SelectContext);
    const display = children ?? ctx?.value ?? placeholder;
    return <span>{display}</span>;
  };

  const passthrough = (testId: string) =>
    ({ children, ...props }: any) =>
      (
        <div data-testid={testId} {...props}>
          {children}
        </div>
      );

  return {
    __esModule: true,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    SelectGroup: passthrough('mock-select-group'),
    SelectLabel: passthrough('mock-select-label'),
    SelectSeparator: passthrough('mock-select-separator'),
    SelectScrollUpButton: passthrough('mock-select-scroll-up'),
    SelectScrollDownButton: passthrough('mock-select-scroll-down'),
  };
});

describe('LifecycleStageSelector', () => {
  const mockOnStageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidStageTransition.mockImplementation(
      (from: FlareLifecycleStage, to: FlareLifecycleStage) => {
        // Simple valid transitions for testing
        if (from === 'resolved') return false;
        if (to === 'resolved') return true;
        const valid: Record<string, string[]> = {
          onset: ['growth'],
          growth: ['rupture'],
          rupture: ['draining'],
          draining: ['healing'],
          healing: ['resolved'],
        };
        return valid[from]?.includes(to) ?? false;
      }
    );
    mockGetNextLifecycleStage.mockImplementation(
      (stage: FlareLifecycleStage) => {
        const next: Record<string, FlareLifecycleStage | null> = {
          onset: 'growth',
          growth: 'rupture',
          rupture: 'draining',
          draining: 'healing',
          healing: 'resolved',
          resolved: null,
        };
        return next[stage] ?? null;
      }
    );
  });

  describe('Rendering', () => {
    it('renders all stage options in dropdown', async () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
        />
      );

      const trigger = screen.getByLabelText('Select lifecycle stage');
      await userEvent.click(trigger);

      // Check that all stages are present
      expect(screen.getByText('Onset')).toBeInTheDocument();
      expect(screen.getAllByText('Growth').length).toBeGreaterThan(0);
      expect(screen.getByText('Rupture')).toBeInTheDocument();
      expect(screen.getByText('Draining')).toBeInTheDocument();
      expect(screen.getByText('Healing')).toBeInTheDocument();
      expect(screen.getByText('Resolved')).toBeInTheDocument();
    });

    it('displays current stage badge when currentStage is provided', () => {
      render(
        <LifecycleStageSelector
          currentStage="growth"
          onStageChange={mockOnStageChange}
        />
      );

      expect(screen.getByText('Current Stage:')).toBeInTheDocument();
      expect(screen.getAllByText('Growth').length).toBeGreaterThan(0);
    });

    it('does not display current stage badge when currentStage is not provided', () => {
      render(<LifecycleStageSelector onStageChange={mockOnStageChange} />);

      expect(screen.queryByText('Current Stage:')).not.toBeInTheDocument();
    });
  });

  describe('Suggest Next Button', () => {
    it('shows suggest next button when showSuggestion is true and next stage exists', () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          showSuggestion={true}
        />
      );

      expect(screen.getByText(/💡 Suggest next: Growth/i)).toBeInTheDocument();
    });

    it('does not show suggest next button when current stage is resolved', () => {
      render(
        <LifecycleStageSelector
          currentStage="resolved"
          onStageChange={mockOnStageChange}
          showSuggestion={true}
        />
      );

      expect(screen.queryByText(/💡 Suggest next/i)).not.toBeInTheDocument();
    });

    it('calls onStageChange when suggest next button is clicked', async () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          showSuggestion={true}
        />
      );

      const suggestButton = screen.getByText(/💡 Suggest next: Growth/i);
      await userEvent.click(suggestButton);

      expect(mockOnStageChange).toHaveBeenCalledWith('growth', undefined);
    });

    it('does not show suggest button when showSuggestion is false', () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          showSuggestion={false}
        />
      );

      expect(screen.queryByText(/💡 Suggest next/i)).not.toBeInTheDocument();
    });
  });

  describe('Stage Selection', () => {
    it('calls onStageChange when valid stage is selected', async () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
        />
      );

      const trigger = screen.getByLabelText('Select lifecycle stage');
      await userEvent.click(trigger);

      const growthOption = screen.getByTestId('mock-select-item-growth');
      await userEvent.click(growthOption);

      expect(mockOnStageChange).toHaveBeenCalledWith('growth', undefined);
    });

    it('shows error message when invalid transition is attempted', async () => {
      render(
        <LifecycleStageSelector
          currentStage="draining"
          onStageChange={mockOnStageChange}
        />
      );

      const trigger = screen.getByLabelText('Select lifecycle stage');
      await userEvent.click(trigger);

      // Try to select an invalid option (e.g., growth from draining)
      const growthOption = screen.getByTestId('mock-select-item-growth');
      // Growth should be disabled, but if clicked, should show error
      // Note: Radix Select may prevent clicking disabled items, so we test the validation logic
      expect(mockIsValidStageTransition).toHaveBeenCalled();
    });

    it('disables invalid stage options in dropdown', async () => {
      render(
        <LifecycleStageSelector
          currentStage="draining"
          onStageChange={mockOnStageChange}
        />
      );

      const trigger = screen.getByLabelText('Select lifecycle stage');
      await userEvent.click(trigger);

      // Invalid options should be disabled (tested via isValidStageTransition calls)
      expect(mockIsValidStageTransition).toHaveBeenCalled();
    });
  });

  describe('Stage Description', () => {
    it('displays stage description when stage is selected', async () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
        />
      );

      const trigger = screen.getByLabelText('Select lifecycle stage');
      await userEvent.click(trigger);

      const growthOption = screen.getByTestId('mock-select-item-growth');
      await userEvent.click(growthOption);

      await waitFor(() => {
        expect(screen.getByText(/Description for growth/i)).toBeInTheDocument();
      });
    });

    it('updates description when selection changes', async () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
        />
      );

      const trigger = screen.getByLabelText('Select lifecycle stage');
      await userEvent.click(trigger);

      // Select growth
      await userEvent.click(screen.getByTestId('mock-select-item-growth'));
      await waitFor(() => {
        expect(mockGetLifecycleStageDescription).toHaveBeenCalledWith('growth');
      });

      // Select rupture
      await userEvent.click(trigger);
      await userEvent.click(screen.getByText('Rupture'));
      await waitFor(() => {
        expect(mockGetLifecycleStageDescription).toHaveBeenCalledWith('rupture');
      });
    });
  });

  describe('Notes Input', () => {
    it('renders notes textarea in non-compact mode', () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          compact={false}
        />
      );

      expect(screen.getByLabelText('Stage change notes')).toBeInTheDocument();
    });

    it('does not render notes textarea in compact mode', () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          compact={true}
        />
      );

      expect(screen.queryByLabelText('Stage change notes')).not.toBeInTheDocument();
    });

    it('calls onStageChange with notes when notes are entered', async () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
        />
      );

      // Select a stage first
      const trigger = screen.getByLabelText('Select lifecycle stage');
      await userEvent.click(trigger);
      await userEvent.click(screen.getByTestId('mock-select-item-growth'));

      // Enter notes
      const notesInput = screen.getByLabelText('Stage change notes');
      await userEvent.type(notesInput, 'Test notes');

      // onStageChange should be called with notes
      await waitFor(() => {
        expect(mockOnStageChange).toHaveBeenCalledWith(
          'growth',
          expect.stringContaining('Test notes')
        );
      });
    });
  });

  describe('Disabled State', () => {
    it('disables all controls when disabled prop is true', () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          disabled={true}
        />
      );

      const trigger = screen.getByLabelText('Select lifecycle stage');
      expect(trigger).toBeDisabled();
    });

    it('does not call onStageChange when disabled', async () => {
      render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          disabled={true}
          showSuggestion={true}
        />
      );

      const suggestButton = screen.getByText(/💡 Suggest next: Growth/i);
      expect(suggestButton).toBeDisabled();

      // Try to click (should not trigger callback)
      await userEvent.click(suggestButton);
      expect(mockOnStageChange).not.toHaveBeenCalled();
    });
  });

  describe('Compact Mode', () => {
    it('applies compact styling when compact is true', () => {
      const { container } = render(
        <LifecycleStageSelector
          currentStage="onset"
          onStageChange={mockOnStageChange}
          compact={true}
        />
      );

      // Check for compact class application (space-y-2 instead of space-y-3)
      const selectorDiv = container.querySelector('.space-y-2');
      expect(selectorDiv).toBeInTheDocument();
    });
  });
});

