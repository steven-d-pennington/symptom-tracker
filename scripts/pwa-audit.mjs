#!/usr/bin/env node
import fs from "fs";
import path from "path";

const rootDir = path.resolve(new URL(".", import.meta.url).pathname, "..");
const projectPaths = {
  manifest: path.join(rootDir, "public", "manifest.json"),
  serviceWorkerSrc: fs.existsSync(path.join(rootDir, "src", "sw.ts"))
    ? path.join(rootDir, "src", "sw.ts")
    : path.join(rootDir, "public", "sw.js"),
  offlineHtml: path.join(rootDir, "public", "offline.html"),
  offlineImage: path.join(rootDir, "public", "offline-image.svg"),
  connectivityComponent: path.join(rootDir, "src", "components", "pwa", "NetworkBanner.tsx"),
  layout: path.join(rootDir, "src", "app", "layout.tsx"),
  readme: path.join(rootDir, "README.md"),
  e2eTest: path.join(rootDir, "tests", "e2e", "offline.spec.ts"),
};

const results = [];

function addResult(name, passed, details = "") {
  results.push({ name, passed, details });
  const icon = passed ? "✓" : "✗";
  const message = details && !passed ? ` (${details})` : details && passed ? ` (${details})` : "";
  console.log(`${icon} ${name}${message}`);
}

function ensureFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    addResult(label, false, `${path.relative(rootDir, filePath)} missing`);
    return false;
  }
  addResult(label, true);
  return true;
}

// Manifest checks
if (ensureFileExists(projectPaths.manifest, "Manifest file")) {
  try {
    const manifest = JSON.parse(fs.readFileSync(projectPaths.manifest, "utf8"));
    const requiredFields = [
      "name",
      "short_name",
      "display",
      "start_url",
      "scope",
      "theme_color",
      "background_color",
    ];
    const missingFields = requiredFields.filter((field) => !manifest[field]);
    const displayStandalone = manifest.display === "standalone";

    if (missingFields.length === 0 && displayStandalone) {
      addResult("Manifest required fields", true);
    } else {
      const problems = [];
      if (missingFields.length > 0) {
        problems.push(`missing: ${missingFields.join(", ")}`);
      }
      if (!displayStandalone) {
        problems.push("display must be 'standalone'");
      }
      addResult("Manifest required fields", false, problems.join("; "));
    }

    const iconSizes = Array.isArray(manifest.icons)
      ? manifest.icons.map((icon) => icon.sizes)
      : [];
    const has192 = iconSizes.some((size) => size?.split(" ").includes("192x192"));
    const has512 = iconSizes.some((size) => size?.split(" ").includes("512x512"));
    addResult("Manifest icons 192 & 512", has192 && has512);
  } catch (error) {
    addResult("Manifest parse", false, error.message);
  }
}

// Service worker registration
const registrationFiles = [
  path.join(rootDir, "src", "lib", "hooks", "useServiceWorker.ts"),
  path.join(rootDir, "src", "app", "layout.tsx"),
  path.join(rootDir, "src", "app", "providers", "ServiceWorkerProvider.tsx"),
].filter((filePath) => fs.existsSync(filePath));

const registrationPattern = /navigator\.serviceWorker\.register\(\s*["'`]\/sw\.js["'`]/;
const registrationExists = registrationFiles.some((filePath) =>
  registrationPattern.test(fs.readFileSync(filePath, "utf8"))
);
addResult("Service worker registration", registrationExists);

// Service worker capabilities
if (ensureFileExists(projectPaths.serviceWorkerSrc, "Service worker source")) {
  const swSource = fs.readFileSync(projectPaths.serviceWorkerSrc, "utf8");
  const checks = [
    {
      name: "Precaching configured",
      pattern: /precacheAndRoute\(/,
    },
    {
      name: "Static asset runtime caching",
      pattern: /StaleWhileRevalidate\(\{\s*cacheName: ['"]assets-sw['"]/, // keep simple
    },
    {
      name: "Images & fonts cached",
      pattern: /CacheFirst\(\{[\s\S]*cacheName: ['"]static-imm['"][\s\S]*ExpirationPlugin/,
    },
    {
      name: "API GET caching",
      pattern: /url\.pathname\.startsWith\(['"]\/api\/['"]\)[\s\S]*NetworkFirst\(/,
    },
    {
      name: "Background sync mutations",
      pattern: /new BackgroundSyncPlugin\(['"]symptomUpdatesQueue['"]/,
    },
    {
      name: "Offline fallbacks",
      pattern: /setCatchHandler\(/,
    },
    {
      name: "Offline document fallback",
      pattern: /offline\.html/,
    },
    {
      name: "Offline image fallback",
      pattern: /offline-image\.svg/,
    },
  ];

  checks.forEach(({ name, pattern }) => {
    addResult(name, pattern.test(swSource));
  });
}

ensureFileExists(projectPaths.offlineHtml, "offline.html present");
ensureFileExists(projectPaths.offlineImage, "offline-image.svg present");
ensureFileExists(projectPaths.connectivityComponent, "Connectivity banner component");

if (ensureFileExists(projectPaths.layout, "Layout file")) {
  const layoutSource = fs.readFileSync(projectPaths.layout, "utf8");
  addResult("Connectivity banner mounted", /NetworkBanner/.test(layoutSource));
}

if (ensureFileExists(projectPaths.readme, "README")) {
  const readme = fs.readFileSync(projectPaths.readme, "utf8");
  addResult("README offline docs", /##\s+.*offline/i.test(readme));
}

ensureFileExists(projectPaths.e2eTest, "Offline E2E test file");

const failed = results.some((result) => !result.passed);

if (failed) {
  console.error("\nPWA audit failed. Please address the items marked with ✗.");
  process.exit(1);
} else {
  console.log("\nPWA audit passed ✅");
}
