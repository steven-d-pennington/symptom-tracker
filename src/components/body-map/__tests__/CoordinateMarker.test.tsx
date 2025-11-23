import React from 'react';
import { render, screen } from '@testing-library/react';
import { CoordinateMarker } from '../CoordinateMarker';

const renderMarker = (props: Partial<React.ComponentProps<typeof CoordinateMarker>> = {}) =>
  render(
    <svg>
      <CoordinateMarker
        x={150}
        y={200}
        zoomLevel={props.zoomLevel ?? 1}
        visible
        regionId="left-groin"
        normalized={{ x: 0.42, y: 0.67 }}
        {...props}
      />
    </svg>
  );

describe('CoordinateMarker', () => {
  it('renders crosshair with deterministic size at zoom level 1', () => {
    renderMarker();
    const outerCircle = screen.getByTestId('coordinate-marker-outline');
    expect(parseFloat(outerCircle.getAttribute('r') ?? '0')).toBeCloseTo(26);
  });

  it('adjusts radius inversely with zoom level to maintain constant touch size', () => {
    const { rerender } = renderMarker({ zoomLevel: 1 });
    const getRadius = () => parseFloat(screen.getByTestId('coordinate-marker-outline').getAttribute('r') ?? '0');

    expect(getRadius()).toBeCloseTo(26);

    rerender(
      <svg>
        <CoordinateMarker
          x={150}
          y={200}
          zoomLevel={2}
          visible
          regionId="left-groin"
          normalized={{ x: 0.42, y: 0.67 }}
        />
      </svg>
    );

    expect(getRadius()).toBeCloseTo(13);
  });

  it('exposes tooltip with normalized coordinates', () => {
    renderMarker({ normalized: { x: 0.5, y: 0.25 } });
    const title = screen.getByText(/x: 0.50, y: 0.25/i);
    expect(title).toBeInTheDocument();
  });
});
