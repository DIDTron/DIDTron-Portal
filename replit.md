# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Project Overview
White-label wholesale VoIP platform with multiple portals: Main marketing website, Super Admin portal, Customer portal, Carrier portal, and Documentation site. Core services include Voice Termination (4 quality tiers), DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, Class 4 Softswitch, and SIP Tester module.

**Business Model**: Pure pay-as-you-go (NO subscriptions) - competing against Voice Hub AI, ZIWO, and ConnexCS.

## Current State
**Phase 1-3: Foundation & Admin Config** - In Progress
- ✅ Task 1: Database Schema (90+ tables) - Complete
- ✅ PostgreSQL database provisioned and schema pushed
- ✅ Blue #2563EB theme implemented
- ✅ Customer Categories & Groups system with seeded data
- ✅ Task 2: Design System - Complete (design_guidelines.md)
- ✅ Marketing Website Enhanced:
  - Hero section with live metrics dashboard mockup
  - Platform Capabilities grid (6 services)
  - Additional Services section
  - Real-Time Monitoring section
  - Portal Showcase (4 portals)
  - Pricing section with 3 tiers
  - Trust/Compliance section
  - 4-column footer
- ✅ Super Admin Portal - 9 config pages complete:
  - Dashboard, POPs, Voice Tiers, Codecs, Channel Plans
  - Carriers (NEW), Routes (NEW), DID Countries, DID Providers (NEW)
- 🔄 Phase 4: Routing System - Next

## Architecture

### Hierarchy
```
Customer Category (Public on website: SIP Trunk, Enterprise, Call Center, Individual)
  └── Customer Group (Admin segments within category)
        └── Customer (Belongs to 1 category, 1 group)
              └── Gets configs from: Category + Group + Individual assignments
```

### Assignment System
Every config item can be assigned to:
- **ALL** - Available to everyone
- **Categories** - Available to specific categories
- **Groups** - Available to specific groups within categories
- **Specific Customers** - Private/custom for individual customers

### Key Files
- `shared/schema.ts` - Complete database schema (90+ tables)
- `server/db.ts` - PostgreSQL database connection
- `server/storage.ts` - In-memory storage with full CRUD (IStorage interface)
- `server/routes.ts` - API endpoints for all entities
- `client/src/index.css` - Blue theme colors
- `design_guidelines.md` - Design system documentation

## 118-Task Roadmap

### PHASE 1: FOUNDATION (In Progress)
1. ✅ Database Schema
2. 🔄 Design & Branding
3. ✅ Customer Categories & Groups

### PHASE 2: AUTHENTICATION
4. Authentication (registration, login, 2FA, sessions)

### PHASE 3: ADMIN CONFIG SYSTEM
5-13. POP Management, Voice Tiers, Codecs, Auth Methods, Channel Plans, DID Countries, DID Providers, ConnexCS Sync, Config Audit

### PHASE 4: ROUTING SYSTEM
14-18. Carrier Management, Route Management, Route Groups, LCR Configuration, Rate Cards

### PHASE 5: ROUTE QUALITY MONITORING
19-24. Monitoring Rules, Metrics Collection, Alert Conditions, Notifications, Auto-Actions, Dashboard

### PHASE 6: CORE VOIP
25-33. SIP Trunk, DID Inventory, DID Routing, KYC, PBX Extensions, IVR Builder, Ring Groups, Queues, Voicemail

### PHASE 7: USER MANAGEMENT
34. User Roles & Permissions

### PHASE 8: REFERRALS & BILLING
35-38. Referral System, Bonus & Promo System, Billing System, Payment Integration

### PHASE 9: AI SOCIAL MEDIA
39-45. Social Media Management (7 tasks)

### PHASE 10: PORTALS
46-49. Main Website, Customer Portal, Carrier Portal, Super Admin Portal

### PHASE 11: AI ADMIN AGENT
50-54. AI Agent features (5 tasks)

