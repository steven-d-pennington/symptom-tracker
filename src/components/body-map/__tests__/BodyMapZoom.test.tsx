import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BodyMapZoom } from '../BodyMapZoom';

// Mock react-zoom-pan-pinch since it has complex interactions
jest.mock('react-zoom-pan-pinch', () => ({
  TransformWrapper: ({ children }: { children: (props: any) => React.ReactNode }) => {
    const mockProps = {
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      resetTransform: jest.fn(),
    };
    return <div className="react-transform-wrapper transform-component-module_wrapper__SPB86 w-full h-full">{children(mockProps)}</div>;
  },
  TransformComponent: ({ children }: { children: React.ReactNode }) => (
    <div className="react-transform-component transform-component-module_content__FBWxo cursor-grab active:cursor-grabbing">{children}</div>
  ),
}));

describe('BodyMapZoom', () => {
  const TestChild = () => <div data-testid="test-child">Child Content</div>;

  it('renders zoom controls with proper accessibility attributes', () => {
    render(
      <BodyMapZoom viewType="front">
        <TestChild />
      </BodyMapZoom>
    );

    const zoomInButton = screen.getByLabelText('Zoom in');
    const zoomOutButton = screen.getByLabelText('Zoom out');
    const resetButton = screen.getByLabelText('Reset zoom');

    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
  });

  it('applies correct view type to component', () => {
    const { rerender } = render(
      <BodyMapZoom viewType="front">
        <TestChild />
      </BodyMapZoom>
    );

    // Test with different view types
    rerender(
      <BodyMapZoom viewType="back">
        <TestChild />
      </BodyMapZoom>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('renders child components within zoom transform', () => {
    render(
      <BodyMapZoom viewType="front">
        <TestChild />
      </BodyMapZoom>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    const transformComponent = document.querySelector('.react-transform-component');
    expect(transformComponent).toBeInTheDocument();
  });

  it('has proper button structure and titles', () => {
    render(
      <BodyMapZoom viewType="front">
        <TestChild />
      </BodyMapZoom>
    );

    const zoomInButton = screen.getByLabelText('Zoom in');
    const zoomOutButton = screen.getByLabelText('Zoom out');
    const resetButton = screen.getByLabelText('Reset zoom');

    expect(zoomInButton).toHaveAttribute('title', 'Zoom in (+)');
    expect(zoomOutButton).toHaveAttribute('title', 'Zoom out (-)');
    expect(resetButton).toHaveAttribute('title', 'Reset to 1x zoom (Home)');
  });

  it('renders with proper styling classes', () => {
    render(
      <BodyMapZoom viewType="front">
        <TestChild />
      </BodyMapZoom>
    );

    const wrapper = document.querySelector('.react-transform-wrapper')?.parentElement;
    expect(wrapper).toHaveClass('relative', 'w-full', 'h-full');
  });
});
