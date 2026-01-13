# DIDTron - Database Schema

## Core Entities

### Carriers (carriers)
```
id: varchar (UUID)
name: text
code: text (unique)
partnerType: enum (customer | supplier | bilateral)
status: enum (active | paused | disabled | testing)

# Credit Control
primaryCurrencyId: FK → currencies
customerCreditType: enum (prepaid | postpaid)
customerCreditLimit: decimal
customerBalance: decimal
supplierCreditType: enum (prepaid | postpaid)
supplierBalance: decimal
bilateralBalance: decimal
bilateralCreditLimit: decimal

# 24hr Spend
customer24HrSpendLimit: decimal
customer24HrSpend: decimal
supplier24HrSpendLimit: decimal
supplier24HrSpend: decimal

# Capacity
capacityMode: enum (unrestricted | capped)
capacityLimit: integer
circularRouting: boolean

# Accounting
customerAccountNumber: text
supplierAccountNumber: text
taxCode: text
billTo: text
shipTo: text
```

### Carrier Interconnects (carrier_interconnects)
```
id: varchar (UUID)
shortCode: text (auto-generated, e.g., I1, I2, I3 - used for URL routing)
carrierId: FK → carriers
name: text
direction: text (ingress | egress | both)
currencyCode: text
protocol: text (SIP)
capacityMode: enum
capacityLimit: integer
isActive: boolean
techPrefix: text
ipAddress: text
sipPort: integer
```

### Carrier Services (carrier_services)
The KEY LINKAGE: Interconnect → Rating Plan + Routing Plan
```
id: varchar (UUID)
shortCode: text (auto-generated, e.g., S1, S2, S3 - used for URL routing)
carrierId: FK → carriers
interconnectId: FK → carrier_interconnects
name: text
direction: text (ingress | egress)
status: enum
ratingPlanId: FK → rate_cards
routingPlanId: varchar
techPrefix: text
priority: integer
weight: integer
capacityMode: enum
capacityLimit: integer
enforcementPolicy: text
```

### Carrier Contacts (carrier_contacts)
```
id: varchar (UUID)
carrierId: FK → carriers
name: text
title: text
firstName: text
lastName: text
jobTitle: text
telephone: text
mobile: text
email: text
portalAccess: boolean
isPrimary: boolean
```

### Carrier Credit Alerts (carrier_credit_alerts)
```
id: varchar (UUID)
carrierId: FK → carriers
alertType: text (low_balance | high_balance | 24hr_spend_breach)
threshold: decimal
direction: text (customer | supplier)
templateId: varchar
recipients: jsonb
isActive: boolean
```

### Customer Rating Plans (customer_rating_plans)
```
id: varchar (UUID)
shortCode: text (auto-generated, e.g., P1, P2, P3 - used for URL routing)
name: text
currency: text
timeZone: text
carrierTimeZone: text
defaultRates: text
marginEnforcement: text
minMargin: decimal
effectiveDate: timestamp
initialInterval: integer
recurringInterval: integer
periodExceptionTemplate: text
template: text
uncommittedChanges: boolean
assigned: boolean
selectedTimeClasses: jsonb
selectedZones: jsonb
zonesSelect: text
assignOrigin: text
```

## Interconnect Settings Tables

### IP Addresses (interconnect_ip_addresses)
```
id: varchar (UUID)
interconnectId: FK → carrier_interconnects
ipAddress: text
isRange: boolean
rangeEnd: text
addressType: text (transport | media)
isActive: boolean
```

### Validation Settings (interconnect_validation_settings)
One per interconnect (unique constraint)
```
id: varchar (UUID)
interconnectId: FK (unique)
techPrefix: text
fromUri: text
contactUri: text
trunkGroup: text
maxCps: integer
maxCpsEnabled: boolean
testSystemControl: text
```

### Translation Settings (interconnect_translation_settings)
One per interconnect (unique constraint)
```
id: varchar (UUID)
interconnectId: FK (unique)
originationPreference: text
originationValidation: text
setPaiHeader: text
globalTranslation: text
originTranslation: text
destinationTranslation: text
```

### Codecs (interconnect_codecs)
Multiple per interconnect
```
id: varchar (UUID)
interconnectId: FK
codecName: text
codecId: text
allowed: boolean
relayOnly: boolean
vad: boolean
ptime: integer
displayOrder: integer
```

### Media Settings (interconnect_media_settings)
One per interconnect (unique constraint)
```
id: varchar (UUID)
interconnectId: FK (unique)
dtmfDetection: text
mediaRelay: text
mediaNetwork: text
rtpTimeout: integer
rtpTimeoutEnabled: boolean
```

### Signalling Settings (interconnect_signalling_settings)
One per interconnect (unique constraint)
```
id: varchar (UUID)
interconnectId: FK (unique)
privacyMethod: text
sessionTimerEnabled: boolean
sessionTimerInterval: integer
maxCallDuration: integer
maxCallDurationEnabled: boolean
earlyMediaEnabled: boolean
100relEnabled: boolean
releaseCauseMapping: jsonb
```

### Customer Categories (customer_categories)
Core reference data - seeded on startup, migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
name: text
code: text (unique)
description: text
icon: text
displayOrder: integer
isActive: boolean
showOnWebsite: boolean
defaultBillingType: text (prepaid | postpaid)
createdAt: timestamp
updatedAt: timestamp
```

### Customer Groups (customer_groups)
Core reference data - seeded on startup, migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
categoryId: FK → customer_categories
name: text
code: text (unique)
description: text
displayOrder: integer
isActive: boolean
createdAt: timestamp
updatedAt: timestamp
```

