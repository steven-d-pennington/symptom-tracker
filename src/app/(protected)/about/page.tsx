import { Info, Heart, Github, Mail, ExternalLink, Keyboard } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">About</h1>
        <p className="mt-2 text-muted-foreground">
          Learn more about Pocket Symptom Tracker
        </p>
      </div>

      <div className="space-y-6">
        {/* App Info */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-700">
              <Info className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Pocket Symptom Tracker
              </h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Version:</strong> 0.2.0
                </p>
                <p>
                  <strong className="text-foreground">Status:</strong> Phase 1, 2 & 3
                  Complete ✅
                </p>
                <p>
                  <strong className="text-foreground">Build:</strong> Development
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-pink-500/10 text-pink-700">
              <Heart className="w-6 h-6" />
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
              <h3 className="font-medium text-foreground mb-2">Phase 2</h3>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Interactive body mapping</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Flare tracking and management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Active flare dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Intervention logging</span>
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
