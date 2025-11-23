import Link from "next/link";
import { BookOpen, Map, Utensils, Pill, Stethoscope, Wind, Smile, Moon, BarChart3, Calendar, Settings, Download, Keyboard, HelpCircle } from "lucide-react";

interface HelpTopic {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HelpCategory {
  title: string;
  description: string;
  topics: HelpTopic[];
}

export default function HelpPage() {
  const categories: HelpCategory[] = [
    {
      title: "Getting Started",
      description: "New to Pocket Symptom Tracker? Start here to learn the basics.",
      topics: [
        {
          title: "Welcome & Getting Started",
          description: "Your first steps with the app and what to do first",
          href: "/help/getting-started",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "Tracking Features",
      description: "Learn how to track your health data effectively.",
      topics: [
        {
          title: "Body Markers",
          description: "Track Flares, Pain, and Inflammation on the Body Map",
          href: "/help/body-markers",
          icon: Map,
        },
        {
          title: "Logging Food",
          description: "Track meals and identify potential food triggers",
          href: "/help/logging-food",
          icon: Utensils,
        },
        {
          title: "Logging Symptoms",
          description: "Record symptoms with severity ratings and notes",
          href: "/help/logging-symptoms",
          icon: Stethoscope,
        },
        {
          title: "Logging Medications",
          description: "Track medication timing and dosages",
          href: "/help/logging-medications",
          icon: Pill,
        },
        {
          title: "Logging Triggers",
          description: "Identify and record environmental or lifestyle triggers",
          href: "/help/logging-triggers",
          icon: Wind,
        },
        {
          title: "Mood & Sleep Tracking",
          description: "Track daily mood and sleep patterns for better insights",
          href: "/help/mood-and-sleep",
          icon: Smile,
        },
      ],
    },
    {
      title: "Analysis & Insights",
      description: "Understanding your data and patterns.",
      topics: [
        {
          title: "Using the Body Map",
          description: "Navigate body views and mark problem areas effectively",
          href: "/help/body-map",
          icon: Map,
        },
        {
          title: "Analytics & Insights",
          description: "Understand problem areas, trends, and intervention effectiveness",
          href: "/help/analytics",
          icon: BarChart3,
        },
        {
          title: "Calendar View",
          description: "View your health timeline and navigate historical data",
          href: "/help/calendar",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Data Management",
      description: "Managing your health data and settings.",
      topics: [
        {
          title: "Managing Your Data",
          description: "Add, edit, and organize symptoms, foods, triggers, and medications",
          href: "/help/managing-data",
          icon: Settings,
        },
        {
          title: "Sync & Backup",
          description: "Enable Cloud Sync or manually export your data",
          href: "/help/sync-and-backup",
          icon: Download,
        },
      ],
    },
    {
      title: "Accessibility",
      description: "Features that make the app accessible to everyone.",
      topics: [
        {
          title: "Keyboard Shortcuts",
          description: "Navigate faster with keyboard shortcuts and accessibility features",
          href: "/help/keyboard-shortcuts",
          icon: Keyboard,
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Help Center</h1>
            <p className="text-muted-foreground mt-1">
              Find guides and answers to common questions
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category.title}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {category.title}
              </h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {category.topics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <Link
                    key={topic.href}
                    href={topic.href}
                    className="group p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Need More Help */}
      <div className="mt-12 p-6 rounded-lg border border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Still need help?
        </h3>
        <p className="text-muted-foreground mb-4">
          Can't find what you're looking for? We're here to help.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <HelpCircle className="w-4 h-4" />
            About the App
          </Link>
          <a
            href="mailto:steve.d.pennington@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium text-foreground"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
