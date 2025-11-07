# symptom-tracker UX Design Specification

_Created on 2025-11-07 by Steven_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

**Project:** symptom-tracker - Precision health tracking for chronic skin conditions (Hidradenitis Suppurativa)

**Vision:** Transform the symptom tracker from a functional logging tool into an intelligent health companion that provides personalized insights, predictive analytics, and holistic pattern recognition across flares, sleep, mood, and lifestyle factors.

**Target Users:** People managing chronic skin conditions who need:
- Medical-grade precision tracking for flares and symptoms
- Correlation insights between sleep, mood, and flare patterns
- Intelligent analytics that surface actionable insights
- Seamless daily tracking that doesn't feel like work

**Platform:** Progressive Web App (PWA) - Mobile-first, offline-capable, privacy-first architecture

**Current State:** Functional but fragmented - separate tracking for mood/sleep/flares needs holistic integration

**UX Transformation Goals:**
1. **Unified Daily Experience** - Consolidate mood, sleep, and symptom tracking into one intuitive daily check-in
2. **Intelligent Analytics Hub** - Surface correlations, predictions, and treatment effectiveness insights
3. **Reorganized Navigation** - Clear information architecture: Track → Insights → Manage
4. **Enhanced Body Map** - More realistic anatomical representation with gender/body-type options
5. **Exciting Insights** - Make analytics feel personal, predictive, and actionable (not just charts)

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Decision: Keep Current Stack + Add shadcn/ui Components**

**Current Stack (Keep):**
- Next.js 15.5.4 + React 19.1.0 (Modern, performant)
- Tailwind CSS 4 (Utility-first styling)
- Radix UI primitives (Accessibility built-in)
- Lucide React icons (Consistent iconography)

**Enhancement: Integrate shadcn/ui**

shadcn/ui is NOT a component library - it's a collection of re-usable components built with Radix UI + Tailwind CSS that you copy into your project. This is PERFECT for your stack because:

✅ **You're already 90% compatible** - Using Radix UI + Tailwind
✅ **No new dependencies** - Just adds utility components
✅ **Customizable** - Copy-paste components you can modify
✅ **Accessibility** - Built on Radix primitives (same as you have)
✅ **Modern design** - Beautiful defaults that feel professional

**Components to Add:**
- `Dialog` - Better modals for flare creation
- `Sheet` - Sidebar/drawer for mobile body map
- `Card` - Consistent card styling for flares/insights
- `Badge` - Status indicators (worsening, improving, stable)
- `Tabs` - Health Insights sections
- `Select` - Dropdowns for time ranges, filters
- `Calendar` - Enhanced timeline view
- `Chart` - Recharts integration for analytics

**Implementation:**
```bash
npx shadcn@latest init
npx shadcn@latest add dialog sheet card badge tabs select calendar
```

**Design Tokens (Keep Existing):**
- Primary: `#0F9D91` (Calm teal)
- Success: `#86EFAC` (Soft green)
- Warning: `#FBBF24` (Soft amber)
- Error: `#FCA5A5` (Soft red)
- Background: `#F5F5F4` (Muted)

**Rationale:**
- No framework migration needed (SvelteKit would be a massive rewrite)
- shadcn/ui provides modern components that match your aesthetic
- Maintains accessibility standards
- Production-ready and well-documented

---

## 2. Navigation Structure Redesign

### 2.1 Current Problems

**Issues Identified:**
1. "Flares" doesn't cover body map layers functionality
2. Mood and Sleep isolated - no connection to insights
3. "MANAGE" section confusing (Manage Data vs Settings both manage data)
4. Analytics page broken/outdated
5. body-map-analysis exists but NO nav link
6. No clear path to correlation insights

### 2.2 New Information Architecture

**Principle: Track → Insights → Manage**

```
TRACK (Daily Inputs - Make it effortless)
├─ Dashboard           (Today's snapshot with quick actions)
├─ Daily Log          (Unified: mood + sleep + quick notes)
├─ Body Map           (Precision flare tracking with layers)
└─ Photos             (Visual documentation)

INSIGHTS (The Magic - Where excitement happens)
├─ Health Insights    (🎯 YOUR personalized analytics hub)
│   ├─ Key Patterns (sleep×flares, mood×symptoms)
│   ├─ Flare Analytics (problem areas, trends)
│   ├─ Correlation Matrix (what affects what)
│   └─ Treatment Effectiveness
├─ Timeline           (Calendar with pattern highlighting)
└─ [Flare Details]    (Dynamic - appears when clicking a flare)

MANAGE (Customization & Data)
├─ My Data            (Customize tracked items)
├─ Export & Sharing   (PDF reports, data export)
└─ Settings & Privacy

SUPPORT
└─ Help & About
```

### 2.3 Navigation Changes Mapping

| Old Path | New Path | Rationale |
|----------|----------|-----------|
| `/flares` | `/body-map` | Better describes functionality |
| `/mood` | `/daily-log` (section) | Unified daily tracking |
| `/sleep` | `/daily-log` (section) | Unified daily tracking |
| `/analytics` | `/insights` | Renamed + completely redesigned |
| `/body-map-analysis` | `/insights/flare-analytics` | Integrated into hub |
| `/manage` | `/my-data` | Clearer naming |
| `/calendar` | `/timeline` | More descriptive |

