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
