# Epic 9 Test Fix Plan
**Date:** 2025-11-15
**Author:** Code Review Agent (Claude)
**Status:** ACTIONABLE - Ready for implementation

## Executive Summary

All Epic 9 tests (Stories 9.1, 9.2, 9.3) are **failing at catastrophic levels** (28% overall pass rate). The root cause is **NOT a Story 9.4 regression** - tests were broken from the moment they were written and never properly validated.

**Critical Finding:** Story 9.2 claimed "48 passing, 7 failing" but reality is **INVERTED**: 48 failing, 7 passing.

## Test Results Baseline

| Story | Tests | Passing | Failing | Pass Rate | Status |
|-------|-------|---------|---------|-----------|--------|
| 9.1 - Body Map Placement | 21 | 1 | 20 | **5%** | CRITICAL |
| 9.2 - Flare Details | 55 | 7 | 48 | **13%** | CRITICAL |
| 9.3 - Success Screen | 46 | 26 | 20 | **57%** | NEEDS WORK |
| **TOTAL** | **122** | **34** | **88** | **28%** | **DISASTER** |

## Root Cause Analysis

### Issue 1: Jest Mock Hoisting Not Working (Stories 9.1 & 9.2)

**Problem:**  
Components receive `null` for `source` parameter despite mocks returning `'dashboard'`. This causes immediate redirect via `useEffect`, preventing component rendering.

**Evidence:**  
Test output shows only global ARIA live region (from `announce.ts` auto-initialization), no component content.

**Root Cause:**  
Jest module mocks must be hoisted before imports, but current test structure doesn't guarantee this. The `useSearchParams()` hook returns `null` instead of mock values.

**Solution Required:**  
Refactor test setup to use `jest.mock()` with factory functions that return properly configured mocks BEFORE any imports.

### Issue 2: Component Architecture Incompatible with Testing (Stories 9.1 & 9.2)

**Problem:**  
Components use `useEffect` for validation/redirect logic that runs immediately on mount, making synchronous testing difficult.

**Current Pattern (Problematic):**
```typescript
export default function Page() {
  const source = searchParams.get('source');
  
  useEffect(() => {
    if (!source) {
      router.push('/dashboard'); // Runs before component renders
    }
  }, [source]);
  
  if (!source) return null; // Component never renders in tests
  
  return <main>...</main>;
}
```

**Solution Required:**  
Either:
1. **Option A:** Mock `useEffect` to prevent redirect logic from running
2. **Option B:** Refactor components to be more test-friendly (extract validation logic)
3. **Option C:** Use integration tests instead of unit tests (test full routing behavior)

### Issue 3: Text Matching Failures (Story 9.3)

**Problem:**  
Tests use exact text matching like `screen.getByText(/3 locations/)`, but React splits text across multiple DOM nodes:
```html
<h1>
  ✅ Flare saved with 
  1
   
  location
  !
</h1>
```

**Solution Required:**  
Use more flexible text queries:
```typescript
// Instead of:
expect(screen.getByText(/3 locations/)).toBeInTheDocument();

// Use:
expect(screen.getByText((content, element) => {
  return element?.textContent?.includes('3 locations') ?? false;
})).toBeInTheDocument();
```

## Fix Plan - Phased Approach

### Phase 1: Quick Wins (Story 9.3) - 2-4 hours

**Goal:** Get Story 9.3 to 100% pass rate

**Tasks:**
1. Fix text matching queries (use flexible matchers)
2. Fix navigation assertions (verify mockPush calls properly)
3. Fix analytics assertions (verify console.log spies)
4. Fix ARIA assertions (use more flexible queries)

**Expected Outcome:** 46/46 tests passing

**Risk Level:** LOW - Changes isolated to test file only

### Phase 2: Test Infrastructure Refactor (Stories 9.1 & 9.2) - 4-8 hours

**Goal:** Get component rendering in tests

**Tasks:**
1. Create reusable test utility: `src/__tests__/utils/mockNextNavigation.ts`
   ```typescript
   export function mockNextNavigation(params: Record<string, string>) {
     const mockSearchParams = new Map(Object.entries(params));
     const mockPush = jest.fn();
     
     jest.mock('next/navigation', () => ({
       useRouter: () => ({ push: mockPush }),
       useSearchParams: () => ({
         get: (key: string) => mockSearchParams.get(key) || null
       })
     }));
     
     return { mockPush, mockSearchParams };
   }
   ```

