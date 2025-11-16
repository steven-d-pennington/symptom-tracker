# Cache Fix Implementation

**Date**: 2025-11-12
**Issue**: Users had to hard refresh to see recent changes; navigating away and back showed old content

---

## Root Causes Identified

### 1. Service Worker Aggressive Caching
- **Problem**: HTML pages were using "stale-while-revalidate" strategy
- **Impact**: Service worker served cached HTML first, fetched updates in background
- **Result**: Users saw old component state until hard refresh

### 2. Next.js Router Cache
- **Problem**: Next.js 15 caches pages and data fetches on client-side navigation
- **Impact**: Re-visiting pages showed cached data instead of fresh data
- **Result**: Data changes weren't visible until full page reload

---

## Solutions Implemented

### 1. Service Worker Cache Strategy Updates

**File**: `public/sw.js`

**Changes**:
- Updated cache version from `v1` to `v2` to bust all existing caches
- Changed HTML page strategy from `STALE_WHILE_REVALIDATE` to `NETWORK_FIRST`
- Changed API calls from `NETWORK_FIRST` to `NETWORK_ONLY` (no caching)
- Added special handling for dynamic pages (`/body-map`, `/dashboard`, `/insights`) to always use `NETWORK_ONLY`

**Before**:
```javascript
const CACHE_VERSION = 'v1';

// HTML pages - stale while revalidate
if (request.headers.get('accept')?.includes('text/html')) {
  strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
}

// API calls - network first
if (url.pathname.startsWith('/api/')) {
  strategy = CACHE_STRATEGIES.NETWORK_FIRST;
}
```

**After**:
```javascript
const CACHE_VERSION = 'v2';

// HTML pages - network first to prevent stale content
if (request.headers.get('accept')?.includes('text/html')) {
  strategy = CACHE_STRATEGIES.NETWORK_FIRST;
}

// API calls - network only (no caching)
if (url.pathname.startsWith('/api/')) {
  strategy = CACHE_STRATEGIES.NETWORK_ONLY;
}

// Special handling for dynamic pages - always fetch fresh
if (url.pathname.startsWith('/body-map') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/insights')) {
  strategy = CACHE_STRATEGIES.NETWORK_ONLY;
}
```

### 2. Force Data Refresh on Body Map Page

**File**: `src/app/(protected)/body-map/page.tsx`

**Changes**:
- Added `useEffect` that runs on component mount
- Calls `refetchFlares()` and `refreshMarkers()` to invalidate cached data
- Ensures fresh data is always loaded when page is visited

**Code Added**:
```typescript
// Force data refresh on mount to prevent stale cache issues
useEffect(() => {
  // Invalidate any cached data when component mounts
  refetchFlares();
  refreshMarkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Only run once on mount - dependencies intentionally omitted
```

---

## How to Test the Fix

### Step 1: Clear Existing Caches
Since we updated the service worker, you need to clear old caches:

1. **Option A - Hard Refresh (Recommended)**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Option B - Manual Clear**:
   - Open DevTools (F12)
   - Go to Application tab → Storage
   - Click "Clear site data"
   - Refresh the page

### Step 2: Verify Service Worker Update
1. Open DevTools (F12)
2. Go to Application tab → Service Workers
3. Verify you see version `1.1.0` and `CACHE_VERSION = 'v2'`
4. If old version is still active, click "Unregister" then refresh

### Step 3: Test the Fix
1. **Navigate to body-map page**
   - Select "Pain" layer
   - Verify you see current marker cards with update/resolve options

2. **Create a new pain marker**
   - Click the + button
   - Select pain layer
   - Create a marker
   - Verify the card appears immediately

3. **Navigate away and back**
   - Go to Dashboard
   - Return to body-map page
   - Select "Pain" layer again
   - **Expected**: Should see updated cards WITHOUT hard refresh

4. **Test other layers**
   - Switch between Flares, Pain, and Inflammation
   - Verify all show correct, up-to-date cards

---

## Expected Behavior After Fix

### ✅ What Should Work Now:
- Navigating to body-map page always shows fresh data
- Switching layers shows current marker cards
- Creating markers shows them immediately
- Navigating away and back shows updated content
- **No hard refresh needed** for regular navigation

### ⚠️ When You Still Need Hard Refresh:
- After deploying new code changes (development)
- After updating the service worker itself
- When clearing browser data/cache

---

## Technical Details

### Cache Strategies Explained

**CACHE_FIRST**:
- Check cache first, use network as fallback
- Used for: Static assets (JS, CSS, images)
- Benefit: Fast loading, offline support

**NETWORK_FIRST**:
- Try network first, fall back to cache if offline
- Used for: HTML pages
- Benefit: Fresh content when online, offline fallback

**NETWORK_ONLY**:
- Always fetch from network, no caching
- Used for: Dynamic pages, API calls
- Benefit: Always current data

**STALE_WHILE_REVALIDATE** (removed for HTML):
- Serve cached version, update cache in background
- Problem: User sees old content first
- Solution: Replaced with NETWORK_FIRST

### Why This Approach?

1. **Balance Performance and Freshness**:
   - Static assets still cached (fast loading)
   - Dynamic content always fresh (no stale data)

2. **Offline Support Maintained**:
   - NETWORK_FIRST falls back to cache when offline
   - Users can still access pages without connection

3. **Developer Experience**:
   - Code changes visible immediately
   - No need to manually bust cache during development

---

## Rollback Instructions

If this causes issues, you can rollback:

1. **Revert Service Worker**:
   ```bash
   git diff HEAD~1 public/sw.js
   git checkout HEAD~1 -- public/sw.js
   ```

2. **Revert Body Map Changes**:
   ```bash
   git diff HEAD~1 src/app/(protected)/body-map/page.tsx
   git checkout HEAD~1 -- src/app/(protected)/body-map/page.tsx
   ```

3. **Force Update Service Worker**:
   - Clear browser cache
   - Hard refresh
   - Unregister service worker in DevTools

---

## Monitoring

Watch for these potential issues:

1. **Increased Network Usage**:
   - Pages now fetch fresh instead of using cache
   - Monitor on slow connections

2. **Offline Behavior**:
   - Test offline mode still works
   - NETWORK_FIRST should fall back to cache

3. **Performance**:
   - Page load times on revisit
   - Should be minimal impact due to Next.js prefetching

---

## Future Improvements (Optional)

### Smart Cache Invalidation
Instead of always fetching fresh, implement:
- Cache based on data mutation timestamps
- Invalidate cache only when data changes
- Use ETag headers for conditional requests

### Selective Caching
- Cache HTML but invalidate on navigation
- Use React Query's staleTime/cacheTime settings
- Implement SWR (stale-while-revalidate) at data layer, not HTML layer

### Cache Busting Strategy
- Add version query params to HTML requests
- Tie cache to deployment hash
- Auto-invalidate on new deployments
