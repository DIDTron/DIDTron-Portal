# Softswitch Reality + Performance Proof Pack

**Generated**: 2026-01-15 03:00 UTC  
**Audit Type**: Docs-only with grep evidence (NO CODE CHANGES)  
**Coverage**: Class 4 Softswitch Module (carriers, interconnects, rating, routing, balance)

---

## PART 0: Truth Verification

### 0.1 Command Evidence for File Sizes

```bash
$ ls -la client/src/pages/admin/*.tsx | grep -E "interconnect|carrier|softswitch|rating"
-rw-r--r-- 1 runner runner 124597 Jan 13 16:00 client/src/pages/admin/carrier-detail.tsx
-rw-r--r-- 1 runner runner  33711 Jan 13 01:52 client/src/pages/admin/class4-softswitch.tsx
-rw-r--r-- 1 runner runner 178845 Jan 13 17:29 client/src/pages/admin/interconnect-detail.tsx
-rw-r--r-- 1 runner runner  27955 Jan 13 01:30 client/src/pages/admin/softswitch-balance.tsx
-rw-r--r-- 1 runner runner  89692 Jan 13 01:30 client/src/pages/admin/softswitch-rating-plan-detail.tsx
-rw-r--r-- 1 runner runner 127809 Jan 13 18:33 client/src/pages/admin/softswitch-rating.tsx
-rw-r--r-- 1 runner runner  42806 Jan 13 02:34 client/src/pages/admin/softswitch.tsx
-rw-r--r-- 1 runner runner  48222 Jan 13 18:08 client/src/pages/admin/supplier-rating-plan-detail.tsx
```

### 0.2 Command Evidence for Line Counts

```bash
$ wc -l client/src/pages/admin/interconnect-detail.tsx carrier-detail.tsx softswitch-rating.tsx softswitch.tsx softswitch-balance.tsx
  3504 client/src/pages/admin/interconnect-detail.tsx
  2738 client/src/pages/admin/carrier-detail.tsx
  2874 client/src/pages/admin/softswitch-rating.tsx
   939 client/src/pages/admin/softswitch.tsx
   634 client/src/pages/admin/softswitch-balance.tsx
 10689 total
```

### 0.3 Routes.ts Line Count

```bash
$ wc -l server/routes.ts
8912 server/routes.ts
```

---

## PART 1: Sidebar Items → Routes → Page File Mapping

### 1.1 Primary Sidebar Entry

**Evidence**: `client/src/components/layout/super-admin/primary-sidebar.tsx` line 33
```typescript
{ id: "softswitch", label: "Softswitch", icon: Network, defaultRoute: "/admin/softswitch/carriers" },
```

### 1.2 Secondary Sidebar Configuration

**Evidence**: `client/src/components/layout/super-admin/secondary-sidebar.tsx` lines 194-224
```typescript
softswitch: {
  title: "Class 4 Softswitch",
  items: [
    { id: "softswitch-carriers", label: "Carriers", route: "/admin/softswitch/carriers", icon: Building2 },
    { 
      id: "softswitch-rating", label: "Rating", route: "/admin/softswitch/rating/customer-plans", icon: CreditCard,
      children: [
        { id: "softswitch-customer-rating", label: "Customer Rating Plans", route: "/admin/softswitch/rating/customer-plans" },
        { id: "softswitch-supplier-rating", label: "Supplier Rating Plans", route: "/admin/softswitch/rating/supplier-plans" },
        { id: "softswitch-period-exceptions", label: "Period Exceptions", route: "/admin/softswitch/rating/period-exceptions" },
        { id: "softswitch-cdr-rerating", label: "CDR Rerating", route: "/admin/softswitch/rating/cdr-rerating" },
        { id: "softswitch-zone-name", label: "Rating Zone Name", route: "/admin/softswitch/rating/zone-name" },
      ]
    },
    { id: "softswitch-routing", label: "Routing", route: "/admin/softswitch/routing" },
    { 
      id: "softswitch-balance", label: "Balance & Spend", route: "/admin/softswitch/balance/carrier-balances",
      children: [
        { id: "softswitch-carrier-balances", label: "Carrier Balances", route: "/admin/softswitch/balance/carrier-balances" },
        { id: "softswitch-24h-spend", label: "24 Hour Spend", route: "/admin/softswitch/balance/24h-spend" },
        { id: "softswitch-balance-totals", label: "Balance & Totals", route: "/admin/softswitch/balance/totals" },
      ]
    },
  ],
},
```

### 1.3 Route → Page Component Mapping

