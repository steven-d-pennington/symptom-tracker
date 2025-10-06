import type { Metadata } from "next";
import "./globals.css";
import { OnboardingRedirectGate } from "./onboarding/components/OnboardingRedirectGate";

export const metadata: Metadata = {
  title: "Pocket Symptom Tracker",
  description:
    "Privacy-first PWA foundations for tracking autoimmune symptoms, daily entries, and health trends.",
  metadataBase: new URL("https://symptom-tracker.local"),
  openGraph: {
    title: "Pocket Symptom Tracker",
    description:
      "Offline-ready health tracking workspace built with Next.js, Tailwind, and Dexie.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased font-sans">
        <OnboardingRedirectGate />
        {children}
      </body>
    </html>
  );
}