### 2.4 Mobile Bottom Nav (4 items max)

```
┌─────────────────────────────────────┐
│  [🏠 Track] [📊 Insights] [⚙️ Manage] [ℹ️ Help] │
└─────────────────────────────────────┘
```

**Track opens to:** Dashboard (with quick access to Daily Log, Body Map)
**Insights opens to:** Health Insights hub
**Manage opens to:** My Data page
**Help opens to:** Help center

## 3. Core User Experience

### 3.1 The Defining Experience: Intelligent Health Companion

**Core Experience:** "The app that understands me and helps me understand my condition"

Unlike basic symptom trackers that just log data, this app:
1. **Connects the dots** - Shows how sleep affects flares, how mood predicts symptoms
2. **Predicts patterns** - "Your mood dropped yesterday - watch for new flares in 24-48hrs"
3. **Personalizes insights** - "For YOU, ice packs improve recovery by 45%"
4. **Makes tracking effortless** - One daily check-in instead of scattered forms

**The Magic Moment:** When a user sees "Your flares increase 2.3× after nights with <6 hours sleep" and realizes they can DO SOMETHING about it.

### 3.2 Novel UX Patterns

**Pattern 1: Unified Daily Log**
- **Novel Approach:** Single-page daily reflection combining mood, sleep, flares, and notes
- **Why Different:** Most health apps separate these into different sections/pages
- **User Benefit:** One daily habit instead of multiple disconnected tasks
- **Implementation:** Collapsible sections with smart defaults from yesterday

**Pattern 2: Predictive Insight Cards**
- **Novel Approach:** AI-style insights that surface correlations automatically
- **Why Different:** Most apps show raw charts - users have to find patterns themselves
- **User Benefit:** "Wow, I never noticed that connection!"
- **Implementation:** Correlation engine runs nightly, surfaces top 3 insights

**Pattern 3: Interactive Body Map with Historical Layers**
- **Novel Approach:** Toggle to see past flare markers overlaid on current map
- **Why Different:** Most body maps show only current state
- **User Benefit:** Visual pattern recognition - "My left groin always flares"
- **Implementation:** Layer toggle with time-based filtering

**Pattern 4: Treatment Effectiveness Tracker**
- **Novel Approach:** Automatically correlates interventions with recovery time
- **Why Different:** Users typically have to manually remember what helped
- **User Benefit:** Evidence-based treatment decisions
- **Implementation:** Link interventions to flare updates, calculate correlation

---

## 4. Daily Log - Unified Tracking Interface

### 4.1 Design Rationale