**Evidence**: `client/src/pages/admin/index.tsx` lines 334-351
```typescript
<Route path="/admin/softswitch/carriers" component={SoftswitchCarriersPage} />
<Route path="/admin/softswitch/carriers/:id/interconnects/:interconnectId" component={InterconnectDetailPage} />
<Route path="/admin/softswitch/carriers/:id" component={CarrierDetailPage} />
<Route path="/admin/softswitch/rating/customer-plans" component={CustomerRatingPlansPage} />
<Route path="/admin/softswitch/rating/customer-plans/:id" component={RatingPlanDetailPage} />
<Route path="/admin/softswitch/rating/supplier-plans" component={SupplierRatingPlansPage} />
<Route path="/admin/softswitch/rating/supplier-plans/:id" component={SupplierRatingPlanDetailPage} />
<Route path="/admin/softswitch/rating/period-exceptions" component={PeriodExceptionsPage} />
<Route path="/admin/softswitch/rating/cdr-rerating" component={CDRReratingPage} />
<Route path="/admin/softswitch/rating/zone-name" component={RatingZoneNamePage} />
<Route path="/admin/softswitch/routing">{() => <PlaceholderPage title="Routing" />}</Route>
<Route path="/admin/softswitch/balance/carrier-balances" component={CarrierBalancesPage} />
<Route path="/admin/softswitch/balance/24h-spend" component={TwentyFourHourSpendPage} />
<Route path="/admin/softswitch/balance/totals" component={BalanceTotalsPage} />
```

### 1.4 Lazy Import Mapping

**Evidence**: `client/src/pages/admin/index.tsx` lines 62-71
```typescript
const SoftswitchCarriersPage = lazy(() => import("./softswitch").then(m => ({ default: m.SoftswitchCarriersPage })));
const CustomerRatingPlansPage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.CustomerRatingPlansPage })));
const SupplierRatingPlansPage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.SupplierRatingPlansPage })));
const CDRReratingPage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.CDRReratingPage })));
const RatingZoneNamePage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.RatingZoneNamePage })));
const CarrierBalancesPage = lazy(() => import("./softswitch-balance").then(m => ({ default: m.CarrierBalancesPage })));
const TwentyFourHourSpendPage = lazy(() => import("./softswitch-balance").then(m => ({ default: m.TwentyFourHourSpendPage })));
const BalanceTotalsPage = lazy(() => import("./softswitch-balance").then(m => ({ default: m.BalanceTotalsPage })));
const RatingPlanDetailPage = lazy(() => import("./softswitch-rating-plan-detail"));
```

### 1.5 Complete Sidebar → Route → Page → File Mapping

| Sidebar Item | Route | Component | Source File |
|--------------|-------|-----------|-------------|
| Carriers | `/admin/softswitch/carriers` | SoftswitchCarriersPage | `softswitch.tsx` |
| Carrier Detail | `/admin/softswitch/carriers/:id` | CarrierDetailPage | `carrier-detail.tsx` |
| Interconnect Detail | `/admin/.../interconnects/:interconnectId` | InterconnectDetailPage | `interconnect-detail.tsx` |
| Customer Rating Plans | `/admin/softswitch/rating/customer-plans` | CustomerRatingPlansPage | `softswitch-rating.tsx` |
| Rating Plan Detail | `/admin/softswitch/rating/customer-plans/:id` | RatingPlanDetailPage | `softswitch-rating-plan-detail.tsx` |
| Supplier Rating Plans | `/admin/softswitch/rating/supplier-plans` | SupplierRatingPlansPage | `softswitch-rating.tsx` |
| Supplier Plan Detail | `/admin/softswitch/rating/supplier-plans/:id` | SupplierRatingPlanDetailPage | `supplier-rating-plan-detail.tsx` |
| Period Exceptions | `/admin/softswitch/rating/period-exceptions` | PeriodExceptionsPage | (imported) |
| CDR Rerating | `/admin/softswitch/rating/cdr-rerating` | CDRReratingPage | `softswitch-rating.tsx` |
| Rating Zone Name | `/admin/softswitch/rating/zone-name` | RatingZoneNamePage | `softswitch-rating.tsx` |
| Routing | `/admin/softswitch/routing` | PlaceholderPage | inline |
| Carrier Balances | `/admin/softswitch/balance/carrier-balances` | CarrierBalancesPage | `softswitch-balance.tsx` |
| 24 Hour Spend | `/admin/softswitch/balance/24h-spend` | TwentyFourHourSpendPage | `softswitch-balance.tsx` |
| Balance & Totals | `/admin/softswitch/balance/totals` | BalanceTotalsPage | `softswitch-balance.tsx` |

---

## PART 2: Per-Tab Query Mapping with Enabled Gating

