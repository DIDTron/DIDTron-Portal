# DIDTron Communications - White-Label Multi-Portal VoIP Platform

## Overview
DIDTron Communications is developing a white-label wholesale VoIP platform for Super Admins, Customers, Carriers, and Class 4 Softswitch operators. The platform offers a full suite of VoIP services, including Voice Termination, DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, a Class 4 Softswitch, and an advanced SIP Tester module. It integrates a main marketing site and comprehensive documentation. The business model is strictly pay-as-you-go, aiming to provide competitive pricing and an enterprise-grade user experience with an AI-first approach. The project's ambition is to create a robust, AI-first platform that sets a new standard for wholesale VoIP solutions, enabling rapid deployment and customization for various users while ensuring high reliability and scalability.

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
The platform features an "Enterprise SaaS Dashboard System" design, combining Stripe's polish with Linear's information density. It uses a VitalPBX-like layout with a double sidebar, two headers, a fixed action dock, and content tabs. A native dark mode is supported, with DIDTron Blue (#2563EB) as the primary accent. The Experience Manager handles the marketing website, portal themes, white-labeling, design system, and documentation via a Draft/Preview/Publish workflow. All visual development must adhere to a mandatory Component Library Workflow, using documented components from `/admin/experience-manager/component-library` as the single source of truth. New components must be added to the library with full documentation, variants, code examples, and live previews before use. All data tables in the Super Admin portal must include the `DataTableFooter` component.

### Technical Implementations
The platform includes billing, a referral system, promo codes, email communications, AI-powered social media management, support tickets, webhooks, API, CMS, white-labeling, audit/compliance, and multi-currency support. VoIP products encompass Voice Termination, DIDs, Cloud PBX, AI Voice Agents, a Class 4 Softswitch, and a SIP Tester module with monitoring and alerts. An automated metadata-driven Testing Engine ensures comprehensive testing. All data modification operations go through a job queue for auditing, and user actions in the Super Admin portal are logged. Deleted records are soft-deleted with configurable retention. Pages with refresh buttons or auto-refresh must follow specific patterns using `useQuery`'s `refetch()` and `isFetching` states for consistent behavior. New pages and tabs must implement focus-safe initialization (scrolling to top on mount) and overflow-safe cards for content display.

### System Design
The backend utilizes PostgreSQL and Drizzle ORM, with a robust job queue system for background processing. The frontend uses Zustand for state management. All new features require testing with fake super admin actions, with results logged.

### Billing System
The billing system supports prepaid/postpaid customers, CDR rating, invoicing, and supplier reconciliation. It operates with a double-entry ledger system for all financial operations, ensuring an audit trail. Data flows between DIDTron (the brain) and ConnexCS (the engine) with push mechanisms for customer accounts, balances, rate cards, and DID rules, and pull mechanisms for CDRs and real-time statistics. Billing models include Individual, Small Business (prepaid), and Enterprise, Wholesaler, Call Center (postpaid). CDR rating involves ingestion, customer rating, supplier rating, storage of rated usage, and invoicing. Billing increments (e.g., 6/6, 30/30) define minimum billing and rounding. Document types include Invoices, Statements of Account, Credit Notes, and Netting Requests. The UI for billing is structured across Super Admin and Customer portals.

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

## ConnexCS Integration Details

### API Endpoints
The ConnexCS integration uses the base URL `https://app.connexcs.com/api/cp/` with the following endpoints:
- `customer` - Customer management
- `carrier` - Carrier/supplier management  
- `card` - Rate card management
- `cdr` - Call Detail Records (SQL queries)
- `route` - Routing configuration
- `setup/server` - Server/switch infrastructure info
- `auth/jwt` and `auth/jwt/refresh` - Authentication

### Server Feature Flags
ConnexCS servers have feature flags that indicate enabled capabilities:

| Feature | Description |
|---------|-------------|
| **UAC_AUTH** | User Agent Client Authentication - validates incoming SIP requests |
| **TLS_INTERNAL** | Internal TLS encryption within ConnexCS infrastructure |
| **WEBRTC** | WebRTC support for browser-based calling (webphones) |
| **TLS** | Transport Layer Security - encrypted SIP signaling on port 5061 |
| **AUTO_UPGRADE** | Automatic software updates enabled |
| **TCP_SIPTRACE** | SIP tracing over TCP for debugging/troubleshooting |
| **CNX_REG** | ConnexCS Registration - allows SIP endpoint registration |
| **APIBAN** | APIBAN integration - blocks known malicious SIP scanners |
| **ROUTING_ENGINE_BODY** | Advanced routing that can inspect SIP message bodies |

### Rate Limiting
ConnexCS enforces a strict 2-session concurrent limit. All DIDTron sync operations are serialized with 5-second delays between entity types to avoid session overflow errors.

## Digitalk Carrier Hierarchy (Core Concept)

The Class 4 Softswitch module implements the Digitalk Carrier Cloud Manager hierarchy:

### Entity Hierarchy
1. **Carrier** - Commercial entity (type: Customer/Supplier/Bilateral) with balance, credit limits
2. **Interconnect** - SIP trunk (direction: Ingress/Egress, tech prefix, IP auth, codecs, capacity)
3. **Service** - THE KEY LINKAGE connecting Interconnect → Rating Plan + Routing Plan

### Key Concepts
- **Tech Prefix (#55)**: Ingestion tag prepended to dialed number to identify which carrier sent the call
- **Rate Selection**: Happens at SERVICE level (not carrier or interconnect level)
- **Bilateral Carriers**: Single commercial entity with BOTH customer (ingress) and supplier (egress) interconnects, shared balance/contacts
- **Direction**: Ingress (customer terminating to us) vs Egress (supplier terminating from us)

### Schema: carrier_services Table
- `carrierId` - Parent carrier (Digitalk: Customer/Carrier)
- `interconnectId` - Parent interconnect (SIP trunk)
- `ratingPlanId` - Links to rate card for pricing
- `routingPlanId` - Links to routing plan for call routing
- `direction` - ingress/egress
- `techPrefix` - Tech prefix for call identification
- `priority` / `weight` - For LCR and load balancing
- `capacityMode` / `capacityLimit` - CPS controls
- `enforcementPolicy` - Policy hooks
- `scriptForgeId` - ScriptForge integration

### Backend Validation
The API enforces Digitalk hierarchy rules:
1. Interconnect must belong to the same carrier
2. Service direction must be compatible with interconnect direction
3. Prevents cross-carrier service linkage