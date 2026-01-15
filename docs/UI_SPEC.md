# DIDTron - UI Specification

## Layout Architecture

### Double Sidebar + Headers
```
┌─────────────────────────────────────────────────────────────┐
│ Primary Sidebar │ Secondary Sidebar │ Main Content          │
│ (modules)       │ (section items)   │ ┌─────────────────────┤
│                 │                   │ │ Page Header + Tabs  │
│                 │                   │ ├─────────────────────┤
│                 │                   │ │ Content Area        │
│                 │                   │ │                     │
└─────────────────────────────────────────────────────────────┘
```

## Navigation Pattern
- Primary sidebar: Module icons/labels
- Secondary sidebar: Section items for selected module
- Module click → Navigate to first actual page (no overviews)

## Page Patterns

### List Pages
- Actions dropdown (top-right)
- Data table with columns
- DataTableFooter component (required)
- Row click → Detail page or modal

### Detail Pages
- Header: Breadcrumb + Page Title + Actions dropdown
- Tab navigation below header
- Content cards within each tab

### Modal Forms
- Used for Add/Edit operations
- Form validation (frontend + backend)
- Loading states on submit

## Softswitch Module Routes

### Carriers Section
- `/admin/softswitch/carriers` - Carrier list (View dropdown: Carriers/Interconnects/Services)
- `/admin/carriers/:id` - Carrier Detail (5 tabs)
- `/admin/carriers/:carrierId/interconnects/:interconnectId` - Interconnect Detail

### Carrier Detail Tabs
1. **Carrier Details** - 3-column layout (Details | Credit Control | Credit Settings)
2. **Interconnects** - List with Add button
3. **Contact Details** - Contact list with CRUD
4. **Accounting Details** - Account numbers, tax info
5. **Credit Alerts** - Alert configuration

### Customer Interconnect Detail (Ingress) - 5 Tabs
1. **Services** - Service list with Add/Edit
2. **Ingress Validation** - IP validation, Tech Prefix, Max CPS
3. **Ingress Translation** - Origination Preference, PAI, Number Translation
4. **Media** - Codecs table, DTMF, Media Relay, RTP Timeout
5. **Signalling** - Privacy, Session Timer, Max Duration, Release Cause

### Supplier Interconnect Detail (Egress) - 6 Tabs
1. **Details** - Capacity, Status, Supplier Rating Plan
2. **Egress Routing** - Tech Prefix, Send To IPs, Transport
3. **Egress Translations** - PAI, Block Invalid Origins
4. **Media** - Codecs table, DTMF, Media Relay
5. **Signalling** - Privacy, Session Timer, Release Cause
6. **Monitoring** - SIP OPTIONS ping, Auto-disable

### Supplier Rating Plan Detail - 5 Tabs
Route: `/admin/softswitch/rating/supplier-plans/:id`
Breadcrumb: "Supplier Rating / [Plan Name]"

1. **Rates** - Rate table with filters (Effective, Code, Zone, Time Class, Origin Set, Origin Rates, Blocked)
   - "Change to Code View" button
   - Columns: Zone, Codes, Origin Set, Time Class, Effective Date, End Date, Effective Status, Recurring Charge, Recurring Interval, Delete
   - Actions: Add Supplier Rate, Export Rates, Import Supplier Rates, Update Blocking
2. **Plan Details** - Plan name, identifier, currency (editable)
3. **Origin Codes** - Origin-based pricing rules
4. **Origin Sets** - Group origin codes for management
5. **Rate History & Restore** - Historical versions, restore capability

### Customer Rating Plan Detail - 3 Tabs
Route: `/admin/softswitch/rating/customer-plans/:id`
Breadcrumb: "Customer Rating Plans / [Plan Name]"

1. **Rates** - Rate table with extended filters (Show, Locked)
   - Actions: Add Rate, Export Rates, Import Customer Rates, Usage Check, Update Blocking, Update Locking, Update Margin, Apply Floor Price
2. **Plan Details** - Plan name, identifier, currency, margin enforcement, min rated call duration, short call duration
3. **Rate History & Restore** - Historical versions, restore capability

## Component Library
- Location: `/admin/experience-manager/component-library`
- Single source of truth for all UI components

## Consistent Behaviors
- `useQuery`'s `refetch()` and `isFetching` for refresh
- Focus-safe initialization on new pages
- Overflow-safe cards
- Error/empty/loading states everywhere

---

## Digitalk Layout Patterns

This section documents the Digitalk Carrier Cloud Manager layout pattern that MUST be followed for all Class 4 Softswitch module pages and future modules requiring hierarchical entity management.

### 1. Three-Level Navigation Flow

```
LEVEL 1: LIST PAGE          →  LEVEL 2: ENTITY DETAIL    →  LEVEL 3: SUB-ENTITY DETAIL
/admin/{module}                /admin/{entities}/:id         /admin/{entities}/:id/{sub}/:subId
────────────────────────────────────────────────────────────────────────────────────────────────
[+ Add Button]                 Breadcrumb + Actions          Breadcrumb + Actions
DataTable with columns         Tab navigation (3-6 tabs)     Tab navigation (5-9 tabs)
Row click → Level 2            Cards within each tab         Cards within each tab
                               Sub-entity lists in tabs      Settings forms in tabs
                               Row click → Level 3
```

