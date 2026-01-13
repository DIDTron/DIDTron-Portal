# DIDTron - Decisions Log

## 2026-01-11: Adopted Repository Documentation Workflow

**Decision**: Implemented structured documentation-driven development workflow mid-project.

**Reason**: Ensure consistency across sessions, prevent drift, maintain project memory.

**Files Created**:
- `docs/AGENT_BRIEF.md` - Production requirements, UX rules, constraints
- `docs/UI_SPEC.md` - Complete UI map, pages, components, patterns
- `docs/DB_SCHEMA.md` - Entities, relations, constraints, enums
- `docs/TODO.md` - Authorized task list with Plan ID
- `docs/DECISIONS.md` - Append-only change log (this file)
- `docs/REFERENCES.md` - Links/files/screenshots references

**Current State Summary**:
- Super Admin portal with 60+ pages/routes implemented
- Class 4 Softswitch module in active development
- Digitalk Carrier Cloud Manager UI replication in progress
- Customer Interconnect Detail: All 5 tabs functional with backend persistence
- Carrier Detail: Basic structure exists, needs Digitalk-matching 5-tab layout

---

## 2026-01-11: Interconnect Settings Persistence Architecture

**Decision**: Use upsert pattern with unique interconnect_id constraint for settings tables.

**Reason**: One settings record per interconnect (validation, translation, media, signalling). Codecs allow multiple records per interconnect.

**Tables**:
- `interconnect_validation_settings` - unique(interconnect_id)
- `interconnect_translation_settings` - unique(interconnect_id)
- `interconnect_media_settings` - unique(interconnect_id)
- `interconnect_signalling_settings` - unique(interconnect_id)
- `interconnect_codecs` - multiple per interconnect (no unique constraint)
- `interconnect_ip_addresses` - multiple per interconnect

---

## 2026-01-11: Combined Save Pattern for Media Tab

**Decision**: Codec and Media mutations use Promise.all with centralized success/error handling.

**Reason**: Prevent partial success states where one mutation succeeds but another fails, causing inconsistent UI (toast shown but edit mode exited).

**Pattern**:
```typescript
try {
  await Promise.all([
    saveCodecsMutation.mutateAsync(codecs),
    saveMediaMutation.mutateAsync(mediaData),
  ]);
  // Only here: invalidate queries, show toast, exit edit mode
} catch {
  toast({ title: "Failed to save", variant: "destructive" });
  // Stay in edit mode for retry
}
```

---

## 2026-01-11: Codec Hydration Must Include relayOnly

**Decision**: When hydrating codecs from backend, include relayOnly field in merge with defaults.

**Reason**: Without relayOnly, the field resets to default on each page load, losing user's configuration.

**Fix Location**: `interconnect-detail.tsx` useEffect for codecsData

---

## 2026-01-11: Interconnect Tabs Overflow Fix for Bilateral

**Decision**: Add horizontal scroll to TabsList container for interconnect detail page.

**Reason**: Bilateral interconnects have 9 tabs (Details, Services, Ingress Validation, Ingress Translation, Egress Routing, Egress Translations, Media, Monitoring, Signalling) which were being cut off due to container overflow.

**Fix**: Added `overflow-x-auto` to container div and `w-max` to TabsList to enable horizontal scrolling.

**Tab Structure Per Direction** (matching Digitalk exactly):
- **Customer (Ingress)**: Details, Services, Ingress Validation, Ingress Translation, Media, Signalling (6 tabs)
- **Supplier (Egress)**: Details, Egress Routing, Egress Translations, Media, Monitoring, Signalling (6 tabs)
- **Bilateral**: All 9 tabs combined

---

## 2026-01-11: Monitoring Tab Full Implementation

**Decision**: Build Monitoring tab UI matching Digitalk exactly with two cards and persistence.

**Components**:
1. **Supplier Availability Monitoring** card with:
   - Monitoring Enabled dropdown: None, SIP OPTIONS, Call Response, SIP OPTIONS & Call Response
   - Info icon tooltip
2. **Monitoring Alarm** card with:
   - Alarm Severity: Low, Medium, High
   - Send Email on: Breach Only, Breach And Clear
   - Recipients: comma-separated email input