2. Refactor Story 9.1 tests to use new utility
3. Refactor Story 9.2 tests to use new utility
4. Add `waitFor` assertions to handle async `useEffect` behavior

**Expected Outcome:** Components render, functional tests can run

**Risk Level:** MEDIUM - Requires test infrastructure changes

### Phase 3: Fix Functional Test Assertions - 2-4 hours per story

**Goal:** Get all functional tests passing

**Tasks:**
1. Fix mock interactions (ensure mocked components trigger callbacks)
2. Fix state assertions (verify component state updates)
3. Fix navigation assertions
4. Fix analytics assertions

**Expected Outcome:** 
- Story 9.1: 21/21 passing
- Story 9.2: 55/55 passing

**Risk Level:** LOW - Changes isolated to test assertions

### Phase 4: Add Missing Test Coverage - 4-8 hours

**Goal:** Cover gaps identified during fix process

**Tasks:**
1. Add integration tests for full user flows
2. Add visual regression tests for responsive design
3. Add performance tests for <200ms load time requirement
4. Document test coverage gaps in story files

**Expected Outcome:** Comprehensive test coverage documented

**Risk Level:** LOW - Additive changes only

## Immediate Next Steps (Today)

### Option A: Fix Story 9.3 Only (Low Risk, High ROI)
**Time:** 2-4 hours  
**Result:** One story with 100% passing tests  
**Recommendation:** ✅ **DO THIS FIRST** - Proves we can fix tests, builds momentum

### Option B: Fix All Tests (High Risk, High Time)
**Time:** 12-24 hours  
**Result:** All stories with passing tests  
**Recommendation:** ⚠️ **Wait for approval** - Significant time investment

### Option C: Document Only (No Code Changes)
**Time:** 1 hour  
**Result:** Clear action plan for future work  
**Recommendation:** ✅ **DO THIS** - Provide clear path forward

## Recommendations

### Immediate Actions (Today):
1. ✅ **Fix Story 9.3 tests** (Phase 1) - Low risk, proves feasibility
2. ✅ **Update code review findings** with test execution results
3. ✅ **Document this fix plan** in Epic 9 documentation
4. ✅ **Update sprint status** with next steps

### Short-term Actions (This Week):
1. **Create test utility module** (Phase 2, Task 1)
2. **Fix Story 9.1 tests** (Phase 2 + 3)
3. **Fix Story 9.2 tests** (Phase 2 + 3)
4. **Run full test suite** and document results

### Long-term Actions (Next Sprint):
1. **Add integration tests** (Phase 4)
2. **Add visual regression tests** (Phase 4)
3. **Add performance tests** (Phase 4)
4. **Establish test-first workflow** to prevent future regression

## Test Quality Standards (Going Forward)

### Definition of "Test Complete":
1. ✅ Tests written and committed
2. ✅ Tests EXECUTED with output documented
3. ✅ **100% pass rate achieved**
4. ✅ Evidence provided (screenshot of test output or CI/CD results)

### Prevent False Completion:
- ❌ NO claiming "48 passing" when reality is inverted
- ❌ NO marking tests complete without running them
- ❌ NO characterizing critical failures as "minor mock issues"
- ✅ ALWAYS provide actual test execution output
- ✅ ALWAYS fix failing tests before marking complete

## Files Modified

- `docs/Epic-9-Test-Fix-Plan.md` (NEW - this file)
- `src/app/(protected)/flares/place/__tests__/page.test.tsx` (MODIFIED - attempted fix, needs more work)
- `/tmp/epic9-test-summary.md` (NEW - test results summary)

## Files to Create

- `src/__tests__/utils/mockNextNavigation.ts` (test utility module)
- `docs/Epic-9-Test-Execution-Log.md` (test run history)

## Conclusion

Epic 9 tests are in **critical condition** but **fixable**. The failures are NOT due to Story 9.4 regressions - they were broken from the start.

**Recommended Path:** Fix Story 9.3 today (proves concept), then systematically fix 9.1 and 9.2 this week using phased approach.

**Success Criteria:** 122/122 tests passing (100% pass rate) with documented execution results.
