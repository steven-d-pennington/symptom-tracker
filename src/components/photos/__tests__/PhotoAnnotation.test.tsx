import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoAnnotation } from '../PhotoAnnotation';
import { PhotoAttachment } from '@/lib/types/photo';
import { PhotoAnnotation as PhotoAnnotationType } from '@/lib/types/annotation';

// Mock the canvas component
jest.mock('../AnnotationCanvas', () => ({
  AnnotationCanvas: ({ onAnnotationAdd }: any) => (
    <div data-testid="annotation-canvas" onClick={() => onAnnotationAdd({
      id: 'test',
      type: 'arrow',
      color: '#E53E3E',
      lineWidth: 4,
      coordinates: { startX: 10, startY: 10, endX: 50, endY: 50 },
      createdAt: new Date(),
      order: 0,
    })}>
      Mock Canvas
    </div>
  ),
}));

describe('PhotoAnnotation', () => {
  const mockPhoto: PhotoAttachment = {
    id: 'photo-1',
    userId: 'user-1',
    fileName: 'test.jpg',
    originalFileName: 'test.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    width: 800,
    height: 600,
    encryptedData: new Blob(['test'], { type: 'image/jpeg' }),
    thumbnailData: new Blob(['thumb'], { type: 'image/jpeg' }),
    encryptionIV: 'test-iv',
    capturedAt: new Date(),
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FileReader
    global.FileReader = jest.fn(function(this: any) {
      this.readAsDataURL = jest.fn(function(this: any) {
        setTimeout(() => {
          this.onload?.({ target: { result: 'data:image/jpeg;base64,test' } });
        }, 0);
      });
    }) as any;
  });

  it('should render when open', async () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Annotate Photo')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Annotate Photo')).not.toBeInTheDocument();
  });

  it('should close on cancel button click', async () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close on X button click', async () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const closeButton = screen.getByLabelText('Close annotation editor');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should save annotations on save button click', async () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('annotation-canvas')).toBeInTheDocument();
    });

    // Add an annotation
    const canvas = screen.getByTestId('annotation-canvas');
    fireEvent.click(canvas);

    // Wait for annotation to be added
    await waitFor(() => {
      expect(screen.getByText('1 annotation')).toBeInTheDocument();
    });

    // Click save
    const saveButton = screen.getByText('Save Annotations');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'arrow',
          }),
        ])
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should show annotation count', async () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('annotation-canvas')).toBeInTheDocument();
    });

    // Initially no annotations
    expect(screen.getByText('0 annotations')).toBeInTheDocument();

    // Add annotation
    const canvas = screen.getByTestId('annotation-canvas');
    fireEvent.click(canvas);

    await waitFor(() => {
      expect(screen.getByText('1 annotation')).toBeInTheDocument();
    });
  });

  it('should undo last annotation', async () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('annotation-canvas')).toBeInTheDocument();
    });

    // Add annotation
    const canvas = screen.getByTestId('annotation-canvas');
    fireEvent.click(canvas);

    await waitFor(() => {
      expect(screen.getByText('1 annotation')).toBeInTheDocument();
    });

    // Undo
    const undoButton = screen.getByLabelText('Undo last annotation');
    fireEvent.click(undoButton);

    await waitFor(() => {
      expect(screen.getByText('0 annotations')).toBeInTheDocument();
    });
  });

  it('should clear all annotations with confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('annotation-canvas')).toBeInTheDocument();
    });

    // Add annotation
    const canvas = screen.getByTestId('annotation-canvas');
    fireEvent.click(canvas);

    await waitFor(() => {
      expect(screen.getByText('1 annotation')).toBeInTheDocument();
    });

    // Clear all
    const clearButton = screen.getByLabelText('Clear all annotations');
    fireEvent.click(clearButton);

    expect(confirmSpy).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText('0 annotations')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('should not clear annotations if user cancels', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('annotation-canvas')).toBeInTheDocument();
    });

    // Add annotation
    const canvas = screen.getByTestId('annotation-canvas');
    fireEvent.click(canvas);

    await waitFor(() => {
      expect(screen.getByText('1 annotation')).toBeInTheDocument();
    });

    // Try to clear all
    const clearButton = screen.getByLabelText('Clear all annotations');
    fireEvent.click(clearButton);

    // Should still have annotation
    expect(screen.getByText('1 annotation')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('should handle keyboard shortcuts', async () => {
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // ESC to close
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable buttons when saving', async () => {
    const slowSave = jest.fn((): Promise<void> => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(
      <PhotoAnnotation
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onSave={slowSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('annotation-canvas')).toBeInTheDocument();
    });

    // Add annotation
    const canvas = screen.getByTestId('annotation-canvas');
    fireEvent.click(canvas);

    await waitFor(() => {
      expect(screen.getByText('1 annotation')).toBeInTheDocument();
    });

    // Click save
    const saveButton = screen.getByText('Save Annotations');
    fireEvent.click(saveButton);

    // Buttons should be disabled
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('should load existing annotations', () => {
    const existingAnnotations: PhotoAnnotationType[] = [
      {
        id: '1',
        type: 'circle',
        color: '#3B82F6',
        lineWidth: 2,
        coordinates: { centerX: 50, centerY: 50, radius: 20 },
        createdAt: new Date(),
        order: 0,
      },
    ];

    render(
      <PhotoAnnotation
        photo={mockPhoto}
        existingAnnotations={existingAnnotations}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Should show existing annotation count
    expect(screen.getByText('1 annotation')).toBeInTheDocument();
  });
});
