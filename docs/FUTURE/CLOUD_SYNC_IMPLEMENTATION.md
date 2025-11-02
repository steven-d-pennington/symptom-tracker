# Cloud Sync Implementation Plan

**Updated:** 2025-11-02
**Phase:** Technical Infrastructure + Authentication + Payment
**Goal:** Build reliable cloud sync with email-based magic link auth and payment gateway

---

## Architecture Decisions

Based on design discussions, the following architectural decisions have been finalized:

1. **Email as Primary Identifier** - Users interact only with email; GUID abstracted on backend
2. **One Email = One Account** - Enforced 1:1 mapping between email and GUID
3. **Magic Link Authentication** - No passwords, email-based verification via magic links
4. **Payment Abstraction** - Support multiple payment providers (Stripe now, L402 later)
5. **Promo Codes** - Both single-use and multi-use codes for beta testers/partnerships
6. **Email Recovery Only** - No separate recovery codes (magic link handles recovery)
7. **Smart Multi-Device Sync** - Only prompt about data replacement if local data exists
8. **Storage Quota** - 100MB default, $5 per 50MB top-up
9. **Rate Limiting** - 100 syncs per hour per user

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Client (Browser)                │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  IndexedDB (Dexie)             │   │
│  │  - Local-first (source of truth)│  │
│  │  - All tables with userId      │   │
│  └──────────┬─────────────────────┘   │
│             │                           │
│  ┌──────────▼─────────────────────┐   │
│  │  Sync Service                  │   │
│  │  - Change tracking             │   │
│  │  - Conflict resolution         │   │
│  │  - Background worker           │   │
│  │  - Rate limiting (100/hr)      │   │
│  └──────────┬─────────────────────┘   │
└─────────────┼─────────────────────────┘
              │ HTTPS (REST API)
              │
┌─────────────▼─────────────────────────┐
│         Supabase Backend              │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  PostgreSQL Database            │ │
│  │  - Mirrors IndexedDB schema     │ │
│  │  - Row-Level Security (RLS)     │ │
│  │  - Timestamps for sync          │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Storage (Photos)               │ │
│  │  - Encrypted blobs              │ │
│  │  - Lazy-load full-res           │ │
│  └─────────────────────────────────┘ │
└───────────────────────────────────────┘
```

---

## Backend Choice: Supabase

**Why Supabase:**
- ✅ Fast setup (TypeScript SDK excellent)
- ✅ PostgreSQL with full SQL power
- ✅ Row-Level Security (multi-tenant ready)
- ✅ Built-in storage for photos
- ✅ Real-time subscriptions (future use)
- ✅ Free tier: 500MB DB, 1GB storage
- ✅ Self-hostable (migration path if needed)

**Setup:**
```bash
npm install @supabase/supabase-js
npx supabase init
npx supabase start # Local development
```

---

## User Flows

### New User Onboarding

```
1. Install app
2. "What's your email?" → user@example.com
3. Backend checks: Does email exist?
   → No: Create new user (generate GUID, link to email)
   → Yes: "We found your account! Sending magic link..."
4. Local-only usage (no sync yet)
5. User can unlock sync later
```

### Unlock Cloud Sync Flow

```
1. User clicks "Unlock Cloud Sync"
2. Show unlock options:
   ┌────────────────────────────────────┐
   │ Unlock Cloud Sync                  │
   │                                    │
   │ Email: user@example.com            │
   │                                    │
   │ Choose unlock method:              │
   │ ( ) Pay $10 - Lifetime access      │
   │ ( ) Enter promo code               │
   │                                    │
   │ [___________________________]      │
   │                                    │
   │ [Unlock]                           │
   └────────────────────────────────────┘

3a. If payment selected:
    → Redirect to Stripe checkout
    → On success: Send magic link for verification
    → Click magic link → Sync enabled

3b. If promo code entered:
    → Validate code (single-use consumed, multi-use tracked)
    → Send magic link for verification
    → Click magic link → Sync enabled
```

### Multi-Device Setup

```
**Device 2:**
1. Install app
2. "What's your email?" → user@example.com
3. Backend: "Account found! Sending magic link..."
4. Check email, click magic link
5. Check local IndexedDB:
   → Empty or only defaults? → Silently sync down
   → Has user data? → Show prompt:
     ┌────────────────────────────────────┐
     │ Sync Your Data                     │
     │                                    │
     │ You have local data that will be   │
     │ replaced with your synced data.    │
     │                                    │
     │ [Replace & Sync] [Keep Local]      │
     └────────────────────────────────────┘
