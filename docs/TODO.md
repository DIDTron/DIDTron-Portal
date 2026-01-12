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

- [x] **T5**: Build Carrier Detail Page with exact 5 tabs + 3-column layout for Tab 1
  - Files: `client/src/pages/admin/carrier-detail.tsx`
  - Acceptance: Matches Digitalk screenshots exactly, all tabs functional
  - Status: ✅ Pre-verified: Already implemented - 5 tabs exist (Carrier Details, Interconnects, Contact Details, Accounting Details, Credit Alerts)

- [x] **T6**: Build Supplier Interconnect Detail with 6 tabs
  - Files: `client/src/pages/admin/interconnect-detail.tsx`
  - Acceptance: Different tab structure for egress direction, Monitoring tab added
  - Status: ✅ Pre-verified: Already implemented - `getTabsForDirection("supplier")` returns 6 tabs including Monitoring

- [x] **T7**: Build Main Carriers page View dropdown (Carriers/Interconnects/Services)
  - Files: `client/src/pages/admin/softswitch.tsx`
  - Acceptance: View dropdown switches between list views
  - Status: ✅ Pre-verified: Already implemented - `entityView` state with carriers/interconnects/services views

- [x] **T8**: Build Balance & Spend views
  - Files: `client/src/pages/admin/softswitch-balance.tsx`
  - Acceptance: 24 Hour Spend, Carrier Balances, Balance And Totals views
  - Status: ✅ Pre-verified: Already implemented - 3 exported functions: `CarrierBalancesPage`, `TwentyFourHourSpendPage`, `BalanceTotalsPage`

- [x] **T9**: Complete Carrier Contacts management
  - Files: `client/src/pages/admin/carrier-detail.tsx`
  - Acceptance: Add/Edit/Delete contacts with all Digitalk fields
  - Status: ✅ Pre-verified: Already implemented - Contact Details tab with dialog, form, and CRUD

- [x] **T10**: Complete Credit Alerts management
  - Files: `client/src/pages/admin/carrier-detail.tsx`
  - Acceptance: Add/Edit/Delete alerts with threshold configuration
  - Status: ✅ Pre-verified: Already implemented - Credit Alerts tab with dialog, form, and CRUD

### Pending Tasks

*(No pending tasks in Phase 1)*

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

- [x] **T20**: Implement incremental CDR sync with high-water mark
  - Files: `server/services/connexcs-sync.ts`, `shared/schema.ts`
  - Acceptance: CDR sync uses `last_synced_at` column; only fetches new records; no memory crash; batched in chunks of 500
  - Status: ✅ Complete - `syncCDRsIncremental()` function with:
    * `connexcsCdrSyncState` table for high-water mark tracking
    * Batched processing (500 records per batch, max 20 batches per run)
    * Resumable sync with offset tracking
    * Distributed lock to prevent concurrent runs

---

## Phase 4: PostgreSQL Migration (FOREVER POLICY)

### Plan ID: PLAN-2026-01-12-DBMIGRATION

**Objective**: Migrate all in-memory Map storage to PostgreSQL per AGENT_BRIEF Section 15 (Canonical Storage Rule). No big-bang; staged migration with test gates.

**Priority Order**: Business-critical entities first, then supporting entities.

---

### Stage 1: Core Reference Data (HIGH PRIORITY) ✅ COMPLETE

- [x] **T30**: Migrate Customer Categories to PostgreSQL
  - DOC TARGET: docs/DB_SCHEMA.md (add customer_categories table)
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: 
    * Table exists with id, name, code, description, displayOrder, isActive, createdAt, updatedAt ✓
    * All CRUD operations use Drizzle (no Maps) ✓
    * Seeding moved to PostgreSQL via seedReferenceDataToPostgres() ✓
  - Status: ✅ Complete - verified 4 categories in database

- [x] **T31**: Migrate Customer Groups to PostgreSQL
  - DOC TARGET: docs/DB_SCHEMA.md (add customer_groups table)
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance:
    * Table exists with categoryId FK, name, code, description, displayOrder, isActive, createdAt, updatedAt ✓
    * All CRUD operations use Drizzle (no Maps) ✓
    * Seeding moved to PostgreSQL via seedReferenceDataToPostgres() ✓
  - Status: ✅ Complete - verified 11 groups in database

