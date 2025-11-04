"use client";

import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  Check,
  Clock3,
  Heart,
  Layers,
  Map,
  Moon,
  NotebookPen,
  Shield,
  Smile,
  Sparkles,
  SunMedium,
  Zap
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

type DesignOption = {
  id: "serenity" | "aurora" | "nocturne";
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  accentGradient: string;
  accentRing: string;
  accentText: string;
  pillClasses: string;
  heroBullets: Array<{
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }>;
  stat: {
    value: string;
    label: string;
    sublabel: string;
  };
};

const designOptions: DesignOption[] = [
  {
    id: "serenity",
    name: "Serenity",
    tagline: "A gentle, restorative interface crafted for calm focus.",
    description: "Soft gradients, airy spacing, and mindful prompts keep the experience grounding and approachable.",
    gradient: "from-sky-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-950 dark:to-violet-950",
    accentGradient: "from-sky-500 via-violet-500 to-purple-500",
    accentRing: "ring-sky-400/60",
    accentText: "text-sky-600 dark:text-sky-200",
    pillClasses:
      "bg-white/80 dark:bg-slate-900/70 text-sky-700 dark:text-sky-200 border border-sky-200/70 dark:border-slate-800/70 shadow-sm",
    heroBullets: [
      {
        icon: Sparkles,
        title: "Guided daily flow",
        description: "Structured prompts help you capture how you feel in under a minute."
      },
      {
        icon: Brain,
        title: "Smart correlations",
        description: "Intelligent analysis uncovers emerging patterns across symptoms, mood, and triggers."
      },
      {
        icon: Shield,
        title: "Private by design",
        description: "Every entry stays encrypted on your device so you remain in full control."
      }
    ],
    stat: {
      value: "92%",
      label: "feel more prepared",
      sublabel: "after four weeks of mindful tracking"
    }
  },
  {
    id: "aurora",
    name: "Aurora",
    tagline: "Bold energy for power users who love vibrant interfaces.",
    description: "Luminous color transitions, expressive typography, and dynamic surfaces keep motivation high.",
    gradient: "from-amber-100 via-rose-100 to-purple-100 dark:from-slate-950 dark:via-fuchsia-950 dark:to-amber-950",
    accentGradient: "from-amber-500 via-rose-500 to-purple-500",
    accentRing: "ring-rose-400/60",
    accentText: "text-rose-600 dark:text-rose-200",
    pillClasses:
      "bg-white/80 dark:bg-slate-900/70 text-rose-700 dark:text-rose-200 border border-rose-200/70 dark:border-rose-500/40 shadow-sm",
    heroBullets: [
      {
        icon: Activity,
        title: "Dynamic flare heatmaps",
        description: "Visualize intensity and frequency with animated gradients that spotlight change."
      },
      {
        icon: Layers,
        title: "Stacked timelines",
        description: "Overlay medication, lifestyle, and symptom data to see how interventions perform."
      },
      {
        icon: Zap,
        title: "Action suggestions",
        description: "Get quick prompts for journaling, hydration, or rest when warning signs emerge."
      }
    ],
    stat: {
      value: "3×",
      label: "faster pattern recognition",
      sublabel: "with weekly momentum recaps"
    }
  },
  {
    id: "nocturne",
    name: "Nocturne",
    tagline: "Moody and cinematic with luminous highlights for night owls.",
    description: "A rich midnight palette with crisp contrast keeps the interface soothing in low light.",
    gradient: "from-slate-950 via-slate-900 to-indigo-950",
    accentGradient: "from-indigo-400 via-sky-400 to-cyan-400",
    accentRing: "ring-sky-400/60",
    accentText: "text-sky-300",
    pillClasses:
      "bg-slate-900/80 text-sky-200 border border-slate-700 shadow-[0_12px_40px_-20px_rgba(56,189,248,0.45)]",
    heroBullets: [
      {
        icon: Moon,
        title: "Low-light ready",
        description: "Deep blacks and soft neon glow reduce strain during late-night reflections."
      },
      {
        icon: Clock3,
        title: "Circadian awareness",
        description: "Track daypart energy and sleep quality without losing your night mode focus."
      },
      {
        icon: Shield,
        title: "Secure & offline",
        description: "Nothing leaves your device, so you can track anywhere—even in airplane mode."
      }
    ],
    stat: {
      value: "78%",
      label: "log entries after midnight",
      sublabel: "because the calm UI keeps you engaged"
    }
  }
];