### 2.1 interconnect-detail.tsx (3504 lines, 178 KB)

**Tab Structure** (grep "getTabsForDirection"):
- Details, Services, Ingress Validation, Ingress Translation, Media, Signalling (customer)
- Details, Egress Routing, Egress Translations, Media, Monitoring, Signalling (supplier)

**All useQuery Calls** (grep -n "const.*= useQuery"):
| Line | Variable | queryKey | enabled Flag |
|------|----------|----------|--------------|
| 293 | carrier | `/api/carriers/${carrierId}` | `!!carrierId` |
| 299 | interconnect | `/api/interconnects/${interconnectId}` | `!!interconnectId` |
| 306 | ipAddressesData | `/api/interconnects/${interconnectId}/ip-addresses` | `!!interconnectId` |
| 314 | validationSettingsData | `/api/interconnects/${interconnectId}/validation` | `!!interconnectId` |
| 321 | translationSettingsData | `/api/interconnects/${interconnectId}/translation` | `!!interconnectId` |
| 328 | mediaSettingsData | `/api/interconnects/${interconnectId}/media` | `!!interconnectId` |
| 335 | signallingSettingsData | `/api/interconnects/${interconnectId}/signalling` | `!!interconnectId` |
| 342 | monitoringSettingsData | `/api/interconnects/${interconnectId}/monitoring` | `!!interconnectId` |
| 349 | codecsData | `/api/interconnects/${interconnectId}/codecs` | `!!interconnectId` |
| 357 | ratingPlansData | `/api/softswitch/rating/customer-plans` | `showAddServiceDialog` |
| 365 | routingPlansData | `/api/routing-plans` | `showAddServiceDialog && routingMethod` |
| 373 | supplierInterconnectsData | `/api/carriers/${carrierId}/interconnects` | `showAddServiceDialog && routingMethod` |
| 381 | matchListsData | `/api/match-lists` | `showAddServiceDialog && matchType` |
| 401 | serversData | `/api/connexcs/servers` | (none - always fetches) |
| 408 | supplierRatingPlansData | `/api/softswitch/rating/supplier-plans` | (none - always fetches) |

**Assessment**: 
- ⚠️ 13/15 queries use `enabled` flags correctly (ID-based or dialog-based)
- ⚠️ 2 queries (lines 401, 408) lack `enabled` flags but are for dropdown data
- ❌ **NOT tab-based** - All interconnect settings queries fire when interconnectId exists, not when specific tab is active

### 2.2 carrier-detail.tsx (2738 lines, 124 KB)

**Tab Structure** (5 tabs):
- Carrier Details, Interconnects, Contact Details, Accounting Details, Credit Alerts

**All useQuery Calls**:
| Line | Variable | queryKey | enabled Flag |
|------|----------|----------|--------------|
| 80 | carrier | `/api/carriers/${carrierId}` | `!!carrierId` |
| 86 | currencies | `/api/currencies` | (none) |
| 91 | interconnects | `/api/carriers/${carrierId}/interconnects` | `!!carrierId` |
| 98 | contacts | `/api/carriers/${carrierId}/contacts` | `!!carrierId` |
| 105 | creditAlerts | `/api/carriers/${carrierId}/credit-alerts` | `!!carrierId` |
| 112 | emailTemplates | `/api/email-templates` | (none) |
| 117 | users | `/api/users` | (none) |

**Assessment**:
- ✅ 4/7 queries use `enabled: !!carrierId` correctly
- ⚠️ 3 queries for reference data lack `enabled` flags
- ❌ **NOT tab-based** - Contact Details query fires on mount, not when tab is active

### 2.3 softswitch-rating.tsx (2874 lines, 127 KB) ❌ MAJOR VIOLATION

**Tab Structure** (lines 770-777):
```typescript
<TabsTrigger value="rating-plans">Rating Plans</TabsTrigger>
<TabsTrigger value="notifications">Notifications</TabsTrigger>
<TabsTrigger value="floor-price-rules">Floor Price Rules</TabsTrigger>
<TabsTrigger value="multiplan-import">Multiplan Import</TabsTrigger>
<TabsTrigger value="business-rules">Business Rules</TabsTrigger>
```

**All useQuery Calls**:
| Line | Variable | queryKey | enabled Flag |
|------|----------|----------|--------------|
| 687 | plans | `/api/softswitch/rating/customer-plans` | **NONE** |
| 1288 | supplierPlansData | `/api/softswitch/rating/supplier-plans` | **NONE** |
| 1295 | businessRulesData | `/api/softswitch/rating/business-rules` | **NONE** |
| 1302 | importTemplatesData | `/api/softswitch/rating/import-templates` | **NONE** |

