# Story 2.7: Mobile Responsive Design and Accessibility

Status: Ready

## Story (Mobile)

As a user on mobile devices,
I want to operate all quick-log flows with one hand,
so that I can log events while in pain or on-the-go.

## Story (Accessibility)

As a user with accessibility needs,
I want to use screen readers and keyboard navigation,
so that the app is usable regardless of my abilities.

## Acceptance Criteria - Mobile Responsive

1. All modals full-screen on mobile (<768px), centered dialog on desktop
2. Tap targets ≥44px for buttons and interactive elements
3. Thumb-zone optimization: important actions in bottom half of screen
4. Sliders operable with thumb (large touch area)
5. Keyboard closes automatically when not needed (severity slider, checkboxes)
6. Tested on iPhone SE (small screen) and iPhone 14 Pro (large screen)

## Acceptance Criteria - Accessibility

1. All interactive elements have ARIA labels
2. Keyboard navigation: Tab through form fields, Enter to submit, Esc to close modals
3. Focus management: when modal opens, focus moves to first input
4. Screen reader announcements: "Flare logged successfully" on save
5. Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for UI components)
6. Severity slider has aria-valuenow, aria-valuemin, aria-valuemax
7. Timeline events have semantic HTML: <article> tags with time element
8. Tested with VoiceOver (iOS) and TalkBack (Android)

## Tasks / Subtasks

- [ ] Audit all Epic 2 components for mobile responsiveness (AC-Mobile: 1-6)
  - [ ] QuickLogButtons (Story 2.1)
  - [ ] ActiveFlareCards (Story 2.2)
  - [ ] TimelineView (Story 2.3)
  - [ ] FlareCreationModal & FlareUpdateModal (Story 2.4)
  - [ ] MedicationLogModal, SymptomLogModal, TriggerLogModal (Story 2.5)
  - [ ] EventDetailModal (Story 2.6)

- [ ] Implement mobile-specific styles (AC-Mobile: 1,2,3,4)
  - [ ] Full-screen modals on mobile using Tailwind responsive utilities
  - [ ] Minimum tap target size: `className="min-h-[44px] min-w-[44px]"`
  - [ ] Position important buttons in bottom half for thumb reach
  - [ ] Large touch areas for sliders and range inputs

- [ ] Test on mobile devices (AC-Mobile: 6)
  - [ ] iPhone SE (small screen, 4.7")
  - [ ] iPhone 14 Pro (large screen, 6.1")
  - [ ] Test all flows with one-handed operation

- [ ] Add ARIA labels and attributes (AC-Accessibility: 1,6)
  - [ ] QuickLog buttons: `aria-label="Log new flare"`
  - [ ] Severity sliders: `aria-valuenow`, `aria-valuemin="1"`, `aria-valuemax="10"`
  - [ ] All interactive elements have descriptive labels

- [ ] Implement keyboard navigation (AC-Accessibility: 2,3)
  - [ ] Tab through all form fields
  - [ ] Enter to submit forms
  - [ ] Esc to close modals
  - [ ] Focus management: `useEffect(() => inputRef.current?.focus(), [isOpen])`

- [ ] Add screen reader announcements (AC-Accessibility: 4)
  - [ ] Use aria-live regions for success messages
  - [ ] Announce modal open/close
  - [ ] Announce form validation errors

- [ ] Ensure semantic HTML (AC-Accessibility: 7)
  - [ ] Timeline events use `<article>` tags
  - [ ] Dates use `<time>` element
  - [ ] Proper heading hierarchy (h1, h2, h3)

- [ ] Verify color contrast (AC-Accessibility: 5)
  - [ ] Run axe-core accessibility audit
  - [ ] Check all text meets 4.5:1 contrast ratio
  - [ ] Check UI components meet 3:1 contrast ratio
  - [ ] Fix any contrast issues

- [ ] Test with screen readers (AC-Accessibility: 8)
  - [ ] VoiceOver on iOS
  - [ ] TalkBack on Android
  - [ ] Verify all flows are navigable
  - [ ] Verify all content is announced correctly

## Dev Notes

**Technical Approach:**
- Apply Tailwind responsive utilities across all components
- Use ARIA attributes for accessibility
- Focus management with React refs and useEffect
- Screen reader announcements via aria-live regions
- Run axe-core for automated accessibility testing

**Mobile Optimization:**
- Full-screen modals: `className="fixed inset-0 md:relative md:max-w-2xl"`
- Tap targets: `className="min-h-[44px] min-w-[44px]"`
- Thumb zone: Position buttons in lower half of modal on mobile

**Accessibility Implementation:**
- ARIA labels: Add to all buttons, links, form controls
- Keyboard navigation: Test with keyboard only
- Focus management: Move focus to first input on modal open
- Screen reader testing: Use VoiceOver/TalkBack to verify

**Testing Strategy:**
- Manual testing on physical devices (iPhone SE, iPhone 14 Pro)
- Automated testing with axe-core
- Screen reader testing with VoiceOver and TalkBack
- Keyboard-only navigation testing

### Project Structure Notes

**Files to Update:**
- All components from Stories 2.1-2.6
- May need to create accessibility utility functions
- Consider adding aria-live announcement hook

**Tools:**
- axe-core for automated accessibility audits
- Chrome DevTools Lighthouse for accessibility score
- VoiceOver (macOS/iOS) and TalkBack (Android) for screen reader testing

### References

- [Source: docs/PRODUCT/event-stream-redesign-epics.md#Story 2.7]
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind Responsive Utilities](https://tailwindcss.com/docs/responsive-design)
- Time Estimate: 6-8 hours (audit + fixes across all components)

## Dev Agent Record

### Context Reference

- Context File: `docs/stories/story-context-2.7.xml` (generated 2025-10-14)

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

### Completion Notes List

### File List
