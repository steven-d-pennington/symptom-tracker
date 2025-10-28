# Sprint Change Proposal: Pre-Launch Stabilization

**Date:** 2025-10-28
**Author:** Correct Course Workflow
**Status:** Pending Approval
**Scope Classification:** Minor (Direct implementation by dev team)

---

## Section 1: Issue Summary

### Problem Statement

Three critical bugs prevent stable user launch:

1. **Onboarding completion routes to wrong page** - Users clicking "Go to dashboard" are sent to "/" instead of "/dashboard"
2. **Flare update/resolve workflows non-functional** - Modal opens, appears to save, but data is not persisted due to deprecated API calls
3. **Pre-launch stability concerns** - Core workflows broken, blocking user onboarding

### Discovery Context

Issues discovered during general app testing and review of recent flare tracking changes (Epic 2 work). Identified through:
- User flow testing (onboarding completion)
- Console deprecation warnings during flare management testing
- Manual verification that modal saves were not persisting to IndexedDB

### Evidence

**Onboarding Bug:**
- File: `src/app/onboarding/components/CompletionStep.tsx:97`
- Issue: `<Link href="/">` routes to main page instead of dashboard
- Expected: `<Link href="/dashboard">` to route to dashboard page

**Workflow Bug:**
- File: `src/components/timeline/EventDetailModal.tsx:195-205`
- Issue: Calls deprecated methods `flareRepository.updateSeverity()` and `flareRepository.update()`
- Console warnings:
  - "resolve is deprecated. Use updateFlare to set status='resolved' and endDate."
  - "getByUserId is deprecated. Update to use getActiveFlares which returns new FlareRecord schema."
- Result: Methods only log warnings without saving data

**User Impact:**
- Onboarding flow confusing - doesn't deliver users to intended destination
- Core flare management completely broken - cannot update severity, cannot mark flares resolved
- User testing blocked until fixed

### Timeline Impact

**Estimated Fix Time:** 2-3 hours
**Blockers Removed:** User onboarding, flare workflow testing
**Launch Impact:** Critical pre-launch blocker - must be fixed before user testing

---

## Section 2: Impact Analysis

### Epic Impact

**Epic 0 (UI/UX Revamp):**
- Status: Stories 0.1-0.5 complete
- Impact: Onboarding completion routing incorrect
- Fix: Single-line change to CompletionStep.tsx

**Epic 2 (Flare Lifecycle Management):**
- Status: Stories 2.1-2.8 marked complete but migration incomplete
- Impact: EventDetailModal still using deprecated API methods
- Fix: Complete repository migration (add 15 lines, remove 10 lines)

**Epic 3 (Analytics):**
- Status: Story 3.1 done, Story 3.2 in review
- Impact: None - analytics features unaffected

**New Epic 0.5 (Pre-Launch Stabilization):**
- Status: To be created
- Purpose: Group pre-launch bug fixes
- Stories: 0.5.1 (Onboarding), 0.5.2 (Workflows)

### Story Impact

**Current and Future Stories:**
- Story 3.2 can complete review - no changes needed
- Epic 0.5 inserted before resuming Epic 3
- Epic 3 stories 3.3-3.5 unaffected
- Epic 4 unaffected

**Completed Stories:**
- Epic 0 stories verified complete with routing fix
- Epic 2 stories completed with EventDetailModal migration

### Artifact Conflicts

**PRD (docs/PRD.md):**
- ✅ No conflicts - bugs don't affect requirements
- ✅ No modifications needed
- MVP achievable once bugs fixed

**Architecture (ARCHITECTURE.md):**
- ⚠️ Note partial migration - EventDetailModal incomplete
- 📝 Document: Event Stream Redesign repository migration must be completed
- Pattern: All components must use `updateFlare()`/`addFlareEvent()`, not deprecated methods

**UI/UX Specifications (docs/ui/ui-ux-revamp-blueprint.md):**
- ✅ No conflicts - onboarding intent was correct, implementation wrong
- 📝 Verify: Blueprint should specify dashboard destination (likely already does)

**Epics (docs/epics.md):**
- 📝 Add: Epic 0.5 (Pre-Launch Stabilization) between Epic 0 and Epic 3
- Story sequencing: Story 3.2 review → Epic 0.5 → Resume Epic 3

### Technical Impact

**Code Changes:**
- 2 files modified
- ~20 lines changed total
- Zero breaking changes
- Zero dependency updates

**Database Impact:**
- None - uses existing schema and patterns

**Deployment Impact:**
- None - standard deployment
- No migration scripts needed

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment

**Rationale:**

1. **Implementation Effort: Minimal**
   - Onboarding: 1-line change
   - EventDetailModal: Migrate 3 method calls to new API pattern
   - Total: 2-3 hours work

