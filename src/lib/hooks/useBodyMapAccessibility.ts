"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { BodyRegion } from "../types/body-mapping";
import { NormalizedCoordinates } from "../utils/coordinates";
import { useFlares } from "./useFlares";

/**
 * Keyboard navigation mode for body map accessibility
 */
export enum KeyboardMode {
  NAVIGATE = "navigate", // Tab between regions
  PAN = "pan", // Arrow keys pan zoomed view
  POSITION = "position", // Arrow keys position coordinate
}

/**
 * Props for useBodyMapAccessibility hook
 */
interface UseBodyMapAccessibilityProps {
  regions: BodyRegion[];
  selectedRegion?: string;
  onRegionSelect?: (regionId: string) => void;
  onCoordinateMark?: (regionId: string, coordinates: NormalizedCoordinates) => void;
  zoomLevel?: number;
  isZoomed?: boolean;
  userId: string;
}

/**
 * Return type for useBodyMapAccessibility hook
 */
export interface BodyMapAccessibilityReturn {
  // Focus management
  focusedRegionId: string | null;
  setFocusedRegionId: (id: string | null) => void;

  // Tab order
  tabOrder: string[];
  getTabIndex: (regionId: string) => number;

  // Keyboard handlers
  handleRegionKeyDown: (event: React.KeyboardEvent, regionId: string) => void;
  handleGlobalKeyDown: (event: React.KeyboardEvent) => void;

  // ARIA labels
  getAriaLabel: (regionId: string) => string;

  // Coordinate positioning
  currentCoordinates: NormalizedCoordinates;

  // Mode management
  keyboardMode: KeyboardMode;
  setKeyboardMode: (mode: KeyboardMode) => void;

  // Announcements
  announcement: string;
}

/**
 * Hook for managing body map accessibility features
 * Handles keyboard navigation, ARIA labels, and screen reader announcements
 */
