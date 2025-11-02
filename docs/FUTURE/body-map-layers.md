# Feature Concept: Body Map Layers

**Status:** Future Enhancement
**Date:** 2025-10-30
**Category:** Body Map Enhancement
**Complexity:** Medium-High
**Epic Suggestion:** 5.x or later

---

## Overview

Enhance the body map with a **layered visualization system** that allows users to track different types of body-area-related data on separate layers. Users can switch between layers for tracking different conditions, and view multiple layers simultaneously for comprehensive health analysis.

## Problem Statement

Currently, the body map is primarily used for tracking flares. However, users may want to track multiple distinct body-area-related conditions:
- Active flares (current implementation)
- Pain locations and intensity
- Areas of stiffness or limited mobility
- Swelling or inflammation
- Numbness or tingling
- Rashes or skin conditions
- Post-treatment areas (e.g., after physical therapy)
- Scars or surgical sites

Tracking all these on a single map leads to visual clutter and makes it difficult to distinguish between different types of conditions.

## Proposed Solution

### Layer System Architecture

Implement a **multi-layer body map system** where each layer represents a different tracking category:

**Core Layers (Initial Implementation):**
1. **Flares Layer** (existing) - Active flare tracking
2. **Pain Layer** - General pain not associated with flares
3. **Mobility Layer** - Areas with limited range of motion
4. **Inflammation Layer** - Swelling and inflammation tracking

**Future Potential Layers:**
- Numbness/Tingling
- Rashes/Skin Conditions
- Treatment Areas
- Recovery Zones

### User Experience

#### Tracking Mode (Logging Data)

**Layer Selection:**
- User selects which layer they're tracking before marking body regions
- Last-used layer persists as default for next session
- Quick layer selector in the body map UI (dropdown or tabs)
- Layer selection is NOT required for every interaction (uses default)

**Visual Differentiation:**
- Each layer has distinct marker styles:
  - **Flares:** Red/orange flame icons (current style)
  - **Pain:** Yellow/amber lightning bolt icons
  - **Mobility:** Blue restriction/lock icons
  - **Inflammation:** Purple swelling/wave icons
- Marker size indicates severity (1-10 scale)
- Opacity can indicate recency (newer = more opaque)

**Workflow:**
```
1. User navigates to body map
2. Body map loads with last-used layer active (e.g., "Pain")
3. User marks regions as usual
4. [Optional] User switches layer via dropdown if tracking different type
5. Data is saved to the selected layer
```

#### View Mode (Analyzing Data)

**Multi-Layer Visualization:**
- **All Layers View:** See all active markers from all layers simultaneously
  - Each layer uses its distinct visual style
  - Visual legend shows which markers represent which layer
  - Potential for marker overlap (may need smart positioning)

- **Single Layer View:** Filter to show only one layer at a time
  - Cleaner view for analyzing specific condition
  - Useful for tracking trends in one area over time

**Layer Controls:**
- Toggle individual layers on/off
- Slider or checkboxes for layer visibility
- Color legend explaining each layer's markers

**Example View Modes:**
```
┌─────────────────────────────────┐
│ View: [All Layers ▼]            │
│                                 │
│ ☑ Flares (3 active)            │
│ ☑ Pain (5 locations)           │
│ ☐ Mobility (0 restrictions)    │
│ ☑ Inflammation (2 areas)       │
│                                 │
│     [Front Body Map]            │
│   🔥 🔥   ⚡ ⚡ ⚡             │
│     🟣      🟣                  │
└─────────────────────────────────┘
```

## Technical Considerations

### Data Model

**Updated Data Model with AI Extraction:**

