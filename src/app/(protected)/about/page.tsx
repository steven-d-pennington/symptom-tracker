"use client";

import { useState } from "react";
import { Info, Heart, Github, Mail, ExternalLink, Keyboard, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const [expandedChangelog, setExpandedChangelog] = useState<string>("v0.4.0");

  const toggleChangelog = (id: string) => {
    setExpandedChangelog(expandedChangelog === id ? "" : id);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">About</h1>
        <p className="mt-2 text-muted-foreground">
          The story behind Pocket Symptom Tracker
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Story */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-pink-500/10 text-pink-700 dark:text-pink-400">
              <Heart className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When my wife was diagnosed with a chronic autoimmune condition, I felt utterly helpless.
                  I couldn't make her pain go away. I couldn't cure her illness. I couldn't even predict
                  when the next flare would strike.
                </p>
                <p>
                  But what I <em className="font-medium text-foreground">could</em> do was give her tools
                  to take control of her own health journey. I realized that while I couldn't fix the problem,
                  I could empower her to be proactive in her treatment and management. I could help her track
                  patterns, communicate better with her doctors, and feel less like a passive victim of her condition.
                </p>
                <p>
                  That's why I built Pocket Symptom Tracker. Not as a cure, but as a companion. A way for
                  people living with chronic conditions to gather their own data, understand their own patterns,
                  and advocate for themselves with confidence.
                </p>
                <p className="text-sm italic border-l-2 border-primary pl-4">
                  If you or someone you love is on a similar journey, I hope this tool helps you feel a little
                  more empowered, a little more in control, and a little less alone.
                  <span className="block mt-2 text-foreground not-italic">
                    — Steven Pennington, Creator
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Our Mission
              </h2>
              <p className="text-muted-foreground">
                A privacy-first progressive web app that helps people living with
                autoimmune conditions capture daily health context, understand
                patterns, and prepare for appointments—all while keeping data on
                their device.
              </p>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Pocket Symptom Tracker
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Version:</strong> 0.4.0
            </p>
            <p>
              <strong className="text-foreground">Status:</strong> Beta - Architecture Hardened 🛡️
            </p>
            <p>
              <strong className="text-foreground">Build:</strong> Development
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Current Features
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-medium text-foreground mb-2">Phase 1</h3>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Guided onboarding system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Symptom tracking and management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Daily entry system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Calendar timeline view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Offline-first data storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>PWA infrastructure</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Phase 2 (Completed)</h3>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Unified Body Marker System (Pain, Inflammation, Flares)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Interactive Body Mapping with 4 Views</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Event-Sourced History Tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Zero-Knowledge Cloud Backup</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Phase 3</h3>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Problem area analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Flare duration and severity metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Trend analysis visualization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Intervention effectiveness analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-foreground mb-2">Frontend</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Next.js 15</li>
                <li>React 19</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Storage</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Dexie.js v5</li>
                <li>IndexedDB</li>
                <li>Web Crypto API</li>
                <li>Service Workers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Changelog */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Changelog
          </h2>
          <div className="space-y-3">
            {/* Version 0.4.0 - November 2025 */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleChangelog("v0.4.0")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedChangelog === "v0.4.0" ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">
                      Version 0.4.0 - Architecture Hardening
                    </h3>
                    <p className="text-sm text-muted-foreground">November 2025</p>
                  </div>
                </div>
              </button>

              {expandedChangelog === "v0.4.0" && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">🏗️ Core Architecture</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span><strong>Unified Body Marker System:</strong> Replaced separate flare/pain tracking with a polymorphic marker system.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span><strong>Event Sourcing:</strong> Implemented append-only event logs for high-fidelity history tracking.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span><strong>Zero-Knowledge Sync:</strong> Added encrypted cloud backup capabilities (server cannot read data).</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">📚 Documentation</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Comprehensive documentation suite (Architecture, Data Models, API Contracts).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Updated Development Guide and Source Tree mapping.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Epic 3.5 - October 2025 */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleChangelog("epic-3.5")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedChangelog === "epic-3.5" ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">
                      Version 0.3.0 - Epic 3.5: Production-Ready UI/UX
                    </h3>
                    <p className="text-sm text-muted-foreground">October 2025</p>
                  </div>
                </div>
              </button>

              {expandedChangelog === "epic-3.5" && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">✨ New Features</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Pre-populated 120+ default symptoms, foods, triggers, and medications for new users</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Mood and sleep tracking for comprehensive health monitoring</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Dedicated logging pages for all workflows (replaced modals with full pages)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Calendar view now displays historical health data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Full keyboard navigation and WCAG 2.1 Level AA accessibility compliance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Comprehensive keyboard shortcuts help page</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">🎨 Improvements</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Enhanced empty state handling with contextual guidance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Collapsible categories for food and trigger selection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Favorites and recents for faster logging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Improved dark mode experience throughout the app</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Better toast notifications with improved aria-live announcements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Consistent button styling across dashboard and all pages</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">🐛 Bug Fixes</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Fixed dark mode text visibility issues</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Removed broken onboarding Step 5 (education modules)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Fixed calendar data wiring to display logged events</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Fixed keyboard shortcuts interfering with text input</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Improved mobile responsiveness across all pages</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">♿ Accessibility</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>WCAG 2.2 compliant focus indicators (2px minimum outline)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Skip to main content link for keyboard navigation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Screen reader support with aria-live regions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Context-aware keyboard shortcuts (disabled when typing)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Epic 3 - September 2025 */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleChangelog("epic-3")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedChangelog === "epic-3" ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">
                      Version 0.1.0 - Epic 3: Analytics & Body Mapping
                    </h3>
                    <p className="text-sm text-muted-foreground">September 2025</p>
                  </div>
                </div>
              </button>

              {expandedChangelog === "epic-3" && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">✨ New Features</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Interactive body mapping with multi-view support (front, back, left, right)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Flare tracking with severity ratings and intervention logging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Problem area analytics with regional insights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Flare duration and severity metrics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Intervention effectiveness analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Trend visualization with time-series charts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Active flare dashboard with real-time tracking</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">🔒 Privacy & Architecture</h4>
                      <ul className="space-y-1 text-muted-foreground pl-4">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Offline-first architecture with IndexedDB</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Privacy-first design - all data stays on device</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Import/export functionality for data portability</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Progressive Web App (PWA) with service workers</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Links</h2>
          <div className="space-y-3">
            <Link
              href="/help/keyboard-shortcuts"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <Keyboard className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">
                Keyboard Shortcuts & Accessibility
              </span>
            </Link>
            <a
              href="https://github.com/steven-d-pennington/symptom-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <Github className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">
                View on GitHub
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="mailto:steve.d.pennington@gmail.com"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">
                Contact Developer
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* License */}
        <div className="p-4 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ for people managing autoimmune conditions
          </p>
          <p className="mt-2">© 2025 Pocket Symptom Tracker</p>
        </div>
      </div>
    </div>
  );
}
