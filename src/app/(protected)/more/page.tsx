/**
 * Legacy /more route - Redirects to /about
 *
 * This page has been retired as part of the navigation consolidation (Story 0.1).
 * All previously accessible features are now available through the main navigation pillars:
 * - Track: Dashboard, Log, Flares, Photos
 * - Analyze: Analytics, Calendar
 * - Manage: Manage Data, Export Data, Settings, Privacy
 * - Support: About
 *
 * @see docs/ui/ui-ux-revamp-blueprint.md#3-Proposed-Information-Architecture
 */

import { redirect } from "next/navigation";

export default function MorePage() {
  redirect("/about");
}