```typescript
// Custom layer definition (paid users only)
interface CustomLayer {
  id: string;
  userId: string;
  name: string; // "Migraine Zones", "Eczema Patches", etc.
  icon: string; // Icon identifier or emoji
  color: string; // Hex color code
  isDefault: boolean; // True for predefined layers
  createdAt: Date;
  updatedAt: Date;
}

// Body map marker with AI extraction support
interface BodyMapMarker {
  id: string;
  userId: string;
  layerId: string; // References CustomLayer.id (or predefined layer ID)
  bodyRegionId: string;
  severity: number; // 1-10
  timestamp: Date;

  // User input (always present)
  notes: string;
  coordinates?: { x: number; y: number };

  // AI extraction (paid users only, may be null/undefined)
  extractedData?: Record<string, any>; // Flexible structure
  extractedAt?: Date;
  extractionConfidence?: number; // 0-1 score

  // Status tracking
  status?: 'active' | 'resolved';
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Example extractedData structure (varies by layer and note content)
extractedData: {
  side?: 'left' | 'right' | 'both';
  pain_type?: 'sharp' | 'dull' | 'burning' | 'throbbing' | 'aching';
  triggers?: string[];
  symptoms?: string[];
  timing?: string;
  intensity_change?: 'worse' | 'better' | 'same';
  location_details?: string;
  [key: string]: any; // Flexible for any extracted data
}
```

**Benefits of this approach:**
- Single source of truth for all markers
- Flexible extractedData field supports any AI-discovered patterns
- Works for both predefined and custom layers
- Graceful degradation (extractedData is optional)
- Easy to add new extraction capabilities without schema changes

### IndexedDB Schema Extension

```typescript
// Custom layers table (new)
interface CustomLayerRecord {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

// Updated body map markers table
interface BodyMapMarkerRecord {
  id: string;
  userId: string;
  layerId: string; // References CustomLayerRecord.id
  bodyRegionId: string;
  severity: number;
  timestamp: number;

  // User input
  notes: string;
  coordinates?: string; // JSON stringified

  // AI extraction (paid users)
  extractedData?: string; // JSON stringified Record<string, any>
  extractedAt?: number;
  extractionConfidence?: number;

  // Status
  status?: string;
  resolvedAt?: number;

  createdAt: number;
  updatedAt: number;
}

// Indexes for efficient queries
// customLayers table
[userId]
[userId+isDefault]

// bodyMapMarkers table
[userId+layerId+timestamp]
[userId+timestamp]
[layerId+timestamp]
```

**Migration Strategy:**
1. Create customLayers table
2. Seed with 4 default layers (Flares, Pain, Mobility, Inflammation)
3. Add layerId field to existing markers (default to Flares layer)
4. Create compound indexes
5. No data loss - fully backward compatible

### User Preferences Storage

```typescript
interface BodyMapPreferences {
  userId: string;
  lastUsedLayerId: string; // Last layer used for tracking
  visibleLayerIds: string[]; // Max 5 layers for view mode
  defaultViewMode: 'unified' | 'filtered';
  showExtractedData: boolean; // Show AI-extracted insights (paid users)
}
```

**Notes:**
- `visibleLayerIds` enforces max 5 layers visible simultaneously
- `showExtractedData` controls whether AI insights are displayed inline with markers
- Preferences persist in localStorage and sync to cloud (paid users)

### Component Architecture

**New Components:**
- `LayerSelector.tsx` - Layer dropdown for tracking mode (shows all layers)
- `LayerToggle.tsx` - Multi-toggle for view mode (max 5 visible, enforced)
- `LayerLegend.tsx` - Visual guide showing marker meanings with icons/colors
- `CreateLayerModal.tsx` - UI for creating custom layers (paid users only)
- `ManageLayersPanel.tsx` - Edit/delete/reorder custom layers (paid users)
- `AIInsightsCard.tsx` - Display extracted data from notes (paid users)
- `ExtractedDataBadge.tsx` - Small inline indicator showing AI extracted a pattern

**Modified Components:**
- `BodyMapFront.tsx` / `BodyMapBack.tsx`
  - Accept layerId prop
  - Render markers with layer-specific styling (icon, color)
  - Support multiple visible layers (max 5)
- `BodyMapView.tsx`
  - Manage layer state and filtering
  - Enforce 5-layer display limit
  - Show/hide AI insights toggle (paid users)
- `FlareMarker.tsx` → Generalize to `BodyMapMarker.tsx`
  - Layer-aware rendering (icon, color from layer definition)
  - Show AI-extracted data on click/hover (paid users)
  - Support custom layer markers

