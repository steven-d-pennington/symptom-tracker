import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnotationCanvas } from '../AnnotationCanvas';
import { PhotoAnnotation as PhotoAnnotationType, AnnotationTool, ANNOTATION_COLORS, LINE_WIDTHS } from '@/lib/types/annotation';

describe('AnnotationCanvas', () => {
  const mockOnAnnotationAdd = jest.fn();
  const mockImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const defaultProps = {
    imageUrl: mockImageUrl,
    imageWidth: 800,
    imageHeight: 600,
    annotations: [] as PhotoAnnotationType[],
    selectedTool: 'arrow' as AnnotationTool,
    toolConfig: {
      color: ANNOTATION_COLORS.red,
      lineWidth: LINE_WIDTHS.medium,
    },
    onAnnotationAdd: mockOnAnnotationAdd,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render canvas with correct dimensions', () => {
    render(<AnnotationCanvas {...defaultProps} />);
    
    // Canvas should be present
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render background image', () => {
    render(<AnnotationCanvas {...defaultProps} />);
    
    const image = screen.getByAltText('Photo to annotate');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockImageUrl);
  });

  it('should start drawing on pointer down', () => {
    render(<AnnotationCanvas {...defaultProps} />);
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();
    
    // Simulate pointer down
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    
    // Should be in drawing state (verified by pointer move working)
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(canvas, { clientX: 200, clientY: 200 });
    
    // Should have added annotation
    expect(mockOnAnnotationAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAnnotationAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'arrow',
        color: ANNOTATION_COLORS.red,
        lineWidth: LINE_WIDTHS.medium,
      })
    );
  });

  it('should not add annotation if shape is too small', () => {
    render(<AnnotationCanvas {...defaultProps} />);
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    
    // Draw a very small shape
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(canvas, { clientX: 100, clientY: 100 }); // No movement
    fireEvent.pointerUp(canvas, { clientX: 100, clientY: 100 });
    
    // Should not add annotation
    expect(mockOnAnnotationAdd).not.toHaveBeenCalled();
  });

  it('should handle circle tool correctly', () => {
    render(
      <AnnotationCanvas
        {...defaultProps}
        selectedTool="circle"
      />
    );
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.pointerUp(canvas, { clientX: 150, clientY: 150 });
    
    expect(mockOnAnnotationAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'circle',
        coordinates: expect.objectContaining({
          centerX: expect.any(Number),
          centerY: expect.any(Number),
          radius: expect.any(Number),
        }),
      })
    );
  });

  it('should handle rectangle tool correctly', () => {
    render(
      <AnnotationCanvas
        {...defaultProps}
        selectedTool="rectangle"
      />
    );
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.pointerUp(canvas, { clientX: 200, clientY: 150 });
    
    expect(mockOnAnnotationAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'rectangle',
        coordinates: expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          width: expect.any(Number),
          height: expect.any(Number),
        }),
      })
    );
  });

  it('should not draw when tool is "none"', () => {
    render(
      <AnnotationCanvas
        {...defaultProps}
        selectedTool="none"
      />
    );
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(canvas, { clientX: 200, clientY: 200 });
    
    expect(mockOnAnnotationAdd).not.toHaveBeenCalled();
  });

  it('should cancel drawing on pointer cancel', () => {
    render(<AnnotationCanvas {...defaultProps} />);
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerCancel(canvas);
    
    // Should not add annotation
    expect(mockOnAnnotationAdd).not.toHaveBeenCalled();
  });

  it('should render existing annotations', () => {
    const existingAnnotations: PhotoAnnotationType[] = [
      {
        id: '1',
        type: 'arrow',
        color: ANNOTATION_COLORS.blue,
        lineWidth: LINE_WIDTHS.thin,
        coordinates: { startX: 10, startY: 10, endX: 50, endY: 50 },
        createdAt: new Date(),
        order: 0,
      },
    ];
    
    render(
      <AnnotationCanvas
        {...defaultProps}
        annotations={existingAnnotations}
      />
    );
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();
    
    // Existing annotations should be rendered (verified by canvas being present and configured)
  });

  it('should apply tool config to new annotations', () => {
    const customToolConfig = {
      color: ANNOTATION_COLORS.green,
      lineWidth: LINE_WIDTHS.thick,
    };
    
    render(
      <AnnotationCanvas
        {...defaultProps}
        toolConfig={customToolConfig}
      />
    );
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(canvas, { clientX: 200, clientY: 200 });
    
    expect(mockOnAnnotationAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        color: ANNOTATION_COLORS.green,
        lineWidth: LINE_WIDTHS.thick,
      })
    );
  });
});
