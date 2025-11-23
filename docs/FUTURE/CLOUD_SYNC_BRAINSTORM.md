# Cloud Sync Brainstorming - Pocket Symptom Tracker

**Date:** 2025-11-02
**Purpose:** Explore architecture options for adding cloud synchronization to the symptom tracker app

---

## 🎯 Project Context

**Current State:**
- 100% local-first app using IndexedDB (Dexie.js)
- No authentication or cloud backend
- 12+ tables with ~200+ records per active user
- Encrypted photo storage (AES-256-GCM)
- Multi-user ready architecture (all data scoped by userId)
- Export/import functionality (JSON/CSV)
- PWA with offline capabilities

**Goal:**
Enable seamless cloud synchronization while maintaining:
- Privacy and security
- Offline-first functionality
- Fast, responsive UX
- Data ownership by users

---

## 🏗️ Architecture Options

### Option 1: **CRDTs (Conflict-Free Replicated Data Types)**

**Concept:** Use mathematical structures that guarantee eventual consistency without conflicts

**Technologies:**
- Yjs or Automerge for CRDT library
- WebSocket or WebRTC for real-time sync
- Backend: Node.js + Yjs server or Automerge-repo

**Pros:**
- ✅ Automatic conflict resolution
- ✅ Real-time collaboration possible
- ✅ Works great offline
- ✅ No "merge conflicts" for users
- ✅ Great for text fields, lists, maps

**Cons:**
- ❌ Learning curve for CRDT data structures
- ❌ Larger data overhead (metadata for merging)
- ❌ May need to restructure some data models
- ❌ Limited support for complex relational data

**Best for:** Real-time sync, collaborative features (e.g., sharing symptom logs with doctors)

**Effort:** High (3-4 weeks initial implementation)

---

### Option 2: **Last-Write-Wins (LWW) with Timestamp Vector Clocks**

**Concept:** Use timestamps + vector clocks to determine newest version

**Technologies:**
- Custom sync service
- Backend: Supabase, Firebase, or custom REST API
- Timestamp-based conflict resolution

**Pros:**
- ✅ Simple to understand and implement
- ✅ Works with existing data model (already have createdAt/updatedAt)
- ✅ Low overhead
- ✅ Fast sync operations

**Cons:**
- ❌ Potential data loss (last write wins, earlier changes discarded)
- ❌ Doesn't handle concurrent edits well
- ❌ Need to track device/client IDs for vector clocks
- ❌ Users might lose work if not careful

**Best for:** Single-user syncing across devices (most common use case)

**Effort:** Medium (2-3 weeks)

---

### Option 3: **Event Sourcing + Operational Transform (OT)**

**Concept:** Store all changes as events, replay to build current state

**Technologies:**
- Event store (PostgreSQL with JSONB, EventStoreDB)
- Kafka/Redis Streams for event distribution
- OT library for text conflict resolution

**Pros:**
- ✅ Already using event pattern for flares (ADR-003)
- ✅ Complete audit trail
- ✅ Can replay history
- ✅ Time-travel debugging
- ✅ Great for compliance (medical data)

**Cons:**
- ❌ High complexity
- ❌ Larger storage requirements
- ❌ Need to implement event projections
- ❌ May require significant refactoring

**Best for:** Medical compliance, audit trails, enterprise customers

**Effort:** Very High (6-8 weeks)

---

### Option 4: **Differential Sync (Google's DiffMatchPatch)**

**Concept:** Send only the differences between versions

**Technologies:**
- DiffMatchPatch library
- Backend: Any REST API (Express, FastAPI)
- Checksum-based change detection

**Pros:**
- ✅ Bandwidth efficient
- ✅ Works well with text-heavy data
- ✅ Proven technology (used by Google Docs)
- ✅ Can merge concurrent changes

**Cons:**
- ❌ Complex for structured data (not just text)
- ❌ Need to implement diff/patch for each data type
- ❌ May not work well with binary data (photos)

**Best for:** Symptom notes, medication instructions (text fields)

**Effort:** High (4-5 weeks)

---

### Option 5: **Hybrid: Optimistic Sync + Server-Side Reconciliation**

