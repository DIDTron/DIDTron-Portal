# DIDTron Communications - Agent Brief
STOP DRIFT GOVERNANCE (MANDATORY — applies to ALL aspects: UI, backend, DB, naming, files, architecture)

1) ALLOWED DOCUMENTS (DOC ALLOWLIST)
You are NOT allowed to create any new documentation files. Only these docs may exist and be edited:
- replit.md (high-level platform overview + global rules)
- docs/AGENT_BRIEF.md (requirements + constraints + governance)
- docs/UI_SPEC.md (navigation + page flows + UI behavior patterns)
- DESIGN_SYSTEM.md (design tokens + components + layout templates; “how it looks/feels”)
- docs/DB_SCHEMA.md (entities/relations/constraints/enums)
- docs/TODO.md (the ONLY authorized plan + tasks + acceptance criteria + Plan ID)
- docs/DECISIONS.md (append-only “why we decided”; never rewrite history)
- docs/REFERENCES.md (links/files/sources index)
- UI_DEBT.md (debt backlog only; no new requirements here)

Hard rule: Do NOT create new files like LAYOUT_PATTERNS.md, ARCHITECTURE.md, NOTES.md, etc.
If you believe a new file is needed, you must STOP and ask me to explicitly approve: “Create file X.md”.

2) READ ORDER + PRECEDENCE (what overrides what)
At the start of EVERY session/response you MUST open and read, in this order:
1) docs/AGENT_BRIEF.md (governance + constraints)  [highest authority] 
2) docs/TODO.md (current Plan ID + authorized tasks)
3) docs/UI_SPEC.md (UI flows/patterns) 
4) DESIGN_SYSTEM.md (components/tokens/templates — the “how it looks” rules)
5) docs/DB_SCHEMA.md (schema truth)
6) docs/DECISIONS.md (context + rationale)
7) docs/REFERENCES.md (sources)
8) UI_DEBT.md (later fixes)
9) replit.md (background; if conflict with AGENT_BRIEF/UI_SPEC, replit.md loses)

If any conflict exists: STOP → record conflict in docs/DECISIONS.md → update the highest-precedence doc → then proceed.

3) DOCUMENT ROUTER (where new info MUST go)
Before writing anything, you must state: “DOC TARGET: <file> / <section>”.
Then you must add the information into the correct existing file (create a new section inside the file if needed).

Routing rules:
- UI navigation flow, page URL structure, list/detail/tabs/actions/modals behavior → docs/UI_SPEC.md
- Visual design rules (colors, spacing, components, templates, interaction standards) → DESIGN_SYSTEM.md
- Database tables/fields/relations/enums/constraints → docs/DB_SCHEMA.md
- “Why we chose X / tradeoffs / changes to rules” → docs/DECISIONS.md (append-only)
- Plan + tasks + acceptance criteria + sequencing → docs/TODO.md only
- External references/links/PDF/Tango workflows → docs/REFERENCES.md only
- Bugs/inconsistencies to fix later → UI_DEBT.md only
- Global business constraints (no subscriptions etc.) → docs/AGENT_BRIEF.md

4) PLAN LOCK (prevents “plan then drift when building”)
You may NOT build from chat text.
Any plan must be written into docs/TODO.md under the current Plan ID BEFORE coding.
Build mode may ONLY execute tasks that exist in docs/TODO.md and have acceptance criteria.
If you discover extra required work mid-build: STOP → update docs/DECISIONS.md (why) → update docs/TODO.md (new task + acceptance) → then continue.

5) NO RANDOM WORK (scope lock)
You are forbidden from:
- inventing features not in TODO
- refactoring “for cleanliness” unless TODO says so
- renaming files/components/routes unless TODO says so
- changing libraries/architecture unless explicitly approved and recorded in DECISIONS
- creating duplicate patterns if one already exists (must reuse existing patterns)

6) DEFINITION OF DONE (for every task)
A task is NOT done unless:
- acceptance criteria met
- no broken navigation / dead buttons
- error/loading/empty states handled consistently
- docs updated: TODO checked + DECISIONS appended (and UI_SPEC/DB_SCHEMA/DESIGN_SYSTEM if affected)

