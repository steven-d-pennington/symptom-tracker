# symptom-tracker Product Requirements Document (PRD)

**Author:** Steven
**Date:** 2025-10-15
**Project Level:** 2
**Project Type:** Feature Addition (Brownfield)
**Target Scale:** 5-15 stories, 1-2 epics

---

## Description, Context and Goals

### Description

The Food Journal feature enables users to log their food and beverage intake throughout the day and correlates this data with symptom occurrences to identify potential food-related triggers. This feature extends the existing event stream architecture to include food events, integrating seamlessly with the current trigger correlation system.

Users can quickly log food items as they consume them using a quick-log interface similar to the existing symptom/medication/trigger logging. The system then analyzes temporal relationships between food consumption and symptom occurrences, identifying patterns such as "joint pain typically occurs 2-3 hours after consuming dairy products" or "migraine symptoms appear 30 minutes after eating processed foods."

The Food Journal leverages the existing event stream model, storing food events with timestamps alongside symptom instances, medication events, and trigger events. This unified event stream enables sophisticated time-based correlation analysis across all logged data types, providing users with actionable insights into their dietary triggers.

### Deployment Intent

**Production Application** - Full production-ready feature integrated into the live symptom tracker application. This feature will be deployed to all users as a core capability of the platform.

### Context

Food is one of the most common yet difficult-to-identify triggers for chronic health conditions. While the symptom tracker currently enables users to log symptoms, medications, and environmental triggers, it lacks the ability to track dietary intake and correlate it with symptom patterns. Many users struggle to identify food sensitivities because food-related symptoms often appear hours after consumption, making manual correlation challenging. By adding a Food Journal with automated time-based correlation analysis, users can leverage the existing event stream architecture to uncover dietary triggers that would otherwise remain hidden. This feature addresses a critical gap in the current trigger tracking capabilities and enhances the platform's value proposition for users managing food-sensitive conditions.

### Goals

1. **Enable Food-Trigger Discovery:** Empower users to identify food-related symptom triggers through automated time-based correlation analysis, helping them make informed dietary decisions.

2. **Seamless Event Stream Integration:** Integrate food logging into the existing event stream architecture, maintaining consistency with current quick-log patterns and correlation workflows.

3. **Actionable Dietary Insights:** Provide users with clear, time-based correlation data showing relationships between specific foods and symptom occurrences (e.g., "symptoms appear 2-3 hours after consuming X").

## Requirements

### Functional Requirements

**FR001:** Users can quickly log food items with a single tap from a quick-log interface similar to existing symptom/medication/trigger logging.

**FR002:** Users can create and manage custom food items with names and required categories including pre-tagged common allergens (dairy, gluten, nuts, shellfish, nightshades, etc.) and optional preparation methods (raw, cooked, fried, fermented).

**FR003:** Users can log food events with timestamps, capturing when food was consumed with minute-level precision.

**FR004:** Users can add details to food logs including quantity/portion size (strongly encouraged with visual guides), meal type (breakfast/lunch/dinner/snack), meal composition (multiple foods eaten together), and notes.

**FR005:** Users can view their food event history in the timeline view alongside symptoms, medications, and triggers.

**FR006:** System automatically analyzes time-based correlations between food consumption and symptom occurrences across extended time windows (15min, 30min, 1hr, 2-4hrs, 6-12hrs, 24hrs, 48hrs, 72hrs) and evaluates dose-response relationships based on quantity consumed.

**FR007:** Users can view correlation insights showing which foods are statistically associated with which symptoms, including time delay patterns.

**FR008:** Users can access food-specific correlation reports showing symptom frequency and severity after consuming specific foods.

**FR009:** Users can filter and search their food history by date range, food name, meal type, or category.

**FR010:** Users can mark frequently consumed foods as "favorites" for faster logging (works in conjunction with pre-populated food database).

**FR011:** System stores food events in the existing event stream database, maintaining consistency with other event types.

**FR012:** Users can edit or delete previously logged food events with audit trail preservation.

**FR013:** Users can export food journal data along with correlation insights in standard formats (CSV, JSON).

**FR014:** System displays food-related triggers in the existing Trigger Analysis dashboard with appropriate visualizations.

**FR015:** Users can log complete meals containing multiple food items, capturing meal composition for combination effect analysis (e.g., dairy + gluten together).

**FR016:** System provides a pre-populated database of common foods with allergen tags and nutritional categories to accelerate logging and improve correlation accuracy.

**FR017:** Users can attach photos to food logs for visual meal records, especially useful for restaurant meals or complex dishes.

**FR018:** System analyzes combination effects, identifying when specific food pairs correlate with symptoms more strongly than individual foods alone.

**FR019:** System displays confidence levels on correlations based on data quantity, statistical significance, and consistency of patterns.

