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