6. Sync completes, app ready
```

---

## Authentication System

### Magic Link Flow

```typescript
// Architecture:
// 1. User enters email
// 2. Server generates one-time token (JWT, 15min expiry)
// 3. Email sent with link: https://app.com/auth/verify?token=...
// 4. User clicks link
// 5. Token validated, session created
// 6. User redirected to app

interface MagicLinkToken {
  email: string;
  userId: string; // GUID
  purpose: 'onboarding' | 'login' | 'verify_payment';
  expiresAt: Date;
}
```

### Authentication API Endpoints

```typescript
// POST /api/auth/send-magic-link
// Body: { email: string }
// Response: { success: boolean, message: string }

// GET /api/auth/verify?token=xxx
// Response: Sets session cookie, redirects to app

// POST /api/auth/logout
// Response: Clears session cookie
```

### Session Management

```typescript
// Use Supabase Auth or custom JWT sessions
// Store in httpOnly cookie for security
// Validate on every sync request
```

---

## Payment System

### Payment Provider Abstraction

```typescript
// src/lib/services/payment/types.ts

export interface PaymentSession {
  id: string;
  url: string; // Redirect URL for payment flow
  status: 'pending' | 'complete' | 'failed';
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  name: string;

  /**
   * Initiate a payment session
   */
  createPaymentSession(
    email: string,
    amount: number,
    metadata: Record<string, string>
  ): Promise<PaymentSession>;

  /**
   * Verify a payment was completed
   */
  verifyPayment(sessionId: string): Promise<boolean>;

  /**
   * Handle webhook events
   */
  handleWebhook(payload: any, signature: string): Promise<void>;
}
```

### Stripe Provider Implementation

```typescript
// src/lib/services/payment/stripe.ts

import Stripe from 'stripe';

export class StripePaymentProvider implements PaymentProvider {
  name = 'stripe';
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2024-11-20.acacia' });
  }

  async createPaymentSession(
    email: string,
    amount: number,
    metadata: Record<string, string>
  ): Promise<PaymentSession> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: metadata.product_name || 'Cloud Sync',
            description: metadata.description
          },
          unit_amount: amount * 100 // Stripe uses cents
        },
        quantity: 1
      }],
      metadata,
      success_url: `${process.env.APP_URL}/sync/activated?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/settings`
    });

    return {
      id: session.id,
      url: session.url!,
      status: 'pending',
      amount,
      currency: 'usd'
    };
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === 'paid';
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      // Handle payment completion
      // - Update user record (sync enabled)
      // - Send magic link for verification
      // - Log transaction
    }
  }
}
```

### L402 Provider (Future)

```typescript
// src/lib/services/payment/l402.ts
// Placeholder for Lightning Network payments

export class L402PaymentProvider implements PaymentProvider {
  name = 'l402';

  async createPaymentSession(email: string, amount: number): Promise<PaymentSession> {
    // TODO: Generate Lightning invoice
    // TODO: Return payment request
    throw new Error('L402 not yet implemented');
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    // TODO: Verify Lightning payment
    throw new Error('L402 not yet implemented');
  }

  async handleWebhook(payload: any): Promise<void> {
    // L402 may not use webhooks (poll instead)
  }
}
```

### Payment Service

```typescript
// src/lib/services/payment/service.ts

import { StripePaymentProvider } from './stripe';
import { L402PaymentProvider } from './l402';
import type { PaymentProvider } from './types';

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    // Register providers
    this.providers.set('stripe', new StripePaymentProvider(process.env.STRIPE_SECRET_KEY!));
    // this.providers.set('l402', new L402PaymentProvider());
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider "${name}" not found`);
    }
    return provider;
  }

  async unlockSync(email: string, method: 'stripe' | 'l402' | 'promo', code?: string) {
    if (method === 'promo') {
      return this.unlockWithPromoCode(email, code!);
    }

    const provider = this.getProvider(method);
    return await provider.createPaymentSession(email, 10, {
      product_name: 'Cloud Sync - Lifetime',
      description: '100MB storage + future AI insights'
    });
  }

  private async unlockWithPromoCode(email: string, code: string) {
    // Validate promo code
    // If valid, enable sync without payment
    // Return success (no payment session needed)
  }
}
```

---

## Promo Code System

### Promo Code Schema