### 2. URL Structure Pattern

| Level | Pattern | Example |
|-------|---------|---------|
| List | `/admin/{module}/{section}` | `/admin/softswitch/carriers` |
| Detail | `/admin/{entities}/:id` | `/admin/carriers/:carrierId` |
| Sub-Detail | `/admin/{entities}/:id/{subEntities}/:subId` | `/admin/carriers/:carrierId/interconnects/:icId` |

**Rule:** Each level deeper = more specific entity = more configuration tabs.

### 3. Page Header Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back  │  Breadcrumb / Entity Name                    │  [Actions ▾]      │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Tab 1] [Tab 2] [Tab 3] [Tab 4] [Tab 5]                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- **Back button**: Returns to parent level
- **Breadcrumb**: Shows hierarchy path (e.g., "Carrier Management / Carrier A / IC-Main")
- **Actions dropdown**: Entity-level actions (Edit, Delete, Duplicate, etc.)
- **Tabs**: Horizontal tabs below header, may scroll horizontally for many tabs

### 4. Tab Behavior by Entity Direction

Tabs change based on entity type/direction. This is the Digitalk pattern for Interconnects:

| Direction | Tab Count | Tabs |
|-----------|-----------|------|
| **Customer (Ingress)** | 6 | Details, Services, Ingress Validation, Ingress Translation, Media, Signalling |
| **Supplier (Egress)** | 6 | Details, Egress Routing, Egress Translations, Media, Monitoring, Signalling |
| **Bilateral** | 9 | All Customer tabs + Egress Routing, Egress Translations, Monitoring |

**Implementation:** Use conditional tab rendering based on `direction` field.

### 5. Card Layout Patterns

#### 5.1 Multi-Column Grid (2-3 columns)
Used for related but distinct settings groups on the same tab:

```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ CARD: Details      │  │ CARD: Credit Ctrl  │  │ CARD: Credit Set.  │
│  - Field 1         │  │  - Field A         │  │  - Field X         │
│  - Field 2         │  │  - Field B         │  │  - Field Y         │
│  [Edit]            │  │                    │  │  [Edit]            │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

**Tailwind:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

#### 5.2 Full-Width Card
Used for settings that span full width or contain tables:

```
┌──────────────────────────────────────────────────────────────────────┐
│ CARD: Ingress Options                                                │
│  - Address Type: [Transport ▾]                                       │
│  - Max CPS: [100] ☐ Unlimited                                        │
│  - Test System Control: [Allow ▾]                                    │
│  [Edit] [Save]                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

#### 5.3 Card with Embedded Table
Used for lists within a tab (IP addresses, contacts, services):

```
┌──────────────────────────────────────────────────────────────────────┐
│ CARD: IP Addresses                                    [+ Add IP]     │
├──────────────────────────────────────────────────────────────────────┤
│ IP Address      │ Type       │ Range End  │ Active │ Actions        │
│ ──────────────────────────────────────────────────────────────────── │
│ 192.168.1.1     │ Transport  │ -          │ ✓      │ Edit | Delete  │
│ 192.168.1.100   │ Media      │ .200       │ ✓      │ Edit | Delete  │
└──────────────────────────────────────────────────────────────────────┘
```

### 6. Edit/Save Interaction Pattern

All cards follow the same interaction pattern:

| State | UI | Actions Available |
|-------|----|--------------------|
| **View Mode** | Fields display as read-only text | [Edit] button visible |
| **Edit Mode** | Fields become input controls | [Save] [Cancel] buttons visible |
| **Saving** | Inputs disabled, spinner on Save | None |
| **Error** | Toast with error, stay in Edit mode | [Save] [Cancel] still available |

**Implementation:**
```tsx
const [isEditing, setIsEditing] = useState(false);

// View mode: Display values
// Edit mode: Show form controls
// Save: mutation.mutate() → on success exit edit mode, on error stay in edit mode
```

### 7. Dropdown-Dependent Settings

When a dropdown selection changes other visible fields:

```
┌──────────────────────────────────────────────────────────────────────┐
│ CARD: Credit Settings                                                │
│                                                                      │
│  Credit Type: [Prepaid ▾]          ← This controls fields below     │
│                                                                      │
│  ─── When Prepaid ───                ─── When Postpaid ───           │
│  Balance Warning: [100]              Credit Limit: [5000]            │
│  Low Balance Alert: [✓]              Invoice Frequency: [Monthly ▾]  │
│                                      Payment Terms: [Net 30]         │
└──────────────────────────────────────────────────────────────────────┘
```

**Implementation:** Conditional field rendering based on dropdown value.

### 8. List-to-Detail Navigation

When a tab contains a sub-entity list (e.g., Interconnects tab on Carrier Detail):

1. **Display:** DataTable with columns relevant to sub-entity
2. **Add Action:** Button in card header opens Add dialog/modal
3. **Row Click:** Clicking entity name navigates to Level 3 detail page
4. **Actions Column:** Edit, Delete, Duplicate per row

### 9. Complete Flow Example

