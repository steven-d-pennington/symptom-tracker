# Task NAV-01: Navigation System Implementation

**Status:** 🔄 In Progress
**Estimated Hours:** 8 hours
**Actual Hours:** 0 hours
**Priority:** High
**Dependencies:** Phase 1 & 2 Complete

## Overview
Implement a hybrid responsive navigation system that provides mobile-first bottom tabs and desktop sidebar navigation, creating a seamless native-app-like experience across all devices.

## Objectives
- ✅ Create persistent navigation accessible from any page
- ✅ Optimize for mobile thumb-friendly interaction
- ✅ Provide rich desktop navigation with sidebar
- ✅ Maintain accessibility and keyboard navigation
- ✅ Support PWA standalone mode
- ✅ Respect iOS safe areas and notches

## Task Breakdown

### Step 1: Create Navigation Hook (0.5 hours)
**File:** `src/components/navigation/hooks/useActiveRoute.tsx`

Create a custom hook to detect and manage active routes:
```typescript
export function useActiveRoute() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return { pathname, isActive };
}
```

**Acceptance Criteria:**
- [ ] Hook correctly identifies active routes
- [ ] Works with nested routes
- [ ] Handles root route correctly
- [ ] TypeScript types defined

---

### Step 2: Create Media Query Hook (0.5 hours)
**File:** `src/hooks/useMediaQuery.tsx`

Create a responsive breakpoint detection hook:
```typescript
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

**Acceptance Criteria:**
- [ ] Detects breakpoint changes
- [ ] SSR-safe (no hydration errors)
- [ ] Cleans up event listeners
- [ ] TypeScript types defined

---

### Step 3: Build TopBar Component (1 hour)
**File:** `src/components/navigation/TopBar.tsx`

Top navigation bar with title, back button, and actions:
```typescript
interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}
```

**Features:**
- Page title (dynamic)
- Conditional back button
- Right-side action buttons
- Sync status indicator
- Offline badge

**Acceptance Criteria:**
- [ ] Displays current page title
- [ ] Back button navigates correctly
- [ ] Actions slot renders custom content
- [ ] Responsive text sizing
- [ ] Accessible (ARIA labels)

---

### Step 4: Build BottomTabs Component (1.5 hours)
**File:** `src/components/navigation/BottomTabs.tsx`

Mobile bottom tab navigation (5 primary routes):
```typescript
const tabs = [
  { icon: FileText, label: 'Log', href: '/log' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Camera, label: 'Gallery', href: '/photos' },
  { icon: Map, label: 'Map', href: '/body-map' },
  { icon: Menu, label: 'More', href: '/more' },
];
```

**Features:**
- Fixed bottom positioning
- Active state highlighting
- Icon + label layout
- Safe area padding (iOS)
- Touch-optimized (44px min height)

**Styling:**
- Active: Primary color, bold label
- Inactive: Muted color
- Smooth transitions (150ms)
- Backdrop blur effect

**Acceptance Criteria:**
- [ ] All 5 tabs render correctly
- [ ] Active tab highlighted
- [ ] Navigation works on tap
- [ ] Safe area padding applied
- [ ] Accessible with screen reader

---

### Step 5: Build Sidebar Component (1.5 hours)
**File:** `src/components/navigation/Sidebar.tsx`

Desktop sidebar navigation with grouped sections:
```typescript
const sections = [
  {
    title: 'Primary',
    items: [
      { icon: FileText, label: 'Daily Log', href: '/log' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Calendar, label: 'Calendar', href: '/' },
    ],
  },
  {
    title: 'Health Tracking',
    items: [
      { icon: Map, label: 'Body Map', href: '/body-map' },
      { icon: Camera, label: 'Photos', href: '/photos' },
      { icon: Flame, label: 'Active Flares', href: '/flares' },
      { icon: BarChart3, label: 'Triggers', href: '/triggers' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings' },
      { icon: Download, label: 'Export', href: '/export' },
      { icon: Lock, label: 'Privacy', href: '/privacy' },
    ],
  },
];
```

**Features:**
- Fixed left positioning (w-64 = 256px)
- Grouped navigation sections
- Section headers with dividers
- Active route highlighting
- Hover states
- Collapsible option (future)

**Styling:**
- Background: card color
- Border: right border subtle
- Active: Primary background + accent border
- Hover: Subtle background change

**Acceptance Criteria:**
- [ ] All sections render with items
- [ ] Active route highlighted correctly
- [ ] Hover states work
- [ ] Keyboard navigable
- [ ] Scrollable if content overflows

---

### Step 6: Build NavLayout Wrapper (1 hour)
**File:** `src/components/navigation/NavLayout.tsx`

Responsive wrapper that switches between mobile and desktop layouts:
```typescript
export function NavLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <DesktopLayout>{children}</DesktopLayout>
  );
}
```

**Mobile Layout:**
- TopBar at top
- Content with pb-16 (bottom tab height)
- BottomTabs fixed at bottom

**Desktop Layout:**
- Sidebar on left (w-64)
- TopBar spanning remaining width
- Content in main area

**Acceptance Criteria:**
- [ ] Switches correctly at 768px breakpoint
- [ ] No layout shift on resize
- [ ] Children render in correct area
- [ ] No hydration errors

---

### Step 7: Create More Page (0.5 hour)
**File:** `src/app/(protected)/more/page.tsx`

Secondary navigation page for mobile (5th tab):
- Settings
- Export Data
- Privacy Policy
- About
- Version info
- Logout (future)

**Acceptance Criteria:**
- [ ] Lists all secondary features
- [ ] Links navigate correctly
- [ ] Styled consistently
- [ ] Shows app version

---

### Step 8: Update Root Layout (1 hour)
**File:** `src/app/layout.tsx`

Integrate NavLayout into the app structure:
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <OnboardingRedirectGate />
        <NavLayout>
          {children}
        </NavLayout>
        <OfflineIndicator />
        <InstallPrompt />
        <UpdateNotification />
      </body>
    </html>
  );
}
```