2. **Technical Risk: Low**
   - Fixes are isolated and well-understood
   - Onboarding fix: Change route from "/" to "/dashboard"
   - EventDetailModal fix: Replace deprecated methods with working API
   - Tested patterns already exist in FlareUpdateModal.tsx and FlareResolveModal.tsx

3. **Impact on Team Morale: Positive**
   - Quick wins that unblock launch
   - Users can complete onboarding successfully
   - Core flare workflows become functional

4. **Long-term Sustainability: Excellent**
   - Completes repository migration started in Epic 2
   - Removes last deprecated method calls
   - Aligns all components with Epic 2 architecture patterns

5. **Stakeholder Expectations: Meets Them**
   - Enables stable user launch
   - Core workflows validated
   - Pre-launch blocker removed

**Alternative Approaches Considered:**

**Option 2: Rollback**
- ❌ Not viable - no recent changes to revert
- EventDetailModal bug exists in old code
- Onboarding routing is Epic 0 work (weeks old)
- Would destroy working functionality for no benefit

**Option 3: MVP Scope Reduction**
- ❌ Not applicable - these are bug fixes, not scope issues
- MVP is achievable once bugs fixed
- No features need deferral

---

## Section 4: Detailed Change Proposals

### Change #1: Fix Onboarding Completion Routing

**File:** `src/app/onboarding/components/CompletionStep.tsx`
**Lines:** 97
**Story:** Epic 0.5, Story 0.5.1

**Before:**
```tsx
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          onClick={handleFinish}
        >
          Go to dashboard
        </Link>
```

**After:**
```tsx
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          onClick={handleFinish}
        >
          Go to dashboard
        </Link>
```

**Rationale:**
- Button text says "Go to dashboard" but was routing to wrong destination
- Aligns with Epic 0 UI/UX revamp intent
- Delivers users to focused dashboard experience after onboarding

**Risk:** None - single character change, zero side effects

**Testing:**
- Complete onboarding flow end-to-end
- Verify dashboard page loads correctly for new users
- Verify dashboard displays proper "first-time user" empty states

---

### Change #2: Migrate EventDetailModal to New Repository API

**File:** `src/components/timeline/EventDetailModal.tsx`
**Lines:** 190-206
**Story:** Epic 0.5, Story 0.5.2

**Before:**
```typescript
        case 'flare-created':
        case 'flare-updated':
        case 'flare-resolved':
          // For flares, update the flare record
          const flareId = event.eventRef.id;
          await flareRepository.updateSeverity(
            flareId,
            severity,
            event.eventRef.status || 'active'
          );

          // Update notes and photo IDs if changed
          await flareRepository.update(flareId, {
            notes: notes || undefined,
            photoIds: attachedPhotoIds.length > 0 ? attachedPhotoIds : undefined
          });
          break;
```

**After:**
```typescript
        case 'flare-created':
        case 'flare-updated':
        case 'flare-resolved':
          // For flares, update the flare record using new repository API
          const flareId = event.eventRef.id;

          // Detect what changed
          const severityChanged = severity !== event.eventRef.severity;

          // Create FlareEvent record for the status update (append-only pattern)
          if (severityChanged) {
            await flareRepository.addFlareEvent(userId, flareId, {
              eventType: "severity_update",
              timestamp: Date.now(),
              severity: severity,
              notes: notes.trim() || undefined,
            });

            // Update FlareRecord current severity
            await flareRepository.updateFlare(userId, flareId, {
              currentSeverity: severity,
            });
          } else if (notes.trim()) {
            // If only notes changed, create a trend_change event
            await flareRepository.addFlareEvent(userId, flareId, {
              eventType: "trend_change",
              timestamp: Date.now(),
              notes: notes.trim(),
            });
          }

          // Note: photoIds are not part of FlareRecord schema in Epic 2 design
          // Photo linking is handled separately via photoRepository with eventId
          break;
```

**Rationale:**
- Replaces deprecated methods with working API
- Follows Epic 2 append-only event history pattern (ADR-003)
- Creates proper FlareEvent records for audit trail
- Includes userId parameter for multi-user support
- Fixes bug where changes weren't being saved

**Risk:** Low
- Tested pattern already used in FlareUpdateModal.tsx (working correctly)
- userId available from useCurrentUser hook already in component
- No schema changes required

**Testing:**
- Open EventDetailModal for flare event
- Update severity → verify saves to IndexedDB
- Add notes → verify creates FlareEvent record
- Check FlareHistory displays new events
- Verify no console deprecation warnings

---

### Change #3: Add Epic 0.5 to Epics Document

**File:** `docs/epics.md`
**Lines:** Insert after Epic 0 (around line 125)
**Story:** Epic 0.5 (Documentation)

**Before:**
```markdown
---

## Epic 1: Enhanced Body Map with Precision Location Tracking
```