```
/admin/softswitch/carriers
├── [+ Add Carrier] button → Opens Add Carrier dialog
├── DataTable showing all carriers
└── Click "Carrier A" name
    ↓
/admin/carriers/carrier-uuid-123
├── Tab 1: Carrier Details (3-column cards)
├── Tab 2: Interconnects
│   └── [+ Add Interconnect] → Opens Add dialog
│   └── DataTable of interconnects
│   └── Click "IC-Main" name
│       ↓
│       /admin/carriers/carrier-uuid-123/interconnects/ic-uuid-456
│       ├── Tab 1: Details (capacity, status cards)
│       ├── Tab 2: Services (for Customer direction only)
│       │   └── [+ Add Service] → Opens Add Service dialog
│       ├── Tab 3: Ingress Validation (Call Validation + IP Addresses cards)
│       ├── Tab 4: Ingress Translation
│       ├── Tab 5: Media (Codecs table + Media Settings cards)
│       └── Tab 6: Signalling
├── Tab 3: Contact Details
├── Tab 4: Accounting Details
└── Tab 5: Credit Alerts
```

### 10. Reuse This Pattern For

This Digitalk pattern applies to all hierarchical entity management:
- **Softswitch:** Carriers → Interconnects → Services
- **Rating:** Rate Cards → Rate Entries
- **Routing:** Routing Plans → Routes
- **DIDs:** DID Groups → DID Numbers
- **Trunk Groups:** Groups → Member Interconnects

---

## System Status Page (Monitoring & Alerting)

### Purpose (Non-Negotiable)

System Status is the single pane of glass for:
- "Is the platform up?"
- "Is it fast?"
- "What is slowing it down (API vs DB vs Redis vs DataQueue vs integrations vs frontend)?"
- "What broke, when, and what changed?"
- "Is each portal healthy? Is the marketing site healthy?"

It must work for:
- Super Admin portal
- Customer portals
- Marketing website
- All integrations
- Background jobs

**Access**: super_admin only

### Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: System Status                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ● GREEN/YELLOW/RED │ Last updated: HH:MM:SS UTC │ [Live ●] │ [Refresh Now] │ [Acknowledge All] │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Performance] [Health] [API] [Database] [Jobs] [Cache] [Integrations] [Portals] [Alerts] [Audit] │
├─────────────────────────────────────────────────────────────────────────────┤
│ TAB CONTENT AREA                                                             │
│ - Top: 4-8 KPI Cards with sparklines                                         │
│ - Bottom: Data tables with details                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Global Status Rule (GREEN/YELLOW/RED)

Compute overall state using the worst of:
- Health state
- Performance budgets
- Queue stuck/critical
- Error rate
- Integration down

**Status Logic:**
- **RED**: Any Critical alert active (unacknowledged) OR core dependency down
- **YELLOW**: Any Warning budget breach active
- **GREEN**: Otherwise

### Auto-Refresh Behavior (Mandatory)

**Live Mode (default ON):**
- Auto-refresh UI every 30 seconds
- Show "Live" toggle (On/Off) + "Last updated (UTC)" timestamp
- If Live Off, stop auto-refresh and show "Paused"

**Snapshot Source:**
- Metrics snapshots produced by DataQueue Metrics Collector job every 60 seconds
- UI pulls latest snapshot from DB (plus optional lightweight live pings)
- UI must never run heavy collection work directly

**UI Rules:**
- Each KPI card shows "as of <timestamp>"
- If latest snapshot >2 minutes old: yellow "Stale data" banner
- If >5 minutes old: red "Data collection stalled" banner + trigger alert

**Manual Controls:**
- "Refresh now" forces immediate snapshot reload
- "Run health checks now" triggers lightweight live checks

**Performance:**
- Do not refresh faster than 30 seconds
- Pause auto-refresh when tab not visible

### Tab 1: Overview

**KPI Cards (4-8):**
- Overall status (Green/Yellow/Red)
- API p95 latency (15m) with sparkline
- DB query p95 latency (15m) with sparkline
- 5xx rate (15m)
- DataQueue oldest job heartbeat age
- Redis p95 latency (15m)
- CDR freshness (last ingest UTC)
- Active alerts count (Critical/Warning)

**Below KPIs:**
- "What's wrong right now?" section
- Active alerts grouped by severity
- "Top 5 slow endpoints" list
- "Top 5 slow DB queries" list

### Tab 2: Performance Budgets (SLO)

Each budget displayed as a row with:
- Metric name
- Target threshold
- Current p95/p99
- Breach status (green/yellow/red)
- Window (5m / 15m)
- Breach duration

**Portal UX Budgets:**
| Metric | p95 Target | p99 Target |
|--------|------------|------------|
| Route transition (cached) | ≤150ms | ≤300ms |
| Route transition (uncached) | ≤900ms | ≤1500ms |
| First interactive after login | ≤1200ms | ≤2000ms |
| Create/update server confirm | ≤350ms | ≤700ms |

**API Budgets:**
| Metric | p95 Target | p99 Target |
|--------|------------|------------|
| List endpoints | ≤120ms | ≤250ms |
| Detail endpoints | ≤180ms | ≤350ms |
| 5xx rate | Warning ≥0.3% (15m) | Critical ≥1% (5m) |

**Database Budgets:**
| Metric | Warning | Critical |
|--------|---------|----------|
| Query latency p95 | ≤60ms | ≤150ms |
| Slow queries (>200ms count) | threshold exceeded | repeated >500ms |
| Pool saturation | ≥70% | ≥90% |

