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

## Enums
- `carrier_partner_type`: customer | supplier | bilateral
- `credit_type`: prepaid | postpaid
- `capacity_mode`: unrestricted | capped
- `route_status`: active | paused | disabled | testing