**After:**
```markdown
---

## Epic 0.5: Pre-Launch Stabilization _(CRITICAL)_

### Expanded Goal

Address critical bugs discovered during pre-launch testing that block stable user onboarding and core flare management workflows. Ensure production readiness before resuming analytics feature development.

### Value Proposition

- Enables users to complete onboarding successfully and reach the dashboard
- Restores core flare update and resolve functionality
- Completes repository migration started in Epic 2
- Removes pre-launch blockers preventing user testing

### Story Breakdown

**Story 0.5.1: Fix Onboarding Completion Routing**

As a user completing onboarding,
I want to be taken to the dashboard when I click "Go to dashboard",
So that I can immediately start using the app as intended.

**Acceptance Criteria:**
1. "Go to dashboard" button in CompletionStep routes to `/dashboard` instead of `/`
2. Users land on dashboard page after completing onboarding
3. Dashboard displays correctly for new users
4. Onboarding completion flow tested end-to-end

**Prerequisites:** Epic 0 complete.

---

**Story 0.5.2: Fix Flare Update/Resolve Workflows**

As a user managing active flares,
I want my status updates and resolutions to save correctly,
So that I can track flare progression accurately.

**Acceptance Criteria:**
1. EventDetailModal migrates from deprecated `updateSeverity()`/`update()` methods to new `updateFlare()`/`addFlareEvent()` API
2. Flare severity updates save correctly and persist to IndexedDB
3. Flare status changes create proper FlareEvent records (append-only pattern)
4. Console deprecation warnings eliminated
5. EventDetailModal follows same patterns as FlareUpdateModal and FlareResolveModal
6. Update and resolve workflows tested end-to-end with data verification

**Prerequisites:** Epic 2 complete (repository infrastructure exists).

---

## Epic 1: Enhanced Body Map with Precision Location Tracking
```

**Rationale:**
- Documents stabilization work for team reference
- Establishes "Pre-Launch Stabilization" as recognized phase
- Follows same epic format for consistency
- Marked CRITICAL to indicate priority

**Risk:** None - documentation only

---

## Section 5: Implementation Handoff

### Change Scope Classification: **Minor**

These changes can be implemented directly by the development team without backlog reorganization or strategic review.

### Handoff Recipients: **Development Team**

**Deliverables:**
1. This Sprint Change Proposal document
2. Three specific code change proposals (approved)
3. Testing verification checklist

**Responsibilities:**
1. Implement Change #1 (CompletionStep.tsx)
2. Implement Change #2 (EventDetailModal.tsx)
3. Implement Change #3 (epics.md documentation)
4. Run end-to-end tests for both workflows
5. Verify deprecation warnings eliminated
6. Verify onboarding routes correctly
7. Create PR with changes

### Success Criteria

**Technical Success:**
- ✅ Onboarding completion routes to /dashboard
- ✅ Flare updates save to IndexedDB correctly
- ✅ FlareEvent records created for audit trail
- ✅ Console deprecation warnings eliminated
- ✅ Epic 0.5 documented in epics.md
- ✅ All tests pass

**User Success:**
- ✅ Users can complete onboarding and reach dashboard
- ✅ Users can update flare severity and see changes persist
- ✅ Users can mark flares resolved successfully
- ✅ User testing can proceed without workflow blockers

**Timeline Success:**
- ✅ Changes implemented within 2-3 hours
- ✅ Testing completed same day
- ✅ User onboarding unblocked immediately

### Next Steps After Implementation

1. **Immediate:** Complete Story 3.2 review
2. **Next:** Mark Epic 0.5 as complete
3. **Then:** Resume Epic 3 (Stories 3.3-3.5)
4. **Finally:** Begin user testing with stable workflows

---

## Section 6: Summary

### What's Changing

**Code Changes:**
- 1 line change: CompletionStep.tsx routing
- 15 lines added, 10 removed: EventDetailModal.tsx migration
- 1 epic added: docs/epics.md

**Epic Structure:**
- Epic 0.5 (Pre-Launch Stabilization) inserted between Epic 0 and Epic 3

**Timeline:**
- Estimated effort: 2-3 hours
- Blocks removed: User onboarding, flare workflow testing

### Why These Changes

These are critical pre-launch bugs that prevent:
1. Users from successfully completing onboarding
2. Users from tracking flare progression (core feature)
3. User testing and stable launch

Both fixes are straightforward implementations with minimal risk and immediate value.

### What's NOT Changing

- PRD requirements (unchanged)
- MVP scope (unchanged)
- Epic 3 analytics features (unaffected)
- Epic 4 photo features (unaffected)
- Architecture patterns (reinforced, not changed)

### Approval Status

**Reviewed by:** Steven (Product Owner)
**Change proposals:** 3 of 3 approved
**Ready for implementation:** Yes

---

**End of Sprint Change Proposal**

Generated by Correct Course Workflow
Date: 2025-10-28
