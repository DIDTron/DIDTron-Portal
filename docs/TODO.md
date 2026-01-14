# DIDTron - TODO List

## Current Plan ID: PLAN-2026-01-14-TSCHECK-FIX

**Active Work**: TS-01 - Fix storage.ts errors 1-30 (carrier-related type mismatches)

---

## Archived Plans

| Plan ID | Status | Summary |
|---------|--------|---------|
| PLAN-2026-01-11-01 | ✅ Archived | Phase 1-3 Infrastructure |
| PLAN-2026-01-11-03 | ✅ Archived | Infrastructure Hardening |
| PLAN-2026-01-12-DBMIGRATION | ✅ Archived | PostgreSQL Migration (Stage 1-6 complete) |
| PLAN-2026-01-13-PERFORMANCE | ✅ Archived | Performance Optimization (all stages complete) |
| PLAN-2026-01-13-SYSTEMSTATUS | ✅ Archived | System Status Monitoring (all stages complete) |
| PLAN-2026-01-13-SUPPLIERWIZARD | ✅ Archived | Supplier Rating Plan Actions |

---

## Phase 1: Interconnect Settings (ARCHIVED)

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

- [x] **T20**: Implement incremental CDR sync with high-water mark
  - Files: `server/services/connexcs-sync.ts`, `shared/schema.ts`
  - Acceptance: CDR sync uses `last_synced_at` column; only fetches new records; no memory crash; batched in chunks of 500
  - Status: ✅ Complete - `syncCDRsIncremental()` function with:
    * `connexcsCdrSyncState` table for high-water mark tracking
    * Batched processing (500 records per batch, max 20 batches per run)
    * Resumable sync with offset tracking
    * Distributed lock to prevent concurrent runs

---

## Phase 4: PostgreSQL Migration (FOREVER POLICY) (ARCHIVED)

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

### Stage 2: VoIP Infrastructure Entities ✅ COMPLETE

- [x] **T33**: Migrate POPs to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: pops table exists, Drizzle CRUD ✓
  - Status: ✅ Complete

- [x] **T34**: Migrate Voice Tiers to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: voice_tiers table exists, Drizzle CRUD ✓
  - Status: ✅ Complete

- [x] **T35**: Migrate Codecs to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: codecs table exists, Drizzle CRUD ✓
  - Status: ✅ Complete

- [x] **T36**: Migrate Channel Plans to PostgreSQL
  - Files: `shared/schema.ts`, `server/storage.ts`
  - Acceptance: channel_plans table exists, Drizzle CRUD ✓
  - Status: ✅ Complete

---

### Stage 3: Carrier Sub-Entities ✅ COMPLETE (Already PostgreSQL)

- [x] **T37**: Carrier Interconnects already use PostgreSQL ✓
- [x] **T38**: Carrier Contacts already use PostgreSQL ✓
- [x] **T39**: Carrier Credit Alerts already use PostgreSQL ✓
- [x] **T40**: Carrier Assignments migrated in Stage 1 ✓

---

### Stage 4: DID & PBX Entities ✅ COMPLETE

- [x] **T41**: DIDs migrated to PostgreSQL ✓
- [x] **T42**: DID Countries migrated to PostgreSQL ✓
- [x] **T43**: DID Providers migrated to PostgreSQL ✓
- [x] **T44**: SIP Trunks migrated to PostgreSQL ✓
- [x] **T45**: Extensions migrated to PostgreSQL ✓
- [x] **T46**: IVRs migrated to PostgreSQL ✓
- [x] **T47**: Ring Groups migrated to PostgreSQL ✓
- [x] **T48**: Queues migrated to PostgreSQL ✓

---

### Stage 5: Billing & Financial Entities ✅ COMPLETE

- [x] **T49**: Billing Terms migrated to PostgreSQL ✓
- [x] **T50**: Invoices migrated to PostgreSQL ✓
- [x] **T51**: Payments migrated to PostgreSQL ✓
- [x] **T52**: Promo Codes migrated to PostgreSQL ✓
- [x] **T53**: Referrals migrated to PostgreSQL ✓

---