**FR020:** Users can search and filter by allergen tags (e.g., "show all meals containing dairy") for targeted trigger investigation.

### Non-Functional Requirements

**NFR001 - Performance:** Food logging interface must respond within 500ms for quick-log actions, maintaining parity with existing symptom/medication/trigger logging performance.

**NFR002 - Data Integrity:** All food events must be stored with millisecond-precision timestamps in the event stream database, with automatic conflict resolution for offline-first scenarios and guaranteed event ordering.

**NFR003 - Correlation Accuracy:** Time-based correlation analysis must achieve statistical significance threshold (p < 0.05) before displaying correlations to users, with clear confidence indicators preventing false-positive trigger identification.

**NFR004 - Scalability:** System must handle correlation analysis across 5+ years of event history (100,000+ combined events) without performance degradation, supporting long-term pattern discovery.

**NFR005 - Accessibility:** Food logging interface must meet WCAG 2.1 Level AA standards, ensuring users with disabilities can track dietary triggers effectively.

## User Journeys

### Primary User Journey: Discovering a Food Trigger Through Correlation

**Persona:** Sarah, a 34-year-old user with recurring migraines trying to identify dietary triggers

**Scenario:** Sarah suspects certain foods cause her migraines but isn't sure which ones or when symptoms appear after eating.

**Journey:**

1. **Morning - Quick Food Logging**
   - Sarah has breakfast (oatmeal with milk, coffee)
   - Opens app, taps "Log Food" quick-log button
   - Selects "Oatmeal" from favorites, adds "Milk" (tagged: dairy), adds "Coffee"
   - Logs as "Breakfast" meal at 8:00 AM
   - Takes 15 seconds total

2. **Afternoon - Symptom Occurs**
   - At 11:30 AM, Sarah feels a migraine starting
   - Opens app, taps "Log Symptom"
   - Logs "Migraine" with severity 7/10
   - System automatically records timestamp: 11:30 AM

3. **Evening - Continues Logging**
   - Sarah logs lunch (sandwich with cheese - dairy tagged)
   - Logs dinner (pasta with tomato sauce - nightshade tagged)
   - No symptoms after lunch or dinner today

4. **Week Later - Pattern Emerges**
   - After 7 days of consistent food + symptom logging
   - Sarah opens "Trigger Analysis" dashboard
   - System shows correlation insight: **"Dairy products show 78% correlation with migraines (High Confidence)"**
   - Time pattern revealed: **"Symptoms typically appear 2-4 hours after dairy consumption"**

5. **Discovery & Action**
   - Sarah filters timeline by "dairy" allergen tag
   - Reviews 5 instances where dairy → migraine within 2-4 hours
   - Sees confidence level is "High" (based on consistent pattern across multiple occurrences)
   - Decides to eliminate dairy for 2 weeks to test hypothesis
   - Exports correlation report to share with doctor

**Outcome:** Sarah identifies dairy as a migraine trigger through data-driven correlation analysis, enabling informed dietary decisions.

**Key Touchpoints:**
- Quick-log buttons (15 seconds per meal)
- Timeline view (unified event stream)
- Trigger Analysis dashboard (food-specific insights)
- Allergen tag filtering (targeted investigation)
- Correlation confidence indicators (trust in findings)

## UX Design Principles

**1. Speed Over Detail by Default**
- Quick-log interface prioritizes 1-tap food logging for common items
- Optional details (portion, notes, photos) available via progressive disclosure
- Pre-populated database with favorites reduces typing and decision fatigue
- Target: Complete basic food log in under 15 seconds

**2. Visual Pattern Recognition**
- Correlation insights use clear visual indicators (charts, timelines, confidence badges)
- Timeline view shows food events with distinct iconography alongside symptoms/meds/triggers
- Time-delay patterns displayed as visual timelines (e.g., "dairy → 2-4 hrs → migraine")
- Allergen tags use consistent color coding across all interfaces

**3. Trust Through Transparency**
- Confidence levels prominently displayed on all correlations (High/Medium/Low)
- Statistical significance clearly communicated to prevent false-positive anxiety
- Sample size indicators show when more data is needed for reliable insights
- Correlation explanations use plain language, not statistical jargon

**4. Consistency with Existing Patterns**
- Food logging follows identical interaction model to symptom/medication/trigger logging
- Quick-log button placement, modal structure, and save patterns match existing UI
- Navigation, iconography, and terminology maintain platform consistency
- Users leverage existing mental models—no new learning curve

**5. Accessibility First**
- All food logging interactions keyboard-accessible and screen-reader friendly
- Color-coding supplemented with text labels and icons (not color-alone)
- Touch targets meet minimum 44x44pt size for motor accessibility
- Form inputs include clear labels, error messages, and success confirmations

