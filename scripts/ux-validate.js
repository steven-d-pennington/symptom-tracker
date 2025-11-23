#!/usr/bin/env node
/**
 * UX validation helper
 *
 * Reads the most recent UX instrumentation export (JSON or CSV)
 * from ./.local/ux-events/ or a user-provided --file path and
 * prints a quick summary to the console.
 *
 * Usage:
 *   npm run ux:validate
 *   npm run ux:validate -- --file ./path/to/export.json
 */

const fs = require("fs");
const path = require("path");

const UX_EVENTS_DIR = path.resolve(process.cwd(), ".local", "ux-events");
const SUPPORTED_EXTENSIONS = [".json", ".csv"];

function parseArgs() {
  const [, , ...args] = process.argv;
  const options = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--file" || arg === "-f") {
      options.file = args[i + 1];
      i += 1;
    }
  }

  return options;
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getLatestExport(dir) {
  if (!fs.existsSync(dir)) {
    return null;
  }

  const entries = fs
    .readdirSync(dir)
    .filter(name => SUPPORTED_EXTENSIONS.includes(path.extname(name).toLowerCase()))
    .map(name => {
      const fullPath = path.join(dir, name);
      const stats = fs.statSync(fullPath);
      return { name, fullPath, mtime: stats.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);

  return entries[0] || null;
}

function parseJsonExport(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(content);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.events)) {
    return parsed.events;
  }

  throw new Error("JSON export does not contain an events array.");
}

function parseCsvExport(filePath) {
  const content = fs.readFileSync(filePath, "utf-8").trim();
  const [headerLine, ...rows] = content.split(/\r?\n/);
  const headers = headerLine.split(",").map(h => h.trim());

  return rows.map(row => {
    const values = row.split(",").map(value => value.trim());
    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx];
    });
    return {
      id: record.id || record.eventId || "",
      eventType: record.eventType || record.type || "",
      timestamp: Number(record.timestamp || record.occurredAt || Date.now()),
      metadata: record.metadata ? safeJsonParse(record.metadata) : {},
      raw: record,
    };
  });
}

function safeJsonParse(value) {
  if (typeof value !== "string") {
    return value || {};
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function loadEvents(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".json") {
    return parseJsonExport(filePath);
  }
  if (ext === ".csv") {
    return parseCsvExport(filePath);
  }

  throw new Error(`Unsupported export format: ${ext}`);
}

function summariseEvents(events) {
  const counts = new Map();
  events.forEach(event => {
    const type = event.eventType || "unknown";
    counts.set(type, (counts.get(type) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([eventType, count]) => ({ eventType, count }));
}

function printSummary(filePath, events) {
  if (!events.length) {
    console.log(`No UX events found in ${filePath}.`);
    return;
  }

  console.log(`\n📈 UX events (${events.length}) — ${filePath}\n`);

  console.log("Event type summary:");
  console.table(summariseEvents(events));

  const recent = [...events]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 10)
    .map(event => ({
      id: event.id || event.eventId || "",
      eventType: event.eventType || event.type || "",
      timestamp: event.timestamp || "",
      metadata: JSON.stringify(event.metadata || event.details || {}),
    }));

  console.log("Most recent events:");
  console.table(recent);
}

function printInstructions(dir) {
  console.log("No UX instrumentation exports found.");
  console.log("1. Enable analytics opt-in (Settings → Privacy) in the app.");
  console.log("2. Run through the validation scripts (docs/ui/ux-validation-scripts.md).");
  console.log("3. Export events to JSON via the app and save them under:");
  console.log(`   ${dir}`);
  console.log("4. Re-run `npm run ux:validate` to print the summary.\n");
}

function main() {
  ensureDirectory(UX_EVENTS_DIR);

  const { file } = parseArgs();
  const targetFile = file
    ? path.resolve(process.cwd(), file)
    : getLatestExport(UX_EVENTS_DIR)?.fullPath;

  if (!targetFile || !fs.existsSync(targetFile)) {
    printInstructions(UX_EVENTS_DIR);
    process.exit(0);
  }

  try {
    const events = loadEvents(targetFile);
    printSummary(targetFile, events);
    console.log("Tip: pass a specific export with `npm run ux:validate -- --file ./path/to/export.json`\n");
  } catch (error) {
    console.error(`Failed to read UX events from ${targetFile}`);
    console.error(error.message);
    process.exit(1);
  }
}

main();
