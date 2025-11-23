'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';

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
  const [showHelp, setShowHelp] = useState(false);

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
      // Manually calculate center position - use multiple attempts to ensure proper centering
      const attemptCenter = (attempt = 0) => {
        if (ref.setTransform && ref.instance?.wrapperComponent) {
          const wrapperElement = ref.instance.wrapperComponent;
          const wrapperWidth = wrapperElement.offsetWidth;
          const wrapperHeight = wrapperElement.offsetHeight;

          // Only proceed if we have valid dimensions
          if (wrapperWidth === 0 || wrapperHeight === 0) {
            if (attempt < 5) {
              setTimeout(() => attemptCenter(attempt + 1), 50);
            }
            return;
          }

          // SVG is 400x800, at scale 0.45 = 180x360
          const scale = 0.45;
          const scaledWidth = 400 * scale;
          const scaledHeight = 800 * scale;

          // Calculate centered horizontal position
          const x = (wrapperWidth - scaledWidth) / 2;
          
          // Calculate vertical position - adjust to position body higher up
          // The body figure is positioned in the upper portion of the SVG viewBox,
          // so we offset upward to better center the visible body portion
          const verticalOffset = scaledHeight * 0.40; // Move up by 40% of scaled height
          const y = (wrapperHeight - scaledHeight) / 2 - verticalOffset;

          ref.setTransform(x, y, scale, 0, CENTER_EASE);
          onZoomChange?.(scale);
        } else if (attempt < 5) {
          // Retry if wrapper not ready yet
          setTimeout(() => attemptCenter(attempt + 1), 50);
        }
      };
      
      // Start centering immediately and retry if needed
      setTimeout(() => attemptCenter(), 0);
    },
    [onZoomChange]
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
        initialScale={0.45}
        initialPositionX={0}
        initialPositionY={0}
        minScale={0.3}
        maxScale={3}
        centerOnInit={true}
        centerZoomedOut={true}
        limitToBounds={false}
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
        {({ zoomIn, zoomOut, resetTransform, setTransform }) => {
          const handleZoomIn = () => {
            zoomIn();
            scheduleRecenter();
          };

          const handleZoomOut = () => {
            zoomOut();
            scheduleRecenter();
          };

          const handleReset = () => {
            // Reset to initial centered position with proper vertical alignment
            if (apiRef.current?.setTransform && apiRef.current?.instance?.wrapperComponent) {
              const wrapperElement = apiRef.current.instance.wrapperComponent;
              const wrapperWidth = wrapperElement.offsetWidth;
              const wrapperHeight = wrapperElement.offsetHeight;
              const scale = 0.45;
              const scaledWidth = 400 * scale;
              const scaledHeight = 800 * scale;
              const x = (wrapperWidth - scaledWidth) / 2;
              // Apply same vertical offset as initial positioning
              const verticalOffset = scaledHeight * 0.40;
              const y = (wrapperHeight - scaledHeight) / 2 - verticalOffset;
              apiRef.current.setTransform(x, y, scale, 200, CENTER_EASE);
            } else {
              resetTransform();
            }
          };

          // Keyboard shortcuts
          useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
              // Only handle shortcuts when body map has focus or is interactive
              if (currentZoom <= 1 && !["+", "=", "-", "_", "Escape", "?"].includes(event.key)) {
                return;
              }

              switch (event.key) {
                case "+":
                case "=":
                  event.preventDefault();
                  handleZoomIn();
                  break;
                case "-":
                case "_":
                  event.preventDefault();
                  handleZoomOut();
                  break;
                case "0":
                  event.preventDefault();
                  handleReset();
                  break;
                case "ArrowUp":
                  if (currentZoom > 1) {
                    event.preventDefault();
                    // Pan up
                    setTransform(
                      apiRef.current?.state.positionX || 0,
                      (apiRef.current?.state.positionY || 0) - 50,
                      currentZoom,
                      200,
                      'easeOutQuad'
                    );
                  }
                  break;
                case "ArrowDown":
                  if (currentZoom > 1) {
                    event.preventDefault();
                    // Pan down
                    setTransform(
                      apiRef.current?.state.positionX || 0,
                      (apiRef.current?.state.positionY || 0) + 50,
                      currentZoom,
                      200,
                      'easeOutQuad'
                    );
                  }
                  break;
                case "ArrowLeft":
                  if (currentZoom > 1) {
                    event.preventDefault();
                    // Pan left
                    setTransform(
                      (apiRef.current?.state.positionX || 0) - 50,
                      apiRef.current?.state.positionY || 0,
                      currentZoom,
                      200,
                      'easeOutQuad'
                    );
                  }
                  break;
                case "ArrowRight":
                  if (currentZoom > 1) {
                    event.preventDefault();
                    // Pan right
                    setTransform(
                      (apiRef.current?.state.positionX || 0) + 50,
                      apiRef.current?.state.positionY || 0,
                      currentZoom,
                      200,
                      'easeOutQuad'
                    );
                  }
                  break;
                case "Escape":
                  event.preventDefault();
                  // Reset to initial centered position with proper vertical alignment
                  if (apiRef.current?.setTransform && apiRef.current?.instance?.wrapperComponent) {
                    const wrapperElement = apiRef.current.instance.wrapperComponent;
                    const wrapperWidth = wrapperElement.offsetWidth;
                    const wrapperHeight = wrapperElement.offsetHeight;
                    const scale = 0.45;
                    const scaledWidth = 400 * scale;
                    const scaledHeight = 800 * scale;
                    const x = (wrapperWidth - scaledWidth) / 2;
                    // Apply same vertical offset as initial positioning
                    const verticalOffset = scaledHeight * 0.15;
                    const y = (wrapperHeight - scaledHeight) / 2 - verticalOffset;
                    apiRef.current.setTransform(x, y, scale, 200, CENTER_EASE);
                  }
                  setShowHelp(false);
                  break;
                case "?":
                  event.preventDefault();
                  setShowHelp(!showHelp);
                  break;
              }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
          }, [currentZoom, handleZoomIn, handleZoomOut, handleReset]);

          return (
            <>
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="cursor-grab active:cursor-grabbing select-none"
                wrapperStyle={{
                  width: '100%',
                  height: '100%'
                }}
              >
                {children}
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

      {/* Keyboard shortcuts help overlay */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Zoom in:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">+</kbd>
              </div>
              <div className="flex justify-between">
                <span>Zoom out:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">-</kbd>
              </div>
              <div className="flex justify-between">
                <span>Reset zoom:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">0</kbd>
              </div>
              <div className="flex justify-between">
                <span>Pan (when zoomed):</span>
                <span className="text-xs">Arrow keys</span>
              </div>
              <div className="flex justify-between">
                <span>Reset view:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
