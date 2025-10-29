# Story 3.5.8: Add Keyboard Navigation (Accessibility)

Status: drafted

**Priority:** MEDIUM
**Points:** 5

## Story

As a user relying on keyboard navigation,
I want full keyboard access to all interactive elements,
So that I can use the app without a mouse.

## Acceptance Criteria

1. **AC3.5.8.1 — Tab key navigates through interactive elements:** Tab key moves focus through all interactive elements in logical order: navigation links, buttons, form inputs, cards, following document flow (top to bottom, left to right), skip links provided to jump to main content from header, focus order matches visual layout, no focus traps (can tab out of all components), custom components (modals, dropdowns) support tab navigation. [Source: docs/epics.md#Story-3.5.8]

2. **AC3.5.8.2 — Enter/Space activates buttons and links:** Enter key activates buttons and links (triggers onClick), Space key activates buttons (not links, per HTML standard), custom buttons (div/span with onClick) support Enter and Space, form submission via Enter key in text inputs, dropdown/select components open via Enter or Space, all clickable cards/items support Enter activation. [Source: docs/epics.md#Story-3.5.8]

3. **AC3.5.8.3 — Arrow keys navigate within components:** Arrow keys navigate within listboxes and dropdown menus, up/down arrows move through menu items, left/right arrows can be used for horizontal navigation (e.g., tabs), Home key jumps to first item, End key jumps to last item, follows ARIA Authoring Practices Guide patterns, works in collapsible categories from Stories 3.5.4-5. [Source: docs/epics.md#Story-3.5.8]

4. **AC3.5.8.4 — Escape key closes modals and dropdowns:** Escape key closes open modals and returns focus to trigger element, Escape closes dropdowns and select menus, Escape dismisses popovers and tooltips, Escape cancels in-progress actions (if applicable), focus management: returns to element that triggered modal/dropdown, no nested Escape (single press closes deepest open component). [Source: docs/epics.md#Story-3.5.8]

5. **AC3.5.8.5 — Disable f/b/l/r shortcuts when typing:** Keyboard shortcuts (f, b, l, r for logging actions if they exist) disabled when user is typing in text field, check document.activeElement: if input/textarea has focus, ignore shortcuts, shortcuts re-enabled when focus leaves text field, prevent interference with natural typing, document shortcuts in help/accessibility section. [Source: docs/epics.md#Story-3.5.8] [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User]

6. **AC3.5.8.6 — Focus indicators clearly visible:** All focusable elements have visible focus indicators (outline or ring), focus indicators meet WCAG 2.2 requirements (minimum 2px outline, sufficient contrast), consistent focus styling across app (use Tailwind focus-visible utilities), focus indicators work in light and dark mode, custom focus styles for branded components, don't remove default focus outlines without replacement. [Source: docs/epics.md#Story-3.5.8]

7. **AC3.5.8.7 — Screen reader announcements for state changes:** Dynamic content changes announced via aria-live regions, form errors announced when validation fails, toast notifications use aria-live="polite", loading states announced: "Loading data...", success messages announced after actions complete, modal open/close announced to screen readers, buttons include aria-label when text alone is insufficient (icon buttons). [Source: docs/epics.md#Story-3.5.8]

8. **AC3.5.8.8 — Keyboard shortcuts documented:** Create help/accessibility page documenting all keyboard shortcuts, shortcuts listed: Tab (navigate), Enter (activate), Space (activate button), Escape (close), arrows (navigate menus), shortcuts for logging actions if implemented (f/b/l/r), link to accessibility docs from settings or footer, shortcuts discoverable by users who need them. [Source: docs/epics.md#Story-3.5.8]

## Tasks / Subtasks

- [ ] Task 1: Audit current keyboard navigation (AC: #3.5.8.1)
  - [ ] 1.1: Test Tab key navigation through all pages
  - [ ] 1.2: Document focus order issues (illogical order, skipped elements, traps)
  - [ ] 1.3: Identify interactive elements missing from tab order (missing tabindex)
  - [ ] 1.4: Test modal/dropdown tab trapping (should stay within modal, escape to close)
  - [ ] 1.5: Add skip link to main content: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`

- [ ] Task 2: Implement Enter/Space activation (AC: #3.5.8.2)
  - [ ] 2.1: Audit custom button components (div/span with onClick)
  - [ ] 2.2: Add onKeyDown handler to custom buttons: `if (e.key === 'Enter' || e.key === ' ') { onClick(); }`
  - [ ] 2.3: Ensure custom buttons have role="button" and tabIndex={0}
  - [ ] 2.4: Test Enter key form submission in text inputs
  - [ ] 2.5: Test Space key activation for buttons (not links)
  - [ ] 2.6: Test dropdown/select open via Enter/Space

- [ ] Task 3: Implement arrow key navigation (AC: #3.5.8.3)
  - [ ] 3.1: Add arrow key handlers to listbox components
  - [ ] 3.2: Up/down arrows move focus through items
  - [ ] 3.3: Home key focuses first item, End key focuses last item
  - [ ] 3.4: Update collapsible categories from Stories 3.5.4-5 to support arrow navigation
  - [ ] 3.5: Follow ARIA Authoring Practices Guide for listbox pattern
  - [ ] 3.6: Test arrow navigation in all dropdown/menu components

- [ ] Task 4: Implement Escape key behavior (AC: #3.5.8.4)
  - [ ] 4.1: Add global Escape key listener: `window.addEventListener('keydown', handleEscape)`
  - [ ] 4.2: Escape closes topmost modal and returns focus to trigger
  - [ ] 4.3: Escape closes dropdowns and popovers
  - [ ] 4.4: Escape dismisses tooltips
  - [ ] 4.5: Track focus history for returning focus after modal close
  - [ ] 4.6: Test nested components (modal with dropdown): Escape closes innermost first

- [ ] Task 5: Disable shortcuts when typing (AC: #3.5.8.5)
  - [ ] 5.1: Locate keyboard shortcut implementation (if f/b/l/r shortcuts exist)
  - [ ] 5.2: Check if active element is input/textarea: `document.activeElement?.tagName === 'INPUT'`
  - [ ] 5.3: If input focused, ignore shortcut key presses
  - [ ] 5.4: Test typing in text fields: shortcuts don't interfere
  - [ ] 5.5: Also check contenteditable elements
  - [ ] 5.6: Re-enable shortcuts when focus leaves text field

- [ ] Task 6: Implement consistent focus indicators (AC: #3.5.8.6)
  - [ ] 6.1: Audit existing focus styles across app
  - [ ] 6.2: Update global CSS to use Tailwind focus-visible utilities
  - [ ] 6.3: Add focus-visible:ring-2 focus-visible:ring-blue-500 to interactive elements
  - [ ] 6.4: Ensure 2px outline minimum (WCAG 2.2)
  - [ ] 6.5: Test focus indicators in light and dark mode
  - [ ] 6.6: Verify focus contrast ratios meet WCAG requirements
  - [ ] 6.7: Custom focus styles for branded components (if needed)
  - [ ] 6.8: Never remove focus outlines without replacement

- [ ] Task 7: Add screen reader announcements (AC: #3.5.8.7)
  - [ ] 7.1: Add aria-live regions for dynamic content: `<div aria-live="polite" aria-atomic="true">`
  - [ ] 7.2: Toast notifications use aria-live="polite"
  - [ ] 7.3: Form errors announced when validation fails
  - [ ] 7.4: Loading states announced: add "Loading..." text to aria-live region
  - [ ] 7.5: Success messages announced after actions complete
  - [ ] 7.6: Modal open/close announced (aria-labelledby on modal dialog)
  - [ ] 7.7: Icon buttons have aria-label: `<button aria-label="Close"><X /></button>`
  - [ ] 7.8: Test with screen reader (NVDA, JAWS, or VoiceOver)

- [ ] Task 8: Document keyboard shortcuts (AC: #3.5.8.8)
  - [ ] 8.1: Create help/accessibility page at `/help/keyboard-shortcuts`
  - [ ] 8.2: List all keyboard shortcuts with descriptions
  - [ ] 8.3: Group shortcuts by category: Navigation, Actions, Dialogs, Forms
  - [ ] 8.4: Include visual keyboard icons for clarity
  - [ ] 8.5: Add link to accessibility page in footer
  - [ ] 8.6: Add link to accessibility page in settings menu
  - [ ] 8.7: Consider adding keyboard shortcuts modal (triggered by "?" key)

- [ ] Task 9: Add comprehensive tests (AC: All)
  - [ ] 9.1: Test Tab navigation through all pages (automated with testing-library)
  - [ ] 9.2: Test Enter/Space activation for buttons and links
  - [ ] 9.3: Test arrow key navigation in menus and lists
  - [ ] 9.4: Test Escape key closes modals and dropdowns
  - [ ] 9.5: Test shortcuts disabled when typing in text fields
  - [ ] 9.6: Test focus indicators visible on all interactive elements
  - [ ] 9.7: Test screen reader announcements (manual testing with NVDA/VoiceOver)
  - [ ] 9.8: Run automated accessibility audits (axe-core, Lighthouse)
  - [ ] 9.9: Manual testing: navigate app using only keyboard

## Dev Notes

### Architecture Context

- **WCAG 2.1 AA Compliance:** Story 3.5.8 brings app to WCAG 2.1 Level AA compliance for keyboard accessibility. Foundation for future WCAG 2.2 updates. [Source: docs/epics.md#Story-3.5.8]
- **Voice Logging Future:** Brainstorming session identified voice logging as accessibility necessity (moved from moonshots). Keyboard navigation is prerequisite for full accessibility story. [Source: docs/brainstorming-session-results-2025-10-29.md#Expert-Panel-Review]
- **Complements Modal Redesign:** Stories 3.5.3-5 created new page-based logging flows. Story 3.5.8 ensures these pages are keyboard accessible. [Source: docs/epics.md#Story-3.5.3-5]
- **Flare Modal Issue:** Brainstorming identified f/b/l/r shortcuts conflicting with text input in flare modal description field. Story 3.5.8 fixes this. [Source: docs/brainstorming-session-results-2025-10-29.md#Flare-Tracking-Modal-Issues]

### Implementation Guidance

**Global Keyboard Handler:**
```typescript
// src/lib/hooks/useKeyboardShortcuts.ts
'use client';

import { useEffect } from 'react';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if typing in text field
      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;

      if (isTyping) {
        return; // Don't handle shortcuts when typing
      }

      // Global shortcuts
      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          // Navigate to food logging
          break;
        case 'b':
          e.preventDefault();
          // Navigate to body map
          break;
        case 'l':
          e.preventDefault();
          // Navigate to log page
          break;
        case 'r':
          e.preventDefault();
          // Navigate to resolve flare
          break;
        case '?':
          e.preventDefault();
          // Open keyboard shortcuts help
          break;
        case 'escape':
          // Close topmost modal/dropdown
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

**Focus Visible Utilities:**
```css
/* globals.css */
/* Ensure focus indicators visible and consistent */
*:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 outline-none;
}

.dark *:focus-visible {
  @apply ring-blue-400 ring-offset-gray-900;
}

/* For elements that need custom focus styling */
.custom-focus:focus-visible {
  @apply ring-2 ring-purple-500 ring-offset-2 outline-none;
}
```

**Listbox Arrow Navigation:**
```typescript
// src/components/ui/Listbox.tsx
'use client';

import { useState, useRef } from 'react';

export function Listbox({ items, onSelect }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<HTMLButtonElement[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
        itemRefs.current[Math.min(focusedIndex + 1, items.length - 1)]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        itemRefs.current[Math.max(focusedIndex - 1, 0)]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        itemRefs.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        itemRefs.current[items.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
    }
  };

  return (
    <div role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => (itemRefs.current[index] = el!)}
          role="option"
          aria-selected={index === focusedIndex}
          onFocus={() => setFocusedIndex(index)}
          className="w-full text-left p-2 hover:bg-gray-100 focus-visible:bg-blue-50"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

### Project Structure Notes

**New Files:**
- `src/lib/hooks/useKeyboardShortcuts.ts` - Global keyboard shortcut handler
- `src/app/(protected)/help/keyboard-shortcuts/page.tsx` - Keyboard shortcuts documentation
- `src/components/ui/ScreenReaderOnly.tsx` - Screen reader utility component

**Files to Modify:**
- All interactive components - Add keyboard handlers and focus styles
- Modal components - Add Escape key handling and focus management
- Form components - Ensure Enter key submission works
- Custom button components - Add Enter/Space activation

### Testing Strategy

**Automated Tests:**
- Tab navigation: testing-library userEvent.tab()
- Enter/Space activation: userEvent.keyboard('{Enter}')
- Focus indicators: check computed styles for outline/ring
- ARIA attributes: axe-core accessibility audits

**Manual Tests:**
- Navigate entire app using only keyboard
- Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- Test shortcuts: verify f/b/l/r work, disabled when typing
- Test focus order: logical, follows visual layout

**Accessibility Audits:**
- Run Lighthouse accessibility audit (target 100 score)
- Run axe DevTools extension
- Test with keyboard-only workflow (no mouse)

### References

- [Source: docs/epics.md#Story-3.5.8] - Complete story specification
- [Source: docs/brainstorming-session-results-2025-10-29.md#Flare-Tracking-Modal-Issues] - Keyboard shortcut conflicts
- [Source: docs/brainstorming-session-results-2025-10-29.md#Expert-Panel-Review] - Voice logging accessibility priority
- [Source: ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) - Patterns for keyboard navigation

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-29 | Initial story creation from Epic 3.5 breakdown | Dev Agent (claude-sonnet-4-5) |
