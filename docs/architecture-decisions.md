# Architecture Decision Records

**Project:** symptom-tracker - Food Journal Feature
**Date:** 2025-10-16
**Author:** Steven

---

## Overview

This document captures all architectural decisions made during the Food Journal solution architecture process. Each decision includes the context, options considered, chosen solution, and rationale. These decisions form the technical foundation for implementing the 2 epics (15 stories) defined in the PRD.

---

## Decision Format

Each decision follows this structure:
- **Context:** The problem or choice requiring a decision
- **Options Considered:** Alternative approaches evaluated
- **Decision:** The chosen solution
- **Rationale:** Why this option was selected
- **Consequences:** Positive, negative, and neutral impacts
- **Rejected Options:** Why alternatives were not chosen

---

## Decisions

### ADR-001: Hybrid Data Architecture (Client + Server)

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

The Food Journal feature requires two conflicting capabilities:
1. **Instant food logging** - NFR001 requires <500ms response time for quick-log actions
2. **Complex correlation analysis** - NFR004 requires analyzing 72-hour time windows across 100,000+ events spanning 5+ years

A purely client-side approach would struggle with correlation performance, while a purely server-side approach would violate the 500ms response time requirement and lose offline capability.

**Options Considered:**

1. **Client-Only (Dexie/IndexedDB)**
   - Pros: Instant writes, offline-first, no server complexity
   - Cons: Browser correlation across 100K events would be slow (>10 seconds), limited statistical libraries

2. **Server-Only (Vercel Postgres)**
   - Pros: Powerful correlation processing, scalable, PostgreSQL statistical functions
   - Cons: Network latency violates 500ms requirement, no offline capability

3. **Hybrid (Client capture + Server processing)**
   - Pros: Instant logging (client), powerful correlation (server), offline-capable
   - Cons: Sync complexity, eventual consistency, dual data management

**Decision:**

We chose **Option 3: Hybrid Architecture**
- Client-side (Dexie/IndexedDB) for food event capture
- Server-side (Vercel Postgres) for correlation processing
- Background sync pattern with optimistic UI updates

**Rationale:**

- **NFR001 Compliance:** Client-side writes guarantee <500ms food logging
- **NFR004 Compliance:** Server-side Postgres handles 100K+ event correlations efficiently
- **Offline-First UX:** Users can log food without connectivity (critical for real-time capture)
- **Brownfield Alignment:** Existing codebase already uses Dexie for local data
- **Scalability:** Offload compute-heavy correlation to server, keeping client lightweight

**Consequences:**

- **Positive:**
  - Best-in-class UX (instant feedback) with powerful analytics
  - Offline capability preserved (critical for food logging)
  - Server can leverage advanced statistical libraries and PostgreSQL functions
  - Scales to 100K+ events without client performance degradation

- **Negative:**
  - Increased complexity: dual database management, sync logic
  - Eventual consistency: correlation results may lag behind latest data
  - More testing required: client-server sync scenarios

- **Neutral:**
  - Correlation results cached locally with 24-hour TTL (acceptable staleness for trend analysis)

**Rejected Options:**

- **Client-Only:** Rejected because correlation analysis of 72-hour windows across 100K events would cause browser hangs (violates NFR004)
- **Server-Only:** Rejected because network latency makes <500ms food logging impossible (violates NFR001), and offline capability is critical for in-the-moment food capture

---

### ADR-002: React Context over Redux/Zustand

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

