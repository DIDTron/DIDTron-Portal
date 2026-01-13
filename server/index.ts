import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { integrationsRepository } from "./integrations-repository";
import { initializeRedisSession, acquireDistributedLock, releaseDistributedLock } from "./services/redis-session";
import { timingMiddleware } from "./middleware/timing";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const MemoryStoreSession = MemoryStore(session);

let sessionMiddlewareConfigured = false;

async function configureSessionMiddleware() {
  if (sessionMiddlewareConfigured) return;
  
  const { store: redisStore, isReady } = await initializeRedisSession();
  
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "didtron-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  };
  
  if (isReady && redisStore) {
    sessionConfig.store = redisStore;
    log("Using Upstash Redis for session storage", "session");
  } else {
    sessionConfig.store = new MemoryStoreSession({
      checkPeriod: 86400000,
    });
    log("Using MemoryStore for session storage (configure Upstash Redis for production)", "session");
  }
  
  app.use(session(sessionConfig));
  sessionMiddlewareConfigured = true;
}

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use(timingMiddleware);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || "info@didtron.com";
  const password = process.env.SUPER_ADMIN_PASSWORD;
  
  if (!password) {
    log("SUPER_ADMIN_PASSWORD not set - skipping super admin creation", "seed");
    return;
  }
  
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    log(`Super admin ${email} already exists`, "seed");
    return;
  }
  
  const hashedPassword = await hashPassword(password);
  await storage.createUser({
    email,
    password: hashedPassword,
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    status: "active",
  });
  
  log(`Super admin ${email} created successfully`, "seed");
}

