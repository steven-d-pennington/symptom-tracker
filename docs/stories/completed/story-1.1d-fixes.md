# Story 1.1d-fixes: Critical Fixes and Completion for Trend Visualization

Status: Ready for Review (Planning)

## Story

As a **developer completing Story 1.1d**,
I want **to fix critical test failures, implement missing components, and complete accessibility requirements**,
so that **the trend visualization feature meets all acceptance criteria and can be approved for production**.

## Acceptance Criteria

1. All test suites pass without errors (fix 5 failing test suites)
2. TrendInterpretation component displays plain-language analysis with visual indicators
3. Functional tooltip with keyboard and screen reader support (WCAG 2.1 AA compliant)
4. Change point markers rendered on TrendChart
5. Comprehensive test coverage including accessibility and integration tests
6. Dynamic chart labels support multiple metric types
7. Mobile-responsive chart configuration verified

## Tasks / Subtasks

### Critical Items (Must Fix Before Approval)

- [ ] **Task 1: Fix Test Infrastructure** (AC: 1)
  - [ ] Rename `TrendChart.test.ts` → `TrendChart.test.tsx` to fix JSX parsing error
  - [ ] Create mock for `useCurrentUser` hook in `__mocks__/useCurrentUser.ts`
  - [ ] Configure jest.config.js to handle ES module imports correctly
  - [ ] Update TimeRangeSelector test assertions to match actual label "Time Range"
  - [ ] Verify all 5 test suites pass

- [ ] **Task 2: Implement TrendInterpretation Component** (AC: 2)
  - [ ] Create `/src/components/analytics/TrendInterpretation.tsx`
  - [ ] Use `TrendAnalysisService.generateInterpretation()` to get direction and confidence
  - [ ] Display visual direction indicators: ↑ (worsening), ↓ (improving), → (stable)
  - [ ] Show plain-language text (e.g., "Improving with high confidence")
  - [ ] Style with appropriate colors (green for improving, red for worsening, gray for stable)
  - [ ] Add unit tests for all interpretation states
  - [ ] Integrate into TrendWidget component

- [ ] **Task 3: Implement Functional Tooltip** (AC: 3)
  - [ ] Install and configure Radix UI Tooltip (WCAG compliant)
  - [ ] Replace TrendTooltip hidden CSS with Radix Tooltip.Root/Trigger/Content
  - [ ] Add keyboard support (focus/blur, Escape key to dismiss)
  - [ ] Implement `aria-describedby` and `role="tooltip"`
  - [ ] Add `aria-live="polite"` for screen reader announcements
  - [ ] Test with keyboard navigation (Tab, Enter, Escape)
  - [ ] Test with screen reader (NVDA or JAWS)
  - [ ] Update existing unit tests

- [ ] **Task 4: Implement Change Point Markers** (AC: 4)
  - [ ] Use `changePoints` prop in TrendChart component (currently unused)
  - [ ] Add Chart.js point annotation plugin configuration
  - [ ] Render vertical line markers at change point dates
  - [ ] Add hover tooltip showing "Significant change detected on [date]"
  - [ ] Style markers to stand out (dashed line, distinct color)
  - [ ] Test with data containing known change points

### Important Items (Should Fix)

- [ ] **Task 5: Add Comprehensive Test Coverage** (AC: 5)
  - [ ] TrendChart: Add interaction tests (hover, click), edge case tests (empty data, single point)
  - [ ] TrendTooltip: Add keyboard navigation tests, screen reader tests
  - [ ] TimeRangeSelector: Add validation tests, onChange behavior tests
  - [ ] TrendWidget: Add loading state tests, error recovery tests
  - [ ] Add accessibility tests using `@testing-library/jest-dom` matchers
  - [ ] Add visual regression snapshot tests for chart rendering
  - [ ] Add integration test for time range selection → re-analysis flow

- [ ] **Task 6: Make Chart Labels Dynamic** (AC: 6)
  - [ ] Add `datasetLabel` and `trendlineLabel` props to TrendChart
  - [ ] Derive default labels from metric type (symptom/energy/sleep/stress)
  - [ ] Update TrendWidget to pass appropriate labels
  - [ ] Test with multiple metric types

- [ ] **Task 7: Add Mobile Responsive Configuration** (AC: 7)
  - [ ] Add `maintainAspectRatio: false` to Chart.js options
  - [ ] Configure `aspectRatio` for mobile breakpoints
  - [ ] Test chart rendering on mobile viewport (375px width)
  - [ ] Verify touch gestures work on mobile

