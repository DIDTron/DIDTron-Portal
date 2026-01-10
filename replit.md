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

---

## DIGITALK CARRIER CLOUD MANAGER - COMPLETE IMPLEMENTATION REFERENCE

### Reference Documentation (MUST STUDY BEFORE CODING)
1. **PDF Documentation**: `attached_assets/UG-025-274_-_Carrier_Cloud_Manager_1768072023661.pdf` (1638 pages)
2. **Managing Carriers Section**: `attached_assets/3-ManagingCarriers_1768085684244.txt` (complete text extract)

**Tango Workflow Screenshots (361 total screenshots showing exact UI):**
1. **Manage Carriers and Services** (99 steps): https://app.tango.us/app/workflow/Manage-Carriers-and-Services-in-Digitalk-Carrier-Cloud-7be3ed2772fa4a5fadb554bd48ebd7b4
2. **Configure Carrier Contacts and Alerts** (32 steps): https://app.tango.us/app/workflow/Configure-Carrier-Contacts-and-Alerts-in-Digitalk-b913adcf391d4e98939e0e7f9bff1cd8
3. **Configure Digitalk Carrier Cloud Settings** (99 steps): https://app.tango.us/app/workflow/Configure-Digitalk-Carrier-Cloud-Settings-7dc7bf616d1f43dcb2c4970be1005d6c
4. **Configure Privacy and Rating** (32 steps): https://app.tango.us/app/workflow/Configure-Privacy-and-Rating-in-Digitalk-a4dcd176c97f4e62ace6f888a9a13c4f

---

### DIGITALK THREE CARRIER TYPES

| Carrier Type | Description | Balance | Credit Control |
|--------------|-------------|---------|----------------|
| **Customer** | Ingress only - sends VoIP traffic TO the platform | Customer Balance (enforced, stops calls at limit) | Platform enforces prepaid/postpaid limits |
| **Supplier** | Egress only - receives VoIP traffic FROM the platform | Supplier Balance (informational only) | Not enforced by platform (supplier controls) |
| **Bilateral** | Both ingress AND egress | Both Customer & Supplier balances | Customer balance enforced, supplier informational |

**Net Exposure** = Customer Balance - Supplier Balance

---

### DIGITALK CARRIER DETAIL PAGE - EXACT 5 TABS (from screenshot)

**Page Header:** `Carrier Management / {Carrier Name}` with Actions dropdown

#### Tab 1: Carrier Details (Three-Column Layout)

**LEFT COLUMN - Carrier Details:**
- Carrier Name
- Type (Customer/Supplier/Bilateral)
- Time Zone
- Account Manager
- Customer Billing (Automatic/Manual)
- **Currency Section:** Primary Currency, Currency 2, Currency 3
- **Routing Section:** Capacity (Unrestricted or number), Circular Routing (Enabled/Disabled)
- [Edit] button

**MIDDLE COLUMN - Credit Control:**

Credit Control Table:
| Direction | $/£ | Credit | Remaining | Limit |
|-----------|-----|--------|-----------|-------|
| Customer | USD | -4,658.60 (green badge) | - | - |
| Supplier | USD | -2,925.54 (green badge) | - | - |
| Bilateral | USD | -1,733.07 (green badge) | 1,266.93 | -3,000 |

24 Hour Spend Limit Table:
| Direction | $/£ | 24 Hr Spend | Remaining | Limit | Action |
|-----------|-----|-------------|-----------|-------|--------|
| Customer | USD | 57.64 (green badge) | - | - | [Reset] |
| Supplier | USD | 2.28 (green badge) | - | - | [Reset] |

**RIGHT COLUMN - Credit Settings:**
- **Customer Credit Settings:** Credit Type, Bilateral Limit Breach, 24 Hr Spend Limit Breach, 24 Hr Spend Mode
- **Supplier Credit Settings:** Credit Type
- [Edit] button

#### Tab 2: Interconnects
- List of all interconnects under this carrier
- Actions: Add Interconnect
- Columns: Name, Direction, Currency, Status, Capacity
- Click row → Interconnect Detail page

#### Tab 3: Contact Details
- Add Contact button
- Contact list: Name, Role, Email, Phone
- Edit/Delete actions per contact

#### Tab 4: Accounting Details
- Customer Account Number, Supplier Account Number, Tax Code, Bill To, Ship To

#### Tab 5: Credit Alerts
- Add Alert button
- Alert list: Type, Threshold, Template, Recipients
- Alert Types: Low Balance, High Balance, 24-Hour Spend Breach

---

### DIGITALK INTERCONNECT DETAIL - TABS BY DIRECTION

**Customer Interconnect (Ingress) - 5 Tabs:**
1. Details - Capacity, Status, Signalling IPs
2. Ingress Validation - IP validation, Tech Prefix, From URI, Contact URI, Trunk Group, Max CPS
3. Ingress Translation - Origination Preference, PAI Generation, Number Translation
4. Media - Codecs, VAD, ptime, DTMF Detection, Media Relay, RTP Timeout
5. Signalling - Privacy Method, Session Timer, 100rel, Max Call Duration, Release Cause Mapping

**Supplier Interconnect (Egress) - 6 Tabs:**
1. Details - Capacity, Status, Supplier Rating Plan, Signalling IPs
2. Egress Routing - Tech Prefix, Send To IPs, Transport, Max CPS, Trunk Group, Blacklists
3. Egress Translations - PAI Generation, Block Invalid Origins, Number Translation
4. Media - Codecs, VAD, ptime, DTMF Detection, Media Relay
5. Signalling - Privacy Method, Session Timer, Max Call Duration, Release Cause Mapping
6. Monitoring - SIP OPTIONS ping, Call Response monitoring, Auto-disable/re-enable

---

### DIGITALK SERVICE - THE KEY RATING/ROUTING LINKAGE

**Where Services Live:** Under Interconnect Detail → Services Tab (for Customer Interconnects only)

**Add Service Dialog Fields:**
- Name
- **Customer Rating Plan** (THE KEY LINKAGE - how much customer pays)
- **Routing Plan** (THE KEY LINKAGE - where calls go)
- Currency (inherited from Interconnect)
- Time Class (when service is active)
- Capacity (channel limits)
- Allow Transcoding: Yes/No
- Routing Method: Route to Interconnect / Routing Plan
- NP Status, NP Plan
- Origination/Destination Blacklist + Exceptions
- Origination/Destination Matching

---

### SEPARATE PAGES (NOT in Carrier Detail)

- **Services:** Main view in navigation showing all services across all carriers
- **Trunk Groups:** Separate page for logical grouping of interconnects
- **Balance & Spend:** Views for 24 Hour Spend, Carrier Balances, Balance And Totals
- **Blacklisting:** Separate configuration page
- **Release Cause Mapping:** Separate configuration page

---

### IMPLEMENTATION TASK LIST

1. ❌ Build Carrier Detail Page with exact 5 tabs + 3-column layout for Tab 1
2. ❌ Build Customer Interconnect Detail with 5 tabs
3. ❌ Build Supplier Interconnect Detail with 6 tabs
4. ❌ Build Add/Edit Service Dialog with rating/routing assignment
5. ❌ Build Main Carriers page with View dropdown (Carriers/Interconnects/Services)
6. ❌ Build Balance & Spend views
7. ❌ Build Credit Alerts management
8. ❌ Build Contacts management
9. ❌ Schema updates for all Digitalk fields