- [x] **T32**: Migrate Users to PostgreSQL
  - DOC TARGET: docs/DB_SCHEMA.md (add users table)
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance:
    * Table exists with id, email, password, role, status, createdAt, updatedAt ✓
    * All CRUD operations use Drizzle (no Maps) ✓
  - Status: ✅ Complete - super admin persists in database

- [x] **T40**: Migrate Carrier Assignments to PostgreSQL (moved from Stage 3)
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: carrier_assignments table, Drizzle CRUD, no Maps ✓
  - Status: ✅ Complete - upsert properly handles undefined fields

---

### Stage 2: VoIP Infrastructure Entities

- [ ] **T33**: Migrate POPs to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: POPs table with all fields, Drizzle CRUD, no Maps

- [ ] **T34**: Migrate Voice Tiers to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: voice_tiers table, Drizzle CRUD, no Maps

- [ ] **T35**: Migrate Codecs to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: codecs table, Drizzle CRUD, no Maps

- [ ] **T36**: Migrate Channel Plans to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: channel_plans table, Drizzle CRUD, no Maps

---

### Stage 3: Carrier Sub-Entities

- [ ] **T37**: Migrate Carrier Interconnects to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: carrier_interconnects table (if not exists), Drizzle CRUD, no Maps

- [ ] **T38**: Migrate Carrier Contacts to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: carrier_contacts table, Drizzle CRUD, no Maps

- [ ] **T39**: Migrate Carrier Credit Alerts to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: carrier_credit_alerts table, Drizzle CRUD, no Maps

- [ ] **T40**: Migrate Carrier Assignments to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: carrier_assignments table, Drizzle CRUD, no Maps

---

### Stage 4: DID & PBX Entities

- [ ] **T41**: Migrate DIDs to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: dids table with all fields, Drizzle CRUD, no Maps

- [ ] **T42**: Migrate DID Countries to PostgreSQL
- [ ] **T43**: Migrate DID Providers to PostgreSQL
- [ ] **T44**: Migrate SIP Trunks to PostgreSQL
- [ ] **T45**: Migrate Extensions to PostgreSQL
- [ ] **T46**: Migrate IVRs to PostgreSQL
- [ ] **T47**: Migrate Ring Groups to PostgreSQL
- [ ] **T48**: Migrate Queues to PostgreSQL

---

### Stage 5: Billing & Financial Entities

- [ ] **T49**: Migrate Invoices to PostgreSQL
- [ ] **T50**: Migrate Payments to PostgreSQL
- [ ] **T51**: Migrate Promo Codes to PostgreSQL
- [ ] **T52**: Migrate Referrals to PostgreSQL
- [ ] **T53**: Migrate Billing Terms to PostgreSQL

---

### Stage 6: Support & Operations

- [ ] **T54**: Migrate Tickets to PostgreSQL
- [ ] **T55**: Migrate Ticket Replies to PostgreSQL
- [ ] **T56**: Migrate Audit Logs to PostgreSQL
- [ ] **T57**: Migrate Monitoring Rules to PostgreSQL
- [ ] **T58**: Migrate Alerts to PostgreSQL

---

### Stage 7: AI Voice & CRM

- [ ] **T59**: Migrate AI Voice Agents to PostgreSQL
- [ ] **T60**: Migrate AI Voice Flows to PostgreSQL
- [ ] **T61**: Migrate AI Voice Campaigns to PostgreSQL
- [ ] **T62**: Migrate CRM Connections to PostgreSQL

---

### Stage 8: CMS & Experience

- [ ] **T63**: Migrate CMS Themes to PostgreSQL
- [ ] **T64**: Migrate CMS Pages to PostgreSQL
- [ ] **T65**: Migrate Email Templates to PostgreSQL
- [ ] **T66**: Migrate Site Settings to PostgreSQL

---

### Stage 9: Testing & SIP

- [ ] **T67**: Migrate SIP Test Configs to PostgreSQL
- [ ] **T68**: Migrate SIP Test Results to PostgreSQL
- [ ] **T69**: Migrate SIP Test Schedules to PostgreSQL

---

### Stage 10: Final Cleanup

- [ ] **T70**: Remove MemStorage class entirely
  - Acceptance: Only DatabaseStorage class remains; all Maps removed
- [ ] **T71**: Full regression test suite
  - Acceptance: npm run check + Playwright + Axe all pass

---

## Next Actions
1. All Phase 1 (T1-T10) and Phase 3 (T17-T23) tasks complete
2. Begin Phase 4 Stage 1: T30 (Customer Categories) first
3. Execute one stage at a time, report after each stage
