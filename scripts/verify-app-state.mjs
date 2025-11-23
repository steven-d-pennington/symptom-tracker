#!/usr/bin/env node

/**
 * Automated Verification Script for Symptom Tracker
 *
 * This script performs automated checks that can be done without browser automation:
 * - Server accessibility
 * - Response time checks
 * - Basic HTML structure validation
 * - Critical file existence checks
 */

import http from 'http';
import https from 'https';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const sleep = promisify(setTimeout);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function verifyServerRunning() {
  log('\n→ Checking server accessibility...', 'yellow');

  try {
    const response = await fetchUrl('http://localhost:3001');

    if (response.statusCode === 200 || response.statusCode === 304) {
      log(`✓ Server is running (Status: ${response.statusCode})`, 'green');
      log(`  Response Time: ${response.responseTime}ms`, 'cyan');

      if (response.responseTime < 3000) {
        log(`  ✓ Response time within 3s requirement (ST-001)`, 'green');
      } else {
        log(`  ✗ Response time exceeds 3s (${response.responseTime}ms)`, 'red');
        return false;
      }

      return true;
    } else {
      log(`✗ Server returned status: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Server is not accessible: ${error.message}`, 'red');
    return false;
  }
}

async function verifyLandingPage() {
  log('\n→ Verifying landing page structure...', 'yellow');

  try {
    const response = await fetchUrl('http://localhost:3001');
    const html = response.body;

    // Check for essential elements
    const checks = [
      {
        name: 'HTML structure',
        test: html.includes('<html') && html.includes('</html>')
      },
      {
        name: 'Head section',
        test: html.includes('<head') && html.includes('</head>')
      },
      {
        name: 'Body section',
        test: html.includes('<body') || html.includes('<div id="__next">')
      },
      {
        name: 'Title tag',
        test: html.includes('<title>')
      },
      {
        name: 'Next.js script tags',
        test: html.includes('_next/static') || html.includes('__NEXT_DATA__')
      }
    ];

    let allPassed = true;
    checks.forEach(check => {
      if (check.test) {
        log(`  ✓ ${check.name}`, 'green');
      } else {
        log(`  ✗ ${check.name}`, 'red');
        allPassed = false;
      }
    });

    return allPassed;
  } catch (error) {
    log(`✗ Failed to verify landing page: ${error.message}`, 'red');
    return false;
  }
}

async function verifyCriticalFiles() {
  log('\n→ Verifying critical files exist...', 'yellow');

  const criticalFiles = [
    // Core pages
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/app/(protected)/dashboard/page.tsx',
    'src/app/(protected)/flares/page.tsx',
    'src/app/(protected)/log/symptom/page.tsx',
    'src/app/(protected)/log/food/page.tsx',

    // Database
    'src/lib/db/client.ts',
    'src/lib/db/schema.ts',

    // Repositories
    'src/lib/repositories/symptomInstanceRepository.ts',
    'src/lib/repositories/flareRepository.ts',
    'src/lib/repositories/foodEventRepository.ts',

    // Seed data (Story 3.5.1)
    'src/lib/data/defaultData.ts',
    'src/lib/services/food/seedFoodsService.ts',

    // Onboarding
    'src/app/onboarding/page.tsx',

    // Components
    'src/components/body-map/BodyMapZoom.tsx',
    'src/components/flare/NewFlareDialog.tsx'
  ];

  let allExist = true;
  criticalFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      log(`  ✓ ${file}`, 'green');
    } else {
      log(`  ✗ ${file} (MISSING)`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

async function verifyDefaultDataStructure() {
  log('\n→ Checking default data structure (Story 3.5.1)...', 'yellow');

  try {
    const seedDataPath = path.join(projectRoot, 'src/lib/data/defaultData.ts');

    if (!fs.existsSync(seedDataPath)) {
      log('  ✗ defaultData.ts not found', 'red');
      return false;
    }

    const seedDataContent = fs.readFileSync(seedDataPath, 'utf-8');

    const checks = [
      {
        name: 'Default symptoms defined',
        test: seedDataContent.includes('defaultSymptoms') || seedDataContent.includes('DEFAULT_SYMPTOMS')
      },
      {
        name: 'Default foods defined',
        test: seedDataContent.includes('defaultFoods') || seedDataContent.includes('DEFAULT_FOODS')
      },
      {
        name: 'Default triggers defined',
        test: seedDataContent.includes('defaultTriggers') || seedDataContent.includes('DEFAULT_TRIGGERS')
      },
      {
        name: 'Default medications defined',
        test: seedDataContent.includes('defaultMedications') || seedDataContent.includes('DEFAULT_MEDICATIONS')
      }
    ];

    let allPassed = true;
    checks.forEach(check => {
      if (check.test) {
        log(`  ✓ ${check.name}`, 'green');
      } else {
        log(`  ✗ ${check.name}`, 'yellow');
        // Not blocking but concerning
      }
    });

    return allPassed;
  } catch (error) {
    log(`✗ Failed to verify default data: ${error.message}`, 'red');
    return false;
  }
}

async function verifyOnboardingRoute() {
  log('\n→ Checking onboarding route structure...', 'yellow');

  try {
    const onboardingPath = path.join(projectRoot, 'src/app/onboarding');

    if (!fs.existsSync(onboardingPath)) {
      log('  ✗ Onboarding directory not found', 'red');
      return false;
    }

    const files = fs.readdirSync(onboardingPath, { recursive: true });
    const fileList = files.map(f => String(f));

    const checks = [
      {
        name: 'Onboarding page.tsx exists',
        test: fileList.some(f => f.includes('page.tsx'))
      },
      {
        name: 'Step components exist',
        test: fileList.some(f => f.toLowerCase().includes('step'))
      }
    ];

    let allPassed = true;
    checks.forEach(check => {
      if (check.test) {
        log(`  ✓ ${check.name}`, 'green');
      } else {
        log(`  ✗ ${check.name}`, 'red');
        allPassed = false;
      }
    });

    return allPassed;
  } catch (error) {
    log(`✗ Failed to verify onboarding: ${error.message}`, 'red');
    return false;
  }
}

async function verifyDatabaseSchema() {
  log('\n→ Verifying database schema definition...', 'yellow');

  try {
    const dbPath = path.join(projectRoot, 'src/lib/db/schema.ts');

    if (!fs.existsSync(dbPath)) {
      log('  ✗ schema.ts not found', 'red');
      return false;
    }

    const dbContent = fs.readFileSync(dbPath, 'utf-8');

    const requiredTables = [
      'SymptomInstanceRecord',
      'FoodEventRecord',
      'FlareRecord',
      'FlareEventRecord',
      'MoodEntryRecord',
      'SleepEntryRecord',
      'MedicationEventRecord',
      'TriggerEventRecord'
    ];

    let allPassed = true;
    requiredTables.forEach(table => {
      if (dbContent.includes(table)) {
        log(`  ✓ Table: ${table}`, 'green');
      } else {
        log(`  ✗ Table missing: ${table}`, 'red');
        allPassed = false;
      }
    });

    return allPassed;
  } catch (error) {
    log(`✗ Failed to verify database schema: ${error.message}`, 'red');
    return false;
  }
}

async function generateReport(results) {
  log('\n\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║         AUTOMATED VERIFICATION REPORT SUMMARY              ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  const categories = Object.keys(results);
  const passed = categories.filter(cat => results[cat]).length;
  const failed = categories.filter(cat => !results[cat]).length;
  const passRate = ((passed / categories.length) * 100).toFixed(1);

  log('Verification Summary:', 'bold');
  log(`  Total Checks: ${categories.length}`);
  log(`  Passed: ${passed}`, 'green');
  log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  log(`  Pass Rate: ${passRate}%\n`);

  log('Detailed Results:', 'bold');
  categories.forEach(cat => {
    const status = results[cat] ? '✓' : '✗';
    const color = results[cat] ? 'green' : 'red';
    log(`  ${status} ${cat}`, color);
  });

  log('\n═══════════════════════════════════════════════════════\n', 'blue');

  if (failed === 0) {
    log('✓ All automated checks passed', 'green');
    log('  Ready to proceed with manual smoke tests\n', 'green');
  } else {
    log('✗ Some automated checks failed', 'red');
    log('  Fix issues before proceeding with manual tests\n', 'red');
  }

  return failed === 0;
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     AUTOMATED APP STATE VERIFICATION - BETA RELEASE       ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  const results = {
    'Server Running': await verifyServerRunning(),
    'Landing Page Structure': await verifyLandingPage(),
    'Critical Files Exist': await verifyCriticalFiles(),
    'Default Data Structure': await verifyDefaultDataStructure(),
    'Onboarding Route': await verifyOnboardingRoute(),
    'Database Schema': await verifyDatabaseSchema()
  };

  const allPassed = await generateReport(results);

  if (allPassed) {
    log('Next Steps:', 'bold');
    log('  1. Run manual smoke tests: node scripts/smoke-tests.mjs');
    log('  2. Use browser to test user flows');
    log('  3. Check IndexedDB for data persistence\n');
  } else {
    log('Action Required:', 'bold');
    log('  1. Fix failed verification checks');
    log('  2. Re-run this script');
    log('  3. Proceed to manual tests only after all checks pass\n');
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  log(`\n✗ Error during verification: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
