"use client";

import Link from "next/link";
import { Heart, Check, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col">
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
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Home
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-2xl w-full text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/50 mb-8 animate-in zoom-in duration-500">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" strokeWidth={3} />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-in slide-in-from-bottom duration-500">
            You're on the List! 🎉
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-500 delay-100">
            Thank you for signing up for the Pocket Symptom Tracker beta!
          </p>

          {/* Info Card */}
          <div className="bg-card border-2 border-border rounded-2xl p-8 mb-10 shadow-xl animate-in slide-in-from-bottom duration-500 delay-200">
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Check Your Inbox</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We've sent a welcome email to your inbox with your verification code and next steps.
                  Keep an eye out for updates as we prepare for launch!
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Early access coming soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-border rounded-2xl p-8 mb-10 shadow-lg animate-in slide-in-from-bottom duration-500 delay-300">
            <h3 className="text-2xl font-bold text-foreground mb-6">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-pink-500 text-white font-bold flex items-center justify-center mb-3 text-lg">
                  1
                </div>
                <h4 className="font-semibold text-foreground mb-2">Check Your Email</h4>
                <p className="text-sm text-muted-foreground">
                  Look for your welcome email with your verification code
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-pink-500 text-white font-bold flex items-center justify-center mb-3 text-lg">
                  2
                </div>
                <h4 className="font-semibold text-foreground mb-2">Stay Tuned</h4>
                <p className="text-sm text-muted-foreground">
                  We'll send updates as we add new features and prepare for launch
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-pink-500 text-white font-bold flex items-center justify-center mb-3 text-lg">
                  3
                </div>
                <h4 className="font-semibold text-foreground mb-2">Get Early Access</h4>
                <p className="text-sm text-muted-foreground">
                  Be among the first to try new features when they launch
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom duration-500 delay-400">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-pink-500 text-white text-lg font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-3 group"
            >
              Try It Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 border-2 border-border bg-card/80 backdrop-blur-sm text-foreground text-lg font-bold rounded-xl hover:bg-muted transition-all duration-300 hover:shadow-xl"
            >
              Back to Home
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a
              href="mailto:steve.d.pennington@gmail.com"
              className="text-primary hover:underline font-semibold"
            >
              steve.d.pennington@gmail.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-foreground">Pocket Symptom Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Pocket Symptom Tracker. Built with ❤️ for people managing chronic conditions.
          </p>
        </div>
      </footer>
    </div>
  );
}
