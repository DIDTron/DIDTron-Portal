# DIDTron Communications - Design Guidelines

## Design Approach
**Enterprise SaaS Dashboard System**: Professional B2B wholesale VoIP platform combining Stripe's enterprise polish with Linear's information density. Four distinct portals unified by cohesive design language with portal-specific accent variations.

## Design Principles
- **Enterprise-grade professionalism**: Trustworthy, polished, telecommunications-focused
- **Information density**: Dashboard-first layouts optimizing for data visibility
- **Portal differentiation**: Subtle accent variations maintaining brand cohesion
- **Dark mode native**: Designed for extended monitoring sessions

## Typography
- **Headings**: Open Sans (600-700 weight) - professional, highly legible
- **Body**: Open Sans (400-500 weight)
- **Monospace**: Menlo for technical data, API endpoints, SIP addresses
- **Hierarchy**: h1: text-4xl lg:text-5xl, h2: text-3xl, h3: text-2xl, h4: text-xl, body: text-base

## Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24
- Section padding: py-12 md:py-20
- Component spacing: gap-6 md:gap-8
- Container: max-w-7xl with px-6 md:px-8
- Dashboard cards: p-6
- Table cells: px-4 py-3

## Portal-Specific Accents
**Main Marketing**: Blue #2563EB throughout  
**Customer Portal**: Blue primary with blue accent highlights  
**Carrier Portal**: Teal accents (chart-2 from theme) for differentiation  
**Super Admin**: Indigo accents for administrative hierarchy

## Marketing Website Structure

### Hero Section
**Full-width split layout**:
- Left (50%): Bold headline "Enterprise VoIP Wholesale Platform", subheading, two CTAs ("Start Free Trial" + "View Pricing"), trust line ("Trusted by 200+ carriers worldwide")
- Right (50%): Large dashboard screenshot showing real-time call metrics interface
- Height: min-h-[700px] with gradient overlay background
- Include subtle grid pattern background

### Platform Capabilities (3-column grid)
Cards showcasing:
- Wholesale voice termination
- DID number management  
- Real-time call routing
- Carrier interconnection
- Billing & invoicing automation
- Advanced analytics & reporting

Each card: Icon (24px), title, 2-line description, underline link

### Portal Showcase (4-column)
Visual cards for each portal with screenshots:
- Customer portal preview
- Carrier portal preview
- Admin portal preview
- API documentation portal

### Real-Time Monitoring Section
2-column alternating layout:
- Live call statistics dashboard mockup
- Network status monitoring interface
- Quality metrics visualization
- Fraud detection alerts

### Pricing Table
3-tier comparison (Starter, Professional, Enterprise):
- Feature checkmarks per tier
- Prominent CTAs
- "Contact Sales" for Enterprise

### Integration Partners
4-column logo grid with border cards showing VoIP/telecom integrations

### Trust Section
3-column: Customer testimonials with company logos, uptime statistics (99.99%), compliance badges

## Component Library

### Navigation
Fixed header with subtle border-bottom:
- Logo left
- Main nav center (Platform, Portals, Pricing, API, Docs, Support)
- Login + "Get Started" CTA right
- Height: h-16

### Dashboard Cards
- Border: border with theme border color
- Rounded: rounded-lg (0.875rem from theme)
- Padding: p-6
- Flat design: No shadow elevation
- Hover: Subtle border color change only

### Data Tables
- Header row: Sticky with border-b-2
- Alternating rows: Subtle background variation
- Cell padding: px-4 py-3
- Sortable column indicators
- Row hover: Background highlight
- Compact mode option for dense data

### Forms
- Input fields: border, rounded-lg, px-4 py-3, focus ring
- Labels: text-sm font-medium mb-2
- Inline validation with icon + message
- Field groups with proper spacing (space-y-4)

### Monitoring Widgets
- Metric cards: Large number display (text-3xl) + trend indicator
- Status indicators: Colored dots (8px) + label
- Mini charts: Sparklines for trends
- Alert badges: Rounded-full with counts

### Buttons
- Primary: Solid background, rounded-lg, px-6 py-3, font-medium
- Secondary: Border-2, rounded-lg, px-6 py-3
- Ghost: Transparent with hover background
- On images: Backdrop-blur-md background overlay

### Filters & Search
- Search bar: Leading icon, rounded-lg, w-full md:w-96
- Filter dropdowns: Border, rounded-lg
- Active filter chips: Removable with X icon

### Footer
4-column layout:
- Company info + logo
- Products (Portal links)
- Resources (Docs, API, Status Page)
- Contact (Support, Sales, Social links)
- Bottom bar: Copyright, legal links

## Images

### Hero Image
Large, high-fidelity dashboard screenshot showing DIDTron platform interface with real-time call statistics, graphs, and monitoring data. Position: right 50% of hero section. Should display professional data visualization with charts and metrics.

### Feature Images
- Portal interface screenshots for each section
- Network topology diagrams
- Real-time monitoring dashboards
- Call routing flow visualizations
- Analytics reporting interfaces

### Background Treatments
- Subtle dot grid patterns (low opacity) for section backgrounds
- Gradient overlays on hero (dark to transparent)
- Telecommunications-themed geometric patterns

## Dashboard-Specific Elements

### Metrics Display
- Large number typography for KPIs (text-4xl font-bold)
- Percentage changes with color indicators
- Time range selectors (24h, 7d, 30d, Custom)

### Status Indicators
- Online/Offline dots: 8px rounded-full
- Health status: Green/Yellow/Red with labels
- Real-time badges: "LIVE" pulsing indicator

### Data Visualization
- Line charts for call volume trends
- Bar charts for geographic distribution
- Donut charts for resource utilization
- Heatmaps for peak traffic periods

## Responsive Behavior
- Desktop: Multi-column dashboards, side-by-side data views
- Tablet: 2-column maximum, stacked cards
- Mobile: Single column, collapsible table views, bottom sheet filters
- Navigation: Hamburger menu on mobile with slide-out drawer

## Animation
Minimal and purposeful only:
- Fade-in on scroll for marketing sections
- Number counting for statistics
- Skeleton loading states for dashboard data
- NO decorative animations
- Smooth transitions on interactive elements (150ms)

## Accessibility
- High contrast ratios in both light/dark modes
- Focus indicators on all interactive elements
- Keyboard navigation support throughout
- Screen reader labels for data visualizations
- ARIA labels for dashboard metrics