const featureHighlights = [
  {
    icon: Map,
    title: "Precision Body Mapping",
    description: "Drop markers, draw regions, and capture sensation notes directly on an adaptive anatomical canvas."
  },
  {
    icon: Calendar,
    title: "Rhythm Timeline",
    description: "Scroll through mood, sleep, and medication data in an immersive, haptic-enabled timeline."
  },
  {
    icon: BarChart3,
    title: "Adaptive Analytics",
    description: "Spot correlations instantly with AI-assisted summaries tailored to your personal history."
  },
  {
    icon: Smile,
    title: "Whole-Person Logging",
    description: "Pair symptoms with context—from stressors to gratitude—so every entry tells the full story."
  },
  {
    icon: Shield,
    title: "End-to-End Privacy",
    description: "On-device encryption, biometric locks, and zero third-party data sharing—ever."
  },
  {
    icon: Zap,
    title: "Offline-First PWA",
    description: "Launch instantly and sync when ready. Works flawlessly at the clinic or in the backcountry."
  }
];

const journeyMoments = [
  {
    icon: SunMedium,
    title: "Morning Check-In",
    description: "Breeze through a guided log that captures sleep, baseline mood, and overnight flare activity in under 60 seconds."
  },
  {
    icon: NotebookPen,
    title: "Smart Prompts",
    description: "Receive context-aware nudges to add notes, attach photos, or mark triggers the moment patterns begin to shift."
  },
  {
    icon: Activity,
    title: "Deep-Dive Evenings",
    description: "Review beautifully visualized trend reports that connect lifestyle choices to symptom intensity."
  },
  {
    icon: Brain,
    title: "Clinic-Ready Exports",
    description: "Hand your specialist concise summaries with the exact data points they ask for every visit."
  }
];