The Food Journal requires global state management for:
- Food database (200+ items)
- Food events (user's logged consumption)
- Correlation results (for dashboard display)

The existing codebase uses React Context (e.g., `DashboardContext`) for state management. We need to decide whether to continue this pattern or introduce a dedicated state management library.

**Options Considered:**

1. **React Context + hooks (Existing Pattern)**
   - Pros: No new dependencies, consistent with codebase, simple learning curve
   - Cons: Can cause unnecessary re-renders if not optimized, less tooling support

2. **Redux Toolkit**
   - Pros: Powerful DevTools, time-travel debugging, middleware ecosystem
   - Cons: Steep learning curve, over-engineered for food journal scope, increases bundle size

3. **Zustand**
   - Pros: Lightweight (1KB), simple API, good performance
   - Cons: New dependency, introduces pattern inconsistency with existing Context usage

**Decision:**

We chose **Option 1: Extend existing React Context pattern**
- Create `FoodContext` following `DashboardContext` structure
- Use Context + hooks for food data and correlations
- Apply memoization (`useMemo`, `useCallback`) to avoid re-render issues

**Rationale:**

- **Brownfield Consistency:** Existing codebase successfully uses Context (no reported performance issues)
- **Scope Alignment:** Food Journal state is isolated and not overly complex
- **No New Dependencies:** Reduces bundle size and maintenance burden
- **Team Familiarity:** User already comfortable with Context pattern
- **Performance Sufficient:** Food state updates are infrequent (logging events, fetching correlations)

**Consequences:**

- **Positive:**
  - Zero new dependencies, minimal bundle impact
  - Consistent pattern across codebase (DashboardContext, FoodContext)
  - Simple onboarding for new developers
  - Memoization gives performance when needed

- **Negative:**
  - No DevTools for time-travel debugging
  - Manual optimization required (memoization) to prevent re-renders
  - If state grows complex, may need future refactor to Zustand

- **Neutral:**
  - Can migrate to Zustand later if complexity increases (low refactor effort)

**Rejected Options:**

- **Redux Toolkit:** Rejected due to over-engineering (food journal state is simple), learning curve, and bundle size increase
- **Zustand:** Rejected to maintain brownfield consistency; can revisit if Context performance degrades

---

### ADR-003: Vercel Postgres over Supabase

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

The hybrid architecture requires a server-side PostgreSQL database for correlation processing. User initially suggested Supabase, but codebase analysis revealed:
- No existing Supabase dependencies in `package.json`
- Already deploying to Vercel
- No need for Supabase Auth (using localStorage userId)
- No need for Supabase Storage (using local encrypted photos)

We need to choose a PostgreSQL hosting solution for the server-side correlation engine.

**Options Considered:**

1. **Supabase (Postgres + Auth + Storage + Realtime)**
   - Pros: All-in-one platform, generous free tier, excellent DX
   - Cons: Over-featured for our needs (only need Postgres), introduces new platform dependency, requires new SDK

2. **Vercel Postgres (Managed PostgreSQL on Vercel)**
   - Pros: Seamless Vercel integration, serverless connection pooling, single platform billing, optimal for Next.js
   - Cons: Locked into Vercel ecosystem, newer product (less mature than Supabase)

3. **AWS RDS PostgreSQL**
   - Pros: Battle-tested, full control, industry standard
   - Cons: Complex setup, manual connection pooling, separate billing, over-provisioning for serverless workload

**Decision:**

We chose **Option 2: Vercel Postgres**
- Managed PostgreSQL with serverless connection pooling
- Direct integration with Vercel deployment pipeline
- Use Prisma ORM for type-safe queries

**Rationale:**

- **Optimal Integration:** Already deploying to Vercel, single-platform simplicity
- **Serverless Pooling:** Auto-scaling connection pool (no manual management)
- **Right-Sized:** Only need Postgres (not auth/storage/realtime), avoid over-provisioning
- **Simpler Billing:** Single invoice (Vercel hosting + Postgres)
- **Performance:** Vercel edge network optimization for API routes → Postgres
- **Migration Path:** Can migrate to Supabase later if multi-device sync requires realtime features

**Consequences:**

- **Positive:**
  - Seamless deployment (Vercel environment variables auto-configured)
  - Serverless pooling handles connection scaling automatically
  - Single platform for troubleshooting and monitoring
  - Optimized latency for Next.js API routes

- **Negative:**
  - Vendor lock-in to Vercel ecosystem
  - Newer product (less community resources than Supabase/AWS RDS)
  - If requirements change (multi-device sync, realtime), may need Supabase migration

- **Neutral:**
  - Prisma ORM abstracts database layer (migration to Supabase Postgres is low-effort)

**Rejected Options:**

- **Supabase:** Rejected because only Postgres is needed (auth/storage already handled locally), introducing Supabase SDK adds complexity without benefit
- **AWS RDS:** Rejected due to operational complexity (connection pooling, manual scaling) for a serverless Next.js application

---

### ADR-004: Prisma ORM for Database Access

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

With Vercel Postgres chosen for server-side correlation processing, we need an ORM/query builder for type-safe database access. The codebase uses TypeScript with strict mode enabled.

**Options Considered:**

1. **Prisma**
   - Pros: Type-safe schema → TypeScript types, excellent migration tooling, industry standard for Next.js
   - Cons: Schema-first (requires Prisma schema language), larger runtime than raw SQL

2. **Drizzle ORM**
   - Pros: Lightweight, SQL-like syntax, zero runtime overhead
   - Cons: Newer ecosystem, less mature migration tooling, smaller community

3. **Raw SQL (node-postgres)**
   - Pros: Maximum control, zero abstraction overhead
   - Cons: No type safety, manual migration management, SQL injection risk if not careful

**Decision:**

We chose **Option 1: Prisma**
- Prisma schema defines database structure
- Auto-generated TypeScript types for type-safe queries
- Prisma Migrate for schema migrations

**Rationale:**

- **Type Safety:** Schema generates TypeScript types (aligns with strict TypeScript codebase)
- **Migration Tooling:** `prisma migrate` handles schema evolution with version control
- **Developer Experience:** Excellent IDE autocomplete, query validation at compile-time
- **Next.js Ecosystem:** Industry standard for TypeScript + PostgreSQL + Next.js
- **Security:** Parameterized queries prevent SQL injection by default
- **Team Familiarity:** User is expert-level, Prisma is widely adopted

**Consequences:**

- **Positive:**
  - Type-safe queries prevent runtime errors
  - Migration files version-controlled (repeatable deployments)
  - Schema acts as single source of truth for database structure
  - Excellent error messages and debugging experience
  - Security by default (parameterized queries)

- **Negative:**
  - Schema-first development (must define Prisma schema before coding)
  - Slightly larger bundle size than raw SQL (acceptable for server-side only)
  - Learning curve for Prisma schema language (minimal for expert user)

- **Neutral:**
  - Migration files stored in `prisma/migrations/` (requires Git tracking)

**Rejected Options:**

- **Drizzle ORM:** Rejected due to less mature migration tooling and smaller ecosystem (Prisma is proven for Next.js + Postgres)
- **Raw SQL:** Rejected due to lack of type safety (high risk of runtime errors, SQL injection vulnerabilities)

---

### ADR-005: In-Memory Cache over Redis (Initially)

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

Correlation results need caching to avoid recalculating on every dashboard load. Options range from no caching (slow) to distributed Redis cache (complex).

**Options Considered:**

1. **No Caching**
   - Pros: Simple, always fresh data
   - Cons: Slow dashboard loads (correlation recalculation takes 2-5 seconds for 100K events)

2. **In-Memory Cache (per serverless function instance)**
   - Pros: Zero external dependencies, fast reads (ms), simple implementation
   - Cons: Cache duplication across function instances, lost on cold starts

3. **Vercel KV (Redis)**
   - Pros: Distributed cache (shared across instances), persistent across cold starts
   - Cons: Additional cost, network latency (20-50ms), operational complexity

**Decision:**

We chose **Option 2: In-Memory Cache (initially)**
- Cache correlation results in-memory with 15-minute TTL
- Client-side correlation cache (IndexedDB) with 24-hour TTL
- Add Vercel KV later if performance degrades

**Rationale:**

- **MVP Simplicity:** Start simple, add complexity only when proven necessary
- **Acceptable Trade-off:** 15-minute TTL means correlations are reasonably fresh (trend analysis doesn't need real-time precision)
- **Cost Optimization:** Avoid Redis cost until proven needed
- **Cold Start Impact:** Serverless cold starts trigger fresh correlation calculation (1-2 times per hour), which is acceptable
- **Client-Side Fallback:** Client cache (24hr TTL) provides fast reads for repeat dashboard visits

**Consequences:**

- **Positive:**
  - Zero external dependencies, no Redis cost
  - Simple implementation (JavaScript Map with TTL)
  - Can add Vercel KV easily if needed (no architecture change)
  - Client-side cache reduces API calls

- **Negative:**
  - Cache duplication across serverless function instances
  - Cold starts lose cache (triggers recalculation)
  - Slightly higher API latency on cache misses

- **Neutral:**
  - Correlation staleness up to 15 minutes (acceptable for trend analysis, not real-time alerts)

**Rejected Options:**

- **No Caching:** Rejected because 2-5 second dashboard loads violate performance expectations
- **Vercel KV (Redis):** Rejected for MVP due to cost and complexity; revisit if cold start cache misses cause user-facing slowness

---

### ADR-006: Offline-First Food Logging Pattern

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

Food logging must work without internet connectivity (NFR001 + user journey requirement). Users need to capture food intake in the moment, regardless of network status.

**Options Considered:**

1. **Online-Only (Require internet for food logging)**
   - Pros: Simple, no sync logic
   - Cons: Breaks in-the-moment capture (users forget what they ate), violates offline-first principle

2. **Offline-First (Write to Dexie, sync to server in background)**
   - Pros: Always-available logging, no user-facing latency, aligns with brownfield pattern
   - Cons: Sync complexity, conflict resolution, eventual consistency

3. **Service Worker + Background Sync API**
   - Pros: Native browser sync, offline queue
   - Cons: Browser API limitations, not supported in all browsers, over-engineered for this use case

**Decision:**

We chose **Option 2: Offline-First with Background Sync**
- Food events written to Dexie immediately (instant UI feedback)
- Background sync to Vercel Postgres when online
- Optimistic UI updates (show food event in timeline instantly)
- Correlation results fetched from server when online, cached locally for offline viewing

**Rationale:**

- **UX Requirement:** In-the-moment food capture is critical (users forget quickly)
- **NFR001 Compliance:** Offline writes guarantee <500ms response time
- **Brownfield Alignment:** Existing codebase already uses offline-first pattern for symptom logging
- **Simplicity:** Standard fetch-with-retry pattern, no Service Worker complexity
- **Reliability:** Dexie transactions ensure data integrity

**Consequences:**

- **Positive:**
  - Food logging always available (no connectivity requirement)
  - Instant UI feedback (no waiting for server)
  - Users can review logged foods immediately (even offline)
  - Sync failures don't block user workflow

- **Negative:**
  - Sync logic required (retry on failure, handle conflicts)
  - Correlation results may be stale if user offline for extended period
  - Need conflict resolution strategy (last-write-wins)

- **Neutral:**
  - Eventual consistency acceptable for correlation analysis (not real-time)

**Rejected Options:**

- **Online-Only:** Rejected because in-the-moment capture is critical (network failures would lose data)
- **Service Worker Background Sync:** Rejected due to browser compatibility issues and over-engineering

---

### ADR-007: Background Correlation Processing with Vercel Cron

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

Correlation analysis across 72-hour time windows and 100K+ events is computationally expensive (2-5 seconds). Running this on every dashboard load would violate performance expectations.

**Options Considered:**

1. **On-Demand Calculation (API call on dashboard load)**
   - Pros: Always fresh results
   - Cons: Slow dashboard loads (2-5 second wait), violates UX expectations

2. **Incremental Updates (Recalculate only when new events added)**
   - Pros: Fast dashboard loads, minimal computation
   - Cons: Complex state tracking (which correlations need updating), potential for stale results

3. **Periodic Background Jobs (Vercel Cron every 4 hours)**
   - Pros: Predictable performance, simple implementation, fresh-enough results
   - Cons: Correlation results may lag up to 4 hours behind latest data

**Decision:**

We chose **Option 3: Periodic Background Jobs with Vercel Cron**
- Cron job runs every 4 hours: `0 */4 * * *`
- Job queries all events, recalculates correlations, stores in Postgres
- Dashboard loads pre-computed results (fast reads)
- Manual trigger available via API: `POST /api/correlation/analyze`

**Rationale:**

- **Performance:** Pre-computed results load in <200ms (meets dashboard expectations)
- **Simplicity:** Scheduled job easier to maintain than complex incremental logic
- **Acceptable Staleness:** 4-hour lag is fine for trend analysis (not real-time alerts)
- **Manual Override:** Users can trigger immediate analysis if needed
- **Cost-Effective:** Runs 6 times per day (low function execution cost)

**Consequences:**

- **Positive:**
  - Fast dashboard loads (<200ms for correlation display)
  - Predictable server load (scheduled, not user-driven spikes)
  - Simple to debug and monitor (single cron job)
  - Manual trigger provides escape hatch for users

- **Negative:**
  - Correlation results may be 0-4 hours stale
  - Cron job runs even if no new events (wasted computation)
  - Need monitoring to detect job failures

- **Neutral:**
  - 4-hour freshness acceptable for dietary trigger discovery (multi-day patterns)

**Rejected Options:**

- **On-Demand:** Rejected due to slow dashboard loads (violates UX expectations)
- **Incremental Updates:** Rejected due to implementation complexity and edge case handling (when to invalidate combinations, etc.)

---

### ADR-008: Statistical Correlation Methods (Chi-Square + Pearson)

**Date:** 2025-10-16
**Status:** Accepted
**Decider:** Collaborative

**Context:**

NFR003 requires statistical significance (p < 0.05) for correlation results. We need to choose statistical methods for:
1. Food-symptom correlation (categorical: did symptom occur after food?)
2. Dose-response analysis (quantitative: does portion size affect severity?)

**Options Considered:**

1. **Simple Percentage Correlation (Non-Statistical)**
   - Pros: Easy to implement, easy to explain to users
   - Cons: No statistical significance, high false-positive rate, violates NFR003

2. **Chi-Square Test (Categorical) + Pearson Correlation (Quantitative)**
   - Pros: Industry-standard methods, p-value calculation, balances rigor with simplicity
   - Cons: Requires sample size (minimum 3-5 occurrences), assumptions (independence)

3. **Advanced ML Models (Logistic Regression, Random Forest)**
   - Pros: Handles confounding variables, more sophisticated
   - Cons: Over-engineered for MVP, requires larger datasets, harder to explain to users

**Decision:**

We chose **Option 2: Chi-Square Test + Pearson Correlation**
- **Chi-Square Test** for categorical correlations (food → symptom occurrence)
- **Pearson Correlation** for dose-response analysis (portion size → symptom severity)
- Calculate p-values to determine statistical significance
- Display confidence levels: High (p < 0.05, 5+ occurrences, 70%+ consistency), Medium (3-4 occurrences, 50-69%), Low (insufficient data)

**Rationale:**

- **NFR003 Compliance:** Chi-Square provides p-values for significance testing
- **Interpretability:** Users understand "70% of the time, dairy causes migraines within 2-4 hours"
- **Right-Sized Complexity:** Not too simple (percentages) nor over-engineered (ML models)
- **Sample Size Friendly:** Works with 3-5 occurrences (achievable within 7-14 days of logging)
- **Standard Methods:** Well-documented, reliable statistical tests

**Consequences:**

- **Positive:**
  - Statistical rigor prevents false-positive triggers (NFR003)
  - Confidence levels help users trust insights
  - Industry-standard methods (easy to validate with medical professionals)
  - Explainable to users (no black-box ML)

- **Negative:**
  - Requires minimum sample size (3-5 occurrences) before showing correlations
  - Assumes independence (food events don't affect each other)
  - Doesn't handle confounding variables (e.g., stress + dairy both cause symptoms)

- **Neutral:**
  - Can add advanced models later if users request (data already collected)

**Rejected Options:**

- **Simple Percentages:** Rejected because high false-positive rate violates NFR003 (users would distrust results)
- **ML Models:** Rejected as over-engineered for MVP; revisit if users report confounding variable issues (e.g., "alcohol + dairy combo")

---

## Decision Index

| ID  | Title | Status | Date | Decider |
| --- | ----- | ------ | ---- | ------- |
| ADR-001 | Hybrid Data Architecture (Client + Server) | Accepted | 2025-10-16 | Collaborative |
| ADR-002 | React Context over Redux/Zustand | Accepted | 2025-10-16 | Collaborative |
| ADR-003 | Vercel Postgres over Supabase | Accepted | 2025-10-16 | Collaborative |
| ADR-004 | Prisma ORM for Database Access | Accepted | 2025-10-16 | Collaborative |
| ADR-005 | In-Memory Cache over Redis (Initially) | Accepted | 2025-10-16 | Collaborative |
| ADR-006 | Offline-First Food Logging Pattern | Accepted | 2025-10-16 | Collaborative |
| ADR-007 | Background Correlation Processing with Vercel Cron | Accepted | 2025-10-16 | Collaborative |
| ADR-008 | Statistical Correlation Methods (Chi-Square + Pearson) | Accepted | 2025-10-16 | Collaborative |

---

## Summary

These 8 architectural decisions form the technical foundation for the Food Journal feature:

**Core Infrastructure (ADR-001, 003, 004):**
- Hybrid architecture (client capture + server processing)
- Vercel Postgres for server-side data
- Prisma ORM for type-safe queries

**State Management & Caching (ADR-002, 005):**
- React Context for global state (consistent with existing codebase)
- In-memory cache with client-side fallback

**User Experience (ADR-006, 007):**
- Offline-first food logging for in-the-moment capture
- Background correlation jobs for fast dashboard loads

**Data Science (ADR-008):**
- Chi-Square + Pearson for statistical rigor (p-value < 0.05)

All decisions prioritize:
1. **NFR Compliance** (performance, data integrity, accuracy, scalability, accessibility)
2. **Brownfield Consistency** (extend existing patterns)
3. **MVP Simplicity** (avoid over-engineering, add complexity when proven necessary)

---

_This document was generated during the solution-architecture workflow and should be updated if architectural decisions change during implementation._