**Redis Budgets:**
| Metric | Warning | Critical |
|--------|---------|----------|
| p95 latency | >30ms | >100ms |

**R2 Budgets:**
| Metric | Warning | Critical |
|--------|---------|----------|
| p95 latency | >300ms | >1000ms |

**DataQueue Budgets:**
| Metric | Warning | Critical |
|--------|---------|----------|
| Heartbeat interval | every 30s required | - |
| Stuck job (no heartbeat) | 3m | 10m |
| Backlog | >500 jobs for 15m | >2000 jobs for 15m |

**Freshness Budgets:**
| Metric | Warning | Critical |
|--------|---------|----------|
| CDR ingested | >10m | >30m |
| FX update | >2h | >6h |

### Tab 3: Health Checks

Table columns:
- Component
- Status (pass/fail)
- Latency (ms)
- Last checked (UTC)
- Failure reason (if any)

**Required Health Checks:**
- API health (/api/health)
- Postgres ping latency
- Redis ping latency
- R2 head/list latency
- DataQueue worker alive (heartbeat)
- ConnexCS API health
- Brevo health
- NOWPayments webhook receiver health
- Ayrshare health
- Marketing website health (HTTP check)
- Portal frontend health (static asset check)

### Tab 4: API & Errors

**KPI Cards:**
- Total requests/min
- p95 latency
- 5xx rate
- 4xx rate
- Top endpoints by traffic

**Tables:**
- Top 20 slow endpoints (p95)
- Top 20 error endpoints (5xx)
- Largest payload endpoints (top 10 response size KB)
- Recent error samples (message + stack hash)

### Tab 5: Database

**KPI Cards:**
- Query p95/p99
- Connections used / pool size
- Pool saturation %
- Slow query count

**Tables:**
- Top slow queries list (fingerprinted)
- Top tables by read/write volume (if available)
- Index health checks / missing index warnings

### Tab 6: DataQueue Jobs

**KPI Cards:**
- Queued jobs
- Running jobs
- Failed jobs (15m / 24h)
- Oldest job age
- Stuck job count

**Tables:**
- Queue depth by job type
- Failed jobs list (jobId, type, tenant, reason, attempts, last log)
- Stuck jobs list (no heartbeat)

### Tab 7: Cache & Storage (Redis + R2)

**Redis KPIs:**
- p95 latency
- Cache hit rate (permissions, counters, summaries)
- Rate-limit rejections count

**R2 KPIs:**
- Upload/download errors
- p95 health latency
- Last export/import file processed

**Tables:**
- Cache hit/miss breakdown by cache key family
- Largest cached entries detection (>10KB = warning)

### Tab 8: Integrations

Each integration row:
- Status (healthy/degraded/down)
- p95 latency
- Error rate
- Last successful call (UTC)
- Last failure reason

**Integrations to Monitor:**
- ConnexCS
- Brevo
- NOWPayments
- Ayrshare
- OpenExchangeRates
- OpenAI (optional)

### Tab 9: Portals

Monitor each portal separately:
- Super Admin portal health + route performance
- Customer portal health + route performance
- Marketing site health (latency + uptime)

**Per Portal Metrics:**
- Last successful page load sample
- Route transition p95
- JS error count
- Asset load failures

**Fallback (if no frontend instrumentation):**
- Server-rendered page health checks
- Static asset availability
- API latency used by that portal

### Tab 10: Alerts

Table columns:
- Severity (Critical/Warning/Info)
- Source (API/DB/Redis/Job/Integration/Portal)
- Title
- Description
- First seen (UTC)
- Last seen (UTC)
- Current status (active/resolved)
- Acknowledged by + at
- Actions: Acknowledge / Snooze / View details

### Tab 11: Audit / Changes

Display:
- Recent deployments/restarts
- Schema migrations applied
- Config changes (if tracked)
- Recent super-admin actions (from audit table)

**Purpose:** Correlate "it got slow after X"

### Sidebar Widget

**Location:** Primary sidebar, below main navigation

**Display:**
- System Status icon + label
- Alert count badge next to label:
  - If alerts > 0: Red badge with count number
  - If everything healthy: Green badge (checkmark or "OK")
- Shows current global status color

**Behavior:**
- Clicking navigates to /admin/system-status
- Badge updates in real-time (polls with same 30s interval)

---

## Module Map (Atlas)

Generated from repo reality (2026-01-15). This is the authoritative reference for all modules, routes, endpoints, and tables.

### PART 1: Module Index (UI-Level)

#### Super Admin Portal Modules (17 Primary Sidebar Items)