## Epics

### Epic 1: Food Logging & Management
**Goal:** Enable users to quickly log food intake with rich metadata for correlation analysis

**Stories (7 total):**
1. Quick-log food button on dashboard with modal interface
2. Pre-populated food database with common foods and allergen tags
3. Custom food creation and management with categories/preparation methods
4. Meal composition logging (multiple foods per meal)
5. Photo attachment capability for food logs
6. Food event timeline integration and display
7. Food history search, filtering, and favorites management

### Epic 2: Food-Symptom Correlation Analysis
**Goal:** Analyze temporal relationships between food consumption and symptoms to identify dietary triggers

**Stories (8 total):**
8. Time-based correlation engine with extended time windows (15min - 72hrs)
9. Dose-response analysis based on portion/quantity data
10. Combination effects analysis for food pairs and meals
11. Correlation confidence calculation and statistical significance
12. Trigger Analysis dashboard integration with food-specific visualizations
13. Allergen tag filtering and targeted investigation interface
14. Food-specific correlation reports with time-delay patterns
15. Export correlation insights and food journal data

**Total: 15 stories across 2 epics**

## Out of Scope

The following features are intentionally excluded from this initial implementation but may be considered for future phases:

**Future Phase Considerations:**

1. **Nutritional Analysis** - Detailed macronutrient tracking (calories, protein, carbs, fats), vitamin/mineral analysis, and nutritional recommendations. Focus remains on trigger identification, not nutritional planning.

2. **Meal Planning Features** - Meal planning, recipe suggestions, shopping lists, and meal prep tools. This is a tracking and analysis tool, not a meal planning app.

3. **Social/Collaborative Features** - Sharing food diaries, community food databases, user-contributed recipes, and social trigger discussions.

4. **Integration with Nutrition APIs** - Third-party nutrition database integrations (USDA FoodData Central, MyFitnessPal, etc.) beyond initial seed data.

5. **Advanced Statistical Models** - Machine learning prediction models, multi-variate regression analysis, and AI-powered trigger prediction. Initial implementation uses standard statistical correlation methods.

6. **Restaurant/Brand Database** - Integration with restaurant menus, branded food databases, or barcode scanning for packaged foods.

7. **Multi-User Household Tracking** - Features for tracking multiple family members' food intake or shared household meals.

8. **Wearable Device Integration** - Integration with glucose monitors, fitness trackers, or other wearable devices to correlate biometric data with food intake.

---

## Assumptions and Dependencies

### Technical Assumptions

1. Existing event stream database schema can be extended to accommodate food events without breaking changes
2. Current correlation engine architecture supports adding new event types (foods) with minimal refactoring
3. IndexedDB storage is available and sufficient for offline-first food database (200+ items)
4. Application uses React/Next.js with existing modal and timeline components that can be reused

### Data Assumptions

5. Users will log food with sufficient frequency (minimum 1-2 meals per day) to generate meaningful correlations within 7-14 days
6. Pre-populated food database of 200+ common foods provides adequate coverage for 80%+ of user food logging needs
7. Statistical significance threshold (p < 0.05) with minimum 3-5 occurrences balances reliability vs. time-to-insight

### User Behavior Assumptions

8. Users understand the difference between food logging (data capture) and symptom logging (outcome tracking)
9. Users are willing to manually log portion sizes when prompted (even though optional)
10. Users trust correlation insights when confidence levels and sample sizes are transparently displayed

### Dependencies

**Existing Infrastructure:**
- Event stream database and schema
- Timeline view component
- Trigger Analysis dashboard component
- Photo encryption/storage infrastructure
- Export service infrastructure
- Correlation engine from trigger analysis feature

**External Dependencies:**
- Pre-populated food database seed data (initial 200+ foods with allergen tags)

---

## Next Steps

### Immediate Next Actions

Since this is a **Level 2 brownfield project** with significant UI components, the recommended workflow sequence is:

**Phase 1: Solution Architecture and Design (REQUIRED)**

1. **Run Solution Architecture Workflow**
   - Command: `/bmad:bmm:workflows:solution-architecture` or select workflow #18 from bmad-master menu
   - Input: This PRD (`docs/PRD.md`), Epic breakdown (`docs/epic-stories.md`)
   - Output: `solution-architecture.md` with technical design, database schema, API specs, integration patterns
   - Duration: 2-4 hours
   - **Status:** Not started

2. **Run UX Specification Workflow** (HIGHLY RECOMMENDED)
   - Command: `/bmad:bmm:workflows:ux-spec` or select workflow #16 from bmad-master menu
   - Input: PRD, epic-stories.md, solution-architecture.md
   - Output: `ux-specification.md` with wireframes, component specs, user flows, design system guidelines
   - Rationale: This feature has 7 UI-heavy stories requiring consistent design patterns
   - Duration: 3-5 hours
   - **Status:** Not started

