import { Lock, Shield, Eye, Database } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">
          How we protect your sensitive health data
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy-First Design */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-700">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Privacy-First Design
              </h2>
              <p className="text-muted-foreground">
                Pocket Symptom Tracker is built with your privacy as the top
                priority. Your health data is personal and sensitive—we treat it
                that way.
              </p>
            </div>
          </div>
        </div>

        {/* Local Storage */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-700">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Everything Stays Local
              </h2>
              <p className="text-muted-foreground mb-4">
                All your data is stored directly on your device using IndexedDB.
                We don't have servers collecting your health information.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>No cloud storage or remote databases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>No analytics or tracking scripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>No third-party data sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Works completely offline</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Encryption */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-700">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Client-Side Encryption
              </h2>
              <p className="text-muted-foreground mb-4">
                Medical photos are encrypted using AES-256-GCM before being
                stored on your device. Only you can decrypt and view your photos.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Photos encrypted with Web Crypto API</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Encryption keys never leave your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Industry-standard AES-256-GCM algorithm</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* You Control Your Data */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-orange-500/10 text-orange-700">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                You Control Your Data
              </h2>
              <p className="text-muted-foreground mb-4">
                Your data belongs to you. You can export it, delete it, or keep
                it private—entirely your choice.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">✓</span>
                  <span>Export your data anytime in standard formats</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">✓</span>
                  <span>Delete all data with browser storage clearing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">✓</span>
                  <span>No account required—no data tied to identity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Updates to Privacy Policy */}
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Last updated:</strong> January 2025
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This is a demo/development version. Privacy policy subject to change
            as features are added. Always review privacy practices before storing
            sensitive health information.
          </p>
        </div>
      </div>
    </div>
  );
}