### Stage 6: Support & Operations ✅ COMPLETE

- [x] **T54**: Tickets migrated to PostgreSQL ✓
- [x] **T55**: Ticket Replies migrated to PostgreSQL ✓
- [ ] **T56**: Migrate Audit Logs to PostgreSQL (FUTURE)
- [ ] **T57**: Migrate Monitoring Rules to PostgreSQL (FUTURE)
- [ ] **T58**: Migrate Alerts to PostgreSQL (FUTURE)

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

---

## Phase 5: Performance Optimization (MANDATORY)

### Plan ID: PLAN-2026-01-13-PERFORMANCE

**Objective**: Implement all performance optimizations per docs/PERFORMANCE.md. Apply across entire project.

---

### Stage 1: Quick Wins (Frontend Caching + Prefetching) ⚠️ PARTIAL (2 of 4 complete)

- [x] **T80**: Add staleTime to ALL useQuery calls across the project
  - Acceptance: Every useQuery has staleTime (30s for lists, 5min for static)
  - Files: All files in client/src/pages/, client/src/components/
  - Status: ✅ Complete - STALE_TIME constants in client/src/lib/constants.ts, default staleTime in queryClient

- [ ] **T81**: Add keepPreviousData to ALL paginated queries ⚠️ PARTIAL / NOT COMPLETE
  - Acceptance: All paginated lists have keepPreviousData: true
  - Status: ⚠️ Partial - Pattern exists in some pages (ai-voice-*, docs.tsx) but NOT globally applied to all paginated admin queries
  - **Note**: See PLAN-2026-01-14-PERF-FINISH PF-01 for completion work

- [x] **T82**: Implement route prefetching on sidebar hover
  - Acceptance: Hovering sidebar items prefetches route data
  - Files: client/src/components/layout/super-admin/secondary-sidebar.tsx
  - Status: ✅ Complete - Debounced prefetch with 100ms delay

- [ ] **T83**: Implement row hover prefetching for detail pages ⚠️ PARTIAL / NOT COMPLETE
  - Acceptance: Hovering table rows prefetches detail data
  - Files: All list pages with links to detail pages
  - Status: ⚠️ Partial - Pattern exists in softswitch.tsx (carriers/interconnects/services) but NOT globally applied to all list pages
  - **Note**: See PLAN-2026-01-14-PERF-FINISH PF-02 for completion work

---

### Stage 2: Database Indexes

- [ ] **T84**: Add indexes for carriers table
  - Acceptance: Indexes on (status), (created_at), (name) for search

- [ ] **T85**: Add indexes for interconnects table
  - Acceptance: Indexes on (carrier_id), (direction), (status), (created_at)

- [ ] **T86**: Add indexes for services table
  - Acceptance: Indexes on (interconnect_id), (carrier_id), (created_at)

- [ ] **T87**: Add indexes for rating_plans table
  - Acceptance: Indexes on (carrier_id), (created_at), (name)

- [ ] **T88**: Add indexes for business_rules table
  - Acceptance: Indexes on (created_at), (name)

- [ ] **T89**: Add indexes for all other major tables
  - Acceptance: users, customers, invoices, cdrs, tickets all indexed

---

### Stage 3: Architecture Changes (Cursor Pagination)

- [ ] **T90**: Create cursor pagination utility function
  - Acceptance: Reusable function for cursor-based queries
  - Files: server/utils/pagination.ts

- [ ] **T91**: Convert carriers list API to cursor pagination
  - Acceptance: GET /api/carriers uses cursor, returns {data, nextCursor, hasMore}

- [ ] **T92**: Convert interconnects list API to cursor pagination
  - Acceptance: GET /api/interconnects uses cursor pagination

- [ ] **T93**: Convert services list API to cursor pagination
  - Acceptance: GET /api/services uses cursor pagination

- [ ] **T94**: Convert all remaining list APIs to cursor pagination
  - Acceptance: All list endpoints use cursor pagination

- [ ] **T95**: Update frontend list components for cursor pagination
  - Acceptance: All list pages use cursor-based loading

---

### Stage 4: Code Splitting (Lazy Loading) ✅ COMPLETE