**Concept:** Client optimistically updates, server resolves conflicts using rules

**Technologies:**
- Supabase Realtime or Firebase Firestore
- Client-side optimistic updates
- Server-side Cloud Functions for conflict resolution
- Exponential backoff retry logic

**Pros:**
- ✅ Fast UX (optimistic updates)
- ✅ Flexible conflict resolution (custom business logic)
- ✅ Can handle complex scenarios
- ✅ Users see changes immediately

**Cons:**
- ❌ Need to handle rollbacks on conflict
- ❌ Complex state management
- ❌ Requires robust error handling
- ❌ Server logic can get complex

**Best for:** Balance of UX and reliability

**Effort:** Medium-High (3-4 weeks)

---

## 🔐 Authentication Strategies

### Option A: **Magic Link Email Authentication**

**How it works:**
- User enters email
- Server sends one-time login link
- Click link → logged in (JWT token)

**Pros:**
- ✅ No password management
- ✅ Secure (short-lived tokens)
- ✅ Simple UX
- ✅ Works great for health apps

**Cons:**
- ❌ Requires email server
- ❌ Depends on email delivery reliability

**Tools:** Supabase Auth, NextAuth.js, Auth0

---

### Option B: **OAuth (Google, Apple, Microsoft)**

**How it works:**
- "Sign in with Google" button
- Redirect to OAuth provider
- Return with access token

**Pros:**
- ✅ No credential storage
- ✅ Users trust familiar brands
- ✅ Easy account recovery
- ✅ Built-in 2FA often available

**Cons:**
- ❌ Privacy concerns (sharing data with big tech)
- ❌ Dependent on third-party availability
- ❌ May conflict with health data privacy goals

**Tools:** NextAuth.js, Clerk, Supabase Auth

---

### Option C: **Passkey / WebAuthn (Future-proof)**

**How it works:**
- Biometric authentication (Face ID, Touch ID)
- Device-based cryptographic keys
- No passwords at all

**Pros:**
- ✅ Most secure option
- ✅ Best UX (biometric login)
- ✅ Phishing-resistant
- ✅ Growing browser support

**Cons:**
- ❌ Newer technology (limited support on older devices)
- ❌ Requires HTTPS
- ❌ Need fallback for unsupported browsers

**Tools:** SimpleWebAuthn, Passage.id, Hanko

---

### Option D: **Anonymous Auth + Optional Email Linking**

**How it works:**
- Start with anonymous account (UUID)
- Optionally link email later for sync
- Data migrates seamlessly

**Pros:**
- ✅ Zero friction onboarding
- ✅ Privacy-first (can use without email)
- ✅ Easy upgrade path
- ✅ Great for sensitive health data

**Cons:**
- ❌ Account recovery challenging (if anonymous)
- ❌ More complex implementation

**Tools:** Firebase Anonymous Auth, Supabase + custom implementation

---

## 🔄 Data Synchronization Patterns

### Pattern 1: **Full Sync (Pull Everything)**

**How:**
- On login: Download entire user dataset
- Overwrite local IndexedDB
- Push local changes if newer

**Best for:** Small datasets (<1MB), initial sync

**Pros:** Simple, guaranteed consistency
**Cons:** Slow for large datasets, bandwidth-heavy

---

### Pattern 2: **Incremental Sync (Delta Sync)**

**How:**
- Track `lastSyncTimestamp` per device
- Query: "Give me all changes since timestamp X"
- Apply changes locally, send local changes to server
- Update `lastSyncTimestamp`

**Best for:** Most use cases, efficient sync

**Pros:** Fast, bandwidth-efficient
**Cons:** Need to track sync state per device

**Implementation:**
```typescript
interface SyncMetadata {
  deviceId: string;
  lastSyncTimestamp: Date;
  pendingChanges: number;
}

async function incrementalSync(deviceId: string) {
  const metadata = await getSyncMetadata(deviceId);

  // Pull remote changes
  const remoteChanges = await fetchChanges(metadata.lastSyncTimestamp);
  await applyChanges(remoteChanges);

  // Push local changes
  const localChanges = await getLocalChanges(metadata.lastSyncTimestamp);
  await pushChanges(localChanges);

  // Update metadata
  await updateSyncMetadata(deviceId, new Date());
}
```