**Considerations:**
- Home page (`/`) should NOT show navigation (landing page)
- Protected routes show navigation
- Onboarding flow should NOT show navigation
- Route group structure: `(main-nav)` for pages with nav

**Acceptance Criteria:**
- [ ] Navigation shows on protected routes
- [ ] Landing page has no navigation
- [ ] Onboarding flow unaffected
- [ ] No layout shift on navigation

---

### Step 9: Add Keyboard Navigation (0.5 hours)

Implement keyboard shortcuts and focus management:
- Tab through nav items
- Enter/Space to activate
- Arrow keys for tab navigation
- Escape to close dialogs
- Focus visible indicators

**Acceptance Criteria:**
- [ ] Tab order is logical
- [ ] Enter/Space activates links
- [ ] Focus indicators visible
- [ ] Works with screen readers

---

### Step 10: Test Responsiveness (0.5 hours)

Test across viewports and devices:
- Mobile: 375px, 390px, 414px
- Tablet: 768px, 834px, 1024px
- Desktop: 1280px, 1440px, 1920px
- iOS Safari (safe areas)
- PWA standalone mode

**Acceptance Criteria:**
- [ ] Mobile viewports show bottom tabs
- [ ] Desktop viewports show sidebar
- [ ] Transitions smooth at breakpoint
- [ ] Safe area padding correct on iOS
- [ ] Standalone mode works correctly

---

## Implementation Notes

### CSS Classes (Tailwind)
```css
/* Bottom Tabs */
.bottom-tabs {
  @apply fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border;
  @apply pb-safe; /* iOS safe area */
  @apply md:hidden; /* Hide on desktop */
}

/* Sidebar */
.sidebar {
  @apply fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border;
  @apply hidden md:block; /* Show on desktop only */
}

/* TopBar */
.top-bar {
  @apply h-14 bg-card border-b border-border;
  @apply md:ml-64; /* Offset for sidebar on desktop */
}

/* Content Area */
.main-content {
  @apply pb-16 md:pb-0; /* Padding for bottom tabs on mobile */
  @apply md:ml-64; /* Offset for sidebar on desktop */
  @apply pt-14; /* Offset for top bar */
}
```

### Safe Area CSS Variables
```css
/* In globals.css */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
  --safe-area-inset-right: env(safe-area-inset-right);
}
```

### Icon Library
Use `lucide-react` icons:
- FileText (Daily Log)
- LayoutDashboard (Dashboard)
- Camera (Gallery)
- Map (Body Map)
- Menu (More)
- Calendar, Flame, BarChart3, Settings, etc.

## Testing Strategy

1. **Unit Tests:**
   - useActiveRoute hook
   - useMediaQuery hook
   - NavItem component

2. **Integration Tests:**
   - NavLayout switches correctly
   - Active states update on navigation
   - Keyboard navigation works

3. **Visual Tests:**
   - Mobile viewport renders correctly
   - Desktop viewport renders correctly
   - Breakpoint transitions smooth

4. **Accessibility Tests:**
   - Screen reader announces navigation
   - Keyboard navigation complete
   - Focus indicators visible
   - ARIA labels present

## Documentation Updates

After completion, update:
- [ ] `build-docs/README.md` - Add navigation system section
- [ ] `IMPLEMENTATION_STATUS.md` - Mark navigation complete
- [ ] `QUICK_START.md` - Document navigation usage
- [ ] This task file - Mark all steps complete

## Definition of Done
- [ ] All 10 steps completed
- [ ] Components render on mobile and desktop
- [ ] Active route highlighting works
- [ ] Keyboard navigation functional
- [ ] Accessibility tested with screen reader
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Code reviewed and committed

## Hours Tracking
| Step | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| 1. useActiveRoute hook | 0.5h | - | |
| 2. useMediaQuery hook | 0.5h | - | |
| 3. TopBar component | 1.0h | - | |
| 4. BottomTabs component | 1.5h | - | |
| 5. Sidebar component | 1.5h | - | |
| 6. NavLayout wrapper | 1.0h | - | |
| 7. More page | 0.5h | - | |
| 8. Update root layout | 1.0h | - | |
| 9. Keyboard navigation | 0.5h | - | |
| 10. Testing | 0.5h | - | |
| **Total** | **8.0h** | **0h** | |

## Related Files
- `src/components/navigation/*`
- `src/hooks/useMediaQuery.tsx`
- `src/app/layout.tsx`
- `src/app/(protected)/more/page.tsx`
- `build-docs/navigation-system.md`
