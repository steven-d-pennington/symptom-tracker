'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';
import { FlareMarkers } from './FlareMarkers';

interface BodyMapZoomProps {
  children: React.ReactNode;
  viewType: 'front' | 'back' | 'left' | 'right';
  userId: string;
  onZoomChange?: (scale: number) => void;
}

const CENTER_EASE = 'easeOutQuad';

export function BodyMapZoom({ children, viewType, userId, onZoomChange }: BodyMapZoomProps) {
  const apiRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  const centerCurrentView = useCallback(
    (ref?: ReactZoomPanPinchRef, scaleOverride?: number) => {
      const api = ref ?? apiRef.current;
      if (!api?.centerView) return;

      const scale = scaleOverride ?? api.state.scale;
      api.centerView(scale, 0, CENTER_EASE);
    },
    []
  );

  const handleInit = useCallback(
    (ref: ReactZoomPanPinchRef) => {
      apiRef.current = ref;
      centerCurrentView(ref);
      onZoomChange?.(ref.state.scale);
    },
    [centerCurrentView, onZoomChange]
  );

  const handleTransformed = useCallback(
    (ref: ReactZoomPanPinchRef, state: { scale: number; positionX: number; positionY: number }) => {
      apiRef.current = ref;
      setCurrentZoom(state.scale);
      onZoomChange?.(state.scale);
    },
    [onZoomChange]
  );

  const scheduleRecenter = useCallback(() => {
    requestAnimationFrame(() => centerCurrentView());
  }, [centerCurrentView]);

  return (
    <div className="relative w-full h-full">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={3}
        centerOnInit
        centerZoomedOut
        limitToBounds={true}
        wheel={{ smoothStep: 0.005, disabled: false }}
        pinch={{ step: 5, disabled: false }}
        doubleClick={{ disabled: false, mode: 'zoomIn' }}
        panning={{ disabled: false }}
        velocityAnimation={{
          disabled: false,
          sensitivity: 1,
          animationTime: 200,
          animationType: 'easeOutQuad',
        }}
        onInit={handleInit}
        onTransformed={handleTransformed}
      >
        {({ zoomIn, zoomOut, resetTransform }) => {
          const handleZoomIn = () => {
            zoomIn();
            scheduleRecenter();
          };

          const handleZoomOut = () => {
            zoomOut();
            scheduleRecenter();
          };

          const handleReset = () => {
            resetTransform();
            scheduleRecenter();
          };

          return (
            <>
              <TransformComponent
                wrapperClass="!w-full !h-full !flex !items-center !justify-center"
                contentClass="cursor-grab active:cursor-grabbing select-none"
                wrapperStyle={{ width: '100%', height: '100%' }}
              >
                <div
                  className="flex items-center justify-center w-full h-full"
                  data-testid="transform-wrapper"
                >
                  {children}
                  <FlareMarkers viewType={viewType} zoomLevel={currentZoom} userId={userId} />
                </div>
              </TransformComponent>

              <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-white rounded-md hover:bg-gray-50 transition-all"
                  aria-label="Zoom in"
                  title="Zoom in (+)"
                >
                  <ZoomIn size={20} className="text-gray-700" />
                </button>

                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-white rounded-md hover:bg-gray-50 transition-all"
                  aria-label="Zoom out"
                  title="Zoom out (-)"
                >
                  <ZoomOut size={20} className="text-gray-700" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 bg-white rounded-md hover:bg-gray-50 transition-all"
                  aria-label="Reset zoom and pan"
                  title="Reset zoom and pan to default (Home)"
                >
                  <Home size={20} className="text-gray-700" />
                </button>
              </div>
            </>
          );
        }}
      </TransformWrapper>
    </div>
  );
}