async function seedDocumentation() {
  const existingCategories = await storage.getDocCategories();
  const existingArticles = await storage.getDocArticles();
  
  const existingCategorySlugs = new Set(existingCategories.map(c => c.slug));
  const existingArticleSlugs = new Set(existingArticles.map(a => a.slug));

  const categories = [
    { name: "Getting Started", slug: "getting-started", description: "Quick start guides and tutorials", icon: "rocket", displayOrder: 1, isPublished: true },
    { name: "API Reference", slug: "api-reference", description: "Complete REST API documentation", icon: "code", displayOrder: 2, isPublished: true },
    { name: "Voice Termination", slug: "voice-termination", description: "Voice routes and carrier configuration", icon: "phone", displayOrder: 3, isPublished: true },
    { name: "DIDs", slug: "dids", description: "Phone number management and provisioning", icon: "hash", displayOrder: 4, isPublished: true },
    { name: "Cloud PBX", slug: "cloud-pbx", description: "PBX features, IVR, and call routing", icon: "headphones", displayOrder: 5, isPublished: true },
    { name: "AI Voice Agent", slug: "ai-voice-agent", description: "AI-powered voice automation", icon: "bot", displayOrder: 6, isPublished: true },
    { name: "Billing & Payments", slug: "billing", description: "Payment methods and invoicing", icon: "credit-card", displayOrder: 7, isPublished: true },
    { name: "Webhooks", slug: "webhooks", description: "Real-time event notifications", icon: "webhook", displayOrder: 8, isPublished: true },
  ];

  const categorySlugToId: Record<string, string> = {};
  let categoriesCreated = 0;
  
  for (const existingCat of existingCategories) {
    categorySlugToId[existingCat.slug] = existingCat.id;
  }
  
  for (const cat of categories) {
    if (!existingCategorySlugs.has(cat.slug)) {
      const created = await storage.createDocCategory(cat);
      categorySlugToId[cat.slug] = created.id;
      categoriesCreated++;
    }
  }
  
  if (categoriesCreated > 0) {
    log(`Created ${categoriesCreated} new documentation categories`, "seed");
  }

  const articles = [
    {
      categorySlug: "getting-started",
      title: "Welcome to DIDTron",
      slug: "welcome",
      excerpt: "Learn the basics of the DIDTron VoIP platform",
      content: `# Welcome to DIDTron

DIDTron is a wholesale VoIP platform built for carriers, resellers, and enterprises. Our pay-as-you-go model means you only pay for what you use with no monthly commitments.

## Key Features

- Voice Termination with multiple quality tiers
- DID provisioning in 60+ countries
- Cloud PBX with advanced call routing
- AI Voice Agents for automation
- Class 4 Softswitch capabilities
- Real-time analytics and monitoring

## Quick Links

- Create your first route
- Purchase DIDs
- Set up your PBX
- Configure webhooks

## Support

Need help? Contact our 24/7 support team or browse our documentation.`,
      tags: ["introduction", "overview", "basics"],
      displayOrder: 1,
    },
    {
      categorySlug: "getting-started",
      title: "Authentication",
      slug: "authentication",
      excerpt: "How to authenticate with the DIDTron API",
      content: `# Authentication

All API requests require authentication using your API key.

## Getting Your API Key

1. Log in to your customer portal
2. Navigate to Settings > API Keys
3. Click "Generate New Key"
4. Copy your key (it will only be shown once)

## Using Your API Key

Include your API key in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Example Request

\`\`\`bash
curl -X GET "https://api.didtron.com/v1/account" \\
  -H "Authorization: Bearer dk_live_abc123..."
\`\`\`

## Rate Limits

- Standard accounts: 100 requests/minute
- Enterprise accounts: 1000 requests/minute

Rate limit headers are included in all responses.`,
      tags: ["authentication", "api-key", "security"],
      displayOrder: 2,
    },
    {
      categorySlug: "api-reference",
      title: "API Overview",
      slug: "overview",
      excerpt: "Introduction to the DIDTron REST API",
      content: `# API Overview

The DIDTron API is a RESTful API that uses JSON for request and response bodies.

## Base URL

\`\`\`
https://api.didtron.com/v1
\`\`\`

## Request Format

All requests must include:
- Content-Type: application/json
- Authorization: Bearer YOUR_API_KEY

## Response Format

All responses are JSON objects with the following structure:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 100
  }
}
\`\`\`

## Error Handling

Errors return appropriate HTTP status codes with details:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The 'destination' field is required"
  }
}
\`\`\`

## Common Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 429: Rate Limited
- 500: Server Error`,
      tags: ["api", "rest", "json"],
      displayOrder: 1,
    },
    {
      categorySlug: "api-reference",
      title: "Calls API",
      slug: "calls",
      excerpt: "Initiate and manage voice calls programmatically",
      content: `# Calls API

Programmatically initiate and manage voice calls.

## Initiate Call

POST /v1/calls

\`\`\`json
{
  "from": "+15551234567",
  "to": "+15559876543",
  "callerId": "+15551234567",
  "maxDuration": 3600,
  "record": false,
  "webhookUrl": "https://your-app.com/webhook"
}
\`\`\`

## Response

\`\`\`json
{
  "success": true,
  "data": {
    "callId": "call_abc123",
    "status": "initiated",
    "from": "+15551234567",
    "to": "+15559876543",
    "startedAt": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

## Get Call Status

GET /v1/calls/{callId}

## Hangup Call

POST /v1/calls/{callId}/hangup

## List Active Calls

GET /v1/calls?status=active&limit=50`,
      tags: ["calls", "voice", "api"],
      displayOrder: 2,
    },
    {
      categorySlug: "api-reference",
      title: "DIDs API",
      slug: "dids-api",
      excerpt: "Search, purchase, and manage phone numbers",
      content: `# DIDs API

Search available numbers and manage your DID inventory.

## Search Available Numbers

GET /v1/dids/available

Parameters:
- country: ISO country code (required)
- type: local, tollfree, mobile
- areaCode: Filter by area code
- contains: Number pattern to match
- limit: Results per page (max 100)

## Response

\`\`\`json
{
  "success": true,
  "data": [
    {
      "number": "+15551234567",
      "country": "US",
      "type": "local",
      "monthlyPrice": 1.50,
      "setupFee": 0,
      "features": ["sms", "voice", "fax"]
    }
  ]
}
\`\`\`

## Purchase Number

POST /v1/dids/purchase

\`\`\`json
{
  "number": "+15551234567",
  "autoRenew": true
}
\`\`\`

## List Your Numbers

GET /v1/dids

## Release Number

DELETE /v1/dids/{didId}`,
      tags: ["dids", "phone-numbers", "api"],
      displayOrder: 3,
    },
    {
      categorySlug: "voice-termination",
      title: "Voice Tiers Explained",
      slug: "voice-tiers",
      excerpt: "Understanding premium, standard, and economy routes",
      content: `# Voice Tiers Explained

DIDTron offers three voice termination quality tiers to match your use case and budget.

## Premium Tier ($0.015/min)

Best for business-critical calls requiring highest quality.

- Tier 1 direct routes
- Sub-50ms PDD
- 99.9% ASR guarantee
- Priority support
- Real-time quality monitoring

## Standard Tier ($0.012/min)

Balanced quality and cost for most business applications.

- Tier 1/2 hybrid routing
- Sub-100ms PDD
- 97% ASR target
- Standard support
- Quality alerts

## Economy Tier ($0.008/min)

Cost-effective routing for high-volume, non-critical traffic.

- LCR-optimized routing
- Variable PDD
- 90%+ ASR
- Email support
- Basic monitoring

## Choosing the Right Tier

Consider these factors:
- Call criticality
- Customer expectations
- Budget constraints
- Geographic coverage needs`,
      tags: ["termination", "quality", "routing", "pricing"],
      displayOrder: 1,
    },
    {
      categorySlug: "voice-termination",
      title: "Setting Up Routes",
      slug: "setting-up-routes",
      excerpt: "Configure voice routes and failover",
      content: `# Setting Up Routes

Configure intelligent call routing with automatic failover.

## Creating a Route

1. Navigate to Voice > Routes
2. Click "Add Route"
3. Enter route details:
   - Name: Descriptive identifier
   - Prefix: Destination pattern (e.g., 1 for US)
   - Carrier: Select your carrier
   - Priority: Lower = higher priority

## Route Matching

Routes are matched by:
1. Longest prefix match first
2. Priority order for equal prefixes
3. Failover to next route on failure

## Failover Configuration

Set up automatic failover:
- Max retries: 1-5 attempts
- Timeout: 5-30 seconds
- Failover triggers: SIP errors, PDD exceeded

## Testing Routes

Use the SIP Tester to validate:
- Connectivity
- Audio quality
- Latency measurements
- DTMF accuracy`,
      tags: ["routes", "configuration", "failover"],
      displayOrder: 2,
    },
    {
      categorySlug: "dids",
      title: "DID Features",
      slug: "did-features",
      excerpt: "Voice, SMS, and fax capabilities",
      content: `# DID Features

DIDTron DIDs support multiple communication channels.

## Voice Features

- Inbound call routing
- Caller ID customization
- Call forwarding
- Voicemail
- Call recording

## SMS Features

- Inbound SMS routing
- Outbound SMS (where supported)
- MMS support
- SMS webhooks

## Fax Features

- T.38 fax support
- Fax-to-email
- Email-to-fax
- PDF delivery

## Channel Availability

Not all features are available in all countries:

| Country | Voice | SMS | Fax |
|---------|-------|-----|-----|
| US/CA   | Yes   | Yes | Yes |
| UK      | Yes   | Yes | Yes |
| EU      | Yes   | Limited | Yes |
| APAC    | Yes   | Varies | Limited |`,
      tags: ["dids", "sms", "fax", "features"],
      displayOrder: 1,
    },
    {
      categorySlug: "cloud-pbx",
      title: "PBX Quick Start",
      slug: "pbx-quickstart",
      excerpt: "Set up your cloud PBX in minutes",
      content: `# PBX Quick Start

Get your Cloud PBX running in minutes.

## Step 1: Create Extensions

Navigate to PBX > Extensions and add users:
- Extension number (100-999)
- Name and email
- Password for SIP registration
- Voicemail settings

## Step 2: Set Up Inbound Routing

Configure how calls reach your extensions:
- Direct inward dial (DID to extension)
- IVR menu with options
- Ring groups for teams
- Queue for call center

## Step 3: Configure Outbound

Set up outbound calling:
- Assign DIDs for caller ID
- Route outbound via your carriers
- Set dialing permissions

## Step 4: Register Phones

Configure SIP phones with:
- Server: pbx.didtron.com
- Username: Extension number
- Password: Extension password
- Transport: TLS recommended

## Supported Devices

- Polycom VVX series
- Yealink T4/T5 series
- Grandstream GRP series
- Softphones (Zoiper, Bria)`,
      tags: ["pbx", "extensions", "quickstart"],
      displayOrder: 1,
    },
    {
      categorySlug: "ai-voice-agent",
      title: "Creating AI Agents",
      slug: "creating-agents",
      excerpt: "Build intelligent voice agents with AI",
      content: `# Creating AI Agents

Build AI-powered voice agents for automation.

## Understanding AI Agents

AI Voice Agents can:
- Answer inbound calls
- Make outbound calls
- Handle FAQs
- Book appointments
- Transfer to humans
- Send follow-up messages

## Creating Your First Agent

1. Navigate to AI Voice > Agents
2. Click "Create Agent"
3. Configure:
   - Name and description
   - Voice selection
   - Language settings
   - System prompt

## System Prompts

Define your agent's personality and knowledge:

\`\`\`
You are a helpful customer service agent for ACME Corp.
Be friendly but professional.
If asked about pricing, refer to the website.
For technical issues, collect details and create a ticket.
\`\`\`

## Training Data

Upload FAQs and knowledge base content to improve responses:
- Question/answer pairs
- Product documentation
- Policy information

## Testing

Use the test panel to:
- Simulate conversations
- Refine prompts
- Test edge cases`,
      tags: ["ai", "voice-agent", "automation"],
      displayOrder: 1,
    },
    {
      categorySlug: "billing",
      title: "Pay-As-You-Go Billing",
      slug: "pay-as-you-go",
      excerpt: "How our prepaid billing system works",
      content: `# Pay-As-You-Go Billing

DIDTron uses a prepaid balance system with no monthly fees.

## How It Works

1. Add funds to your account
2. Services deduct from your balance
3. Auto top-up prevents service interruption

## Adding Funds

Payment methods:
- Credit/Debit cards (Stripe)
- PayPal
- Crypto (Bitcoin, ETH, USDT)
- Wire transfer ($500 minimum)

## Pricing Examples

| Service | Rate |
|---------|------|
| Voice Termination | From $0.008/min |
| DIDs | $1.50/month |
| PBX Extensions | $3/extension/month |
| AI Voice Agent | $0.10/minute |
| SMS | $0.015/message |

## Auto Top-Up

Enable automatic balance replenishment:
- Set threshold (e.g., $50)
- Choose top-up amount (e.g., $200)
- Automatic charge when threshold reached

## Low Balance Alerts

Configure email notifications:
- Critical: $10 remaining
- Warning: $50 remaining
- Notice: $100 remaining`,
      tags: ["billing", "pricing", "prepaid"],
      displayOrder: 1,
    },
    {
      categorySlug: "webhooks",
      title: "Webhook Events",
      slug: "webhook-events",
      excerpt: "Real-time notifications for all platform events",
      content: `# Webhook Events

Receive real-time notifications for platform events.

## Available Events

### Call Events
- call.initiated
- call.answered
- call.completed
- call.failed

### DID Events
- did.purchased
- did.released
- did.renewal.upcoming
- did.renewal.failed

### SMS Events
- sms.received
- sms.delivered
- sms.failed

### Billing Events
- payment.received
- balance.low
- invoice.generated

## Webhook Payload

\`\`\`json
{
  "id": "evt_abc123",
  "type": "call.completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "data": {
    "callId": "call_xyz789",
    "from": "+15551234567",
    "to": "+15559876543",
    "duration": 180,
    "cost": 0.036
  }
}
\`\`\`

## Security

Verify webhook signatures:
- HMAC-SHA256 signature in X-Signature header
- Use your webhook secret to validate

## Retry Logic

Failed deliveries are retried:
- Attempt 2: 5 minutes
- Attempt 3: 30 minutes
- Attempt 4: 2 hours
- Attempt 5: 24 hours`,
      tags: ["webhooks", "events", "notifications"],
      displayOrder: 1,
    },
  ];

  let articlesCreated = 0;
  for (const article of articles) {
    if (existingArticleSlugs.has(article.slug)) {
      continue;
    }
    const categoryId = categorySlugToId[article.categorySlug];
    if (categoryId) {
      await storage.createDocArticle({
        categoryId,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        tags: article.tags,
        displayOrder: article.displayOrder,
        isPublished: true,
        viewCount: Math.floor(Math.random() * 500) + 50,
        helpfulCount: Math.floor(Math.random() * 50) + 5,
      });
      articlesCreated++;
    }
  }
  
  if (articlesCreated > 0) {
    log(`Created ${articlesCreated} new documentation articles`, "seed");
  }
  
  const totalCategories = Object.keys(categorySlugToId).length;
  const totalArticles = existingArticles.length + articlesCreated;
  log(`Documentation complete: ${totalCategories} categories, ${totalArticles} articles`, "seed");
}