**AI Processing:**
- `aiExtractionService.ts` - Background service for extracting structured data
- `aiPromptBuilder.ts` - Generate layer-aware prompts for extraction
- `extractionValidator.ts` - Validate and score AI extraction confidence

### Migration Strategy

**Phase 1: Data Model & Schema (Week 1)**
- Create `customLayers` table in IndexedDB
- Seed 4 default layers (Flares, Pain, Mobility, Inflammation)
- Add `layerId` field to existing markers (migrate to Flares layer)
- Add `extractedData`, `extractedAt`, `extractionConfidence` fields
- Create indexes for efficient layer queries
- Test migration with existing user data

**Phase 2: Basic Layer Support (Week 2)**
- Layer selector component for tracking mode
- Layer toggle component for view mode (max 5 visible)
- Layer-specific marker rendering (icons, colors)
- Layer legend component
- User preferences for last-used layer and visible layers
- Test with 4 predefined layers only

**Phase 3: Custom Layers (Week 3) - PAID FEATURE**
- Create layer modal (name, icon, color)
- Manage layers panel (edit, delete, reorder)
- Paywall UI (show "Unlock custom layers" for free users)
- Icon picker component
- Color picker component
- Test custom layer creation and usage

**Phase 4: AI Extraction (Week 4-5) - PAID FEATURE**
- AI extraction service (background processing)
- Prompt builder (layer-aware prompts)
- Extraction validator (confidence scoring)
- AI insights display components
- Show/hide extracted data toggle
- Choose AI provider (cloud vs local model)
- Test extraction accuracy and performance

**Phase 5: Polish & Analytics (Week 6)**
- Layer-filtered analytics
- Export with extracted data
- Smart pattern suggestions
- Performance optimization
- Comprehensive testing

## User Stories

**US 1: Track Different Conditions**
> As a user with both arthritis flares and general chronic pain,
> I want to track them on separate body map layers,
> So I can distinguish between flare-related pain and baseline pain.

**US 2: Persistent Layer Selection**
> As a daily user who primarily tracks pain,
> I want the pain layer to remain selected between sessions,
> So I don't have to change the layer every time I log.

**US 3: Comprehensive View**
> As a user preparing for a doctor's appointment,
> I want to view all my tracked conditions on the body map at once,
> So I can show my doctor the complete picture of my symptoms.

**US 4: Focused Analysis**
> As a user tracking post-surgery recovery,
> I want to view only the mobility layer,
> So I can see my range of motion improvements over time without distraction.

## Benefits

1. **Reduces Visual Clutter:** Separate conditions on different layers prevents marker overlap
2. **Improves Data Quality:** Users can distinguish between different types of body-area issues
3. **Enhances Analysis:** Layer filtering enables focused trend analysis
4. **Future-Proof:** Scalable architecture for adding new tracking types
5. **User Control:** Flexible view options for different use cases

## Design Considerations

### Visual Design