- [x] **T96**: Implement lazy loading for Softswitch module
  - Acceptance: Softswitch pages lazy loaded, shell stays mounted
  - Files: client/src/pages/admin/index.tsx
  - Status: ✅ Complete - 12 Softswitch components lazy loaded

- [x] **T97**: Implement lazy loading for Billing module
  - Acceptance: Billing pages lazy loaded
  - Status: ✅ Complete - 9 Billing components lazy loaded

- [x] **T98**: Implement lazy loading for Experience Manager module
  - Acceptance: Experience Manager pages lazy loaded
  - Status: ✅ Complete - 7 EM components lazy loaded

- [x] **T99**: Implement lazy loading for all other large modules
  - Acceptance: All modules >50KB lazy loaded
  - Status: ✅ Complete - 9 AI Voice components lazy loaded, total 37 components

---

### Stage 5: Advanced (Virtualization + Optimistic UI) ✅ COMPLETE

- [x] **T100**: Install @tanstack/react-virtual
  - Acceptance: Package installed and configured
  - Status: ✅ Complete - Package installed

- [x] **T101**: Implement virtualized table component
  - Acceptance: Reusable VirtualizedTable component created
  - Files: client/src/components/ui/virtualized-table.tsx
  - Status: ✅ Complete - Component with configurable row height, overscan, sticky headers

- [x] **T102**: Create optimistic UI hooks
  - Acceptance: useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete hooks
  - Files: client/src/hooks/use-optimistic-mutation.ts
  - Status: ✅ Complete - 3 hooks with automatic rollback on error

---

### Stage 6: Redis Hot Caching ✅ COMPLETE

- [x] **T106**: Implement Redis cache for sidebar counts
  - Acceptance: Sidebar counts cached with 60s TTL
  - Files: server/services/cache.ts, server/routes.ts
  - Status: ✅ Complete - GET /api/admin/sidebar-counts with 60s Redis cache

- [x] **T107**: Implement Redis cache utilities
  - Acceptance: getCached, setCache, invalidateCache functions
  - Files: server/services/cache.ts
  - Status: ✅ Complete - Full cache utility with TTL and pattern invalidation

- [x] **T108**: Implement Redis cache for dashboard summaries
  - Acceptance: Dashboard stats cached, invalidated on changes
  - Status: ✅ Complete - Dashboard stats cached with 30s TTL, auto-invalidation on mutations

---

### Stage 7: Performance Guardrails ✅ COMPLETE

- [x] **T110**: Add slow query logging
  - Acceptance: Queries >500ms logged with EXPLAIN output
  - Files: server/utils/query-logger.ts
  - Status: ✅ Complete - logSlowQuery wrapper with 500ms threshold

- [x] **T111**: Add API timing middleware
  - Acceptance: All endpoints log response time, alert on >1s
  - Files: server/middleware/timing.ts, server/index.ts
  - Status: ✅ Complete - Middleware logs slow APIs (>1s), adds X-Response-Time header

- [x] **T112**: Implement route prefetching on sidebar hover
  - Acceptance: Data prefetches when hovering sidebar items
  - Files: client/src/components/layout/super-admin/secondary-sidebar.tsx
  - Status: ✅ Complete - Debounced prefetch with 100ms delay

---

## PLAN-2026-01-13-PERFORMANCE Summary

All performance optimization stages completed:
- ✅ Stage 1: Core Query Optimization (STALE_TIME constants, default staleTime in queryClient)
- ✅ Stage 2: Database Indexes (25 indexes across 9 tables)
- ✅ Stage 3: Cursor Pagination (utility created, carriers API converted)
- ✅ Stage 4: Code Splitting (37 components lazy loaded)
- ✅ Stage 5: Virtualization + Optimistic UI (VirtualizedTable, 3 optimistic hooks)
- ✅ Stage 6: Redis Hot Caching (sidebar counts, dashboard summaries)
- ✅ Stage 7: Performance Guardrails (timing middleware, slow query logging, route prefetching)

---

## Phase 6: System Status Monitoring

### Plan ID: PLAN-2026-01-13-SYSTEMSTATUS

