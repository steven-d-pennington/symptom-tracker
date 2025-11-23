# Troubleshooting Guide

## Common Development Issues

### HMR (Hot Module Reload) Cache Issues

**Symptom:** Error like "Module was instantiated but the module factory is not available. It might have been deleted in an HMR update."

**Root Cause:** Turbopack's HMR cache has a stale reference to a module that was changed or removed.

**Solutions (in order of preference):**

1. **Browser Hard Reload** (Fastest)
   - Chrome/Edge: `Ctrl + Shift + R` or `Ctrl + F5`
   - Firefox: `Ctrl + Shift + R`
   - Chrome DevTools: Right-click refresh → "Empty Cache and Hard Reload"

2. **Clean Development Server**
   ```powershell
   npm run dev:clean
   ```
   This clears the `.next` build cache and restarts the dev server.

3. **Manual Clean**
   ```powershell
   # Stop the dev server (Ctrl+C)
   rm -Recurse -Force .next
   npm run dev
   ```

4. **Full Cache Clear** (If still having issues)
   ```powershell
   # Stop the dev server
   rm -Recurse -Force .next
   # Then hard reload in browser
   npm run dev
   ```

### When to Use Each Method

- **Browser hard reload**: Use this first for HMR errors. Works 90% of the time.
- **npm run dev:clean**: Use when switching branches or after pulling major changes.
- **Full cache clear**: Use when experiencing persistent weird behavior after updates.

### Prevention Tips

1. **After switching branches:**
   ```powershell
   npm run dev:clean
   ```

2. **After npm install/update:**
   ```powershell
   rm -Recurse -Force .next
   npm run dev
   ```

3. **Keep browser DevTools open** during development with "Disable cache" checked (in Network tab).

## Other Common Issues

### TypeScript Errors Not Updating

If TypeScript errors aren't clearing after fixing code:
1. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Or restart dev server

### Database Schema Changes Not Applying

If IndexedDB schema changes aren't reflected:
1. Clear browser storage: DevTools → Application → Storage → Clear site data
2. Or use incognito/private browsing for testing schema changes

### Test Failures After Code Changes

```powershell
npm run test:coverage
```
Make sure you're running tests after making changes to verify functionality.

## Browser DevTools Settings for Development

**Recommended Chrome DevTools settings:**
1. Open DevTools (F12)
2. Network tab → Check "Disable cache"
3. Application tab → Service Workers → Check "Update on reload"

This prevents cache-related issues during development.
