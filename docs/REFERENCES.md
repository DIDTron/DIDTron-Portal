# DIDTron - References

## Digitalk Carrier Cloud Manager Documentation

### Primary References
| File | Description | Usage |
|------|-------------|-------|
| `attached_assets/UG-025-274_-_Carrier_Cloud_Manager_1768072023661.pdf` | Complete Digitalk User Guide (1638 pages) | UI/UX specifications, all feature details |
| `attached_assets/3-ManagingCarriers_1768085684244.txt` | Managing Carriers section text extract | Quick reference for carrier management |

### Tango Workflow Screenshots (361 total)
| Workflow | Steps | URL | Affects |
|----------|-------|-----|---------|
| Manage Carriers and Services | 99 | [Link](https://app.tango.us/app/workflow/Manage-Carriers-and-Services-in-Digitalk-Carrier-Cloud-7be3ed2772fa4a5fadb554bd48ebd7b4) | Carrier list, Carrier Detail, Interconnects, Services |
| Configure Carrier Contacts and Alerts | 32 | [Link](https://app.tango.us/app/workflow/Configure-Carrier-Contacts-and-Alerts-in-Digitalk-b913adcf391d4e98939e0e7f9bff1cd8) | Contacts tab, Credit Alerts tab |
| Configure Digitalk Carrier Cloud Settings | 99 | [Link](https://app.tango.us/app/workflow/Configure-Digitalk-Carrier-Cloud-Settings-7dc7bf616d1f43dcb2c4970be1005d6c) | Global settings, system configuration |
| Configure Privacy and Rating | 32 | [Link](https://app.tango.us/app/workflow/Configure-Privacy-and-Rating-in-Digitalk-a4dcd176c97f4e62ace6f888a9a13c4f) | Privacy methods, rating configuration |

## Key Implementation Files

### Frontend
| File | Description |
|------|-------------|
| `client/src/pages/admin/softswitch.tsx` | Softswitch Carriers page (list view) |
| `client/src/pages/admin/carrier-detail.tsx` | Carrier Detail page (5 tabs) |
| `client/src/pages/admin/interconnect-detail.tsx` | Interconnect Detail page (5/6 tabs) |
| `client/src/pages/admin/index.tsx` | Admin portal router and layout |

### Backend
| File | Description |
|------|-------------|
| `server/routes.ts` | All API endpoints |
| `server/storage.ts` | Storage interface and implementations |
| `shared/schema.ts` | Database schema (Drizzle ORM) |

### Configuration
| File | Description |
|------|-------------|
| `replit.md` | Project memory, architecture decisions |
| `design_guidelines.md` | Frontend design system |

## External Services

### ConnexCS Integration
- Class 4 Softswitch backend
- CDR generation and routing
- Real-time balance management
- Sync: Push customers/rates, Pull CDRs

### Stripe Integration
- Payment processing
- KYC identity verification