```sql
-- Promo codes for free sync access
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('single_use', 'multi_use')),
  storage_quota_mb INTEGER DEFAULT 100,
  max_redemptions INTEGER, -- NULL for unlimited (multi-use)
  redemption_count INTEGER DEFAULT 0,

  -- Optional metadata
  description TEXT,
  created_by TEXT, -- Admin/system identifier
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track redemptions
CREATE TABLE promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(promo_code_id, user_id) -- Prevent duplicate redemptions
);

CREATE INDEX idx_promo_codes_active ON promo_codes(code) WHERE is_active = true;
CREATE INDEX idx_promo_redemptions_user ON promo_code_redemptions(user_id);
```

### Promo Code Validation

```typescript
// src/lib/services/promoCode/validator.ts

interface PromoCode {
  id: string;
  code: string;
  type: 'single_use' | 'multi_use';
  storageQuotaMb: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
}

export class PromoCodeValidator {
  async validate(code: string, userId: string): Promise<{ valid: boolean; error?: string; promo?: PromoCode }> {
    // 1. Find promo code
    const promo = await db.promoCodes.findUnique({ where: { code } });

    if (!promo) {
      return { valid: false, error: 'Invalid promo code' };
    }

    // 2. Check if active
    if (!promo.isActive) {
      return { valid: false, error: 'Promo code is no longer active' };
    }

    // 3. Check date validity
    const now = new Date();
    if (now < promo.validFrom || (promo.validUntil && now > promo.validUntil)) {
      return { valid: false, error: 'Promo code is expired' };
    }

    // 4. Check if already redeemed by this user
    const redemption = await db.promoCodeRedemptions.findFirst({
      where: { promoCodeId: promo.id, userId }
    });

    if (redemption) {
      return { valid: false, error: 'You have already used this promo code' };
    }

    // 5. Check redemption limit (single-use only)
    if (promo.type === 'single_use' && promo.redemptionCount > 0) {
      return { valid: false, error: 'Promo code has already been used' };
    }

    if (promo.maxRedemptions && promo.redemptionCount >= promo.maxRedemptions) {
      return { valid: false, error: 'Promo code redemption limit reached' };
    }

    return { valid: true, promo };
  }

  async redeem(code: string, userId: string): Promise<void> {
    const { valid, error, promo } = await this.validate(code, userId);

    if (!valid) {
      throw new Error(error);
    }

    // Transaction: record redemption + increment count + enable sync
    await db.transaction(async (tx) => {
      // Record redemption
      await tx.promoCodeRedemptions.create({
        data: {
          promoCodeId: promo!.id,
          userId,
          redeemedAt: new Date()
        }
      });

      // Increment redemption count
      await tx.promoCodes.update({
        where: { id: promo!.id },
        data: { redemptionCount: { increment: 1 } }
      });

      // Enable sync for user
      await tx.users.update({
        where: { id: userId },
        data: {
          storageQuotaMb: promo!.storageQuotaMb,
          syncEnabled: true,
          syncEnabledAt: new Date()
        }
      });
    });
  }
}
```

### Promo Code Admin API

```typescript
// src/app/api/admin/promo-codes/route.ts

// POST /api/admin/promo-codes
export async function POST(request: Request) {
  // TODO: Add admin auth check

  const { code, type, storageQuotaMb, maxRedemptions, description, validUntil } = await request.json();

  const promo = await db.promoCodes.create({
    data: {
      code: code.toUpperCase(), // Normalize to uppercase
      type,
      storageQuotaMb: storageQuotaMb || 100,
      maxRedemptions: type === 'single_use' ? 1 : maxRedemptions,
      description,
      validUntil: validUntil ? new Date(validUntil) : null,
      createdBy: 'admin' // TODO: Get from auth session
    }
  });

  return Response.json({ success: true, promo });
}

// Example usage:
// Create single-use gift code:
// POST { code: "GIFT-ABC123", type: "single_use", description: "Gift for friend" }

// Create multi-use beta code:
// POST { code: "BETA2025", type: "multi_use", maxRedemptions: null, description: "Beta testers" }
```

---

## Database Schema (Supabase)

### Core Tables (Mirror IndexedDB)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY, -- GUID generated server-side or passed from client
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Sync status
  sync_enabled BOOLEAN DEFAULT false,
  sync_enabled_at TIMESTAMPTZ,
  sync_enabled_via TEXT CHECK (sync_enabled_via IN ('payment', 'promo_code')),

  -- Storage management
  storage_used_mb NUMERIC DEFAULT 0,
  storage_quota_mb NUMERIC DEFAULT 100,
  last_sync_at TIMESTAMPTZ,

  -- Payment tracking
  stripe_customer_id TEXT,
  stripe_payment_id TEXT -- Latest payment ID
);

