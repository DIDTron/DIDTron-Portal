# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Overview
DIDTron Communications is building a white-label wholesale VoIP platform designed for various user types: Super Admins, Customers, Carriers, and Class 4 Softswitch operators, alongside a main marketing site and documentation. The platform offers a comprehensive suite of VoIP services including Voice Termination with multiple quality tiers, DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, a Class 4 Softswitch, and a detailed SIP Tester module.

The business model is purely pay-as-you-go, aiming to compete with established players like Voice Hub AI and ZIWO by offering competitive pricing across all services. The project's ambition is to provide a modern, AI-first, and highly customizable VoIP solution with an enterprise-grade user experience.

## User Preferences
- Pure pay-as-you-go pricing (NO subscriptions ever)
- VitalPBX-style UI LAYOUT for all portals (NOT the green colors)
- Keep current DIDTron color scheme with light/dark/system mode toggle
- Features visibility based on customer category/group
- AI should generate descriptions, marketing copy, and analysis
- Platform sync for all carrier/route operations
- Assignment system for feature visibility control

## UI/UX Design Decisions

### VitalPBX Layout Logic (NOT Colors)
The platform uses VitalPBX's layout pattern while keeping DIDTron's blue color scheme:
- **Double sidebar**: Icon rail (left) + expandable submenu (right when category selected)
- **Two headers**: Global header (logo, search, theme toggle, user) + Workspace tabs (browser-style tabs for open items)
- **Action dock**: Fixed bottom-right with Update/Delete/Cancel buttons
- **Content tabs**: GENERAL / ADVANCED / ASSIGNMENT within each config form

