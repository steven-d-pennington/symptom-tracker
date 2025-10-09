import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OnboardingRedirectGate } from "./onboarding/components/OnboardingRedirectGate";
import { OfflineIndicator, InstallPrompt, UpdateNotification } from "@/components/pwa";
import { NavLayout } from "@/components/navigation/NavLayout";
import { MigrationProvider } from "@/components/providers/MigrationProvider";

export const metadata: Metadata = {
  title: "Pocket Symptom Tracker",
  description:
    "Privacy-first PWA for tracking autoimmune symptoms, daily entries, and health trends. Works offline.",
  metadataBase: new URL("https://symptom-tracker.local"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Symptom Tracker",
  },
  openGraph: {
    title: "Pocket Symptom Tracker",
    description:
      "Offline-ready health tracking workspace built with Next.js, Tailwind, and Dexie.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased font-sans">
        <MigrationProvider>
          <OnboardingRedirectGate />
          <NavLayout>{children}</NavLayout>
          {/* PWA Components */}
          <OfflineIndicator />
          <InstallPrompt />
          <UpdateNotification />
        </MigrationProvider>
      </body>
    </html>
  );
}