const testimonials = [
  {
    name: "Maya R.",
    role: "Autoimmune warrior & yoga teacher",
    quote:
      "The visual body map alone changed everything. Seeing exactly where and when pain spikes makes conversations with my rheumatologist effortless."
  },
  {
    name: "Jordan P.",
    role: "Care partner",
    quote:
      "We finally have one shared space for triggers, meds, and wins. The calm interface means my partner actually enjoys logging now."
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<DesignOption["id"]>("serenity");

  const selectedDesign = useMemo(
    () => designOptions.find((option) => option.id === selectedDesignId) ?? designOptions[0],
    [selectedDesignId]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Beta signup:", email);
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br text-foreground transition-colors duration-500",
        selectedDesign.gradient
      )}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_55%)]" />

      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Pocket Symptom Tracker
              </span>
              <span className="text-lg font-bold text-foreground">Design Studio Preview</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="#options" className="text-muted-foreground transition-colors hover:text-foreground">
              Design moods
            </Link>
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Highlights
            </Link>
            <Link href="#journey" className="text-muted-foreground transition-colors hover:text-foreground">
              Journey
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-background transition hover:bg-foreground/90"
            >
              Launch app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section id="options" className="container mx-auto px-4 pt-12">
          <div className="rounded-3xl border border-white/30 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Choose a mood</p>
                <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Explore three modern art directions</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Toggle between mood boards to preview how Pocket Symptom Tracker can feel—from calm and restorative to vibrant and cinematic. Your feedback will shape the final polish.
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground shadow-sm dark:border-white/10 dark:bg-slate-900/60 md:flex">
                <Sparkles className="h-3.5 w-3.5" /> beta concept
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {designOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedDesignId(option.id)}
                  className={cn(
                    "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/60",
                    option.id === selectedDesignId &&
                      cn("ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950", option.accentRing)
                  )}
                >
                  <span className={cn("inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", option.pillClasses)}>
                    {option.name} mood
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{option.tagline}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span>Signature metric</span>
                    <span className={cn("text-base font-semibold", option.accentText)}>{option.stat.value}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 pt-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 p-10 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-slate-950/60 md:p-14">
            <div
              className={cn(
                "absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br opacity-70 blur-3xl dark:opacity-60 md:-right-10 md:-top-12 md:h-96 md:w-96",
                selectedDesign.accentGradient
              )}
            />
            <div
              className={cn(
                "absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-gradient-to-br opacity-60 blur-3xl dark:opacity-50 md:-bottom-20 md:-left-10 md:h-72 md:w-72",
                selectedDesign.accentGradient
              )}
            />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
              <div>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]",
                    selectedDesign.pillClasses
                  )}
                >
                  Concept preview
                </span>
                <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                  Feel the future of
                  <span
                    className={cn(
                      "relative ml-2 inline-block bg-gradient-to-r bg-clip-text text-transparent",
                      selectedDesign.accentGradient
                    )}
                  >
                    symptom tracking
                  </span>
                </h2>
                <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                  {selectedDesign.tagline} {selectedDesign.description} We pair calm aesthetics with powerful analytics so you can advocate for yourself with confidence.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                  {selectedDesign.heroBullets.map((bullet) => {
                    const Icon = bullet.icon;
                    return (
                      <div
                        key={bullet.title}
                        className="flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/60 p-4 shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-slate-950/70"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{bullet.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{bullet.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-lg transition hover:-translate-y-0.5 hover:bg-foreground/90"
                  >
                    Explore interactive demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Or keep scrolling to compare the full journey experience.
                  </p>
                </div>
              </div>

              <aside className="relative isolate flex flex-col gap-5 rounded-2xl border border-white/30 bg-white/80 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80">
                <div className="flex flex-col gap-2 text-sm">
                  <span className="text-muted-foreground">Signature metric</span>
                  <span className={cn("text-4xl font-bold", selectedDesign.accentText)}>{selectedDesign.stat.value}</span>
                  <p className="text-xs text-muted-foreground">
                    {selectedDesign.stat.label}
                    <br />
                    {selectedDesign.stat.sublabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-white/40 bg-white/70 p-5 text-sm shadow-inner dark:border-white/10 dark:bg-slate-900/70">
                  <p className="font-semibold text-foreground">Join the style lab</p>
                  <p className="mt-2 text-muted-foreground">
                    Vote for your favorite direction and get early access to design drops, wallpapers, and product walkthroughs.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-inner dark:border-white/10 dark:bg-slate-900/70">
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                      <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        beta updates
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Your best email"
                        required
                        className="w-full rounded-xl border border-white/50 bg-white/90 px-4 py-2 text-sm text-foreground shadow-sm transition focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/10 dark:bg-slate-950/70"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-lg transition hover:-translate-y-0.5 hover:bg-foreground/90"
                      >
                        Join the beta
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-100/80 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100">
                      <Check className="h-4 w-4" />
                      Thanks! We'll be in touch soon.
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Or {" "}
                    <Link href="/onboarding" className="font-semibold text-foreground underline underline-offset-4">
                      try the live build now
                    </Link>{" "}
                    — no signup required.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="container mx-auto px-4 pb-20"
        >
          <div className="rounded-3xl border border-white/20 bg-white/50 p-10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Built to feel luxurious and lightning fast</h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                Every interaction has been reimagined to remove friction. Fluid animations, tactile feedback, and adaptive layouts keep tracking sustainable through the highs and lows.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-950/70"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10 text-foreground transition group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                    <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-foreground/10 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="journey" className="container mx-auto px-4 pb-20">
          <div className="rounded-3xl border border-white/20 bg-white/60 p-10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Your day with Pocket Symptom Tracker</h2>
              <p className="mx-auto max-w-3xl text-base text-muted-foreground">
                Designed for consistency, the refreshed experience supports meaningful tracking moments from sunrise reflections to evening insights.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {journeyMoments.map((moment) => {
                const Icon = moment.icon;
                return (
                  <div
                    key={moment.title}
                    className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/70 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/70"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{moment.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{moment.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="rounded-3xl border border-white/20 bg-white/60 p-10 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
            <h2 className="text-3xl font-bold md:text-4xl">Voices from the community</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
              Early testers across chronic illness communities are shaping every detail. Their words fuel our commitment to build a companion that truly supports healing.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-2xl dark:border-white/10 dark:bg-slate-950/70"
                >
                  <span className="text-5xl text-foreground/10">“</span>
                  <blockquote className="-mt-6 text-sm text-muted-foreground">{testimonial.quote}</blockquote>
                  <figcaption className="mt-6 flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{testimonial.name}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{testimonial.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-foreground via-foreground/90 to-foreground text-background shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_55%)]" />
            <div className="relative px-8 py-16 text-center md:px-16">
              <h2 className="text-3xl font-bold md:text-4xl">Ready to shape the final experience?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base opacity-80">
                Jump into the live prototype, track a few days, and tell us which visual direction inspires you most. Your voice drives the roadmap.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-background/90"
                >
                  Start tracking now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-background/40 px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-background/10"
                >
                  Learn about the mission
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/20 bg-white/70 py-12 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Pocket Symptom Tracker</p>
                <p className="text-base font-bold text-foreground">Design Lab Edition</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              A privacy-first companion crafted with compassion for people navigating chronic conditions.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="transition hover:text-foreground">
                  Highlights
                </Link>
              </li>
              <li>
                <Link href="/help/keyboard-shortcuts" className="transition hover:text-foreground">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="transition hover:text-foreground">
                  Get started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="transition hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/steven-d-pennington/symptom-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="transition hover:text-foreground">
                  Help center
                </Link>
              </li>
              <li>
                <a href="mailto:steve.d.pennington@gmail.com" className="transition hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-10 border-t border-white/20 px-4 pt-6 text-center text-xs uppercase tracking-[0.35em] text-muted-foreground dark:border-white/10">
          © {new Date().getFullYear()} Pocket Symptom Tracker. Crafted with empathy for the chronic illness community.
        </div>
      </footer>
    </div>
  );
}
