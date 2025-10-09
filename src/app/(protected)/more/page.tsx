import Link from "next/link";
import {
  Settings,
  Download,
  Lock,
  Info,
  FileText,
  Calendar,
  HelpCircle,
  LogOut,
  Sliders,
} from "lucide-react";

export default function MorePage() {
  const menuItems = [
    {
      title: "App Features",
      items: [
        {
          icon: Sliders,
          label: "Manage Data",
          href: "/manage",
          description: "Customize medications, symptoms, and triggers",
        },
        {
          icon: Calendar,
          label: "Calendar View",
          href: "/calendar",
          description: "View your health history timeline",
        },
        {
          icon: FileText,
          label: "Documentation",
          href: "#",
          description: "Learn how to use the app",
        },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        {
          icon: Download,
          label: "Export Data",
          href: "/export",
          description: "Download your health data",
        },
        {
          icon: Lock,
          label: "Privacy Policy",
          href: "/privacy",
          description: "How we protect your data",
        },
      ],
    },
    {
      title: "App Settings",
      items: [
        {
          icon: Settings,
          label: "Settings",
          href: "/settings",
          description: "Customize your experience",
        },
        {
          icon: HelpCircle,
          label: "Help & Support",
          href: "#",
          description: "Get help using the app",
        },
        {
          icon: Info,
          label: "About",
          href: "/about",
          description: "App version and information",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">More</h1>
        <p className="mt-2 text-muted-foreground">
          Additional features and settings
        </p>
      </div>

      <div className="space-y-8">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">
                        {item.label}
                      </div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="pt-8 border-t border-border">
          <div className="rounded-lg bg-muted/50 p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Pocket Symptom Tracker
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              Version 0.2.0
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              Phase 1 & 2 Complete ✅
            </div>
            <div className="text-xs text-muted-foreground">
              A privacy-first PWA for tracking autoimmune symptoms
            </div>
          </div>
        </div>

        {/* Future: Logout Button */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-border bg-card text-muted-foreground opacity-50 cursor-not-allowed"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out (Coming Soon)</span>
        </button>
      </div>
    </div>
  );
}
