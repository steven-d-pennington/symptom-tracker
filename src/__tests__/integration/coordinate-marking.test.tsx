import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoordinateMarker } from '@/components/body-map/CoordinateMarker';
import { denormalizeCoordinates, normalizeCoordinates, NormalizedCoordinates } from '@/lib/utils/coordinates';

describe('Coordinate marking integration', () => {
  const bounds = { x: 100, y: 200, width: 80, height: 60 };

  const Harness = ({
    onCoordinateMark,
  }: {
    onCoordinateMark: (regionId: string, coordinates: NormalizedCoordinates) => void;
  }) => {
    const [selection, setSelection] = useState<NormalizedCoordinates | null>(null);

    const handleClick = (event: React.MouseEvent<SVGRectElement>) => {
      const normalized = normalizeCoordinates({ x: event.clientX, y: event.clientY }, bounds);
      setSelection(normalized);
      onCoordinateMark('left-groin', normalized);
    };

    const denormalized = selection ? denormalizeCoordinates(selection, bounds) : null;

    return (
      <svg viewBox="0 0 400 800">
        <rect
          data-testid="test-region"
          id="left-groin"
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          onClick={handleClick}
        />
        {selection && denormalized && (
          <CoordinateMarker
            x={denormalized.x}
            y={denormalized.y}
            zoomLevel={1}
            visible
            regionId="left-groin"
            normalized={selection}
          />
        )}
      </svg>
    );
  };

  it('captures normalized coordinates and renders marker at denormalized position', async () => {
    const handleMark = jest.fn();
    render(<Harness onCoordinateMark={handleMark} />);

    const regionElement = screen.getByTestId('test-region');
    fireEvent.click(regionElement, { clientX: 140, clientY: 215 });

    await waitFor(() => {
      expect(handleMark).toHaveBeenCalledWith('left-groin', { x: 0.5, y: 0.25 });
    });

    const marker = await screen.findByTestId('coordinate-marker');
    expect(marker.getAttribute('transform')).toBe('translate(140, 215)');

    const outline = screen.getByTestId('coordinate-marker-outline');
    expect(parseFloat(outline.getAttribute('r') ?? '0')).toBeCloseTo(26);

    const tooltip = marker.querySelector('title');
    expect(tooltip?.textContent ?? '').toMatch(/x: 0.50, y: 0.25/);
  });
});