-- Add promo codes and redemptions tables after users table
-- (Already defined in Promo Code System section above)

-- Symptoms
CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  severity_scale JSONB,
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptom Instances
CREATE TABLE symptom_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symptom_id UUID REFERENCES symptoms(id),
  severity INTEGER,
  location TEXT,
  duration INTEGER,
  triggers TEXT[],
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Entries
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  notes TEXT,
  mood INTEGER,
  energy INTEGER,
  sleep_quality INTEGER,
  stress_level INTEGER,
  symptoms JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  triggers JSONB DEFAULT '[]'::jsonb,
  foods JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Foods
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  allergens TEXT[],
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  schedule JSONB,
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  is_default BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flares
CREATE TABLE flares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symptom_id UUID REFERENCES symptoms(id),
  body_region_id TEXT,
  coordinates JSONB,
  status TEXT CHECK (status IN ('active', 'improving', 'resolved')),
  severity INTEGER,
  notes TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flare Events (append-only history)
CREATE TABLE flare_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  flare_id UUID REFERENCES flares(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity INTEGER,
  notes TEXT,
  photo_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Body Map Locations
CREATE TABLE body_map_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body_region_id TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  severity INTEGER,
  symptom_id UUID REFERENCES symptoms(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo Attachments (metadata only, blobs in storage)
CREATE TABLE photo_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Supabase storage path
  thumbnail_path TEXT,
  encryption_iv TEXT, -- For client-side encryption
  file_size_bytes INTEGER,
  mime_type TEXT,
  tags TEXT[],
  annotations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food Events
CREATE TABLE food_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  consumed_at TIMESTAMPTZ NOT NULL,
  portion_size TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Events
CREATE TABLE medication_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id),
  taken_at TIMESTAMPTZ NOT NULL,
  dosage TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger Events
CREATE TABLE trigger_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES triggers(id),
  exposed_at TIMESTAMPTZ NOT NULL,
  intensity INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync Queue (track pending changes)
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT CHECK (operation IN ('create', 'update', 'delete')),
  data JSONB,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Sync Metadata (track per-device sync state)
CREATE TABLE sync_metadata (
  device_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_sync_at TIMESTAMPTZ,
  last_sync_version INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_symptoms_user ON symptoms(user_id) WHERE is_active = true;
CREATE INDEX idx_symptom_instances_user_timestamp ON symptom_instances(user_id, timestamp DESC);
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, date DESC);
CREATE INDEX idx_foods_user ON foods(user_id) WHERE is_active = true;
CREATE INDEX idx_medications_user ON medications(user_id) WHERE is_active = true;
CREATE INDEX idx_triggers_user ON triggers(user_id) WHERE is_active = true;
CREATE INDEX idx_flares_user_status ON flares(user_id, status) WHERE status != 'resolved';
CREATE INDEX idx_sync_queue_unprocessed ON sync_queue(user_id, created_at) WHERE processed_at IS NULL;

-- Compound indexes for common queries
CREATE INDEX idx_daily_entries_updated ON daily_entries(user_id, updated_at DESC);
CREATE INDEX idx_photos_user_created ON photo_attachments(user_id, created_at DESC);
```

---

## Row-Level Security (RLS) Policies

**Critical for multi-tenant security:**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flares ENABLE ROW LEVEL SECURITY;
ALTER TABLE flare_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's GUID
-- For now (pre-auth), we'll use API key auth with user_id in header
-- Later, replace with auth.uid() when Supabase Auth is integrated

-- Policy: Users can only access their own data
CREATE POLICY "Users can access own data" ON symptoms
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON symptom_instances
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON daily_entries
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON foods
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON medications
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON triggers
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON flares
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON flare_events
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON body_map_locations
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON photo_attachments
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON food_events
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON medication_events
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON trigger_events
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON sync_queue
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can access own data" ON sync_metadata
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);
```

---

## Client-Side Sync Service

### 1. Sync Configuration

```typescript
// src/lib/services/sync/config.ts

export interface SyncConfig {
  enabled: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  syncIntervalMs: number; // Default: 30000 (30 seconds)
  retryAttempts: number;  // Default: 3
  retryBackoffMs: number; // Default: 2000 (exponential)
  rateLimitPerHour: number; // Default: 100
  batchSize: number; // Default: 50 records per sync
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  enabled: false, // Disabled until user enables
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  syncIntervalMs: 30000,
  retryAttempts: 3,
  retryBackoffMs: 2000,
  rateLimitPerHour: 100,
  batchSize: 50
};
```

### 2. Sync State Management

```typescript
// src/lib/services/sync/state.ts

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'error'
  | 'offline'
  | 'rate_limited'
  | 'quota_exceeded';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  pendingChanges: number;
  uploadedBytes: number;
  downloadedBytes: number;

  // Rate limiting
  syncsThisHour: number;
  hourResetAt: Date;
}

export interface SyncProgress {
  phase: 'pull' | 'push' | 'photos';
  current: number;
  total: number;
  message: string;
}
```

### 3. Change Tracking

```typescript
// src/lib/services/sync/changeTracker.ts

import { db } from '@/lib/db/client';

export interface Change {
  id: string;
  table: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  attempts: number;
}

export class ChangeTracker {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Track a local change that needs to sync
   */
  async trackChange(
    table: string,
    operation: 'create' | 'update' | 'delete',
    recordId: string,
    data?: any
  ): Promise<void> {
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      userId: this.userId,
      table,
      recordId,
      operation,
      data,
      attempts: 0,
      timestamp: new Date(),
      synced: false
    });
  }

  /**
   * Get all pending changes
   */
  async getPendingChanges(limit = 50): Promise<Change[]> {
    return await db.syncQueue
      .where('userId').equals(this.userId)
      .and(change => !change.synced)
      .limit(limit)
      .toArray();
  }

  /**
   * Mark change as synced
   */
  async markSynced(changeId: string): Promise<void> {
    await db.syncQueue.update(changeId, {
      synced: true,
      syncedAt: new Date()
    });
  }

  /**
   * Increment retry count
   */
  async incrementRetry(changeId: string, error: string): Promise<void> {
    const change = await db.syncQueue.get(changeId);
    if (change) {
      await db.syncQueue.update(changeId, {
        attempts: change.attempts + 1,
        lastError: error
      });
    }
  }

  /**
   * Get count of pending changes
   */
  async getPendingCount(): Promise<number> {
    return await db.syncQueue
      .where('userId').equals(this.userId)
      .and(change => !change.synced)
      .count();
  }
}
```

### 4. Sync Engine (Core Logic)

```typescript
// src/lib/services/sync/engine.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from '@/lib/db/client';
import { ChangeTracker } from './changeTracker';
import type { SyncConfig, SyncState, SyncProgress } from './state';

export class SyncEngine {
  private supabase: SupabaseClient;
  private userId: string;
  private config: SyncConfig;
  private changeTracker: ChangeTracker;
  private state: SyncState;
  private progressCallback?: (progress: SyncProgress) => void;

  constructor(userId: string, config: SyncConfig) {
    this.userId = userId;
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          'x-user-id': userId // For RLS policy
        }
      }
    });
    this.changeTracker = new ChangeTracker(userId);
    this.state = this.loadState();
  }

  /**
   * Main sync operation
   */
  async sync(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('Sync is not enabled');
    }

    if (this.state.status === 'syncing') {
      console.log('Sync already in progress');
      return;
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      this.updateState({ status: 'rate_limited' });
      throw new Error('Rate limit exceeded. Try again later.');
    }

    // Check online status
    if (!navigator.onLine) {
      this.updateState({ status: 'offline' });
      throw new Error('No internet connection');
    }

    try {
      this.updateState({ status: 'syncing' });

      // Phase 1: Pull remote changes
      await this.pullChanges();

      // Phase 2: Push local changes
      await this.pushChanges();

      // Phase 3: Sync photos (if any pending)
      await this.syncPhotos();

      this.updateState({
        status: 'idle',
        lastSyncAt: new Date(),
        lastError: null
      });

      this.incrementSyncCount();

    } catch (error) {
      console.error('Sync failed:', error);
      this.updateState({
        status: 'error',
        lastError: error.message
      });
      throw error;
    }
  }

  /**
   * Pull remote changes and apply locally
   */
  private async pullChanges(): Promise<void> {
    const lastSync = this.state.lastSyncAt || new Date(0);

    // Tables to sync (in order, respecting foreign keys)
    const tables = [
      'symptoms',
      'foods',
      'medications',
      'triggers',
      'symptom_instances',
      'daily_entries',
      'flares',
      'flare_events',
      'body_map_locations',
      'food_events',
      'medication_events',
      'trigger_events',
      'photo_attachments'
    ];

    let processedCount = 0;
    const totalTables = tables.length;

    for (const table of tables) {
      this.reportProgress({
        phase: 'pull',
        current: processedCount,
        total: totalTables,
        message: `Downloading ${table}...`
      });

      // Get records updated since last sync
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('user_id', this.userId)
        .gt('updated_at', lastSync.toISOString())
        .limit(this.config.batchSize);

      if (error) {
        throw new Error(`Failed to pull ${table}: ${error.message}`);
      }

      if (data && data.length > 0) {
        // Apply changes to local database
        await this.applyRemoteChanges(table, data);
      }

      processedCount++;
    }
  }

  /**
   * Apply remote changes to local IndexedDB
   */
  private async applyRemoteChanges(table: string, records: any[]): Promise<void> {
    const dbTable = (db as any)[table];
    if (!dbTable) {
      console.warn(`Table ${table} not found in local database`);
      return;
    }

    for (const record of records) {
      const local = await dbTable.get(record.id);

      if (!local) {
        // New record, insert
        await dbTable.add(record);
      } else {
        // Existing record, check for conflicts
        const resolved = await this.resolveConflict(table, local, record);
        await dbTable.put(resolved);
      }
    }
  }

  /**
   * Resolve conflicts between local and remote versions
   */
  private async resolveConflict(table: string, local: any, remote: any): Promise<any> {
    const localTime = new Date(local.updated_at).getTime();
    const remoteTime = new Date(remote.updated_at).getTime();

    // Strategy 1: Last-write-wins (simple)
    if (remoteTime > localTime) {
      return remote;
    }

    // Strategy 2: Semantic merging for specific tables
    if (table === 'daily_entries') {
      return this.mergeDailyEntries(local, remote);
    }

    // Default: keep local
    return local;
  }

  /**
   * Semantic merging for daily entries
   */
  private mergeDailyEntries(local: any, remote: any): any {
    return {
      ...local,
      // Merge arrays (deduplicate)
      symptoms: this.mergeArrays(local.symptoms || [], remote.symptoms || []),
      medications: this.mergeArrays(local.medications || [], remote.medications || []),
      triggers: this.mergeArrays(local.triggers || [], remote.triggers || []),
      foods: this.mergeArrays(local.foods || [], remote.foods || []),
      // Use newer timestamp
      updated_at: new Date(Math.max(
        new Date(local.updated_at).getTime(),
        new Date(remote.updated_at).getTime()
      ))
    };
  }

  /**
   * Merge arrays and deduplicate
   */
  private mergeArrays(arr1: any[], arr2: any[]): any[] {
    const merged = [...arr1, ...arr2];
    const unique = Array.from(
      new Map(merged.map(item => [item.id || JSON.stringify(item), item])).values()
    );
    return unique;
  }

  /**
   * Push local changes to server
   */
  private async pushChanges(): Promise<void> {
    const changes = await this.changeTracker.getPendingChanges(this.config.batchSize);

    if (changes.length === 0) {
      return;
    }

    let processedCount = 0;

    for (const change of changes) {
      this.reportProgress({
        phase: 'push',
        current: processedCount,
        total: changes.length,
        message: `Uploading ${change.table}...`
      });

      try {
        await this.pushChange(change);
        await this.changeTracker.markSynced(change.id);
        processedCount++;
      } catch (error) {
        console.error(`Failed to push change ${change.id}:`, error);
        await this.changeTracker.incrementRetry(change.id, error.message);

        // If too many retries, skip for now
        if (change.attempts >= this.config.retryAttempts) {
          console.warn(`Change ${change.id} exceeded retry limit`);
        }
      }
    }

    this.updateState({ pendingChanges: await this.changeTracker.getPendingCount() });
  }

  /**
   * Push a single change to server
   */
  private async pushChange(change: Change): Promise<void> {
    const { table, operation, recordId, data } = change;

    switch (operation) {
      case 'create':
      case 'update':
        const { error: upsertError } = await this.supabase
          .from(table)
          .upsert({ ...data, user_id: this.userId });

        if (upsertError) {
          throw new Error(upsertError.message);
        }
        break;

      case 'delete':
        const { error: deleteError } = await this.supabase
          .from(table)
          .delete()
          .eq('id', recordId)
          .eq('user_id', this.userId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
        break;
    }
  }

  /**
   * Sync photos (placeholder for now)
   */
  private async syncPhotos(): Promise<void> {
    // TODO: Implement photo sync
    // - Upload encrypted photos to Supabase Storage
    // - Track upload progress
    // - Handle large file uploads
    this.reportProgress({
      phase: 'photos',
      current: 0,
      total: 0,
      message: 'Photos sync not yet implemented'
    });
  }

  /**
   * Check if rate limit allows another sync
   */
  private checkRateLimit(): boolean {
    const now = new Date();

    // Reset counter if hour has passed
    if (now.getTime() > this.state.hourResetAt.getTime()) {
      this.state.syncsThisHour = 0;
      this.state.hourResetAt = new Date(now.getTime() + 60 * 60 * 1000);
    }

    return this.state.syncsThisHour < this.config.rateLimitPerHour;
  }

  /**
   * Increment sync counter
   */
  private incrementSyncCount(): void {
    this.state.syncsThisHour++;
    this.saveState();
  }

  /**
   * Load sync state from localStorage
   */
  private loadState(): SyncState {
    const stored = localStorage.getItem(`pocket:sync:${this.userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        lastSyncAt: parsed.lastSyncAt ? new Date(parsed.lastSyncAt) : null,
        hourResetAt: new Date(parsed.hourResetAt)
      };
    }

    return {
      status: 'idle',
      lastSyncAt: null,
      lastError: null,
      pendingChanges: 0,
      uploadedBytes: 0,
      downloadedBytes: 0,
      syncsThisHour: 0,
      hourResetAt: new Date(Date.now() + 60 * 60 * 1000)
    };
  }

  /**
   * Save sync state to localStorage
   */
  private saveState(): void {
    localStorage.setItem(`pocket:sync:${this.userId}`, JSON.stringify(this.state));
  }

  /**
   * Update sync state
   */
  private updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  /**
   * Report progress
   */
  private reportProgress(progress: SyncProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Set progress callback
   */
  setProgressCallback(callback: (progress: SyncProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Enable sync
   */
  async enable(): Promise<void> {
    this.config.enabled = true;
    await this.sync(); // Initial sync
  }

  /**
   * Disable sync
   */
  disable(): void {
    this.config.enabled = false;
  }
}
```

### 5. React Hook for Sync

```typescript
// src/lib/hooks/useSync.ts

import { useEffect, useState, useCallback } from 'react';
import { SyncEngine } from '@/lib/services/sync/engine';
import { DEFAULT_SYNC_CONFIG } from '@/lib/services/sync/config';
import { useCurrentUser } from './useCurrentUser';
import type { SyncState, SyncProgress } from '@/lib/services/sync/state';

let syncEngine: SyncEngine | null = null;

export function useSync() {
  const { userId } = useCurrentUser();
  const [state, setState] = useState<SyncState | null>(null);
  const [progress, setProgress] = useState<SyncProgress | null>(null);

  // Initialize sync engine
  useEffect(() => {
    if (!userId) return;

    if (!syncEngine) {
      syncEngine = new SyncEngine(userId, DEFAULT_SYNC_CONFIG);
      syncEngine.setProgressCallback(setProgress);
    }

    // Load initial state
    setState(syncEngine.getState());

    // Set up auto-sync interval (if enabled)
    const interval = setInterval(() => {
      if (syncEngine && DEFAULT_SYNC_CONFIG.enabled) {
        syncEngine.sync().catch(console.error);
      }
    }, DEFAULT_SYNC_CONFIG.syncIntervalMs);

    return () => clearInterval(interval);
  }, [userId]);

  // Update state when sync completes
  useEffect(() => {
    if (!syncEngine) return;

    const checkState = setInterval(() => {
      setState(syncEngine!.getState());
    }, 1000);

    return () => clearInterval(checkState);
  }, []);

  const manualSync = useCallback(async () => {
    if (!syncEngine) {
      throw new Error('Sync engine not initialized');
    }

    await syncEngine.sync();
    setState(syncEngine.getState());
  }, []);

  const enableSync = useCallback(async () => {
    if (!syncEngine) {
      throw new Error('Sync engine not initialized');
    }

    await syncEngine.enable();
    setState(syncEngine.getState());
  }, []);

  const disableSync = useCallback(() => {
    if (!syncEngine) {
      throw new Error('Sync engine not initialized');
    }

    syncEngine.disable();
    setState(syncEngine.getState());
  }, []);

  return {
    state,
    progress,
    manualSync,
    enableSync,
    disableSync,
    isEnabled: DEFAULT_SYNC_CONFIG.enabled
  };
}
```

---

## UI Components

### 1. Sync Status Indicator

```typescript
// src/components/sync/SyncStatusIndicator.tsx

'use client';

import { useSync } from '@/lib/hooks/useSync';
import { Cloud, CloudOff, RotateCw, AlertCircle, Check } from 'lucide-react';

export function SyncStatusIndicator() {
  const { state, manualSync } = useSync();

  if (!state) return null;

  const getIcon = () => {
    switch (state.status) {
      case 'syncing':
        return <RotateCw className="animate-spin text-blue-500" size={20} />;
      case 'idle':
        return <Check className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'offline':
        return <CloudOff className="text-gray-400" size={20} />;
      case 'rate_limited':
        return <AlertCircle className="text-orange-500" size={20} />;
      default:
        return <Cloud className="text-gray-400" size={20} />;
    }
  };

  const getTooltip = () => {
    switch (state.status) {
      case 'syncing':
        return 'Syncing...';
      case 'idle':
        return state.lastSyncAt
          ? `Last synced ${formatRelativeTime(state.lastSyncAt)}`
          : 'Not synced yet';
      case 'error':
        return `Sync error: ${state.lastError}`;
      case 'offline':
        return 'Offline - will sync when online';
      case 'rate_limited':
        return 'Rate limit reached - try again later';
      default:
        return 'Unknown status';
    }
  };

  return (
    <button
      onClick={() => manualSync()}
      disabled={state.status === 'syncing'}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      title={getTooltip()}
    >
      {getIcon()}
      {state.pendingChanges > 0 && (
        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
          {state.pendingChanges}
        </span>
      )}
    </button>
  );
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
```

### 2. Sync Settings Panel

```typescript
// src/components/sync/SyncSettings.tsx

'use client';

import { useState } from 'react';
import { useSync } from '@/lib/hooks/useSync';
import { Cloud, HardDrive, RefreshCw } from 'lucide-react';

export function SyncSettings() {
  const { state, enableSync, disableSync, manualSync, isEnabled } = useSync();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSync = async () => {
    setIsLoading(true);
    try {
      if (isEnabled) {
        disableSync();
      } else {
        await enableSync();
      }
    } catch (error) {
      console.error('Failed to toggle sync:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      await manualSync();
    } catch (error) {
      console.error('Sync failed:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cloud size={24} />
          <div>
            <h3 className="font-semibold">Cloud Sync</h3>
            <p className="text-sm text-gray-600">
              Backup and sync your data across devices
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleSync}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEnabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {isEnabled && state && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Storage Used</div>
              <div className="text-2xl font-bold">
                {Math.round(state.uploadedBytes / 1024 / 1024)} MB
              </div>
              <div className="text-sm text-gray-500">of 100 MB</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Pending Changes</div>
              <div className="text-2xl font-bold">{state.pendingChanges}</div>
              <div className="text-sm text-gray-500">
                {state.lastSyncAt
                  ? `Synced ${formatRelativeTime(state.lastSyncAt)}`
                  : 'Not synced yet'}
              </div>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isLoading || state.status === 'syncing'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={20} className={state.status === 'syncing' ? 'animate-spin' : ''} />
            {state.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>

          {state.lastError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800">Sync Error</div>
              <div className="text-sm text-red-600">{state.lastError}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
```

---

## Implementation Phases

### Phase 1: Setup (Week 1)
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Configure RLS policies
- [ ] Install dependencies
- [ ] Add environment variables

### Phase 2: Change Tracking (Week 1-2)
- [ ] Add syncQueue table to local IndexedDB
- [ ] Implement ChangeTracker class
- [ ] Hook into repository layer to track changes
- [ ] Test change tracking with CRUD operations

### Phase 3: Sync Engine (Week 2-3)
- [ ] Implement SyncEngine class
- [ ] Build pull logic (download remote changes)
- [ ] Build push logic (upload local changes)
- [ ] Implement conflict resolution
- [ ] Add rate limiting
- [ ] Add error handling and retries

### Phase 4: UI Integration (Week 3)
- [ ] Create useSync hook
- [ ] Build SyncStatusIndicator component
- [ ] Build SyncSettings panel
- [ ] Add to app header/settings page
- [ ] Test user flows

### Phase 5: Photo Sync (Week 4)
- [ ] Upload encrypted photos to Supabase Storage
- [ ] Download photos on-demand
- [ ] Track photo storage usage
- [ ] Optimize with thumbnails

### Phase 6: Testing & Polish (Week 4-5)
- [ ] Test multi-device scenarios
- [ ] Test offline sync
- [ ] Test conflict resolution
- [ ] Performance optimization
- [ ] Error handling improvements

---

## Next Steps

1. **Set up Supabase project** - Create account, initialize project
2. **Run database migrations** - Execute schema SQL
3. **Add environment variables** - `.env.local`
4. **Install dependencies** - `npm install @supabase/supabase-js`
5. **Implement change tracking** - Hook into repositories

Would you like to start with setting up Supabase, or dive into the implementation of a specific component?
