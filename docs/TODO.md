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

## Next Actions
1. Review current Interconnect Detail implementation against Digitalk screenshots
2. Continue with T5 (Carrier Detail Page) when approved
