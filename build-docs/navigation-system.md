# Navigation System - Hybrid Mobile/Desktop Pattern

## Overview
Implement a hybrid navigation system optimized for both mobile PWA and desktop usage. Mobile users get thumb-friendly bottom tabs, while desktop users get a persistent sidebar with expanded navigation options.

## Design Pattern
**Hybrid Responsive Navigation**
- Mobile (< 768px): Top bar + Bottom tab navigation
- Desktop (≥ 768px): Top bar + Sidebar navigation
- Consistent experience across breakpoints
- Native app feel on mobile devices

## Component Architecture

```
src/components/navigation/
├── TopBar.tsx              # Page title, back button, actions
├── BottomTabs.tsx          # Mobile bottom navigation (5 tabs)
├── Sidebar.tsx             # Desktop sidebar navigation
├── NavLayout.tsx           # Wrapper that switches between mobile/desktop
├── NavItem.tsx             # Shared navigation item component
└── hooks/
    └── useActiveRoute.tsx  # Hook for detecting active route
```

## Navigation Structure

### Bottom Tabs (Mobile Primary Navigation)
1. **📝 Log** - `/log` - Daily entry workspace
2. **📊 Dashboard** - `/dashboard` - Overview and stats
3. **📷 Gallery** - `/photos` - Photo management
4. **🗺️ Map** - `/body-map` - Body mapping
5. **⚙️ More** - `/more` - Settings and secondary features

### Sidebar (Desktop Navigation)
Organized into logical sections:

**Primary Actions**
- 📝 Daily Log
- 📊 Dashboard
- 📅 Calendar

**Health Tracking**
- 🗺️ Body Map
- 📷 Photo Gallery
- 🔥 Active Flares
- 📊 Trigger Analysis

**Settings & More**
- ⚙️ Settings
- 📤 Export Data
- 🔒 Privacy
- ℹ️ About

### Top Bar (All Devices)
- **Left:** Back button (contextual) or Home icon
- **Center:** Current page title
- **Right:** Notifications icon, sync status indicator

## Technical Implementation

### Route Detection
```typescript
// Hook to detect active route
const useActiveRoute = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return { pathname, isActive };
};
```

### Responsive Layout
```typescript
// NavLayout component switches based on breakpoint
const NavLayout = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <DesktopLayout>{children}</DesktopLayout>
  );
};
```

### Mobile Layout Structure
```
┌─────────────────────────┐
│ TopBar (h-14)           │
├─────────────────────────┤
│                         │
│  Page Content           │
│  (with bottom padding)  │
│                         │
├─────────────────────────┤
│ BottomTabs (h-16)       │
└─────────────────────────┘
```

### Desktop Layout Structure
```
┌──────────┬──────────────────┐
│          │ TopBar (h-14)    │
│ Sidebar  ├──────────────────┤
│ (w-64)   │                  │
│          │  Page Content    │
│          │                  │
└──────────┴──────────────────┘
```

## Styling Guidelines

### Bottom Tabs
- Fixed position at bottom
- Safe area padding for iOS notch/home indicator
- Active state: Primary color with icon + label
- Inactive state: Muted color, icon only option on small screens
- Smooth transitions between states
- Touch target minimum 44px height

### Sidebar
- Fixed position on left
- Collapsible option for medium screens
- Grouped sections with dividers
- Hover states for desktop
- Active route highlighted with background + border accent

### Accessibility
- ARIA labels for all nav items
- Keyboard navigation (Tab, Enter, Arrow keys)
- Focus visible indicators
- Screen reader announcements for route changes
- Skip to content link

## Animation & Transitions
- Page transitions: 200ms ease-out
- Tab switching: Scale + fade (150ms)
- Sidebar collapse: 250ms ease-in-out
- Active state: Subtle scale (1.05x) on tap

## Offline Considerations
- Show sync status in top bar
- Disable navigation during critical operations
- Queue route changes if offline and target requires network
- Visual feedback for offline state

## PWA Integration
- Bottom tab bar respects safe areas
- Standalone mode detection
- Install prompt accessible from More tab
- Update notification in top bar

## Performance
- Code split navigation components
- Lazy load sidebar on desktop
- Preload tab routes on hover/focus
- Memoize active route calculations

## Future Enhancements
- Search in top bar
- Quick actions FAB (floating action button)
- Swipe gestures for tab navigation
- Breadcrumb navigation for deep pages
- Recently visited pages
- Customizable tab order (user preference)

## Dependencies
- `next/navigation` - usePathname, useRouter
- `lucide-react` - Icons
- Custom `useMediaQuery` hook or library
- Tailwind CSS for responsive styles

## Testing Checklist
- [ ] Mobile viewport (375px, 390px, 414px)
- [ ] Tablet viewport (768px, 834px, 1024px)
- [ ] Desktop viewport (1280px, 1440px, 1920px)
- [ ] Keyboard navigation works
- [ ] Screen reader announces navigation
- [ ] Active states correct on all routes
- [ ] Safe area padding on iOS
- [ ] Transitions smooth at 60fps
- [ ] Works in standalone PWA mode
- [ ] Offline state handled gracefully
