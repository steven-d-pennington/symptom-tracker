"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Shield, Zap, Calendar, BarChart3, Map, Moon, Smile, ArrowRight, Check } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire up backend later
    console.log("Beta signup:", email);
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 5000);
  };

  const features = [
    {
      icon: Map,
      title: "Interactive Body Mapping",
      description: "Visual flare tracking on an intuitive body map with precise location marking"
    },
    {
      icon: BarChart3,
      title: "Pattern Analytics",
      description: "Understand your trends with problem area insights and intervention effectiveness"
    },
    {
      icon: Calendar,
      title: "Timeline View",
      description: "See your health history at a glance with an interactive calendar"
    },
    {
      icon: Smile,
      title: "Mood & Sleep Tracking",
      description: "Track daily mood and sleep patterns to uncover correlations"
    },
    {
      icon: Shield,
      title: "Privacy-First",
      description: "Your data never leaves your device. Complete privacy and control."
    },
    {
      icon: Zap,
      title: "Offline-First",
      description: "Works perfectly without internet. PWA with service workers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header/Nav */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Pocket Symptom Tracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/onboarding" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Try Now →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
            Beta Now Open
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Take Control of Your
            <span className="text-primary block">Health Journey</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A privacy-first tool that empowers people with chronic conditions to track patterns,
            understand triggers, and advocate for themselves with confidence.
          </p>

          {/* Beta Signup Form */}
          <div className="max-w-md mx-auto mb-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  Join Beta
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="px-4 py-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-lg flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                <span className="font-medium">Thanks! We'll be in touch soon.</span>
              </div>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Or{" "}
              <Link href="/onboarding" className="text-primary hover:underline font-medium">
                try it now
              </Link>{" "}
              — no signup required
            </p>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Privacy-First</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Works Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>WCAG AA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Track Your Health
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for people with autoimmune conditions who want to understand patterns
              and be proactive in their treatment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About/Mission Section */}
      <section id="about" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6 mb-12">
            <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Built from Personal Experience</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When my wife was diagnosed with a chronic autoimmune condition, I felt helpless.
                  I couldn't make her pain go away or predict when the next flare would strike.
                </p>
                <p>
                  But I could give her tools to take control. I built this app to empower her—and
                  others like her—to track patterns, understand triggers, and advocate for themselves
                  with confidence.
                </p>
                <p className="text-foreground font-medium">
                  Not a cure, but a companion on the health journey.
                </p>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">For First-Time Users</h3>
              <p className="text-sm text-muted-foreground">
                Pre-populated defaults and guided onboarding mean you can start tracking immediately
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">For Daily Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Fast logging workflows and favorites make daily entries effortless
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-2">For Pattern Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics reveal insights you can discuss with your doctor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our beta and start tracking your health journey today. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Start Tracking Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 border border-border bg-card text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">Pocket Symptom Tracker</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Privacy-first health tracking for autoimmune conditions
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
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
