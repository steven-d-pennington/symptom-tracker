"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  PhotoAnnotation,
  AnnotationTool,
  ToolConfig,
  AnnotationCoordinates,
} from '@/lib/types/annotation';
import {
  renderAnnotations,
  pixelToPercent,
  percentToPixel,
  renderArrow,
  renderCircle,
  renderRectangle,
} from '@/lib/utils/annotationRendering';
import { v4 as uuidv4 } from 'uuid';

interface AnnotationCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  annotations: PhotoAnnotation[];
  selectedTool: AnnotationTool;
  toolConfig: ToolConfig;
  onAnnotationAdd: (annotation: PhotoAnnotation) => void;
  onTextClick?: (position: { x: number; y: number }) => void;
}

export function AnnotationCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  annotations,
  selectedTool,
  toolConfig,
  onAnnotationAdd,
  onTextClick,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<PhotoAnnotation | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  // Calculate canvas size to fit container while maintaining aspect ratio
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      const imageAspect = imageWidth / imageHeight;
      const containerAspect = containerWidth / containerHeight;

      let width, height;
      if (imageAspect > containerAspect) {
        // Image is wider than container
        width = Math.min(containerWidth, imageWidth);
        height = width / imageAspect;
      } else {
        // Image is taller than container
        height = Math.min(containerHeight, imageHeight);
        width = height * imageAspect;
      }

      setCanvasSize({ width, height });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [imageWidth, imageHeight]);

  // Render annotations on canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render all completed annotations
    renderAnnotations(ctx, annotations, canvasSize.width, canvasSize.height);

    // Render current annotation being drawn (preview)
    if (currentAnnotation) {
      switch (currentAnnotation.type) {
        case 'arrow':
          renderArrow(
            ctx,
            currentAnnotation.coordinates,
            currentAnnotation.color,
            currentAnnotation.lineWidth,
            canvasSize.width,
            canvasSize.height
          );
          break;
        case 'circle':
          renderCircle(
            ctx,
            currentAnnotation.coordinates,
            currentAnnotation.color,
            currentAnnotation.lineWidth,
            canvasSize.width,
            canvasSize.height
          );
          break;
        case 'rectangle':
          renderRectangle(
            ctx,
            currentAnnotation.coordinates,
            currentAnnotation.color,
            currentAnnotation.lineWidth,
            canvasSize.width,
            canvasSize.height
          );
          break;
      }
    }
  }, [annotations, currentAnnotation, canvasSize]);

  // Use requestAnimationFrame for smooth rendering
  useEffect(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    const id = requestAnimationFrame(render);
    setAnimationFrameId(id);

    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [render]);

  // Convert screen coordinates to canvas percentage coordinates
  const getCanvasCoordinates = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return {
      x: pixelToPercent(x, canvasSize.width),
      y: pixelToPercent(y, canvasSize.height),
    };
  };

  // Pointer down - start drawing or open text dialog
  const handlePointerDown = (e: React.PointerEvent) => {
    if (selectedTool === 'none') return;

    e.preventDefault();

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);

    // For text tool, open dialog at click position
    if (selectedTool === 'text' && onTextClick) {
      onTextClick({ x, y });
      return;
    }

    setIsDrawing(true);

    let coordinates: AnnotationCoordinates = {};

    switch (selectedTool) {
      case 'arrow':
        coordinates = { startX: x, startY: y, endX: x, endY: y };
        break;
      case 'circle':
        coordinates = { centerX: x, centerY: y, radius: 0 };
        break;
      case 'rectangle':
        coordinates = { x, y, width: 0, height: 0 };
        break;
    }

    setCurrentAnnotation({
      id: uuidv4(),
      type: selectedTool,
      color: toolConfig.color,
      lineWidth: toolConfig.lineWidth,
      coordinates,
      createdAt: new Date(),
      order: annotations.length,
    });
  };

  // Pointer move - update preview
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentAnnotation || selectedTool === 'none') return;

    e.preventDefault();

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);

    let updatedCoordinates = { ...currentAnnotation.coordinates };

    switch (selectedTool) {
      case 'arrow':
        updatedCoordinates.endX = x;
        updatedCoordinates.endY = y;
        break;
      case 'circle': {
        const dx = x - (currentAnnotation.coordinates.centerX || 0);
        const dy = y - (currentAnnotation.coordinates.centerY || 0);
        // Radius as percentage of width (for consistent appearance)
        updatedCoordinates.radius = Math.sqrt(dx * dx + dy * dy);
        break;
      }
      case 'rectangle': {
        const startX = currentAnnotation.coordinates.x || 0;
        const startY = currentAnnotation.coordinates.y || 0;
        updatedCoordinates.width = x - startX;
        updatedCoordinates.height = y - startY;
        break;
      }
    }

    setCurrentAnnotation({
      ...currentAnnotation,
      coordinates: updatedCoordinates,
    });
  };

  // Pointer up - finish drawing
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing || !currentAnnotation) return;

    e.preventDefault();
    setIsDrawing(false);

    // Only add annotation if it has meaningful size
    const coords = currentAnnotation.coordinates;
    let hasSize = false;

    switch (selectedTool) {
      case 'arrow':
        hasSize = Math.abs((coords.endX || 0) - (coords.startX || 0)) > 1 ||
                  Math.abs((coords.endY || 0) - (coords.startY || 0)) > 1;
        break;
      case 'circle':
        hasSize = (coords.radius || 0) > 1;
        break;
      case 'rectangle':
        hasSize = Math.abs(coords.width || 0) > 1 && Math.abs(coords.height || 0) > 1;
        break;
    }

    if (hasSize) {
      onAnnotationAdd(currentAnnotation);
    }

    setCurrentAnnotation(null);
  };

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center">
      {/* Background photo */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Photo to annotate"
        className="absolute"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />

      {/* Annotation canvas overlay */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setIsDrawing(false);
          setCurrentAnnotation(null);
        }}
      />
    </div>
  );
}
