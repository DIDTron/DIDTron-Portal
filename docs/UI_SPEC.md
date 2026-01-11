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
