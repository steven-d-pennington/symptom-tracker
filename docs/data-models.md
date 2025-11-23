# Data Models

## Overview

The Symptom Tracker application uses **Dexie.js** (IndexedDB wrapper) for local-first data storage. The database schema has evolved through 30 versions, supporting features like symptom tracking, medication management, food logging, correlation analysis, and cloud sync.

## Database Schema

**Database Name:** `symptom-tracker`

### Core Entities

#### Users (`users`)
- `id`: UUID (Primary Key)
- `email`: String (Optional)
- `name`: String (Optional)
- `preferences`: Object (JSON) - Includes theme, notifications, privacy, export settings, etc.
- `createdAt`: Date
- `updatedAt`: Date

#### Symptoms (`symptoms`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `name`: String
- `category`: String
- `severityScale`: Object (JSON) - Min/max values and labels
- `isActive`: Boolean
- `isDefault`: Boolean
- `isEnabled`: Boolean

#### Symptom Instances (`symptomInstances`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `name`: String
- `severity`: Number
- `timestamp`: Date

#### Medications (`medications`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `name`: String
- `dosage`: String
- `frequency`: String
- `schedule`: Array (JSON)
- `isActive`: Boolean

#### Medication Events (`medicationEvents`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `medicationId`: UUID (Foreign Key)
- `timestamp`: Number (Epoch ms)
- `taken`: Boolean
- `dosage`: String (Optional override)

#### Triggers (`triggers`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `name`: String
- `category`: String
- `isActive`: Boolean

#### Trigger Events (`triggerEvents`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `triggerId`: UUID (Foreign Key)
- `timestamp`: Number (Epoch ms)
- `intensity`: String ('low', 'medium', 'high')

### Daily Tracking

#### Daily Entries (`dailyEntries`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `date`: String (ISO Date)
- `overallHealth`: Number
- `energyLevel`: Number
- `sleepQuality`: Number
- `stressLevel`: Number
- `symptoms`: Array (JSON)
- `medications`: Array (JSON)
- `triggers`: Array (JSON)
- `notes`: String

#### Daily Logs (`dailyLogs`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `date`: String (ISO Date)
- `createdAt`: Date

#### Mood Entries (`moodEntries`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `mood`: Number (1-10)
- `moodType`: String
- `timestamp`: Number

#### Sleep Entries (`sleepEntries`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `hours`: Number
- `quality`: Number
- `timestamp`: Number

### Body Mapping & Markers (Unified System)

#### Body Markers (`bodyMarkers`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `type`: String ('flare', 'pain', 'inflammation')
- `bodyRegionId`: String
- `status`: String ('active', 'resolved')
- `initialSeverity`: Number
- `currentSeverity`: Number
- `currentLifecycleStage`: String (Optional)
- `startDate`: Number
- `endDate`: Number (Optional)

#### Body Marker Events (`bodyMarkerEvents`)
- `id`: UUID (Primary Key)
- `markerId`: UUID (Foreign Key)
- `userId`: UUID (Foreign Key)
- `eventType`: String ('created', 'severity_update', 'trend_change', 'intervention', 'resolved', 'lifecycle_stage_change')
- `timestamp`: Number
- `severity`: Number (Optional)
- `notes`: String

#### Body Marker Locations (`bodyMarkerLocations`)
- `id`: UUID (Primary Key)
- `markerId`: UUID (Foreign Key)
- `bodyRegionId`: String
- `coordinates`: Object ({x, y})
- `userId`: UUID (Foreign Key)

#### Body Map Preferences (`bodyMapPreferences`)
- `userId`: UUID (Primary Key)
- `lastUsedLayer`: String
- `visibleLayers`: Array
- `defaultViewMode`: String

### Food & Nutrition

#### Foods (`foods`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `name`: String
- `category`: String (JSON)
- `allergenTags`: String (JSON)
- `isDefault`: Boolean
- `isActive`: Boolean

#### Food Events (`foodEvents`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `mealId`: UUID
- `foodIds`: String (JSON Array)
- `timestamp`: Number
- `mealType`: String ('breakfast', 'lunch', 'dinner', 'snack')

#### Food Combinations (`foodCombinations`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `foodIds`: String (JSON Array)
- `symptomId`: String
- `combinationCorrelation`: Number
- `synergistic`: Boolean
- `confidence`: String ('high', 'medium', 'low')

### Analysis & Insights

#### Analysis Results (`analysisResults`)
- `id`: Auto-increment (Primary Key)
- `userId`: UUID (Foreign Key)
- `metric`: String
- `timeRange`: String
- `result`: Object (JSON)

#### Correlations (`correlations`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `type`: String
- `item1`: String
- `item2`: String
- `calculatedAt`: Number

#### Pattern Detections (`patternDetections`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `type`: String
- `correlationId`: String
- `detectedAt`: Number

### Attachments

#### Attachments (`attachments`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `type`: String ('photo', 'document')
- `mimeType`: String

#### Photo Attachments (`photoAttachments`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `fileName`: String
- `encryptedData`: Blob
- `thumbnailData`: Blob

#### Photo Comparisons (`photoComparisons`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `beforePhotoId`: String
- `afterPhotoId`: String

### Treatments

#### Treatments (`treatments`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `name`: String
- `category`: String
- `isActive`: Boolean

#### Treatment Events (`treatmentEvents`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `treatmentId`: UUID (Foreign Key)
- `timestamp`: Number
- `duration`: Number
- `effectiveness`: Number

#### Treatment Effectiveness (`treatmentEffectiveness`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `treatmentId`: UUID (Foreign Key)
- `effectivenessScore`: Number

#### Treatment Alerts (`treatmentAlerts`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `treatmentId`: UUID (Foreign Key)
- `alertType`: String

### System

#### UX Events (`uxEvents`)
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `eventType`: String
- `metadata`: String (JSON)
- `timestamp`: Number

#### Sync Metadata (`syncMetadata`)
- `id`: String (Primary Key)
- `lastSync`: Number
- `syncStatus`: String
