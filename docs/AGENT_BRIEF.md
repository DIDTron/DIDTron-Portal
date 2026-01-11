# DIDTron Communications - Agent Brief

## Project Overview
DIDTron Communications is an AI-first, white-label wholesale VoIP platform. The Class 4 Softswitch module replicates Digitalk Carrier Cloud Manager 100% (UI/UX and functionality).

## Business Model
- **Pricing**: $25/month minimum topup + $0.0006/min billing
- **Backend Cost**: ConnexCS $0.0003/min = 50% margin
- **Customer Registration**: pbx.didtron.com
- **Customer Portal**: switch.pbx.didtron.com
- **Build Order**: Super Admin portal FIRST, then copy to customer portal

## Production Requirements

### UX Rules
1. VitalPBX-style UI LAYOUT for all portals (NOT the green colors)
2. Keep DIDTron Blue (#2563EB) as primary accent
3. Light/dark/system mode toggle
4. Double sidebar layout: Primary → Secondary → Content
5. Navigation: Module clicks → first actual page (no placeholder overviews)
6. All data tables must include DataTableFooter component

### Reference Documentation
1. **PDF**: `attached_assets/UG-025-274_-_Carrier_Cloud_Manager_1768072023661.pdf` (1638 pages)
2. **Text Extract**: `attached_assets/3-ManagingCarriers_1768085684244.txt`
3. **Tango Workflows** (361 screenshots):
   - Manage Carriers and Services (99 steps)
   - Configure Carrier Contacts and Alerts (32 steps)
   - Configure Digitalk Carrier Cloud Settings (99 steps)
   - Configure Privacy and Rating (32 steps)

### Non-Drift Policy
- NEVER invent features not requested
- NEVER add "nice-to-have" improvements without TODO items
- NEVER migrate architecture without explicit approval
- NEVER change libraries/framework decisions silently
- ALWAYS reuse existing shared components
- ALWAYS follow established patterns

### Constraints
- Pure pay-as-you-go pricing (NO subscriptions ever)
- Features visibility based on customer category/group
- Platform sync for all carrier/route operations
- All data modifications routed through job queue for auditing
- Soft deletion with configurable retention

## External Dependencies
- **Stripe**: Payments and KYC identity verification
- **ConnexCS**: Class 4 Softswitch for call routing, CDR generation
- **Brevo**: Transactional email services
- **OpenAI GPT-4o**: All AI features via Replit AI
- **PostgreSQL + Drizzle ORM**: Database layer

## Current Focus
Building the Class 4 Softswitch module that exactly matches Digitalk Carrier Cloud Manager UI/UX and functionality.
