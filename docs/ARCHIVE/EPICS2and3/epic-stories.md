# symptom-tracker - Epic Breakdown

**Author:** Steven
**Date:** 2025-10-15
**Project Level:** 2
**Target Scale:** 5-15 stories, 1-2 epics

---

## Epic Overview

This project consists of 2 epics delivering Food Journal functionality with correlation analysis:

**Epic 1: Food Logging & Management** - User interface and data capture for food intake tracking
**Epic 2: Food-Symptom Correlation Analysis** - Analytics engine and insights for dietary trigger discovery

Total: 15 stories across 2 epics

---

## Epic Details

### Epic 1: Food Logging & Management

**Epic Goal:** Enable users to quickly log food intake with rich metadata for correlation analysis

**Business Value:** Provides the foundational data capture capability required for food-symptom correlation analysis, maintaining consistency with existing event logging patterns

**Dependencies:**
- Existing event stream architecture
- Timeline view component
- Quick-log button framework

**Stories:**

#### Story 1.1: Quick-log Food Button on Dashboard
**As a** user
**I want to** quickly log food from the dashboard with a single tap
**So that** I can capture food intake in real-time without disrupting my day

**Acceptance Criteria:**
- Quick-log button appears on dashboard alongside symptom/medication/trigger buttons
- Tapping button opens food logging modal
- Modal follows existing UI patterns and styling
- Responds within 500ms (NFR001)

**Technical Notes:**
- Reuse existing quick-log modal architecture
- Add new "Food" icon to dashboard quick-log section

---

#### Story 1.2: Pre-populated Food Database with Allergen Tags
**As a** user
**I want to** select from a pre-populated database of common foods with allergen information
**So that** I can log food quickly without typing and get accurate allergen correlation data

**Acceptance Criteria:**
- Database includes 200+ common foods with names
- Each food tagged with relevant allergens (dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish)
- Foods searchable by name
- Foods categorized (breakfast items, proteins, vegetables, fruits, grains, etc.)
- Allergen tags visually indicated with consistent color coding

**Technical Notes:**
- Seed database at app initialization
- Store in IndexedDB for offline access
- Allergen taxonomy should align with medical standards

---

#### Story 1.3: Custom Food Creation and Management
**As a** user
**I want to** create and manage my own custom food items
**So that** I can log foods not in the pre-populated database

**Acceptance Criteria:**
- Users can add new food items with name (required)
- Users can select allergen tags from predefined list
- Users can optionally specify preparation method (raw, cooked, fried, fermented, etc.)
- Users can optionally assign food category
- Users can edit or delete custom foods
- Custom foods appear in search alongside pre-populated foods

**Technical Notes:**
- Store custom foods in foods table with userId
- Distinguish custom vs. pre-populated in UI (e.g., "Custom" badge)

---

#### Story 1.4: Meal Composition Logging
**As a** user
**I want to** log multiple foods together as a single meal
**So that** the system can analyze combination effects

**Acceptance Criteria:**
- Users can add multiple food items to a single meal log
- Each food in meal has individual timestamp (meal time)
- Meal type selectable (breakfast, lunch, dinner, snack)
- Users can optionally add portion/quantity for each food (visual guide: small/medium/large)
- Users can optionally add overall meal notes

**Technical Notes:**
- Create foodEvent records with shared mealId
- Meal composition enables FR015 and FR018 (combination analysis)

---

#### Story 1.5: Photo Attachment for Food Logs
**As a** user
**I want to** attach photos to my food logs
**So that** I have visual records of complex meals for future reference

**Acceptance Criteria:**
- Users can capture photo or select from gallery
- Photos encrypted and stored locally with foodEvent
- Thumbnail displayed in timeline view
- Full photo viewable by tapping thumbnail
- Photos follow existing photo encryption patterns

**Technical Notes:**
- Reuse existing photo encryption/storage infrastructure
- Link photoId to foodEvent record

---

#### Story 1.6: Food Event Timeline Integration
**As a** user
**I want to** view my food intake in the timeline alongside symptoms, medications, and triggers
**So that** I can see my complete health event stream in one place