---

### Pattern 3: **Change Queue with Retry**

**How:**
- Local writes go to queue
- Background worker syncs queue to server
- Retry with exponential backoff on failure
- Show sync status indicator

**Best for:** Offline-first apps (like this one!)

**Pros:** Robust offline support, eventual consistency
**Cons:** More complex, need queue management

**Implementation:**
```typescript
interface SyncQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: any;
  attempts: number;
  createdAt: Date;
}

// Add to queue on any write
await db.syncQueue.add({
  operation: 'create',
  table: 'symptoms',
  recordId: symptom.id,
  data: symptom
});

// Background worker
setInterval(processSyncQueue, 30000); // Every 30s
```

---

### Pattern 4: **Real-time Sync (WebSocket)**

**How:**
- Open WebSocket connection when online
- Push changes immediately
- Receive changes in real-time
- Fallback to polling if WebSocket unavailable

**Best for:** Collaborative features, live updates

**Pros:** Instant sync, great UX
**Cons:** More complex, battery drain, server costs

---

## ⚔️ Conflict Resolution Strategies

### Strategy 1: **Last-Write-Wins (Simple)**

```typescript
function resolveConflict(local, remote) {
  return local.updatedAt > remote.updatedAt ? local : remote;
}
```

**Pros:** Simple, fast
**Cons:** Data loss possible

---

### Strategy 2: **Field-Level Merging**

```typescript
function resolveConflict(local, remote) {
  const merged = { ...remote };

  for (const [key, value] of Object.entries(local)) {
    if (local.updatedAt > remote.updatedAt) {
      merged[key] = value;
    }
  }

  return merged;
}
```

**Pros:** Preserves more data
**Cons:** Complex, may create invalid states

---

### Strategy 3: **User-Prompted Resolution**

```typescript
function resolveConflict(local, remote) {
  // Show UI: "Conflict detected. Which version do you want to keep?"
  return await showConflictDialog(local, remote);
}
```

**Pros:** User has control, no data loss
**Cons:** Interrupts workflow, complex UX

---

### Strategy 4: **Semantic Merging (Custom Logic)**

```typescript
function resolveConflict(local, remote, table) {
  switch (table) {
    case 'symptoms':
      // For symptoms, merge tags and keep higher severity
      return {
        ...local,
        tags: [...new Set([...local.tags, ...remote.tags])],
        severity: Math.max(local.severity, remote.severity)
      };

    case 'dailyEntries':
      // For daily entries, merge arrays (symptoms, medications)
      return {
        ...local,
        symptoms: mergeArrays(local.symptoms, remote.symptoms),
        medications: mergeArrays(local.medications, remote.medications)
      };

    default:
      return local.updatedAt > remote.updatedAt ? local : remote;
  }
}
```

**Pros:** Intelligent, preserves user intent
**Cons:** Complex, need custom logic per table

---

## 🛡️ Security & Privacy Considerations

### End-to-End Encryption (E2EE)

**Option 1: Client-Side Encryption**
- Generate encryption key from user password (PBKDF2)
- Encrypt all data before sending to server
- Server stores encrypted blobs (zero-knowledge)