**Backend**:
- New table: `interconnect_monitoring_settings` with columns: monitoringEnabled, alarmSeverity, sendEmailOn, recipients
- API endpoints: GET/PUT `/api/interconnects/:id/monitoring-settings`
- Upsert pattern matching other interconnect settings tables

---

## 2026-01-11: Ingress Options Card Added to Ingress Validation Tab

**Decision**: Add "Ingress Options" card to Ingress Validation tab, matching Digitalk's UI exactly.

**UI Changes**:
1. **Removed from Call Validation card**: Max CPS and Test System Control fields
2. **New Ingress Options card** (full-width below 2-column grid) with:
   - Address Type dropdown: Via Address, Transport address
   - Max Calls Per Second: input with "Unlimited" checkbox
   - Test System Control dropdown: Allow, Don't Allow

**Schema Changes**:
- Added `address_type` column to `interconnect_validation_settings` table (default: "transport")

**Persistence**: Both cards share the same validation settings record - single Edit/Save button saves all fields together

---

## 2026-01-11: Design Documentation Consolidation

**Decision**: Merged `design_guidelines.md` into `DESIGN_SYSTEM.md` as the single canonical design source.

**Reason**: Prevent duplication and drift between two design documentation files. DESIGN_SYSTEM.md was more comprehensive and already declared as "Single Source of Truth".

**What was merged**:
- Design Principles (section 11)
- Marketing Website Structure (section 12)
- Dashboard-Specific Elements (section 13)
- Responsive Behavior (section 14)
- Animation Guidelines (section 15)

**Actions taken**:
1. Added sections 11-15 to DESIGN_SYSTEM.md
2. Updated Table of Contents
3. Updated changelog to version 1.1.0
4. Replaced design_guidelines.md with DEPRECATED stub (not deleted, to prevent accidental recreation)

**Canonical source**: `DESIGN_SYSTEM.md` is the ONLY design documentation file going forward

---

## 2026-01-11: Digitalk Layout Patterns Documented in UI_SPEC.md

**Decision**: Added comprehensive "Digitalk Layout Patterns" section to `docs/UI_SPEC.md`.

**Reason**: Establish a reusable reference pattern for all hierarchical entity management modules. This ensures consistency when building future modules (Rating, Routing, DIDs, etc.) that follow the same Digitalk navigation flow.

**What was documented**:
1. Three-Level Navigation Flow (List → Detail → Sub-Detail)
2. URL Structure Pattern with hierarchical paths
3. Page Header Pattern (Back, Breadcrumb, Actions, Tabs)
4. Tab Behavior by Entity Direction (Customer/Supplier/Bilateral)
5. Card Layout Patterns (multi-column, full-width, embedded tables)
6. Edit/Save Interaction Pattern
7. Dropdown-Dependent Settings Pattern
8. List-to-Detail Navigation Pattern
9. Complete Flow Example from Carriers section
10. Modules that must use this pattern

**Location**: `docs/UI_SPEC.md` → Section "Digitalk Layout Patterns"

---

## 2026-01-11: Adopted FOREVER POLICY as Project Constitution

**Decision**: Adopted comprehensive "FOREVER POLICY — PRODUCTION PROJECT GOVERNANCE (NO DRIFT)" document as the project's governing constitution.

**Reason**: Establish permanent, non-negotiable rules for drift prevention, infrastructure hardening, testing requirements, time/timestamping, and big data handling.

**Changes to AGENT_BRIEF.md**:
- Added Section 8: Approved Infra Providers (Cloudflare R2, Upstash Redis, Brevo, Stripe, ConnexCS, OpenExchangeRates, OpenAI)
- Added Section 9: Infra Hardening (Redis sessions, distributed locks, config validation, audit logging)
- Added Section 10: Production Quality + Testing Gate (Playwright + Axe required)
- Added Section 11: Time & Timestamping Gold Rule (UTC canonical, timestamps mandatory)
- Added Section 12: Big Data + Job Processing Gold Rule (DataQueue, pagination, no RAM loading)
- Added Section 13: Emergency Stop Command

