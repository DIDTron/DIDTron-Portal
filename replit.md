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
The platform uses a VitalPBX-like layout with a double sidebar, two headers, a fixed action dock, and content tabs. The design is an "Enterprise SaaS Dashboard System," combining Stripe's polish with Linear's information density, featuring a native dark mode and DIDTron Blue (#2563EB) as the primary accent. The Experience Manager unifies control over the marketing website, portal themes, white-labeling, design system, and documentation, following a Draft/Preview/Publish workflow. All data tables in the Super Admin portal must include the `DataTableFooter` component for consistent pagination.

## CRITICAL: Component Library Workflow (MANDATORY FOR ALL VISUAL DEVELOPMENT)

**The Component Library (`/admin/experience-manager/component-library`) is the ONLY source of truth for creating ANY visual element in the platform. This rule applies FOREVER to all development.**

### Mandatory Workflow for Creating New Pages/Modules:

1. **CHECK COMPONENT LIBRARY FIRST** - Before building anything visual, ALWAYS reference the Component Library to see what components are available (51+ components documented)

2. **USE ONLY DOCUMENTED COMPONENTS** - Only use components that exist in the library (Button, Card, Table, Badge, Dialog, Select, Tabs, etc.) with their documented variants and patterns

3. **IF A NEW COMPONENT IS NEEDED**:
   - FIRST: Add it to `/client/src/pages/admin/em-component-library.tsx` with:
     - Name and description
     - Category (inputs, display, feedback, navigation, layout, overlay, data, custom)
     - All variants and their use cases
     - Code example showing proper usage
     - Live preview with data-testid attributes
   - THEN: Use it in the new page/module

4. **FOLLOW PLATFORM STANDARDS**:
   - Use `DataTableFooter` for ALL data tables
   - Follow VitalPBX-style layout with double sidebars
   - Apply proper `data-testid` attributes to ALL interactive elements
   - Use existing color tokens and design system

5. **IMPLEMENT AUDIT LOGGING** - All CRUD operations in new modules must be logged

### Component Categories (51+ Components):
- **Inputs**: Button, Input, Textarea, Select, Checkbox, Switch, RadioGroup, Slider, Calendar, Command, InputOTP, Form
- **Display**: Badge, Avatar, Card, Table, Progress, Skeleton, Separator, Carousel
- **Feedback**: Alert, AlertDialog, Toast, Toaster, Progress
- **Navigation**: Tabs, Accordion, Breadcrumb, ContextMenu, DropdownMenu, Menubar, NavigationMenu, Pagination
- **Layout**: Card, ScrollArea, AspectRatio, Resizable, Collapsible, Separator, CardFooter, ScrollBar
- **Overlay**: Dialog, Sheet, Popover, Tooltip, HoverCard, Drawer
- **Data**: DataTableFooter, Table with pagination, Chart
- **Custom**: SidebarComponent, Form patterns

**This ensures consistency across the entire platform and prevents UI fragmentation.**

### Technical Implementations
Key features include billing, referral system, promo codes, email communications, AI-powered social media management, support tickets, webhooks, API, CMS, white-labeling, audit/compliance, and multi-currency support. VoIP products include Voice Termination, DIDs, Cloud PBX, AI Voice Agents, a Class 4 Softswitch, and a SIP Tester module with monitoring and alerts. An automated Testing Engine, a metadata-driven system, enables comprehensive testing of modules, pages, and features across various levels. All data modification operations must go through a job queue for auditing. All user actions in the Super Admin portal are logged, and deleted records are soft-deleted with configurable retention.

## CRITICAL: Data Refresh Patterns (MANDATORY FOR ALL DATA-DRIVEN PAGES)

**All pages with refresh buttons or auto-refresh must follow these patterns:**

### Refresh Button Pattern
```tsx
// 1. Get refetch and isFetching from useQuery
const { data, isFetching, refetch } = useQuery<DataType>({
  queryKey: ["/api/endpoint"],
});

// 2. Refresh button uses refetch() directly, spinner uses isFetching
<Button
  variant="outline"
  size="icon"
  onClick={() => refetch()}
  disabled={isFetching}
  data-testid="button-refresh"
>
  <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
</Button>
```

### Auto-Refresh Pattern
```tsx
const [autoRefresh, setAutoRefresh] = useState(false);

const { data, isFetching, refetch } = useQuery<DataType>({
  queryKey: ["/api/endpoint"],
  refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30s when enabled
});

// Spinner ONLY when actually fetching - NEVER based on autoRefresh alone
<RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
```

### Multiple Queries Pattern
```tsx
// Track isFetching from all queries
const { data: data1, isFetching: fetching1 } = useQuery(...);
const { data: data2, isFetching: fetching2 } = useQuery(...);

const isAnyFetching = fetching1 || fetching2;

// Use combined state for spinner
<RefreshCw className={`h-4 w-4 ${isAnyFetching ? "animate-spin" : ""}`} />
```

**Key Rules:**
1. NEVER spin the refresh icon when `autoRefresh` is true - only when `isFetching` is true
2. ALWAYS use `refetch()` for refresh buttons (not just `invalidateQueries`)
3. ALWAYS use `isFetching` (not `isLoading`) - `isLoading` is only true on first load
4. For multiple queries, combine all `isFetching` states with OR

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