async function seedPortalThemeVersions() {
  const portalThemeData: Record<string, any> = {
    super_admin: {
      primaryColor: "#2563EB",
      accentColor: "#3B82F6",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      logoUrl: "",
      faviconUrl: "",
      fontFamily: "Inter",
      borderRadius: "md",
      showAIVoice: true,
      showDIDs: true,
      showClass4: true,
      showPBX: true,
    },
    customer: {
      primaryColor: "#10B981",
      accentColor: "#34D399",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      logoUrl: "",
      faviconUrl: "",
      fontFamily: "Inter",
      borderRadius: "md",
      showAIVoice: true,
      showDIDs: true,
      showClass4: false,
      showPBX: true,
    },
    carrier: {
      primaryColor: "#14B8A6",
      accentColor: "#2DD4BF",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      logoUrl: "",
      faviconUrl: "",
      fontFamily: "Inter",
      borderRadius: "md",
      showAIVoice: false,
      showDIDs: true,
      showClass4: true,
      showPBX: false,
    },
    class4: {
      primaryColor: "#8B5CF6",
      accentColor: "#A78BFA",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      logoUrl: "",
      faviconUrl: "",
      fontFamily: "Inter",
      borderRadius: "md",
      showAIVoice: false,
      showDIDs: false,
      showClass4: true,
      showPBX: false,
    },
  };

  let versionsCreated = 0;
  for (const [slug, data] of Object.entries(portalThemeData)) {
    try {
      const contentItem = await storage.getEmContentItem("portal_themes", "theme", slug);
      if (contentItem && !contentItem.draftVersionId) {
        const version = await storage.createEmContentVersion({
          contentItemId: contentItem.id,
          version: 1,
          data,
          changeDescription: "Initial theme configuration",
          createdBy: null,
        });
        await storage.updateEmContentItem(contentItem.id, {
          draftVersionId: version.id,
          publishedVersionId: version.id,
        });
        versionsCreated++;
      }
    } catch (error) {
      log(`Failed to create theme version for ${slug}: ${error}`, "seed");
    }
  }
  
  if (versionsCreated > 0) {
    log(`Created ${versionsCreated} portal theme versions`, "seed");
  }
}