**Layer Color Palette:**
- Flares: Red/Orange (#EF4444, #F97316) 🔥
- Pain: Yellow/Amber (#EAB308, #F59E0B) ⚡
- Mobility: Blue (#3B82F6, #2563EB) 🔒
- Inflammation: Purple (#A855F7, #9333EA) 🟣

**Accessibility:**
- Icons AND colors for colorblind users
- Markers must be distinguishable when overlapping
- Clear legend with text labels
- Keyboard navigation for layer switching

### Mobile Considerations

- Layer selector should be thumb-friendly
- Markers sized appropriately for touch targets
- Legend collapsible to save screen space
- Consider swipe gestures for layer switching

## Implementation Estimate

**Complexity:** High
**Estimated Effort:** 34-55 story points (split across 2 epics)

### Epic 5.1: Core Layer System (Free Tier)
**Effort:** 13-21 story points

**Story Breakdown:**
1. **Story 5.1.1:** Create customLayers table and seed default layers (3 pts)
2. **Story 5.1.2:** Add layerId field to markers and migrate existing data (3 pts)
3. **Story 5.1.3:** Implement layer preferences and persistence (2 pts)
4. **Story 5.1.4:** Create layer selector component for tracking mode (3 pts)
5. **Story 5.1.5:** Implement layer-aware marker rendering with icons/colors (5 pts)
6. **Story 5.1.6:** Add multi-layer view controls (max 5 visible) (5 pts)
7. **Story 5.1.7:** Create layer legend and accessibility features (3 pts)

### Epic 5.2: Custom Layers + AI Extraction (Paid Tier)
**Effort:** 21-34 story points

**Story Breakdown:**
1. **Story 5.2.1:** Create layer modal (name, icon, color pickers) (5 pts)
2. **Story 5.2.2:** Manage layers panel (edit, delete, reorder) (3 pts)
3. **Story 5.2.3:** Paywall UI and feature gating (2 pts)
4. **Story 5.2.4:** AI extraction service implementation (8 pts)
   - Choose AI provider (cloud vs local)
   - Implement background processing
   - Layer-aware prompt generation
   - Confidence scoring
5. **Story 5.2.5:** AI insights display components (5 pts)
   - ExtractedDataBadge component
   - AIInsightsCard component
   - Show/hide toggle
6. **Story 5.2.6:** Layer-filtered analytics and charts (5 pts)
7. **Story 5.2.7:** Export with AI-extracted data (3 pts)
8. **Story 5.2.8:** Smart pattern suggestions and notifications (3 pts)

**Prerequisites:**
- Epic 3.5 completion (body map stability)
- Cloud Sync implementation (for paid tier features)
- Payment system integration (for feature gating)

## Open Questions - RESOLVED ✅

**Updated:** 2025-11-02

### 1. Should layers be user-configurable?

**Decision:** YES - Unlimited custom layers (paid feature)

- Free users: 4 predefined layers only (Flares, Pain, Mobility, Inflammation)
- Paid users: Can create unlimited custom layers with custom names, icons, and colors
- No artificial limit on number of layers (unless performance issues arise, then consider ~50 limit)
- Users can name layers whatever they want: "Migraine Zones", "Eczema Patches", "Surgery Sites", etc.
- Optional warning at 10+ layers: "Managing many layers can get complex"

### 2. How to handle layer-specific attributes?

**Decision:** AI-Enhanced Notes Approach (Option E)

**Free Users:**
- Simple interface: Severity (1-10) + Notes (free text)
- No AI extraction
- No structured data

**Paid Users:**
- Same simple interface: Severity + Notes
- ✨ **AI extracts structured data from notes in background**
- Works on ALL layers (predefined + custom)
- Extracted data enables analytics and pattern detection

**AI Extraction Details:**
```typescript
// User writes natural language notes
Notes: "Right side, throbbing pain with aura, very light sensitive.
        Started after 3 hours of computer work"

// AI extracts structured data
extractedData: {
  side: "right",
  pain_type: "throbbing",
  aura: true,
  light_sensitivity: "high",
  trigger: "computer work",
  duration_before_logging: "3 hours"
}
```

**Benefits:**
- ✅ Simple UX - users write notes naturally
- ✅ Structured data for analytics (when AI can extract it)
- ✅ No complex form builders or custom field definitions
- ✅ Works for any layer type
- ✅ Graceful degradation (works without AI)
- ✅ Privacy-friendly if using local models

**AI Implementation Considerations:**
- Could use cloud AI (Anthropic/OpenAI) - accurate but costs money
- Could use local model (WebLLM) - free and private but slower
- Extraction happens in background (doesn't block user)
- Show extracted patterns optionally to user for validation
- Part of paid tier justification (AI costs money)

### 3. Should layers have separate history timelines?

**Decision:** Both unified and filtered views

- **Default:** Unified timeline showing all layers mixed together
- **Filter option:** Toggle layers on/off to focus on specific conditions
- Users can view:
  - All layers at once (comprehensive view)
  - Single layer (focused analysis)
  - Any combination of layers

### 4. What's the maximum number of simultaneous layers to display?

**Decision:** UI limit of 5 layers visible at once

- Prevents visual clutter on body map
- Users can still create unlimited layers (paid)
- But can only display max 5 simultaneously in view mode
- Users choose which 5 to show at any given time
- Reasonable limit for mobile and desktop screens

### 5. Should we support layer-to-layer relationships?

**Decision:** Future enhancement (not in initial implementation)

- Skip relationships for MVP to keep it simple
- Consider adding in future version if users request it
- Potential future features:
  - Link markers across layers (e.g., "pain caused by flare")
  - Visualize cause-and-effect relationships
  - AI pattern detection across related layers
- Mark as "nice to have" for post-launch consideration

---

## Monetization & Tiering Strategy

### Free Tier

**Layers:**
- 4 predefined layers only: Flares, Pain, Mobility, Inflammation
- Cannot create custom layers
- Cannot rename predefined layers

**Data Entry:**
- Body region selection
- Severity scale (1-10)
- Notes (free text)

**Features:**
- Basic body map tracking
- View history
- Local storage only
- No AI extraction
- No cross-device sync

### Paid Tier ($10 - Cloud Sync Unlock)

**Layers:**
- 4 predefined layers + unlimited custom layers
- Create custom layers with:
  - Custom names ("Migraine Zones", "Eczema Patches", etc.)
  - Custom icons (choose from icon set)
  - Custom colors (choose from palette)

**Data Entry:**
- Same simple interface as free (severity + notes)
- **AI-powered extraction** from notes:
  - Automatically extracts structured data
  - Works on ALL layers (predefined + custom)
  - Enables smart analytics and pattern detection
  - Suggests potential triggers and correlations

**Features:**
- All free tier features
- ✨ AI extraction on all notes
- Cloud sync across devices
- 100MB storage
- Advanced analytics powered by AI insights
- Smart pattern detection
- Export AI-extracted insights

**Value Proposition:**
- AI extraction costs money to run (justifies paid tier)
- Custom layers provide flexibility for individual needs
- Cloud sync + AI insights = comprehensive health tracking

---

## Related Features

- **Analytics by Layer:** Separate trend charts per layer
- **Layer Comparisons:** Side-by-side view of two layers
- **Layer Annotations:** Notes specific to each layer
- **Export by Layer:** CSV/PDF exports filtered by layer

## References

- Current body map implementation: `src/components/body-map/`
- Flare tracking: Epic 2 (Stories 2.1-2.7)
- Body map foundation: Epic 1 (Stories 1.1-1.6)
- Related: Calendar multi-data visualization (Story 3.5.7)

---

## Appendix: Visual Mockup Descriptions

### Tracking Mode with Layer Selector

```
┌─────────────────────────────────────────┐
│ Track Body Area                         │
├─────────────────────────────────────────┤
│ Layer: [Pain ▼]           Last used: Pain│
│                                         │
│ Select area on body map below:          │
│                                         │
│        ⚡ Left knee (7/10)              │
│        ⚡ Right shoulder (5/10)         │
│                                         │
│     [Front Body Diagram]                │
│                                         │
│ [Mark New Area]  [Switch to: Flares]   │
└─────────────────────────────────────────┘
```

### View Mode with Multi-Layer Toggle

```
┌─────────────────────────────────────────┐
│ Body Map - All Layers View              │
├─────────────────────────────────────────┤
│ Show Layers:                            │
│ ☑ Flares (3)  ☑ Pain (5)  ☐ Mobility   │
│                                         │
│ Legend:                                 │
│ 🔥 Flares   ⚡ Pain   🔒 Mobility       │
│                                         │
│     [Body Diagram with Mixed Markers]   │
│         🔥                              │
│      ⚡  ⚡                              │
│   🔥                                    │
│      ⚡  ⚡                              │
│         ⚡                              │
│                                         │
│ [View Details] [Export] [Filter Dates]  │
└─────────────────────────────────────────┘
```

---

**Status:** Documented for future consideration
**Next Step:** Review and prioritize in backlog refinement session
**Contact:** Document created during Story 3.5.7 workflow session
