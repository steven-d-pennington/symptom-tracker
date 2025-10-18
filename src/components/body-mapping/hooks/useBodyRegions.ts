import { useMemo } from "react";
import { getRegionsForView } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";

export function useBodyRegions(view: "front" | "back" | "left" | "right") {
  const regions = useMemo(() => getRegionsForView(view), [view]);

  const getRegionById = (regionId: string): BodyRegion | undefined => {
    return regions.find((r) => r.id === regionId);
  };

  const getRegionsByCategory = (
    category: "head" | "torso" | "limbs" | "joints" | "other"
  ): BodyRegion[] => {
    return regions.filter((r) => r.category === category);
  };

  const getRegionsBySide = (
    side: "left" | "right" | "center"
  ): BodyRegion[] => {
    return regions.filter((r) => r.side === side);
  };

  const searchRegions = (query: string): BodyRegion[] => {
    const lowercaseQuery = query.toLowerCase();
    return regions.filter(
      (r) =>
        r.name.toLowerCase().includes(lowercaseQuery) ||
        r.category.toLowerCase().includes(lowercaseQuery) ||
        r.commonSymptoms?.some((s) => s.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getHSSpecificRegions = (): BodyRegion[] => {
    const hsRegionIds = [
      "armpit-left",
      "armpit-right",
      "under-breast-left",
      "under-breast-right",
      "inner-thigh-left",
      "inner-thigh-right",
      "buttocks-left",
      "buttocks-right",
      "groin",
    ];
    return regions.filter((r) => hsRegionIds.includes(r.id));
  };

  return {
    regions,
    getRegionById,
    getRegionsByCategory,
    getRegionsBySide,
    searchRegions,
    getHSSpecificRegions,
  };
}
