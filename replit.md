# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Overview
DIDTron Communications is developing a white-label wholesale VoIP platform for Super Admins, Customers, Carriers, and Class 4 Softswitch operators. This platform integrates a main marketing site and comprehensive documentation, offering a full suite of VoIP services: Voice Termination with various quality tiers, DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, a Class 4 Softswitch, and an advanced SIP Tester module. The business model is strictly pay-as-you-go, aiming to provide competitive pricing and an enterprise-grade user experience with an AI-first approach.

## User Preferences
- Pure pay-as-you-go pricing (NO subscriptions ever)
- VitalPBX-style UI LAYOUT for all portals (NOT the green colors)
- Keep current DIDTron color scheme with light/dark/system mode toggle
- Features visibility based on customer category/group
- AI should generate descriptions, marketing copy, and analysis
- Platform sync for all carrier/route operations
- Assignment system for feature visibility control

## System Architecture

### UI/UX Design
The platform uses a VitalPBX-like layout with a double sidebar, two headers, a fixed action dock, and content tabs. The design is an "Enterprise SaaS Dashboard System," combining Stripe's polish with Linear's information density, featuring a native dark mode and DIDTron Blue (#2563EB) as the primary accent. The Experience Manager unifies control over the marketing website, portal themes, white-labeling, design system, and documentation, following a Draft/Preview/Publish workflow. All data tables in the Super Admin portal must include the `DataTableFooter` component for consistent pagination. The Component Library is the single source of truth for all UI components, requiring new components to be documented there before use.

### Technical Implementations
Key features include billing, referral system, promo codes, email communications, AI-powered social media management, support tickets, webhooks, API, CMS, white-labeling, audit/compliance, and multi-currency support. VoIP products include Voice Termination, DIDs, Cloud PBX, AI Voice Agents, a Class 4 Softswitch, and a SIP Tester module with monitoring and alerts. An automated Testing Engine, a metadata-driven system, enables comprehensive testing of modules, pages, and features across various levels. All data modification operations must go through a job queue for auditing. All user actions in the Super Admin portal are logged, and deleted records are soft-deleted with configurable retention.

### System Design
The backend uses PostgreSQL and Drizzle ORM, with a robust job queue system for background processing, supporting 24 job types across categories like Rate Cards, DID Management, and Billing. The frontend uses Zustand for state management. All new features require testing with fake super admin actions, with results logged in the "Dev Tests" module.

## External Dependencies

-   **Stripe**: Payments and KYC identity verification.
-   **PayPal**: Alternative payment processing.
-   **Brevo (Sendinblue)**: Transactional email services.
-   **Ayrshare**: Social media management and posting.
-   **Open Exchange Rates**: Currency conversion and FX rates.
-   **Cloudflare R2**: Object storage for voicemails, call recordings, KYC documents, media, and rate cards.
-   **Upstash Redis**: Caching for sessions, FX rates, platform metrics, and API rate limiting.
-   **OpenAI GPT-4o**: All AI features, integrated via Replit AI.
-   **Twilio, SignalWire, Spearline**: SIP testing functionalities.