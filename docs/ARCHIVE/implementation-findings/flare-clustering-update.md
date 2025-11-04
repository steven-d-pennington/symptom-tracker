# Flare Region Clustering Enhancement

**Date:** 2025-10-28
**Issue:** Flares were too concentrated in only 2-3 regions (armpit-right, buttocks-left)
**Solution:** Added clustering intensity levels for realistic variety

---

## Changes Made

### 1. Added `clusteringIntensity` Parameter

**File:** `src/lib/dev/generators/base/types.ts`

```typescript
flares: {
  count: { min: number; max: number };
  regionClustering: boolean;
  clusteringIntensity?: 'high' | 'medium' | 'low'; // NEW
  generateEvents: boolean;
  eventsPerFlare: { min: number; max: number };
  interventionProbability: number;
}
```

---

## Intensity Levels

### High Intensity (Problem Areas Scenario)
**Purpose:** Analytics testing - ensures 3+ flares per region

**Regions:** 4 regions
- Armpit Right (30%)
- Groin Left (25%)
- Under Breast Right (25%)
- Buttocks Left (20%)

**Use Case:** Testing Problem Areas analytics feature

---

### Medium Intensity (Comprehensive, Stress Test)
**Purpose:** Balanced realism - some clustering with good variety

**Regions:** 8 regions with moderate weights
- Armpit Right (18%)
- Armpit Left (15%)
- Groin Left (14%)
- Groin Right (12%)
- Under Breast Right (12%)
- Buttocks Left (10%)
- Inner Thigh Right (10%)
- Chest (9%)

**Use Case:** General testing with realistic patterns

---

### Low Intensity (Flare Progression)
**Purpose:** Most realistic - covers all body regions with slight preferences

**Regions:** 14 regions with subtle preferences
- Armpit Right (10%)
- Armpit Left (10%)
- Groin Left (9%)
- Groin Right (9%)
- Center Groin (7%)
- Under Breast Right (8%)
- Under Breast Left (7%)
- Buttocks Left (8%)
- Buttocks Right (7%)
- Inner Thigh Right (7%)
- Inner Thigh Left (7%)
- Chest (5%)
- Back (4%)
- Neck Front (2%)

**Use Case:** Realistic distribution for detailed flare tracking

---

## Scenario Updates

| Scenario | Clustering | Intensity | Regions Used | Rationale |
|----------|-----------|-----------|--------------|-----------|
| Quick Start | No | N/A | 15 (random) | Simple variety |
| Flare Progression | Yes | **Low** | 14 (subtle preference) | Realistic tracking |
| Food Correlations | No | N/A | 15 (random) | Focus on food patterns |
| Trigger Analysis | No | N/A | 15 (random) | Focus on triggers |
| Problem Areas | Yes | **High** | 4 (concentrated) | Analytics testing |
| Comprehensive | Yes | **Medium** | 8 (balanced) | Realistic comprehensive |
| Stress Test | Yes | **Medium** | 8 (balanced) | Varied performance test |

---

## Example Distributions

### Before (High Clustering Always)
```
Comprehensive (20 flares):
- armpit-right: 6 flares (30%)
- groin-left: 5 flares (25%)
- under-breast-right: 5 flares (25%)
- buttocks-left: 4 flares (20%)
- Other regions: 0 flares (0%)
```

### After (Medium Intensity)
```
Comprehensive (20 flares):
- armpit-right: 3-4 flares (18%)
- armpit-left: 3 flares (15%)
- groin-left: 2-3 flares (14%)
- groin-right: 2 flares (12%)
- under-breast-right: 2 flares (12%)
- buttocks-left: 2 flares (10%)
- inner-thigh-right: 2 flares (10%)
- chest: 1-2 flares (9%)
```

### After (Low Intensity)
```
Flare Progression (10 flares):
- armpit-right: 1 flare (10%)
- armpit-left: 1 flare (10%)
- groin-left: 1 flare (9%)
- groin-right: 1 flare (9%)
- under-breast-right: 1 flare (8%)
- buttocks-left: 1 flare (8%)
- center-groin: 1 flare (7%)
- inner-thigh-right: 1 flare (7%)
- chest: 1 flare (5%)
- back: 0-1 flare (4%)
```

---

## Testing Recommendations

### Test Medium Intensity (Comprehensive)
1. Generate "Comprehensive" scenario (1 year)
2. Navigate to Flares page
3. Verify flares appear in 6-8 different regions
4. Check that no single region dominates (should be 10-20% each)

### Test High Intensity (Problem Areas)
1. Generate "Problem Areas" scenario (1 year)
2. Navigate to Analytics > Flares
3. Check Problem Areas section
4. Should show 4 regions with 3+ flares each
5. Should show clear percentages (20-30% per region)

### Test Low Intensity (Flare Progression)
1. Generate "Flare Progression" scenario (1 year)
2. Navigate to Flares page
3. Verify flares distributed across 8-10+ regions
4. Should feel realistic - variety with slight clustering in common areas

---

## Benefits

✅ **More Realistic** - Flares appear in varied body regions like real-world HS

✅ **Better Testing** - Can test different clustering patterns for different features

✅ **Flexible** - Easy to adjust intensity per scenario

✅ **Backward Compatible** - Defaults to 'medium' if not specified

✅ **Analytics Friendly** - High intensity still works for Problem Areas testing

---

## Files Modified

1. `src/lib/dev/generators/base/types.ts` - Added clusteringIntensity parameter
2. `src/lib/dev/config/scenarios.ts` - Updated 4 scenarios with intensity levels
3. `src/lib/dev/generators/orchestrator.ts` - Implemented 3-tier clustering logic

---

**Status:** ✅ Complete and tested
**Build:** ✅ Passing
**Ready to use:** Yes
