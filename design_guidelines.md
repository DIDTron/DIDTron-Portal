# ConnexCS Customer Portal - Design Guidelines

## Design Approach
**System-Based with Reference**: Combining Linear's clean dashboard aesthetic with Stripe's professional B2B polish. This is an enterprise telecom platform requiring clarity, trust, and technical sophistication.

## Design Principles
- **Enterprise credibility**: Professional, polished, and trustworthy
- **Technical clarity**: Complex features made accessible
- **Dashboard-first thinking**: Information hierarchy optimized for data density
- **Automation-forward**: Highlight automation capabilities prominently

## Typography
- **Headings**: Inter or DM Sans (600-700 weight)
- **Body**: Inter (400-500 weight)
- **Code/Technical**: JetBrains Mono for API examples, technical specs
- **Scale**: text-xs to text-6xl with clear hierarchy (h1: text-4xl/5xl, h2: text-3xl, h3: text-xl)

## Layout System
**Spacing Units**: Use Tailwind's 4, 6, 8, 12, 16, 20, 24 units
- Section padding: py-16 md:py-24
- Component spacing: gap-6 md:gap-8
- Container: max-w-7xl with px-4 md:px-8

## Page Structure

### Hero Section
**Full-width split layout** (not centered):
- Left: Value proposition, CTA buttons, trust indicators ("Powering 500+ telecom businesses")
- Right: Dashboard preview screenshot or animated API visualization
- Height: min-h-[600px] with natural flow
- Background: Subtle gradient or geometric pattern overlay

### Services Showcase (Multi-column)
3-column grid (lg:grid-cols-3 md:grid-cols-2) featuring:
- Voice routing automation
- Script Forge integrations
- ISA capabilities
- API management
- Real-time analytics
Each card: Icon, title, description, "Learn more" link

### Integration Gallery
4-column grid showcasing ConnexCS integrations with logos and connection indicators

### Automation Features Section
2-column layout alternating image/content:
- Script Forge automation examples
- ISA scripting capabilities
- Webhook integrations
- Custom workflow demonstrations

### API Documentation Preview
Single column with code snippet carousel showing API examples, syntax-highlighted

### Pricing/Plans Table
Comparison table with 3-4 tiers, feature checkmarks, prominent CTAs

### Trust Section
3-column grid: Customer logos, testimonials with company names, uptime statistics

## Component Library

### Navigation
Sticky header with:
- Logo left
- Main nav center (Products, Integrations, API, Docs, Pricing)
- Login + "Get Started" CTA right
- Subtle shadow on scroll

### Cards
- Border: border border-gray-200
- Padding: p-6
- Hover: Subtle lift (shadow transition)
- Icons: 24px, positioned top-left

### Buttons
Primary: Bold, rounded-lg, px-6 py-3
Secondary: Outlined with border-2
Text: Underline decoration on hover

### Forms
- Input fields: border-2, rounded-lg, px-4 py-3
- Labels: text-sm font-medium above inputs
- Validation states with inline messaging

### Dashboard Preview Components
- Metric cards with large numbers
- Mini charts/graphs
- Status indicators (online/offline dots)
- Table previews with alternating rows

### Footer
4-column layout:
- Column 1: Logo + tagline
- Column 2: Product links
- Column 3: Resources (Docs, API, Support)
- Column 4: Contact info + social links
- Bottom bar: Legal links, copyright

## Images

### Hero Image
Large dashboard screenshot or isometric illustration of telecom infrastructure/network visualization showing ConnexCS platform in action. Position: right side of split hero, approximately 50% width on desktop.

### Feature Images
- Automation workflow diagrams
- Script Forge interface screenshots
- API documentation interface
- Real-time dashboard analytics views

### Integration Logos
Actual ConnexCS integration partner logos (from their docs) in a grid

### Background Treatments
Subtle grid patterns, dot matrices, or circuit-board-inspired graphics for section backgrounds (low opacity)

## Special Considerations

### Technical Audience
- Include code snippets prominently
- Show actual API examples
- Display technical metrics (latency, uptime, throughput)
- Use technical terminology confidently

### Dashboard Elements
Portal sections should preview:
- Connection status indicators
- Real-time call statistics
- Account balance/usage meters
- Quick action buttons

### Trust Signals Throughout
- Security badges
- Compliance certifications (ISO, SOC2 if applicable)
- Uptime guarantees
- Customer count

### Responsive Behavior
- Desktop: Multi-column layouts with sidebars
- Tablet: 2-column maximum
- Mobile: Stack everything, maintain button prominence

## Animation
Minimal, purposeful only:
- Fade-in on scroll for section reveals
- Number counting for statistics
- Subtle hover states on cards
- NO distracting motion graphics

This creates a professional, enterprise-grade platform that positions your ConnexCS reseller portal as a sophisticated, trustworthy solution for telecom businesses.