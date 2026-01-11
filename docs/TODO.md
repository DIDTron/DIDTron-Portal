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

- [x] **T11**: Add Digitalk Layout Patterns section to docs/UI_SPEC.md
  - Files: `docs/UI_SPEC.md`
  - Acceptance: Documented 3-level navigation, URL structure, tab behavior, card layouts, edit/save patterns

---

## Phase 2: ConnexCS Sync Implementation

### Plan ID: PLAN-2026-01-11-02

**Objective**: Build bi-directional sync between DIDTron (source of truth) and ConnexCS (telephony backend).

### Pending Tasks

- [ ] **T12**: Create ConnexCS sync service foundation
  - Files: `server/services/connexcs-sync.ts`
  - Acceptance: Base service with authentication, error handling, rate limiting

- [ ] **T13**: Implement Carrier → ConnexCS Customer push sync
  - Files: `server/services/connexcs-sync.ts`, `server/routes.ts`
  - Acceptance: Create/Update ConnexCS Customer when DIDTron Carrier (type: customer) changes

- [ ] **T14**: Implement Carrier → ConnexCS Carrier push sync
  - Files: `server/services/connexcs-sync.ts`, `server/routes.ts`
  - Acceptance: Create/Update ConnexCS Carrier when DIDTron Carrier (type: supplier) changes

- [ ] **T15**: Implement Interconnect settings push sync
  - Files: `server/services/connexcs-sync.ts`
  - Acceptance: Push IP auth, codecs, capacity, tech prefix to ConnexCS

- [ ] **T16**: Implement CDR pull sync
  - Files: `server/services/connexcs-sync.ts`, new CDR tables
  - Acceptance: Pull CDRs from ConnexCS, store in DIDTron, mark as processed

---

## Next Actions
1. Complete T11 documentation (DONE)
2. Await user guidance on ConnexCS sync implementation order