**Acceptance Criteria:**
- Food events appear in timeline view with distinct icon
- Group meals by shared `mealId`; collapsed entry shows: "MealType: Food1 (M), Food2 (S), …"
- Food events show timestamp; expanding reveals portion sizes, notes, allergen tags, and photo (if present)
- Expanded entry includes accessible actions: [Edit] (reopens FoodLogModal pre-filled) and [Delete]
- Timeline sorts all events chronologically and supports keyboard-accessible expand/collapse
- Food events color-coded consistently with food logging UI

**Technical Notes:**
- Group by `mealId`; hydrate food details with `foodRepository.getByIds()`
- Parse JSON arrays/objects (`foodIds`, `portionMap`) per Dexie stringification convention
- Memoize hydration/grouping to avoid redundant lookups in large histories
- Extend timeline component to handle `foodEvent` type with accessible expand/collapse (`aria-expanded`, `aria-controls`) and focus management
- Ensure unified event stream query includes foods data and uses compound indexes for performance

---

#### Story 1.7: Food History Search, Filtering, and Favorites
**As a** user
**I want to** search my food history, filter by criteria, and mark favorites
**So that** I can quickly find specific foods and accelerate logging of frequently eaten items

**Acceptance Criteria:**
- Users can search food logs by food name, date range, or meal type
- Users can filter by allergen tags (e.g., "show all dairy foods")
- Users can mark foods as "favorites" for quick access
- Favorites appear at top of food selection list
- Search results show matching foods with timestamps and meal context

**Technical Notes:**
- Implement IndexedDB compound indexes for efficient filtering
- Store favorites list in user preferences

---

### Epic 2: Food-Symptom Correlation Analysis

**Epic Goal:** Analyze temporal relationships between food consumption and symptoms to identify dietary triggers

**Business Value:** Delivers the core value proposition of food trigger discovery through automated, data-driven correlation analysis with statistical rigor

**Dependencies:**
- Epic 1 (food event data capture)
- Existing correlation engine infrastructure
- Trigger Analysis dashboard

**Stories:**

#### Story 2.1: Time-based Correlation Engine with Extended Windows
**As a** user
**I want to** see correlations between foods and symptoms across various time delays
**So that** I can identify triggers that appear hours or even days after consumption

**Acceptance Criteria:**
- System analyzes correlations across time windows: 15min, 30min, 1hr, 2-4hrs, 6-12hrs, 24hrs, 48hrs, 72hrs
- For each food-symptom pair, identify which time window shows strongest correlation
- Correlation calculation uses statistical methods (e.g., chi-square or correlation coefficient)
- Background job runs analysis (no UI blocking)

**Technical Notes:**
- Extend existing correlation engine to handle foodEvent type
- Store correlation results in analysis cache for performance
- Consider web worker for heavy computation

---

#### Story 2.2: Dose-Response Analysis
**As a** user
**I want to** see if symptom severity correlates with food quantity consumed
**So that** I can determine if portion size matters for my triggers

**Acceptance Criteria:**
- System analyzes relationship between portion size and symptom severity
- Results show if larger portions correlate with more severe symptoms
- Only analyzed when sufficient quantity data logged (minimum 5 events)
- Dose-response findings displayed with correlation insights

**Technical Notes:**
- Require portion data for analysis (small=1, medium=2, large=3)
- Use regression analysis for dose-response relationship
- Display confidence based on sample size

---

#### Story 2.3: Combination Effects Analysis
**As a** user
**I want to** see if food combinations trigger symptoms more than individual foods
**So that** I can identify synergistic dietary triggers

**Acceptance Criteria:**
- System identifies meals where food combinations correlate with symptoms
- Compares combination correlation vs. individual food correlations
- Highlights when combination shows significantly stronger correlation
- Minimum 3 instances of combination required for analysis

**Technical Notes:**
- Analyze meals (shared mealId) as single entity
- Compare individual food correlation vs. meal correlation
- Use Chi-square test for significance

