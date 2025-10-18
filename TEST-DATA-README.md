# Symptom Tracker Test Data Generator

This directory contains scripts to populate your browser's localStorage with realistic historical data for testing the Symptom Tracker application.

## Files

- `test-data-generator.html` - Interactive web page with buttons to generate/clear test data
- `generate-test-data.js` - JavaScript snippet to run in browser console

## What Data Gets Generated

### 📊 Symptoms (45-60 entries)
- **Time Range**: Last 6 months
- **Categories**: Joint Pain, Fatigue, Headache, Digestive, Mood, Skin, Sleep, Other
- **Features**:
  - Realistic severity patterns (higher in winter, improving over time)
  - Various locations and triggers
  - Random notes and durations
  - Proper timestamps and IDs

### 📅 Daily Entries (80-100 entries)
- **Coverage**: ~80% of days over 6 months (realistic gaps)
- **Health Metrics**: Overall health, energy, sleep quality, stress
- **Correlations**: Symptoms affect daily health scores
- **Extras**: Weather data, mood, medication tracking, notes

### 🏷️ Categories (8 predefined)
- Joint Pain, Fatigue, Headache, Digestive, Mood, Skin, Sleep, Other
- Each with appropriate colors and icons

### 🔍 Filter Presets (3 saved)
- "Recent Severe Symptoms" (severity 7-10, last 30 days)
- "Joint Pain History" (category filter, last 90 days)
- "This Month" (current month only)

## How to Use

### Option 1: HTML Page (Recommended)
1. Open `test-data-generator.html` in your web browser
2. Click "🚀 Generate Test Data"
3. Refresh your Symptom Tracker app to see the data

### Option 2: Browser Console
1. Open your Symptom Tracker app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the contents of `generate-test-data.js`
5. Press Enter to run
6. Refresh the page to see the data

**To clear data from console:** After running the script, you can call `clearSymptomTrackerData()` in the console.

### Option 3: Direct localStorage
If you prefer to modify the scripts, the data is stored under these keys:
- `pst:symptoms` - Symptom data
- `pst-entry-history` - Daily entry data
- `pst:symptom-categories` - Category definitions
- `pst:symptom-filter-presets` - Saved filter presets

## Clearing Test Data

Use the "🗑️ Clear All Data" button in the HTML page, or run this in console:
```javascript
['pst:symptoms', 'pst-entry-history', 'pst:symptom-categories', 'pst:symptom-filter-presets', 'pst-entry-templates', 'pst-active-template', 'pst-offline-entry-queue', 'pst-calendar-filter-presets', 'symptom-tracker-backups', 'symptom-tracker-backup-settings', 'pocket:onboarding-state', 'pocket:user-settings'].forEach(key => localStorage.removeItem(key));
```

## Data Patterns

The generated data includes realistic patterns:
- **Seasonal variation**: Symptoms tend to be worse in winter months
- **Improvement over time**: Recent entries show slightly lower severity
- **Correlations**: Daily health scores reflect symptom severity
- **Realistic gaps**: Not every day has entries (80% coverage)
- **Varied content**: Different locations, triggers, and notes

This provides a comprehensive dataset for testing filtering, analytics, and UI components.