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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Header/Nav */}
      <header className="border-b border-border/40 backdrop-blur-md bg-background/90 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-foreground">Pocket Symptom Tracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              About
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-primary/15 to-pink-500/15 text-primary text-sm font-semibold rounded-full border border-primary/20 shadow-sm">
            ✨ Beta Now Open
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Take Control of Your
            <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent block mt-2">
              Health Journey
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A privacy-first tool that empowers people with chronic conditions to track patterns,
            understand triggers, and advocate for themselves with confidence.
          </p>

          {/* Beta Signup Form */}
          <div className="max-w-md mx-auto mb-8">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-primary to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  Join Beta
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="px-6 py-4 bg-green-50 dark:bg-green-950/50 border-2 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 rounded-xl flex items-center justify-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <Check className="w-6 h-6" />
                <span className="font-semibold text-lg">Thanks! We'll be in touch soon.</span>
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Or{" "}
              <Link href="/onboarding" className="text-primary hover:underline font-semibold">
                try it now
              </Link>{" "}
              — no signup required
            </p>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Privacy-First</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Works Offline</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
              <Moon className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Dark Mode</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">WCAG AA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-24 relative">
        <div className="absolute inset-0 bg-card/30 backdrop-blur-sm -z-10" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need to Track Your Health
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for people with autoimmune conditions who want to understand patterns
              and be proactive in their treatment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About/Mission Section */}
      <section id="about" className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-10 md:p-12 border-2 border-border shadow-xl mb-12">
            <div className="flex items-start gap-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <Heart className="w-10 h-10 text-white" fill="white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Built from Personal Experience</h2>
                <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    When my wife was diagnosed with a chronic autoimmune condition, I felt helpless.
                    I couldn't make her pain go away or predict when the next flare would strike.
                  </p>
                  <p>
                    But I could give her tools to take control. I built this app to empower her—and
                    others like her—to track patterns, understand triggers, and advocate for themselves
                    with confidence.
                  </p>
                  <p className="text-foreground font-bold text-xl">
                    Not a cure, but a companion on the health journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-border shadow-lg">
              <h3 className="font-bold text-lg text-foreground mb-3">For First-Time Users</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pre-populated defaults and guided onboarding mean you can start tracking immediately
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-border shadow-lg">
              <h3 className="font-bold text-lg text-foreground mb-3">For Daily Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fast logging workflows and favorites make daily entries effortless
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-primary/5 border-2 border-border shadow-lg">
              <h3 className="font-bold text-lg text-foreground mb-3">For Pattern Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive analytics reveal insights you can discuss with your doctor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join our beta and start tracking your health journey today. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
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

      {/* Footer */}
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