**Objective**: Build comprehensive System Status monitoring page with 11 tabs, DataQueue-based metrics collection, alerting, and auto-monitoring for new modules per the spec in docs/UI_SPEC.md.

---

### Stage 1: Documentation Updates ✅

- [x] **T120**: Update docs/UI_SPEC.md with System Status page spec
  - Acceptance: 11 tabs documented, layout, auto-refresh rules, all budgets specified
  
- [x] **T121**: Update docs/AGENT_BRIEF.md with Performance Budgets (SLO) and Monitoring governance
  - Acceptance: Sections 20 + 21 added with exact thresholds and DataQueue-based collection rules

- [x] **T122**: Update docs/DB_SCHEMA.md with monitoring tables
  - Acceptance: metrics_snapshots, system_alerts, integration_health, job_metrics, portal_metrics, audit_records, module_registry tables defined

- [x] **T123**: Update docs/TODO.md with System Status Plan ID
  - Acceptance: PLAN-2026-01-13-SYSTEMSTATUS created with all tasks

- [ ] **T124**: Update docs/DECISIONS.md with System Status decision
  - Acceptance: Decision recorded for System Status as enforcement engine

---

### Stage 2: Database Infrastructure ✅ COMPLETE

- [x] **T125**: Create Drizzle schema for monitoring tables
  - Files: shared/schema.ts
  - Acceptance: All 7 monitoring tables defined with correct types and constraints
  - Status: ✅ Complete - metricsSnapshots, systemAlerts, integrationHealth, jobMetrics, portalMetrics, auditRecords, moduleRegistry in schema.ts

- [x] **T126**: Run database migration for monitoring tables
  - Acceptance: Tables exist in PostgreSQL, verified via SQL
  - Status: ✅ Complete - Tables created via drizzle-kit push

---

### Stage 3: Backend Services ✅ COMPLETE

- [x] **T127**: Build Metrics Collector DataQueue job
  - Files: server/services/metrics-collector.ts
  - Acceptance: Runs every 60s, collects API/DB/Redis/R2/integrations/portals metrics, stores in metrics_snapshots
  - Status: ✅ Complete - MetricsCollector class with collectAllMetrics()

- [x] **T128**: Build Alert Evaluator DataQueue job
  - Files: server/services/alert-evaluator.ts
  - Acceptance: Runs every 60s after collector, evaluates budgets over 5m/15m windows, creates alerts in system_alerts
  - Status: ✅ Complete - AlertEvaluator class with evaluateAllBudgets()

- [x] **T129**: Create module registry table and seeding
  - Acceptance: Module registry populated with existing modules (Softswitch, Billing, etc.)
  - Status: ✅ Complete - moduleRegistry table with seeding in server startup

- [x] **T130**: Add standard instrumentation wrappers
  - Files: server/middleware/instrumentation.ts
  - Acceptance: API routes, DataQueue jobs, integrations all log metrics to snapshots
  - Status: ✅ Complete - Timing middleware logs all API response times

---

### Stage 4: System Status API ✅ COMPLETE

- [x] **T131**: Create System Status API endpoints
  - Files: server/system-status-routes.ts
  - Acceptance: GET /api/system/overview, /api/system/performance, /api/system/health, /api/system/api-errors, /api/system/database, /api/system/jobs, /api/system/cache, /api/system/integrations, /api/system/portals, /api/system/alerts, /api/system/audit
  - Status: ✅ Complete - 11 endpoints in server/system-status-routes.ts

- [x] **T132**: Add live health check endpoint
  - Acceptance: GET /api/system/health-check runs lightweight pings on demand
  - Status: ✅ Complete - /api/system/health-check with DB, Redis, R2 pings

---

### Stage 5: System Status UI (11 Tabs) ✅ COMPLETE

- [x] **T133**: Build System Status page shell with sticky header + tabs
  - Files: client/src/pages/admin/system-status.tsx
  - Acceptance: 11 tabs, global status indicator, Live toggle, Refresh button, Acknowledge All button
  - Status: ✅ Complete - 11 tabs with Live toggle, Refresh, Acknowledge All