**Changes to TODO.md**:
- Added Phase 3: Infrastructure Hardening (Plan ID: PLAN-2026-01-11-03)
- T17: Replace MemoryStore with Upstash Redis
- T18: Add distributed locks for scheduled tasks
- T19: Create validated config module
- T20: Implement incremental CDR sync with high-water mark
- T21: Create Playwright test infrastructure
- T22: Add Playwright tests for existing pages
- T23: Wire Cloudflare R2 for file uploads

**Current Integration Status**:
| Integration | Configured | Actually Used |
|-------------|------------|---------------|
| ConnexCS | ✅ | ✅ Active |
| Brevo | ✅ | ⚠️ Mock mode |
| DataQueue | ✅ | ✅ Active |
| Playwright | ✅ Installed | ❌ No tests |
| @axe-core/playwright | ✅ Installed | ❌ No tests |
| Upstash Redis | ✅ Configured | ❌ Not wired |
| Cloudflare R2 | ✅ Configured | ❌ Not wired |
| Session Store | ⚠️ MemoryStore | ❌ Must migrate |

**Source Document**: `attached_assets/FOREVER_POLICY_—_PRODUCTION_PROJECT_1768150986435.txt`

---

## 2026-01-11: Short URL Codes for Softswitch Module

**Decision**: Implement human-readable short codes for URL routing in the Softswitch module instead of exposing UUIDs in URLs.

**Reason**: Digitalk Carrier Cloud Manager uses readable identifiers in URLs. Short codes improve UX (e.g., `/admin/carriers/ACME-TEST` instead of `/admin/carriers/f8f8b7ad-950b-...`).

**Implementation**:
- Carriers: Use existing `code` field (user-defined, e.g., "ACME-TEST")
- Interconnects: Auto-generated `shortCode` with "I" prefix (I1, I2, I3...)
- Services: Auto-generated `shortCode` with "S" prefix (S1, S2, S3...)
- Rating Plans: Auto-generated `shortCode` with "P" prefix (P1, P2, P3...)

**API Pattern**: Routes accept both UUID and short code. Resolve methods check UUID pattern first (`/^[0-9a-f]{8}-.../`), then lookup by code/shortCode.

**Frontend Pattern**: Use `shortCode || id` fallback for backward compatibility with existing records that have null shortCodes.

**Files Changed**:
- `shared/schema.ts` - Added shortCode columns
- `server/storage.ts` - Added resolve methods, getByShortCode, auto-generation
- `server/routes.ts` - Updated to use resolve methods
- `server/utils/short-codes.ts` - Utility for generating/validating short codes
- Frontend pages - Updated links to use shortCode fallback

**Scope**: Softswitch module only (not global)

---

## 2026-01-12: PostgreSQL Migration Stage 1 (FOREVER POLICY)

**Decision**: Migrated Customer Categories, Customer Groups, Users, and Carrier Assignments from in-memory Maps to PostgreSQL as the canonical source of truth.

**Reason**: Per FOREVER POLICY Section 15 (Canonical Storage Rule), all persistent business entities MUST use PostgreSQL. In-memory Maps cause data loss on server restart.

**Changes Made**:
1. **AGENT_BRIEF.md**: Added Section 15 (Canonical Storage Rule) as Gold MUST Rule
2. **storage.ts**: Updated CRUD methods for customerCategories, customerGroups, users, carrierAssignments to use Drizzle ORM
3. **storage.ts**: Added `seedReferenceDataToPostgres()` method to seed categories/groups on startup
4. **index.ts**: Added call to seedReferenceDataToPostgres() in startup sequence
5. **TODO.md**: Created Phase 4 staged migration plan with 10 stages

**Pattern Established**:
- Seed data via PostgreSQL INSERT if table is empty (checked on startup)
- Use Drizzle ORM for all CRUD operations (no Maps as source of truth)
- Upsert methods explicitly check for undefined fields before updating

**Pre-existing TypeScript Errors**:
Note: npm run check shows pre-existing TypeScript errors unrelated to this migration. These are tracked separately and do not block Stage 1 acceptance since tables exist and data persists.

**Files Changed**:
- `docs/AGENT_BRIEF.md` - Added Section 15
- `docs/TODO.md` - Added Phase 4 migration plan
- `docs/DB_SCHEMA.md` - Added table definitions
- `server/storage.ts` - PostgreSQL CRUD for 4 entities
- `server/index.ts` - Added seed call

