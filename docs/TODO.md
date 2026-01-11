# DIDTron - TODO List

## Current Plan ID: PLAN-2026-01-11-01

### Completed Tasks

- [x] **T1**: Create database schema for interconnect settings tables (IP addresses, codecs, validation, translation, media, signalling)
  - Acceptance: All 6 tables exist in schema.ts with correct fields and constraints

- [x] **T2**: Create API endpoints for interconnect settings CRUD
  - Acceptance: GET/PUT endpoints for each settings type, proper error handling

- [x] **T3**: Wire frontend Interconnect Detail tabs to backend APIs
  - Acceptance: All 5 Customer Interconnect tabs (Services, Validation, Translation, Media, Signalling) fetch and save data

- [x] **T4**: Fix codec persistence (include relayOnly, coordinated error handling)
  - Acceptance: Codec toggles round-trip correctly, combined save shows single toast

### Pending Tasks

- [ ] **T5**: Build Carrier Detail Page with exact 5 tabs + 3-column layout for Tab 1
  - Files: `client/src/pages/admin/carrier-detail.tsx`
  - Acceptance: Matches Digitalk screenshots exactly, all tabs functional

- [ ] **T6**: Build Supplier Interconnect Detail with 6 tabs
  - Files: `client/src/pages/admin/interconnect-detail.tsx`
  - Acceptance: Different tab structure for egress direction, Monitoring tab added

- [ ] **T7**: Build Main Carriers page View dropdown (Carriers/Interconnects/Services)
  - Files: `client/src/pages/admin/softswitch.tsx`
  - Acceptance: View dropdown switches between list views

- [ ] **T8**: Build Balance & Spend views
  - Files: New pages under softswitch module
  - Acceptance: 24 Hour Spend, Carrier Balances, Balance And Totals views

- [ ] **T9**: Complete Carrier Contacts management
  - Files: `client/src/pages/admin/carrier-detail.tsx`
  - Acceptance: Add/Edit/Delete contacts with all Digitalk fields

- [ ] **T10**: Complete Credit Alerts management
  - Files: `client/src/pages/admin/carrier-detail.tsx`
  - Acceptance: Add/Edit/Delete alerts with threshold configuration

---

## Phase 3: Infrastructure Hardening

### Plan ID: PLAN-2026-01-11-03

**Objective**: Migrate from dev-only shortcuts to production-safe infrastructure per AGENT_BRIEF Sections 8-12.

### Completed Tasks

- [x] **T17**: Replace MemoryStore with Upstash Redis for sessions
  - Files: `server/index.ts`, `server/services/redis-session.ts`
  - Acceptance: Sessions stored in Upstash Redis when configured, secure cookie settings, TTL, fallback to MemoryStore if not configured
  - Status: ✅ Complete - logs show "Using Upstash Redis for session storage"

- [x] **T18**: Add distributed locks for scheduled sync tasks
  - Files: `server/index.ts`, `server/services/redis-session.ts`
  - Acceptance: Balance sync uses Redis locks; duplicate runs prevented when scaling
  - Status: ✅ Complete - acquireDistributedLock/releaseDistributedLock implemented

- [x] **T19**: Create validated config module with zod
  - Files: `server/config.ts`
  - Acceptance: Required env vars validated; fail-fast in production, warn in dev
  - Status: ✅ Complete - zod schema validates DATABASE_URL, SESSION_SECRET, etc.

- [x] **T21**: Create Playwright test infrastructure
  - Files: `tests/` directory, `playwright.config.ts`
  - Acceptance: Playwright configured, @axe-core/playwright integrated
  - Status: ✅ Complete - test infrastructure ready

- [x] **T22**: Add Playwright tests for existing pages
  - Files: `tests/login.spec.ts`, `tests/carriers.spec.ts`
  - Acceptance: Tests for login, dashboard, carriers list, rate plans list with Axe accessibility scans
  - Status: ✅ Complete - basic test suite created

- [x] **T23**: Wire Cloudflare R2 for file uploads
  - Files: `server/services/r2-storage.ts`
  - Acceptance: R2 service with upload/download/list/signed-url functions
  - Status: ✅ Complete - service initializes on startup when credentials configured

### Pending Tasks

- [ ] **T20**: Implement incremental CDR sync with high-water mark
  - Files: `server/services/connexcs-sync.ts`
  - Acceptance: CDR sync uses `last_synced_at` column; only fetches new records; no memory crash; batched in chunks of 500-1000
  - Status: Pending - requires careful implementation to avoid heap overflow

---

## Next Actions
1. Review current Interconnect Detail implementation against Digitalk screenshots
2. Continue with T5 (Carrier Detail Page) when approved
3. Begin T17-T23 infrastructure hardening when feature work allows