### Users (users)
All users including super admins, customers, and carriers - migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
email: text (unique)
password: text (hashed)
firstName: text
lastName: text
phone: text
role: text
status: text (pending | active | suspended)
emailVerified: boolean
twoFactorEnabled: boolean
twoFactorSecret: text
customerId: FK → customers
carrierId: FK → carriers
lastLoginAt: timestamp
createdAt: timestamp
updatedAt: timestamp
```

### Carrier Assignments (carrier_assignments)
Controls which customers can use which carriers - migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
carrierId: FK → carriers
assignmentType: text (all | categories | groups | customers)
categoryIds: jsonb (array of category IDs)
groupIds: jsonb (array of group IDs)
customerIds: jsonb (array of customer IDs)
createdAt: timestamp
```

### POPs (pops)
Points of Presence - migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
name: text
code: text (unique)
fqdn: text
ipAddress: text
region: text
country: text
city: text
description: text
isActive: boolean
displayOrder: integer
connexcsPopId: text
status: text (active | paused | disabled)
createdAt: timestamp
updatedAt: timestamp
```

### Voice Tiers (voice_tiers)
Quality tiers for voice termination - migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
name: text
code: text (unique)
description: text
asrPercent: decimal
acdSeconds: integer
pddMs: integer
baseRate: decimal
displayOrder: integer
isActive: boolean
showOnWebsite: boolean
status: text
createdAt: timestamp
updatedAt: timestamp
```

### Codecs (codecs)
Audio codecs - migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
name: text
code: text (unique)
description: text
priority: integer
isActive: boolean
createdAt: timestamp
updatedAt: timestamp
```

### Channel Plans (channel_plans)
SIP channel packages - migrated to PostgreSQL per FOREVER POLICY
```
id: varchar (UUID)
name: text
code: text (unique)
description: text
channels: integer
cps: integer
monthlyPrice: decimal
setupFee: decimal
displayOrder: integer
isActive: boolean
showOnWebsite: boolean
status: text
createdAt: timestamp
updatedAt: timestamp
```

## Monitoring & Alerting Tables

### Metrics Snapshots (metrics_snapshots)
Stores periodic system metrics collected by DataQueue job every 60s
```
id: varchar (UUID)
snapshotType: text (api | database | redis | r2 | job_queue | integration | portal)
metrics: jsonb (type-specific metrics payload)
collectedAt: timestamp (UTC)
createdAt: timestamp (UTC)
```

### System Alerts (system_alerts)
Active and resolved performance/health alerts
```
id: varchar (UUID)
severity: enum (critical | warning | info)
source: text (api | database | redis | job | integration | portal)
title: text
description: text
metricName: text
actualValue: decimal
threshold: decimal
breachDuration: integer (seconds)
firstSeenAt: timestamp (UTC)
lastSeenAt: timestamp (UTC)
status: enum (active | resolved | acknowledged | snoozed)
acknowledgedBy: FK → users
acknowledgedAt: timestamp (UTC)
resolvedAt: timestamp (UTC)
snoozeUntil: timestamp (UTC)
createdAt: timestamp (UTC)
updatedAt: timestamp (UTC)
```

### Integration Health (integration_health)
Health status for each external integration
```
id: varchar (UUID)
integrationName: text (connexcs | brevo | nowpayments | ayrshare | openexchangerates | openai)
status: enum (healthy | degraded | down)
latencyP95: integer (ms)
errorRate: decimal (percentage)
lastSuccessAt: timestamp (UTC)
lastFailureAt: timestamp (UTC)
lastFailureReason: text
checkedAt: timestamp (UTC)
createdAt: timestamp (UTC)
updatedAt: timestamp (UTC)
```

### Job Metrics (job_metrics)
DataQueue job performance metrics
```
id: varchar (UUID)
jobType: text
queuedCount: integer
runningCount: integer
failedCount15m: integer
failedCount24h: integer
oldestJobAge: integer (seconds)
stuckJobCount: integer
averageDuration: integer (ms)
collectedAt: timestamp (UTC)
createdAt: timestamp (UTC)
```

### Portal Metrics (portal_metrics)
Portal-specific health and performance metrics
```
id: varchar (UUID)
portalType: text (super_admin | customer | marketing)
routeTransitionP95: integer (ms)
routeTransitionP99: integer (ms)
jsErrorCount: integer
assetLoadFailures: integer
lastPageLoadSample: timestamp (UTC)
healthStatus: enum (healthy | degraded | down)
collectedAt: timestamp (UTC)
createdAt: timestamp (UTC)
```

### Audit Records (audit_records)
System changes for correlation with performance issues
```
id: varchar (UUID)
eventType: text (deployment | migration | config_change | admin_action)
actorId: FK → users
actorEmail: text
description: text
metadata: jsonb
occurredAt: timestamp (UTC)
createdAt: timestamp (UTC)
```

### Module Registry (module_registry)
Registry of all modules for auto-monitoring
```
id: varchar (UUID)
moduleKey: text (unique)
displayName: text
routesPrefix: text
apiPrefix: text
criticalEndpoints: jsonb (array of endpoint patterns)
jobTypes: jsonb (array of job type names)
integrationsUsed: jsonb (array of integration names)
portalVisibility: jsonb (admin | customer | marketing)
isActive: boolean
createdAt: timestamp (UTC)
updatedAt: timestamp (UTC)
```

## Enums
- `carrier_partner_type`: customer | supplier | bilateral
- `credit_type`: prepaid | postpaid
- `capacity_mode`: unrestricted | capped
- `route_status`: active | paused | disabled | testing
- `alert_severity`: critical | warning | info
- `alert_status`: active | resolved | acknowledged | snoozed
- `health_status`: healthy | degraded | down
