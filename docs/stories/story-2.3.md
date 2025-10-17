# Story 2.3: Combination Effects Detection

Status: Ready

## Story

As a user,
I want to see if food combinations trigger symptoms more than individual foods,
so that I can identify synergistic dietary triggers.

## Acceptance Criteria

1. System identifies meals where food combinations correlate with symptoms
2. Compares combination correlation vs. individual food correlations
3. Highlights when combination shows significantly stronger correlation (>15% delta)
4. Minimum 3 instances of combination required for analysis
5. Results display synergy indicator when combination effect exceeds individual foods
6. Combination analysis uses Chi-square test for statistical significance (p < 0.05)

## Tasks / Subtasks

- [ ] Task 1: Implement CombinationAnalysisService core logic (AC 1, 2, 4, 6)
  - [ ] Create `src/lib/services/food/CombinationAnalysisService.ts` with combination detection
  - [ ] Implement meal grouping by `mealId` to identify food combinations
  - [ ] Build unique food pair enumeration from meal events
  - [ ] Calculate combination correlation using Chi-square test
  - [ ] Compare combination correlation vs. individual food max correlation
  - [ ] Enforce minimum 3-instance threshold before analysis
  - [ ] Add unit tests for combination detection with known datasets (15+ tests)

- [ ] Task 2: Extend data model with FoodCombination entity (AC 1, 5)
  - [ ] Add `FoodCombination` Prisma model to schema (userId, foodIds[], foodNames[], symptomId, correlationPct, individualMax, synergistic flag, p-value, confidence, sample size)
  - [ ] Create database migration for FoodCombination table
  - [ ] Add compound unique constraint on `[userId, foodIds, symptomId]`
  - [ ] Add index on `[userId, synergistic]` for performance

- [ ] Task 3: Integrate with CorrelationOrchestrationService (AC 1, 4, 6)
  - [ ] Extend `CorrelationOrchestrationService` to invoke `CombinationAnalysisService` after individual correlations computed
  - [ ] Pass grouped meal events (by mealId) to combination analysis
  - [ ] Store combination results via `correlationRepository.saveCombinations()`
  - [ ] Add integration tests verifying combination data flow (6+ tests)

- [ ] Task 4: Create FoodCombinationCard visualization component (AC 2, 3, 5)
  - [ ] Create `FoodCombinationCard.tsx` component displaying combination name, individual food names, correlation percentage, synergy indicator
  - [ ] Add comparison visualization showing combination correlation vs individual food max with delta percentage
  - [ ] Display "Synergistic Effect" badge when combination > individual + 15%
  - [ ] Show sample size and confidence level (high/medium/low)
  - [ ] Add component tests (8+ tests) covering all confidence levels and synergy scenarios

- [ ] Task 5: Extend API routes to return combination data (AC 1, 5)
  - [ ] Update `GET /api/correlation/results/[userId]` to include `combinations` array in response
  - [ ] Add query parameter `includeCombinations=true` (default true)
  - [ ] Ensure response structure includes: `{ correlations: [], combinations: [], metadata: {} }`
  - [ ] Add API integration tests verifying combination data in responses

- [ ] Task 6: Integrate combinations into Trigger Analysis dashboard (AC 2, 3)
  - [ ] Extend `TriggerAnalysisView` to display "Food Combinations" section below individual food correlations
  - [ ] Render `FoodCombinationCard` components for top 5 synergistic combinations
  - [ ] Add filter to show only synergistic combinations vs. all combinations
  - [ ] Update dashboard tests to verify combination rendering (5+ tests)

- [ ] Task 7: Validation and testing (AC 1, 2, 3, 4, 5, 6)
  - [ ] Create synthetic datasets with known combination effects (2 foods weak individually, strong together)
  - [ ] Validate Chi-square calculations match expected p-values (unit tests)
  - [ ] Test minimum sample size threshold enforcement (reject n < 3)
  - [ ] Verify synergy delta threshold (15%) correctly identifies strong combinations
  - [ ] Test edge cases: single food meals, duplicate foods in meal, missing correlation data
  - [ ] Accessibility validation: ARIA labels on synergy badges, keyboard navigation, semantic HTML

## Dev Notes

- **Combination Detection Logic:** Group food events by `mealId` (meals are multi-food events). Enumerate unique food ID sets (e.g., [dairy, gluten], [dairy, nuts]). For each unique set with >= 3 occurrences, compute correlation with symptoms.
- **Statistical Method:** Use Chi-square test (same as individual correlations per Story 2.1) to calculate p-value. Require p < 0.05 for statistical significance per ADR-008.
- **Synergy Threshold:** Combination considered "synergistic" when: `combinationCorrelation > max(individualCorrelations) + 0.15` (15% delta). Configurable threshold stored in service constant.
- **Sample Size:** Minimum 3 instances required before attempting combination analysis (AC 4). Below threshold, mark as "Insufficient data" similar to dose-response service.
- **Comparison Logic:** For each combination, fetch individual food correlations for all component foods. Use maximum individual correlation as baseline. Display delta percentage in UI.
- **Data Model:** `FoodCombination` table stores combination results separately from `FoodCorrelation`. Both queried together by Trigger Analysis dashboard.

### Project Structure Notes

**Services:**
- `src/lib/services/food/CombinationAnalysisService.ts` - New service for combination detection and synergy calculation
- `src/lib/services/correlation/CorrelationOrchestrationService.ts` - Existing, extend to call CombinationAnalysisService

**Components:**
- `src/components/food/FoodCombinationCard.tsx` - New component for combination visualization
- `src/components/triggers/TriggerAnalysisView.tsx` - Existing, extend to render combination cards

**Repositories:**
- `src/lib/repositories/correlationRepository.ts` - Extend with `saveCombinations()` and `findCombinationsByUserId()` methods

**Database:**
- Prisma schema: Add `FoodCombination` model with fields documented in Task 2
- Migration: Add table with indexes for userId + synergistic flag

**API Routes:**
- `src/app/api/correlation/results/[userId]/route.ts` - Existing, extend to include combinations array

**Tests:**
- `src/lib/services/food/__tests__/CombinationAnalysisService.test.ts` - Unit tests for combination logic
- `src/components/food/__tests__/FoodCombinationCard.test.tsx` - Component tests
- `src/lib/services/correlation/__tests__/CorrelationOrchestrationService.integration.test.ts` - Integration tests for combination data flow

### References

- Source: docs/tech-spec-epic-E2.md § Services and Modules (CombinationAnalysisService module definition)
- Source: docs/tech-spec-epic-E2.md § Data Models and Contracts (FoodCombination Prisma schema)
- Source: docs/tech-spec-epic-E2.md § Acceptance Criteria (AC 4: Combination analysis with synergy detection)
- Source: docs/epic-stories.md § Story 2.3 (Combination Effects Analysis with technical notes)
- Source: docs/solution-architecture.md § Application Architecture (Hybrid data layer, Chi-square test methodology)
- Source: docs/PRD.md § FR018 (Combination effects requirement)
- Source: docs/ux-specification.md § Trigger Analysis Dashboard (Combination card design patterns)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled during implementation -->

### Completion Date

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->