| Module | Surface | Default Route | API Namespace(s) | Key DB Tables | Main TSX Page | Size | Endpoints | Value | Risk Tags |
|--------|---------|---------------|------------------|---------------|---------------|------|-----------|-------|-----------|
| **Dashboard** | Super Admin | `/admin` | `/api/admin/sidebar-counts`, `/api/admin/*` | `auditLogs`, `metricsSnapshots` | `admin/index.tsx` | 25KB | 5 | High | - |
| **VoIP** | Super Admin | `/admin/pops` | `/api/pops`, `/api/voice-tiers`, `/api/codecs`, `/api/routes` | `pops`, `voiceTiers`, `codecs`, `routes` | (multiple) | - | 20+ | High | Integrations |
| **Wholesale** | Super Admin | `/admin/wholesale/partners` | `/api/carriers`, `/api/customers` | `carriers`, `customers`, `carrierInterconnects` | `admin/partners.tsx` | 30KB | 17 | High | Multi-tenant |
| **Rate Cards** | Super Admin | `/admin/rate-cards/customer` | `/api/rate-cards/*` | `rateCards`, `rateCardRates` | `admin/rate-cards.tsx` | 49KB | 8 | High | BigData, HeavyQueries |
| **DID** | Super Admin | `/admin/did-countries` | `/api/did-*` | `didCountries`, `didProviders`, `dids` | (multiple) | - | 10+ | Med | Integrations |
| **Customers** | Super Admin | `/admin/customers` | `/api/customers`, `/api/kyc/*` | `customers`, `customerKyc`, `customerCategories`, `customerGroups` | `admin/billing/customers.tsx` | 24KB | 12 | High | Multi-tenant |
| **Billing** | Super Admin | `/admin/invoices` | `/api/invoices`, `/api/payments`, `/api/currencies` | `invoices`, `payments`, `currencies`, `ledgerEntries` | (multiple) | - | 15+ | High | Payments, BigData |
| **Marketing** | Super Admin | `/admin/social-accounts` | `/api/social-accounts`, `/api/social-posts`, `/api/email-templates` | `socialAccounts`, `socialPosts`, `emailTemplates` | (multiple) | - | 18 | Med | Integrations (Ayrshare/Brevo) |
| **Monitoring** | Super Admin | `/admin/metrics` | `/api/alerts`, `/api/monitoring-rules` | `alerts`, `monitoringRules`, `routeMetrics` | (multiple) | - | 8 | Med | - |
| **SIP Tester** | Super Admin | `/admin/sip-tester/new` | `/api/sip-tests/*`, `/api/sip-test-*` | `sipTestConfigs`, `sipTestResults`, `sipTestRuns` | `admin/sip-tester.tsx` | 60KB | 25+ | Med | Integrations (Twilio/Spearline) |
| **AI Voice** | Super Admin | `/admin/ai-voice/dashboard` | `/api/ai-voice/*`, `/api/admin/ai-voice/*` | `aiVoiceAgents`, `aiVoiceCampaigns`, `aiVoiceCallLogs` | `admin/ai-voice-agents.tsx` | 26KB | 15+ | High | AI, Integrations |
| **Softswitch** | Super Admin | `/admin/softswitch/carriers` | `/api/softswitch/*`, `/api/carriers/*`, `/api/interconnects/*` | `carriers`, `carrierInterconnects`, `carrierServices`, `supplierRatingPlans`, `customerRatingPlans` | `admin/softswitch.tsx` | 41KB | 40+ | High | BigData, HeavyQueries, Multi-tenant |
| **Experience** | Super Admin | `/admin/experience-manager` | `/api/em/*`, `/api/cms/*` | `emContentItems`, `cmsPages`, `cmsThemes` | `admin/em-component-library.tsx` | 126KB | 20+ | Med | - |
| **Admin** | Super Admin | `/admin/admin-users` | `/api/admin-users`, `/api/audit-logs` | `users`, `auditLogs`, `tickets` | (multiple) | - | 10 | High | Security |
| **Global Settings** | Super Admin | `/admin/global-settings/platform` | `/api/settings/*`, `/api/integrations`, `/api/az-destinations/*` | `platformSettings`, `integrations`, `azDestinations` | `admin/global-settings.tsx` | 56KB | 20+ | High | Integrations |
| **Settings** | Super Admin | `/admin/settings/general` | `/api/settings/*` | `platformSettings` | (multiple) | - | 5 | Low | - |
| **System Status** | Super Admin | `/admin/system-status` | `/api/system/*` | `systemAlerts`, `integrationHealth`, `jobMetrics` | `admin/system-status.tsx` | 52KB | 17 | High | - |

#### Customer Portal Modules (11 Primary Sidebar Items)