**Phase 2: Detailed Planning**

3. **Generate Story Context Files**
   - Command: `/bmad:bmm:workflows:story-context` for each story
   - Creates story-context XML files with relevant code/architecture references
   - Enables efficient story implementation with full context

4. **Mark Stories Ready for Development**
   - Command: `/bmad:bmm:workflows:story-ready` for first story
   - Moves story from TODO → IN PROGRESS in workflow status

**Phase 3: Implementation**

5. **Implement Stories Sequentially**
   - Command: `/bmad:bmm:workflows:dev-story` for each story
   - Recommended sequence:
     - Epic 1, Stories 1.1-1.3 (core logging infrastructure)
     - Epic 1, Stories 1.4-1.7 (enhanced logging features)
     - Epic 2, Stories 2.1, 2.4 (correlation engine + confidence)
     - Epic 2, Stories 2.2-2.3, 2.5-2.8 (advanced analysis + visualization)

6. **Review and Approve Completed Stories**
   - Command: `/bmad:bmm:workflows:review-story` for code review
   - Command: `/bmad:bmm:workflows:story-approved` to mark complete

**Phase 4: Quality Assurance (Optional but Recommended)**

7. **Test Architecture Planning**
   - Command: `/bmad:bmm:workflows:testarch-plan` for test coverage planning
   - Command: `/bmad:bmm:workflows:testarch-atdd` for acceptance test generation

**Phase 5: Retrospective**

8. **Epic Retrospective**
   - Command: `/bmad:bmm:workflows:retrospective` after epic completion
   - Extract lessons learned and validate approach

### Key Integration Points

**Database Schema Extensions:**
- New tables: `foods`, `foodEvents`, `foodCorrelations`
- Extension to existing: `correlations` table (add food event type support)
- Migration strategy: Additive only (no breaking changes to existing schema)

**Component Integrations:**
- Timeline view component (add food event rendering)
- Trigger Analysis dashboard (add food trigger visualization)
- Quick-log framework (add food logging modal)
- Export service (add food journal export capability)

**Critical Path Dependencies:**
1. Event stream schema extension (blocks all food logging)
2. Pre-populated food database seed data (blocks quick-log UX)
3. Correlation engine extension (blocks Epic 2 entirely)
4. Timeline component updates (blocks food event visibility)

### Success Criteria

Before considering this feature complete, validate:
- [ ] All 20 Functional Requirements implemented and tested
- [ ] All 5 Non-Functional Requirements validated (performance, data integrity, accuracy, scalability, accessibility)
- [ ] User journey (Sarah's story) executable end-to-end
- [ ] 15 user stories completed with acceptance criteria met
- [ ] Integration with existing event stream verified (no breaking changes)
- [ ] Correlation confidence levels displaying correctly (High/Medium/Low)
- [ ] Export functionality tested with food journal data
- [ ] Accessibility compliance validated (WCAG 2.1 AA)

### Risk Mitigation

**High-Priority Risks:**
1. **Correlation algorithm complexity** - Extended time windows (72hrs) may impact performance
   - Mitigation: Implement incremental correlation updates, cache results, use background workers
2. **Food database quality** - Incomplete allergen tagging reduces correlation accuracy
   - Mitigation: Curate initial 200+ foods carefully, allow user corrections/additions
3. **User adoption** - Users may not log food consistently enough for correlations
   - Mitigation: Onboarding guidance, reminder notifications, quick-log friction reduction

**Medium-Priority Risks:**
4. **Schema migration** - Extending event stream without breaking existing functionality
   - Mitigation: Thorough testing, feature flags, gradual rollout
5. **Photo storage overhead** - Multiple photos per meal could consume significant storage
   - Mitigation: Photo compression, storage limits (max 3 per meal), optional feature

### Estimated Timeline

**Solutioning & Design:** 1-2 weeks
- Solution architecture: 3-5 days
- UX specification: 5-7 days

**Implementation:** 6-8 weeks
- Epic 1 (Food Logging): 3-4 weeks
- Epic 2 (Correlation Analysis): 3-4 weeks

**Testing & QA:** 2-3 weeks
- Unit/integration tests: 1 week
- E2E testing: 1 week
- Accessibility audit: 3-5 days

**Total:** 9-13 weeks from solutioning to production-ready

## Document Status

- [ ] Goals and context validated with stakeholders
- [ ] All functional requirements reviewed
- [ ] User journeys cover all major personas
- [ ] Epic structure approved for phased delivery
- [ ] Ready for architecture phase

_Note: See technical-decisions.md for captured technical context_

---

_This PRD adapts to project level 2 - providing appropriate detail without overburden._