### PHASE 12: SIP TESTER MODULE
55-101. SIP Tester (47 tasks covering 14 test types)

### PHASE 13-17: OPERATIONS, INTEGRATIONS, SECURITY, API, DOCS
102-118. Remaining tasks

## API Endpoints

### Core Entities
- `/api/categories` - Customer categories CRUD
- `/api/groups` - Customer groups CRUD
- `/api/customers` - Customers CRUD + move
- `/api/pops` - POPs CRUD
- `/api/voice-tiers` - Voice tiers CRUD
- `/api/codecs` - Codecs CRUD
- `/api/channel-plans` - Channel plans CRUD
- `/api/carriers` - Carriers CRUD
- `/api/routes` - Routes CRUD
- `/api/monitoring-rules` - Monitoring rules CRUD
- `/api/alerts` - Alerts CRUD + acknowledge/resolve
- `/api/did-countries` - DID countries CRUD
- `/api/tickets` - Support tickets CRUD
- `/api/dashboard/category-stats` - Dashboard statistics

### Currency & FX
- `/api/currencies` - Currency management
- `/api/fx-rates` - FX rate management
- `/api/fx-rates/latest/:currency` - Get latest FX rate

### SIP Tester
- `/api/sip-tests/configs` - Test configurations CRUD
- `/api/sip-tests/results` - Test results
- `/api/sip-tests/schedules` - Scheduled tests CRUD

### Class 4 Softswitch
- `/api/class4/customers` - Wholesale sub-customers
- `/api/class4/carriers` - Wholesale carriers

### AI Voice
- `/api/ai-voice/agents` - AI voice agent management

### CMS & White-label
- `/api/cms/themes` - Theme management
- `/api/tenant-branding/:customerId` - Tenant branding

## Database Tables (90+)

### Core Tables
- customer_categories, customer_groups, customers, customer_kyc
- users, sessions, login_history
- carriers, carrier_assignments
- pops, pop_assignments

### VoIP Config
- voice_tiers, voice_tier_assignments
- codecs, codec_assignments
- channel_plans, channel_plan_assignments
- routes, route_assignments, route_groups
- rate_cards, rate_card_rates

### Monitoring
- monitoring_rules, monitoring_conditions, monitoring_actions
- alerts, route_metrics

### DID Management
- did_countries, did_providers, dids
- did_country_assignments, did_provider_assignments

### PBX
- sip_trunks, extensions, ivr_menus, ring_groups, call_queues
- voicemails, call_recordings

### Currency System (Shadow Ledger)
- currencies, fx_rates, ledger_entries

### SIP Tester (14 test types)
- sip_test_configs, sip_test_results, sip_test_schedules

### Class 4 Softswitch
- class4_customers, class4_carriers, class4_rate_cards

### AI Voice Agent
- ai_voice_agents, ai_voice_calls, ai_voice_transcripts

### CMS & White-label
- cms_themes, cms_pages, cms_content_blocks
- tenant_branding

## Design
- Primary: Blue #2563EB
- Professional B2B enterprise SaaS style
- Dark mode support
- Flat design with subtle borders
- VitalPBX-style UI for customer portal

## External Services (Budget: <$25/month)
- ConnexCS API (info@didtron.com) - VoIP backend switching
- Open Exchange Rates - Currency conversion (FREE-$12)
- OpenAI GPT-4o - AI features ($5-15)
- Ayrshare - Social media (FREE-$20)
- Brevo - Email (FREE)
- Cloudflare R2 - Storage (~$5)
- Upstash Redis - Caching (FREE)

## Technical Notes
- Storage: Currently using in-memory MemStorage (PostgreSQL schema ready)
- VoIP traffic never touches Replit servers - routed via ConnexCS
- Multi-currency: Shadow ledger system - ConnexCS stays in USD, DIDTron handles 200+ currencies
- Performance: Replit Autoscale handles traffic spikes