async function seedExperienceManager() {
  const existingItems = await storage.getAllEmContentItems();
  
  if (existingItems.length > 0) {
    // Always check and seed portal theme versions if missing (for existing content)
    await seedPortalThemeVersions();
    log(`Experience Manager already has ${existingItems.length} content items`, "seed");
    return;
  }

  const contentItems = [
    // Marketing Website
    { section: "marketing" as const, entityType: "page", slug: "homepage", name: "Homepage", status: "published" as const },
    { section: "marketing" as const, entityType: "page", slug: "pricing", name: "Pricing Page", status: "published" as const },
    { section: "marketing" as const, entityType: "page", slug: "features", name: "Features Page", status: "draft" as const },
    { section: "marketing" as const, entityType: "page", slug: "about", name: "About Us", status: "published" as const },
    { section: "marketing" as const, entityType: "page", slug: "contact", name: "Contact Page", status: "draft" as const },
    { section: "marketing" as const, entityType: "blog", slug: "getting-started-voip", name: "Getting Started with VoIP", status: "published" as const },
    { section: "marketing" as const, entityType: "blog", slug: "5g-voice", name: "5G and the Future of Voice", status: "preview" as const },
    
    // Portal Themes - these will be seeded with version data below
    { section: "portal_themes" as const, entityType: "theme", slug: "super_admin", name: "Super Admin Theme", status: "published" as const },
    { section: "portal_themes" as const, entityType: "theme", slug: "customer", name: "Customer Portal Theme", status: "published" as const },
    { section: "portal_themes" as const, entityType: "theme", slug: "carrier", name: "Carrier Portal Theme", status: "draft" as const },
    { section: "portal_themes" as const, entityType: "theme", slug: "class4", name: "Class 4 Portal Theme", status: "published" as const },
    
    // White-Label
    { section: "white_label" as const, entityType: "brand", slug: "default", name: "Default Brand", status: "published" as const },
    { section: "white_label" as const, entityType: "brand", slug: "acme-telecom", name: "Acme Telecom", status: "published" as const },
    { section: "white_label" as const, entityType: "brand", slug: "global-voice", name: "Global Voice Inc", status: "preview" as const },
    { section: "white_label" as const, entityType: "brand", slug: "techcom", name: "TechCom Solutions", status: "draft" as const },
    
    // Design System
    { section: "design_system" as const, entityType: "component", slug: "button", name: "Button Component", status: "published" as const },
    { section: "design_system" as const, entityType: "component", slug: "card", name: "Card Component", status: "published" as const },
    { section: "design_system" as const, entityType: "component", slug: "data-table", name: "Data Table Component", status: "published" as const },
    { section: "design_system" as const, entityType: "tokens", slug: "colors", name: "Color Tokens", status: "published" as const },
    { section: "design_system" as const, entityType: "tokens", slug: "typography", name: "Typography Tokens", status: "published" as const },
    { section: "design_system" as const, entityType: "tokens", slug: "spacing", name: "Spacing Tokens", status: "draft" as const },
  ];

  let created = 0;
  for (const item of contentItems) {
    try {
      await storage.createEmContentItem(item);
      created++;
    } catch (error) {
      log(`Failed to create EM content item ${item.slug}: ${error}`, "seed");
    }
  }

  // Now seed portal theme versions for newly created content items
  await seedPortalThemeVersions();

  log(`Experience Manager seeding complete: ${created} content items created`, "seed");
}

