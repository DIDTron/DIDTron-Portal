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

## Enums
- `carrier_partner_type`: customer | supplier | bilateral
- `credit_type`: prepaid | postpaid
- `capacity_mode`: unrestricted | capped
- `route_status`: active | paused | disabled | testing