**Problem:** Current app has separate pages for mood (`/mood`), sleep (`/sleep`), with no daily reflection mechanism. This creates:
- No holistic view of the day
- Mood and sleep data disconnected from flare patterns
- Missed correlations (data isn't aggregated daily)

**Solution:** NEW Daily Log page for end-of-day reflection (mood, sleep, notes) that complements existing event-based tracking.

### 4.2 Architecture: Daily Log vs. Quick Actions

**IMPORTANT DISTINCTION:**

**Quick Actions (Existing - KEEP)** → Event-based tracking throughout the day:
- `/log/food` - Log meals multiple times per day → `db.foodEvents` (timestamped)
- `/log/medication` - Log meds as taken → `db.medicationEvents` (timestamped)
- `/log/symptom` - Log symptoms when they occur → `db.symptomInstances` (timestamped)
- `/log/trigger` - Log triggers when encountered → `db.triggerEvents` (timestamped)
- Body map - Mark/update flares anytime → `db.flares` (ongoing updates)

**Daily Log (NEW)** → End-of-day reflection (once per day):
- Overall mood for the day → `db.dailyLogs.mood` (1-5 scale)
- Sleep from last night → `db.dailyLogs.sleepHours`, `sleepQuality`
- General notes about the day → `db.dailyLogs.notes`
- Quick flare status updates → `db.dailyLogs.flareUpdates`

**Data Flow:**

```typescript
// THROUGHOUT THE DAY: Event-based tracking
// User clicks "Log Food" on Dashboard → /log/food
await db.foodEvents.add({
  userId,
  foodId,
  timestamp: Date.now() // 8:00 AM breakfast
});

// Later...
await db.foodEvents.add({
  userId,
  foodId,
  timestamp: Date.now() // 12:00 PM lunch
});

// END OF DAY: Daily reflection
// User visits /daily-log and fills out daily summary
await db.dailyLogs.add({
  userId,
  date: '2025-11-07',
  mood: 4, // Good
  sleepHours: 7.5,
  sleepQuality: 3,
  notes: 'Felt tired all day...',
  flareUpdates: [/* quick status updates */]
});
```

**Dashboard Integration:**

The Dashboard KEEPS its Quick Actions card for event logging:

```
┌─────────────────────────────────────┐
│  Quick Actions                       │
├─────────────────────────────────────┤
│  [🔥 Mark Flare] [💊 Log Med]       │
│  [🍽️ Log Food] [⚠️ Log Trigger]     │
│  [🤒 Log Symptom]                    │
└─────────────────────────────────────┘
```

Plus adds a new "End of Day" prompt:

```
┌─────────────────────────────────────┐
│  Daily Reflection                    │
├─────────────────────────────────────┤
│  Haven't logged today's Daily Log   │
│  [Complete Daily Log →]              │
└─────────────────────────────────────┘
```

### 4.3 Daily Log UX Flow

**URL:** `/daily-log` or `/track/daily`

**Mobile Layout (Primary):**

```
┌─────────────────────────────────────────────┐
│  Thursday, November 7 2025          [ ← Today │
│  ─────────────────────────────────────────────┤
│                                               │
│  💭 Overall mood today?                       │
│  ┌───────────────────────────────────────┐   │
│  │ [😊] [🙂] [😐] [😟] [😢]             │   │
│  │  Great Good  Okay  Poor  Bad            │   │
│  └───────────────────────────────────────┘   │
│  Current: 🙂 Good                             │
│                                               │
│  😴 Sleep last night?                         │
│  ┌───────────────────────────────────────┐   │
│  │  Hours: [7.5]    Quality: ⭐⭐⭐☆☆    │   │
│  └───────────────────────────────────────┘   │
│                                               │
│  🔥 Active Flares (3)                         │
│  ┌───────────────────────────────────────┐   │
│  │  Left groin - Severity 7 ↗ Worsening   │   │
│  │  [Quick Update] [Add Note]              │   │
│  ├───────────────────────────────────────┤   │
│  │  Right armpit - Severity 4 → Stable    │   │
│  │  [Quick Update] [Add Note]              │   │
│  └───────────────────────────────────────┘   │
│  + Mark new flare on body map                 │
│                                               │
│  📝 General notes about today                 │
│  ┌───────────────────────────────────────┐   │
│  │  Felt tired all day, think poor sleep  │   │
│  │  affected my mood...                    │   │
│  └───────────────────────────────────────┘   │
│                                               │
│  ▼ Today's Tracked Items (Summary)            │
│  ─────────────────────────────────────────────│
│  🍽️ Foods: 3 logged       [View/Add more →]  │
│  💊 Meds: 2 taken          [View/Add more →]  │
│  🤒 Symptoms: 1 logged     [View/Add more →]  │
│  ⚠️ Triggers: 0 logged     [Add trigger →]    │
│  ──────────────────────────────────────────── │
│  [Save Daily Log]                             │
└─────────────────────────────────────────────┘
```

**How "View/Add more →" Links Work:**
- Click "Foods: 3 logged [View/Add more →]" → Navigate to `/log/food`
- User adds more food entries (each with timestamp)
- Return to `/daily-log` → Count updates to "Foods: 4 logged"
- Same pattern for medications, symptoms, triggers

**Key Features:**
1. **End-of-Day Reflection** - Mood, sleep, and overall notes in one place
2. **Smart Defaults** - Pre-fills with yesterday's values for faster input
3. **Flare Quick Update** - Update existing flares without leaving page
4. **Event Summary** - See what you logged today with links to add more
5. **Offline-First** - Works without network, syncs later

### 4.4 Daily Log Components

**Mood Selector Component**
```tsx
// EmoticonMoodSelector.tsx
<div className="flex gap-3 justify-center">
  {[
    { value: 5, emoji: '😊', label: 'Great' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 2, emoji: '😟', label: 'Poor' },
    { value: 1, emoji: '😢', label: 'Bad' }
  ].map(mood => (
    <button
      key={mood.value}
      onClick={() => setMood(mood.value)}
      className={cn(
        "w-16 h-16 rounded-full flex flex-col items-center justify-center",
        "transition-all hover:scale-110",
        selected === mood.value ? "bg-primary text-white ring-2 ring-primary" : "bg-muted"
      )}
    >
      <span className="text-2xl">{mood.emoji}</span>
      <span className="text-xs">{mood.label}</span>
    </button>
  ))}
</div>
```

**Sleep Quality Component**
```tsx
// SleepQualityInput.tsx
<div className="space-y-3">
  <div>
    <label>Hours of Sleep</label>
    <input type="number" step="0.5" min="0" max="24" />
  </div>
  <div>
    <label>Sleep Quality</label>
    <StarRating value={quality} onChange={setQuality} max={5} />
  </div>
</div>
```

### 4.5 Daily Log Data Model

```typescript
// NEW table for daily reflection
interface DailyLog {
  id: string;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD) - one per day

  // Daily reflection (once per day)
  mood: 1 | 2 | 3 | 4 | 5; // Bad to Great
  sleepHours: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5; // Stars
  notes: string; // General notes about the day

  // Quick flare updates (optional)
  flareUpdates?: Array<{
    flareId: string;
    severity: number;
    trend: 'improving' | 'stable' | 'worsening';
    interventions?: string[];
    notes?: string;
  }>;

  createdAt: number;
  updatedAt: number;
}

// EXISTING tables (continue to use for event tracking)
// db.foodEvents - Multiple entries per day with timestamps
// db.medicationEvents - Multiple entries per day with timestamps
// db.symptomInstances - Multiple entries per day with timestamps
// db.triggerEvents - Multiple entries per day with timestamps
```

## 5. Health Insights Hub - Analytics That Excite

### 5.1 Design Philosophy

**Goal:** Make users say "WOW!" when they see their data

**Principles:**
1. **Insights, not charts** - Tell them what it means, don't make them figure it out
2. **Personalized** - "For YOU..." not generic population stats
3. **Actionable** - Always include "What you can do about it"
4. **Visual** - Beautiful charts that tell a story
5. **Progressive** - Surface most important insights first

### 5.2 Health Insights Page Layout

**URL:** `/insights` or `/insights/health`

```
┌─────────────────────────────────────────────────────┐
│  Health Insights                [Last 90 days ▼]     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  🎯 Your Top Insights                                │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  ⚠️ STRONG CORRELATION DETECTED                │ │
│  │                                                 │ │
│  │  Poor sleep significantly increases flares     │ │
│  │  ──────────────────────────────────────────── │ │
│  │  Your flares increase 2.3× after nights with  │ │
│  │  less than 6 hours of sleep                    │ │
│  │                                                 │ │
│  │  [Chart: Sleep hours vs New flares scatter]    │ │
│  │                                                 │ │
│  │  💡 What you can do:                           │ │
│  │  Try to get 7-8 hours of sleep. Your data     │ │
│  │  shows flares drop 67% with better sleep.     │ │
│  │                                                 │ │
│  │  [View full sleep analysis →]                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  📉 PREDICTIVE INDICATOR                       │ │
│  │                                                 │ │
│  │  Mood drops before flares appear               │ │
│  │  ──────────────────────────────────────────── │ │
│  │  Your mood drops to "Poor" an average of      │ │
│  │  1.2 days BEFORE new flares start             │ │
│  │                                                 │ │
│  │  [Chart: Mood timeline with flare markers]     │ │
│  │                                                 │ │
│  │  💡 Early warning:                             │ │
│  │  If your mood drops unexpectedly, prepare     │ │
│  │  for potential flares in the next 24-48hrs    │ │
│  │                                                 │ │
│  │  [Enable mood-based alerts →]                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  📊 Flare Analytics                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │  Problem Areas (Most frequent flares)          │ │
│  │  ──────────────────────────────────────────── │ │
│  │  1. Left groin        12 flares  [View heat map]│ │
│  │  2. Right armpit       8 flares               │ │
│  │  3. Inner thigh left   6 flares               │ │
│  │                                                 │ │
│  │  [Interactive body heat map →]                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  📈 Trend Over Time                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │  Your condition is IMPROVING! 🎉               │ │
│  │                                                 │ │
│  │  Flare frequency down 23% vs last 90 days     │ │
│  │  Average severity down from 7.2 to 5.8        │ │
│  │                                                 │ │
│  │  [Chart: Flare count over time - downward trend]│ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  💊 Treatment Effectiveness                           │
│  ┌────────────────────────────────────────────────┐ │
│  │  What helps when you do it:                    │ │
│  │  ──────────────────────────────────────────── │ │
│  │  ✅ Ice packs       +45% faster recovery       │ │
│  │  ✅ 8hrs sleep      -67% new flares            │ │
│  │  ✅ Warm compress   +32% pain relief           │ │
│  │  ⚠️ High stress     +89% chance of worsening   │ │
│  │                                                 │ │
│  │  Based on 47 tracked interventions             │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 5.3 Correlation Algorithm Design

**Core Algorithm: Spearman Rank Correlation**

```typescript
// lib/analytics/correlationEngine.ts

interface CorrelationResult {
  factor1: string; // e.g., "sleep_hours"
  factor2: string; // e.g., "new_flares_count"
  coefficient: number; // -1 to 1
  pValue: number; // statistical significance
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative';
  insight: string; // Human-readable explanation
  recommendation: string; // Actionable advice
}

async function calculateCorrelations(userId: string, timeRange: number): Promise<CorrelationResult[]> {
  // 1. Get all daily logs for time range
  const dailyLogs = await db.dailyLogs
    .where('[userId+date]')
    .between([userId, getStartDate(timeRange)], [userId, new Date()])
    .toArray();

  // 2. Get all flare events in time range
  const flares = await db.flares
    .where('[userId+startDate]')
    .between([userId, getStartDate(timeRange)], [userId, new Date()])
    .toArray();

  // 3. Create daily metrics array
  const dailyMetrics = dailyLogs.map(log => ({
    date: log.date,
    sleepHours: log.sleepHours,
    sleepQuality: log.sleepQuality,
    mood: log.mood,
    newFlares: countNewFlaresOnDate(flares, log.date),
    worseningFlares: countWorseningFlares(flares, log.date),
    totalActiveSeverity: sumActiveFlareSeverity(flares, log.date)
  }));

  // 4. Calculate correlations
  const correlations: CorrelationResult[] = [];

  // Sleep hours × New flares
  const sleepFlareCorr = spearmanCorrelation(
    dailyMetrics.map(d => d.sleepHours),
    dailyMetrics.map(d => d.newFlares)
  );

  if (Math.abs(sleepFlareCorr.coefficient) > 0.3 && sleepFlareCorr.pValue < 0.05) {
    correlations.push({
      factor1: 'sleep_hours',
      factor2: 'new_flares',
      coefficient: sleepFlareCorr.coefficient,
      pValue: sleepFlareCorr.pValue,
      strength: getStrength(sleepFlareCorr.coefficient),
      direction: sleepFlareCorr.coefficient > 0 ? 'positive' : 'negative',
      insight: generateInsight('sleep', 'flares', sleepFlareCorr),
      recommendation: generateRecommendation('sleep', sleepFlareCorr)
    });
  }

  // Mood × Flare prediction (lagged correlation)
  const moodPredictiveCorr = laggedCorrelation(
    dailyMetrics.map(d => d.mood),
    dailyMetrics.map(d => d.newFlares),
    lag: 1 // Check if mood yesterday predicts flares today
  );

  // ... more correlations

  return correlations.sort((a, b) =>
    Math.abs(b.coefficient) - Math.abs(a.coefficient)
  );
}

function generateInsight(factor1: string, factor2: string, corr: Correlation): string {
  if (factor1 === 'sleep' && factor2 === 'flares') {
    if (corr.coefficient < -0.5) {
      return `Your flares increase ${calculateMultiplier(corr)}× after nights with less than 6 hours of sleep`;
    }
  }
  // ... more insight generators
}
```

**Key Correlation Pairs to Track:**
1. Sleep hours × New flares (negative correlation expected)
2. Sleep quality × Flare severity
3. Mood × New flares (lagged - mood predicts future flares)
4. Stress level × Worsening flares
5. Interventions × Recovery time
6. Food triggers × Flare onset
7. Medication adherence × Flare frequency

### 5.4 Treatment Effectiveness Algorithm

```typescript
async function calculateTreatmentEffectiveness(userId: string) {
  const flares = await getResolvedFlares(userId);

  const interventionStats = new Map<string, {
    timesUsed: number;
    avgRecoveryTime: number;
    avgSeverityReduction: number;
  }>();

  for (const flare of flares) {
    for (const update of flare.severityHistory) {
      if (update.interventions && update.interventions.length > 0) {
        for (const intervention of update.interventions) {
          // Track how quickly severity dropped after this intervention
          const nextUpdate = getNextUpdate(flare, update);
          if (nextUpdate) {
            const severityDrop = update.severity - nextUpdate.severity;
            const timeDelta = nextUpdate.timestamp - update.timestamp;

            updateInterventionStats(intervention, severityDrop, timeDelta);
          }
        }
      }
    }
  }

  return Array.from(interventionStats.entries())
    .map(([intervention, stats]) => ({
      intervention,
      effectiveness: calculateEffectivenessScore(stats),
      confidence: stats.timesUsed >= 5 ? 'high' : 'low',
      ...stats
    }))
    .sort((a, b) => b.effectiveness - a.effectiveness);
}
```

## 6. Body Map Enhancements

### 6.1 Current State Assessment

**Current Body Map SVG:**
- Simple geometric shapes (ellipses, rectangles)
- Functional but not anatomically detailed
- ViewBox: 400×800 pixels
- Already includes groin regions (left, center, right)
- Gender-neutral representation

**Enhancement Needs:**
1. More realistic human silhouette
2. Gender-specific options (male/female anatomies)
3. Body type variations (standard, larger body types)
4. Improved visual appeal

### 6.2 Enhanced Body Map Design

**Approach: Scalable Anatomical SVGs**

**Gender & Body Type Options:**

```typescript
type BodyGender = 'female' | 'male' | 'neutral';
type BodyType = 'standard' | 'plus-size' | 'athletic';

interface BodyMapSettings {
  gender: BodyGender;
  bodyType: BodyType;
  skinTone?: 'light' | 'medium' | 'dark'; // Optional future enhancement
}
```

**UI for Body Map Settings:**

```
┌─────────────────────────────────────────┐
│  Body Map Settings              [⚙️]    │
├─────────────────────────────────────────┤
│                                          │
│  Customize for better representation:   │
│                                          │
│  Gender representation:                  │
│  ○ Female  ○ Male  ● Neutral             │
│                                          │
│  Body type:                              │
│  ● Standard  ○ Plus-size  ○ Athletic     │
│                                          │
│  [Save Preferences]                      │
└─────────────────────────────────────────┘
```

**Why This Matters:**
- **Inclusivity** - Users see themselves represented
- **Accuracy** - Different anatomies affect flare locations (e.g., breast area flares)
- **Comfort** - Users track sensitive areas more accurately when representation feels right

### 6.3 Enhanced SVG Implementation

**Strategy: Multiple SVG variants + Smart Selection**

```typescript
// components/body-mapping/EnhancedBodyMap.tsx
function EnhancedBodyMap({ view, gender, bodyType }: Props) {
  const BodyComponent = useMemo(() => {
    const key = `${view}-${gender}-${bodyType}`;

    switch(key) {
      case 'front-female-standard': return FrontBodyFemaleStandard;
      case 'front-female-plus-size': return FrontBodyFemalePlus;
      case 'front-male-standard': return FrontBodyMaleStandard;
      case 'front-neutral-standard': return FrontBodyNeutral; // Current
      // ... more variants
      default: return FrontBodyNeutral;
    }
  }, [view, gender, bodyType]);

  return <BodyComponent {...props} />;
}
```

**Phased Implementation:**

**Phase 1: Enhanced Neutral Body (Quick Win)**
- Improve current SVG with more realistic proportions
- Smoother curves, better anatomy
- Keep existing regions, improve visual appeal

**Phase 2: Gender Options**
- Female variant (breast-specific regions, different proportions)
- Male variant (different shoulder/hip ratio)
- Neutral remains default

**Phase 3: Body Type Variations**
- Plus-size variants (larger region areas, different proportions)
- Athletic variants (if needed)

**Sample Enhanced SVG (Female Front Body - Chest Region):**

```svg
<!-- Enhanced chest region for female anatomy -->
<g id="chest-female">
  <!-- Left breast with realistic curve -->
  <path
    id="breast-left"
    d="M150,185 Q140,195 145,210 Q150,220 165,215 Q175,210 175,200 Q175,185 165,185 Z"
    className="body-region"
  />

  <!-- Under-breast area (common flare location for HS) -->
  <path
    id="under-breast-left"
    d="M145,215 Q150,225 165,220 Q170,215 165,215 Z"
    className="body-region sensitive-area"
  />
</g>
```

**Region Differences by Gender:**

| Region | Neutral | Female | Male |
|--------|---------|--------|------|
| Chest | Generic ellipses | Breast-specific paths | Pectoral emphasis |
| Groin | 3 ellipses | Pubic fold, inner thigh emphasis | Standard 3-region |
| Armpit | Standard | May be more sensitive area | Standard |
| Hip | Standard | Wider proportions | Narrower |

### 6.4 Body Map Settings Storage

```typescript
// lib/db/schema.ts
interface UserSettings {
  id: string;
  userId: string;

  bodyMapSettings: {
    gender: 'female' | 'male' | 'neutral';
    bodyType: 'standard' | 'plus-size' | 'athletic';
  };

  // ... other settings
}
```

## 7. Timeline (Enhanced Calendar)

### 7.1 Problems with Current Calendar

**Issues:**
- Probably just a data grid without pattern recognition
- No multi-dimensional view (can't see mood + sleep + flares together)
- No pattern highlighting
- Not actionable

### 7.2 Timeline Redesign: Pattern-Aware Calendar

**URL:** `/timeline` (renamed from `/calendar`)

**Design Philosophy:** Show correlations visually on the timeline

```
┌────────────────────────────────────────────────────┐
│  Health Timeline - November 2025    [◀ Oct | Dec ▶]│
├────────────────────────────────────────────────────┤
│                                                     │
│  Layers: [✓ Flares] [✓ Mood] [✓ Sleep] [ Meds]    │
│                                                     │
│  Mo   Tu   We   Th   Fr   Sa   Su                  │
│                                                     │
│       1     2    3    4     5    6    7             │
│       💤  🔴🔴 🔴   😊    😊   😊                    │
│            😟  😟   🙂    🙂   🙂                    │
│            5h  5.5h  7h    8h   8h                   │
│                                                     │
│   8    9    10   11   12   13   14                  │
│  🟡  →    →   ✅   ✅   😊   😊                      │
│  😐  🙂   🙂   😊   😊   😊   😊                    │
│  7h  7.5h 8h   8h   7.5h 8h   8h                     │
│                                                     │
│  Legend:                                            │
│  🔴 = New flare | 🟡 = Worsening | → = Stable       │
│  ✅ = Improving | 😊😐😟 = Mood | 💤 = Poor sleep    │
│                                                     │
│  📊 Pattern Detected:                               │
│  ┌──────────────────────────────────────────────┐  │
│  │ Poor sleep (Nov 1-2) → New flares (Nov 2-3)  │  │
│  │ Better sleep (Nov 5+) → Flares improving     │  │
│  │                                               │  │
│  │ [View correlation analysis →]                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  [Tap any day to see details]                      │
└────────────────────────────────────────────────────┘
```

**Interactive Features:**

1. **Layer Toggle** - Show/hide mood, sleep, flares, medications
2. **Pattern Detection** - Highlight correlation sequences
3. **Day Detail View** - Tap any day to see full daily log
4. **Export for Doctor** - Generate printable monthly summary

### 7.3 Day Detail Modal

When user taps a day:

```
┌────────────────────────────────────┐
│  Thursday, November 7 2025    [✕]  │
├────────────────────────────────────┤
│                                     │
│  Mood: 🙂 Good                      │
│  Sleep: 7.5 hours | Quality ⭐⭐⭐  │
│                                     │
│  Active Flares (3):                 │
│  • Left groin - Severity 6 (↗)     │
│  • Right armpit - Severity 4 (→)   │
│  • Inner thigh - Severity 3 (✅)   │
│                                     │
│  Medications:                       │
│  • Ibuprofen 400mg                  │
│                                     │
│  Notes:                             │
│  Felt tired all day, think poor    │
│  sleep affected my mood...          │
│                                     │
│  [Edit Day] [View Body Map]         │
└────────────────────────────────────┘
```

## 8. Implementation Roadmap

### 8.1 Phase 1: Navigation & Structure (Week 1-2)

**Tasks:**
1. Update navigation config (rename paths, reorganize)
2. Create `/daily-log` page structure
3. Create `/insights` page structure
4. Create `/timeline` page (renamed calendar)
5. Update mobile bottom nav to 4 items
6. Add shadcn/ui components

**Deliverables:**
- New nav structure live
- Empty page shells created
- shadcn/ui integrated

### 8.2 Phase 2: Daily Log Implementation (Week 3-4)

**Tasks:**
1. Build EmoticonMoodSelector component
2. Build SleepQualityInput component
3. Build FlareQuickUpdate component
4. Create DailyLog data model & Dexie schema
5. Implement unified save logic
6. Migrate existing mood/sleep data

**Deliverables:**
- Functional Daily Log page
- Data migration complete
- Old /mood and /sleep deprecated

### 8.3 Phase 3: Correlation Engine (Week 5-6)

**Tasks:**
1. Implement Spearman correlation algorithm
2. Build correlation calculation service
3. Create insight generation logic
4. Build treatment effectiveness tracker
5. Add nightly background calculation job

**Deliverables:**
- Working correlation engine
- Insights generated from user data

### 8.4 Phase 4: Health Insights UI (Week 7-8)

**Tasks:**
1. Build InsightCard component
2. Create correlation scatter plots
3. Build FlareAnalytics heat map
4. Create treatment effectiveness display
5. Implement time range selector

**Deliverables:**
- Complete Health Insights page
- Beautiful, actionable visualizations

### 8.5 Phase 5: Body Map Enhancements (Week 9-10)

**Tasks:**
1. Create enhanced neutral SVG
2. Build gender/body-type selector
3. Create female variant SVG
4. Create male variant SVG
5. Implement body map settings storage
6. Add body type variants (optional)

**Deliverables:**
- Enhanced body map visuals
- Gender/body-type customization

### 8.6 Phase 6: Timeline Redesign (Week 11-12)

**Tasks:**
1. Build multi-layer timeline view
2. Implement pattern detection highlighting
3. Create day detail modal
4. Add export for doctor feature
5. Build month-to-month navigation

**Deliverables:**
- Interactive timeline with patterns
- Export functionality

### 8.7 Phase 7: Polish & Testing (Week 13-14)

**Tasks:**
1. Comprehensive testing
2. Accessibility audit
3. Performance optimization
4. Mobile responsiveness check
5. User feedback integration

**Deliverables:**
- Production-ready app
- All features tested and polished

---

## 9. Summary & Next Steps

### 9.1 UX Transformation Complete

This UX Design Specification provides a complete blueprint for transforming symptom-tracker from a functional logging tool into an intelligent health companion.

**Key Transformations:**

| Aspect | Before | After |
|--------|--------|-------|
| **Navigation** | Fragmented (Flares, Mood, Sleep separate) | Unified (Track → Insights → Manage) |
| **Tracking** | Multiple pages, scattered inputs | Single Daily Log page |
| **Analytics** | Broken/basic charts | Intelligent correlation insights |
| **Body Map** | Functional but simple | Gender/body-type variants |
| **Calendar** | Basic data grid | Pattern-aware Timeline |
| **Value Prop** | "Track your symptoms" | "Understand your condition" |

### 9.2 What Makes This Exciting

**For Users:**
1. **One daily habit** instead of scattered forms
2. **"WOW" insights** - "Your flares increase 2.3× after poor sleep!"
3. **Predictive alerts** - Mood drops signal incoming flares
4. **Evidence-based** - Know what actually helps (ice packs +45%)
5. **Personalized representation** - See yourself in the body map

**For Go-Live:**
- All issues resolved (navigation confusion, broken analytics, missing links)
- Modern, professional UI (shadcn/ui components)
- Competitive differentiator (correlation engine is unique)
- Medical-grade accuracy with consumer-friendly experience

### 9.3 Implementation Priority

**Must-Have for Go-Live:**
1. ✅ Navigation restructure (quick, high impact)
2. ✅ shadcn/ui integration (polish)
3. ✅ Daily Log MVP (unified tracking)
4. ✅ Basic Health Insights (top 3 correlations)
5. ✅ Timeline with layers (pattern visualization)

**Nice-to-Have Post-Launch:**
- Advanced correlation algorithms
- Body map gender/body-type variants
- Treatment effectiveness deep-dive
- Export for doctor (PDF reports)

### 9.4 Technical Feasibility

**Low Risk (Existing Patterns):**
- Navigation changes (config file updates)
- Daily Log page (similar to existing logging)
- shadcn/ui components (drop-in replacements)

**Medium Risk (New Patterns):**
- Correlation engine (statistical algorithms)
- Health Insights UI (new visualizations)
- Timeline multi-layer view (complex state)

**High Risk (Requires Research):**
- Predictive alerts (notification system)
- Body map SVG variants (design resources)

### 9.5 Resource Requirements

**Design:**
- Enhanced body map SVG illustrations (consider outsourcing to medical illustrator)
- shadcn/ui theme customization (can use defaults initially)

**Development:**
- 14 weeks total (see Implementation Roadmap)
- Can be parallelized (frontend + correlation engine simultaneously)
- Phased rollout possible (launch nav + daily log first, add insights incrementally)

**Testing:**
- Accessibility audit (WCAG 2.1 AA compliance)
- Mobile responsiveness across devices
- Correlation algorithm validation (statistical significance)

### 9.6 Success Metrics

**Engagement:**
- Daily Log completion rate (target: >70%)
- Time to complete daily check-in (target: <2 minutes)
- Feature adoption (insights page views, timeline usage)

**Value:**
- Users reporting "discovered new pattern" (qualitative)
- Treatment adherence improvement (if trackable)
- Doctor visit preparation (export usage)

**Technical:**
- Page load times <2s
- Offline functionality 100%
- Correlation accuracy (statistical validation)

---

## 10. Interactive Deliverables

This UX Design Specification includes interactive HTML mockups demonstrating the key design concepts:

- **Health Insights Hub Mockup**: [ux-health-insights-demo.html](./ux-health-insights-demo.html)
- **Daily Log Interface Mockup**: [ux-daily-log-demo.html](./ux-daily-log-demo.html)
- **Navigation Structure Preview**: See mockups above

### 10.1 How to Use the Mockups

1. Open HTML files in your browser
2. Interact with components (click, hover)
3. See responsive behavior (resize window)
4. Share with stakeholders for feedback

**Note:** Mockups use inline CSS and placeholder data for demonstration. Production implementation will use your existing Tailwind CSS + shadcn/ui components.

---

## Appendix A: Navigation Config Changes

**File:** `src/config/navigation.ts`

```typescript
export const NAV_PILLARS: NavPillar[] = [
  {
    id: "track",
    label: "Track",
    order: 1,
    destinations: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, surface: "all" },
      { href: "/daily-log", label: "Daily Log", icon: FileText, surface: "all" }, // NEW
      { href: "/body-map", label: "Body Map", icon: MapPin, surface: "all" }, // RENAMED from /flares
      { href: "/photos", label: "Photos", icon: Camera, surface: "desktop" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    order: 2,
    destinations: [
      { href: "/insights", label: "Health Insights", icon: TrendingUp, surface: "all" }, // NEW
      { href: "/timeline", label: "Timeline", icon: Calendar, surface: "desktop" }, // RENAMED from /calendar
    ],
  },
  {
    id: "manage",
    label: "Manage",
    order: 3,
    destinations: [
      { href: "/my-data", label: "My Data", icon: Sliders, surface: "desktop" }, // RENAMED from /manage
      { href: "/export", label: "Export & Sharing", icon: Download, surface: "desktop" },
      { href: "/settings", label: "Settings", icon: Settings, surface: "all" },
    ],
  },
  {
    id: "support",
    label: "Support",
    order: 4,
    destinations: [
      { href: "/help", label: "Help", icon: Info, surface: "all" },
    ],
  },
];
```

## Appendix B: Data Model Updates

**New DailyLog Table (Dexie):**

```typescript
// lib/db/schema.ts
export const db = new Dexie('SymptomTrackerDB') as Dexie & {
  // ... existing tables
  dailyLogs: Dexie.Table<DailyLog, string>;
};

db.version(10).stores({
  // ... existing stores
  dailyLogs: '++id, [userId+date], userId, date',
});
```

## Appendix C: Component Hierarchy

```
App
├── Layout (navigation)
├── /daily-log (NEW)
│   ├── EmoticonMoodSelector
│   ├── SleepQualityInput
│   ├── FlareQuickUpdateList
│   └── DailyNotes
├── /insights (NEW - replaces /analytics)
│   ├── InsightCard (multiple)
│   ├── CorrelationScatterPlot
│   ├── FlareAnalyticsHeatMap
│   └── TreatmentEffectivenessTable
├── /body-map (RENAMED from /flares)
│   ├── EnhancedBodyMap (gender/body-type aware)
│   ├── BodyMapSettings
│   └── FlareList
└── /timeline (RENAMED from /calendar)
    ├── MultiLayerCalendar
    ├── PatternHighlighter
    └── DayDetailModal
```

---

**Document Status:** ✅ Complete & Ready for Implementation
**Last Updated:** 2025-11-07
**Version:** 1.0

---

_This UX Design Specification was created through collaborative design facilitation using the BMad Method. All decisions include rationale and are production-ready._

**Interactive Mockups:**

All mockups are included in the Interactive Deliverables section below (Section 10).

---

## Appendix D: Related Documents

### Input Documents
- **Product Requirements**: [C:\projects\symptom-tracker\docs\PRD.md](./PRD.md)
- **Workflow Status**: [C:\projects\symptom-tracker\docs\bmm-workflow-status.md](./bmm-workflow-status.md)
- **Solution Architecture**: [C:\projects\symptom-tracker\docs\solution-architecture.md](./solution-architecture.md)

### Output Deliverables
- **UX Design Specification**: This document
- **Health Insights Demo**: [ux-health-insights-demo.html](./ux-health-insights-demo.html)
- **Daily Log Demo**: [ux-daily-log-demo.html](./ux-daily-log-demo.html)

---

## Appendix E: Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Architecture Workflow** - Technical architecture decisions with UX context
- **Story Creation Workflow** - Break down UX implementation into user stories
- **Component Development** - Build shadcn/ui components for new features
- **Testing Strategy** - Define accessibility and usability test plans

### Recommended Implementation Sequence

1. **Phase 1: Quick Wins (Week 1-2)**
   - Update navigation config (1 day)
   - Integrate shadcn/ui (2 days)
   - Create page shells (3 days)

2. **Phase 2: Core Features (Week 3-6)**
   - Daily Log implementation (2 weeks)
   - Correlation engine (2 weeks)

3. **Phase 3: Polish (Week 7-14)**
   - Health Insights UI (2 weeks)
   - Body map enhancements (2 weeks)
   - Timeline redesign (2 weeks)
   - Testing & refinement (2 weeks)

---

## Version History

| Date       | Version | Changes                         | Author  |
| ---------- | ------- | ------------------------------- | ------- |
| 2025-11-07 | 1.0     | Initial UX Design Specification | Steven  |

---

_This UX Design Specification was created through collaborative design facilitation using the BMad Method. All design decisions are documented with clear rationale and are production-ready for implementation._
