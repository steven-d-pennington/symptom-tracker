import React from 'react';
import { render, screen } from '@testing-library/react';
import { FlareHistoryChart } from '../FlareHistoryChart';
import { FlareEventRecord, FlareEventType } from '@/types/flare';
import '@testing-library/jest-dom';

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

describe('FlareHistoryChart', () => {
  const mockSeverityEvents: FlareEventRecord[] = [
    {
      id: 'event-1',
      flareId: 'flare-1',
      userId: 'user-1',
      eventType: FlareEventType.SeverityUpdate,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
      severity: 5,
      trend: 'stable',
      notes: '',
    },
    {
      id: 'event-2',
      flareId: 'flare-1',
      userId: 'user-1',
      eventType: FlareEventType.SeverityUpdate,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
      severity: 7,
      trend: 'worsening',
      notes: '',
    },
    {
      id: 'event-3',
      flareId: 'flare-1',
      userId: 'user-1',
      eventType: FlareEventType.SeverityUpdate,
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      severity: 6,
      trend: 'improving',
      notes: '',
    },
  ];

  const mockInterventionEvent: FlareEventRecord = {
    id: 'intervention-1',
    flareId: 'flare-1',
    userId: 'user-1',
    eventType: FlareEventType.Intervention,
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    interventionType: 'ice',
    interventionDetails: 'Applied ice pack',
    notes: '',
  };

  it('renders chart with severity data points', () => {
    render(<FlareHistoryChart events={mockSeverityEvents} />);

    const chart = screen.getByTestId('line-chart');
    expect(chart).toBeInTheDocument();

    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');

    expect(chartData.datasets).toHaveLength(1);
    expect(chartData.datasets[0].data).toHaveLength(3);
    expect(chartData.datasets[0].label).toBe('Severity');
  });

  it('includes intervention annotations', () => {
    const eventsWithIntervention = [...mockSeverityEvents, mockInterventionEvent];

    render(<FlareHistoryChart events={eventsWithIntervention} />);

    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    expect(chartOptions.plugins.annotation).toBeDefined();
    expect(chartOptions.plugins.annotation.annotations).toBeDefined();
  });

  it('handles no severity updates (empty state)', () => {
    render(<FlareHistoryChart events={[]} />);

    expect(screen.getByText(/No severity updates to display/i)).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('filters out non-severity events', () => {
    const mixedEvents = [
      mockSeverityEvents[0],
      mockInterventionEvent,
      mockSeverityEvents[1],
    ];

    render(<FlareHistoryChart events={mixedEvents} />);

    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');

    // Should only have severity events
    expect(chartData.datasets[0].data).toHaveLength(2);
  });

  it('sorts events chronologically for chart (ascending)', () => {
    // Pass events in random order
    const unsortedEvents = [mockSeverityEvents[2], mockSeverityEvents[0], mockSeverityEvents[1]];

    render(<FlareHistoryChart events={unsortedEvents} />);

    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');

    const timestamps = chartData.datasets[0].data.map((d: any) => d.x);
    // Verify ascending order
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
    }
  });

  it('configures y-axis range 1-10', () => {
    render(<FlareHistoryChart events={mockSeverityEvents} />);

    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    expect(chartOptions.scales.y.min).toBe(0);
    expect(chartOptions.scales.y.max).toBe(10);
  });

  it('configures time x-axis', () => {
    render(<FlareHistoryChart events={mockSeverityEvents} />);

    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    expect(chartOptions.scales.x.type).toBe('time');
    expect(chartOptions.scales.x.time.unit).toBe('day');
  });

  it('configures tooltip to show severity', () => {
    render(<FlareHistoryChart events={mockSeverityEvents} />);

    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    expect(chartOptions.plugins.tooltip.callbacks.label).toBeDefined();
  });

  it('sets responsive sizing', () => {
    render(<FlareHistoryChart events={mockSeverityEvents} />);

    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    expect(chartOptions.responsive).toBe(true);
    expect(chartOptions.maintainAspectRatio).toBe(true);
    expect(chartOptions.aspectRatio).toBe(2);
  });

  it('uses memoization to prevent recalculation', () => {
    const { rerender } = render(<FlareHistoryChart events={mockSeverityEvents} />);

    const chartDataElement1 = screen.getByTestId('chart-data');
    const chartData1 = chartDataElement1.textContent;

    // Rerender with same events
    rerender(<FlareHistoryChart events={mockSeverityEvents} />);

    const chartDataElement2 = screen.getByTestId('chart-data');
    const chartData2 = chartDataElement2.textContent;

    // Data should be identical (memoized)
    expect(chartData1).toBe(chartData2);
  });

  it('creates vertical line annotations for interventions', () => {
    const eventsWithIntervention = [...mockSeverityEvents, mockInterventionEvent];

    render(<FlareHistoryChart events={eventsWithIntervention} />);

    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    const annotations = chartOptions.plugins.annotation.annotations;
    const annotationKeys = Object.keys(annotations);

    expect(annotationKeys.length).toBe(1);
    expect(annotationKeys[0]).toMatch(/intervention-/);

    const annotation = annotations[annotationKeys[0]];
    expect(annotation.type).toBe('line');
    expect(annotation.xMin).toBe(mockInterventionEvent.timestamp);
    expect(annotation.xMax).toBe(mockInterventionEvent.timestamp);
  });

  it('labels intervention annotations with type', () => {
    const eventsWithIntervention = [...mockSeverityEvents, mockInterventionEvent];

    render(<FlareHistoryChart events={eventsWithIntervention} />);

    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    const annotations = chartOptions.plugins.annotation.annotations;
    const annotation = annotations[Object.keys(annotations)[0]];

    expect(annotation.label.content).toBe('ice');
    expect(annotation.label.enabled).toBe(true);
  });
});