### Low Priority Improvements

- [ ] **Task 8: Extract Constants and Add Validations**
  - [ ] Extract `STABLE_SLOPE_THRESHOLD = 0.1` constant in TrendAnalysisService with JSDoc
  - [ ] Add date range validation to `parseTimeRange` (prevent future dates)
  - [ ] Document threshold rationale

- [ ] **Task 9: Accessibility Enhancements**
  - [ ] Add `aria-label` to canvas element in TrendChart
  - [ ] Create `<noscript>` fallback data table for chart
  - [ ] Verify color contrast meets WCAG 2.1 AA (4.5:1)

- [ ] **Task 10: Create Component Export Index**
  - [ ] Create `/src/components/analytics/index.ts`
  - [ ] Export all public components (TrendChart, TrendWidget, etc.)
  - [ ] Update imports in consuming files

## Dev Notes

### Context and Rationale

This story addresses critical findings from the Senior Developer Review (2025-10-09) of Story 1.1d. The original story was marked "Changes Requested" due to:
- 5 failing test suites (infrastructure issues, not implementation bugs)
- Missing TrendInterpretation component (AC #2)
- Non-functional tooltip violating accessibility requirements
- Change point markers not rendered despite prop being defined
- Minimal test coverage lacking edge cases and accessibility tests

Completing these fixes is **required** before Story 1.1d can be approved and deployed to production.

### Architecture Patterns and Constraints

**Component Architecture:**
- Follow existing patterns in `/src/components/analytics`
- Use Radix UI for accessible primitives (tooltip)
- Stateless components with props-based configuration
- React hooks for state management (useState, useEffect)

**Testing Infrastructure:**
- Jest + React Testing Library + ts-jest
- ES Module support via `jest.config.js` and `@jest/globals`
- Mock strategy: Create `__mocks__/` directory for hooks
- Test file naming: `.test.tsx` for React components with JSX

**Accessibility Requirements (WCAG 2.1 AA):**
- Keyboard navigation for all interactive elements
- Screen reader support with ARIA labels and live regions
- Color contrast validation (4.5:1 for text)
- Alternative data table view for chart content
- Focus indicators for keyboard users

### Source Tree Components to Touch

**Files to Modify:**
```
/src/components/analytics/
  TrendChart.tsx                       # Add change point markers, dynamic labels, mobile config
  TrendTooltip.tsx                     # Replace with Radix UI Tooltip
  TrendWidget.tsx                      # Integrate TrendInterpretation component

/src/components/analytics/__tests__/
  TrendChart.test.ts                   # RENAME to .test.tsx
  TrendChart.test.tsx                  # Add comprehensive tests
  TrendTooltip.test.tsx                # Add keyboard and a11y tests
  TimeRangeSelector.test.tsx           # Fix label assertion
  TrendWidget.test.tsx                 # Add loading/error tests

/src/lib/services/
  TrendAnalysisService.ts              # Extract STABLE_SLOPE_THRESHOLD constant, add validation
```

**New Files to Create:**
```
/src/components/analytics/
  TrendInterpretation.tsx              # Plain-language interpretation display
  index.ts                             # Component exports

/src/components/analytics/__tests__/
  TrendInterpretation.test.tsx         # Unit tests

/src/lib/hooks/
  __mocks__/useCurrentUser.ts          # Mock for testing
```

### Project Structure Notes

**Alignment with unified-project-structure.md:**
- Components in `/src/components/analytics`
- Service layer in `/src/lib/services`
- Hooks in `/src/lib/hooks`
- Tests colocated in `__tests__` directories

**Component Dependencies:**
- Radix UI Tooltip (`@radix-ui/react-tooltip`) - NEW dependency
- Existing: Chart.js 4.5.0 + react-chartjs-2 5.3.0
- Existing: Testing Library, Jest, ts-jest

**Naming Conventions:**
- Components: PascalCase with `.tsx` extension
- Tests: `[Component].test.tsx`
- Hooks: `use[Feature].ts`
- Mocks: `__mocks__/[module].ts`

### Testing Standards Summary

**Jest Configuration Updates:**
- Add `extensionsToTreatAsEsm: ['.ts', '.tsx']` if missing
- Configure `moduleNameMapper` for CSS/asset imports
- Add `setupFilesAfterEnv` for jest-dom matchers

**Component Testing (Jest + React Testing Library):**
- Render tests: Component displays correctly with various props
- Interaction tests: User events (click, keyboard, hover)
- State tests: Component state updates correctly
- Error tests: Error boundaries and fallback UI
- Accessibility tests: `toHaveAccessibleName`, `toHaveRole`, keyboard navigation

**Accessibility Testing:**
- Screen reader compatibility (NVDA, JAWS)
- Keyboard navigation (Tab, Enter, Arrow keys, Escape)
- Color contrast validation (WCAG 2.1 AA)
- ARIA attributes verification (`role`, `aria-label`, `aria-describedby`, `aria-live`)
- Focus management tests

**Visual Testing:**
- Snapshot tests for chart rendering
- Responsive design tests (mobile/tablet/desktop)

**Integration Testing:**
- Service → Component data flow
- Time range selection triggers re-analysis
- Chart updates when data changes

### References

**Epic Details:**
[Source: docs/epics.md#Story 1.1d: Trend Analysis - Visualization Components]

**Technical Specification:**
[Source: docs/tech-spec-epic-1.md#TrendChart Component]
[Source: docs/tech-spec-epic-1.md#Post-Review Follow-ups > Story 1.1d Review (2025-10-09)]

**PRD Requirements:**
[Source: docs/PRD.md#FR1. Trend Analysis]
- Visual trend charts with clear explanations
- Plain-language tooltips
- Time range selection

**Testing Strategy:**
[Source: docs/technical/testing-strategy.md]
- Jest configuration for ESM support
- Dependency injection pattern for testing services
- Mock strategy for hooks and external dependencies

**Story 1.1d Senior Developer Review:**
[Source: docs/stories/story-1.1d.md#Senior Developer Review (AI)]
- 13 action items identified
- 6 critical items must be fixed
- Test failures blocking CI/CD pipeline
- Accessibility violations (WCAG 2.1 AA)

**Best Practices:**
- Chart.js Accessibility: https://www.chartjs.org/docs/latest/general/accessibility.html
- WCAG 2.1 Content on Hover: https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html
- Radix UI Tooltip: https://www.radix-ui.com/primitives/docs/components/tooltip
- Testing Library Guiding Principles: https://testing-library.com/docs/guiding-principles/
- Jest + TypeScript Setup: https://jestjs.io/docs/getting-started#via-ts-jest

**Dependencies:**
- Story 1.1d: Trend Analysis - Visualization Components (BLOCKED - awaiting fixes)
  - Original story must remain "Changes Requested" until this fixup story is complete

**Architecture References:**
- Existing component pattern: `/src/components/analytics` (TrendChart, TrendWidget)
- Existing service pattern: `/src/lib/services/TrendAnalysisService.ts`
- Radix UI integration: Follow Next.js + Radix UI setup patterns

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML/JSON will be added here by context workflow -->

### Agent Model Used

Claude 3.5 Sonnet (claude-sonnet-4-5-20250929)

### Debug Log References

**Story Creation Session - 2025-10-09**
- Created story 1.1d-fixes to address critical findings from Story 1.1d senior developer review
- Extracted 10 tasks from Post-Review Follow-ups section
- Mapped tasks to original Story 1.1d acceptance criteria
- Organized by priority: Critical (Tasks 1-4), Important (Tasks 5-7), Low Priority (Tasks 8-10)

### Completion Notes List

### File List

**Story Document:**
- `docs/stories/story-1.1d-fixes.md`

## Change Log

**2025-10-09:** Story created to address Story 1.1d review findings

---

## Senior Developer Review (AI) - Planning Review

**Reviewer:** Steven
**Date:** 2025-10-09
**Review Type:** Planning/Design Review (Pre-Implementation)
**Outcome:** Approved for Implementation

### Summary

Story 1.1d-fixes is a well-structured remediation story that comprehensively addresses all 13 action items from the Story 1.1d senior developer review. This planning review evaluates the story's completeness, task breakdown, and readiness for implementation.

**Strengths:**
- ✅ All critical review findings mapped to tasks with clear subtasks
- ✅ Proper prioritization (Critical → Important → Low Priority)
- ✅ Comprehensive acceptance criteria (7 ACs covering all review findings)
- ✅ Detailed technical specifications and architecture notes
- ✅ Complete reference citations to source documents
- ✅ Testing requirements explicitly defined (22+ testing-related subtasks)
- ✅ Accessibility compliance built into requirements (WCAG 2.1 AA)

**Planning Quality:** Excellent - Story is ready for implementation with no additional planning needed.

### Key Findings

#### Strengths (Planning Quality)

1. **Comprehensive Task Breakdown**
   - 10 tasks with 49 subtasks provide clear implementation roadmap
   - Each task explicitly mapped to acceptance criteria
   - Subtasks are actionable and testable
   - No ambiguity in requirements

2. **Proper Prioritization and Sequencing**
   - Critical items (Tasks 1-4) must be completed first - correct prioritization
   - Important items (Tasks 5-7) enhance quality - appropriate tier
   - Low priority items (Tasks 8-10) are nice-to-haves - correctly categorized
   - Logical dependency order: Fix tests → Implement components → Enhance tests

3. **Architecture Alignment**
   - Follows existing patterns in `/src/components/analytics`
   - Introduces Radix UI for accessible primitives (industry best practice)
   - Test infrastructure fixes align with project's Jest + ESM configuration
   - Component structure consistent with unified-project-structure.md

4. **Testing Strategy**
   - 22 testing-related subtasks across all tasks
   - Accessibility testing explicitly required (WCAG 2.1 AA)
   - Integration tests included (not just unit tests)
   - Visual regression tests specified
   - Clear testing patterns defined in Dev Notes

5. **Complete Documentation**
   - All references cited with source paths
   - Context and rationale section explains why this story exists
   - Best practices linked (Chart.js, WCAG, Radix UI, Testing Library)
   - Lessons learned from Story 1.1d incorporated

#### Areas for Consideration (Not Blockers)

1. **Dependency Management** (Info)
   - Story introduces new dependency: `@radix-ui/react-tooltip`
   - Recommendation: Verify bundle size impact before merging
   - Alternative considered: Custom tooltip (rejected due to accessibility complexity)
   - Decision justified: Radix UI is industry standard for accessible primitives

2. **Story Estimation** (Info)
   - 49 subtasks is substantial for a single story
   - Estimated effort: 2-3 days for critical items, 1-2 days for important/low priority
   - Total: ~4-5 days (appropriate for a fixup story addressing 13 review findings)
   - Consider: Could split into 1.1d-fixes-critical and 1.1d-fixes-enhancements if needed

3. **Test Infrastructure Complexity** (Low)
   - Task 1 (Fix Test Infrastructure) has 5 subtasks touching jest.config.js
   - Risk: Configuration changes could affect other test suites
   - Mitigation: Run full test suite after jest.config.js changes
   - Validation: Explicitly included in Task 1 subtask 5

### Acceptance Criteria Coverage (Planning Review)

| AC # | Requirement | Planning Assessment | Implementation Clarity |
|------|-------------|---------------------|------------------------|
| 1 | All test suites pass | ✅ Clear | Task 1 with 5 specific subtasks |
| 2 | TrendInterpretation component | ✅ Clear | Task 2 with 7 detailed subtasks |
| 3 | Functional tooltip (WCAG compliant) | ✅ Clear | Task 3 with 7 subtasks + Radix UI choice |
| 4 | Change point markers | ✅ Clear | Task 4 with 6 subtasks + Chart.js annotations |
| 5 | Comprehensive test coverage | ✅ Clear | Task 5 with 7 test categories |
| 6 | Dynamic chart labels | ✅ Clear | Task 6 with 4 implementation steps |
| 7 | Mobile responsive config | ✅ Clear | Task 7 with 4 mobile-specific subtasks |

**Summary:** 7/7 acceptance criteria have clear, actionable implementation paths

### Task Quality Assessment

**Critical Tasks (1-4):** Excellent
- All subtasks are specific, measurable, and actionable
- Dependencies clearly identified (e.g., "Rename file" before "Verify tests pass")
- File paths provided for all modifications
- Technical approach specified (Radix UI, Chart.js annotations, jest.config.js)

**Important Tasks (5-7):** Excellent
- Test coverage task breaks down by test type (interaction, edge case, accessibility)
- Dynamic labels task includes both implementation and testing
- Mobile responsive task includes verification steps

**Low Priority Tasks (8-10):** Good
- Appropriate for deferred implementation if time-constrained
- Extract constants improves code quality but not critical for functionality
- Accessibility enhancements go beyond WCAG 2.1 AA minimum (noscript fallback)
- Component exports improve DX but not essential for feature to work

### Architecture & Technical Decisions

**Excellent Decisions:**
1. **Radix UI for Tooltip** - Industry standard, WCAG compliant out-of-box, well-maintained
2. **Chart.js Point Annotations** - Native approach, consistent with existing TrendChart
3. **Mock Strategy** - `__mocks__/` directory follows Jest conventions
4. **Test File Extension** - Standardizing on `.test.tsx` for React components is correct

**Good Decisions:**
5. **Constant Extraction** - `STABLE_SLOPE_THRESHOLD` improves maintainability
6. **Date Validation** - Prevents future dates, good defensive programming
7. **Component Exports** - `index.ts` provides clean public API

**No Concerning Decisions** - All technical choices are sound

### Risk Assessment

**Low Risk Story:**
- ✅ No breaking changes - only fixing existing components
- ✅ No database migrations required
- ✅ No external API integrations
- ✅ Scoped to existing feature (trend visualization)
- ✅ Clear rollback path (revert fixes if issues arise)

**Identified Risks & Mitigations:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Jest config changes break other tests | Medium | Low | Task 1.5 requires running full test suite |
| Radix UI bundle size increase | Low | Medium | Bundle analysis recommended pre-merge |
| Tooltip UX differs from existing patterns | Low | Low | Follow Radix UI defaults (well-tested) |
| Change point markers obscure data | Low | Low | Task 4 includes hover tooltip for context |

### Security & Privacy Review

**No security concerns identified** for this planning stage.

**Observations:**
- ✅ All processing remains client-side (no new external dependencies beyond npm)
- ✅ Radix UI is reputable library from Modulz team
- ✅ No sensitive data exposure in new components
- ✅ Accessibility improvements enhance security (keyboard nav, screen reader)

**Recommendation:** Verify `@radix-ui/react-tooltip` has no known vulnerabilities before install.

### Best Practices Alignment

**Applied:**
- ✅ WCAG 2.1 AA accessibility standards referenced throughout
- ✅ Testing Library guiding principles cited
- ✅ Chart.js accessibility documentation linked
- ✅ Jest + TypeScript setup guide referenced
- ✅ React component patterns followed

**Recommended Additions** (optional, not blocking):
- Consider adding bundle size budget check to CI/CD
- Consider visual regression testing with Percy or Chromatic (if budget allows)

### Planning Review Outcome: **Approved for Implementation** ✅

**Readiness Assessment:**
- ✅ All acceptance criteria are clear and measurable
- ✅ All tasks have actionable subtasks with file paths
- ✅ Technical approach is sound with no architectural concerns
- ✅ Dependencies identified and justified
- ✅ Testing strategy is comprehensive
- ✅ Risks are low and mitigated
- ✅ References are complete and accurate

**Recommendations for Implementation:**

1. **Sequence:** Complete tasks in exact order (1→2→3→4→5→6→7→8→9→10)
   - Rationale: Critical items unblock Story 1.1d approval

2. **Testing:** Run full test suite after Task 1 (jest.config.js changes)
   - Command: `npm test` to verify no regressions

3. **Bundle Size:** Check bundle size after adding Radix UI
   - Command: `npm run build && du -sh .next/static`
   - Threshold: <50KB increase acceptable for accessibility win

4. **Accessibility:** Test with real screen reader after Task 3
   - Tools: NVDA (Windows) or VoiceOver (Mac)
   - Focus: Tooltip keyboard navigation and announcements

5. **Mobile Testing:** Test responsive charts on real devices after Task 7
   - Devices: iPhone SE (375px), Pixel 5 (393px), iPad (768px)
   - Verify: Charts render correctly, touch gestures work

6. **Documentation:** Update Story 1.1d when this story is complete
   - Action: Change status from "Ready for Review" → "Changes Addressed, Re-Review Requested"
   - Reason: Original story blocked until fixes applied

**Approval Criteria for This Story:**
- All 7 acceptance criteria met (verified by tests passing)
- All critical tasks (1-4) completed
- Important tasks (5-7) completed or explicitly deferred
- Low priority tasks (8-10) completed or moved to backlog

**Estimated Timeline:** 4-5 days for full completion

---

## Change Log

**2025-10-09:** Story created to address Story 1.1d review findings
**2025-10-09:** Planning review completed - Approved for Implementation
