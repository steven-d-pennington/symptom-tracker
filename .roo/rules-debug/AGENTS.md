# AGENTS.md - Debug Mode

This file provides debugging-specific guidance for the symptom tracker project.

## Debugging Tools & Techniques

### Browser DevTools Setup
- **React DevTools**: Install browser extension for component inspection
- **IndexedDB Inspector**: Built into DevTools → Application → IndexedDB → symptom-tracker-db
- **Service Worker Debugging**: DevTools → Application → Service Workers

### Database Debugging
- **Clear database**: DevTools → Application → Clear Storage → IndexedDB
- **Inspect tables**: Look in `symptom-tracker-db` for all 12 tables
- **Query performance**: Use `.where()` with indexed fields, check timing in Performance tab
- **Migration issues**: Check console for "Database version mismatch" errors

### Common Debug Scenarios

#### Photo Encryption Issues
- **Key import failures**: Check if encryptionKey is valid hex string
- **Decryption errors**: Verify IV matches between encryption/decryption
- **EXIF data**: Use `stripExifData()` before encryption if privacy issues
- **Blob handling**: Check blob size/type before encryption

#### Repository Pattern Debugging
- **Mock failures**: In tests, ensure Dexie mocks return proper promises
- **Transaction issues**: Wrap multi-table operations in `db.transaction()`
- **Index usage**: Verify queries use `[userId+field]` compound indexes
- **JSON parsing**: Check that stringified arrays are parsed with `JSON.parse()`

#### Component State Debugging
- **Hook dependencies**: Check useEffect dependency arrays for infinite loops
- **Custom hooks**: Debug with `console.log` inside hooks, not components
- **State updates**: Use `useCallback` to prevent unnecessary re-renders
- **Props drilling**: Check for missing props in component hierarchy

### Performance Debugging
- **Slow queries**: Use Performance tab to identify slow IndexedDB operations
- **Photo loading**: Check if photos are being decrypted unnecessarily
- **Analytics caching**: Verify `analysisResults` table is being used for expensive computations
- **Memory leaks**: Check for unsubscribed useEffect cleanup functions

### Test Debugging
- **Jest VM modules**: Use `ts-jest/presets/default-esm` configuration
- **Mock setup**: Ensure `jest.setup.js` properly mocks Canvas and ResizeObserver
- **Async testing**: Use `waitFor()` for state updates, not `setTimeout`
- **Coverage gaps**: Run `npm run test:coverage` to identify untested code paths

### Error Patterns & Solutions

#### "Database version mismatch"
- **Cause**: Schema version changed but migration failed
- **Solution**: Clear IndexedDB and reload, or fix migration in `client.ts`

#### "Photo decryption failed"
- **Cause**: Missing/invalid encryption key or IV
- **Solution**: Check key storage, verify hex format, ensure IV matches

#### "Component re-render infinite loop"
- **Cause**: useEffect dependency array includes unstable references
- **Solution**: Use `useCallback`/`useMemo` for functions/objects in dependencies

#### "Test timeout"
- **Cause**: Async operation not properly awaited
- **Solution**: Use `await waitFor()` instead of `act()` for state updates

### Debugging Commands
```bash
# Debug specific test file
npm test -- src/lib/repositories/__tests__/userRepository.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug Jest configuration
npx jest --showConfig
```

### Console Debugging Patterns
```typescript
// Database query debugging
console.log('Query results:', entries.length, 'entries');

// Component state debugging
console.log('Component state:', { userId, loading, symptoms });

// Performance debugging
console.time('expensive-operation');
// ... operation
console.timeEnd('expensive-operation');
```

### Environment-Specific Issues
- **Development vs Production**: ESLint errors ignored in builds (check next.config.ts)
- **PWA caching**: Service worker may cache old versions, unregister if needed
- **IndexedDB quotas**: Large photo collections may hit storage limits

### Network Debugging (Future Features)
- **Sync failures**: Check network tab for failed API calls (when implemented)
- **Background sync**: Service Worker debugging for offline queue processing
- **Push notifications**: Debug in DevTools → Application → Notifications

### Accessibility Debugging
- **ARIA labels**: Use screen reader simulator in DevTools
- **Keyboard navigation**: Test tab order and focus management
- **Color contrast**: Use Lighthouse audit for contrast issues