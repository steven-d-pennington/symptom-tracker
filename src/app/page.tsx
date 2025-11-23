"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Shield, Zap, Calendar, BarChart3, Map, Moon, Smile, ArrowRight, Check, FileText, Camera, Activity, TrendingUp, Pill, UtensilsCrossed, Lightbulb, Database, Menu, X } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-pink-500 shadow-sm">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Pocket Symptom Tracker</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/onboarding" className="text-sm font-medium text-primary hover:text-primary/80">
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 shadow-lg animate-in slide-in-from-top-5">
            <nav className="flex flex-col gap-4">
              <Link 
                href="#features" 
                className="text-base font-medium text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#about" 
                className="text-base font-medium text-foreground py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/onboarding" 
                className="text-base font-medium text-primary py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="w-full px-4 py-12 md:py-24 lg:py-32 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              <span className="mr-2">✨</span>
              <span>Beta Now Open</span>
            </div>
            
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Take Control of Your <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Health Journey
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A privacy-first tool that empowers people with chronic conditions to track patterns,
                understand triggers, and advocate for themselves with confidence.
              </p>
            </div>

            {/* Beta Signup Form */}
            <div className="w-full max-w-md space-y-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-pink-500 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 min-w-[120px]"
                >
                  {isLoading ? "Joining..." : "Join Beta"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </form>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Or{" "}
                <Link href="/onboarding" className="font-medium text-primary underline-offset-4 hover:underline">
                  try it now
                </Link>{" "}
                — no signup required
              </p>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {[
                { icon: Shield, label: "Privacy-First" },
                { icon: Zap, label: "Works Offline" },
                { icon: Moon, label: "Dark Mode" },
                { icon: Check, label: "WCAG AA" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything You Need to Track Your Health
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Built for people with autoimmune conditions who want to understand patterns
                and be proactive in their treatment.
              </p>
            </div>
          </div>

          {/* Core Features */}
          <div className="mb-16">
            <h3 className="text-xl font-semibold mb-6 px-2">Core Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
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
            <h3 className="text-xl font-semibold mb-6 px-2">Platform & Privacy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold mb-2">
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
      <section id="about" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium">
                <Heart className="mr-2 h-3.5 w-3.5 text-primary" fill="currentColor" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Built from Personal Experience
              </h2>
              <div className="space-y-4 text-muted-foreground md:text-lg leading-relaxed">
                <p>
                  When my wife was diagnosed with a chronic autoimmune condition, I felt helpless.
                  I couldn't make her pain go away or predict when the next flare would strike.
                </p>
                <p>
                  But I could give her tools to take control. I built this app to empower her—and
                  others like her—to track patterns, understand triggers, and advocate for themselves
                  with confidence.
                </p>
                <p className="font-semibold text-foreground">
                  Not a cure, but a companion on the health journey.
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2">For First-Time Users</h3>
                <p className="text-sm text-muted-foreground">
                  Pre-populated defaults and guided onboarding mean you can start tracking immediately
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2">For Daily Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Fast logging workflows and favorites make daily entries effortless
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <h3 className="font-bold text-lg mb-2">For Pattern Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analytics reveal insights you can discuss with your doctor
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-muted/50 to-background border-t border-border">
        <div className="container px-4 md:px-6 text-center">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Take Control?
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join our beta and start tracking your health journey today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-pink-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Start Tracking Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-input bg-background px-8 py-4 text-base font-bold shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-muted/30 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-pink-500">
                  <Heart className="h-4 w-4 text-white" fill="white" />
                </div>
                <span className="font-bold">Pocket Symptom Tracker</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Privacy-first health tracking for autoimmune conditions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/help/keyboard-shortcuts" className="hover:text-foreground transition-colors">Accessibility</Link></li>
                <li><Link href="/onboarding" className="hover:text-foreground transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><a href="https://github.com/steven-d-pennington/symptom-tracker" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><a href="mailto:steve.d.pennington@gmail.com" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            <p>© 2025 Pocket Symptom Tracker. Built with ❤️ for people managing chronic conditions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