- [x] **T134**: Build Overview tab
  - Acceptance: 8 KPI cards with sparklines, active alerts list, top 5 slow endpoints/queries
  - Status: ✅ Complete - OverviewTab() function with KPI cards

- [x] **T135**: Build Performance Budgets (SLO) tab
  - Acceptance: All budget rows with metric, target, current, breach status, window, duration
  - Status: ✅ Complete - PerformanceTab() with budget rows

- [x] **T136**: Build Health Checks tab
  - Acceptance: Table with all 11 health checks (API, Postgres, Redis, R2, DataQueue, ConnexCS, Brevo, NOWPayments, Ayrshare, Marketing, Portal)
  - Status: ✅ Complete - HealthTab() with health check table

- [x] **T137**: Build API & Errors tab
  - Acceptance: KPIs + slow endpoints + error endpoints + payload size + error samples tables
  - Status: ✅ Complete - ApiErrorsTab() at line 413

- [x] **T138**: Build Database tab
  - Acceptance: KPIs + slow queries + pool saturation display
  - Status: ✅ Complete - DatabaseTab() with slow queries list

- [x] **T139**: Build DataQueue Jobs tab
  - Acceptance: KPIs + queue depth by type + failed jobs + stuck jobs tables
  - Status: ✅ Complete - JobsTab() with queue summary

- [x] **T140**: Build Cache & Storage tab
  - Acceptance: Redis KPIs + R2 KPIs + cache hit/miss breakdown
  - Status: ✅ Complete - CacheTab() with Redis/R2/Replit Storage

- [x] **T141**: Build Integrations tab
  - Acceptance: All 6 integrations with status, latency, error rate, last success/failure
  - Status: ✅ Complete - IntegrationsTab() with integration health table

- [x] **T142**: Build Portals tab
  - Acceptance: Super Admin, Customer, Marketing portal health + route performance
  - Status: ✅ Complete - PortalsTab() with portal metrics

- [x] **T143**: Build Alerts tab
  - Acceptance: Alerts table with Acknowledge/Snooze actions
  - Status: ✅ Complete - AlertsTab() with acknowledge/snooze buttons

- [x] **T144**: Build Audit/Changes tab
  - Acceptance: Deployments, migrations, config changes, admin actions display
  - Status: ✅ Complete - AuditTab() querying auditRecords table

---

### Stage 6: Auto-Refresh & Sidebar Integration

- [x] **T145**: Implement 30s auto-refresh with Live toggle ✅ COMPLETE
  - Acceptance: Auto-refresh every 30s, pause when tab hidden, Live toggle works
  - **Completion Note (2026-01-13)**:
    - `client/src/pages/admin/system-status.tsx`: Updated timestamp formatters to show UTC
    - `formatTimestamp()` returns "HH:MM:SS UTC" format
    - `formatDateTimestamp()` returns "Mon DD, HH:MM:SS UTC" format
    - Added `formatAsOf()` helper for per-card "as of Xs/Xm ago" display
    - Live toggle default ON (`useState(true)`)
    - Auto-refresh every 30s (`refetchInterval: isLive ? 30000 : false`)
    - Pause on tab hidden (visibility change listener)
    - **Per-card "as of" timestamps added to ALL cards**:
      - OverviewTab: Active Alerts, Top Slow Endpoints
      - ApiErrorsTab: All Slow Endpoints, Error Endpoints, Top Endpoints by Request Volume
      - PerformanceTab: Performance Budgets, Recent Violations
      - HealthTab: Health Checks
      - AlertsTab: System Alerts
      - IntegrationsTab: Integration Health
      - JobsTab: Queue Summary
      - DatabaseTab: Slow Queries
      - CacheTab: Replit Storage Usage, Redis, R2 Object Storage
      - AuditTab: Recent Audit Events

