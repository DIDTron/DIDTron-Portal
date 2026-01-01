# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Project Overview
White-label wholesale VoIP platform with multiple portals: Main marketing website, Super Admin portal, Customer portal, Carrier portal, and Documentation site. Core services include Voice Termination (4 quality tiers), DIDs with automated KYC, and Class 5 PBX features.

## Current State
**Phase 1: Foundation** - Completed
- Database schema with 50+ tables
- Blue #2563EB theme implemented
- Customer Categories & Groups system with seeded data

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
- `shared/schema.ts` - Complete database schema (50+ tables)
- `server/storage.ts` - In-memory storage with full CRUD
- `server/routes.ts` - API endpoints for all entities
- `client/src/index.css` - Blue theme colors
- `design_guidelines.md` - Design system documentation

## 67-Task Roadmap

### PHASE 1: FOUNDATION (Complete)
1. ✅ Database Schema
2. ✅ Design & Branding
3. ✅ Customer Categories & Groups

### PHASE 2: AUTHENTICATION
4. Authentication (registration, login, 2FA, sessions)

### PHASE 3: ADMIN CONFIG SYSTEM
5. POP Management
6. Voice Tiers
7. Codec Options
8. Auth Methods
9. Channel/CPS Plans
10. DID Countries
11. DID Providers
12. ConnexCS Sync Engine
13. Config Audit System

### PHASE 4: ROUTING SYSTEM
14. Carrier Management
15. Route Management
16. Route Groups
17. LCR Configuration
18. Rate Cards

### PHASE 5: ROUTE QUALITY MONITORING
19. Monitoring Rules Engine
20. Metrics Collection
21. Alert Conditions
22. Notifications
23. Auto-Actions
24. Monitoring Dashboard

### PHASE 6: CORE VOIP
25. SIP Trunk Module
26. DID Inventory & Ordering
27. DID Routing
28. KYC System
29. PBX Extensions
30. PBX IVR Builder
31. PBX Ring Groups
32. PBX Queues
33. Voicemail & Recording

### PHASE 7: USER MANAGEMENT
34. User Roles & Permissions

### PHASE 8: REFERRALS & BILLING
35. Referral System
36. Bonus & Promo System
37. Billing System
38. Payment Integration

### PHASE 9: AI SOCIAL MEDIA
39-45. Social Media Management (7 tasks)

### PHASE 10: PORTALS
46. Main Website
47. Customer Portal
48. Carrier Portal
49. Super Admin Portal

### PHASE 11: AI ADMIN AGENT
50-54. AI Agent features (5 tasks)

### PHASE 12-17: OPERATIONS, INTEGRATIONS, SECURITY, API, DOCS
55-67. Remaining tasks

## API Endpoints
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

## Design
- Primary: Blue #2563EB
- Professional B2B enterprise SaaS style
- Dark mode support
- Flat design with subtle borders

## External Services (Budget: <$20/month)
- ConnexCS API (info@didtron.com) - VoIP backend
- Ayrshare - Social media (FREE-$20)
- OpenAI GPT-4o - AI features ($5-15)
- Brevo - Email (FREE)
- Cloudflare R2 - Storage (~$5)
- Upstash Redis - Caching (FREE)
