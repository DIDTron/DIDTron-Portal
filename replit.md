# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Overview
DIDTron Communications is developing an AI-first, white-label wholesale VoIP platform. This platform offers a comprehensive suite of VoIP services including Voice Termination, DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, a Class 4 Softswitch, and an advanced SIP Tester module. It supports Super Admins, Customers, Carriers, and Class 4 Softswitch operators, integrating a main marketing site and extensive documentation. The business model is strictly pay-as-you-go, focusing on competitive pricing, enterprise-grade user experience, high reliability, and scalability. The project aims to set a new standard for wholesale VoIP solutions by enabling rapid deployment and customization.

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
The platform adopts an "Enterprise SaaS Dashboard System" design, combining Stripe's elegance with Linear's information density. It features a VitalPBX-like layout with a double sidebar, two headers, a fixed action dock, and content tabs. A native dark mode is supported, with DIDTron Blue (#2563EB) as the primary accent. The Experience Manager handles the marketing website, portal themes, white-labeling, design system, and documentation via a Draft/Preview/Publish workflow. All visual development adheres to a mandatory Component Library Workflow, utilizing components from `/admin/experience-manager/component-library` as the single source of truth. All data tables in the Super Admin portal must include the `DataTableFooter` component.

### Technical Implementations
The platform includes integrated billing, a referral system, promo codes, email communications, AI-powered social media management, support tickets, webhooks, API, CMS, white-labeling, audit/compliance, and multi-currency support. VoIP products encompass Voice Termination, DIDs, Cloud PBX, AI Voice Agents, a Class 4 Softswitch, and a SIP Tester module with monitoring and alerts. An automated metadata-driven Testing Engine ensures comprehensive testing. All data modification operations are routed through a job queue for auditing, and user actions in the Super Admin portal are logged. Soft deletion with configurable retention is implemented for deleted records. Frontend pages requiring refresh functionality must use `useQuery`'s `refetch()` and `isFetching` states for consistent UI. New pages and tabs implement focus-safe initialization and overflow-safe cards.

### System Design
The backend utilizes PostgreSQL and Drizzle ORM, supported by a robust job queue for background processing. The frontend employs Zustand for state management. All new features require testing with fake super admin actions, with results logged.

### Billing System
The billing system supports prepaid/postpaid customers, CDR rating, invoicing, and supplier reconciliation using a double-entry ledger system. Data synchronization between DIDTron (core logic) and ConnexCS (telephony engine) uses push mechanisms for customer accounts, balances, rate cards, and DID rules, and pull mechanisms for CDRs and real-time statistics. Billing models include Individual, Small Business (prepaid), and Enterprise, Wholesaler, Call Center (postpaid). CDR rating involves ingestion, customer rating, supplier rating, storage of rated usage, and invoicing, with configurable billing increments. Document types include Invoices, Statements of Account, Credit Notes, and Netting Requests. The UI for billing is integrated across Super Admin and Customer portals.

### Digitalk Carrier Hierarchy Implementation
The Class 4 Softswitch module implements the Digitalk Carrier Cloud Manager hierarchy, which structures Carriers, Interconnects, and Services. A Carrier is a commercial entity (Customer/Supplier/Bilateral) with balance and credit limits. An Interconnect represents a SIP trunk (Ingress/Egress, tech prefix, IP authentication, codecs, capacity). A Service is the key linkage, connecting an Interconnect to a Rating Plan and a Routing Plan. Key concepts include Tech Prefixes for call identification, rate selection at the Service level, and Bilateral Carriers combining both customer and supplier roles. The `carrier_services` table defines the relationship between `carrierId`, `interconnectId`, `ratingPlanId`, and `routingPlanId`, along with direction, tech prefix, priority, capacity, and enforcement policies. The API enforces Digitalk hierarchy rules, ensuring interconnects belong to the same carrier and service direction is compatible with interconnect direction.

## External Dependencies
-   **Stripe**: Payments and KYC identity verification.
-   **PayPal**: Alternative payment processing.
-   **Brevo (Sendinblue)**: Transactional email services.
-   **Ayrshare**: Social media management and posting.
-   **Open Exchange Rates**: Currency conversion and FX rates.
-   **Cloudflare R2**: Object storage for various media and documents.
-   **Upstash Redis**: Caching for sessions, FX rates, metrics, and API rate limiting.
-   **OpenAI GPT-4o**: All AI features, integrated via Replit AI.
-   **Twilio, SignalWire, Spearline**: SIP testing functionalities.
-   **ConnexCS**: Class 4 Softswitch for call routing, CDR generation, and real-time balance management.