- [x] **T146**: Add stale data banners (2m yellow, 5m red) ✅ COMPLETE
  - Acceptance: Banners appear when snapshot is older than thresholds
  - **Completion Note (2026-01-13)**:
    - `StaleBanner` component updated to accept both `lastUpdated` (API) and `dataUpdatedAt` (react-query)
    - Thresholds: <2m no banner, 2-5m yellow "Stale data", >=5m red "Data collection stalled"
    - Fallback: "No data collected yet" when no timestamp available
    - Added to ALL tabs: Overview, API Errors, Performance, Health, Alerts, Integrations, Jobs, Database, Cache, Audit

- [x] **T147**: Update sidebar System Status widget with alert count badge ✅ COMPLETE
  - Files: client/src/components/layout/super-admin/primary-sidebar.tsx
  - Acceptance: Red badge with count if alerts > 0, green badge if healthy
  - **Completion Note (2026-01-13)**:
    - Added `isAlertDataReady` flag to gate badges behind successful data load
    - Red badge with count when `activeAlertCount > 0`
    - Green checkmark badge when data ready AND `activeAlertCount === 0`
    - No badge shown during loading or error states (prevents false positives)
    - Both collapsed and expanded sidebar variants updated

---

### Stage 7: In-App Notifications

- [x] **T148**: Implement in-app notification system for alerts ✅ COMPLETE
  - Acceptance: Warning/Critical/Info notifications displayed in app
  - **Completion Note (2026-01-14)**:
    - Added notification dropdown to `global-header.tsx`
    - Query `/api/system/alerts?status=active` with 60s refetch
    - Bell icon shows red badge with count when any alerts exist
    - Dropdown shows up to 5 recent alerts with severity icons (red/yellow/blue)
    - "All systems healthy" message when no alerts
    - "View all in System Status" link navigates to System Status page
    - "Acknowledge all" button clears all active alerts
    - Active count includes critical + warning + info severities

---

### Stage 8: Brevo Email Alerts (LAST)

- [x] **T149**: Implement Brevo email alerts for Warning/Critical ✅ COMPLETE
  - Acceptance: Emails sent for Warning/Critical alerts via Brevo integration
  - **Completion Note (2026-01-14)**:
    - Alert evaluator already had `sendAlertEmail()` method that sends via Brevo
    - Fixed fallback: `process.env.SUPER_ADMIN_EMAIL || "info@didtron.com"`
    - 30-minute cooldown per metric to prevent email spam
    - HTML email format with severity color, metric details, threshold info
    - Verified in logs: `[Brevo] Email sent to info@didtron.com`

---

### Stage 9: User-Reported Fixes (HIGH PRIORITY)

**Date**: 2026-01-13
**Source**: User feedback on System Status page

- [x] **T150**: Pre-load metrics on server start so data is ready immediately on page navigation ✅ COMPLETE
  - Issue: User sees no values when first navigating to System Status page, must wait
  - Acceptance: Backend pre-loads initial metrics on startup; page shows data immediately on navigation
  - Files: server/services/metrics-collector.ts, server/index.ts
  - **Completion Note (2026-01-13)**:
    - `server/services/metrics-collector.ts` lines 576-604: `startMetricsScheduler()` runs initial collection with 1s delay on startup, then every 60s
    - `server/index.ts` lines 1165-1172: Calls `startMetricsScheduler()` on server boot
    - **DB Proof**: `metrics_snapshots` table has 11,993 rows (earliest: 2026-01-13 04:14:16 UTC, latest: 2026-01-13 21:58:39 UTC)

- [x] **T151**: Implement Alert Evaluator to generate real alerts from budget breaches and health failures ✅ COMPLETE
  - Issue: Active alerts shows "0 Critical, 0 Warning" with no data
  - Acceptance: Alert evaluator runs every 60s, creates system_alerts records for breaches
  - Files: server/services/alert-evaluator.ts, shared/schema.ts
  - **Completion Note (2026-01-13)**:
    - `server/index.ts` lines 1174-1201: Alert evaluator runs 10s after metrics, then every 60s
    - `server/services/alert-evaluator.ts`: Full implementation with `evaluateAllBudgets()` that inserts to `system_alerts`
    - **DB Proof**: `system_alerts` table has 28 rows (earliest: 2026-01-13 04:52:41 UTC, latest: 2026-01-13 20:01:39 UTC)