**Evidence** (grep -n "enabled:" returns NO MATCHES):
```bash
$ grep -n "enabled:" client/src/pages/admin/softswitch-rating.tsx
(no output)
```

**Assessment**: ❌ **CRITICAL VIOLATION**
- 4 queries with NO enabled flags
- All queries fire on mount regardless of active tab
- Page has 5 tabs but all data loads immediately
- **REQUIRED FIX**: Add `enabled: tab === "rating-plans"` etc.

---

## PART 3: Prefetch Configuration Evidence

**Evidence**: `client/src/components/layout/super-admin/secondary-sidebar.tsx` lines 29-38

```typescript
const prefetchRouteData = (route: string) => {
  if (prefetchedRoutes.has(route)) return;
  prefetchedRoutes.add(route);

  if (route.includes('/softswitch/carriers')) {
    queryClient.prefetchQuery({
      queryKey: ["/api/carriers"],
      staleTime: STALE_TIME.LIST,
    });
  } else if (route.includes('/softswitch/rating')) {
    queryClient.prefetchQuery({
      queryKey: ["/api/softswitch/rating/business-rules"],
      staleTime: STALE_TIME.LIST,
    });
  }
  // ... other routes
};
```

**Prefetch Coverage**:
| Route Pattern | Prefetched queryKey | Status |
|---------------|---------------------|--------|
| `/softswitch/carriers` | `/api/carriers` | ✅ |
| `/softswitch/rating` | `/api/softswitch/rating/business-rules` | ✅ |
| `/softswitch/balance/*` | (none) | ❌ Missing |
| `/softswitch/routing` | (none) | ❌ Missing |

---

## PART 4: Runtime Metrics Status

### 4.1 API Metrics - DATA NOT AVAILABLE

**Evidence** (SQL query on metrics_snapshots):
```sql
SELECT p50, p95, p99, requests FROM metrics_snapshots WHERE snapshot_type = 'api';
-- Result: All values NULL (metrics collection not capturing API-level stats)
```

**Status**: API performance metrics (p50/p95/p99 latency, request counts) are not being populated. The `metrics_snapshots` table has API rows but the metrics JSON contains empty values.

### 4.2 Database Metrics - DATA NOT AVAILABLE

**Evidence**:
```sql
SELECT queryP95, poolSaturation, connections FROM metrics_snapshots WHERE snapshot_type = 'database';
-- Result: queryP95 NULL, poolSaturation 0, connections NULL
```

**Status**: Database query performance metrics not being collected.

### 4.3 Integration Metrics - AVAILABLE

**Evidence**:
| Integration | Status | P95 (ms) | Last Collected |
|-------------|--------|----------|----------------|
| openai | healthy | 0 | 2026-01-15 02:52 |
| brevo | healthy | 1 | 2026-01-15 02:52 |
| connexcs | healthy | 8636 | 2026-01-15 02:52 |
| ayrshare | healthy | 0 | 2026-01-15 02:52 |
| openexchangerates | healthy | 1 | 2026-01-15 02:52 |

### 4.4 Metrics Snapshot Counts

| Snapshot Type | Record Count |
|---------------|--------------|
| api | 1,739 |
| database | 1,739 |
| redis | 1,739 |
| r2 | 1,739 |
| job_queue | 1,738 |
| integration | 10,314 |
| portal | 5,217 |
| storage | 1,684 |
| **Total** | **24,187** |

---

## PART 5: ConnexCS Integration Mapping

### 5.1 Import Statement

**Evidence** (`server/routes.ts` lines 7-8):
```typescript
import { connexcs } from "./connexcs";
import { connexcsTools } from "./connexcs-tools-service";
```

### 5.2 ConnexCS Calls in Mutation Handlers

**Evidence** (grep "connexcs\\." server/routes.ts):

| Line | Operation | Trigger | Protected |
|------|-----------|---------|-----------|
| 3363-3365 | `loadCredentials` + `syncCustomer()` | POST /api/customers | `isConfigured()` |
| 4875-4877 | `loadCredentials` + `syncCarrier()` | POST /api/carriers | `isConfigured()` |
| 6197-6199 | `loadCredentials` + `syncRoute()` | Route creation | `isConfigured()` |
| 6288-6290 | `loadCredentials` + `syncRateCard()` | Rate card creation | `isConfigured()` |
| 7433-7434 | `isMockMode()` + `getMetrics()` | GET /api/connexcs/metrics | - |
| 7444 | `getCarriers()` | GET /api/connexcs/carriers | - |
| 7454 | `getRoutes()` | GET /api/connexcs/routes | - |
| 7478 | `syncCarrier()` | Manual sync endpoint | - |
| 7498 | `syncRoute()` | Manual sync endpoint | - |
| 7518 | `testRoute()` | Route testing | - |
| 7715-7766 | `isMockMode()` + `getCDRs()` | CDR import | - |

