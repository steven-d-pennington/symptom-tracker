# Quick Start Guide - Phase 2 Features

## 🚀 How to Access All Features

### Starting the App
```bash
npm run dev
# Opens at http://localhost:3000
```

### 📍 Available Routes

#### **Main Dashboard** - `/dashboard`
Central hub with access to all features
- Quick navigation cards for all Phase 2 features
- Statistics overview
- Feature descriptions

#### **Photo Gallery** - `/photos`
Encrypted medical photo management
- Upload photos from camera or gallery
- View photos with zoom and pan
- Tag and filter photos
- Monitor storage usage
- All photos encrypted with AES-256-GCM

#### **Active Flare Dashboard** - `/flares`
Real-time symptom flare monitoring
- Track active flares with severity (1-10 scale)
- Monitor flare status (active/improving/worsening/resolved)
- View flare statistics (total active, avg severity, duration)
- Log interventions and effectiveness
- Filter flares by status

#### **Trigger Analysis** - `/triggers`
Correlation analysis between triggers and symptoms
- 90-day correlation analysis
- Visual correlation matrix
- Confidence scoring (low/medium/high)
- AI-generated insights and recommendations
- Pattern detection and warnings

#### **Daily Log** - `/log`
Comprehensive daily health entries
- Health metrics (energy, sleep, mood)
- Symptom tracking
- Medication logging
- Trigger recording
- Body map integration
- Photo documentation (save entry first, then add photos)

#### **Home Page** - `/`
Landing page with feature overview
- Phase 1 & 2 completion badge
- Quick access to all features
- Calendar view
- Symptom tracker

#### **Onboarding** - `/onboarding`
New user setup wizard
- Multi-step configuration
- Privacy education
- Feature introduction

---

## 🎯 Feature Highlights

### Phase 1 Features (Complete ✅)
1. **Onboarding System** - User setup and education
2. **Symptom Tracking** - Flexible symptom recording
3. **Daily Entry System** - Comprehensive health logging
4. **Calendar/Timeline** - Historical data visualization
5. **Data Storage** - Local IndexedDB with Dexie v5
6. **PWA Infrastructure** - Offline support, service workers

### Phase 2 Features (Complete ✅)
7. **Body Mapping** - Visual symptom location (integrated in daily log)
8. **Photo Documentation** - Encrypted photo workflow
9. **Active Flare Dashboard** - Real-time flare monitoring
10. **Enhanced Trigger Tracking** - Correlation analysis

---

## 💡 Usage Tips

### Photo Documentation
1. Go to `/photos` or open from dashboard
2. Click "Add Photo" to capture/upload
3. Photos are automatically encrypted (AES-256-GCM)
4. Use tags to organize (e.g., "Flare", "Healing", "Before Treatment")
5. Filter by date range or tags
6. View storage usage in the storage manager

### Active Flare Tracking
1. Go to `/flares`
2. Click "New Flare" to start tracking
3. Enter symptom name and severity
4. Update status as flare progresses:
   - **Improving** - Flare is getting better
   - **Worsening** - Flare is getting worse
   - **Resolved** - Flare is completely healed
5. View statistics at the top

### Trigger Correlation
1. Go to `/triggers`
2. Log triggers and symptoms in daily entries for 2+ weeks
3. Dashboard automatically analyzes 90 days of data
4. View correlation matrix showing trigger-symptom relationships
5. Read AI insights for recommendations
6. High confidence correlations (>70%) appear at the top

### Daily Entries with Photos
1. Go to `/log`
2. Fill out daily entry form
3. **Save the entry first**
4. Then click "Add Photo" in the Photo section
5. Photos are automatically linked to the entry

---

## 🗄️ Database

**Current Version**: Dexie v5
**Tables**: 10 total
- users
- symptoms
- medications
- triggers
- dailyEntries
- attachments
- bodyMapLocations
- photoAttachments
- photoComparisons
- **flares** (new in Phase 2)

All data stored locally in IndexedDB. No cloud storage.

---

## 🔐 Privacy & Security

- **Local-Only Storage**: All data stays on your device
- **AES-256-GCM Encryption**: Photos encrypted at rest
- **EXIF Stripping**: Location data removed from photos
- **No External Calls**: Zero data transmission without consent
- **Offline-First**: Works without internet

---

## 🎨 UI Navigation

From any page:
- **Home** (/) - Landing page with overview
- **Dashboard** (/dashboard) - Feature hub
- **Daily Log** (/log) - Create entries
- **Photos** (/photos) - Photo gallery
- **Flares** (/flares) - Flare tracking
- **Triggers** (/triggers) - Correlation analysis
- **Onboarding** (/onboarding) - Setup wizard

---

## ✅ What's Working

**Phase 1 (100% Complete)**
- ✅ Full onboarding flow
- ✅ Symptom tracking and categories
- ✅ Daily entry with all sections
- ✅ Calendar and timeline views
- ✅ Data storage and repositories
- ✅ PWA with offline support

**Phase 2 (100% Complete)**
- ✅ Body mapping (11 components)
- ✅ Photo documentation (13 components)
- ✅ Active flare dashboard (4 components)
- ✅ Enhanced trigger tracking (4 components)

**Total**: 47+ Phase 1 components + 30+ Phase 2 components = **75+ components built**

---

## 📋 What's Next (Future Phases)

**Phase 3 - Intelligence Layer** (Planned)
- Data analysis and insights
- Report generation
- Advanced search/filtering

**Phase 4 - Polish & Scale** (Planned)
- Medication management
- Custom trackables
- Settings and customization
- Data import/export enhancements

---

**Need Help?** Check the [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for detailed implementation info.