| Module | Surface | Default Route | API Namespace(s) | Key DB Tables | Main TSX Page | Endpoints | Value | Risk Tags |
|--------|---------|---------------|------------------|---------------|---------------|-----------|-------|-----------|
| **Dashboard** | Customer | `/portal` | `/api/my/*` | `customers` | `portal/index.tsx` | 5 | High | Multi-tenant |
| **Voice** | Customer | `/portal/voice/trunks` | `/api/my/trunks` | `sipTrunks` | - | 5 | High | Multi-tenant |
| **DIDs** | Customer | `/portal/dids/inventory` | `/api/my/dids` | `dids` | - | 5 | High | Multi-tenant |
| **Cloud PBX** | Customer | `/portal/pbx/extensions` | `/api/my/extensions`, `/api/my/ivrs`, `/api/my/ring-groups`, `/api/my/queues` | `extensions`, `ivrs`, `ringGroups`, `queues` | - | 15 | Med | Multi-tenant |
| **AI Agent** | Customer | `/portal/ai-agent/personas` | `/api/my/ai-voice/*` | `aiVoiceAgents`, `aiVoiceTrainingData` | `portal/ai-agents.tsx` | 46KB | 15+ | AI, Multi-tenant |
| **SIP Tester** | Customer | `/portal/sip-tester/tests` | `/api/my/sip-tests/*` | `sipTestRuns` | `portal/sip-tester.tsx` | 39KB | 8 | Med | Multi-tenant |
| **Class 4** | Customer | `/portal/class4/rate-cards` | `/api/my/class4/*` | `class4CustomerRateCards`, `class4Cdrs` | - | 10 | High | BigData, Multi-tenant |
| **Developers** | Customer | `/portal/developers/api-keys` | `/api/my/api-keys`, `/api/my/webhooks` | `customerApiKeys`, `webhooks` | `portal/api-webhooks.tsx` | 25KB | 10 | Med | Multi-tenant |
| **Billing** | Customer | `/portal/billing` | `/api/my/invoices`, `/api/my/payments` | `invoices`, `payments` | - | 8 | High | Payments, Multi-tenant |
| **Support** | Customer | `/portal/support` | `/api/my/tickets` | `tickets`, `ticketReplies` | - | 5 | Med | Multi-tenant |
| **Settings** | Customer | `/portal/settings` | `/api/my/profile` | `customers` | - | 3 | Low | Multi-tenant |

### PART 2: Backend Module Map (Code-Level)

> **Atlas Freshness Note**: Last updated 2026-01-15 00:46 UTC | Last MOD included: MOD-07 | routes.ts: 8997 lines

#### Extracted Route Modules (server/routes/*.ts)

| Module File | Lines | Endpoints | Endpoint Types | Heavy Handlers | Middleware Coverage |
|-------------|-------|-----------|----------------|----------------|---------------------|
| `system-status.routes.ts` | 690 | 17 | list, detail, command | Health checks, performance metrics | Verified: auth guard present |
| `auth.routes.ts` | 183 | 4 | command | OIDC login/logout | Public by design |
| `jobs.routes.ts` | 187 | 13 | list, command | Job stats, retry operations | Unknown (needs verification) |
| `files.routes.ts` | 180 | 13 | CRUD, list | File template uploads | Verified: auth guard present |
| `az-destinations.routes.ts` | 443 | 11 | CRUD, bulk, list | Bulk import, CSV export | Verified: auth guard present |
| `dids.routes.ts` | 181 | 13 | CRUD, list | DID countries, providers, inventory | Verified: auth guard present |
| `sip-tester.routes.ts` | 822 | 39 | CRUD, command, list | Test configs, runs, suppliers, numbers | Verified: auth guard present |
| **index.ts** | 26 | - | Aggregator | - | - |

#### Remaining in routes.ts (8997 lines)

| Section (Line Range) | Endpoints Est. | Type | Notes |
|---------------------|----------------|------|-------|
| **Referral System** (475-548) | 5 | CRUD | Low complexity |
| **Customer Branding** (549-653) | 4 | CRUD | Tenant-scoped |
| **Customer Support Tickets** (654-791) | 6 | CRUD | Tenant-scoped |
| **Customer AI Voice** (792-1313) | 25+ | CRUD, list | Complex, AI integration |
| **CRM Integrations** (1314-1619) | 15+ | CRUD, sync | Integration-heavy |
| **Customer PBX** (1620-2085) | 20+ | CRUD | Extensions, IVRs, Ring Groups, Queues |
| **Customer CDR Exports** (2322-2454) | 3 | list, export | BigData potential |
| **Customer Class 4** (2367-2574) | 8 | CRUD | BigData potential |
| **Customer Webhooks/API Keys** (2575-2789) | 8 | CRUD | Tenant-scoped |
| **Promo Codes/Bonuses** (2790-3444) | 20+ | CRUD, validate | Complex validation |
| **Customer Categories/Groups** (3445-3611) | 10 | CRUD | Low complexity |
| **Supplier Import Templates** (3550-3734) | 5 | CRUD | Template management |
| **Billing Terms** (3612-3734) | 6 | CRUD | Low complexity |
| **Customers/KYC/Invoices/Payments** (3735-4179) | 20+ | CRUD, list | Multi-tenant, pagination |
| **ConnexCS Sync** (4900-5400) | 25+ | sync, import | Integration-heavy, BigData |
| **Carriers/Interconnects** (5300-6640) | 30+ | CRUD, list | Heavy queries, cursor pagination |
| **Rating Plans** (5800-6400) | 15+ | CRUD, list | BigData, rates tables |
| **CDR** (8652-8777) | 5 | list, export | BigData (cursor pagination implemented) |
| **Period Exceptions** (9185-9429) | 8 | CRUD, sync | Moderate |
| **Experience Manager** (9430-9747) | 15 | CRUD, scan | Moderate |
| **Testing Engine** (9748-9922) | 10 | CRUD, run | E2E test execution |

### PART 3: Performance Hotspots

#### Top 10 Largest TSX Pages