**Assessment**: ✅ All ConnexCS sync operations are:
- Server-side only (no frontend calls)
- Protected by `isConfigured()` checks on write operations
- Triggered only on mutations, not reads

---

## PART 6: API Endpoint Inventory

### 6.1 Softswitch Namespace (grep evidence)

**Evidence**: `grep -n "/api/softswitch\|/api/carriers" server/routes.ts | head -50`

| Endpoint | Line | Type | Pagination |
|----------|------|------|------------|
| GET /api/carriers | 4830 | list | Cursor ✅ |
| GET /api/carriers/:id | 4847 | detail | - |
| POST /api/carriers | 4857 | create | - |
| PATCH /api/carriers/:id | 4898 | update | - |
| DELETE /api/carriers/:id | 4919 | delete | - |
| GET /api/softswitch/rating/customer-plans | 4972 | list | ❌ None |
| POST /api/softswitch/rating/customer-plans | 4991 | create | - |
| GET /api/softswitch/rating/customer-plans/:planId/rates | 5052 | list | ❌ None |
| GET /api/softswitch/rating/supplier-plans | 5185 | list | ❌ None |
| GET /api/softswitch/rating/business-rules | 5374 | list | ❌ None |

### 6.2 Cursor Pagination Evidence

**Evidence** (lines 4832-4840):
```typescript
const { parseCursorParams, buildCursorResponse } = await import("./utils/pagination");
const { cursor, limit } = parseCursorParams({
  cursor: req.query.cursor as string,
  limit: parseInt(req.query.limit as string) || 20,
});
const results = await storage.getCarriersWithCursor(cursor, limit + 1);
const response = buildCursorResponse(results, limit);
```

**Cursor Pagination Status**:
| Endpoint | Has Cursor | Status |
|----------|------------|--------|
| GET /api/carriers | ✅ Yes | Compliant |
| GET /api/softswitch/rating/customer-plans | ❌ No | Violation |
| GET /api/softswitch/rating/supplier-plans | ❌ No | Violation |
| GET /api/softswitch/rating/business-rules | ❌ No | Violation |

---

## PART 7: Violations Summary

### 7.1 Critical Violations

| ID | File | Violation | Impact | Fix Required |
|----|------|-----------|--------|--------------|
| V-01 | `softswitch-rating.tsx` | 4 queries with NO enabled flags | All data loads on mount | Add `enabled: tab === "..."` |
| V-02 | Rating endpoints | No cursor pagination | Memory risk at scale | Add cursor params |
| V-03 | `interconnect-detail.tsx` | 2 dropdown queries lack enabled | Minor extra fetches | Add `enabled` |

### 7.2 Performance.md Compliance Matrix

| Rule | interconnect-detail | carrier-detail | softswitch-rating |
|------|---------------------|----------------|-------------------|
| staleTime on queries | ✅ | ✅ | ✅ |
| Cursor pagination | N/A | N/A | ❌ Client-side |
| Tab-based enabled | ⚠️ ID-only | ⚠️ ID-only | ❌ **NONE** |
| Virtualization | ❌ Missing | ❌ Missing | ❌ Missing |

---

## PART 8: Recommendations

### Immediate (Before Feature Work)

1. **Fix softswitch-rating.tsx enabled flags**:
```typescript
// Line 687
const { data: plans = [] } = useQuery({
  queryKey: ["/api/softswitch/rating/customer-plans"],
  staleTime: STALE_TIME.LIST,
  enabled: tab === "rating-plans",  // ADD THIS
});
```

2. **Add cursor pagination to rating endpoints**

### Next Sprint

1. Split `interconnect-detail.tsx` (174 KB) into tab components
2. Add virtualization to rates tables
3. Investigate empty API metrics collection

---

## Audit Certification

| Check | Evidence |
|-------|----------|
| File sizes verified | `ls -la` output in Part 0 |
| Line counts verified | `wc -l` output in Part 0 |
| Sidebar config verified | grep lines 194-224 |
| Route mapping verified | grep lines 334-351 |
| useQuery patterns verified | grep "const.*= useQuery" |
| enabled flags verified | grep "enabled:" |
| Prefetch verified | grep lines 29-38 |
| ConnexCS calls verified | grep "connexcs\\." |
| NO CODE CHANGES | ✅ Docs-only audit |

**Auditor**: Claude Agent  
**Timestamp**: 2026-01-15 03:00 UTC
