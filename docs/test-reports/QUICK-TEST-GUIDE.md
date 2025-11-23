# Quick Test Guide - P0 Smoke Tests

## TL;DR - Start Testing Now

```bash
# 1. Verify server is running
curl http://localhost:3001

# 2. Run automated checks (2 seconds)
node scripts/verify-app-state.mjs

# 3. Run manual tests (30 minutes)
node scripts/smoke-tests.mjs
```

---

## Pre-Flight Status: ✅ READY

- ✅ Server running (278ms response time)
- ✅ All critical files present (16/16)
- ✅ Database schema complete (8/8 tables)
- ✅ Default data verified (symptoms, foods, triggers, medications)
- ✅ Onboarding route present
- ⏳ Manual browser tests pending

---

## 5 Tests to Execute (30 min total)

### ST-001: App Loads (5 min)
1. Open http://localhost:3001
2. Wait for page load
3. Check console (F12) for errors
4. Verify "Get Started" button visible

**PASS IF**: No console errors, page loads <3s, button visible

---

### ST-002: Onboarding Works (10 min) ⚠️ CRITICAL
1. Click "Get Started"
2. Fill out 4 steps:
   - Personal info: Name "Test User"
   - Preferences: Select theme
   - Symptoms: Select symptoms
   - Medications: Add or skip
3. Click "Go to Dashboard"

**PASS IF**:
- All steps work
- Lands on `/dashboard` (NOT `/`) ← **CHECK THIS**
- Dashboard shows welcome message
- No console errors

**BLOCKER IF**: Routes to `/` instead of `/dashboard`

---

### ST-003: Log Symptom (5 min) ⚠️ CRITICAL
1. From dashboard, click "Log Symptom"
2. Select default symptom (e.g., "Pain")
3. Set severity to 5
4. Click "Save"

**PASS IF**:
- Symptom list NOT EMPTY ← **CHECK THIS**
- Saves successfully
- Shows success message
- Appears in dashboard

**Verify**: F12 → Application → IndexedDB → symptom-tracker → symptomInstances

**BLOCKER IF**: Symptom list is empty

---

### ST-004: Create Flare (5 min)
1. Go to `/flares`
2. Click body region on map
3. Fill: Severity 7, Note "Test flare"
4. Click "Create Flare"

**PASS IF**:
- Body map visible and clickable
- Modal opens
- Flare saves
- Marker appears on map
- Shows in Active Flares list

**Verify**: IndexedDB → flares table (check for UUID)

---

### ST-005: Offline Mode (5 min) ⚠️ CRITICAL
1. F12 → Network tab
2. Set throttling to "Offline"
3. Navigate to dashboard
4. Log a symptom

**PASS IF**:
- App doesn't crash
- Dashboard loads
- Symptom saves
- No blocking errors

**Verify**: IndexedDB shows symptom while offline

---

## Critical Checkpoints

### BLOCKER #1: Empty Lists
- **Test**: ST-003
- **Check**: Are default symptoms visible?
- **If EMPTY**: STOP, report bug, DO NOT CONTINUE

### BLOCKER #2: Onboarding Routing
- **Test**: ST-002
- **Check**: Does "Go to Dashboard" go to `/dashboard`?
- **If routes to `/`**: STOP, report bug, DO NOT CONTINUE

### BLOCKER #3: Offline Crash
- **Test**: ST-005
- **Check**: Does app crash when offline?
- **If CRASHES**: STOP, report bug, DO NOT CONTINUE

---

## Quick Result Entry

As you test, mark results:

```
ST-001: [ ] PASS  [ ] FAIL  [ ] WARN
ST-002: [ ] PASS  [ ] FAIL  [ ] WARN
ST-003: [ ] PASS  [ ] FAIL  [ ] WARN
ST-004: [ ] PASS  [ ] FAIL  [ ] WARN
ST-005: [ ] PASS  [ ] FAIL  [ ] WARN
```

---

## Gate Decision

**PASS (Proceed to comprehensive testing)**:
- All 5 tests PASS
- No blockers

**FAIL (Stop and fix)**:
- Any test FAILS
- Fix issues first, re-run

---

## Bug Report (If Needed)

```markdown
## Bug: [Title]

**Test**: ST-XXX
**What happened**: [Description]
**Console errors**: [Copy from F12]
**Screenshot**: [Attach if available]

**Steps to reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

---

## After Tests Pass

1. Document results in test report
2. Proceed to comprehensive P0 testing (22 scenarios)
3. See `/docs/comprehensive-test-scenarios-beta-release.md`

---

## Need Help?

- **Full Report**: `/docs/test-reports/p0-smoke-test-execution-report.md`
- **Test Scenarios**: `/docs/comprehensive-test-scenarios-beta-release.md`
- **Interactive Script**: `node scripts/smoke-tests.mjs`

---

**Ready to test? Start here**: `node scripts/smoke-tests.mjs`
