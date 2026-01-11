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

### Pending Tasks

- [ ] **T17**: Replace MemoryStore with Upstash Redis for sessions
  - Files: `server/index.ts`, new `server/services/redis-session.ts`
  - Acceptance: Sessions stored in Upstash Redis, secure cookie settings, TTL configured, MemoryStore removed
  - Blocked by: Upstash Redis credentials configured in `/admin/settings/integrations`

- [ ] **T18**: Add distributed locks for scheduled sync tasks
  - Files: `server/index.ts`, new `server/services/redis-lock.ts`
  - Acceptance: ConnexCS sync, currency sync, balance sync use Redis locks; duplicate runs prevented when scaling

- [ ] **T19**: Create validated config module with zod
  - Files: new `server/config.ts`
  - Acceptance: All required env vars validated at startup; app fails fast if missing; no silent mock mode fallback

- [ ] **T20**: Implement incremental CDR sync with high-water mark
  - Files: `server/services/connexcs-sync.ts`
  - Acceptance: CDR sync uses `last_synced_at` column; only fetches new records; no memory crash; batched in chunks of 500-1000

- [ ] **T21**: Create Playwright test infrastructure
  - Files: new `tests/` directory, `playwright.config.ts`
  - Acceptance: Playwright configured, first test passes, @axe-core/playwright integrated

- [ ] **T22**: Add Playwright tests for existing pages
  - Files: `tests/*.spec.ts`
  - Acceptance: Tests for login, dashboard, carriers list, rate plans list; all pass with Axe accessibility scan

- [ ] **T23**: Wire Cloudflare R2 for file uploads
  - Files: new `server/services/r2-storage.ts`, API routes
  - Acceptance: File upload endpoint stores to R2, download endpoint retrieves from R2
  - Blocked by: R2 credentials configured in `/admin/settings/integrations`

---

## Next Actions
1. Review current Interconnect Detail implementation against Digitalk screenshots
2. Continue with T5 (Carrier Detail Page) when approved
3. Begin T17-T23 infrastructure hardening when feature work allows