---

## 2026-01-13: System Status as Performance + Stability Enforcement Engine

**Decision**: Implemented comprehensive System Status monitoring system as the single pane of glass for platform health, performance, and alerting.

**Reason**: Need centralized visibility into "Is the platform up?", "Is it fast?", "What is slowing it down?", "What broke, when, and what changed?" across all portals (Super Admin, Customer, Marketing) and all components (API, DB, Redis, R2, DataQueue, integrations).

**Key Design Choices**:

1. **DataQueue-Based Collection**: Metrics Collector and Alert Evaluator run as DataQueue jobs every 60 seconds. Never blocks user traffic - all heavy work happens in background jobs.

2. **11-Tab Structure**: Overview, Performance Budgets, Health Checks, API & Errors, Database, DataQueue Jobs, Cache & Storage, Integrations, Portals, Alerts, Audit/Changes.

3. **Auto-Refresh**: UI refreshes every 30 seconds with Live toggle. Pauses when tab not visible. Stale data banners at 2m (yellow) and 5m (red).

4. **SLO Budgets Defined**: Exact thresholds for API (p95 ≤ 120ms list, ≤ 180ms detail), DB (p95 ≤ 60ms), Redis (≤ 30ms), DataQueue (stuck job 3m warning, 10m critical).

5. **Alerting**: Three severity levels (Critical/Warning/Info). Critical triggers email + in-app. Alerts stored in PostgreSQL with acknowledge/snooze actions.

6. **Future-Proofing**: Module Registry ensures new modules auto-register for monitoring. Standard instrumentation wrappers are mandatory for all routes/jobs/integrations.

7. **Sidebar Widget**: System Status widget shows alert count badge (red with number if alerts, green if healthy).

**Docs Updated**:
- `docs/UI_SPEC.md` - Full System Status page spec (11 tabs, layout, auto-refresh, all budgets)
- `docs/AGENT_BRIEF.md` - Sections 20 (Performance Budgets SLO) + 21 (Monitoring & Alerting Governance)
- `docs/DB_SCHEMA.md` - 7 monitoring tables (metrics_snapshots, system_alerts, integration_health, job_metrics, portal_metrics, audit_records, module_registry)
- `docs/TODO.md` - Plan ID PLAN-2026-01-13-SYSTEMSTATUS with all implementation tasks

---

## 2026-01-13: Verified System Status Collector + Evaluator Already Wired

**Decision**: Confirmed T150 (pre-load metrics) and T151 (alert evaluator) are already implemented and operational.

**Evidence**:
- `server/index.ts` lines 1165-1201: Both `startMetricsScheduler()` and alert evaluator scheduling are wired on server boot
- `server/services/metrics-collector.ts` lines 576-604: Initial collection runs with 1s delay, then every 60s
- `server/services/alert-evaluator.ts`: Full implementation with budget evaluation and DB persistence
- **DB Proof**: `metrics_snapshots` has 11,993 rows; `system_alerts` has 28 rows (verified via SQL query)

**Action**: Marked T150 and T151 as COMPLETE in docs/TODO.md with file paths and DB evidence.

---

## 2026-01-13: System Status UTC Timestamps and Auto-Refresh (T145)

**Decision**: Updated System Status page to display all timestamps in UTC format and added per-card "as of" relative timestamps.

**Changes Made**:
1. `formatTimestamp()` - Now returns "HH:MM:SS UTC" instead of local time
2. `formatDateTimestamp()` - Now returns "Mon DD, HH:MM:SS UTC" format
3. Added `formatAsOf()` helper - Returns "as of Xs ago" or "as of Xm ago" for card headers
4. Updated Active Alerts and Top Slow Endpoints cards to show "as of" timestamps

**Why UTC**: Platform serves global users; UTC is the standard for monitoring/ops tools. Avoids timezone confusion when debugging issues.

**Auto-refresh behavior** (already implemented, verified working):
- Live toggle default ON (`useState(true)`)
- Auto-refresh every 30 seconds (`refetchInterval: isLive ? 30000 : false`)
- Pauses when browser tab is hidden (visibility change listener)

**Files Changed**: `client/src/pages/admin/system-status.tsx`