async function seedIntegrations() {
  try {
    await integrationsRepository.seedIntegrationsIfMissing();
    log("Integrations seeding complete", "seed");
  } catch (error) {
    log(`Failed to seed integrations: ${error}`, "seed");
  }
}

async function seedBillingTerms() {
  try {
    const existingTerms = await storage.getBillingTerms();
    if (existingTerms.length > 0) {
      log(`Billing terms already exist (${existingTerms.length} found)`, "seed");
      return;
    }

    const defaultTerms = [
      { code: "7/3", label: "Weekly (Due 3 Days)", cycleType: "weekly" as const, cycleDays: 7, dueDays: 3, anchorConfig: { dayOfWeek: 1 }, isDefault: false },
      { code: "7/7", label: "Weekly (Due 7 Days)", cycleType: "weekly" as const, cycleDays: 7, dueDays: 7, anchorConfig: { dayOfWeek: 1 }, isDefault: true },
      { code: "15/7", label: "Bi-Weekly (Due 7 Days)", cycleType: "semi_monthly" as const, cycleDays: 15, dueDays: 7, anchorConfig: { daysOfMonth: [1, 16] }, isDefault: false },
      { code: "15/15", label: "Bi-Weekly (Due 15 Days)", cycleType: "semi_monthly" as const, cycleDays: 15, dueDays: 15, anchorConfig: { daysOfMonth: [1, 16] }, isDefault: false },
      { code: "30/15", label: "Monthly (Due 15 Days)", cycleType: "monthly" as const, cycleDays: 30, dueDays: 15, anchorConfig: { dayOfMonth: 1 }, isDefault: false },
      { code: "30/30", label: "Monthly (Due 30 Days)", cycleType: "monthly" as const, cycleDays: 30, dueDays: 30, anchorConfig: { dayOfMonth: 1 }, isDefault: false },
    ];

    let created = 0;
    for (const term of defaultTerms) {
      await storage.createBillingTerm(term);
      created++;
    }

    log(`Created ${created} default billing terms`, "seed");
  } catch (error) {
    log(`Failed to seed billing terms: ${error}`, "seed");
  }
}