---

#### Story 2.4: Correlation Confidence Calculation
**As a** user
**I want to** see confidence levels on all correlations
**So that** I can trust the insights and avoid false-positive triggers

**Acceptance Criteria:**
- Every correlation displays confidence: High / Medium / Low
- Confidence based on: sample size, consistency, statistical significance (p < 0.05)
- High confidence requires: 5+ occurrences, 70%+ consistency, p < 0.05
- Medium confidence requires: 3-4 occurrences, 50-69% consistency
- Low confidence: fewer occurrences or weaker consistency
- Correlations below statistical significance not displayed (or marked "Insufficient Data")

**Technical Notes:**
- Calculate p-value using appropriate statistical test
- Store confidence level with correlation result
- NFR003: Statistical significance threshold enforcement

---

#### Story 2.5: Trigger Analysis Dashboard Integration
**As a** user
**I want to** see food-related triggers in the existing Trigger Analysis dashboard
**So that** I have a unified view of all my triggers (environmental, food, etc.)

**Acceptance Criteria:**
- Food triggers appear in Trigger Analysis dashboard alongside existing triggers
- Food triggers visually distinguished with food icon
- Dashboard shows top food triggers ranked by correlation strength
- Clicking food trigger shows detailed correlation report
- Dashboard supports filtering by trigger type (food vs. environmental)

**Technical Notes:**
- Extend Trigger Analysis component to render food data
- Unify data model for trigger visualization

---

#### Story 2.6: Allergen Tag Filtering and Investigation
**As a** user
**I want to** filter timeline and reports by allergen tags
**So that** I can investigate specific allergen categories

**Acceptance Criteria:**
- Users can filter timeline by allergen tag (e.g., "show only dairy foods")
- Users can view correlation summary for entire allergen category
- Allergen filter persists across app navigation
- Filter results show count of matching food events

**Technical Notes:**
- Implement allergen tag filter in timeline component
- Aggregate correlations by allergen category

---

#### Story 2.7: Food-Specific Correlation Reports
**As a** user
**I want to** view detailed correlation reports for specific foods
**So that** I can understand the time delay patterns and symptom relationships

**Acceptance Criteria:**
- Clicking a food correlation shows detailed report
- Report displays: correlation percentage, confidence level, time delay pattern
- Report shows symptom frequency after this food (e.g., "migraines occur 78% of the time, 2-4 hours after dairy")
- Report lists all instances (food log + resulting symptoms)
- Visual timeline shows typical delay pattern

**Technical Notes:**
- Create food correlation detail view
- Include timeline visualization component
- Show instance history for transparency

---

#### Story 2.8: Export Correlation Insights and Food Journal
**As a** user
**I want to** export my food journal data and correlation insights
**So that** I can share findings with my healthcare provider

**Acceptance Criteria:**
- Users can export food journal in CSV or JSON format
- Export includes: date, time, foods, portions, meal type, allergen tags, notes
- Users can export correlation report in PDF or CSV
- Correlation export includes: food-symptom pairs, correlation %, confidence, time delays
- Export respects date range filters

**Technical Notes:**
- Extend existing export service to handle food events
- Generate correlation summary document
- Follow existing export patterns (FR013)

---

## Implementation Notes

**Recommended Development Sequence:**
1. Epic 1, Stories 1.1-1.3 (core logging infrastructure)
2. Epic 1, Stories 1.4-1.7 (enhanced logging features)
3. Epic 2, Stories 2.1, 2.4 (correlation engine + confidence)
4. Epic 2, Stories 2.2-2.3, 2.5-2.8 (advanced analysis + visualization)

**Integration Points:**
- Event stream database schema extension
- Correlation engine enhancement
- Timeline view component updates
- Trigger Analysis dashboard integration
- Export service extension

**Testing Considerations:**
- Statistical correlation calculations require test data sets
- Offline functionality for all logging features
- Performance testing with large event datasets (NFR004)
- Accessibility testing for all UI components (NFR005)