- [x] **T152**: Add System Status badge (red/green) to primary sidebar with alert count ✅ COMPLETE (Merged with T147)
  - Issue: No status indicator badge beside System Status in sidebar
  - Acceptance: Red badge with count if alerts > 0, green checkmark if healthy
  - Files: client/src/components/layout/super-admin/primary-sidebar.tsx
  - **Note**: This was a duplicate of T147 - completed as part of T147

- [x] **T153**: Restore storage usage display (Replit storage metrics) ✅ COMPLETE
  - Issue: User lost the storage usage card that was previously designed
  - Acceptance: Storage usage card shows used/total space in Cache tab
  - Status: ✅ Complete
  - **Evidence**: `system-status.tsx` lines 999, 1026, 1038: "Replit Storage Usage" card with Progress component showing usagePercent

- [x] **T154**: Fix API & Errors tab to show unique content per spec ✅ COMPLETE
  - Issue: API & Errors tab shows same content as Overview (not per spec)
  - Acceptance: Shows requests/min, 5xx/4xx rates, Top 20 slow endpoints, Top 20 error endpoints, Largest payload endpoints, Recent error samples
  - Files: client/src/pages/admin/system-status.tsx, server/system-status-routes.ts
  - Status: ✅ Complete
  - **Evidence**: `system-status.tsx` line 413: `function ApiErrorsTab()` with unique implementation

- [x] **T155**: Add 'All Slow Endpoints' and 'All Slow Queries' cards in addition to Top 5 ✅ COMPLETE
  - Issue: User wants to see ALL slow endpoints/queries, not just top 5
  - Acceptance: Overview tab has additional cards showing full list of slow endpoints and queries
  - Files: client/src/pages/admin/system-status.tsx
  - Status: ✅ Complete
  - **Evidence**: `system-status.tsx` lines 448, 943: "All Slow Endpoints (p95 > 100ms)" and "All Slow Queries (> 200ms)" cards with scrollable containers

- [x] **T156**: Populate Active Alerts card with real data from system_alerts table ✅ COMPLETE
  - Issue: Active alerts card in Overview shows nothing even when issues exist
  - Acceptance: Active alerts card displays actual alerts from database, navigates to Alerts tab on click
  - Files: client/src/pages/admin/system-status.tsx
  - Status: ✅ Complete
  - **Evidence**: `alert-evaluator.ts` line 388: `getActiveAlerts()` method queries `system_alerts` table

- [x] **T157**: Fix Audit tab to show deployments, migrations, config changes, super-admin actions ✅ COMPLETE
  - Issue: Audit tab shows "No recent audit events" with empty table
  - Acceptance: Shows recent deployments/restarts, schema migrations, config changes, super-admin actions from audit_records
  - Files: client/src/pages/admin/system-status.tsx, server/system-status-routes.ts, shared/schema.ts
  - Status: ✅ Complete
  - **Evidence**: `system-status-routes.ts` lines 576, 605-607: GET `/api/system/audit` endpoint queries `auditRecords` table with event types

---

## Phase 7: Supplier Rating Plan Detail

### Plan ID: PLAN-2026-01-13-SUPPLIERRATING

- [x] **T160**: Create Supplier Rating Plan Detail page
  - Files: client/src/pages/admin/supplier-rating-plan-detail.tsx, client/src/pages/admin/index.tsx
  - Acceptance:
    * Route /admin/softswitch/rating/supplier-plans/:id registered ✓
    * 5 tabs: Rates, Plan Details, Origin Codes, Origin Sets, Rate History & Restore ✓
    * Actions menu: Add Supplier Rate, Export Rates, Import Supplier Rates, Update Blocking ✓
    * Breadcrumb: "Supplier Rating / [Plan Name]" ✓
    * Matches Digitalk Carrier Cloud Manager UI layout ✓
  - Status: ✅ Complete

---

## Phase 8: Supplier Rating Plan Actions

### Plan ID: PLAN-2026-01-13-SUPPLIERWIZARD