export function useBodyMapAccessibility({
  regions,
  selectedRegion,
  onRegionSelect,
  onCoordinateMark,
  zoomLevel = 1,
  isZoomed = false,
  userId,
}: UseBodyMapAccessibilityProps): BodyMapAccessibilityReturn {
  // Mark parameters as used to avoid lint warnings
  void selectedRegion;
  void zoomLevel;
  const [focusedRegionId, setFocusedRegionId] = useState<string | null>(null);
  const [keyboardMode, setKeyboardMode] = useState<KeyboardMode>(KeyboardMode.NAVIGATE);
  const [announcement, setAnnouncement] = useState<string>("");
  const [currentCoordinates, setCurrentCoordinates] = useState<NormalizedCoordinates>({ x: 0.5, y: 0.5 });
  const lastAnnouncementRef = useRef<string>("");

  // Get flare data for dynamic ARIA labels
  const { data: flares } = useFlares({ userId });

  // Calculate logical tab order: head → neck → shoulders → arms → torso → groin → legs
  const tabOrder = useMemo(() => {
    const order: string[] = [];

    // Helper to add regions by category and anatomical order
    const addByCategory = (category: string, sortFn?: (a: BodyRegion, b: BodyRegion) => number) => {
      const categoryRegions = regions
        .filter(r => r.category === category && r.selectable)
        .sort(sortFn || ((a, b) => {
          // Default: left before right, then by Y position (top to bottom)
          if (a.side === "left" && b.side === "right") return -1;
          if (a.side === "right" && b.side === "left") return 1;
          return (a.center?.y || 0) - (b.center?.y || 0);
        }));

      order.push(...categoryRegions.map(r => r.id));
    };

    // Head & Neck (top priority)
    addByCategory("head");

    // Shoulders (before arms)
    addByCategory("limbs", (a, b) => {
      // Shoulders first, then upper arms, forearms, hands
      const order = ["shoulder", "upper-arm", "elbow", "forearm", "wrist", "hand"];
      const aType = order.find(type => a.id.includes(type));
      const bType = order.find(type => b.id.includes(type));
      if (aType && bType) {
        return order.indexOf(aType) - order.indexOf(bType);
      }
      // Fallback to left/right then Y position
      if (a.side === "left" && b.side === "right") return -1;
      if (a.side === "right" && b.side === "left") return 1;
      return (a.center?.y || 0) - (b.center?.y || 0);
    });

    // Torso
    addByCategory("torso");

    // HS-specific regions (groin, armpits, under-breast)
    addByCategory("other", (a, b) => {
      // Prioritize groin, then armpits, then under-breast
      const priority = ["groin", "armpit", "under-breast"];
      const aPriority = priority.find(p => a.id.includes(p));
      const bPriority = priority.find(p => b.id.includes(p));
      if (aPriority && bPriority) {
        return priority.indexOf(aPriority) - priority.indexOf(bPriority);
      }
      // Fallback to left/right then Y position
      if (a.side === "left" && b.side === "right") return -1;
      if (a.side === "right" && b.side === "left") return 1;
      return (a.center?.y || 0) - (b.center?.y || 0);
    });

    // Joints (hips, knees, ankles)
    addByCategory("joints");

    return order;
  }, [regions]);

  // Get tab index for a region
  const getTabIndex = useCallback((regionId: string): number => {
    return tabOrder.indexOf(regionId) >= 0 ? 0 : -1;
  }, [tabOrder]);

  // Get dynamic ARIA label for a region
  const getAriaLabel = useCallback((regionId: string): string => {
    const region = regions.find(r => r.id === regionId);
    if (!region) return regionId;

    // Count active flares for this region
    const flareCount = flares?.filter(f => f.bodyRegions.includes(regionId)).length ?? 0;

    // Build label: "Region Name, X active flares"
    const flareText = flareCount === 1 ? "1 active flare" : `${flareCount} active flares`;
    return `${region.name}, ${flareText}`;
  }, [regions, flares]);

  // Handle global keyboard events
  const handleGlobalKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Only handle if we have focus in the body map
    if (!focusedRegionId) return;

    switch (keyboardMode) {
      case KeyboardMode.NAVIGATE:
        // Navigation mode: Tab cycles through regions (handled by browser)
        // Arrow keys could switch to pan mode if zoomed
        if (isZoomed && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          setKeyboardMode(KeyboardMode.PAN);
          setAnnouncement("Switched to pan mode. Use arrow keys to pan the view.");
        }
        break;

      case KeyboardMode.PAN:
        // Pan mode: Arrow keys pan the view (to be implemented)
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          // TODO: Implement pan logic
          setAnnouncement(`Panning ${event.key.replace("Arrow", "").toLowerCase()}`);
        } else if (event.key === "Enter") {
          event.preventDefault();
          setKeyboardMode(KeyboardMode.POSITION);
          setAnnouncement("Switched to coordinate positioning mode. Use arrow keys to adjust position.");
        } else if (event.key === "Escape") {
          event.preventDefault();
          setKeyboardMode(KeyboardMode.NAVIGATE);
          setAnnouncement("Returned to navigation mode.");
        }
        break;

      case KeyboardMode.POSITION:
        // Position mode: Arrow keys adjust coordinates
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          const delta = 0.01; // 1% adjustment (0.01 units on 0-1 scale)
          let newCoordinates = { ...currentCoordinates };

          switch (event.key) {
            case "ArrowUp": newCoordinates.y = Math.max(0, newCoordinates.y - delta); break;
            case "ArrowDown": newCoordinates.y = Math.min(1, newCoordinates.y + delta); break;
            case "ArrowLeft": newCoordinates.x = Math.max(0, newCoordinates.x - delta); break;
            case "ArrowRight": newCoordinates.x = Math.min(1, newCoordinates.x + delta); break;
          }

          setCurrentCoordinates(newCoordinates);
          if (selectedRegion) {
            onCoordinateMark?.(selectedRegion, newCoordinates);
          }
          setAnnouncement(`Position: x=${newCoordinates.x.toFixed(2)}, y=${newCoordinates.y.toFixed(2)}`);
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (selectedRegion) {
            onCoordinateMark?.(selectedRegion, currentCoordinates);
          }
          setAnnouncement("Coordinate marked at current position.");
          setKeyboardMode(KeyboardMode.NAVIGATE);
        } else if (event.key === "Escape") {
          event.preventDefault();
          setKeyboardMode(KeyboardMode.PAN);
          setAnnouncement("Returned to pan mode.");
        }
        break;
    }
  }, [focusedRegionId, keyboardMode, isZoomed]);

  // Handle region-specific keyboard events
  const handleRegionKeyDown = useCallback((event: React.KeyboardEvent, regionId: string) => {
    switch (event.key) {
      case "Enter":
      case " ": // Space
        event.preventDefault();
        onRegionSelect?.(regionId);
        setAnnouncement(`Selected ${regions.find(r => r.id === regionId)?.name || regionId}`);
        break;

      case "Tab":
        // Let natural tab behavior work
        break;

      default:
        // Let other keys bubble up to global handler
        handleGlobalKeyDown(event);
        break;
    }
  }, [regions, onRegionSelect, handleGlobalKeyDown]);

  // Announce changes when mode or focus changes
  const currentAnnouncement = useMemo(() => {
    if (announcement !== lastAnnouncementRef.current) {
      lastAnnouncementRef.current = announcement;
      return announcement;
    }
    return "";
  }, [announcement]);

  return {
    focusedRegionId,
    setFocusedRegionId,
    tabOrder,
    getTabIndex,
    handleRegionKeyDown,
    handleGlobalKeyDown,
    getAriaLabel,
    currentCoordinates,
    keyboardMode,
    setKeyboardMode,
    announcement: currentAnnouncement,
  };
}
