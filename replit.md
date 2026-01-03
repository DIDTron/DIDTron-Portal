# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Overview
DIDTron Communications is building a white-label wholesale VoIP platform designed for various user types: Super Admins, Customers, Carriers, and Class 4 Softswitch operators, alongside a main marketing site and documentation. The platform offers a comprehensive suite of VoIP services including Voice Termination with multiple quality tiers, DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, a Class 4 Softswitch, and a detailed SIP Tester module.

The business model is purely pay-as-you-go, aiming to compete with established players like Voice Hub AI, ZIWO, and ConnexCS by offering competitive pricing across all services. The project's ambition is to provide a modern, AI-first, and highly customizable VoIP solution with an enterprise-grade user experience.

## User Preferences
- Pure pay-as-you-go pricing (NO subscriptions ever)
- VitalPBX-style UI for customer portal
- Features visibility based on customer category/group
- AI should generate descriptions, marketing copy, and analysis
- ConnexCS sync for all carrier/route operations
- Assignment system for feature visibility control

## System Architecture

### UI/UX Decisions
The platform adopts an Enterprise SaaS Dashboard System, combining Stripe's polish with Linear's information density. Each portal (Main, Super Admin, Customer, Carrier, Class 4, Docs) will have subtle accent variations while maintaining a cohesive brand identity. Dark mode is native for extended monitoring, and layouts are designed for high information density. The customer portal specifically targets a VitalPBX-style user experience.

### Technical Implementations
- **Core Database Schema**: Over 90 tables define the system's data structure.
- **Design System**: A robust `index.css` and design tokens ensure consistent theming, including a native dark mode.
- **Customer Hierarchy & Feature Visibility**: A layered system (Category -> Group -> Customer) controls feature access and configuration inheritance.
    - Features are assigned at `ALL`, `Category`, `Group`, or `Customer` levels, with customer-specific assignments having the highest priority.
    - Specific categories (SIP Trunk, Enterprise, Call Center, Individual) have tailored module visibility.
- **Assignment System**: All configurable items (carriers, routes, DIDs) can be assigned to `ALL`, specific `Categories`, `Groups`, or `Customers`.
- **Unified AI Service**: A central `ai-service.ts` handles all AI functionalities across the platform, including descriptions, analysis, and agent operations.
- **ConnexCS API Wrapper**: Integration with ConnexCS via `connexcs.ts` for Class 4 backend operations, carrier management, and routing.
- **Multi-currency System**: A shadow ledger supports over 200 currencies with hourly FX rate fetching and Redis caching, reconciling against ConnexCS's USD base.
- **Storage**: While PostgreSQL schema is ready, current development uses in-memory MemStorage. VoIP traffic is routed directly via ConnexCS, never touching Replit servers.

### Feature Specifications
- **Multi-Portal System**: Main Website, Super Admin, Customer, Carrier, Class 4 Softswitch, and Documentation site.
- **SIP Tester Module**: Features various test types (Quality, PDD, DTMF, Capacity, Failover, etc.), simple and advanced testing modes, a Smart Sync System for cross-portal result sharing, and a Scheduling System. Includes extensive AI testing features for auto-testing, recommendations, analysis, and fix suggestions.
- **Monitoring**: Rules engine, metrics collection (from ConnexCS), alert conditions, and auto-actions (e.g., pausing routes).
- **Core VoIP**: SIP Trunk module, DID inventory and ordering with KYC, DID routing, PBX features (extensions, IVR, ring groups, queues), voicemail, and recording.
- **AI Voice Agent**: Setup, conversation flow builder, training, and outbound campaign management.
- **Billing & Users**: Roles and permissions, referral system, bonus/promo system, multi-currency ledger, billing engine (prepaid/postpaid), and payment integrations.
- **AI Social Media**: Integration with Ayrshare for social account management, AI content creation (posts, images), publishing calendar, unified inbox, and analytics.
- **CMS & White-Label**: Core CMS for portals, theme studio, media library, layout composer, content block builder, and tenant-specific branding with custom domains.
- **AI Intelligence**: AI Admin Agent, smart recommendations, automation engine, and natural language global search.

## External Dependencies
- **ConnexCS**: Primary VoIP backend for switching, carriers, routes, and CDRs.
- **OpenAI GPT-4o**: Powers all AI functionalities (descriptions, analysis, voice agents).
- **Open Exchange Rates**: Provides 200+ currency conversion rates.
- **Ayrshare**: Integrates social media posting and management.
- **Brevo**: Used for transactional emails (welcome, alerts).
- **Cloudflare R2**: Object storage for voicemail and recordings.
- **Upstash Redis**: Utilized for caching, session management, and FX rate caching.
- **Twilio**: External PSTN testing within the SIP Tester module.
- **SignalWire**: Budget-friendly external SIP testing option.
- **Spearline**: Enterprise-grade global testing within the SIP Tester module.
- **Stripe Identity**: Used for KYC verification during DID ordering.
- **Stripe/PayPal**: Integrated for multi-currency payment processing.