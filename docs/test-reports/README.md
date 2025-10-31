# Test Reports Directory

This directory contains test execution reports, documentation, and results for the Symptom Tracker beta release testing.

---

## Quick Start

**Want to start testing right now?** Run:

```bash
node scripts/smoke-tests.mjs
```

---

## Documents in This Directory

### 📋 TESTING-SUMMARY.md (START HERE)
**Quick overview of testing status and next steps**
- Current status summary
- What's been done (automated verification ✅)
- What needs to be done (manual testing ⏳)
- Critical risks to watch
- Quick command reference

**Read this first** if you want a quick overview.

---

### 📊 p0-smoke-test-execution-report.md (FULL DETAILS)
**Comprehensive test execution report**
- Complete automated verification results
- Detailed manual test scenarios (ST-001 to ST-005)
- Risk assessment
- Quality gate criteria
- Full test execution instructions
- Evidence and findings

**Read this** for complete testing details and methodology.

---

### 🚀 QUICK-TEST-GUIDE.md (FAST REFERENCE)
**TL;DR testing guide for quick execution**
- 5 tests to execute (30 min total)
- Step-by-step instructions for each test
- Pass/fail checkpoints
- Critical blocker warnings
- Bug report template

**Use this** during manual test execution for quick reference.

---

## Test Scripts

Located in `/scripts` directory:

### verify-app-state.mjs ✅
**Automated verification script**
- Status: COMPLETE (100% pass rate)
- Runtime: ~2 seconds
- Checks: Server, files, schema, default data

```bash
node scripts/verify-app-state.mjs
```

### smoke-tests.mjs ⏳
**Interactive manual test guide**
- Status: READY FOR EXECUTION
- Runtime: ~30 minutes
- Tests: ST-001 through ST-005

```bash
node scripts/smoke-tests.mjs
```

---

## Testing Workflow

### Phase 1: Automated Verification ✅ COMPLETE
1. Run `verify-app-state.mjs` script
2. Review automated verification results
3. Confirm all 6 checks passed (100%)

**Status**: ✅ COMPLETE - All checks passed

---

### Phase 2: Manual Smoke Tests ⏳ PENDING
1. Run `smoke-tests.mjs` script
2. Follow interactive prompts for each test:
   - ST-001: Application loads
   - ST-002: Onboarding completes
   - ST-003: Can log symptom
   - ST-004: Can create flare
   - ST-005: Offline mode works
3. Report pass/fail/warn for each test
4. Script generates summary report

**Status**: ⏳ PENDING - Ready to execute

**Critical**: Watch for blocker risks (R-003, R-004, R-011)

---

### Phase 3: Comprehensive P0 Testing ⏳ BLOCKED
**Blocked until smoke tests pass**
- 22 P0 scenarios
- 6-8 hours estimated
- See: `/docs/comprehensive-test-scenarios-beta-release.md`

---

### Phase 4: P1 & P2 Testing ⏳ FUTURE
- 28 P1 scenarios (8-10 hours)
- 18 P2 scenarios (4-5 hours)
- Optional based on time constraints

---

## Test Results Summary

### Automated Verification (Phase 1)
| Check | Status | Details |
|-------|--------|---------|
| Server Running | ✅ PASS | 278ms response time |
| Landing Page Structure | ✅ PASS | HTML valid, Next.js loaded |
| Critical Files Exist | ✅ PASS | 16/16 files present |
| Default Data Structure | ✅ PASS | Story 3.5.1 verified |
| Onboarding Route | ✅ PASS | Structure verified |
| Database Schema | ✅ PASS | 8/8 tables defined |

**Overall**: ✅ 6/6 checks passed (100%)

### Manual Smoke Tests (Phase 2)
| Test ID | Description | Status |
|---------|-------------|--------|
| ST-001 | Application Loads | ⏳ PENDING |
| ST-002 | Onboarding Flow | ⏳ PENDING |
| ST-003 | Log Symptom | ⏳ PENDING |
| ST-004 | Create Flare | ⏳ PENDING |
| ST-005 | Offline Mode | ⏳ PENDING |

**Overall**: ⏳ 0/5 executed

---

## Critical Risks

