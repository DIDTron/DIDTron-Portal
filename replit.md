# DIDTron Communications - White-Label Multi-Portal VoIP Platform

### Overview
DIDTron Communications is developing an AI-first, white-label wholesale VoIP platform offering Voice Termination, DIDs with automated KYC, Class 5 PBX features, AI Voice Agents, a Class 4 Softswitch, and an advanced SIP Tester module. It supports Super Admins, Customers, Carriers, and Class 4 Softswitch operators, integrating a main marketing site and extensive documentation. The business model is strictly pay-as-you-go, focusing on competitive pricing, enterprise-grade user experience, high reliability, and scalability to enable rapid deployment and customization.

### User Preferences
- Pure pay-as-you-go pricing (NO subscriptions ever)
- VitalPBX-style UI LAYOUT for all portals (NOT the green colors)
- Keep current DIDTron color scheme with light/dark/system mode toggle
- Features visibility based on customer category/group
- AI should generate descriptions, marketing copy, and analysis
- Platform sync for all carrier/route operations
- Assignment system for feature visibility control
- When clicking a module in the primary sidebar, navigate directly to the first page in that module's secondary sidebar
- Do NOT create standalone "overview" or placeholder pages for modules - the module's defaultRoute should point to the first actual page
- Each module's defaultRoute in `navSections` (primary-sidebar.tsx) must match the first item's route in `sectionDefaultItems`
- The Actions dropdown button in page headers must ONLY show actions relevant to the currently active tab
- Each tab has its own set of actions - actions should not appear on tabs they don't belong to
- Do NOT use currency/dollar icons in action dropdown items - use text only

### System Architecture

#### UI/UX Design
The platform uses an "Enterprise SaaS Dashboard System" design, inspired by Stripe and Linear, featuring a VitalPBX-like double sidebar, two headers, a fixed action dock, and content tabs. It supports a native dark mode with DIDTron Blue (#2563EB) as the primary accent. The Experience Manager handles marketing, portal themes, white-labeling, design system, and documentation via a Draft/Preview/Publish workflow. All visual development adheres to a mandatory Component Library Workflow, using components from `/admin/experience-manager/component-library`. All data tables in the Super Admin portal must include the `DataTableFooter` component.

#### Data Table UI Patterns
The platform provides two data table patterns for different use cases:

**Pattern 1: Standard Table** (`@/components/ui/table`)
- Basic table with full-width scrollable container
- Use for simple data lists with few columns
- Components: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

**Pattern 2: Fixed Column Table** (`@/components/ui/fixed-column-table`)
- First column is fixed (sticky) while remaining columns scroll horizontally
- Use for data-dense tables with many columns (e.g., Carrier Management, Balance & Spend)
- Matches Digitalk Carrier Cloud Manager UI pattern
- Components: `FixedColumnTable`, `FixedColumnTableHeader`, `FixedColumnTableBody`, `FixedColumnTableRow`, `FixedColumnTableHead`, `FixedColumnTableCell`
- Usage: Set `fixed={true}` on the first column's `FixedColumnTableHead` and `FixedColumnTableCell`
- Dark header styling (#3d4f5f) with white text for headers
- Alternating row backgrounds for readability

Both patterns must use `DataTableFooter` component for pagination.

#### Technical Implementations
The platform includes integrated billing, a referral system, promo codes, email communications, AI-powered social media management, support tickets, webhooks, API, CMS, white-labeling, audit/compliance, and multi-currency support. VoIP products include Voice Termination, DIDs, Cloud PBX, AI Voice Agents, a Class 4 Softswitch, and a SIP Tester module. An automated metadata-driven Testing Engine ensures comprehensive testing. All data modification operations are routed through a job queue for auditing, and user actions in the Super Admin portal are logged. Soft deletion with configurable retention is implemented. Frontend pages requiring refresh functionality must use `useQuery`'s `refetch()` and `isFetching` states. New pages and tabs implement focus-safe initialization and overflow-safe cards.

#### System Design
The backend utilizes PostgreSQL and Drizzle ORM, supported by a robust job queue for background processing. The frontend employs Zustand for state management. All new features require testing with fake super admin actions, with results logged. The billing system supports prepaid/postpaid customers, CDR rating, invoicing, and supplier reconciliation using a double-entry ledger system. Data synchronization between DIDTron (core logic) and ConnexCS (telephony engine) uses push mechanisms for customer accounts, balances, rate cards, and DID rules, and pull mechanisms for CDRs and real-time statistics. Billing models include Individual, Small Business (prepaid), and Enterprise, Wholesaler, Call Center (postpaid). CDR rating involves ingestion, customer rating, supplier rating, storage of rated usage, and invoicing, with configurable billing increments. Document types include Invoices, Statements of Account, Credit Notes, and Netting Requests. The UI for billing is integrated across Super Admin and Customer portals.

#### Digitalk Carrier Hierarchy Implementation
The Class 4 Softswitch module implements the Digitalk Carrier Cloud Manager hierarchy, structuring Carriers, Interconnects, and Services. A Carrier is a commercial entity (Customer/Supplier/Bilateral). An Interconnect represents a SIP trunk (Ingress/Egress, tech prefix, IP authentication, codecs, capacity). A Service is the key linkage, connecting an Interconnect to a Rating Plan and a Routing Plan. Key concepts include Tech Prefixes for call identification, rate selection at the Service level, and Bilateral Carriers combining both customer and supplier roles. The `carrier_services` table defines the relationship between `carrierId`, `interconnectId`, `ratingPlanId`, and `routingPlanId`, along with direction, tech prefix, priority, capacity, and enforcement policies. The API enforces Digitalk hierarchy rules, ensuring interconnects belong to the same carrier and service direction is compatible with interconnect direction.

### External Dependencies
-   **Stripe**: Payments and KYC identity verification.
-   **PayPal**: Alternative payment processing.
-   **Brevo (Sendinblue)**: Transactional email services.
-   **Ayrshare**: Social media management and posting.
-   **Open Exchange Rates**: Currency conversion and FX rates.
-   **Cloudflare R2**: Object storage.
-   **Upstash Redis**: Caching for sessions, FX rates, metrics, and API rate limiting.
-   **OpenAI GPT-4o**: All AI features, integrated via Replit AI.
-   **Twilio, SignalWire, Spearline**: SIP testing functionalities.
-   **ConnexCS**: Class 4 Softswitch for call routing, CDR generation, and real-time balance management.