### Design Style
- Enterprise SaaS Dashboard System combining Stripe's polish with Linear's information density
- Dark mode native for extended monitoring
- High information density layouts
- DIDTron Blue (#2563EB) as primary accent

## Complete Feature Specifications

### 1. BILLING & PAYMENTS
Third-Party: Stripe, PayPal

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Prepaid Balance | Set minimum balance alerts | Add funds via Stripe/PayPal, view balance | AI predicts when balance will run out |
| Postpaid Billing | Set credit limits per category | View invoices, pay invoices | AI analyzes spending patterns |
| Auto Top-Up | Configure thresholds | Enable auto top-up, set amount | AI recommends optimal top-up amount |
| Invoices | Template customization | Download PDF invoices, history | AI summarizes invoice details |
| Multi-Currency | Add 200+ currencies, set FX source | View prices in their currency | AI alerts when FX rate changes significantly |
| Payment Methods | Configure Stripe/PayPal keys | Save cards, choose method | - |

### 2. REFERRAL SYSTEM

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Referral Program | Enable/disable, set reward amounts | Get unique referral link | AI generates personalized referral messages |
| Referral Tracking | View all referrals, clicks, conversions | See who they referred, earned rewards | AI analyzes which customers refer most |
| Referral Rewards | Configure: $X per signup, % of spend | Automatic credit to balance | AI suggests optimal reward structure |
| Referral Tiers | Bronze/Silver/Gold referrer levels | See their tier, benefits | AI recommends tier upgrades |

### 3. BONUS & PROMO CODE SYSTEM

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Promo Codes | Create codes: WELCOME20 = 20% off | Enter code at checkout/signup | AI generates effective promo code names |
| Bonus Types | Define: signup bonus, deposit match, usage bonus | See available bonuses | AI recommends which bonuses to show |
| Bonus Assignment | Assign bonuses to Categories/Groups/Customers | Receive targeted bonuses | AI analyzes which bonuses drive retention |
| Expiry Rules | Set validity periods | See expiry countdown | AI alerts before bonus expires |
| Usage Limits | Max uses per code, per customer | - | AI detects abuse patterns |

### 4. EMAIL SYSTEM (Brevo)
Third-Party: Brevo (Sendinblue)

| Email Type | Trigger | AI Features |
|------------|---------|-------------|
| Welcome Email | New signup | AI personalizes based on customer category |
| Email Verification | Registration | - |
| Password Reset | Request | - |
| Low Balance Alert | Balance < threshold | AI suggests top-up amount |
| Invoice Ready | New invoice generated | AI summarizes charges |
| Payment Received | Successful payment | - |
| DID Renewal Reminder | 7 days before renewal | AI recommends keep or release |
| KYC Approved/Rejected | KYC status change | AI explains rejection reason |
| Service Alert | Route/trunk issue | AI diagnoses issue, suggests fix |
| Referral Reward | Someone signs up via referral | AI celebrates achievement |
| Promo Notification | New promo available | AI targets relevant customers |
| Weekly Summary | Every Monday | AI summarizes usage, costs, recommendations |

### 5. AI SOCIAL MEDIA (Ayrshare)
Third-Party: Ayrshare

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Social Accounts | Connect Ayrshare API | Connect Facebook, Twitter, LinkedIn, Instagram | - |
| AI Post Creation | Configure AI tone, style | Click "Generate Post" → AI writes content | AI generates engaging posts |
| AI Image Creation | Set brand guidelines | AI generates images for posts | AI creates branded visuals |
| Publishing Calendar | - | Schedule posts, view calendar | AI suggests optimal posting times |
| Unified Inbox | - | Reply to comments/messages from one place | AI drafts reply suggestions |
| Analytics | View platform-wide stats | See their engagement, reach, growth | AI insights: "Post X performed 3x better" |
| Content Library | Upload brand assets | Access brand templates, images | AI organizes assets by type |

### 6. SUPPORT TICKETS

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Create Ticket | - | Submit issue with category, priority | AI suggests category based on description |
| Ticket Assignment | Auto-assign rules | Track ticket status | AI routes to right department |
| Ticket Replies | Reply to customers | Get notifications, reply back | AI drafts initial response |
| Knowledge Base | Create FAQ articles | Search before submitting | AI suggests relevant articles |
| SLA Tracking | Set response time targets | See expected response time | AI alerts agents before SLA breach |
| Satisfaction | Enable ratings | Rate support after resolution | AI analyzes satisfaction trends |

### 7. WEBHOOKS & API

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Webhook URLs | Configure platform webhooks | Add their own webhook endpoints | - |
| Event Types | Define available events | Select which events to receive | AI recommends useful webhooks |
| Delivery Logs | View all deliveries | View their delivery history | AI diagnoses failed deliveries |
| Retry Logic | Configure retry attempts | - | - |
| API Keys | - | Generate API keys, view docs | AI generates code examples |
| Rate Limits | Set limits per category | See their limits | AI alerts when approaching limit |

### 8. CMS & WHITE-LABEL

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Theme Studio | Create themes (colors, fonts, spacing) | - | AI suggests color combinations |
| Portal Branding | - | Upload logo, set colors | - |
| Custom Domains | Configure DNS | Point their domain to portal | - |
| Page Builder | Create pages for main site | - | AI generates page content |
| Menu Editor | Configure navigation | - | - |
| Media Library | Upload images, files | - | AI tags and organizes media |
| Email Templates | Customize email designs | - | AI optimizes email copy |
| Login Page | Customize login appearance | See branded login | - |

### 9. AUDIT & COMPLIANCE

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Audit Logs | View all platform changes | View their account changes | AI summarizes daily changes |
| Config Versions | Track config history | - | AI compares versions |
| ConnexCS Sync Log | View all syncs to ConnexCS | - | AI alerts sync failures |
| Export Logs | Download for compliance | Download their logs | - |
| User Activity | Track login history | See their login history | AI detects suspicious logins |

### 10. MULTI-CURRENCY SYSTEM
Third-Party: Open Exchange Rates

| Feature | Super Admin Setup | Customer Experience | AI Features |
|---------|-------------------|---------------------|-------------|
| Currencies | Enable 200+ currencies | Select their display currency | - |
| FX Rates | Configure rate source, refresh interval | See current rates | AI alerts significant rate changes |
| Ledger | View shadow ledger (all in USD base) | View balance in their currency | AI reconciles discrepancies |
| Pricing Display | Set markup on FX rates | See localized prices | - |
| Reconciliation | Monthly FX reconciliation | - | AI reports FX gains/losses |

### 11. STORAGE (Cloudflare R2)
Third-Party: Cloudflare R2

| Feature | Purpose |
|---------|---------|
| Voicemail Storage | Store voicemail recordings |
| Call Recordings | Store call recordings |
| KYC Documents | Store uploaded ID/address docs |
| Media Library | Store CMS images/files |
| Rate Card Files | Store uploaded CSV rate cards |

### 12. CACHING (Upstash Redis)
Third-Party: Upstash Redis

| Feature | Purpose |
|---------|---------|
| Session Management | Store user sessions across subdomains |
| FX Rate Cache | Cache currency rates (hourly refresh) |
| Platform Metrics | Cache real-time metrics |
| API Rate Limiting | Track request counts |
| Real-time Data | Cache dashboard widgets |

## Core VoIP Products

### Voice Termination ($0.012/min)
- POPs, Voice Tiers, Carriers, Routes
- AI-generated descriptions, quality analysis
- Platform sync for all config
- Assignment matrix for visibility control

### DIDs ($1.50/mo)
- Countries, Providers, Inventory
- Automated KYC via Stripe Identity
- AI routing recommendations

### Cloud PBX ($3/ext)
- Extensions, IVR, Ring Groups, Queues
- Voicemail, Call Recording
- AI-generated IVR scripts

### AI Voice Agent ($0.10/min)
- Persona creation, Flow builder
- Training data management
- Outbound campaigns

### Class 4 Softswitch ($0.0005/min + $25 setup)
- Provider/Customer rate cards
- LCR optimization
- Margin analysis

### SIP Tester Module
- Quality, PDD, DTMF, Capacity, Failover tests
- Simple and Advanced modes
- Smart Sync cross-portal sharing
- AI test recommendations

### Monitoring & Alerts
- Rules engine with thresholds
- AI anomaly detection
- Auto-actions (pause routes, notifications)

## Roadmap (~140 Tasks)

### Phase 1: Core Foundation (10 tasks)
### Phase 2: Super Admin Portal (30 tasks)
### Phase 3: Main Website (15 tasks)
### Phase 4: Unified Customer/Carrier Portal (40 tasks)
### Phase 5: SIP Tester Module (15 tasks)
### Phase 6: AI Voice Agent (10 tasks)
### Phase 7: Class 4 Softswitch (10 tasks)
### Phase 8: Billing, Referrals & Bonuses (15 tasks)
### Phase 9: Email System (Brevo) (8 tasks)
### Phase 10: AI Social Media (Ayrshare) (10 tasks)
### Phase 11: CMS & White-Label (10 tasks)
### Phase 12: Documentation Portal (5 tasks)

## External Dependencies

| Service | Purpose | API Needed |
|---------|---------|------------|
| Switching Platform | VoIP switching backend | Optional - Platform integration |
| OpenAI GPT-4o | All AI features | Via Replit AI Integrations (no key needed) |
| Stripe | Payments + KYC Identity | Yes - STRIPE_SECRET_KEY |
| PayPal | Alternative payments | Yes - PAYPAL_CLIENT_ID, PAYPAL_SECRET |
| Brevo | Transactional emails | Yes - BREVO_API_KEY |
| Ayrshare | Social media management | Yes - AYRSHARE_API_KEY |
| Open Exchange Rates | Currency conversion | Yes - OPENEXCHANGERATES_APP_ID |
| Cloudflare R2 | Object storage | Yes - R2_ACCESS_KEY, R2_SECRET_KEY |
| Upstash Redis | Caching/sessions | Yes - UPSTASH_REDIS_URL |
| Twilio | SIP testing | Yes - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN |
| SignalWire | SIP testing (budget) | Yes - SIGNALWIRE_PROJECT, SIGNALWIRE_TOKEN |
| Spearline | SIP testing (enterprise) | Yes - SPEARLINE_API_KEY |

## Technical Architecture

### Database
- PostgreSQL with Drizzle ORM
- 90+ tables defined in shared/schema.ts
- In-memory storage for development

### Backend Services
- server/ai-service.ts - Unified AI functions
- server/platform.ts - Switching platform API wrapper
- server/audit.ts - Config audit system
- server/routes.ts - API endpoints

### Frontend Structure
- client/src/pages/admin/ - Super Admin portal
- client/src/components/layout/super-admin/ - Layout components
- client/src/stores/ - Zustand state management
