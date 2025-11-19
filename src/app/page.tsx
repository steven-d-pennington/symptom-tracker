"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Shield, Zap, Calendar, BarChart3, Map, Moon, Smile, ArrowRight, Check, FileText, Camera, Activity, TrendingUp, Pill, UtensilsCrossed, Lightbulb, Database } from "lucide-react";

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

  const coreFeatures = [
    {
      icon: FileText,
      title: "Daily Health Log",
      description: "Comprehensive daily entries tracking symptoms, medications, triggers, and more"
    },
    {
      icon: Map,
      title: "Interactive Body Mapping",
      description: "Visual flare tracking on an intuitive body map with precise location marking"
    },
    {
      icon: Activity,
      title: "Active Flare Dashboard",
      description: "Monitor active flares with severity tracking, lifecycle stages, and quick updates"
    },
    {
      icon: Camera,
      title: "Photo Documentation",
      description: "Encrypted medical photo storage with tagging, filtering, and secure organization"
    },
    {
      icon: TrendingUp,
      title: "Trigger Correlation Analysis",
      description: "Discover patterns between triggers and symptoms with 90-day correlation insights"
    },
    {
      icon: BarChart3,
      title: "Pattern Analytics",
      description: "Understand trends with problem area insights and intervention effectiveness"
    },
    {
      icon: Calendar,
      title: "Timeline & Calendar View",
      description: "See your health history at a glance with an interactive calendar and timeline"
    },
    {
      icon: Smile,
      title: "Mood & Sleep Tracking",
      description: "Track daily mood and sleep patterns to uncover correlations"
    },
    {
      icon: Pill,
      title: "Medication Tracking",
      description: "Log medications, track adherence, and monitor effectiveness over time"
    },
    {
      icon: UtensilsCrossed,
      title: "Food Logging",
      description: "Track meals and identify food-related triggers with detailed logging"
    },
    {
      icon: Lightbulb,
      title: "Health Insights",
      description: "AI-powered insights and recommendations based on your tracking patterns"
    },
    {
      icon: Database,
      title: "Data Export & Import",
      description: "Export your data in JSON or CSV format, import from backups"
    }
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: "Privacy-First",
      description: "Your data never leaves your device. Complete privacy and control."
    },
    {
      icon: Zap,
      title: "Offline-First",
      description: "Works perfectly without internet. PWA with service workers."
    },
    {
      icon: Moon,
      title: "Dark Mode",
      description: "Beautiful dark theme for comfortable tracking at any time"
    },
    {
      icon: Check,
      title: "Accessible Design",
      description: "WCAG AA compliant with keyboard navigation and screen reader support"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#374151' }}>
        <div className="w-full px-6 md:px-12 lg:px-16 xl:px-24 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Pocket Symptom Tracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="#features" className="text-sm transition-colors font-medium" style={{ color: '#FFFFFF' }}>
              Features
            </Link>
            <Link href="#about" className="text-sm transition-colors font-medium" style={{ color: '#FFFFFF' }}>
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 text-sm font-semibold rounded-full shadow-sm flex items-center gap-2" style={{ backgroundColor: '#D1FAE5', color: '#1F2937' }}>
              <span>✨</span>
              <span>Beta Now Open</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center" style={{ color: '#1F2937' }}>
            Take Control of Your
            <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent block mt-2">
              Health Journey
            </span>
          </h1>
          <div style={{ maxWidth: '48rem', margin: '0 auto 2.5rem', textAlign: 'center' }}>
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: '#6B7280' }}>
              A privacy-first tool that empowers people with chronic conditions to track patterns,
              understand triggers, and advocate for themselves with confidence.
            </p>
          </div>

          {/* Beta Signup Form */}
          <div className="mb-6 w-full flex flex-col items-center">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
                  style={{ minWidth: '140px' }}
                >
                  {isLoading ? "Joining..." : "Join Beta"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {error && (
                <div className="mt-3 px-3 py-2 bg-red-50 dark:bg-red-950/50 border border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}
            </form>
            <p className="mt-3 text-sm text-muted-foreground">
              Or{" "}
              <Link href="/onboarding" className="text-primary hover:underline font-semibold">
                try it now
              </Link>{" "}
              — no signup required
            </p>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium" style={{ color: '#1F2937' }}>Privacy-First</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium" style={{ color: '#1F2937' }}>Works Offline</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
              <Moon className="w-4 h-4 text-primary" />
              <span className="font-medium" style={{ color: '#1F2937' }}>Dark Mode</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium" style={{ color: '#1F2937' }}>WCAG AA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full px-6 md:px-12 lg:px-16 xl:px-24 py-16 relative" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="w-full">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Everything You Need to Track Your Health
            </h2>
            <p className="text-base md:text-lg text-muted-foreground text-center">
              Built for people with autoimmune conditions who want to understand patterns
              and be proactive in their treatment.
            </p>
          </div>

          {/* Core Features */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-foreground mb-6">Core Features</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coreFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-pink-500/20 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Features */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6">Platform & Privacy</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-pink-500/20 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* About/Mission Section */}
      <section id="about" className="w-full px-6 md:px-12 lg:px-16 xl:px-24 py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="w-full">
          <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-xl p-6 md:p-8 border border-border shadow-md mb-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Built from Personal Experience</h2>
                <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
                  <p>
                    When my wife was diagnosed with a chronic autoimmune condition, I felt helpless.
                    I couldn't make her pain go away or predict when the next flare would strike.
                  </p>
                  <p>
                    But I could give her tools to take control. I built this app to empower her—and
                    others like her—to track patterns, understand triggers, and advocate for themselves
                    with confidence.
                  </p>
                  <p className="text-foreground font-bold text-lg">
                    Not a cure, but a companion on the health journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-primary/5 border border-border shadow-sm">
              <h3 className="font-bold text-base text-foreground mb-2">For First-Time Users</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pre-populated defaults and guided onboarding mean you can start tracking immediately
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-primary/5 border border-border shadow-sm">
              <h3 className="font-bold text-base text-foreground mb-2">For Daily Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fast logging workflows and favorites make daily entries effortless
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-primary/5 border border-border shadow-sm">
              <h3 className="font-bold text-base text-foreground mb-2">For Pattern Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Comprehensive analytics reveal insights you can discuss with your doctor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full px-6 md:px-12 lg:px-16 xl:px-24 py-16 relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>

        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            Ready to Take Control?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-center">
            Join our beta and start tracking your health journey today. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-pink-500 text-white text-base font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 group"
            >
              Start Tracking Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-4 border border-border bg-card/80 backdrop-blur-sm text-foreground text-base font-bold rounded-xl hover:bg-muted transition-all duration-300 hover:shadow-md"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: '#D1D5DB', backgroundColor: '#374151' }}>
        <div className="w-full px-6 md:px-12 lg:px-16 xl:px-24 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-sm">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="font-bold" style={{ color: '#FFFFFF' }}>Pocket Symptom Tracker</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
                Privacy-first health tracking for autoimmune conditions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Product</h4>
              <ul className="space-y-1.5 text-sm" style={{ color: '#D1D5DB' }}>
                <li>
                  <Link href="#features" className="transition-colors hover:opacity-80" style={{ color: '#D1D5DB' }}>Features</Link>
                </li>
                <li>
                  <Link href="/help/keyboard-shortcuts" className="transition-colors hover:opacity-80" style={{ color: '#D1D5DB' }}>Accessibility</Link>
                </li>
                <li>
                  <Link href="/onboarding" className="transition-colors hover:opacity-80" style={{ color: '#D1D5DB' }}>Get Started</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Company</h4>
              <ul className="space-y-1.5 text-sm" style={{ color: '#D1D5DB' }}>
                <li>
                  <Link href="/about" className="transition-colors hover:opacity-80" style={{ color: '#D1D5DB' }}>About</Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:opacity-80" style={{ color: '#D1D5DB' }}>Privacy</Link>
                </li>
                <li>
                  <a
                    href="https://github.com/steven-d-pennington/symptom-tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:opacity-80"
                    style={{ color: '#D1D5DB' }}
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Support</h4>
              <ul className="space-y-1.5 text-sm" style={{ color: '#D1D5DB' }}>
                <li>
                  <Link href="/help" className="transition-colors hover:opacity-80" style={{ color: '#D1D5DB' }}>Help Center</Link>
                </li>
                <li>
                  <a
                    href="mailto:steve.d.pennington@gmail.com"
                    className="transition-colors hover:opacity-80"
                    style={{ color: '#D1D5DB' }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-xs" style={{ borderColor: '#4B5563', color: '#D1D5DB' }}>
            <p>© 2025 Pocket Symptom Tracker. Built with ❤️ for people managing chronic conditions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
