#!/usr/bin/env node

/**
 * P0 Smoke Tests for Symptom Tracker Beta Release
 *
 * Tests ST-001 through ST-005
 * Run with: node scripts/smoke-tests.mjs
 *
 * Prerequisites:
 * - Dev server running on http://localhost:3001
 * - Browser with DevTools console access
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const sleep = promisify(setTimeout);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testId, status, message) {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  const statusSymbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  log(`${statusSymbol} ${testId}: ${message}`, statusColor);
}

async function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001', (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function printHeader() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     P0 SMOKE TESTS - SYMPTOM TRACKER BETA RELEASE        ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');
  log('Test Suite: ST-001 through ST-005', 'bold');
  log('Target: http://localhost:3001\n', 'bold');
}

async function executeManualTests() {
  printHeader();

  // Check server
  log('→ Checking dev server status...', 'yellow');
  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    log('\n✗ CRITICAL: Dev server is not running on http://localhost:3001', 'red');
    log('  Please start the server with: npm run dev', 'yellow');
    process.exit(1);
  }

  log('✓ Dev server is running\n', 'green');

  // ST-001: Application Loads Successfully
  log('═══════════════════════════════════════════════════════', 'blue');
  log('ST-001: Application Loads Successfully', 'bold');
  log('═══════════════════════════════════════════════════════', 'blue');
  log('\nRisk: DATA-9 (Critical)');
  log('Instructions:');
  log('1. Navigate to http://localhost:3001 in your browser');
  log('2. Wait for page to load completely');
  log('3. Open DevTools Console (F12)');
  log('4. Check for:');
  log('   - Landing page displays within 3 seconds');
  log('   - No JavaScript console errors (check Console tab)');
  log('   - Navigation elements visible');
  log('   - "Get Started" or sign-in button present\n');

  const st001 = await askForTestResult('ST-001');
  if (st001 === 'FAIL') {
    log('\n⚠ CRITICAL BLOCKER: ST-001 failed. Application cannot load.', 'red');
    log('⚠ Please fix this issue before continuing with other tests.\n', 'red');
    process.exit(1);
  }

  // ST-002: Onboarding Flow Completes
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('ST-002: Onboarding Flow Completes', 'bold');
  log('═══════════════════════════════════════════════════════', 'blue');
  log('\nRisk: BUS-9 (Critical)');
  log('Instructions:');
  log('1. Click "Get Started" button');
  log('2. Complete onboarding steps 1-4:');
  log('   - Step 1: Enter name "Test User", select DOB');
  log('   - Step 2: Set theme preference');
  log('   - Step 3: Select initial symptoms to track');
  log('   - Step 4: Add medications (optional)');
  log('3. Click "Go to Dashboard" on completion step');
  log('4. Verify:');
  log('   - All 4 steps load without errors');
  log('   - "Go to Dashboard" navigates to /dashboard (NOT /)');
  log('   - Dashboard displays with welcome message');
  log('   - No console errors during flow\n');

  const st002 = await askForTestResult('ST-002');
  if (st002 === 'FAIL') {
    log('\n⚠ CRITICAL BLOCKER: ST-002 failed. Users cannot complete onboarding.', 'red');
    log('⚠ Please fix this issue before continuing.\n', 'red');
    process.exit(1);
  }

  // ST-003: Can Log a Symptom
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('ST-003: Can Log a Symptom', 'bold');
  log('═══════════════════════════════════════════════════════', 'blue');
  log('\nRisk: BUS-8 (High)');
  log('Instructions:');
  log('1. From dashboard, click "Log Symptom" quick action');
  log('2. Select any default symptom from list (e.g., "Pain")');
  log('3. Set severity slider to 5');
  log('4. Click "Save" button');
  log('5. Verify:');
  log('   - Symptom logging page loads (/log/symptom)');
  log('   - Default symptoms are visible (not empty list)');
  log('   - Symptom saves successfully (success message)');
  log('   - Symptom appears in dashboard timeline');
  log('6. Check IndexedDB:');
  log('   - DevTools → Application → IndexedDB → symptom-tracker');
  log('   - Verify symptom exists in symptomEvents table\n');

  await askForTestResult('ST-003');

  // ST-004: Can Create a Flare on Body Map
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('ST-004: Can Create a Flare on Body Map', 'bold');
  log('═══════════════════════════════════════════════════════', 'blue');
  log('\nRisk: BUS-8 (High)');
  log('Instructions:');
  log('1. Navigate to Flares page (/flares)');
  log('2. Click on any body region on the body map');
  log('3. Fill in flare details:');
  log('   - Severity: 7');
  log('   - Note: "Test flare"');
  log('4. Click "Create Flare"');
  log('5. Verify:');
  log('   - Body map displays with clickable regions');
  log('   - Flare creation modal opens on region click');
  log('   - Flare saves successfully');
  log('   - Flare marker appears on body map');
  log('   - Flare appears in Active Flares list');
  log('6. Check IndexedDB:');
  log('   - Verify flare exists in flares table with UUID\n');

  await askForTestResult('ST-004');

  // ST-005: Offline Mode Works
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('ST-005: Offline Mode Works', 'bold');
  log('═══════════════════════════════════════════════════════', 'blue');
  log('\nRisk: DATA-9 (Critical)');
  log('Instructions:');
  log('1. Open DevTools Network tab');
  log('2. Select "Offline" throttling');
  log('3. Navigate to dashboard');
  log('4. Log a new symptom entry');
  log('5. Verify:');
  log('   - Application continues to function offline');
  log('   - Dashboard loads from cache');
  log('   - Symptom saves to IndexedDB');
  log('   - No crashes or blocking error messages');
  log('6. Go back online and verify app still works\n');

  await askForTestResult('ST-005');

  // Generate final report
  generateReport();
}

async function askForTestResult(testId) {
  return new Promise((resolve) => {
    process.stdout.write(`\n${colors.cyan}Enter result for ${testId} (pass/fail/warn): ${colors.reset}`);

    process.stdin.once('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      let status = 'UNKNOWN';

      if (input === 'pass' || input === 'p') {
        status = 'PASS';
        testResults.passed.push(testId);
        logTest(testId, 'PASS', 'Test passed successfully');
      } else if (input === 'fail' || input === 'f') {
        status = 'FAIL';
        testResults.failed.push(testId);
        logTest(testId, 'FAIL', 'Test failed');

        // Ask for failure details
        process.stdout.write(`${colors.yellow}Enter failure details (or press Enter to skip): ${colors.reset}`);
        process.stdin.once('data', (detailData) => {
          const details = detailData.toString().trim();
          if (details) {
            testResults[testId] = { status: 'FAIL', details };
          }
        });
      } else if (input === 'warn' || input === 'w') {
        status = 'WARN';
        testResults.warnings.push(testId);
        logTest(testId, 'WARN', 'Test passed with warnings');
      } else {
        log('Invalid input. Please enter pass, fail, or warn.', 'red');
        return resolve(askForTestResult(testId));
      }

      resolve(status);
    });
  });
}

function generateReport() {
  log('\n\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║              TEST EXECUTION REPORT SUMMARY                 ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  const totalTests = 5;
  const passed = testResults.passed.length;
  const failed = testResults.failed.length;
  const warnings = testResults.warnings.length;
  const passRate = ((passed / totalTests) * 100).toFixed(1);

  log('Test Summary:', 'bold');
  log(`  Total Tests: ${totalTests}`);
  log(`  Passed: ${passed}`, 'green');
  log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  log(`  Warnings: ${warnings}`, warnings > 0 ? 'yellow' : 'reset');
  log(`  Pass Rate: ${passRate}%\n`);

  // Gate Decision
  log('Gate Decision:', 'bold');
  if (failed === 0 && passed === totalTests) {
    log('  ✓ PASS - Ready for Beta Release', 'green');
    log('  All P0 smoke tests passed successfully.\n', 'green');
  } else if (failed > 0) {
    log('  ✗ FAIL - Block Beta Release', 'red');
    log('  Critical smoke tests failed. Must fix before beta.\n', 'red');
    log('Failed Tests:', 'red');
    testResults.failed.forEach(testId => {
      log(`  - ${testId}`, 'red');
    });
  } else {
    log('  ⚠ CONCERNS - Review Required', 'yellow');
    log('  Some tests have warnings. Review before beta.\n', 'yellow');
  }

  // Recommendations
  log('\nRecommendations:', 'bold');
  if (failed === 0) {
    log('  1. Proceed with comprehensive P0 testing (all 22 P0 scenarios)');
    log('  2. Document any warnings for tracking');
    log('  3. Execute P1 scenarios if time permits');
  } else {
    log('  1. Fix failed smoke tests immediately');
    log('  2. Re-run smoke test suite after fixes');
    log('  3. Do not proceed to comprehensive testing until all smoke tests pass');
  }

  log('\n═══════════════════════════════════════════════════════\n', 'blue');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Start the manual test execution
process.stdin.setRawMode(false);
process.stdin.resume();
process.stdin.setEncoding('utf8');

executeManualTests().catch((error) => {
  log(`\n✗ Error during test execution: ${error.message}`, 'red');
  process.exit(1);
});