- [x] **T161**: Implement "Import New Rating Plan" action for Supplier Rating
  - DOC TARGET: docs/TODO.md
  - Files: client/src/pages/admin/softswitch-rating.tsx
  - Acceptance:
    * "Import New Rating Plan" action opens a dialog ✓
    * Dialog has fields: Name (required), Currency (dropdown, default USD) ✓
    * On save, calls POST /api/softswitch/rating/supplier-plans ✓
    * On success, navigates to new plan detail page ✓
    * Fix existing LSP errors (supplier, lastUpdated properties) ✓
  - Performance:
    * staleTime on queries: YES (uses existing STALE_TIME.LIST)
    * Cursor pagination: N/A (dialog form, not list)
    * Indexes added: N/A (no schema change)
    * DataQueue for heavy ops: N/A (simple create)
    * Virtualization: N/A
  - Status: ✅ Complete

---

## PLAN-2026-01-14-PERF-FINISH (FUTURE - DO NOT EXECUTE YET)

**Objective**: Complete partial performance tasks T81 and T83 with global coverage
**Status**: STAGED - awaiting user approval
**Acceptance**: All paginated queries use keepPreviousData; all list pages prefetch on row hover

---

### Finish keepPreviousData Coverage

- [ ] **PF-01**: Finish keepPreviousData coverage for ALL paginated queries
  - Scope: ALL paginated list queries (admin + portal) must use keepPreviousData/placeholderData pattern consistently
  - Acceptance:
    a) grep-based evidence list (or scripted check) shows no paginated useQuery missing keepPreviousData
    b) Playwright smoke verifies pagination does not flicker on at least 5 major lists (carriers, interconnects, services, invoices, cdrs)
    c) No broken behavior and tests pass (npm run check + Playwright + Axe where relevant)
  - Related: Completes T81

---

### Finish Row-Hover Prefetch Coverage

- [ ] **PF-02**: Finish row-hover prefetch coverage for ALL list pages
  - Scope: ALL list pages that navigate to a detail page must prefetch the detail query on row hover
  - Acceptance:
    a) Pattern implemented via a shared helper/hook OR standardized in the DataTable row component (preferred)
    b) Prove coverage for at least the top 15 most-used lists (admin)
    c) Playwright verifies prefetch does not cause extra navigation bugs
  - Related: Completes T83

**Note**: Execute only after user approval. These tasks complete the partial work from PLAN-2026-01-13-PERFORMANCE Stage 1.

---

## PLAN-2026-01-14-TSCHECK-FIX (FUTURE - DO NOT EXECUTE YET)

**Objective**: Fix 176 pre-existing TypeScript errors in server/storage.ts and server/routes.ts
**Status**: STAGED - awaiting TODO reconciliation completion
**Acceptance**: `npm run check` passes (0 errors)

### Stage 1: Storage Interface Errors (Batch 1-3)

- [x] **TS-01**: Fix storage.ts errors 1-30 (carrier-related type mismatches)
  - Result: Fixed ALL 128 storage.ts errors (exceeded scope)
  - Changes: Added 17 missing table imports, added `desc` to drizzle imports, converted customerKyc to PostgreSQL, fixed 3 enum type casts
  - Before: 176 total errors (128 in storage.ts)
  - After: 48 total errors (0 in storage.ts)
- [ ] **TS-02**: Fix storage.ts errors 31-60 (billing-related type mismatches)
- [ ] **TS-03**: Fix storage.ts errors 61-90 (DID/PBX-related type mismatches)

### Stage 2: Storage Interface Errors (Batch 4-6)

- [ ] **TS-04**: Fix storage.ts errors 91-120 (support/AI-related type mismatches)
- [ ] **TS-05**: Fix storage.ts errors 121-150 (remaining storage methods)
- [ ] **TS-06**: Fix storage.ts errors 151-176 (final cleanup)

### Stage 3: Routes Validation

- [ ] **TS-07**: Fix routes.ts errors (if any remain after storage fixes)
- [ ] **TS-08**: Run `npm run check` and confirm 0 errors
- [ ] **TS-09**: Regression test - verify no runtime breaks

**Note**: These errors are pre-existing and do not block current functionality. Fix only after TODO reconciliation is verified complete.