| Rank | File | Size | Risk Assessment |
|------|------|------|-----------------|
| 1 | `admin/interconnect-detail.tsx` | 174 KB | Extreme - needs splitting, 6-9 tabs |
| 2 | `admin/em-component-library.tsx` | 126 KB | High - component showcase |
| 3 | `admin/softswitch-rating.tsx` | 124 KB | Extreme - rates data-heavy |
| 4 | `admin/carrier-detail.tsx` | 121 KB | Extreme - 5 tabs, nested entities |
| 5 | `admin/softswitch-rating-plan-detail.tsx` | 87 KB | High - rates table |
| 6 | `admin/sip-tester.tsx` | 60 KB | Moderate |
| 7 | `admin/import-template-wizard.tsx` | 58 KB | High - file processing |
| 8 | `admin/global-settings.tsx` | 56 KB | Moderate - multiple tabs |
| 9 | `admin/system-status.tsx` | 52 KB | Moderate - many data sources |
| 10 | `admin/rate-cards.tsx` | 49 KB | High - rates data-heavy |

#### Top 10 Heavy Endpoint Groups (Scale Risk)

| Rank | Namespace | Why Heavy | Current Mitigations |
|------|-----------|-----------|---------------------|
| 1 | `/api/softswitch/rating/*` | Rates tables (100K+ rows potential) | Cursor pagination, limits |
| 2 | `/api/rate-cards/*` | Provider/customer rates | Pagination, staleTime |
| 3 | `/api/cdrs`, `/api/my/cdrs` | CDR records (millions) | Cursor pagination, date range required |
| 4 | `/api/admin/connexcs/*` | Sync operations, imports | DataQueue batching |
| 5 | `/api/az-destinations/*` | 10K+ destinations | Pagination, bulk import via job |
| 6 | `/api/carriers/*` | Nested interconnects, services | Cursor pagination |
| 7 | `/api/customers/*` | Multi-tenant list | Cursor pagination |
| 8 | `/api/period-exceptions/*` | Auto-sync with AZ | Moderate risk |
| 9 | `/api/invoices/*` | Historical invoices | Pagination |
| 10 | `/api/sip-tests/results/*` | Test result logs | Limits enforced |

#### Endpoints Returning Nested Data (Red Flags)

| Endpoint | Nested Data | Status |
|----------|-------------|--------|
| `/api/carriers/:id` | Includes interconnects, contacts, alerts | Lazy load tabs |
| `/api/interconnects/:id` | Includes services, IP addresses, settings | Lazy load tabs |
| `/api/softswitch/rating/supplier-plans/:id` | Includes rates (large) | Paginated separately |
| `/api/my/ai-voice/agents/:id` | Includes training data, flows | Lazy load |

### PART 4: Actionable Guidance Summary

#### Next 3 Route Extractions (MOD-06, MOD-07, MOD-08)

**Note**: MOD tasks = route-module extractions to new files in `server/routes/`, NOT feature themes.

| Task ID | Target File | URL Namespaces | Endpoints | Source Lines | Why Low-Risk |
|---------|-------------|----------------|-----------|--------------|--------------|
| **MOD-06** | `dids.routes.ts` | `/api/did-countries`, `/api/did-providers`, `/api/dids` | 13 | 6976-7016, 8780-8910 | Simple CRUD, no heavy queries, no external integrations, self-contained domain |
| **MOD-07** | `sip-tester.routes.ts` | `/api/sip-tests/*`, `/api/sip-test-suppliers`, `/api/sip-test-settings`, `/api/sip-test-runs`, `/api/sip-test-numbers` | 24 | 7191-7492 | Contiguous block (~300 lines), minimal cross-dependencies; pagination/max-limit rules still apply; MOD extraction preserves existing behavior; enforcement and pagination hardening happens in Heavy Endpoint Redesign phase |
| **MOD-08** | `billing.routes.ts` | `/api/invoices` (GET), `/api/payments` (GET), `/api/fx-rates`, `/api/billing-terms` (GET) | 11 | 3614-3634, 3954-4040, 7160-7190 | Read-only endpoints only (GET), no mutations, no ledger writes, low blast radius |

**Order justification**: DIDs first (smallest, most isolated), then SIP Tester (contiguous block), then billing read-only (scattered but safe reads).

#### Next 3 Heavy Endpoint Redesign Candidates

| Rank | Endpoint Path | Current Issue | Data Scale | Proposed Fix |
|------|---------------|---------------|------------|--------------|
| 1 | `/api/softswitch/rating/supplier-plans/:id/rates` | Returns all rates for plan | 100K+ rows potential | Add cursor pagination + limit enforcement (max 100) |
| 2 | `/api/carriers/:id` | Returns nested interconnects, contacts, alerts in single response | 10-50 nested entities | Split to `/api/carriers/:id/interconnects` separate endpoint, lazy load tabs |
| 3 | `/api/rate-cards/:id/rates` | Large rate lists unbounded | 50K+ rates per card | Add prefix search filter + cursor pagination (BigData risk) |

#### Next 3 Fast Tabs Refactors

| Rank | Page Path | Size | Issue | Fix |
|------|-----------|------|-------|-----|
| 1 | `client/src/pages/admin/interconnect-detail.tsx` | 174KB | All 6-9 tabs load data on mount, heavy nested queries | Per-tab `enabled: activeTab === 'x'` flag + React.lazy code splitting |
| 2 | `client/src/pages/admin/carrier-detail.tsx` | 121KB | 5 tabs fetch nested entities simultaneously | Tab-specific queries with staleTime, virtualization for interconnects list |
| 3 | `client/src/pages/admin/softswitch-rating.tsx` | 124KB | Rates table loads all rows, no virtualization | @tanstack/react-virtual for table rows + infinite scroll pagination |