(async () => {
  await configureSessionMiddleware();
  await seedSuperAdmin();
  await storage.seedReferenceDataToPostgres(); // Seed customer categories/groups to PostgreSQL
  await seedDocumentation();
  await seedExperienceManager();
  await seedIntegrations();
  await seedBillingTerms();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    async () => {
      log(`serving on port ${port}`);
      
      // Initialize job queue with database support, then start worker
      try {
        const { ensureJobQueueInitialized } = await import("./job-queue");
        await ensureJobQueueInitialized();
        
        const { startJobWorker } = await import("./job-worker");
        await startJobWorker();
        log("Job worker started automatically", "job-queue");
      } catch (error) {
        log(`Job worker auto-start failed: ${error}`, "job-queue");
      }

      // Initialize integrations and load credentials into services
      try {
        const { initializeIntegrations } = await import("./services/integrations");
        await initializeIntegrations(storage);
        
        // Load credentials into services that need them
        const { brevoService } = await import("./brevo");
        await brevoService.loadCredentialsFromStorage(storage);
        
        const { connexcsTools } = await import("./connexcs-tools-service");
        await connexcsTools.loadCredentialsFromStorage(storage);
        
        // Auto-sync ConnexCS data on startup (non-blocking)
        // IMPORTANT: ConnexCS API has a 2-session limit - serialize ALL operations
        setTimeout(async () => {
          const apiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
          
          // Acquire distributed lock for initial ConnexCS sync
          const connexcsSyncLockKey = "didtron:lock:connexcs-initial-sync";
          const lockAcquired = await acquireDistributedLock(connexcsSyncLockKey, 600); // 10 min TTL for full sync
          if (!lockAcquired) {
            log("ConnexCS initial sync skipped - another instance holds the lock", "connexcs-sync");
            return;
          }
          
          try {
            const status = await connexcsTools.getStatus(storage);
            if (status.connected && !status.mockMode) {
              log("Starting automatic ConnexCS data sync...", "connexcs-sync");
              const { 
                syncCustomers, syncCarriers, syncRateCards, syncCDRs,
                syncBalances, syncRoutes, syncScripts, calculateCDRStats
              } = await import("./services/connexcs-sync");
              
              // === PHASE 1: Entity Sync (ONE AT A TIME to avoid 2-session limit) ===
              const customers = await syncCustomers();
              log(`Customer sync: ${customers.imported + customers.updated} records`, "connexcs-sync");
              await apiDelay(5000);
              
              const carriers = await syncCarriers();
              log(`Carrier sync: ${carriers.imported + carriers.updated} records`, "connexcs-sync");
              await apiDelay(5000);
              
              const ratecards = await syncRateCards();
              log(`Rate card sync: ${ratecards.imported + ratecards.updated} records`, "connexcs-sync");
              await apiDelay(5000);
              
              // === PHASE 2: Balance Sync (uses customer data) ===
              const balances = await syncBalances();
              log(`Balance sync: ${balances.imported + balances.updated} records`, "connexcs-sync");
              await apiDelay(5000);
              
              // === PHASE 3: Routes Sync ===
              const routes = await syncRoutes();
              log(`Route sync: ${routes.imported + routes.updated} records`, "connexcs-sync");
              await apiDelay(5000);
              
              // === PHASE 4: ScriptForge Sync ===
              const scripts = await syncScripts();
              log(`ScriptForge sync: ${scripts.imported + scripts.updated} records`, "connexcs-sync");
              
              log(`Entity sync complete: ${customers.imported + customers.updated} customers, ${carriers.imported + carriers.updated} carriers, ${ratecards.imported + ratecards.updated} ratecards, ${balances.imported + balances.updated} balances, ${routes.imported + routes.updated} routes, ${scripts.imported + scripts.updated} scripts`, "connexcs-sync");
              
              // === PHASE 5: CDR Sync (TEMPORARILY DISABLED - memory issues) ===
              log("CDR sync temporarily disabled to prevent memory issues", "connexcs-sync");
              // const cdrTestResult = await connexcsTools.testCDRAccess(storage);
              // ... CDR sync code disabled
              
              log(`Auto-sync complete`, "connexcs-sync");
              
              // === BACKGROUND: Schedule periodic balance sync (every 5 minutes) with distributed lock ===
              setInterval(async () => {
                const lockKey = "didtron:lock:balance-sync";
                const lockAcquired = await acquireDistributedLock(lockKey, 120);
                if (!lockAcquired) {
                  log("Balance sync skipped - another instance holds the lock", "connexcs-sync");
                  return;
                }
                try {
                  const balanceResult = await syncBalances();
                  log(`Periodic balance sync: ${balanceResult.imported + balanceResult.updated} records`, "connexcs-sync");
                } catch (err) {
                  log(`Periodic balance sync failed: ${err}`, "connexcs-sync");
                } finally {
                  await releaseDistributedLock(lockKey);
                }
              }, 5 * 60 * 1000); // Every 5 minutes
            }
          } catch (err) {
            log(`Auto-sync failed: ${err}`, "connexcs-sync");
          } finally {
            // Always release the initial sync lock
            await releaseDistributedLock(connexcsSyncLockKey);
          }
        }, 5000); // Wait 5 seconds for services to stabilize
      } catch (error) {
        log(`Integration initialization failed: ${error}`, "integrations");
      }

      // Start Open Exchange Rates hourly sync scheduler
      try {
        const { startScheduler } = await import("./services/open-exchange-rates");
        startScheduler();
      } catch (error) {
        log(`OpenExchange scheduler failed to start: ${error}`, "scheduler");
      }

      // Initialize Cloudflare R2 storage
      try {
        const { initializeR2Storage } = await import("./services/r2-storage");
        const r2Ready = await initializeR2Storage();
        if (r2Ready) {
          log("Cloudflare R2 storage initialized", "r2");
        } else {
          log("Cloudflare R2 not configured - file uploads will fail", "r2");
        }
      } catch (error) {
        log(`R2 initialization failed: ${error}`, "r2");
      }
    },
  );
})();