7) DESIGN DOC DUPLICATION RULE (prevents repeating design files)
DESIGN_SYSTEM.md is the single canonical design source (it already states “single source of truth”). 
If design_guidelines.md exists, it must be merged into DESIGN_SYSTEM.md ONCE and then replaced with a DEPRECATED stub (do not delete).
Record this consolidation in docs/DECISIONS.md.

Start now by confirming:
A) Which docs are present from the allowlist
B) Current Plan ID in docs/TODO.md
C) Next 3 tasks you will execute from TODO (with acceptance criteria)
D) The doc target you will use for any new UI pattern additions (usually docs/UI_SPEC.md)

## Project Overview
DIDTron Communications is an AI-first, white-label wholesale VoIP platform. The Class 4 Softswitch module replicates Digitalk Carrier Cloud Manager 100% (UI/UX and functionality).

## Business Model
- **Pricing**: $25/month minimum topup + $0.0006/min billing
- **Backend Cost**: ConnexCS $0.0003/min = 50% margin
- **Customer Registration**: pbx.didtron.com
- **Customer Portal**: switch.pbx.didtron.com
- **Build Order**: Super Admin portal FIRST, then copy to customer portal

## Production Requirements

### UX Rules
1. VitalPBX-style UI LAYOUT for all portals (NOT the green colors)
2. Keep DIDTron Blue (#2563EB) as primary accent
3. Light/dark/system mode toggle
4. Double sidebar layout: Primary → Secondary → Content
5. Navigation: Module clicks → first actual page (no placeholder overviews)
6. All data tables must include DataTableFooter component

### Reference Documentation
1. **PDF**: `attached_assets/UG-025-274_-_Carrier_Cloud_Manager_1768072023661.pdf` (1638 pages)
2. **Text Extract**: `attached_assets/3-ManagingCarriers_1768085684244.txt`
3. **Tango Workflows** (361 screenshots):
   - Manage Carriers and Services (99 steps)
   - Configure Carrier Contacts and Alerts (32 steps)
   - Configure Digitalk Carrier Cloud Settings (99 steps)
   - Configure Privacy and Rating (32 steps)

### Non-Drift Policy
- NEVER invent features not requested
- NEVER add "nice-to-have" improvements without TODO items
- NEVER migrate architecture without explicit approval
- NEVER change libraries/framework decisions silently
- ALWAYS reuse existing shared components
- ALWAYS follow established patterns

### Constraints
- Pure pay-as-you-go pricing (NO subscriptions ever)
- Features visibility based on customer category/group
- Platform sync for all carrier/route operations
- All data modifications routed through job queue for auditing
- Soft deletion with configurable retention

## External Dependencies
- **Stripe**: Payments and KYC identity verification
- **ConnexCS**: Class 4 Softswitch for call routing, CDR generation
- **Brevo**: Transactional email services
- **OpenAI GPT-4o**: All AI features via Replit AI
- **PostgreSQL + Drizzle ORM**: Database layer

---

## 8) APPROVED INFRA PROVIDERS (MANDATORY — NO SUBSTITUTIONS)

We use these services. Assume they are the default choices unless explicitly changed in docs/DECISIONS.md:

| Service | Provider | Purpose |
|---------|----------|---------|
| Object Storage | **Cloudflare R2** | File uploads, exports, recordings |
| Cache/Sessions/Locks | **Upstash Redis** | Sessions, rate limits, distributed locks, job state |
| Email | **Brevo** | Transactional/notification emails |
| Payments | **Stripe** | Payment processing, KYC verification |
| VoIP Backend | **ConnexCS** | Call routing, CDR generation, real-time balances |
| Currency Rates | **OpenExchangeRates** | FX rates, currency conversion |
| AI | **OpenAI GPT-4o** | AI features via Replit integration |

Hard rules:
- Do NOT introduce alternative providers unless explicitly approved and recorded in DECISIONS + TODO
- Integrations must be behind stable adapters (one clear code entry point per provider)
- Secrets must come from environment variables; never hardcode credentials
- If env var names are unknown, search the repo first, document in DECISIONS, then implement

---

## 9) INFRA HARDENING — MUST IMPLEMENT (NO "PLANNED" HAND-WAVING)

These are production requirements. If dev-only substitutes exist, they MUST be migrated via TODO tasks.

### A) Sessions MUST NOT use in-memory stores in production
- MemoryStore/memorystore is NOT production safe
- Production session storage MUST be Upstash Redis (secure cookie settings, TTL)
- If memory store exists, add TODO task to replace with Redis session store

### B) Scheduled tasks must not duplicate when scaling
- All cron/scheduled sync tasks MUST use a distributed lock in Upstash Redis
- If lock exists, task must skip; if lock acquired, run and refresh lock
- Apply to: ConnexCS sync, currency sync, balance sync

### C) Config must be validated at startup
- Create single config module validated with zod (fail-fast if env vars missing)
- Never silently fall back to mock mode in production
- If service is mocked, it must be explicit in DECISIONS and tracked in TODO

### D) Logging and Audit
- Structured logging for all key operations
- Audit events for super-admin actions (DB-backed audit table)
- Log job IDs for DataQueue tasks and key integration actions

---

## 10) PRODUCTION QUALITY + TESTING GATE (PLAYWRIGHT + AXE REQUIRED)

Mandatory tooling:
- **Playwright** for end-to-end UI testing
- **@axe-core/playwright** for accessibility scanning

Rules:
1. Every new/changed page/tab/modal/workflow MUST have Playwright tests
2. Every new/changed page must pass Axe scan (no accessibility violations)
3. Do NOT silence Axe failures to make tests pass
4. Tests must use stable `data-testid` selectors

Done includes:
- Tests pass (Playwright + Axe)
- No broken routes/dead buttons
- Loading/empty/error states handled
- Docs updated

---

## 11) TIME & TIMESTAMPING — GOLD MUST RULE (MANDATORY)

All time-sensitive objects (rates, CDRs, invoices, logs, alerts, imports) MUST be timestamped consistently.

Rules:
1. Store UTC as canonical backend time. Use ISO 8601 (e.g., 2026-01-11T10:15:30Z)
2. All core tables must include `created_at`, `updated_at` (UTC)
3. Audit/event tables must include `occurred_at` (UTC) and actor identifiers
4. Rate/CDR records must include `effective_from` and optional `effective_to`
5. Never trust client time for authoritative timestamps. Server assigns and validates
6. Any feature is NOT done unless timestamps are stored and displayed correctly

---

## 12) BIG DATA + JOB PROCESSING — GOLD MUST RULE (PERMANENT CRASH PREVENTION)

We handle large datasets (CDR sync, prefix lists, rating imports) in a way that MUST NOT crash the app.

Rules:
1. Never load full datasets into RAM. All large reads/writes MUST be paginated/streamed
2. Canonical storage is the database. Redis is NOT canonical (cache/queue only)
3. **DataQueue is mandatory for heavy jobs**:
   - Heavy tasks MUST run via DataQueue, not inside API requests
   - Jobs MUST be chunked into small batches (500–2,000 records)
   - API requests enqueue job and return job ID; UI shows progress
4. CDR sync MUST be incremental with DB high-water mark (`last_synced_at` or `last_cdr_id`)
5. Destinations/prefixes must be query-on-demand (search + limit + cursor). UI uses typeahead
6. Backend guards: default limit + enforced max limit, pagination mandatory

Mandatory items if missing:
- Batched incremental CDR sync with high-water mark
- Destination search endpoint + UI typeahead
- Import pipeline: R2 upload → DataQueue batch insert → progress in Redis → finalize in DB

---

## 13) EMERGENCY STOP COMMAND

If user says "EMERGENCY STOP":
1. STOP coding immediately
2. Re-read docs/AGENT_BRIEF.md + docs/TODO.md + docs/UI_SPEC.md
3. Reply with: (1) current Plan ID, (2) which TODO task, (3) DOC TARGET, (4) smallest next step
4. Do NOT change any files until outputting those 4 items

---

## Current Focus
Building the Class 4 Softswitch module that exactly matches Digitalk Carrier Cloud Manager UI/UX and functionality.