### BLOCKER RISKS (Score 9) - Must Pass
1. **R-003**: Onboarding routing (Test: ST-002)
   - ❌ BLOCKER IF: Routes to `/` instead of `/dashboard`

2. **R-004**: Empty symptom lists (Test: ST-003)
   - Pre-check: ✅ PASSED (code verified)
   - Must verify: UI displays correctly

3. **R-011**: Flare creation broken (Test: ST-004)
   - ❌ BLOCKER IF: Cannot create flares

### HIGH RISKS (Score 6-8) - Monitor
- R-002: Offline data persistence (ST-005)
- R-001: Flare history data loss
- R-008: Dark mode text invisible

---

## Quality Gate

### Current Status: ⏳ PENDING MANUAL TESTING

**PASS Criteria** (Ready for Beta):
- ✅ Automated verification passed (COMPLETE)
- ⏳ All 5 smoke tests pass (PENDING)
- ⏳ No critical risks open (PENDING)
- ⏳ Manual testing complete (PENDING)

**FAIL Criteria** (Block Beta):
- ❌ Any P0 smoke test fails
- ❌ Any critical risk (Score 9) unresolved
- ❌ Onboarding broken
- ❌ Data loss risk present

---

## How to Execute Tests

### Step 1: Verify Environment
```bash
# Check server is running
curl http://localhost:3001

# Should return 200 OK
```

### Step 2: Run Automated Checks (Optional - Already Complete)
```bash
node scripts/verify-app-state.mjs
```

### Step 3: Execute Manual Smoke Tests
```bash
node scripts/smoke-tests.mjs
```

### Step 4: Follow Interactive Prompts
- Open browser to http://localhost:3001
- Execute each test scenario
- Enter pass/fail/warn for each test
- Script generates final report

### Step 5: Review Results
- Check generated report
- Document any failures
- Make gate decision (pass/fail/concerns)

---

## Test Environment

**Application**: Symptom Tracker for Hidradenitis Suppurativa
**Version**: 0.2.0
**URL**: http://localhost:3001
**Server Status**: ✅ Running (verified 278ms response)
**Tech Stack**: Next.js 15, React 19, TypeScript, Dexie/IndexedDB
**Architecture**: Offline-first PWA

---

## Documentation Links

### Testing Documents
- [Comprehensive Test Scenarios](../comprehensive-test-scenarios-beta-release.md) - All 68 test scenarios
- [BMM Workflow Status](../bmm-workflow-status.md) - Development workflow tracking

### Test Reports (This Directory)
- **TESTING-SUMMARY.md** - Quick status overview
- **p0-smoke-test-execution-report.md** - Full test report
- **QUICK-TEST-GUIDE.md** - Fast reference guide

### Test Scripts
- `scripts/verify-app-state.mjs` - Automated verification
- `scripts/smoke-tests.mjs` - Manual test guide

---

## Next Steps

1. ⏳ **Execute manual smoke tests** (30 minutes)
   ```bash
   node scripts/smoke-tests.mjs
   ```

2. ⏳ **Review results and make gate decision**
   - If PASS → Proceed to comprehensive P0 testing
   - If FAIL → Fix issues and re-run smoke tests

3. ⏳ **Comprehensive P0 testing** (after smoke tests pass)
   - 22 scenarios, 6-8 hours
   - See comprehensive-test-scenarios-beta-release.md

---

## Questions or Issues?

- Review full report: `p0-smoke-test-execution-report.md`
- Check quick guide: `QUICK-TEST-GUIDE.md`
- See test scenarios: `../comprehensive-test-scenarios-beta-release.md`
- Contact: steven-d-pennington

---

**Last Updated**: 2025-10-31
**Test Phase**: Phase 1 Complete, Phase 2 Pending
**Next Action**: Execute manual smoke tests

---

## Report Generation

### Automated Reports
- Generated by: `verify-app-state.mjs`
- Format: Terminal output with color coding
- Status: ✅ Complete (100% pass rate)

### Manual Test Reports
- Generated by: `smoke-tests.mjs` (interactive)
- Format: Interactive prompts + final summary
- Status: ⏳ Ready for execution

---

**Start testing**: `node scripts/smoke-tests.mjs` 🚀
