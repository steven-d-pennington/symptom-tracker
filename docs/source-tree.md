# Project Source Tree

## Overview

The project follows a standard **Next.js App Router** structure with a `src` directory. It uses **TypeScript** and **Tailwind CSS**.

## Directory Structure

```
symptom-tracker/
├── .bmad/                  # BMAD workflow configurations
├── docs/                   # Project documentation
├── public/                 # Static assets (icons, manifest, sw.js)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (protected)/    # Authenticated routes (Route Group)
│   │   │   ├── body-map/   # Body mapping feature
│   │   │   ├── dashboard/  # Main user dashboard
│   │   │   ├── flares/     # Flare tracking
│   │   │   ├── insights/   # Analytics & insights
│   │   │   ├── log/        # Daily logging
│   │   │   ├── settings/   # User settings
│   │   │   └── ...         # Other feature routes
│   │   ├── api/            # API Route Handlers
│   │   │   ├── beta-signup/
│   │   │   ├── correlation/
│   │   │   └── sync/
│   │   ├── onboarding/     # New user onboarding flow
│   │   ├── globals.css     # Global styles (Tailwind directives)
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   │   ├── ui/             # Reusable base components (Radix UI wrappers)
│   │   ├── analytics/      # Analytics charts & widgets
│   │   ├── body-map/       # Body map visualization
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── flares/         # Flare management components
│   │   └── ...             # Feature-specific components
│   ├── lib/                # Shared logic & utilities
│   │   ├── db/             # Dexie.js database schema & client
│   │   ├── repositories/   # Data access layer
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper functions
│   └── types/              # Global type definitions
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies & scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Directories

- **`src/app/(protected)`**: Contains the main application views accessible after login/onboarding. The `(protected)` route group likely handles layout wrappers for authenticated users (navigation, auth checks).
- **`src/lib/db`**: Contains the **Dexie.js** database definition (`client.ts`) and schema (`schema.ts`), which is central to the Local-First architecture.
- **`src/components/ui`**: Hosts the design system primitives, ensuring UI consistency.
- **`public`**: Contains PWA assets like `manifest.json` and `sw.js` (Service Worker), indicating PWA support.
