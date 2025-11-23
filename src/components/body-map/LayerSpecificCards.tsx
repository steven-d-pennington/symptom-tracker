"use client";

import { LayerType } from "@/lib/db/schema";
import { ActiveFlareCards } from "@/components/flares/ActiveFlareCards";

interface LayerSpecificCardsProps {
  userId: string;
  currentLayer: LayerType;
  filterByRegion?: string | null;
  onCardClick?: (id: string) => void;
}

/**
 * LayerSpecificCards Component
 *
 * Unified component that displays updateable marker cards for all layer types.
 * Uses ActiveFlareCards (now using unified marker system) for flares, pain, and inflammation.
 */
export function LayerSpecificCards({
  userId,
  currentLayer,
  filterByRegion,
  onCardClick,
}: LayerSpecificCardsProps) {
  // Map layer to marker type
  const markerType = currentLayer === 'flares' ? 'flare' : currentLayer;

  // Render ActiveFlareCards for ALL marker types (it now uses unified system)
  return (
    <ActiveFlareCards
      userId={userId}
      markerType={markerType}
      filterByRegion={filterByRegion}
      onUpdateFlare={onCardClick}
    />
  );
}