**Pros:**
- ✅ Maximum privacy (server can't read data)
- ✅ Compliance-friendly (HIPAA, GDPR)

**Cons:**
- ❌ Password reset = data loss (unless key backup)
- ❌ No server-side search/analytics
- ❌ Complex key management

**Tools:** Web Crypto API, libsodium.js

---

**Option 2: Server-Side Encryption at Rest**
- Server stores data encrypted with master key
- Decrypts for authenticated users

**Pros:**
- ✅ Easier password reset
- ✅ Server can perform search/analytics
- ✅ Simpler implementation

**Cons:**
- ❌ Server can read user data
- ❌ Less privacy (depends on trust)

---

### Photo Sync Strategy

**Photos are already encrypted locally (AES-256-GCM). Options:**

1. **Sync encrypted blobs directly**
   - Upload encrypted photo + IV + metadata
   - Server stores as-is
   - Download and decrypt locally

2. **Use cloud storage (S3, Cloudflare R2)**
   - Upload to signed URL
   - Store reference in database
   - Lazy-load photos when needed

3. **Hybrid: Thumbnails sync, full-res on demand**
   - Always sync small thumbnails
   - Download full-res when user opens photo
   - Saves bandwidth

**Recommendation:** Option 3 (hybrid) for best UX/bandwidth balance

---

## ☁️ Backend Technology Options

### Option 1: **Supabase (PostgreSQL + Realtime)**

**What it is:** Open-source Firebase alternative with PostgreSQL

**Features:**
- PostgreSQL database with Row-Level Security (RLS)
- Realtime subscriptions (WebSocket)
- Built-in auth (email, OAuth, magic link)
- Storage for photos (S3-compatible)
- Edge Functions (Deno) for custom logic

**Pros:**
- ✅ Fast development
- ✅ Great TypeScript support
- ✅ Generous free tier
- ✅ Self-hostable (can migrate later)
- ✅ Built-in RLS for multi-tenant security

**Cons:**
- ❌ Vendor lock-in (if not self-hosting)
- ❌ PostgreSQL may be overkill for simple sync

**Cost:** Free up to 500MB database, then $25/month

**Effort:** Low (1-2 weeks integration)

---

### Option 2: **Firebase / Firestore**

**What it is:** Google's mobile/web backend platform

**Features:**
- NoSQL document database (Firestore)
- Realtime sync built-in
- Authentication (many providers)
- Cloud Storage for photos
- Offline persistence (client-side)

**Pros:**
- ✅ Easiest to implement
- ✅ Automatic offline sync
- ✅ Great mobile support
- ✅ Scales automatically

**Cons:**
- ❌ Google dependency (privacy concerns for health data)
- ❌ Expensive at scale
- ❌ NoSQL limitations (complex queries)
- ❌ Difficult to self-host

**Cost:** Free up to 1GB, then pay-per-read/write

**Effort:** Low (1-2 weeks)

---

### Option 3: **Custom Backend (Node.js/Express + PostgreSQL)**

**What it is:** Build your own REST API

**Stack:**
- Node.js + Express + TypeScript
- PostgreSQL or MongoDB
- JWT authentication
- WebSocket (Socket.io) for realtime

**Pros:**
- ✅ Full control
- ✅ No vendor lock-in
- ✅ Can optimize for specific use case
- ✅ Cost-effective at scale

**Cons:**
- ❌ Longer development time
- ❌ Need to handle infrastructure
- ❌ Maintenance burden

**Cost:** VPS ($5-20/month), database hosting

**Effort:** High (4-6 weeks)

---

### Option 4: **Cloudflare Workers + D1 (Edge Computing)**

**What it is:** Serverless functions at the edge with SQLite database

**Features:**
- D1 (SQLite) distributed globally
- Workers (V8 isolates) for API logic
- R2 (S3-compatible) for photo storage
- Extremely low latency

**Pros:**
- ✅ Global edge network (fast anywhere)
- ✅ Very cheap ($5/month for most apps)
- ✅ Scales to zero
- ✅ Great developer experience

**Cons:**
- ❌ Newer platform (less mature)
- ❌ D1 still in beta
- ❌ SQLite limitations (concurrent writes)

**Cost:** Free tier is generous, $5/month for production

**Effort:** Medium (2-3 weeks)

---

### Option 5: **PocketBase (Self-Hosted)**

**What it is:** Single-file backend (Go binary)

**Features:**
- SQLite database
- Built-in auth, file storage, realtime
- Admin UI
- Runs anywhere (Docker, VPS, Raspberry Pi)

**Pros:**
- ✅ Simplest self-hosting
- ✅ One binary, no dependencies
- ✅ Built-in admin panel
- ✅ Free (just hosting costs)

**Cons:**
- ❌ SQLite may not scale to thousands of users
- ❌ Need to manage hosting
- ❌ Smaller community

**Cost:** Hosting only ($5-10/month)

**Effort:** Medium (2-3 weeks)

---

## 📱 Offline-First Implementation Strategy

### Core Principles

1. **Local data is source of truth**
2. **UI never blocks on network**
3. **Sync happens in background**
4. **Clear sync status indicators**

### Implementation Pattern

```typescript
// Write-through cache pattern
async function createSymptom(data: SymptomInput) {
  // 1. Write locally immediately (optimistic)
  const symptom = await db.symptoms.add({
    ...data,
    id: uuidv4(),
    userId: getCurrentUserId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    _syncStatus: 'pending' // New field
  });

  // 2. Update UI (instant feedback)
  updateUI(symptom);

  // 3. Queue for sync
  await db.syncQueue.add({
    operation: 'create',
    table: 'symptoms',
    recordId: symptom.id,
    data: symptom,
    attempts: 0
  });

  // 4. Attempt sync in background (don't await)
  syncInBackground().catch(console.error);

  return symptom;
}

// Background sync worker
async function syncInBackground() {
  if (!navigator.onLine) return;

  const queue = await db.syncQueue.toArray();

  for (const item of queue) {
    try {
      // Send to server
      await api.sync(item);

      // Mark as synced
      await db.symptoms.update(item.recordId, { _syncStatus: 'synced' });
      await db.syncQueue.delete(item.id);
    } catch (error) {
      // Retry with exponential backoff
      await db.syncQueue.update(item.id, {
        attempts: item.attempts + 1,
        lastError: error.message
      });
    }
  }
}
```

### Sync Status UI

```typescript
// Show sync indicator in header
function SyncIndicator() {
  const [status, setStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  return (
    <div className="sync-status">
      {status === 'synced' && <Check className="text-green-500" />}
      {status === 'syncing' && <RotateCw className="animate-spin text-blue-500" />}
      {status === 'offline' && <CloudOff className="text-gray-400" />}
    </div>
  );
}
```

---

## 🚀 Migration Path (Phased Rollout)

### Phase 1: **Authentication & User Accounts** (Week 1-2)

**Goals:**
- Add authentication system
- Migrate anonymous users to accounts
- Preserve existing local data

**Tasks:**
- [ ] Add auth provider (Supabase/Firebase/NextAuth)
- [ ] Create login/signup UI
- [ ] Implement magic link or OAuth
- [ ] Migrate `default-user-id` to real user IDs
- [ ] Add user profile page

**Migration Strategy:**
```typescript
// On first login, migrate local data
async function migrateLocalDataToAccount(newUserId: string) {
  const oldUserId = 'default-user-id';

  // Update all records with new userId
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.where('userId').equals(oldUserId).modify({ userId: newUserId });
    }
  });

  localStorage.setItem('pocket:currentUserId', newUserId);
}
```

---

### Phase 2: **Cloud Database Setup** (Week 2-3)

**Goals:**
- Set up backend infrastructure
- Create database schema
- Deploy API endpoints

**Tasks:**
- [ ] Choose backend (recommendation: Supabase for speed)
- [ ] Create cloud database schema (mirror local IndexedDB)
- [ ] Set up Row-Level Security (RLS) policies
- [ ] Create API endpoints (REST or GraphQL)
- [ ] Add API authentication (JWT tokens)
- [ ] Deploy to production

**Schema Example (Supabase):**
```sql
CREATE TABLE symptoms (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT,
  severity_scale JSONB,
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own symptoms"
  ON symptoms
  FOR ALL
  USING (auth.uid() = user_id);
```

---

### Phase 3: **One-Way Sync (Local → Cloud Backup)** (Week 3-4)

**Goals:**
- Implement cloud backup
- Users can manually backup data
- No conflict resolution yet (one-way only)

**Tasks:**
- [ ] Add "Backup to Cloud" button
- [ ] Implement full sync upload
- [ ] Show backup status (last backup time)
- [ ] Add backup history
- [ ] Test with large datasets

**Implementation:**
```typescript
async function backupToCloud() {
  const userId = getCurrentUserId();

  // Export all data
  const data = await exportService.exportAll(userId);

  // Upload to cloud
  await api.post('/backup', { data, timestamp: new Date() });

  // Update local metadata
  await db.metadata.put({ key: 'lastBackup', value: new Date() });
}
```

---

### Phase 4: **Two-Way Sync (Basic)** (Week 4-6)

**Goals:**
- Enable syncing across devices
- Implement incremental sync
- Basic conflict resolution (last-write-wins)

**Tasks:**
- [ ] Implement delta sync (pull changes since lastSyncTimestamp)
- [ ] Add sync queue for local changes
- [ ] Implement background sync worker
- [ ] Add conflict detection
- [ ] Implement last-write-wins resolution
- [ ] Add sync status indicators
- [ ] Test multi-device scenarios

---

### Phase 5: **Photo Sync** (Week 6-7)

**Goals:**
- Sync encrypted photos to cloud storage
- Lazy-load full-resolution images

**Tasks:**
- [ ] Set up cloud storage (S3/R2/Supabase Storage)
- [ ] Upload encrypted photos
- [ ] Sync thumbnails automatically
- [ ] Lazy-load full-res on demand
- [ ] Add photo sync progress indicator
- [ ] Implement photo caching strategy

---

### Phase 6: **Advanced Conflict Resolution** (Week 7-8)

**Goals:**
- Smarter conflict resolution
- Preserve more user data

**Tasks:**
- [ ] Implement field-level merging
- [ ] Add semantic merging for specific tables
- [ ] Create conflict resolution UI (if needed)
- [ ] Add conflict logging for debugging
- [ ] Test edge cases

---

### Phase 7: **Real-time Sync (Optional)** (Week 8-9)

**Goals:**
- Near-instant sync
- Push notifications for changes

**Tasks:**
- [ ] Add WebSocket connection
- [ ] Implement real-time change notifications
- [ ] Add optimistic UI updates
- [ ] Handle connection drops gracefully
- [ ] Test battery impact on mobile

---

## 📊 Recommended Architecture (Balanced Approach)

After analyzing all options, here's my recommendation for your symptom tracker:

### **Recommended Stack**

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend** | Supabase (PostgreSQL) | Fast development, great TypeScript support, self-hostable |
| **Auth** | Magic Link (Supabase Auth) | Privacy-friendly, simple UX |
| **Sync Pattern** | Incremental sync + change queue | Offline-first, bandwidth-efficient |
| **Conflict Resolution** | Last-write-wins + semantic merging | Simple for most cases, smart for important data |
| **Photo Storage** | Supabase Storage (S3-compatible) | Integrates seamlessly, cost-effective |
| **Encryption** | Client-side for photos, server-side for text | Balance of privacy and functionality |
| **Real-time** | Phase 2 feature (use polling initially) | Keep initial implementation simple |

### **Architecture Diagram**

```
┌─────────────────────────────────────────────────────┐
│                  User's Browser                     │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │         Next.js App (React)                  │ │
│  │  - UI Components                             │ │
│  │  - Optimistic updates                        │ │
│  └────────────┬────────────────────────────────┘ │
│               │                                    │
│  ┌────────────▼────────────────────────────────┐ │
│  │      Sync Service (Client)                  │ │
│  │  - Change queue                              │ │
│  │  - Conflict detection                        │ │
│  │  - Background worker                         │ │
│  └────────────┬────────────────────────────────┘ │
│               │                                    │
│  ┌────────────▼────────────────────────────────┐ │
│  │      IndexedDB (Dexie)                      │ │
│  │  - Local-first storage                       │ │
│  │  - Offline support                           │ │
│  │  - Source of truth                           │ │
│  └──────────────────────────────────────────────┘ │
└─────────────┬───────────────────────────────────┘
              │
              │ HTTPS (REST API + JWT)
              │
┌─────────────▼───────────────────────────────────┐
│              Supabase Cloud                     │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      Authentication Service              │  │
│  │  - Magic link emails                     │  │
│  │  - JWT token generation                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      PostgreSQL Database                 │  │
│  │  - User data (symptoms, entries, etc.)   │  │
│  │  - Row-Level Security (RLS)              │  │
│  │  - Timestamps for sync                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      Storage (S3-compatible)             │  │
│  │  - Encrypted photos                      │  │
│  │  - Thumbnails                            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      Edge Functions (optional)           │  │
│  │  - Conflict resolution logic             │  │
│  │  - Analytics aggregation                 │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 💡 Key Design Decisions

### 1. **Start with One-Way Backup, Then Add Two-Way Sync**
- Lower risk of data loss
- Users can test cloud backup before relying on sync
- Easier to implement and debug

### 2. **Last-Write-Wins for Most Data, Semantic Merging for Critical Data**
- Simple default behavior
- Custom logic for arrays (symptoms, medications in daily entries)
- User-prompted resolution only for major conflicts

### 3. **Keep IndexedDB as Source of Truth**
- Maintains offline-first architecture
- Fast UI (no network waits)
- Cloud is backup/sync layer, not primary storage

### 4. **Encrypt Photos Client-Side, Other Data Server-Side**
- Photos contain sensitive visual info (encrypt before upload)
- Text data encrypted at rest on server (allows search/analytics)
- Balance of privacy and functionality

### 5. **Lazy-Load Photos, Eager-Sync Metadata**
- Always sync small data (symptoms, entries)
- Photos sync in background
- Download full-res photos on-demand

---

## 🎯 Quick Start Implementation Plan

**If you want to start TODAY, here's the fastest path:**

### Week 1: Proof of Concept
```bash
# 1. Set up Supabase project (5 min)
npx supabase init

# 2. Install dependencies (5 min)
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 3. Create simple auth (1 day)
# - Add login page with magic link
# - Protect routes with middleware
# - Migrate default-user-id to real IDs

# 4. Create symptoms table in Supabase (2 hours)
# - Mirror local schema
# - Add RLS policies

# 5. Implement one-way backup (2 days)
# - "Backup to Cloud" button
# - Upload all symptoms to Supabase
# - Show success message

# 6. Test with real data (1 day)
```

**Total: ~5 days to working proof of concept**

---

## 🔮 Future Enhancements (Post-MVP)

1. **Selective Sync** - Choose which data to sync (e.g., "only last 30 days")
2. **Family Sharing** - Share symptom logs with family/doctors
3. **Export to Doctor Portal** - Generate PDF reports
4. **Automated Insights** - Server-side correlation analysis
5. **Multi-Device Notifications** - "You logged a symptom on your phone"
6. **Conflict History** - Review and undo merge decisions
7. **Data Portability** - Export to Apple Health, Google Fit
8. **End-to-End Encryption Option** - For maximum privacy users
9. **Offline Photo Editing Sync** - Sync annotation changes
10. **Real-time Collaboration** - Live editing with doctor during appointment

---

## 🎓 Learning Resources

**CRDTs:**
- [CRDT Primer](https://crdt.tech/)
- [Yjs Documentation](https://docs.yjs.dev/)

**Supabase:**
- [Supabase Sync Tutorial](https://supabase.com/docs/guides/getting-started)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

**Offline-First:**
- [Offline First Principles](https://offlinefirst.org/)
- [Local-First Software](https://www.inkandswitch.com/local-first/)

**Conflict Resolution:**
- [Operational Transformation](https://operational-transformation.github.io/)
- [Conflict-Free Resolution](https://arxiv.org/abs/1805.06358)

---

## 📝 Open Questions for Discussion

1. **Privacy vs. Functionality:** How much do you want to encrypt? (E2EE vs. server-side)
2. **Self-Hosting:** Do you want the option to self-host the backend?
3. **Collaboration:** Should users be able to share logs with doctors/family?
4. **Pricing Model:** Free tier limits? Premium features?
5. **Data Retention:** How long should cloud keep data? Auto-delete old entries?
6. **Analytics:** Should server perform aggregated analytics (requires decrypted data)?

---

## ✅ Next Steps

1. **Choose backend platform** (recommendation: Supabase)
2. **Prototype authentication** (magic link)
3. **Create cloud schema** (mirror IndexedDB tables)
4. **Implement one-way backup** (lowest risk)
5. **Test with real users** (your own data first!)
6. **Iterate based on feedback**

---

**Let's discuss which direction resonates with you!** 🚀

Which aspects should we dive deeper into?
- Specific sync pattern implementation?
- Security/encryption details?
- Cost analysis?
- Code examples for a specific approach?
