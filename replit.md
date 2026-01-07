# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Overview
DIDTron Communications is developing a white-label wholesale VoIP platform targeting Super Admins, Customers, Carriers, and Class 4 Softswitch operators. This platform will integrate a main marketing site and comprehensive documentation. It aims to provide a full suite of VoIP services including Voice Termination with various quality tiers, DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, a Class 4 Softswitch, and an advanced SIP Tester module. The business model is strictly pay-as-you-go, positioning DIDTron to compete effectively with established VoIP providers by offering competitive pricing and an enterprise-grade user experience with an AI-first approach.

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
The platform adopts the VitalPBX layout paradigm, characterized by a double sidebar (icon rail + expandable submenu), two headers (global and workspace tabs), a fixed action dock, and content tabs for configuration forms. The design ethos is an "Enterprise SaaS Dashboard System," blending Stripe's polish with Linear's information density. It features a native dark mode and uses DIDTron Blue (#2563EB) as the primary accent.

### Technical Implementations
The platform includes extensive features for billing, a referral system, bonus/promo codes, email communications, AI-powered social media management, support tickets, webhooks, API, CMS, white-labeling, audit/compliance, and multi-currency support. Key VoIP products include Voice Termination, DIDs, Cloud PBX, AI Voice Agents, a Class 4 Softswitch, and a SIP Tester module with comprehensive monitoring and alerts.

### System Design
The backend is built with PostgreSQL and Drizzle ORM, featuring a robust job queue system for background processing. This system supports 24 job types across categories like Rate Cards, ConnexCS Sync, DID Management, Billing, Communications, AI Voice, and System tasks. It operates in dual-mode (PostgreSQL-backed for production, in-memory for development) with a real-time dashboard and worker control. Frontend development uses Zustand for state management and organizes components for Super Admin portals.

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