---

### Database Tables (179 Total)

#### Core Business (35 tables)
`users`, `sessions`, `loginHistory`, `customers`, `customerKyc`, `customerCategories`, `customerGroups`, `carriers`, `carrierInterconnects`, `carrierServices`, `serviceMatchLists`, `carrierContacts`, `carrierCreditAlerts`, `carrierAssignments`, `interconnectIpAddresses`, `interconnectValidationSettings`, `interconnectTranslationSettings`, `interconnectCodecs`, `interconnectMediaSettings`, `interconnectSignallingSettings`, `interconnectMonitoringSettings`, `customerRatingPlans`, `customerRatingPlanRates`, `supplierRatingPlans`, `supplierRatingPlanRates`, `businessRules`, `billingTerms`

#### VoIP Infrastructure (20 tables)
`pops`, `popAssignments`, `voiceTiers`, `voiceTierAssignments`, `codecs`, `codecAssignments`, `channelPlans`, `channelPlanAssignments`, `routes`, `routeAssignments`, `routeGroups`, `routeGroupAssignments`, `rateCards`, `rateCardRates`, `rateCardAssignments`, `supplierImportTemplates`, `monitoringRules`, `monitoringConditions`, `monitoringActions`, `alerts`

#### DID/PBX (15 tables)
`didCountries`, `didCountryAssignments`, `didProviders`, `didProviderAssignments`, `dids`, `sipTrunks`, `extensions`, `ivrs`, `ivrOptions`, `ringGroups`, `ringGroupMembers`, `queues`, `queueAgents`, `voicemails`, `callRecordings`

#### Billing/Payments (15 tables)
`payments`, `invoices`, `invoiceItems`, `referrals`, `referralClicks`, `promoCodes`, `promoCodeAssignments`, `bonusTypes`, `bonusTypeAssignments`, `currencies`, `fxRates`, `customerCurrencySettings`, `ledgerEntries`, `currencyReconciliations`

#### AI Voice (15 tables)
`aiVoiceAgents`, `aiVoiceFlows`, `aiVoiceTrainingData`, `aiVoiceCampaigns`, `aiVoiceCallLogs`, `aiVoiceRateConfigs`, `aiVoicePricingTiers`, `aiVoiceKnowledgeBases`, `aiVoiceKbSources`, `aiVoicePhonebooks`, `aiVoiceContacts`, `aiVoiceTemplates`, `aiVoiceUsage`, `aiVoiceAssignments`, `aiVoiceSettings`, `aiVoiceWebhooks`

#### SIP Testing (12 tables)
`sipTestConfigs`, `sipTestSchedules`, `sipTestResults`, `sipTestSyncPermissions`, `sipTestAlerts`, `sipTestAudioFiles`, `sipTestNumbers`, `sipTestRuns`, `sipTestRunResults`, `sipTestProfiles`, `sipTestSuppliers`, `sipTestSettings`

#### Class 4 Softswitch (9 tables)
`class4Customers`, `class4Carriers`, `class4ProviderRateCards`, `class4ProviderRates`, `class4CustomerRateCards`, `class4CustomerRates`, `class4LcrRules`, `class4RoutingRules`, `class4Cdrs`

#### CRM/CMS/Marketing (20 tables)
`crmConnections`, `crmFieldMappings`, `crmSyncSettings`, `crmSyncLogs`, `crmContactMappings`, `cmsPortals`, `cmsThemes`, `cmsPages`, `cmsMenus`, `cmsMediaLibrary`, `tenantBranding`, `portalLoginPages`, `siteSettings`, `websiteSections`, `docCategories`, `docArticles`, `emailTemplates`, `emailLogs`, `socialAccounts`, `socialPosts`

#### System/Monitoring (25 tables)
`fileTemplates`, `tickets`, `ticketReplies`, `aiAgentActions`, `pcapAnalysis`, `contentAssets`, `auditLogs`, `configVersions`, `trash`, `platformSettings`, `devTests`, `e2eRuns`, `e2eResults`, `emContentItems`, `emContentVersions`, `emValidationResults`, `emPublishHistory`, `cdrs`, `webhooks`, `webhookDeliveries`, `customerApiKeys`, `azDestinations`, `periodExceptions`, `periodExceptionHistory`, `integrations`

#### ConnexCS Sync (13 tables)
`connexcsSyncLog`, `connexcsSyncJobs`, `connexcsEntityMap`, `connexcsImportCustomers`, `connexcsImportCarriers`, `connexcsImportRateCards`, `connexcsImportCdrs`, `connexcsSyncLogs`, `connexcsImportRoutes`, `connexcsImportBalances`, `connexcsImportScripts`, `connexcsCdrSyncState`, `connexcsCdrStats`

#### Metrics/Health (10 tables)
`metricsSnapshots`, `systemAlerts`, `integrationHealth`, `jobMetrics`, `portalMetrics`, `auditRecords`, `moduleRegistry`, `routeMetrics`

---

*End of Module Atlas*
