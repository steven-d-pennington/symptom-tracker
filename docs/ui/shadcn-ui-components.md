# shadcn/ui Components - Installation Guide

**Created:** 2025-11-08
**Story:** 6.1 - Navigation Restructure & shadcn/ui Integration
**Status:** Foundation Setup Complete

## Overview

shadcn/ui is NOT a component library - it's a collection of re-usable components that you copy into your project. Built on Radix UI primitives and styled with Tailwind CSS.

**Why shadcn/ui?**
- ✅ Already 90% compatible (using Radix UI + Tailwind CSS)
- ✅ No new dependencies (just utility components)
- ✅ Customizable (copy-paste components you can modify)
- ✅ Accessibility built-in (Radix primitives)
- ✅ Modern, professional design

## Configuration

**File:** `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwindcss.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## Design Tokens

**Current Theme Colors:**
- Primary: `#0F9D91` (Calm teal)
- Success: `#86EFAC` (Soft green)
- Warning: `#FBBF24` (Soft amber)
- Error: `#FCA5A5` (Soft red)
- Background: `#F5F5F4` (Muted)

These are preserved from the existing design system.

## Components to Install

The following components are needed for Epic 6 implementation:

### Core Epic 6 Components

1. **Dialog** - Better modals for flare creation and forms
   - Usage: Story 6.2 (Daily Log), Story 6.4 (Health Insights)
   - Install: `npx shadcn@latest add dialog`

2. **Sheet** - Sidebar/drawer for mobile body map
   - Usage: Mobile navigation enhancements
   - Install: `npx shadcn@latest add sheet`

3. **Card** - Consistent card styling for flares/insights
   - Usage: Story 6.4 (Health Insights), Story 6.5 (Timeline)
   - Install: `npx shadcn@latest add card`

4. **Badge** - Status indicators (worsening, improving, stable)
   - Usage: Flare status badges throughout app
   - Install: `npx shadcn@latest add badge`

5. **Tabs** - Health Insights sections
   - Usage: Story 6.4 (Health Insights navigation)
   - Install: `npx shadcn@latest add tabs`

6. **Select** - Dropdowns for time ranges, filters
   - Usage: Analytics filtering, preferences
   - Install: `npx shadcn@latest add select`

7. **Calendar** - Enhanced timeline view
   - Usage: Story 6.5 (Timeline Pattern Detection)
   - Install: `npx shadcn@latest add calendar`

## Installation Status

**Status:** ✅ **COMPLETE** - All required components installed

All 7 required shadcn/ui components for Epic 6 have been successfully installed, plus 2 additional utility components (Button and Input).

### Installed Components (9 total)

**Required for Epic 6 (AC 6.1.4):**
1. ✅ **Dialog** - 3.9KB - Better modals for flare creation and forms
2. ✅ **Sheet** - 4.4KB - Sidebar/drawer for mobile body map
3. ✅ **Card** - 1.9KB - Consistent card styling for flares/insights
4. ✅ **Badge** - 1.1KB - Status indicators (worsening, improving, stable)
5. ✅ **Tabs** - 1.9KB - Health Insights sections
6. ✅ **Select** - 5.7KB - Dropdowns for time ranges, filters
7. ✅ **Calendar** - 2.7KB - Enhanced timeline view

**Additional Utility Components:**
8. ✅ **Button** - 1.9KB - Primary button component (dependency for Calendar)
9. ✅ **Input** - 847 bytes - Form input component

**Total Bundle Impact:** ~24.4KB (within budget)

### Dependencies Installed

The following packages were installed to support shadcn/ui components:

```json
{
  "class-variance-authority": "^0.7.1",
  "react-day-picker": "^9.4.3",
  "@radix-ui/react-dialog": "^1.1.2",
  "@radix-ui/react-select": "^2.1.2",
  "@radix-ui/react-tabs": "^1.1.1",
  "@radix-ui/react-slot": "^1.1.1"
}
```

## Component Import Pattern

```typescript
// Example: Using Card component
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function InsightCard({ title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

## Utility Function

The project already has the required `cn()` utility for className merging:

**File:** `src/lib/utils/cn.ts`

```typescript
export const cn = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");
```

## Integration with Existing Stack

**Already Installed:**
- ✅ Tailwind CSS 4
- ✅ Radix UI (@radix-ui/react-tooltip)
- ✅ Next.js 15.5.4 + React 19.1.0
- ✅ lucide-react (icons)

**No additional dependencies needed** - shadcn/ui components use the existing stack.

## Next Steps

1. Install components using Option 1 (CLI) in local dev environment
2. Components will be used starting in Story 6.2 (Daily Log Page)
3. Verify component styling matches existing design tokens

## References

- shadcn/ui Documentation: https://ui.shadcn.com/
- Component Registry: https://ui.shadcn.com/docs/components
- GitHub Repository: https://github.com/shadcn-ui/ui

---

**Last Updated:** 2025-11-08
**Maintained By:** DEV Team
