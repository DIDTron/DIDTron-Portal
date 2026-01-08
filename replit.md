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

## Development Testing Rules

### Auto-Test Requirement
**IMPORTANT**: All new features MUST be tested with fake super admin actions before completion:
1. **Credentials**: Super admin test credentials are stored in Replit secrets (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`)
2. **Testing Process**: After building any feature, simulate realistic user actions to verify functionality
3. **Test Logging**: All tests MUST be logged in the "Dev Tests" module (`/admin/dev-tests`) with:
   - Test name and description
   - Module/feature being tested
   - Test steps performed
   - Expected vs actual results
   - Pass/fail status
   - Timestamp and duration
4. **Cleanup Rule**: If test creates non-real data (test records), delete them after verification
5. **History**: All test history is preserved for review and debugging purposes

### Dev Tests Module Location
- Super Admin Portal: `/admin/dev-tests`
- Shows all development tests with filtering by status, module, and date
- Allows viewing detailed test steps and results
- **Database Persistence**: Dev Tests are stored in PostgreSQL via `dev-tests-repository.ts` to ensure tests survive server restarts
- **Critical Rule**: NEVER use MemStorage for data that must persist across server restarts - always use database repositories with Drizzle ORM

## Audit & Compliance Rules

### Core Principles
1. **ALL data modification operations MUST go through the job queue** - Imports, bulk deletes, syncs, and any operation affecting multiple records must be queued for audit trail and progress tracking
2. **ALL user actions in Super Admin portal are logged** - From login to logout, every action is tracked with userId, action, table, recordId, oldValues, newValues, IP, userAgent, timestamp
3. **Deleted records are retained in trash with configurable retention** - Soft delete with restore capability; retention period configurable (7, 10, 14, 30, 60, 90 days) via Global Settings
4. **Rollback capability** - Audit log entries with oldValues can be rolled back; completed import jobs can be undone
5. **Audit logs can be manually purged** - Super Admin can delete all audit logs with confirmation popup (type DELETE to confirm)

### Auto-Update Rule
**IMPORTANT**: When ANY new module is added to the Super Admin sidebar (PrimarySidebar or SecondarySidebar), or existing modules are moved/renamed:
- The audit logging MUST be implemented for that module
- ALL CRUD operations and significant actions must be logged
- This applies automatically - no need to ask, just implement

### Audit Events by Module
All modules in Super Admin portal must log these event types:
- **Authentication**: Login success/failed, Logout, Session timeout, Password reset/changed
- **All Data Modules**: Create, Update, Delete, Status changed, Import started/completed/failed
- **Billing Modules**: Additionally log Balance adjusted, Payment received/refunded, Invoice sent/paid
- **Settings**: Configuration changed, Integration enabled/disabled, API key rotated
- **Job Queue**: Job created, completed, failed, retried, cancelled, undo initiated
- **Trash**: Record moved to trash, restored, purged

### Current Super Admin Modules (60+ modules)
Dashboard, POPs, Voice Tiers, Codecs, Channel Plans, Carriers, Routes, Rate Cards (Customer/Carrier), DID Countries/Providers/Inventory, Customers, Categories, Groups, KYC, Invoices, Payments, Currencies, Referrals, Promo Codes, Bonuses, Social Accounts/Posts, Email Templates, Metrics, CDRs, Alerts, Monitoring Rules, SIP Tester, AI Voice (Dashboard/Agents/Knowledge Bases/Campaigns/Call Logs/Analytics/Billing/Settings/Assignments), Class 4 (Customers/Carriers/Rate Cards), Experience Manager (Dashboard/Marketing Website/Portal Themes/White-Label/Design System/Documentation), Admin Users, Roles, Audit Logs, Tickets, Job Queue, Settings (General/API Keys/Webhooks/Integrations/ConnexCS Status), Global Settings (Platform/Currencies/Localization/A-Z Database), Trash

## Experience Manager (Replaced CMS - January 2026)

The Experience Manager is a unified control center that replaces the old CMS modules. It provides complete control over:

### Structure
- **Dashboard** (`/admin/experience-manager`): Overview with recent changes, quick actions, UI health metrics
- **Marketing Website** (`/admin/experience-manager/marketing`): Landing page builder with section templates (Hero, Features, Pricing, Testimonials, CTA, Stats, FAQ, Content, Partners, Contact), Blog posts, Documentation management, Media Library
- **Portal Themes** (`/admin/experience-manager/portal-themes`): Theme editor for each portal type (Super Admin, Customer, Carrier, Class 4) with live preview, color pickers, logo upload, feature visibility toggles
- **White-Label** (`/admin/experience-manager/white-label`): Customer brands registry, custom domain management, login page customization per customer
- **Design System** (`/admin/experience-manager/design-system`): Component inventory with adoption status, design tokens viewer, UI Health Score dashboard, publish history log
- **Documentation** (`/admin/documentation`): API and help documentation management

### Design System Files
- `DESIGN_SYSTEM.md`: Single source of truth for all design tokens, components, patterns, and usage rules
- `UI_DEBT.md`: Tracks UI inconsistencies and migration priorities

### Workflow
All Experience Manager changes follow a Draft/Preview/Publish workflow:
1. Changes saved as drafts automatically
2. Preview in sandbox mode before publishing
3. Publish to live with validation checks
4. Full audit trail of all changes

## UI Component Standards

### Data Table Footer (Pagination)
**ALL data tables in the Super Admin portal MUST include the DataTableFooter component** for consistent pagination. This applies to any list view displaying records.

**Usage Pattern:**
```tsx
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";

// In your component:
const {
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  paginatedItems,
  onPageChange,
  onPageSizeChange,
} = useDataTablePagination(filteredData, 10);

// In JSX - after the Table component:
<DataTableFooter
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={onPageChange}
  onPageSizeChange={onPageSizeChange}
/>
```

**Features:**
- Rows per page selector (10, 25, 50, 100)
- "Showing X-Y of Z" text
- Previous/Next navigation buttons
- Direct page number input
- Responsive layout with proper spacing

**Auto-Apply Rule:** When creating ANY new page with a data table, automatically include the DataTableFooter component.

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