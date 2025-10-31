"use client";

import { useEffect, useRef, useState } from "react";

type AriaLive = "polite" | "assertive" | "off";

interface LiveRegionProps {
  /**
   * The message to announce
   */
  message?: string;
  /**
   * Politeness level for screen reader announcements
   * - "polite": Wait for current speech to finish
   * - "assertive": Interrupt current speech
   * - "off": Do not announce
   */
  politeness?: AriaLive;
  /**
   * Whether to clear the message after announcing
   */
  clearOnAnnounce?: boolean;
  /**
   * Delay before clearing (ms)
   */
  clearDelay?: number;
}

/**
 * Live region component for screen reader announcements
 *
 * Use this component to announce dynamic content changes to screen readers.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [status, setStatus] = useState('');
 *
 *   const handleSave = async () => {
 *     await save();
 *     setStatus('Item saved successfully');
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleSave}>Save</button>
 *       <LiveRegion message={status} clearOnAnnounce />
 *     </>
 *   );
 * }
 * ```
 */
export function LiveRegion({
  message,
  politeness = "polite",
  clearOnAnnounce = false,
  clearDelay = 1000,
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);

      if (clearOnAnnounce) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout to clear message
        timeoutRef.current = setTimeout(() => {
          setCurrentMessage("");
        }, clearDelay);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearOnAnnounce, clearDelay]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}

/**
 * Hook for managing live region announcements
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce } = useLiveRegion();
 *
 *   const handleSave = async () => {
 *     await save();
 *     announce('Item saved successfully');
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useLiveRegion() {
  const [message, setMessage] = useState("");
  const [politeness, setPoliteness] = useState<AriaLive>("polite");

  const announce = (msg: string, level: AriaLive = "polite") => {
    setMessage(msg);
    setPoliteness(level);
  };

  const clear = () => {
    setMessage("");
  };

  const LiveRegionComponent = () => (
    <LiveRegion
      message={message}
      politeness={politeness}
      clearOnAnnounce
      clearDelay={1000}
    />
  );

  return {
    announce,
    clear,
    message,
    LiveRegion: LiveRegionComponent,
  };
}
