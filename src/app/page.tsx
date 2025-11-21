"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  CloudOff,
  Heart,
  Lock,
  Map,
  Shield,
  Sparkles,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/beta-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      // Store verification code in localStorage for validation
      if (data.verificationCode) {
        localStorage.setItem("beta_verification_code", data.verificationCode);
        localStorage.setItem("beta_signup_email", email);
      }

      // Redirect to thank you page
      router.push("/thank-you");
    } catch (err) {
      console.error("Beta signup error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const experiencePillars = [
    {
      icon: Map,
      title: "Track with precision",
      description:
        "Log flares with exact body-map coordinates across 93 regions, capture severity and trend updates, and attach context in seconds."
    },
    {
      icon: BarChart3,
      title: "Analyze confidently",
      description:
        "Discover correlations between foods, triggers, sleep, and mood with time-delayed analysis and regional flare insights."
    },
    {
      icon: Shield,
      title: "Protect your privacy",
      description: "100% local-first architecture with AES-256-GCM photo encryption and zero server dependencies."
    }
  ];

  const capabilityHighlights = [
    {
      icon: Sparkles,
      title: "Smart flare lifecycle",
      description:
        "Create persistent flare records, update severity and trend over time, and review an append-only history for medical-grade context."
    },
    {
      icon: Brain,
      title: "Food & trigger intelligence",
      description:
        "Log meals from a 200+ item library, capture allergens, and surface statistically significant patterns and problem areas."
    },
    {
      icon: Activity,
      title: "Daily health journal",
      description:
        "Track energy, stress, sleep, mood, and medications alongside symptoms so you can see the full picture on the timeline."
    },
    {
      icon: CloudOff,
      title: "Offline-first PWA",
      description:
        "Install it on any device and keep every workflow—logging, analytics, exports—fully functional without a network connection."
    },
    {
      icon: Lock,
      title: "Encrypted memories",
      description: "Store before/after photos with AES-256-GCM, EXIF stripping, and per-photo keys that never leave your device."
    },
    {
      icon: Check,
      title: "Accessible by design",
      description: "WCAG AA support with keyboard navigation, tactile focus states, and dark/light theming tuned for comfort."
    }
  ];

  const releaseHighlights = [
    "Version 0.5.0 focuses on flare lifecycle depth with severity + trend updates tied to precise body-map coordinates.",
    "Expanded analytics foundation for food correlations, delayed effects, and regional " +
      "problem area insights you can take to appointments.",
    "End-to-end local ownership: IndexedDB persistence, encrypted photos, exports, and optional UX instrumentation that stays on-device."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <header className="border-b border-border/40 backdrop-blur-md bg-background/90 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pocket Symptom Tracker</p>
              <p className="text-base font-semibold text-foreground">Local-first health companion</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#journey" className="text-muted-foreground hover:text-foreground transition-colors">
              Product
            </Link>
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Capabilities
            </Link>
            <Link href="#release" className="text-muted-foreground hover:text-foreground transition-colors">
              Release 0.5.0
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              Try Now →
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-12 right-1/4 w-[480px] h-[480px] bg-pink-500/10 rounded-full blur-3xl -z-10" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold shadow-sm">
                Version 0.5.0 · Local-first beta
              </span>
              <span className="px-4 py-2 rounded-full border border-border bg-card/70 text-xs font-semibold text-muted-foreground shadow-sm">
                Fully offline · AES-256-GCM photos
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              A calm command center for tracking autoimmune flares
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Combine precise body mapping, flare lifecycle tracking, and privacy-first storage to understand what triggers
              your symptoms—and walk into appointments with confidence.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {experiencePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-4 rounded-2xl border border-border bg-card/70 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-pink-500/20 text-primary flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card/80 border-2 border-border rounded-3xl shadow-2xl p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5 pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Join the beta</p>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                  Invite-friendly
                </span>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email for beta invites"
                  required
                  disabled={isLoading}
                  className="w-full px-5 py-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Joining..." : "Get early access"}
                  <ArrowRight className="w-5 h-5" />
                </button>
                {error && (
                  <div className="px-4 py-3 bg-red-50 dark:bg-red-950/50 border-2 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}
              </form>
              <div className="space-y-2 pt-2">
                {releaseHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Prefer to dive in? {" "}
                <Link href="/onboarding" className="text-primary font-semibold hover:underline">
                  Start the onboarding flow
                </Link>{" "}
                — no signup required.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-card/70 backdrop-blur-sm rounded-lg border border-border/60 shadow-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Privacy-first & local-only</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/70 backdrop-blur-sm rounded-lg border border-border/60 shadow-sm">
            <CloudOff className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Offline by design</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/70 backdrop-blur-sm rounded-lg border border-border/60 shadow-sm">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">AES-256-GCM photos</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/70 backdrop-blur-sm rounded-lg border border-border/60 shadow-sm">
            <Check className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">WCAG AA experience</span>
          </div>
        </div>
      </section>

      <section id="journey" className="container mx-auto px-4 py-20 relative">
        <div className="absolute inset-0 bg-card/30 backdrop-blur-sm -z-10" />
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Built for the entire health journey</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Track day-to-day context, pinpoint flare locations, and surface the patterns that actually change care plans.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {experiencePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-8 rounded-2xl border-2 border-border bg-gradient-to-br from-card to-primary/5 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-primary font-semibold uppercase tracking-[0.2em] text-xs">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Everything you need to track, analyze, and prepare</h2>
            <p className="text-lg text-muted-foreground">
              Inspired by real clinical conversations: capture the details, see the patterns, and keep every sensitive artifact on your device.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilityHighlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-7 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-pink-500/15 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="release" className="container mx-auto px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 -z-10" />
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">Release Notes</span>
            <p className="text-sm text-muted-foreground">Updated for v0.5.0</p>
          </div>
          <div className="rounded-3xl border-2 border-border bg-card/80 shadow-2xl p-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-foreground">What's new in 0.5.0</h3>
                <p className="text-muted-foreground">Flare lifecycle depth, richer analytics, and a more welcoming landing experience.</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg">Beta • 65% of Epic 2 complete</div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-border bg-background/80">
                <h4 className="font-semibold text-foreground mb-3">Flare lifecycle + body map</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>Persistent flare IDs with severity + trend updates anchored to 93-region body map coordinates.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>Active flare dashboard tuned for &lt;100ms interactions even while offline.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>Append-only history ready for upcoming intervention logging and timelines.</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl border border-border bg-background/80">
                <h4 className="font-semibold text-foreground mb-3">Insights & ownership</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>Food + trigger intelligence with time-delayed correlation analysis and allergen-aware tagging.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>Encrypted photos, exports, and UX instrumentation that never leave your device.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-primary mt-0.5" />
                    <span>WCAG AA experience with keyboard navigation, focus states, and dark/light comfort modes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-10 md:p-12 border-2 border-border shadow-xl">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <Heart className="w-10 h-10 text-white" fill="white" />
              </div>
              <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Built from personal experience</h2>
                <p>
                  When my wife was diagnosed with a chronic autoimmune condition, I built this to help her feel less alone and more prepared for every appointment.
                </p>
                <p>
                  Pocket Symptom Tracker is designed to be a quiet companion: quick logging, medical-grade detail when you need it, and total ownership of your data.
                </p>
                <p className="text-foreground font-semibold text-xl">Not a cure, but a steady partner on the journey.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-border shadow-lg">
              <h3 className="font-bold text-lg text-foreground mb-3">Start fast</h3>
              <p className="text-muted-foreground leading-relaxed">Guided onboarding plus pre-populated symptoms, triggers, and foods so you can log in minutes.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-border shadow-lg">
              <h3 className="font-bold text-lg text-foreground mb-3">Stay consistent</h3>
              <p className="text-muted-foreground leading-relaxed">Favorites, quick actions, and offline reliability make daily entries effortless.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-border shadow-lg">
              <h3 className="font-bold text-lg text-foreground mb-3">Show the evidence</h3>
              <p className="text-muted-foreground leading-relaxed">Analytics, exports, and photo histories help you share clear stories with clinicians.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Ready to feel more prepared?</h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Join the v0.5.0 beta and experience privacy-first flare tracking, correlation insights, and welcoming onboarding designed for chronic conditions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-pink-500 text-white text-lg font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-3 group"
            >
              Start Tracking Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-10 py-5 border-2 border-border bg-card/80 backdrop-blur-sm text-foreground text-lg font-bold rounded-xl hover:bg-muted transition-all duration-300 hover:shadow-xl"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="font-bold text-foreground">Pocket Symptom Tracker</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Privacy-first symptom, flare, and trigger tracking that stays on your device.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">Capabilities</Link>
                </li>
                <li>
                  <Link href="/help/keyboard-shortcuts" className="hover:text-foreground transition-colors">Accessibility</Link>
                </li>
                <li>
                  <Link href="/onboarding" className="hover:text-foreground transition-colors">Get Started</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                </li>
                <li>
                  <a
                    href="https://github.com/steven-d-pennington/symptom-tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link>
                </li>
                <li>
                  <a
                    href="mailto:steve.d.pennington@gmail.com"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Pocket Symptom Tracker. Built with ❤️ for people managing chronic conditions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
