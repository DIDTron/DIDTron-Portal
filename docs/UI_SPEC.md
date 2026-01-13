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
