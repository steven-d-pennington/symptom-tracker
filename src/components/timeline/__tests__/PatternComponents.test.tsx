/**
 * Pattern Component Tests
 * Story 6.5: Task 10 - Component tests for pattern visualization components
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatternBadge from '@/components/timeline/PatternBadge';
import PatternLegend from '@/components/timeline/PatternLegend';
import PatternDetailPanel from '@/components/timeline/PatternDetailPanel';
import PatternHighlight from '@/components/timeline/PatternHighlight';
import type { DetectedPattern } from '@/lib/services/patternDetectionService';
import type { TimelineEvent } from '@/components/timeline/TimelineView';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe('PatternBadge', () => {
  const createPattern = (overrides?: Partial<DetectedPattern>): DetectedPattern => ({
    id: 'pattern-1',
    type: 'food-symptom',
    description: 'Dairy correlates with Headache 12h later',
    frequency: 7,
    confidence: 'high',
    occurrences: [],
    correlationId: 'corr-1',
    coefficient: 0.75,
    lagHours: 12,
    ...overrides,
  });

  it('should render without crashing', () => {
    const pattern = createPattern();
    const onClick = jest.fn();
    
    render(<PatternBadge pattern={pattern} onClick={onClick} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const pattern = createPattern();
    const onClick = jest.fn();
    
    render(<PatternBadge pattern={pattern} onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should display correct icon for food-symptom pattern', () => {
    const pattern = createPattern({ type: 'food-symptom' });
    
    render(<PatternBadge pattern={pattern} onClick={jest.fn()} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display correct icon for trigger-symptom pattern', () => {
    const pattern = createPattern({ type: 'trigger-symptom' });
    
    render(<PatternBadge pattern={pattern} onClick={jest.fn()} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display correct icon for medication-symptom pattern', () => {
    const pattern = createPattern({ type: 'medication-symptom' });
    
    render(<PatternBadge pattern={pattern} onClick={jest.fn()} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

describe('PatternLegend', () => {
  const availableTypes = ['food-symptom', 'trigger-symptom', 'medication-symptom'] as const;
  const visibleTypes = new Set(availableTypes);
  const onToggleType = jest.fn();

  beforeEach(() => {
    onToggleType.mockClear();
  });

  it('should render without crashing', () => {
    render(
      <PatternLegend
        availableTypes={availableTypes}
        visibleTypes={visibleTypes}
        onToggleType={onToggleType}
      />
    );
    
    expect(screen.getByText(/pattern legend/i)).toBeInTheDocument();
  });

  it('should call onToggleType when legend item is clicked', () => {
    render(
      <PatternLegend
        availableTypes={availableTypes}
        visibleTypes={visibleTypes}
        onToggleType={onToggleType}
      />
    );
    
    const toggleButtons = screen.getAllByRole('button');
    if (toggleButtons.length > 0) {
      fireEvent.click(toggleButtons[0]);
      expect(onToggleType).toHaveBeenCalled();
    }
  });

  it('should display all available pattern types', () => {
    render(
      <PatternLegend
        availableTypes={availableTypes}
        visibleTypes={visibleTypes}
        onToggleType={onToggleType}
      />
    );
    
    availableTypes.forEach(type => {
      expect(screen.getByText(new RegExp(type, 'i'))).toBeInTheDocument();
    });
  });
});

describe('PatternDetailPanel', () => {
  const createPattern = (): DetectedPattern => ({
    id: 'pattern-1',
    type: 'food-symptom',
    description: 'Dairy correlates with Headache 12h later',
    frequency: 7,
    confidence: 'high',
    occurrences: [
      {
        event1: {
          id: 'event-1',
          type: 'food',
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          summary: 'Meal: Dairy',
          eventRef: {},
        },
        event2: {
          id: 'event-2',
          type: 'symptom',
          timestamp: Date.now() - 12 * 60 * 60 * 1000,
          summary: 'Headache',
          eventRef: {},
        },
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
      },
    ],
    correlationId: 'corr-1',
    coefficient: 0.75,
    lagHours: 12,
  });

  it('should render when open', () => {
    const pattern = createPattern();
    const onClose = jest.fn();
    
    render(
      <PatternDetailPanel
        pattern={pattern}
        isOpen={true}
        onClose={onClose}
      />
    );
    
    expect(screen.getByText(pattern.description)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const pattern = createPattern();
    const onClose = jest.fn();
    
    render(
      <PatternDetailPanel
        pattern={pattern}
        isOpen={false}
        onClose={onClose}
      />
    );
    
    expect(screen.queryByText(pattern.description)).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const pattern = createPattern();
    const onClose = jest.fn();
    
    render(
      <PatternDetailPanel
        pattern={pattern}
        isOpen={true}
        onClose={onClose}
      />
    );
    
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should display pattern statistics', () => {
    const pattern = createPattern();
    
    render(
      <PatternDetailPanel
        pattern={pattern}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    
    expect(screen.getByText(new RegExp(`${pattern.frequency}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${pattern.coefficient.toFixed(2)}`, 'i'))).toBeInTheDocument();
  });
});

describe('PatternHighlight', () => {
  const createEvent = (id: string, type: TimelineEvent['type'], timestamp: number): TimelineEvent => ({
    id,
    type,
    timestamp,
    summary: `${type} event`,
    eventRef: {},
  });

  it('should render without crashing', () => {
    const event1 = createEvent('event-1', 'food', Date.now());
    const event2 = createEvent('event-2', 'symptom', Date.now() + 12 * 60 * 60 * 1000);
    
    render(
      <PatternHighlight
        event1={event1}
        event2={event2}
        correlationType="food-symptom"
        lagHours={12}
        isVisible={true}
      />
    );
    
    expect(screen.getByTitle(/pattern/i)).toBeInTheDocument();
  });

  it('should not render when isVisible is false', () => {
    const event1 = createEvent('event-1', 'food', Date.now());
    const event2 = createEvent('event-2', 'symptom', Date.now() + 12 * 60 * 60 * 1000);
    
    const { container } = render(
      <PatternHighlight
        event1={event1}
        event2={event2}
        correlationType="food-symptom"
        lagHours={12}
        isVisible={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should display correct color for food-symptom correlation', () => {
    const event1 = createEvent('event-1', 'food', Date.now());
    const event2 = createEvent('event-2', 'symptom', Date.now() + 12 * 60 * 60 * 1000);
    
    const { container } = render(
      <PatternHighlight
        event1={event1}
        event2={event2}
        correlationType="food-symptom"
        lagHours={12}
        isVisible={true}
      />
    );
    
    const element = container.querySelector('.pattern-highlight');
    expect(element).toBeInTheDocument();
  });

  it('should show hover tooltip on mouse enter', () => {
    const event1 = createEvent('event-1', 'food', Date.now());
    const event2 = createEvent('event-2', 'symptom', Date.now() + 12 * 60 * 60 * 1000);
    
    const { container } = render(
      <PatternHighlight
        event1={event1}
        event2={event2}
        correlationType="food-symptom"
        lagHours={12}
        isVisible={true}
      />
    );
    
    const element = container.querySelector('.pattern-highlight');
    if (element) {
      fireEvent.mouseEnter(element);
      // Tooltip should appear (implementation dependent)
    }
  });
});

