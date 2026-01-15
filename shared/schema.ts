import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb, pgEnum, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", [
  "super_admin", "admin", "finance", "support", "sales", "marketing", "viewer",
  "customer_owner", "customer_admin", "customer_billing", "customer_technical", "customer_viewer",
  "carrier_owner", "carrier_admin", "carrier_billing", "carrier_technical", "carrier_viewer"
]);

export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "pending", "deleted"]);

export const customerStatusEnum = pgEnum("customer_status", ["active", "suspended", "pending_kyc", "pending_approval", "deleted"]);

export const kycStatusEnum = pgEnum("kyc_status", ["not_started", "pending", "approved", "rejected", "expired"]);

export const billingTypeEnum = pgEnum("billing_type", ["prepaid", "postpaid", "bilateral"]);

export const configStatusEnum = pgEnum("config_status", ["draft", "pending_approval", "approved", "active", "archived"]);

export const assignmentTypeEnum = pgEnum("assignment_type", ["all", "categories", "groups", "specific"]);

export const alertSeverityEnum = pgEnum("alert_severity", ["info", "warning", "critical"]);

export const alertStatusEnum = pgEnum("alert_status", ["active", "acknowledged", "resolved", "auto_resolved"]);

export const ticketStatusEnum = pgEnum("ticket_status", ["open", "pending", "in_progress", "resolved", "closed"]);

export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);

export const didStatusEnum = pgEnum("did_status", ["available", "reserved", "active", "porting_in", "porting_out", "suspended", "released"]);

export const extensionStatusEnum = pgEnum("extension_status", ["active", "suspended", "deleted"]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);

export const routeStatusEnum = pgEnum("route_status", ["active", "paused", "disabled", "testing"]);

export const rateCardTypeEnum = pgEnum("rate_card_type", ["provider", "customer"]);

export const rateCardStatusEnum = pgEnum("rate_card_status", ["active", "inactive", "stale", "building"]);

export const rateCardDirectionEnum = pgEnum("rate_card_direction", ["termination", "origination"]);

export const emSectionEnum = pgEnum("em_section", ["marketing", "portal_themes", "white_label", "design_system", "documentation"]);

export const emContentStatusEnum = pgEnum("em_content_status", ["draft", "preview", "published", "archived"]);

export const billingCycleTypeEnum = pgEnum("billing_cycle_type", ["weekly", "semi_monthly", "monthly"]);

export const carrierPartnerTypeEnum = pgEnum("carrier_partner_type", ["customer", "supplier", "bilateral"]);

export const creditTypeEnum = pgEnum("credit_type", ["prepaid", "postpaid"]);

export const capacityModeEnum = pgEnum("capacity_mode", ["unrestricted", "capped"]);

export const serviceRoutingMethodEnum = pgEnum("service_routing_method", ["routing_plan", "route_to_interconnect"]);

export const serviceMatchTypeEnum = pgEnum("service_match_type", ["any", "define_matches", "assign_list"]);

// ==================== BILLING TERMS ====================

export const billingTerms = pgTable("billing_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  cycleType: billingCycleTypeEnum("cycle_type").notNull(),
  cycleDays: integer("cycle_days").notNull(),
  dueDays: integer("due_days").notNull(),
  anchorConfig: jsonb("anchor_config"),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const baseBillingTermSchema = createInsertSchema(billingTerms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingTermSchema = baseBillingTermSchema.extend({
  anchorConfig: z.record(z.unknown()).refine((config) => config !== null && config !== undefined, {
    message: "anchorConfig is required",
  }),
}).superRefine((data, ctx) => {
  const config = data.anchorConfig as Record<string, unknown>;
  switch (data.cycleType) {
    case "weekly":
      if (typeof config?.dayOfWeek !== "number" || config.dayOfWeek < 0 || config.dayOfWeek > 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Weekly cycle requires dayOfWeek (0-6)",
          path: ["anchorConfig"],
        });
      }
      break;
    case "semi_monthly":
      if (!Array.isArray(config?.daysOfMonth) || config.daysOfMonth.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Semi-monthly cycle requires daysOfMonth array with 2 values",
          path: ["anchorConfig"],
        });
      }
      break;
    case "monthly":
      if (typeof config?.dayOfMonth !== "number" || config.dayOfMonth < 1 || config.dayOfMonth > 28) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Monthly cycle requires dayOfMonth (1-28)",
          path: ["anchorConfig"],
        });
      }
      break;
  }
});

export const updateBillingTermSchema = baseBillingTermSchema.partial().extend({
  anchorConfig: z.record(z.unknown()).optional(),
}).superRefine((data, ctx) => {
  if (data.cycleType && data.anchorConfig) {
    const config = data.anchorConfig as Record<string, unknown>;
    switch (data.cycleType) {
      case "weekly":
        if (typeof config?.dayOfWeek !== "number" || config.dayOfWeek < 0 || config.dayOfWeek > 6) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Weekly cycle requires dayOfWeek (0-6)",
            path: ["anchorConfig"],
          });
        }
        break;
      case "semi_monthly":
        if (!Array.isArray(config?.daysOfMonth) || config.daysOfMonth.length !== 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Semi-monthly cycle requires daysOfMonth array with 2 values",
            path: ["anchorConfig"],
          });
        }
        break;
      case "monthly":
        if (typeof config?.dayOfMonth !== "number" || config.dayOfMonth < 1 || config.dayOfMonth > 28) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Monthly cycle requires dayOfMonth (1-28)",
            path: ["anchorConfig"],
          });
        }
        break;
    }
  }
});

export type InsertBillingTerm = z.infer<typeof insertBillingTermSchema>;
export type BillingTerm = typeof billingTerms.$inferSelect;

// ==================== CUSTOMER CATEGORIES & GROUPS ====================

export const customerCategories = pgTable("customer_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  showOnWebsite: boolean("show_on_website").default(true),
  defaultBillingType: billingTypeEnum("default_billing_type").default("prepaid"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerGroups = pgTable("customer_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => customerCategories.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== USERS & AUTHENTICATION ====================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: userRoleEnum("role").default("customer_viewer"),
  status: userStatusEnum("status").default("pending"),
  emailVerified: boolean("email_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  customerId: varchar("customer_id").references(() => customers.id),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("idx_users_email").on(table.email),
  statusIdx: index("idx_users_status").on(table.status),
  roleIdx: index("idx_users_role").on(table.role),
}));

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loginHistory = pgTable("login_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== CUSTOMERS ====================

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  accountNumber: text("account_number").notNull().unique(),
  companyName: text("company_name").notNull(),
  categoryId: varchar("category_id").references(() => customerCategories.id),
  groupId: varchar("group_id").references(() => customerGroups.id),
  status: customerStatusEnum("status").default("pending_approval"),
  billingType: billingTypeEnum("billing_type").default("prepaid"),
  balance: decimal("balance", { precision: 12, scale: 4 }).default("0"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 4 }).default("0"),
  billingEmail: text("billing_email"),
  technicalEmail: text("technical_email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  postalCode: text("postal_code"),
  taxId: text("tax_id"),
  referralCode: text("referral_code").unique(),
  referredBy: varchar("referred_by"),
  connexcsCustomerId: text("connexcs_customer_id"),
  kycStatus: kycStatusEnum("kyc_status").default("not_started"),
  lowBalanceThreshold1: decimal("low_balance_threshold_1", { precision: 12, scale: 4 }).default("50"),
  lowBalanceThreshold2: decimal("low_balance_threshold_2", { precision: 12, scale: 4 }).default("20"),
  lowBalanceThreshold3: decimal("low_balance_threshold_3", { precision: 12, scale: 4 }).default("5"),
  autoTopUpEnabled: boolean("auto_top_up_enabled").default(false),
  autoTopUpAmount: decimal("auto_top_up_amount", { precision: 12, scale: 4 }),
  autoTopUpThreshold: decimal("auto_top_up_threshold", { precision: 12, scale: 4 }),
  billingTermId: varchar("billing_term_id").references(() => billingTerms.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("idx_customers_status").on(table.status),
  createdAtIdx: index("idx_customers_created_at").on(table.createdAt),
}));

export const customerKyc = pgTable("customer_kyc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  stripeIdentityId: text("stripe_identity_id"),
  documentType: text("document_type"),
  documentUrl: text("document_url"),
  addressDocumentUrl: text("address_document_url"),
  businessDocumentUrl: text("business_document_url"),
  status: kycStatusEnum("status").default("not_started"),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== CARRIERS / WHOLESALE PARTNERS ====================

export const carriers = pgTable("carriers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  partnerType: carrierPartnerTypeEnum("partner_type").default("bilateral"),
  description: text("description"),
  status: routeStatusEnum("status").default("active"),
  
  primaryCurrencyId: varchar("primary_currency_id").references(() => currencies.id),
  timezone: text("timezone").default("UTC"),
  accountManager: text("account_manager"),
  customerBillingMode: text("customer_billing_mode").default("automatic"),
  
  capacityMode: capacityModeEnum("capacity_mode").default("unrestricted"),
  capacityLimit: integer("capacity_limit"),
  circularRouting: boolean("circular_routing").default(false),
  
  customerCreditType: creditTypeEnum("customer_credit_type").default("postpaid"),
  customerCreditLimit: decimal("customer_credit_limit", { precision: 14, scale: 4 }).default("0"),
  customerCreditLimitUnlimited: boolean("customer_credit_limit_unlimited").default(false),
  customerBalance: decimal("customer_balance", { precision: 14, scale: 4 }).default("0"),
  customerBilateralLimitBreach: text("customer_bilateral_limit_breach").default("alert_only"),
  customer24HrSpendLimitBreach: text("customer_24hr_spend_limit_breach").default("alert_only"),
  customer24HrSpendMode: text("customer_24hr_spend_mode").default("rolling_24_hours"),
  customer24HrSpendLimit: decimal("customer_24hr_spend_limit", { precision: 14, scale: 4 }),
  customer24HrSpend: decimal("customer_24hr_spend", { precision: 14, scale: 4 }).default("0"),
  
  supplierCreditType: creditTypeEnum("supplier_credit_type").default("postpaid"),
  supplierCreditLimit: decimal("supplier_credit_limit", { precision: 14, scale: 4 }).default("0"),
  supplierCreditLimitUnlimited: boolean("supplier_credit_limit_unlimited").default(false),
  supplierBalance: decimal("supplier_balance", { precision: 14, scale: 4 }).default("0"),
  supplier24HrSpendLimit: decimal("supplier_24hr_spend_limit", { precision: 14, scale: 4 }),
  supplier24HrSpend: decimal("supplier_24hr_spend", { precision: 14, scale: 4 }).default("0"),
  
  bilateralBalance: decimal("bilateral_balance", { precision: 14, scale: 4 }).default("0"),
  bilateralCreditLimit: decimal("bilateral_credit_limit", { precision: 14, scale: 4 }).default("0"),
  bilateralCreditLimitUnlimited: boolean("bilateral_credit_limit_unlimited").default(true),
  
  customer24HrSpendLimitUnlimited: boolean("customer_24hr_spend_limit_unlimited").default(true),
  supplier24HrSpendLimitUnlimited: boolean("supplier_24hr_spend_limit_unlimited").default(true),
  
  currencyCode: text("currency_code").default("USD"),
  
  billingEmail: text("billing_email"),
  technicalEmail: text("technical_email"),
  connexcsCarrierId: text("connexcs_carrier_id"),
  
  billingName: text("billing_name"),
  telephone: text("telephone"),
  fax: text("fax"),
  website: text("website"),
  companyAddress: text("company_address"),
  companyAddress2: text("company_address_2"),
  companyPostcode: text("company_postcode"),
  companyCountry: text("company_country"),
  billingAddress: text("billing_address"),
  billingAddress2: text("billing_address_2"),
  billingPostcode: text("billing_postcode"),
  billingCountry: text("billing_country"),
  billingAddressSameAsCompany: boolean("billing_address_same_as_company").default(true),
  
  customerAccountNumber: text("customer_account_number"),
  supplierAccountNumber: text("supplier_account_number"),
  supplierAccountSameAsCustomer: boolean("supplier_account_same_as_customer").default(true),
  taxCode: text("tax_code"),
  billTo: text("bill_to"),
  shipTo: text("ship_to"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("idx_carriers_status").on(table.status),
  createdAtIdx: index("idx_carriers_created_at").on(table.createdAt),
  nameIdx: index("idx_carriers_name").on(table.name),
}));

export const carrierInterconnects = pgTable("carrier_interconnects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  shortCode: text("short_code").unique(),
  carrierId: varchar("carrier_id").references(() => carriers.id).notNull(),
  name: text("name").notNull(),
  direction: text("direction").default("both"),
  currencyCode: text("currency_code").default("USD"),
  protocol: text("protocol").default("SIP"),
  capacityMode: capacityModeEnum("capacity_mode").default("unrestricted"),
  capacityLimit: integer("capacity_limit"),
  isActive: boolean("is_active").default(true),
  techPrefix: text("tech_prefix"),
  ipAddress: text("ip_address"),
  sipPort: integer("sip_port").default(5060),
  sipUsername: text("sip_username"),
  sipPassword: text("sip_password"),
  codec: text("codec"),
  supplierBuyRates: text("supplier_buy_rates"),
  servicesCount: integer("services_count").default(0),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  carrierIdIdx: index("idx_interconnects_carrier_id").on(table.carrierId),
  directionIdx: index("idx_interconnects_direction").on(table.direction),
  isActiveIdx: index("idx_interconnects_is_active").on(table.isActive),
  createdAtIdx: index("idx_interconnects_created_at").on(table.createdAt),
}));

// Carrier Services - THE KEY LINKAGE: Interconnect → Rating Plan + Routing Plan
export const carrierServices = pgTable("carrier_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  shortCode: text("short_code").unique(),
  carrierId: varchar("carrier_id").references(() => carriers.id).notNull(),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull(),
  name: text("name").notNull(),
  direction: text("direction").default("ingress"),
  status: routeStatusEnum("status").default("active"),
  ratingPlanId: varchar("rating_plan_id").references(() => rateCards.id),
  routingPlanId: varchar("routing_plan_id"),
  techPrefix: text("tech_prefix"),
  priority: integer("priority").default(1),
  weight: integer("weight").default(100),
  capacityMode: capacityModeEnum("capacity_mode").default("unrestricted"),
  capacityLimit: integer("capacity_limit"),
  enforcementPolicy: text("enforcement_policy"),
  scriptForgeId: text("script_forge_id"),
  connexcsServiceId: text("connexcs_service_id"),
  timeClass: text("time_class").default("AnyDay"),
  allowTranscoding: boolean("allow_transcoding").default(false),
  routingMethod: serviceRoutingMethodEnum("routing_method").default("routing_plan"),
  routeToInterconnectId: varchar("route_to_interconnect_id").references(() => carrierInterconnects.id),
  useTranslationFromSupplier: boolean("use_translation_from_supplier").default(false),
  originationTranslation: text("origination_translation"),
  destinationTranslation: text("destination_translation"),
  originationMatchType: serviceMatchTypeEnum("origination_match_type").default("any"),
  originationMatchListId: varchar("origination_match_list_id"),
  originationMatchConfig: jsonb("origination_match_config"),
  destinationMatchType: serviceMatchTypeEnum("destination_match_type").default("any"),
  destinationMatchListId: varchar("destination_match_list_id"),
  destinationMatchConfig: jsonb("destination_match_config"),
  originationBlacklistId: varchar("origination_blacklist_id"),
  originationExceptionsId: varchar("origination_exceptions_id"),
  destinationBlacklistId: varchar("destination_blacklist_id"),
  destinationExceptionsId: varchar("destination_exceptions_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  interconnectIdIdx: index("idx_services_interconnect_id").on(table.interconnectId),
  carrierIdIdx: index("idx_services_carrier_id").on(table.carrierId),
  createdAtIdx: index("idx_services_created_at").on(table.createdAt),
}));

export const serviceMatchLists = pgTable("service_match_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  matchType: text("match_type").default("origination"),
  includeExclude: text("include_exclude").default("including"),
  matches: text("matches").array(),
  minDigits: integer("min_digits").default(0),
  maxDigits: integer("max_digits").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carrierContacts = pgTable("carrier_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  carrierId: varchar("carrier_id").references(() => carriers.id).notNull(),
  title: text("title"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  name: text("name").notNull(),
  jobTitle: text("job_title"),
  telephone: text("telephone"),
  mobile: text("mobile"),
  fax: text("fax"),
  email: text("email"),
  note: text("note"),
  portalAccess: boolean("portal_access").default(false),
  portalUsername: text("portal_username"),
  portalLocked: boolean("portal_locked").default(false),
  lastAccessed: timestamp("last_accessed"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carrierCreditAlerts = pgTable("carrier_credit_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  carrierId: varchar("carrier_id").references(() => carriers.id).notNull(),
  alertType: text("alert_type").notNull(),
  currencyCode: text("currency_code").default("USD"),
  threshold: decimal("threshold", { precision: 14, scale: 4 }).notNull(),
  direction: text("direction").default("customer"),
  templateId: varchar("template_id"),
  clearedTemplateId: varchar("cleared_template_id"),
  maxAlerts: integer("max_alerts").default(4),
  perMinutes: integer("per_minutes").default(1440),
  restrictionTemplate: text("restriction_template"),
  recipients: jsonb("recipients"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carrierAssignments = pgTable("carrier_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  carrierId: varchar("carrier_id").references(() => carriers.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== INTERCONNECT SETTINGS (Digitalk Matching) ====================

export const interconnectIpAddresses = pgTable("interconnect_ip_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull(),
  ipAddress: text("ip_address").notNull(),
  isRange: boolean("is_range").default(false),
  rangeEnd: text("range_end"),
  addressType: text("address_type").default("transport"),
  includeLastVia: boolean("include_last_via").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interconnectValidationSettings = pgTable("interconnect_validation_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull().unique(),
  techPrefix: text("tech_prefix"),
  fromUri: text("from_uri"),
  contactUri: text("contact_uri"),
  trunkGroup: text("trunk_group"),
  trunkContext: text("trunk_context"),
  validateTrunkGroup: boolean("validate_trunk_group").default(false),
  addressType: text("address_type").default("transport"),
  maxCps: integer("max_cps"),
  maxCpsEnabled: boolean("max_cps_enabled").default(false),
  testSystemControl: text("test_system_control").default("dont_allow"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interconnectTranslationSettings = pgTable("interconnect_translation_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull().unique(),
  originationPreference: text("origination_preference").default("pai_then_from"),
  originationValidation: text("origination_validation").default("none"),
  setPaiHeader: text("set_pai_header").default("none"),
  globalTranslation: text("global_translation"),
  originTranslation: text("origin_translation"),
  destinationTranslation: text("destination_translation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interconnectCodecs = pgTable("interconnect_codecs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull(),
  codecName: text("codec_name").notNull(),
  codecId: text("codec_id").notNull(),
  allowed: boolean("allowed").default(true),
  relayOnly: boolean("relay_only").default(false),
  vad: boolean("vad").default(false),
  ptime: integer("ptime").default(20),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interconnectMediaSettings = pgTable("interconnect_media_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull().unique(),
  dtmfDetection: text("dtmf_detection").default("rfc2833"),
  mediaRelay: text("media_relay").default("always"),
  mediaNetwork: text("media_network").default("same_as_signalling"),
  rtpTimeout: integer("rtp_timeout"),
  rtpTimeoutEnabled: boolean("rtp_timeout_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interconnectSignallingSettings = pgTable("interconnect_signalling_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull().unique(),
  privacyMethod: text("privacy_method").default("rfc3325"),
  sessionTimerEnabled: boolean("session_timer_enabled").default(true),
  minSessionTimer: integer("min_session_timer").default(90),
  defaultSessionTimer: integer("default_session_timer").default(1800),
  rel100: text("rel_100").default("supported"),
  maxCallDurationEnabled: boolean("max_call_duration_enabled").default(false),
  maxCallDuration: integer("max_call_duration"),
  callProgressDefault: boolean("call_progress_default").default(true),
  tryingTimeout: integer("trying_timeout").default(180000),
  ringingTimeout: integer("ringing_timeout").default(180000),
  releaseCauseMapping: text("release_cause_mapping"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interconnectMonitoringSettings = pgTable("interconnect_monitoring_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id).notNull().unique(),
  monitoringEnabled: text("monitoring_enabled").default("none"),
  alarmSeverity: text("alarm_severity").default("low"),
  sendEmailOn: text("send_email_on").default("breach_only"),
  recipients: text("recipients"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== CUSTOMER RATING PLANS ====================

export const customerRatingPlans = pgTable("customer_rating_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  shortCode: text("short_code").unique(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("USD"),
  timeZone: text("time_zone").default("UTC"),
  carrierTimeZone: text("carrier_time_zone"),
  defaultRates: text("default_rates").default("Define Later"),
  marginEnforcement: text("margin_enforcement").default("Enabled"),
  minMargin: decimal("min_margin", { precision: 5, scale: 2 }).default("0"),
  effectiveDate: timestamp("effective_date"),
  initialInterval: integer("initial_interval").default(0),
  recurringInterval: integer("recurring_interval").default(1),
  periodExceptionTemplate: text("period_exception_template"),
  template: text("template"),
  uncommittedChanges: boolean("uncommitted_changes").default(false),
  assigned: boolean("assigned").default(false),
  selectedTimeClasses: text("selected_time_classes").array(),
  selectedZones: text("selected_zones").array(),
  zonesSelect: text("zones_select").default("None"),
  assignOrigin: text("assign_origin").default("None"),
  originMappingGroupId: varchar("origin_mapping_group_id"),
  marginEnforcementEnabled: boolean("margin_enforcement_enabled").default(true),
  minRatedCallDurationEnabled: boolean("min_rated_call_duration_enabled").default(false),
  minRatedCallDuration: integer("min_rated_call_duration").default(0),
  shortCallDurationEnabled: boolean("short_call_duration_enabled").default(false),
  shortCallDuration: integer("short_call_duration").default(0),
  shortCallCharge: decimal("short_call_charge", { precision: 10, scale: 4 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerRatingPlanSchema = createInsertSchema(customerRatingPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomerRatingPlan = z.infer<typeof insertCustomerRatingPlanSchema>;
export type CustomerRatingPlan = typeof customerRatingPlans.$inferSelect;

// ==================== CUSTOMER RATING PLAN RATES ====================

export const effectiveStatusEnum = pgEnum("effective_status", ["active", "pending", "expired"]);

export const customerRatingPlanRates = pgTable("customer_rating_plan_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ratingPlanId: varchar("rating_plan_id").references(() => customerRatingPlans.id, { onDelete: "cascade" }).notNull(),
  zone: text("zone").notNull(),
  codes: text("codes").array().notNull(),
  originSet: text("origin_set"),
  timeClassId: varchar("time_class_id"),
  timeClassName: text("time_class_name").default("AnyDay"),
  effectiveDate: timestamp("effective_date").notNull(),
  endDate: timestamp("end_date"),
  effectiveStatus: effectiveStatusEnum("effective_status").default("pending"),
  connectionCharge: decimal("connection_charge", { precision: 10, scale: 4 }).default("0"),
  initialCharge: decimal("initial_charge", { precision: 10, scale: 4 }).default("0"),
  initialInterval: integer("initial_interval").default(1),
  recurringCharge: decimal("recurring_charge", { precision: 10, scale: 4 }).notNull(),
  recurringInterval: integer("recurring_interval").default(1),
  advancedOptions: text("advanced_options"),
  minMargin: decimal("min_margin", { precision: 5, scale: 2 }).default("0"),
  applyDefaultMargin: boolean("apply_default_margin").default(true),
  blocked: boolean("blocked").default(false),
  locked: boolean("locked").default(false),
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerRatingPlanRateSchema = createInsertSchema(customerRatingPlanRates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomerRatingPlanRate = z.infer<typeof insertCustomerRatingPlanRateSchema>;
export type CustomerRatingPlanRate = typeof customerRatingPlanRates.$inferSelect;

// ==================== SUPPLIER RATING PLANS ====================

export const supplierRatingPlans = pgTable("supplier_rating_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  shortCode: text("short_code").unique(),
  name: text("name").notNull(),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id),
  blockUnresolvableCodes: boolean("block_unresolvable_codes").default(false),
  currency: text("currency").notNull().default("USD"),
  creationTemplate: text("creation_template"),
  uncommittedChanges: boolean("uncommitted_changes").default(false),
  inUse: boolean("in_use").default(false),
  timeZone: text("time_zone").default("UTC"),
  carrierTimeZone: text("carrier_time_zone"),
  defaultRates: text("default_rates").default("Define Later"),
  effectiveDate: timestamp("effective_date"),
  initialInterval: integer("initial_interval").default(0),
  recurringInterval: integer("recurring_interval").default(1),
  periodExceptionTemplate: text("period_exception_template"),
  template: text("template"),
  selectedTimeClasses: text("selected_time_classes").array(),
  selectedZones: text("selected_zones").array(),
  zonesSelect: text("zones_select").default("None"),
  assignOrigin: text("assign_origin").default("None"),
  originMappingGroupId: varchar("origin_mapping_group_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  carrierIdIdx: index("idx_supplier_rating_plans_carrier_id").on(table.carrierId),
  interconnectIdIdx: index("idx_supplier_rating_plans_interconnect_id").on(table.interconnectId),
  nameIdx: index("idx_supplier_rating_plans_name").on(table.name),
}));

export const insertSupplierRatingPlanSchema = createInsertSchema(supplierRatingPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupplierRatingPlan = z.infer<typeof insertSupplierRatingPlanSchema>;
export type SupplierRatingPlan = typeof supplierRatingPlans.$inferSelect;

// ==================== SUPPLIER RATING PLAN RATES ====================

export const supplierRatingPlanRates = pgTable("supplier_rating_plan_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ratingPlanId: varchar("rating_plan_id").references(() => supplierRatingPlans.id, { onDelete: "cascade" }).notNull(),
  zone: text("zone").notNull(),
  codes: text("codes").array().notNull(),
  originSet: text("origin_set"),
  timeClassId: varchar("time_class_id"),
  timeClassName: text("time_class_name").default("AnyDay"),
  effectiveDate: timestamp("effective_date").notNull(),
  endDate: timestamp("end_date"),
  effectiveStatus: effectiveStatusEnum("effective_status").default("pending"),
  connectionCharge: decimal("connection_charge", { precision: 10, scale: 4 }).default("0"),
  initialCharge: decimal("initial_charge", { precision: 10, scale: 4 }).default("0"),
  initialInterval: integer("initial_interval").default(1),
  recurringCharge: decimal("recurring_charge", { precision: 10, scale: 4 }).notNull(),
  recurringInterval: integer("recurring_interval").default(1),
  advancedOptions: text("advanced_options"),
  blocked: boolean("blocked").default(false),
  locked: boolean("locked").default(false),
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  ratingPlanIdIdx: index("idx_supplier_rating_plan_rates_plan_id").on(table.ratingPlanId),
  zoneIdx: index("idx_supplier_rating_plan_rates_zone").on(table.zone),
}));

export const insertSupplierRatingPlanRateSchema = createInsertSchema(supplierRatingPlanRates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupplierRatingPlanRate = z.infer<typeof insertSupplierRatingPlanRateSchema>;
export type SupplierRatingPlanRate = typeof supplierRatingPlanRates.$inferSelect;

// ==================== BUSINESS RULES (Import Rate Validation) ====================

export const businessRules = pgTable("business_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  assigned: boolean("assigned").default(false),
  rateIncreaseThreshold: integer("rate_increase_threshold").default(7),
  rateIncreaseAction: text("rate_increase_action").default("none"),
  rateDecreaseThreshold: integer("rate_decrease_threshold").default(1),
  rateDecreaseAction: text("rate_decrease_action").default("none"),
  newRateThreshold: integer("new_rate_threshold").default(7),
  newRateAction: text("new_rate_action").default("none"),
  rateDeletionThreshold: integer("rate_deletion_threshold").default(7),
  rateDeletionAction: text("rate_deletion_action").default("none"),
  rateBlockedThreshold: integer("rate_blocked_threshold").default(7),
  rateBlockedAction: text("rate_blocked_action").default("none"),
  oldestEffectiveDateThreshold: integer("oldest_effective_date_threshold").default(30),
  oldestEffectiveDateAction: text("oldest_effective_date_action").default("none"),
  maxEffectiveDateThreshold: integer("max_effective_date_threshold").default(30),
  maxEffectiveDateAction: text("max_effective_date_action").default("none"),
  maxIncreaseThreshold: decimal("max_increase_threshold", { precision: 10, scale: 2 }),
  maxIncreaseAction: text("max_increase_action").default("none"),
  maxDecreaseThreshold: decimal("max_decrease_threshold", { precision: 10, scale: 2 }),
  maxDecreaseAction: text("max_decrease_action").default("none"),
  maxRateThreshold: decimal("max_rate_threshold", { precision: 10, scale: 4 }),
  maxRateAction: text("max_rate_action").default("none"),
  initialPeriodsThreshold: text("initial_periods_threshold").default("0,1,60"),
  initialPeriodsAction: text("initial_periods_action").default("none"),
  recurringPeriodsThreshold: text("recurring_periods_threshold").default("1,60"),
  recurringPeriodsAction: text("recurring_periods_action").default("none"),
  codeMovedToNewZoneAction: text("code_moved_to_new_zone_action").default("none"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  createdAtIdx: index("idx_business_rules_created_at").on(table.createdAt),
  nameIdx: index("idx_business_rules_name").on(table.name),
}));

export const insertBusinessRuleSchema = createInsertSchema(businessRules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBusinessRule = z.infer<typeof insertBusinessRuleSchema>;
export type BusinessRule = typeof businessRules.$inferSelect;

// ==================== POPS (Points of Presence) ====================

export const pops = pgTable("pops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  fqdn: text("fqdn").notNull(),
  ipAddress: text("ip_address"),
  region: text("region"),
  country: text("country"),
  city: text("city"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  connexcsPopId: text("connexcs_pop_id"),
  status: configStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const popAssignments = pgTable("pop_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  popId: varchar("pop_id").references(() => pops.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== VOICE TIERS ====================

export const voiceTiers = pgTable("voice_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  asrPercent: decimal("asr_percent", { precision: 5, scale: 2 }),
  acdSeconds: integer("acd_seconds"),
  pddMs: integer("pdd_ms"),
  baseRate: decimal("base_rate", { precision: 10, scale: 6 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  showOnWebsite: boolean("show_on_website").default(true),
  status: configStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const voiceTierAssignments = pgTable("voice_tier_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  voiceTierId: varchar("voice_tier_id").references(() => voiceTiers.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== CODECS ====================

export const codecs = pgTable("codecs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const codecAssignments = pgTable("codec_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codecId: varchar("codec_id").references(() => codecs.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== CHANNEL/CPS PLANS ====================

export const channelPlans = pgTable("channel_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  channels: integer("channels").notNull(),
  cps: integer("cps").notNull(),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }),
  setupFee: decimal("setup_fee", { precision: 10, scale: 2 }).default("0"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  showOnWebsite: boolean("show_on_website").default(true),
  status: configStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const channelPlanAssignments = pgTable("channel_plan_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelPlanId: varchar("channel_plan_id").references(() => channelPlans.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== ROUTES & ROUTING ====================

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  destination: text("destination"),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  voiceTierId: varchar("voice_tier_id").references(() => voiceTiers.id),
  priority: integer("priority").default(1),
  weight: integer("weight").default(100),
  rate: decimal("rate", { precision: 10, scale: 6 }),
  status: routeStatusEnum("status").default("active"),
  connexcsRouteId: text("connexcs_route_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routeAssignments = pgTable("route_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id").references(() => routes.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routeGroups = pgTable("route_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  routeIds: text("route_ids").array(),
  failoverEnabled: boolean("failover_enabled").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routeGroupAssignments = pgTable("route_group_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeGroupId: varchar("route_group_id").references(() => routeGroups.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rateCards = pgTable("rate_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  type: rateCardTypeEnum("type").default("provider"),
  direction: rateCardDirectionEnum("direction").default("termination"),
  currency: text("currency").default("USD"),
  status: rateCardStatusEnum("status").default("active"),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  parentCardId: varchar("parent_card_id"),
  profitMargin: decimal("profit_margin", { precision: 10, scale: 4 }),
  profitType: text("profit_type").default("percentage"),
  billingPrecision: integer("billing_precision").default(4),
  techPrefix: text("tech_prefix"),
  ratesCount: integer("rates_count").default(0),
  revisionCount: integer("revision_count").default(1),
  connexcsRateCardId: text("connexcs_rate_card_id"),
  effectiveDate: timestamp("effective_date"),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  carrierIdIdx: index("idx_rating_plans_carrier_id").on(table.carrierId),
  createdAtIdx: index("idx_rating_plans_created_at").on(table.createdAt),
  nameIdx: index("idx_rating_plans_name").on(table.name),
}));

export const rateCardRates = pgTable("rate_card_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rateCardId: varchar("rate_card_id").references(() => rateCards.id).notNull(),
  prefix: text("prefix").notNull(),
  destination: text("destination"),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  connectionFee: decimal("connection_fee", { precision: 10, scale: 6 }).default("0"),
  billingIncrement: integer("billing_increment").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rateCardAssignments = pgTable("rate_card_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rateCardId: varchar("rate_card_id").references(() => rateCards.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== SUPPLIER IMPORT TEMPLATES ====================

export const supplierImportTemplates = pgTable("supplier_import_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  
  carrierId: varchar("carrier_id").references(() => carriers.id),
  interconnectId: varchar("interconnect_id").references(() => carrierInterconnects.id),
  identificationType: text("identification_type").default("email"),
  trustedIdentifier: text("trusted_identifier"),
  subjectKeyword: text("subject_keyword"),
  allowMultipleFiles: boolean("allow_multiple_files").default(false),
  fileNamePattern: text("file_name_pattern"),
  businessRuleId: varchar("business_rule_id").references(() => businessRules.id),
  periodExceptionId: varchar("period_exception_id"),
  
  fileFormat: text("file_format").default("CSV"),
  decimalSeparator: text("decimal_separator").default("."),
  importType: text("import_type").default("merge"),
  deleteText: text("delete_text"),
  sheetNumber: integer("sheet_number").default(1),
  startingRow: integer("starting_row").default(1),
  startingColumn: text("starting_column").default("A"),
  allowMultipleMnc: boolean("allow_multiple_mnc").default(false),
  
  headerRow: integer("header_row").default(1),
  dataStartRow: integer("data_start_row").default(2),
  delimiter: text("delimiter").default(","),
  prefixColumn: integer("prefix_column"),
  destinationColumn: integer("destination_column"),
  rateColumn: integer("rate_column"),
  effectiveDateColumn: integer("effective_date_column"),
  expiryDateColumn: integer("expiry_date_column"),
  connectionFeeColumn: integer("connection_fee_column"),
  billingIncrementColumn: integer("billing_increment_column"),
  dateFormat: text("date_format").default("YYYY-MM-DD"),
  defaultCurrency: text("default_currency").default("USD"),
  ignorePatterns: text("ignore_patterns").array(),
  columnMappings: jsonb("column_mappings"),
  fileConfig: jsonb("file_config"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupplierImportTemplateSchema = createInsertSchema(supplierImportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplierImportTemplate = z.infer<typeof insertSupplierImportTemplateSchema>;
export type SupplierImportTemplate = typeof supplierImportTemplates.$inferSelect;

// ==================== ROUTE QUALITY MONITORING ====================

export const monitoringRules = pgTable("monitoring_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  prefix: text("prefix"),
  destination: text("destination"),
  checkIntervalMinutes: integer("check_interval_minutes").default(30),
  minimumCalls: integer("minimum_calls").default(50),
  isActive: boolean("is_active").default(true),
  businessHoursOnly: boolean("business_hours_only").default(false),
  businessHoursStart: text("business_hours_start").default("08:00"),
  businessHoursEnd: text("business_hours_end").default("22:00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const monitoringConditions = pgTable("monitoring_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").references(() => monitoringRules.id).notNull(),
  metric: text("metric").notNull(),
  operator: text("operator").notNull(),
  threshold: decimal("threshold", { precision: 10, scale: 4 }).notNull(),
  severity: alertSeverityEnum("severity").default("warning"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const monitoringActions = pgTable("monitoring_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").references(() => monitoringRules.id).notNull(),
  actionType: text("action_type").notNull(),
  actionConfig: jsonb("action_config"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").references(() => monitoringRules.id),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  routeId: varchar("route_id").references(() => routes.id),
  metric: text("metric"),
  currentValue: decimal("current_value", { precision: 10, scale: 4 }),
  threshold: decimal("threshold", { precision: 10, scale: 4 }),
  severity: alertSeverityEnum("severity").default("warning"),
  status: alertStatusEnum("status").default("active"),
  message: text("message"),
  actionsTaken: jsonb("actions_taken"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const routeMetrics = pgTable("route_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  routeId: varchar("route_id").references(() => routes.id),
  prefix: text("prefix"),
  timestamp: timestamp("timestamp").defaultNow(),
  totalCalls: integer("total_calls").default(0),
  answeredCalls: integer("answered_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
  asrPercent: decimal("asr_percent", { precision: 5, scale: 2 }),
  acdSeconds: decimal("acd_seconds", { precision: 10, scale: 2 }),
  pddMs: integer("pdd_ms"),
  nerPercent: decimal("ner_percent", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== DID MANAGEMENT ====================

export const didCountries = pgTable("did_countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isoCode: text("iso_code").notNull().unique(),
  dialCode: text("dial_code").notNull(),
  kycRequired: boolean("kyc_required").default(false),
  kycDocuments: text("kyc_documents").array(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const didCountryAssignments = pgTable("did_country_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  didCountryId: varchar("did_country_id").references(() => didCountries.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const didProviders = pgTable("did_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  countryIds: text("country_ids").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const didProviderAssignments = pgTable("did_provider_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  didProviderId: varchar("did_provider_id").references(() => didProviders.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dids = pgTable("dids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortId: serial("short_id").unique(),
  number: text("number").notNull().unique(),
  countryId: varchar("country_id").references(() => didCountries.id),
  providerId: varchar("provider_id").references(() => didProviders.id),
  customerId: varchar("customer_id").references(() => customers.id),
  status: didStatusEnum("status").default("available"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 4 }),
  setupFee: decimal("setup_fee", { precision: 10, scale: 4 }).default("0"),
  destinationType: text("destination_type"),
  destination: text("destination"),
  failoverDestination: text("failover_destination"),
  ringTimeout: integer("ring_timeout").default(30),
  connexcsDidId: text("connexcs_did_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== SIP TRUNKS ====================

export const sipTrunks = pgTable("sip_trunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  popId: varchar("pop_id").references(() => pops.id),
  voiceTierId: varchar("voice_tier_id").references(() => voiceTiers.id),
  channelPlanId: varchar("channel_plan_id").references(() => channelPlans.id),
  ipWhitelist: text("ip_whitelist").array(),
  codecIds: text("codec_ids").array(),
  authMethod: text("auth_method").default("user_pass"),
  status: extensionStatusEnum("status").default("active"),
  connexcsTrunkId: text("connexcs_trunk_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== PBX: EXTENSIONS ====================

export const extensions = pgTable("extensions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  extension: text("extension").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  sipUsername: text("sip_username").notNull().unique(),
  sipPassword: text("sip_password").notNull(),
  callerId: text("caller_id"),
  outboundDidId: varchar("outbound_did_id").references(() => dids.id),
  voicemailEnabled: boolean("voicemail_enabled").default(true),
  voicemailPin: text("voicemail_pin"),
  voicemailEmail: text("voicemail_email"),
  voicemailAttachAudio: boolean("voicemail_attach_audio").default(true),
  ringTimeout: integer("ring_timeout").default(20),
  dndEnabled: boolean("dnd_enabled").default(false),
  callWaitingEnabled: boolean("call_waiting_enabled").default(true),
  forwardingEnabled: boolean("forwarding_enabled").default(false),
  forwardingDestination: text("forwarding_destination"),
  status: extensionStatusEnum("status").default("active"),
  connexcsExtensionId: text("connexcs_extension_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== PBX: IVR ====================

export const ivrs = pgTable("ivrs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  greetingType: text("greeting_type").default("tts"),
  greetingText: text("greeting_text"),
  greetingAudioUrl: text("greeting_audio_url"),
  timeout: integer("timeout").default(10),
  maxRetries: integer("max_retries").default(3),
  invalidDestination: text("invalid_destination"),
  timeoutDestination: text("timeout_destination"),
  isActive: boolean("is_active").default(true),
  connexcsIvrId: text("connexcs_ivr_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ivrOptions = pgTable("ivr_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ivrId: varchar("ivr_id").references(() => ivrs.id).notNull(),
  digit: text("digit").notNull(),
  description: text("description"),
  destinationType: text("destination_type").notNull(),
  destination: text("destination").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== PBX: RING GROUPS ====================

export const ringGroups = pgTable("ring_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  extension: text("extension"),
  strategy: text("strategy").default("ring_all"),
  ringTimeout: integer("ring_timeout").default(20),
  noAnswerDestination: text("no_answer_destination"),
  isActive: boolean("is_active").default(true),
  connexcsRingGroupId: text("connexcs_ring_group_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ringGroupMembers = pgTable("ring_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ringGroupId: varchar("ring_group_id").references(() => ringGroups.id).notNull(),
  extensionId: varchar("extension_id").references(() => extensions.id),
  externalNumber: text("external_number"),
  priority: integer("priority").default(1),
  delay: integer("delay").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== PBX: QUEUES ====================

export const queues = pgTable("queues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  extension: text("extension"),
  strategy: text("strategy").default("round_robin"),
  maxWaitTime: integer("max_wait_time").default(300),
  announcePosition: boolean("announce_position").default(true),
  holdMusicUrl: text("hold_music_url"),
  timeoutDestination: text("timeout_destination"),
  isActive: boolean("is_active").default(true),
  connexcsQueueId: text("connexcs_queue_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const queueAgents = pgTable("queue_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queueId: varchar("queue_id").references(() => queues.id).notNull(),
  extensionId: varchar("extension_id").references(() => extensions.id).notNull(),
  penalty: integer("penalty").default(0),
  isLoggedIn: boolean("is_logged_in").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== VOICEMAILS & RECORDINGS ====================

export const voicemails = pgTable("voicemails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  extensionId: varchar("extension_id").references(() => extensions.id).notNull(),
  callerNumber: text("caller_number"),
  duration: integer("duration"),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callRecordings = pgTable("call_recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  extensionId: varchar("extension_id").references(() => extensions.id),
  didId: varchar("did_id").references(() => dids.id),
  callId: text("call_id"),
  callerNumber: text("caller_number"),
  calledNumber: text("called_number"),
  direction: text("direction"),
  duration: integer("duration"),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== PAYMENTS & BILLING ====================

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 4 }).notNull(),
  currency: text("currency").default("USD"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paypalTransactionId: text("paypal_transaction_id"),
  status: paymentStatusEnum("status").default("pending"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: decimal("amount", { precision: 12, scale: 4 }).notNull(),
  tax: decimal("tax", { precision: 12, scale: 4 }).default("0"),
  total: decimal("total", { precision: 12, scale: 4 }).notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  customerIdIdx: index("idx_invoices_customer_id").on(table.customerId),
  statusIdx: index("idx_invoices_status").on(table.status),
  createdAtIdx: index("idx_invoices_created_at").on(table.createdAt),
}));

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 4 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 4 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== REFERRALS ====================

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").references(() => customers.id).notNull(),
  referredId: varchar("referred_id").references(() => customers.id),
  referralCode: text("referral_code").notNull(),
  status: text("status").default("pending"),
  tier: integer("tier").default(1),
  commission: decimal("commission", { precision: 12, scale: 4 }).default("0"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referralClicks = pgTable("referral_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCode: text("referral_code").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== PROMO CODES & BONUSES ====================

export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").default("percentage"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  applyTo: text("apply_to").default("all"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promoCodeAssignments = pgTable("promo_code_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promoCodeId: varchar("promo_code_id").references(() => promoCodes.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bonusTypes = pgTable("bonus_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  type: text("type").default("signup"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  conditions: jsonb("conditions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bonusTypeAssignments = pgTable("bonus_type_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bonusTypeId: varchar("bonus_type_id").references(() => bonusTypes.id).notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== EMAIL SYSTEM ====================

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content"),
  textContent: text("text_content"),
  category: text("category").default("general"),
  variables: text("variables").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  customerId: varchar("customer_id").references(() => customers.id),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  status: text("status").default("pending"),
  provider: text("provider").default("brevo"),
  providerMessageId: text("provider_message_id"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== FILE TEMPLATES (PDF Generation) ====================

export const fileTemplateTypeEnum = pgEnum("file_template_type", [
  "invoice",
  "statement",
  "credit_note",
  "receipt",
  "rate_card",
  "contract",
  "other",
]);

export const fileTemplates = pgTable("file_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  templateType: fileTemplateTypeEnum("template_type").default("invoice"),
  description: text("description"),
  dateFormat: text("date_format").default("dd/mm/yyyy"),
  numberSeparators: text("number_separators").default("comma_dot"),
  decimalPlaces: integer("decimal_places").default(2),
  taxationRate: decimal("taxation_rate", { precision: 5, scale: 2 }),
  negativeValueFormat: text("negative_value_format").default("minus_sign"),
  durationFormat: text("duration_format").default("m.0"),
  callItemizationTop: integer("call_itemization_top").default(50),
  callItemizationSortBy: text("call_itemization_sort_by").default("zone_ascending"),
  headerContent: text("header_content"),
  bodyContent: text("body_content"),
  footerContent: text("footer_content"),
  variables: text("variables").array(),
  isDraft: boolean("is_draft").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== SUPPORT TICKETS ====================

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => customers.id),
  userId: varchar("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description"),
  category: text("category"),
  priority: ticketPriorityEnum("priority").default("medium"),
  status: ticketStatusEnum("status").default("open"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("idx_tickets_status").on(table.status),
  createdAtIdx: index("idx_tickets_created_at").on(table.createdAt),
}));

export const ticketReplies = pgTable("ticket_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => tickets.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== AI AGENT ====================

export const aiAgentActions = pgTable("ai_agent_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  command: text("command").notNull(),
  intent: text("intent"),
  actions: jsonb("actions"),
  status: text("status").default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  executedAt: timestamp("executed_at"),
  rollbackData: jsonb("rollback_data"),
  rolledBackAt: timestamp("rolled_back_at"),
  tokensUsed: integer("tokens_used"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pcapAnalysis = pgTable("pcap_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: text("filename"),
  fileUrl: text("file_url"),
  analysis: jsonb("analysis"),
  summary: text("summary"),
  recommendations: text("recommendations").array(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== SOCIAL MEDIA ====================

export const socialAccounts = pgTable("social_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(),
  accountName: text("account_name"),
  accountId: text("account_id"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialPosts = pgTable("social_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  platforms: text("platforms").array(),
  mediaUrls: text("media_urls").array(),
  status: text("status").default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  ayrsharePostId: text("ayrshare_post_id"),
  engagement: jsonb("engagement"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentAssets = pgTable("content_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array(),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== AUDIT & VERSIONING ====================

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // No FK - users may be in MemStorage while audit logs go to DB
  action: text("action").notNull(),
  tableName: text("table_name"),
  recordId: text("record_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_audit_logs_user_id").on(table.userId),
  actionIdx: index("idx_audit_logs_action").on(table.action),
  createdAtIdx: index("idx_audit_logs_created_at").on(table.createdAt),
  tableNameRecordIdx: index("idx_audit_logs_table_record").on(table.tableName, table.recordId),
}));

export const configVersions = pgTable("config_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  version: integer("version").notNull(),
  data: jsonb("data").notNull(),
  status: configStatusEnum("status").default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  connexcsSyncStatus: text("connexcs_sync_status"),
  connexcsSyncError: text("connexcs_sync_error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connexcsSyncLog = pgTable("connexcs_sync_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operation: text("operation").notNull(),
  endpoint: text("endpoint"),
  requestData: jsonb("request_data"),
  responseData: jsonb("response_data"),
  status: text("status"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trash = pgTable("trash", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  recordData: jsonb("record_data").notNull(),
  deletedBy: varchar("deleted_by"), // No FK - users may be in MemStorage
  deletedAt: timestamp("deleted_at").defaultNow(),
  restorableUntil: timestamp("restorable_until"),
  isRestored: boolean("is_restored").default(false),
  restoredAt: timestamp("restored_at"),
  restoredBy: varchar("restored_by"), // No FK - users may be in MemStorage
});

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  type: text("type").default("string"),
  category: text("category").default("general"),
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== DEV TESTS ====================

export const devTestStatusEnum = pgEnum("dev_test_status", ["passed", "failed", "skipped"]);

export const devTests = pgTable("dev_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  module: text("module").notNull(),
  testSteps: jsonb("test_steps"),
  expectedResult: text("expected_result"),
  actualResult: text("actual_result"),
  status: devTestStatusEnum("status").notNull(),
  duration: integer("duration"),
  errorMessage: text("error_message"),
  createdTestData: jsonb("created_test_data"),
  cleanedUp: boolean("cleaned_up").default(false),
  testedBy: varchar("tested_by"),
  testedAt: timestamp("tested_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDevTestSchema = createInsertSchema(devTests).omit({ id: true, createdAt: true });

// ==================== E2E TESTING ENGINE (Playwright + axe-core) ====================

export const e2eRunStatusEnum = pgEnum("e2e_run_status", ["pending", "running", "completed", "failed"]);
export const e2eResultStatusEnum = pgEnum("e2e_result_status", ["passed", "failed", "skipped"]);

// E2E test runs
export const e2eRuns = pgTable("e2e_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  scope: text("scope").notNull(), // "all" or module name like "carriers"
  status: e2eRunStatusEnum("status").default("pending"),
  totalTests: integer("total_tests").default(0),
  passedTests: integer("passed_tests").default(0),
  failedTests: integer("failed_tests").default(0),
  currentIndex: integer("current_index").default(0), // Current test index
  currentPage: text("current_page"), // Route being tested
  accessibilityScore: integer("accessibility_score"), // 0-100
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in ms
  triggeredBy: varchar("triggered_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual page results within a run
export const e2eResults = pgTable("e2e_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").references(() => e2eRuns.id).notNull(),
  moduleName: text("module_name").notNull(),
  pageName: text("page_name").notNull(),
  route: text("route").notNull(),
  status: e2eResultStatusEnum("status").notNull(),
  duration: integer("duration"), // in ms
  screenshotPath: text("screenshot_path"), // Path to screenshot on failure
  accessibilityScore: integer("accessibility_score"), // 0-100
  accessibilityIssues: jsonb("accessibility_issues"), // Array of issues
  checks: jsonb("checks"), // Detailed checks: { pageLoads, hasContent, noErrors, buttons, forms, accessibility }
  errorMessage: text("error_message"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const insertE2eRunSchema = createInsertSchema(e2eRuns).omit({ id: true, createdAt: true });
export const insertE2eResultSchema = createInsertSchema(e2eResults).omit({ id: true, executedAt: true });

// ==================== EXPERIENCE MANAGER ====================

export const emContentItems = pgTable("em_content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: emSectionEnum("section").notNull(),
  entityType: text("entity_type").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  status: emContentStatusEnum("status").default("draft"),
  draftVersionId: varchar("draft_version_id"),
  previewVersionId: varchar("preview_version_id"),
  publishedVersionId: varchar("published_version_id"),
  previewToken: text("preview_token"),
  previewExpiresAt: timestamp("preview_expires_at"),
  lastPublishedAt: timestamp("last_published_at"),
  lastPublishedBy: varchar("last_published_by"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emContentVersions = pgTable("em_content_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentItemId: varchar("content_item_id").references(() => emContentItems.id).notNull(),
  version: integer("version").notNull(),
  data: jsonb("data").notNull(),
  changeDescription: text("change_description"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emValidationResults = pgTable("em_validation_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentItemId: varchar("content_item_id").references(() => emContentItems.id).notNull(),
  versionId: varchar("version_id").references(() => emContentVersions.id).notNull(),
  validationType: text("validation_type").notNull(),
  passed: boolean("passed").notNull(),
  errors: jsonb("errors"),
  warnings: jsonb("warnings"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emPublishHistory = pgTable("em_publish_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentItemId: varchar("content_item_id").references(() => emContentItems.id).notNull(),
  fromVersionId: varchar("from_version_id").references(() => emContentVersions.id),
  toVersionId: varchar("to_version_id").references(() => emContentVersions.id).notNull(),
  action: text("action").notNull(),
  publishedBy: varchar("published_by"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== CDRs ====================

export const cdrs = pgTable("cdrs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  callId: text("call_id"),
  callerNumber: text("caller_number"),
  calledNumber: text("called_number"),
  direction: text("direction"),
  startTime: timestamp("start_time"),
  answerTime: timestamp("answer_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  billableSeconds: integer("billable_seconds"),
  rate: decimal("rate", { precision: 10, scale: 6 }),
  cost: decimal("cost", { precision: 12, scale: 6 }),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  routeId: varchar("route_id").references(() => routes.id),
  sipResponseCode: integer("sip_response_code"),
  hangupCause: text("hangup_cause"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== WEBHOOKS ====================

export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  url: text("url").notNull(),
  events: text("events").array(),
  secret: text("secret"),
  isActive: boolean("is_active").default(true),
  lastDeliveryAt: timestamp("last_delivery_at"),
  lastDeliveryStatus: text("last_delivery_status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookId: varchar("webhook_id").references(() => webhooks.id).notNull(),
  event: text("event").notNull(),
  payload: jsonb("payload"),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  deliveredAt: timestamp("delivered_at"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== CUSTOMER API KEYS ====================

export const customerApiKeys = pgTable("customer_api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  permissions: text("permissions").array(),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== CURRENCIES & FX RATES ====================

export const currencies = pgTable("currencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  decimals: integer("decimals").default(2),
  markup: decimal("markup", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fxRates = pgTable("fx_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  baseCurrency: text("base_currency").notNull().default("USD"),
  quoteCurrency: text("quote_currency").notNull(),
  rate: decimal("rate", { precision: 18, scale: 8 }).notNull(),
  source: text("source").default("openexchangerates"),
  effectiveAt: timestamp("effective_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerCurrencySettings = pgTable("customer_currency_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  displayCurrency: text("display_currency").default("USD"),
  hedgeSpreadPercent: decimal("hedge_spread_percent", { precision: 5, scale: 2 }).default("2"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ledgerEntries = pgTable("ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  type: text("type").notNull(),
  description: text("description"),
  baseAmount: decimal("base_amount", { precision: 14, scale: 6 }).notNull(),
  baseCurrency: text("base_currency").default("USD"),
  displayAmount: decimal("display_amount", { precision: 14, scale: 6 }),
  displayCurrency: text("display_currency"),
  fxRateId: varchar("fx_rate_id").references(() => fxRates.id),
  fxRateUsed: decimal("fx_rate_used", { precision: 18, scale: 8 }),
  referenceType: text("reference_type"),
  referenceId: varchar("reference_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const currencyReconciliations = pgTable("currency_reconciliations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reconciliationDate: timestamp("reconciliation_date").notNull(),
  customerId: varchar("customer_id").references(() => customers.id),
  connexcsTotal: decimal("connexcs_total", { precision: 14, scale: 6 }),
  didtronTotal: decimal("didtron_total", { precision: 14, scale: 6 }),
  variance: decimal("variance", { precision: 14, scale: 6 }),
  variancePercent: decimal("variance_percent", { precision: 8, scale: 4 }),
  fxGainLoss: decimal("fx_gain_loss", { precision: 14, scale: 6 }),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== A-Z DESTINATIONS DATABASE ====================

export const billingIncrementEnum = pgEnum("billing_increment", [
  "1/1", "6/6", "30/30", "60/60", "30/6", "60/6", "60/1"
]);

export const azDestinations = pgTable("az_destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  destination: text("destination").notNull(),
  region: text("region"),
  billingIncrement: billingIncrementEnum("billing_increment").default("60/60"),
  gracePeriod: integer("grace_period").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAzDestinationSchema = createInsertSchema(azDestinations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAzDestination = z.infer<typeof insertAzDestinationSchema>;
export type AzDestination = typeof azDestinations.$inferSelect;

// ==================== PERIOD EXCEPTIONS ====================

export const periodExceptionChangeTypeEnum = pgEnum("period_exception_change_type", [
  "added", "updated", "removed"
]);

export const periodExceptionChangeSourceEnum = pgEnum("period_exception_change_source", [
  "sync", "manual"
]);

export const periodExceptions = pgTable("period_exceptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prefix: text("prefix").notNull(),
  zoneName: text("zone_name").notNull(),
  countryName: text("country_name"),
  initialInterval: integer("initial_interval").notNull(),
  recurringInterval: integer("recurring_interval").notNull(),
  azDestinationId: varchar("az_destination_id").references(() => azDestinations.id),
  intervalHash: text("interval_hash"),
  syncedAt: timestamp("synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_period_exceptions_prefix").on(table.prefix),
  index("idx_period_exceptions_zone").on(table.zoneName),
  index("idx_period_exceptions_country").on(table.countryName),
]);

export const periodExceptionHistory = pgTable("period_exception_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodExceptionId: varchar("period_exception_id").references(() => periodExceptions.id),
  prefix: text("prefix").notNull(),
  zoneName: text("zone_name").notNull(),
  changeType: periodExceptionChangeTypeEnum("change_type").notNull(),
  previousInitialInterval: integer("previous_initial_interval"),
  previousRecurringInterval: integer("previous_recurring_interval"),
  newInitialInterval: integer("new_initial_interval"),
  newRecurringInterval: integer("new_recurring_interval"),
  changedByUserId: varchar("changed_by_user_id").references(() => users.id),
  changedByEmail: text("changed_by_email"),
  changeSource: periodExceptionChangeSourceEnum("change_source").default("sync"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_period_exception_history_exception").on(table.periodExceptionId),
  index("idx_period_exception_history_created").on(table.createdAt),
]);

export const insertPeriodExceptionSchema = createInsertSchema(periodExceptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  syncedAt: true,
});

export const insertPeriodExceptionHistorySchema = createInsertSchema(periodExceptionHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertPeriodException = z.infer<typeof insertPeriodExceptionSchema>;
export type PeriodException = typeof periodExceptions.$inferSelect;
export type InsertPeriodExceptionHistory = z.infer<typeof insertPeriodExceptionHistorySchema>;
export type PeriodExceptionHistory = typeof periodExceptionHistory.$inferSelect;

// ==================== SIP TESTER ====================

export const sipTestTypeEnum = pgEnum("sip_test_type", [
  "quick", "quality", "pdd", "dtmf", "cli", "codec", "capacity", 
  "failover", "fax", "tls_srtp", "nat", "registration", "media_path", "e911"
]);

export const sipTestStatusEnum = pgEnum("sip_test_status", [
  "pending", "running", "completed", "failed", "timeout"
]);

export const sipTestResultEnum = pgEnum("sip_test_result", [
  "pass", "fail", "partial", "inconclusive"
]);

export const sipTestConfigs = pgTable("sip_test_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  testType: sipTestTypeEnum("test_type").default("quick"),
  destinations: text("destinations").array(),
  cliNumber: text("cli_number"),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  customerId: varchar("customer_id").references(() => customers.id),
  provider: text("provider").default("connexcs"),
  isAdvancedMode: boolean("is_advanced_mode").default(false),
  advancedSettings: jsonb("advanced_settings"),
  alertThresholds: jsonb("alert_thresholds"),
  isActive: boolean("is_active").default(true),
  isShared: boolean("is_shared").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sipTestSchedules = pgTable("sip_test_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").references(() => sipTestConfigs.id).notNull(),
  name: text("name").notNull(),
  cronExpression: text("cron_expression").notNull(),
  timezone: text("timezone").default("UTC"),
  portalType: text("portal_type").default("admin"),
  customerId: varchar("customer_id").references(() => customers.id),
  isActive: boolean("is_active").default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sipTestResults = pgTable("sip_test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").references(() => sipTestConfigs.id),
  scheduleId: varchar("schedule_id").references(() => sipTestSchedules.id),
  testType: sipTestTypeEnum("test_type").notNull(),
  destination: text("destination"),
  cliSent: text("cli_sent"),
  cliReceived: text("cli_received"),
  status: sipTestStatusEnum("status").default("pending"),
  result: sipTestResultEnum("result"),
  pddMs: integer("pdd_ms"),
  mosScore: decimal("mos_score", { precision: 3, scale: 2 }),
  jitterMs: decimal("jitter_ms", { precision: 10, scale: 2 }),
  packetLossPercent: decimal("packet_loss_percent", { precision: 5, scale: 2 }),
  latencyMs: integer("latency_ms"),
  sipResponseCode: integer("sip_response_code"),
  sipTrace: text("sip_trace"),
  rtpStats: jsonb("rtp_stats"),
  codecNegotiated: text("codec_negotiated"),
  dtmfResult: text("dtmf_result"),
  failoverTime: integer("failover_time"),
  errorMessage: text("error_message"),
  aiAnalysis: text("ai_analysis"),
  aiSuggestions: text("ai_suggestions").array(),
  provider: text("provider").default("connexcs"),
  providerTestId: text("provider_test_id"),
  durationMs: integer("duration_ms"),
  testedAt: timestamp("tested_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sipTestSyncPermissions = pgTable("sip_test_sync_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourcePortal: text("source_portal").notNull(),
  targetPortal: text("target_portal").notNull(),
  testType: sipTestTypeEnum("test_type"),
  canViewResults: boolean("can_view_results").default(true),
  canViewTrace: boolean("can_view_trace").default(false),
  canViewAiAnalysis: boolean("can_view_ai_analysis").default(true),
  customerId: varchar("customer_id").references(() => customers.id),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sipTestAlerts = pgTable("sip_test_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").references(() => sipTestConfigs.id),
  resultId: varchar("result_id").references(() => sipTestResults.id),
  alertType: text("alert_type").notNull(),
  metric: text("metric"),
  threshold: decimal("threshold", { precision: 10, scale: 4 }),
  actualValue: decimal("actual_value", { precision: 10, scale: 4 }),
  severity: alertSeverityEnum("severity").default("warning"),
  message: text("message"),
  notificationsSent: jsonb("notifications_sent"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SIP Test Audio Files (IVR recordings for quality tests)
export const sipTestAudioFiles = pgTable("sip_test_audio_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  duration: integer("duration"),
  format: text("format").default("wav"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SIP Test Numbers (crowdsourced database of test numbers)
export const sipTestNumbers = pgTable("sip_test_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code").notNull(),
  countryName: text("country_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  numberType: text("number_type").default("landline"),
  carrier: text("carrier"),
  verified: boolean("verified").default(false),
  lastTestedAt: timestamp("last_tested_at"),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  avgMos: decimal("avg_mos", { precision: 3, scale: 2 }),
  avgPdd: integer("avg_pdd"),
  testCount: integer("test_count").default(0),
  contributedBy: varchar("contributed_by").references(() => customers.id),
  isPublic: boolean("is_public").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SIP Test Runs (actual test execution records)
export const sipTestRuns = pgTable("sip_test_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  testName: text("test_name"),
  testMode: text("test_mode").default("standard"),
  routeSource: text("route_source").notNull(),
  tierId: varchar("tier_id").references(() => voiceTiers.id),
  supplierId: varchar("supplier_id").references(() => class4Carriers.id),
  supplierIds: text("supplier_ids").array(),
  destinations: text("destinations").array(),
  countryFilters: text("country_filters").array(),
  manualNumbers: text("manual_numbers").array(),
  useDbNumbers: boolean("use_db_numbers").default(false),
  addToDb: boolean("add_to_db").default(false),
  codec: text("codec").default("G711"),
  audioFileId: varchar("audio_file_id").references(() => sipTestAudioFiles.id),
  aniMode: text("ani_mode").default("any"),
  aniNumber: text("ani_number"),
  aniCountries: text("ani_countries").array(),
  callsCount: integer("calls_count").default(5),
  maxDuration: integer("max_duration").default(30),
  capacity: integer("capacity").default(1),
  status: sipTestStatusEnum("status").default("pending"),
  totalCalls: integer("total_calls").default(0),
  successfulCalls: integer("successful_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
  avgMos: decimal("avg_mos", { precision: 3, scale: 2 }),
  avgPdd: integer("avg_pdd"),
  avgJitter: decimal("avg_jitter", { precision: 10, scale: 2 }),
  avgPacketLoss: decimal("avg_packet_loss", { precision: 5, scale: 2 }),
  totalDurationSec: integer("total_duration_sec").default(0),
  totalCost: decimal("total_cost", { precision: 14, scale: 6 }).default("0"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SIP Test Run Results (individual call results within a test run)
export const sipTestRunResults = pgTable("sip_test_run_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testRunId: varchar("test_run_id").references(() => sipTestRuns.id).notNull(),
  callIndex: integer("call_index").notNull(),
  destination: text("destination").notNull(),
  aniUsed: text("ani_used"),
  supplierName: text("supplier_name"),
  tierName: text("tier_name"),
  status: sipTestStatusEnum("status").default("pending"),
  result: sipTestResultEnum("result"),
  sipResponseCode: integer("sip_response_code"),
  pddMs: integer("pdd_ms"),
  mosScore: decimal("mos_score", { precision: 3, scale: 2 }),
  jitterMs: decimal("jitter_ms", { precision: 10, scale: 2 }),
  packetLossPercent: decimal("packet_loss_percent", { precision: 5, scale: 2 }),
  latencyMs: integer("latency_ms"),
  codecUsed: text("codec_used"),
  durationSec: integer("duration_sec"),
  callCost: decimal("call_cost", { precision: 14, scale: 6 }),
  ratePerMin: decimal("rate_per_min", { precision: 14, scale: 6 }),
  errorMessage: text("error_message"),
  sipTrace: text("sip_trace"),
  rtpStats: jsonb("rtp_stats"),
  connexcsCallId: text("connexcs_call_id"),
  testedAt: timestamp("tested_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SIP Test Profiles (ConnexCS server IPs for testing)
export const sipTestProfiles = pgTable("sip_test_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  ip: text("ip").notNull(),
  port: integer("port").default(5060),
  protocol: text("protocol").default("SIP"),
  username: text("username"),
  password: text("password"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SIP Test Suppliers (carriers/routes to test through)
export const sipTestSuppliers = pgTable("sip_test_suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  codec: text("codec").default("G729"),
  prefix: text("prefix"),
  protocol: text("protocol").default("SIP"),
  email: text("email"),
  isOurTier: boolean("is_our_tier").default(false),
  tierId: varchar("tier_id").references(() => voiceTiers.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SIP Test Settings (general settings per customer)
export const sipTestSettings = pgTable("sip_test_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).unique(),
  concurrentCalls: integer("concurrent_calls").default(10),
  cliAcceptablePrefixes: text("cli_acceptable_prefixes").default("+00"),
  defaultAudioId: varchar("default_audio_id").references(() => sipTestAudioFiles.id),
  maxWaitAnswer: integer("max_wait_answer").default(80),
  defaultCallsCount: integer("default_calls_count").default(5),
  defaultCodec: text("default_codec").default("G729"),
  defaultDuration: integer("default_duration").default(30),
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== CLASS 4 SOFTSWITCH ENHANCEMENTS ====================

export const class4Customers = pgTable("class4_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCustomerId: varchar("parent_customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  companyName: text("company_name"),
  billingEmail: text("billing_email"),
  technicalEmail: text("technical_email"),
  balance: decimal("balance", { precision: 14, scale: 6 }).default("0"),
  creditLimit: decimal("credit_limit", { precision: 14, scale: 6 }).default("0"),
  billingType: billingTypeEnum("billing_type").default("prepaid"),
  displayCurrency: text("display_currency").default("USD"),
  status: customerStatusEnum("status").default("active"),
  connexcsCustomerId: text("connexcs_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const class4Carriers = pgTable("class4_carriers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCustomerId: varchar("parent_customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  sipHost: text("sip_host"),
  sipPort: integer("sip_port").default(5060),
  techPrefix: text("tech_prefix"),
  maxChannels: integer("max_channels"),
  maxCps: integer("max_cps"),
  failoverIps: text("failover_ips").array(),
  status: routeStatusEnum("status").default("active"),
  connexcsCarrierId: text("connexcs_carrier_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const class4ProviderRateCards = pgTable("class4_provider_rate_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCustomerId: varchar("parent_customer_id").references(() => customers.id).notNull(),
  carrierId: varchar("carrier_id").references(() => class4Carriers.id).notNull(),
  name: text("name").notNull(),
  currency: text("currency").default("USD"),
  effectiveDate: timestamp("effective_date"),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  connexcsRateCardId: text("connexcs_rate_card_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const class4ProviderRates = pgTable("class4_provider_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rateCardId: varchar("rate_card_id").references(() => class4ProviderRateCards.id).notNull(),
  prefix: text("prefix").notNull(),
  destination: text("destination"),
  rate: decimal("rate", { precision: 12, scale: 8 }).notNull(),
  connectionFee: decimal("connection_fee", { precision: 10, scale: 6 }).default("0"),
  billingIncrement: integer("billing_increment").default(1),
  minDuration: integer("min_duration").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const class4CustomerRateCards = pgTable("class4_customer_rate_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCustomerId: varchar("parent_customer_id").references(() => customers.id).notNull(),
  class4CustomerId: varchar("class4_customer_id").references(() => class4Customers.id),
  name: text("name").notNull(),
  sourceRateCardId: varchar("source_rate_card_id").references(() => class4ProviderRateCards.id),
  markupType: text("markup_type").default("percentage"),
  markupValue: decimal("markup_value", { precision: 10, scale: 4 }).default("10"),
  profitAssuranceEnabled: boolean("profit_assurance_enabled").default(true),
  currency: text("currency").default("USD"),
  isActive: boolean("is_active").default(true),
  connexcsRateCardId: text("connexcs_rate_card_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const class4CustomerRates = pgTable("class4_customer_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rateCardId: varchar("rate_card_id").references(() => class4CustomerRateCards.id).notNull(),
  prefix: text("prefix").notNull(),
  destination: text("destination"),
  buyRate: decimal("buy_rate", { precision: 12, scale: 8 }),
  sellRate: decimal("sell_rate", { precision: 12, scale: 8 }).notNull(),
  connectionFee: decimal("connection_fee", { precision: 10, scale: 6 }).default("0"),
  billingIncrement: integer("billing_increment").default(1),
  profit: decimal("profit", { precision: 12, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const class4LcrRules = pgTable("class4_lcr_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCustomerId: varchar("parent_customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  prefix: text("prefix"),
  strategy: text("strategy").default("lcr"),
  carrierIds: text("carrier_ids").array(),
  carrierPriorities: jsonb("carrier_priorities"),
  qualityThresholds: jsonb("quality_thresholds"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const class4RoutingRules = pgTable("class4_routing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCustomerId: varchar("parent_customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  prefix: text("prefix"),
  cliRules: jsonb("cli_rules"),
  dncEnabled: boolean("dnc_enabled").default(false),
  dncListId: varchar("dnc_list_id"),
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const class4Cdrs = pgTable("class4_cdrs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentCustomerId: varchar("parent_customer_id").references(() => customers.id).notNull(),
  class4CustomerId: varchar("class4_customer_id").references(() => class4Customers.id),
  class4CarrierId: varchar("class4_carrier_id").references(() => class4Carriers.id),
  callId: text("call_id"),
  callerNumber: text("caller_number"),
  calledNumber: text("called_number"),
  startTime: timestamp("start_time"),
  answerTime: timestamp("answer_time"),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  billableSeconds: integer("billable_seconds"),
  buyRate: decimal("buy_rate", { precision: 12, scale: 8 }),
  sellRate: decimal("sell_rate", { precision: 12, scale: 8 }),
  buyCost: decimal("buy_cost", { precision: 14, scale: 6 }),
  sellCost: decimal("sell_cost", { precision: 14, scale: 6 }),
  profit: decimal("profit", { precision: 14, scale: 6 }),
  sipResponseCode: integer("sip_response_code"),
  hangupCause: text("hangup_cause"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== AI VOICE AGENT ====================

export const aiVoiceAgentStatusEnum = pgEnum("ai_voice_agent_status", [
  "draft", "active", "paused", "disabled"
]);

export const aiVoiceAgents = pgTable("ai_voice_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").default("inbound"),
  voiceId: text("voice_id"),
  voiceProvider: text("voice_provider").default("openai"),
  systemPrompt: text("system_prompt"),
  greetingMessage: text("greeting_message"),
  fallbackMessage: text("fallback_message"),
  maxCallDuration: integer("max_call_duration").default(600),
  status: aiVoiceAgentStatusEnum("status").default("draft"),
  didId: varchar("did_id").references(() => dids.id),
  webhookUrl: text("webhook_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiVoiceFlows = pgTable("ai_voice_flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => aiVoiceAgents.id).notNull(),
  name: text("name").notNull(),
  flowData: jsonb("flow_data"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiVoiceTrainingData = pgTable("ai_voice_training_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => aiVoiceAgents.id).notNull(),
  category: text("category"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiVoiceCampaigns = pgTable("ai_voice_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  agentId: varchar("agent_id").references(() => aiVoiceAgents.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  phonebookId: varchar("phonebook_id").references(() => aiVoicePhonebooks.id),
  sipTrunkId: varchar("sip_trunk_id").references(() => sipTrunks.id),
  callerId: text("caller_id"),
  contactList: jsonb("contact_list"),
  scheduledAt: timestamp("scheduled_at"),
  scheduleEndAt: timestamp("schedule_end_at"),
  timeZone: text("time_zone").default("UTC"),
  callWindowStart: text("call_window_start"),
  callWindowEnd: text("call_window_end"),
  maxConcurrentCalls: integer("max_concurrent_calls").default(5),
  maxRetries: integer("max_retries").default(2),
  retryDelay: integer("retry_delay").default(3600),
  callsCompleted: integer("calls_completed").default(0),
  callsTotal: integer("calls_total").default(0),
  callsSuccessful: integer("calls_successful").default(0),
  callsFailed: integer("calls_failed").default(0),
  status: text("status").default("draft"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiVoiceCallLogs = pgTable("ai_voice_call_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => aiVoiceAgents.id).notNull(),
  campaignId: varchar("campaign_id").references(() => aiVoiceCampaigns.id),
  callId: text("call_id"),
  callerNumber: text("caller_number"),
  calledNumber: text("called_number"),
  direction: text("direction"),
  duration: integer("duration"),
  transcript: text("transcript"),
  summary: text("summary"),
  sentiment: text("sentiment"),
  outcome: text("outcome"),
  tokensUsed: integer("tokens_used"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Voice Rate Configurations (detailed rate settings per tier/destination)
export const aiVoiceRateConfigs = pgTable("ai_voice_rate_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  destinationPrefix: text("destination_prefix"),
  countryCode: text("country_code"),
  ratePerMinute: decimal("rate_per_minute", { precision: 10, scale: 6 }).notNull(),
  connectionFee: decimal("connection_fee", { precision: 10, scale: 4 }).default("0"),
  minimumDuration: integer("minimum_duration").default(0),
  billingIncrement: integer("billing_increment").default(1),
  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),
  llmCostPerToken: decimal("llm_cost_per_token", { precision: 12, scale: 8 }),
  ttsCostPerChar: decimal("tts_cost_per_char", { precision: 12, scale: 8 }),
  sttCostPerSecond: decimal("stt_cost_per_second", { precision: 10, scale: 6 }),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Pricing Tiers (configurable by admin)
export const aiVoicePricingTiers = pgTable("ai_voice_pricing_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  ratePerMinute: decimal("rate_per_minute", { precision: 10, scale: 6 }).notNull(),
  setupFee: decimal("setup_fee", { precision: 10, scale: 4 }).default("0"),
  minimumBillableSeconds: integer("minimum_billable_seconds").default(60),
  billingIncrement: integer("billing_increment").default(6),
  llmProvider: text("llm_provider").default("openai"),
  ttsProvider: text("tts_provider").default("openai"),
  sttProvider: text("stt_provider").default("openai"),
  maxCallDuration: integer("max_call_duration").default(1800),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Knowledge Bases (document/file uploads)
export const aiVoiceKnowledgeBaseStatusEnum = pgEnum("ai_voice_kb_status", [
  "pending", "processing", "ready", "failed"
]);

export const aiVoiceKnowledgeBases = pgTable("ai_voice_knowledge_bases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  connexcsKbId: text("connexcs_kb_id"),
  status: aiVoiceKnowledgeBaseStatusEnum("status").default("pending"),
  documentCount: integer("document_count").default(0),
  totalTokens: integer("total_tokens").default(0),
  learnedTopics: jsonb("learned_topics"),
  extractedFaqs: jsonb("extracted_faqs"),
  keyPhrases: jsonb("key_phrases"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  trainingSummary: text("training_summary"),
  lastTrainedAt: timestamp("last_trained_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Knowledge Base Sources (individual files/urls)
export const aiVoiceKbSourceTypeEnum = pgEnum("ai_voice_kb_source_type", [
  "file", "url", "text", "faq"
]);

export const aiVoiceKbSources = pgTable("ai_voice_kb_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  knowledgeBaseId: varchar("knowledge_base_id").references(() => aiVoiceKnowledgeBases.id).notNull(),
  name: text("name").notNull(),
  sourceType: aiVoiceKbSourceTypeEnum("source_type").notNull(),
  content: text("content"),
  fileUrl: text("file_url"),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  status: aiVoiceKnowledgeBaseStatusEnum("status").default("pending"),
  tokenCount: integer("token_count").default(0),
  lastIndexedAt: timestamp("last_indexed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Phonebooks (contact lists for campaigns)
export const aiVoicePhonebooks = pgTable("ai_voice_phonebooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  contactCount: integer("contact_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Phonebook Contacts
export const aiVoiceContacts = pgTable("ai_voice_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phonebookId: varchar("phonebook_id").references(() => aiVoicePhonebooks.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  company: text("company"),
  customFields: jsonb("custom_fields"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Templates (pre-built agent templates)
export const aiVoiceTemplates = pgTable("ai_voice_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  icon: text("icon"),
  systemPrompt: text("system_prompt"),
  greetingMessage: text("greeting_message"),
  fallbackMessage: text("fallback_message"),
  voiceId: text("voice_id"),
  voiceProvider: text("voice_provider").default("openai"),
  defaultFlowData: jsonb("default_flow_data"),
  isGlobal: boolean("is_global").default(true),
  customerId: varchar("customer_id").references(() => customers.id),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Usage (per-call billing records)
export const aiVoiceUsage = pgTable("ai_voice_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  agentId: varchar("agent_id").references(() => aiVoiceAgents.id),
  callLogId: varchar("call_log_id").references(() => aiVoiceCallLogs.id),
  pricingTierId: varchar("pricing_tier_id").references(() => aiVoicePricingTiers.id),
  durationSeconds: integer("duration_seconds").default(0),
  billableSeconds: integer("billable_seconds").default(0),
  ratePerMinute: decimal("rate_per_minute", { precision: 10, scale: 6 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 6 }),
  llmTokens: integer("llm_tokens").default(0),
  ttsCharacters: integer("tts_characters").default(0),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  billingPeriod: text("billing_period"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Voice Feature Assignments (by category, group, customer)
export const aiVoiceAssignments = pgTable("ai_voice_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  featureName: text("feature_name").notNull(),
  assignmentType: assignmentTypeEnum("assignment_type").default("all"),
  categoryIds: text("category_ids").array(),
  groupIds: text("group_ids").array(),
  customerIds: text("customer_ids").array(),
  pricingTierId: varchar("pricing_tier_id").references(() => aiVoicePricingTiers.id),
  maxAgents: integer("max_agents"),
  maxCallsPerDay: integer("max_calls_per_day"),
  maxConcurrentCalls: integer("max_concurrent_calls"),
  allowOutbound: boolean("allow_outbound").default(true),
  allowInbound: boolean("allow_inbound").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Global Settings
export const aiVoiceSettings = pgTable("ai_voice_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value"),
  settingType: text("setting_type").default("string"),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Voice Webhooks
export const aiVoiceWebhooks = pgTable("ai_voice_webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: text("events").array(),
  headers: jsonb("headers"),
  isActive: boolean("is_active").default(true),
  secretKey: text("secret_key"),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount: integer("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== CRM INTEGRATIONS ====================

export const crmProviderEnum = pgEnum("crm_provider", ["salesforce", "hubspot"]);

export const crmConnectionStatusEnum = pgEnum("crm_connection_status", ["connected", "disconnected", "error", "pending"]);

export const crmSyncDirectionEnum = pgEnum("crm_sync_direction", ["inbound", "outbound", "bidirectional"]);

export const crmConnections = pgTable("crm_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  provider: crmProviderEnum("provider").notNull(),
  name: text("name").notNull(),
  status: crmConnectionStatusEnum("status").default("pending"),
  instanceUrl: text("instance_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  scopes: text("scopes").array(),
  settings: jsonb("settings"),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crmFieldMappings = pgTable("crm_field_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").references(() => crmConnections.id).notNull(),
  localEntity: text("local_entity").notNull(),
  localField: text("local_field").notNull(),
  crmEntity: text("crm_entity").notNull(),
  crmField: text("crm_field").notNull(),
  direction: crmSyncDirectionEnum("direction").default("bidirectional"),
  transformFunction: text("transform_function"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crmSyncSettings = pgTable("crm_sync_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").references(() => crmConnections.id).notNull(),
  syncCallLogs: boolean("sync_call_logs").default(true),
  syncContacts: boolean("sync_contacts").default(true),
  syncCampaigns: boolean("sync_campaigns").default(false),
  syncInterval: integer("sync_interval").default(15),
  autoCreateContacts: boolean("auto_create_contacts").default(false),
  autoLogActivities: boolean("auto_log_activities").default(true),
  contactMatchField: text("contact_match_field").default("phone"),
  defaultOwnerEmail: text("default_owner_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crmSyncLogs = pgTable("crm_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").references(() => crmConnections.id).notNull(),
  syncType: text("sync_type").notNull(),
  direction: crmSyncDirectionEnum("direction").notNull(),
  status: text("status").notNull(),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorDetails: jsonb("error_details"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const crmContactMappings = pgTable("crm_contact_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").references(() => crmConnections.id).notNull(),
  localContactId: varchar("local_contact_id"),
  crmContactId: text("crm_contact_id").notNull(),
  crmContactType: text("crm_contact_type").default("Contact"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  fullName: text("full_name"),
  crmData: jsonb("crm_data"),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== CMS & WHITE-LABEL ====================

export const cmsPortals = pgTable("cms_portals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  name: text("name").notNull(),
  customerId: varchar("customer_id").references(() => customers.id),
  domain: text("domain"),
  subdomain: text("subdomain"),
  themeId: varchar("theme_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cmsThemes = pgTable("cms_themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  colors: jsonb("colors"),
  typography: jsonb("typography"),
  spacing: jsonb("spacing"),
  borderRadius: text("border_radius").default("md"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  isDefault: boolean("is_default").default(false),
  customerId: varchar("customer_id").references(() => customers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cmsPages = pgTable("cms_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portalId: varchar("portal_id").references(() => cmsPortals.id).notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  content: jsonb("content"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cmsMenus = pgTable("cms_menus", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portalId: varchar("portal_id").references(() => cmsPortals.id).notNull(),
  name: text("name").notNull(),
  location: text("location").default("header"),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cmsMediaLibrary = pgTable("cms_media_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  altText: text("alt_text"),
  folder: text("folder"),
  size: integer("size"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantBranding = pgTable("tenant_branding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  companyName: text("company_name"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  customDomain: text("custom_domain"),
  customDomainVerified: boolean("custom_domain_verified").default(false),
  emailFromName: text("email_from_name"),
  emailFromAddress: text("email_from_address"),
  footerText: text("footer_text"),
  termsUrl: text("terms_url"),
  privacyUrl: text("privacy_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portal Login Pages - customize login appearance for each portal type
export const portalLoginPages = pgTable("portal_login_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portalType: text("portal_type").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  logoUrl: text("logo_url"),
  backgroundImageUrl: text("background_image_url"),
  backgroundColor: text("background_color"),
  primaryColor: text("primary_color"),
  textColor: text("text_color"),
  welcomeMessage: text("welcome_message"),
  footerText: text("footer_text"),
  showSocialLogin: boolean("show_social_login").default(false),
  showRememberMe: boolean("show_remember_me").default(true),
  showForgotPassword: boolean("show_forgot_password").default(true),
  customCss: text("custom_css"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site Settings - global website configuration
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  category: text("category").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  inputType: text("input_type").default("text"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Website Sections - manage homepage and other page sections
export const websiteSections = pgTable("website_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageSlug: text("page_slug").notNull(),
  sectionType: text("section_type").notNull(),
  title: text("title"),
  subtitle: text("subtitle"),
  content: jsonb("content"),
  backgroundImage: text("background_image"),
  backgroundColor: text("background_color"),
  displayOrder: integer("display_order").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== DOCUMENTATION PORTAL ====================

export const docCategories = pgTable("doc_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  displayOrder: integer("display_order").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const docArticles = pgTable("doc_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => docCategories.id).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  author: text("author"),
  tags: text("tags").array(),
  displayOrder: integer("display_order").default(0),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== INTEGRATIONS ====================

export const integrationStatusEnum = pgEnum("integration_status", ["connected", "disconnected", "error", "not_configured"]);

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  icon: text("icon"),
  status: integrationStatusEnum("status").default("not_configured"),
  isEnabled: boolean("is_enabled").default(false),
  credentials: jsonb("credentials"),
  settings: jsonb("settings"),
  lastTestedAt: timestamp("last_tested_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  testResult: text("test_result"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== INSERT SCHEMAS ====================

export const insertCurrencySchema = createInsertSchema(currencies).omit({ id: true, createdAt: true });
export const insertFxRateSchema = createInsertSchema(fxRates).omit({ id: true, createdAt: true });
export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries).omit({ id: true, createdAt: true });
export const insertSipTestConfigSchema = createInsertSchema(sipTestConfigs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSipTestScheduleSchema = createInsertSchema(sipTestSchedules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSipTestResultSchema = createInsertSchema(sipTestResults).omit({ id: true, createdAt: true });
export const insertSipTestAudioFileSchema = createInsertSchema(sipTestAudioFiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSipTestNumberSchema = createInsertSchema(sipTestNumbers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSipTestRunSchema = createInsertSchema(sipTestRuns).omit({ id: true, createdAt: true });
export const insertSipTestRunResultSchema = createInsertSchema(sipTestRunResults).omit({ id: true, createdAt: true });
export const insertSipTestProfileSchema = createInsertSchema(sipTestProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSipTestSupplierSchema = createInsertSchema(sipTestSuppliers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSipTestSettingsSchema = createInsertSchema(sipTestSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClass4CustomerSchema = createInsertSchema(class4Customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClass4CarrierSchema = createInsertSchema(class4Carriers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClass4ProviderRateCardSchema = createInsertSchema(class4ProviderRateCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClass4CustomerRateCardSchema = createInsertSchema(class4CustomerRateCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceAgentSchema = createInsertSchema(aiVoiceAgents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceFlowSchema = createInsertSchema(aiVoiceFlows).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceTrainingDataSchema = createInsertSchema(aiVoiceTrainingData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceCampaignSchema = createInsertSchema(aiVoiceCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceCallLogSchema = createInsertSchema(aiVoiceCallLogs).omit({ id: true, createdAt: true });
export const insertAiVoiceRateConfigSchema = createInsertSchema(aiVoiceRateConfigs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoicePricingTierSchema = createInsertSchema(aiVoicePricingTiers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceKnowledgeBaseSchema = createInsertSchema(aiVoiceKnowledgeBases).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceKbSourceSchema = createInsertSchema(aiVoiceKbSources).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoicePhonebookSchema = createInsertSchema(aiVoicePhonebooks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceContactSchema = createInsertSchema(aiVoiceContacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceTemplateSchema = createInsertSchema(aiVoiceTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceUsageSchema = createInsertSchema(aiVoiceUsage).omit({ id: true, createdAt: true });
export const insertAiVoiceAssignmentSchema = createInsertSchema(aiVoiceAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceSettingSchema = createInsertSchema(aiVoiceSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceWebhookSchema = createInsertSchema(aiVoiceWebhooks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCrmConnectionSchema = createInsertSchema(crmConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCrmFieldMappingSchema = createInsertSchema(crmFieldMappings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCrmSyncSettingsSchema = createInsertSchema(crmSyncSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCrmSyncLogSchema = createInsertSchema(crmSyncLogs).omit({ id: true, startedAt: true });
export const insertCrmContactMappingSchema = createInsertSchema(crmContactMappings).omit({ id: true, createdAt: true, lastSyncAt: true });
export const insertCmsPortalSchema = createInsertSchema(cmsPortals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsThemeSchema = createInsertSchema(cmsThemes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsMediaItemSchema = createInsertSchema(cmsMediaLibrary).omit({ id: true, createdAt: true });
export const insertDocCategorySchema = createInsertSchema(docCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocArticleSchema = createInsertSchema(docArticles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTenantBrandingSchema = createInsertSchema(tenantBranding).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPortalLoginPageSchema = createInsertSchema(portalLoginPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebsiteSectionSchema = createInsertSchema(websiteSections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true, createdAt: true, updatedAt: true });

export const insertEmContentItemSchema = createInsertSchema(emContentItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmContentVersionSchema = createInsertSchema(emContentVersions).omit({ id: true, createdAt: true });
export const insertEmValidationResultSchema = createInsertSchema(emValidationResults).omit({ id: true, createdAt: true });
export const insertEmPublishHistorySchema = createInsertSchema(emPublishHistory).omit({ id: true, createdAt: true });

export const insertCustomerCategorySchema = createInsertSchema(customerCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerGroupSchema = createInsertSchema(customerGroups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, shortId: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true }).partial({
  accountNumber: true,
  balance: true,
  creditLimit: true,
  lowBalanceThreshold1: true,
  lowBalanceThreshold2: true,
  lowBalanceThreshold3: true,
  autoTopUpEnabled: true,
  autoTopUpAmount: true,
  autoTopUpThreshold: true,
  billingEmail: true,
  technicalEmail: true,
  address: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,
  taxId: true,
  referralCode: true,
  referredBy: true,
  connexcsCustomerId: true,
  categoryId: true,
  groupId: true,
  billingTermId: true,
  kycStatus: true,
  status: true,
  billingType: true,
});
export const insertCarrierSchema = createInsertSchema(carriers).omit({ id: true, shortId: true, createdAt: true, updatedAt: true });
export const insertCarrierInterconnectSchema = createInsertSchema(carrierInterconnects).omit({ id: true, shortId: true, createdAt: true, updatedAt: true });
export const insertCarrierServiceSchema = createInsertSchema(carrierServices).omit({ id: true, shortId: true, createdAt: true, updatedAt: true });
export const insertServiceMatchListSchema = createInsertSchema(serviceMatchLists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCarrierContactSchema = createInsertSchema(carrierContacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCarrierCreditAlertSchema = createInsertSchema(carrierCreditAlerts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCarrierAssignmentSchema = createInsertSchema(carrierAssignments).omit({ id: true, createdAt: true });
export const insertPopSchema = createInsertSchema(pops).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVoiceTierSchema = createInsertSchema(voiceTiers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCodecSchema = createInsertSchema(codecs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChannelPlanSchema = createInsertSchema(channelPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRouteGroupSchema = createInsertSchema(routeGroups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMonitoringRuleSchema = createInsertSchema(monitoringRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDidCountrySchema = createInsertSchema(didCountries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDidProviderSchema = createInsertSchema(didProviders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDidSchema = createInsertSchema(dids).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSipTrunkSchema = createInsertSchema(sipTrunks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExtensionSchema = createInsertSchema(extensions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIvrSchema = createInsertSchema(ivrs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRingGroupSchema = createInsertSchema(ringGroups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQueueSchema = createInsertSchema(queues).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTicketReplySchema = createInsertSchema(ticketReplies).omit({ id: true, createdAt: true });
export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertCustomerKycSchema = createInsertSchema(customerKyc).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBonusTypeSchema = createInsertSchema(bonusTypes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({ id: true, createdAt: true });
export const insertFileTemplateSchema = createInsertSchema(fileTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebhookDeliverySchema = createInsertSchema(webhookDeliveries).omit({ id: true, createdAt: true });
export const insertCustomerApiKeySchema = createInsertSchema(customerApiKeys).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRateCardSchema = createInsertSchema(rateCards).omit({ id: true, shortId: true, createdAt: true, updatedAt: true });
export const insertRateCardRateSchema = createInsertSchema(rateCardRates).omit({ id: true, createdAt: true });

export const insertInterconnectIpAddressSchema = createInsertSchema(interconnectIpAddresses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterconnectValidationSettingsSchema = createInsertSchema(interconnectValidationSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterconnectTranslationSettingsSchema = createInsertSchema(interconnectTranslationSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterconnectCodecSchema = createInsertSchema(interconnectCodecs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterconnectMediaSettingsSchema = createInsertSchema(interconnectMediaSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterconnectSignallingSettingsSchema = createInsertSchema(interconnectSignallingSettings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterconnectMonitoringSettingsSchema = createInsertSchema(interconnectMonitoringSettings).omit({ id: true, createdAt: true, updatedAt: true });

// ==================== TYPES ====================

export type InsertCustomerCategory = z.infer<typeof insertCustomerCategorySchema>;
export type CustomerCategory = typeof customerCategories.$inferSelect;
export type InsertCustomerGroup = z.infer<typeof insertCustomerGroupSchema>;
export type CustomerGroup = typeof customerGroups.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCarrier = z.infer<typeof insertCarrierSchema>;
export type Carrier = typeof carriers.$inferSelect;
export type InsertCarrierAssignment = z.infer<typeof insertCarrierAssignmentSchema>;
export type CarrierAssignment = typeof carrierAssignments.$inferSelect;
export type InsertCarrierInterconnect = z.infer<typeof insertCarrierInterconnectSchema>;
export type CarrierInterconnect = typeof carrierInterconnects.$inferSelect;
export type InsertCarrierService = z.infer<typeof insertCarrierServiceSchema>;
export type CarrierService = typeof carrierServices.$inferSelect;
export type InsertServiceMatchList = z.infer<typeof insertServiceMatchListSchema>;
export type ServiceMatchList = typeof serviceMatchLists.$inferSelect;
export type InsertCarrierContact = z.infer<typeof insertCarrierContactSchema>;
export type CarrierContact = typeof carrierContacts.$inferSelect;
export type InsertCarrierCreditAlert = z.infer<typeof insertCarrierCreditAlertSchema>;
export type CarrierCreditAlert = typeof carrierCreditAlerts.$inferSelect;
export type InsertInterconnectIpAddress = z.infer<typeof insertInterconnectIpAddressSchema>;
export type InterconnectIpAddress = typeof interconnectIpAddresses.$inferSelect;
export type InsertInterconnectValidationSettings = z.infer<typeof insertInterconnectValidationSettingsSchema>;
export type InterconnectValidationSettings = typeof interconnectValidationSettings.$inferSelect;
export type InsertInterconnectTranslationSettings = z.infer<typeof insertInterconnectTranslationSettingsSchema>;
export type InterconnectTranslationSettings = typeof interconnectTranslationSettings.$inferSelect;
export type InsertInterconnectCodec = z.infer<typeof insertInterconnectCodecSchema>;
export type InterconnectCodec = typeof interconnectCodecs.$inferSelect;
export type InsertInterconnectMediaSettings = z.infer<typeof insertInterconnectMediaSettingsSchema>;
export type InterconnectMediaSettings = typeof interconnectMediaSettings.$inferSelect;
export type InsertInterconnectSignallingSettings = z.infer<typeof insertInterconnectSignallingSettingsSchema>;
export type InterconnectSignallingSettings = typeof interconnectSignallingSettings.$inferSelect;
export type InsertInterconnectMonitoringSettings = z.infer<typeof insertInterconnectMonitoringSettingsSchema>;
export type InterconnectMonitoringSettings = typeof interconnectMonitoringSettings.$inferSelect;
export type InsertPop = z.infer<typeof insertPopSchema>;
export type Pop = typeof pops.$inferSelect;
export type InsertVoiceTier = z.infer<typeof insertVoiceTierSchema>;
export type VoiceTier = typeof voiceTiers.$inferSelect;
export type InsertCodec = z.infer<typeof insertCodecSchema>;
export type Codec = typeof codecs.$inferSelect;
export type InsertChannelPlan = z.infer<typeof insertChannelPlanSchema>;
export type ChannelPlan = typeof channelPlans.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRouteGroup = z.infer<typeof insertRouteGroupSchema>;
export type RouteGroup = typeof routeGroups.$inferSelect;
export type InsertMonitoringRule = z.infer<typeof insertMonitoringRuleSchema>;
export type MonitoringRule = typeof monitoringRules.$inferSelect;
export type InsertDidCountry = z.infer<typeof insertDidCountrySchema>;
export type DidCountry = typeof didCountries.$inferSelect;
export type InsertDidProvider = z.infer<typeof insertDidProviderSchema>;
export type DidProvider = typeof didProviders.$inferSelect;
export type InsertDid = z.infer<typeof insertDidSchema>;
export type Did = typeof dids.$inferSelect;
export type InsertSipTrunk = z.infer<typeof insertSipTrunkSchema>;
export type SipTrunk = typeof sipTrunks.$inferSelect;
export type InsertExtension = z.infer<typeof insertExtensionSchema>;
export type Extension = typeof extensions.$inferSelect;
export type InsertIvr = z.infer<typeof insertIvrSchema>;
export type Ivr = typeof ivrs.$inferSelect;
export type InsertRingGroup = z.infer<typeof insertRingGroupSchema>;
export type RingGroup = typeof ringGroups.$inferSelect;
export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type Queue = typeof queues.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicketReply = z.infer<typeof insertTicketReplySchema>;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertBonusType = z.infer<typeof insertBonusTypeSchema>;
export type BonusType = typeof bonusTypes.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertFileTemplate = z.infer<typeof insertFileTemplateSchema>;
export type FileTemplate = typeof fileTemplates.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertCustomerKyc = z.infer<typeof insertCustomerKycSchema>;
export type CustomerKyc = typeof customerKyc.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ConfigVersion = typeof configVersions.$inferSelect;
export type Trash = typeof trash.$inferSelect;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type Cdr = typeof cdrs.$inferSelect;
export type Voicemail = typeof voicemails.$inferSelect;
export type CallRecording = typeof callRecordings.$inferSelect;
export type AiAgentAction = typeof aiAgentActions.$inferSelect;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;

// Rate Card types
export type InsertRateCard = z.infer<typeof insertRateCardSchema>;
export type RateCard = typeof rateCards.$inferSelect;
export type InsertRateCardRate = z.infer<typeof insertRateCardRateSchema>;
export type RateCardRate = typeof rateCardRates.$inferSelect;

// Currency types
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type Currency = typeof currencies.$inferSelect;
export type InsertFxRate = z.infer<typeof insertFxRateSchema>;
export type FxRate = typeof fxRates.$inferSelect;
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type CustomerCurrencySettings = typeof customerCurrencySettings.$inferSelect;
export type CurrencyReconciliation = typeof currencyReconciliations.$inferSelect;

// SIP Tester types
export type InsertSipTestConfig = z.infer<typeof insertSipTestConfigSchema>;
export type SipTestConfig = typeof sipTestConfigs.$inferSelect;
export type InsertSipTestSchedule = z.infer<typeof insertSipTestScheduleSchema>;
export type SipTestSchedule = typeof sipTestSchedules.$inferSelect;
export type InsertSipTestResult = z.infer<typeof insertSipTestResultSchema>;
export type SipTestResult = typeof sipTestResults.$inferSelect;
export type SipTestSyncPermission = typeof sipTestSyncPermissions.$inferSelect;
export type SipTestAlert = typeof sipTestAlerts.$inferSelect;
export type InsertSipTestAudioFile = z.infer<typeof insertSipTestAudioFileSchema>;
export type SipTestAudioFile = typeof sipTestAudioFiles.$inferSelect;
export type InsertSipTestNumber = z.infer<typeof insertSipTestNumberSchema>;
export type SipTestNumber = typeof sipTestNumbers.$inferSelect;
export type InsertSipTestRun = z.infer<typeof insertSipTestRunSchema>;
export type SipTestRun = typeof sipTestRuns.$inferSelect;
export type InsertSipTestRunResult = z.infer<typeof insertSipTestRunResultSchema>;
export type SipTestRunResult = typeof sipTestRunResults.$inferSelect;
export type InsertSipTestProfile = z.infer<typeof insertSipTestProfileSchema>;
export type SipTestProfile = typeof sipTestProfiles.$inferSelect;
export type InsertSipTestSupplier = z.infer<typeof insertSipTestSupplierSchema>;
export type SipTestSupplier = typeof sipTestSuppliers.$inferSelect;
export type InsertSipTestSettings = z.infer<typeof insertSipTestSettingsSchema>;
export type SipTestSettings = typeof sipTestSettings.$inferSelect;

// Class 4 Softswitch types
export type InsertClass4Customer = z.infer<typeof insertClass4CustomerSchema>;
export type Class4Customer = typeof class4Customers.$inferSelect;
export type InsertClass4Carrier = z.infer<typeof insertClass4CarrierSchema>;
export type Class4Carrier = typeof class4Carriers.$inferSelect;
export type InsertClass4ProviderRateCard = z.infer<typeof insertClass4ProviderRateCardSchema>;
export type Class4ProviderRateCard = typeof class4ProviderRateCards.$inferSelect;
export type Class4ProviderRate = typeof class4ProviderRates.$inferSelect;
export type InsertClass4CustomerRateCard = z.infer<typeof insertClass4CustomerRateCardSchema>;
export type Class4CustomerRateCard = typeof class4CustomerRateCards.$inferSelect;
export type Class4CustomerRate = typeof class4CustomerRates.$inferSelect;
export type Class4LcrRule = typeof class4LcrRules.$inferSelect;
export type Class4RoutingRule = typeof class4RoutingRules.$inferSelect;
export type Class4Cdr = typeof class4Cdrs.$inferSelect;

// AI Voice Agent types
export type InsertAiVoiceAgent = z.infer<typeof insertAiVoiceAgentSchema>;
export type AiVoiceAgent = typeof aiVoiceAgents.$inferSelect;
export type InsertAiVoiceFlow = z.infer<typeof insertAiVoiceFlowSchema>;
export type AiVoiceFlow = typeof aiVoiceFlows.$inferSelect;
export type InsertAiVoiceTrainingData = z.infer<typeof insertAiVoiceTrainingDataSchema>;
export type AiVoiceTrainingData = typeof aiVoiceTrainingData.$inferSelect;
export type InsertAiVoiceCampaign = z.infer<typeof insertAiVoiceCampaignSchema>;
export type InsertAiVoiceCallLog = z.infer<typeof insertAiVoiceCallLogSchema>;
export type AiVoiceCampaign = typeof aiVoiceCampaigns.$inferSelect;
export type AiVoiceCallLog = typeof aiVoiceCallLogs.$inferSelect;
export type InsertAiVoiceRateConfig = z.infer<typeof insertAiVoiceRateConfigSchema>;
export type AiVoiceRateConfig = typeof aiVoiceRateConfigs.$inferSelect;
export type InsertAiVoicePricingTier = z.infer<typeof insertAiVoicePricingTierSchema>;
export type AiVoicePricingTier = typeof aiVoicePricingTiers.$inferSelect;
export type InsertAiVoiceKnowledgeBase = z.infer<typeof insertAiVoiceKnowledgeBaseSchema>;
export type AiVoiceKnowledgeBase = typeof aiVoiceKnowledgeBases.$inferSelect;
export type InsertAiVoiceKbSource = z.infer<typeof insertAiVoiceKbSourceSchema>;
export type AiVoiceKbSource = typeof aiVoiceKbSources.$inferSelect;
export type InsertAiVoicePhonebook = z.infer<typeof insertAiVoicePhonebookSchema>;
export type AiVoicePhonebook = typeof aiVoicePhonebooks.$inferSelect;
export type InsertAiVoiceContact = z.infer<typeof insertAiVoiceContactSchema>;
export type AiVoiceContact = typeof aiVoiceContacts.$inferSelect;
export type InsertAiVoiceTemplate = z.infer<typeof insertAiVoiceTemplateSchema>;
export type AiVoiceTemplate = typeof aiVoiceTemplates.$inferSelect;
export type InsertAiVoiceUsage = z.infer<typeof insertAiVoiceUsageSchema>;
export type AiVoiceUsage = typeof aiVoiceUsage.$inferSelect;
export type InsertAiVoiceAssignment = z.infer<typeof insertAiVoiceAssignmentSchema>;
export type AiVoiceAssignment = typeof aiVoiceAssignments.$inferSelect;
export type InsertAiVoiceSetting = z.infer<typeof insertAiVoiceSettingSchema>;
export type AiVoiceSetting = typeof aiVoiceSettings.$inferSelect;
export type InsertAiVoiceWebhook = z.infer<typeof insertAiVoiceWebhookSchema>;
export type AiVoiceWebhook = typeof aiVoiceWebhooks.$inferSelect;

// CRM Integration types
export type InsertCrmConnection = z.infer<typeof insertCrmConnectionSchema>;
export type CrmConnection = typeof crmConnections.$inferSelect;
export type InsertCrmFieldMapping = z.infer<typeof insertCrmFieldMappingSchema>;
export type CrmFieldMapping = typeof crmFieldMappings.$inferSelect;
export type InsertCrmSyncSettings = z.infer<typeof insertCrmSyncSettingsSchema>;
export type CrmSyncSettings = typeof crmSyncSettings.$inferSelect;
export type InsertCrmSyncLog = z.infer<typeof insertCrmSyncLogSchema>;
export type CrmSyncLog = typeof crmSyncLogs.$inferSelect;
export type InsertCrmContactMapping = z.infer<typeof insertCrmContactMappingSchema>;
export type CrmContactMapping = typeof crmContactMappings.$inferSelect;

// CMS & White-label types
export type InsertCmsPortal = z.infer<typeof insertCmsPortalSchema>;
export type CmsPortal = typeof cmsPortals.$inferSelect;
export type InsertCmsTheme = z.infer<typeof insertCmsThemeSchema>;
export type CmsTheme = typeof cmsThemes.$inferSelect;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type InsertCmsMediaItem = z.infer<typeof insertCmsMediaItemSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;
export type CmsMenu = typeof cmsMenus.$inferSelect;
export type CmsMediaItem = typeof cmsMediaLibrary.$inferSelect;
export type InsertTenantBranding = z.infer<typeof insertTenantBrandingSchema>;
export type TenantBranding = typeof tenantBranding.$inferSelect;
export type InsertPortalLoginPage = z.infer<typeof insertPortalLoginPageSchema>;
export type PortalLoginPage = typeof portalLoginPages.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertWebsiteSection = z.infer<typeof insertWebsiteSectionSchema>;
export type WebsiteSection = typeof websiteSections.$inferSelect;

// Integration types
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

// Experience Manager types
export type InsertEmContentItem = z.infer<typeof insertEmContentItemSchema>;
export type EmContentItem = typeof emContentItems.$inferSelect;
export type InsertEmContentVersion = z.infer<typeof insertEmContentVersionSchema>;
export type EmContentVersion = typeof emContentVersions.$inferSelect;
export type InsertEmValidationResult = z.infer<typeof insertEmValidationResultSchema>;
export type EmValidationResult = typeof emValidationResults.$inferSelect;
export type InsertEmPublishHistory = z.infer<typeof insertEmPublishHistorySchema>;
export type EmPublishHistory = typeof emPublishHistory.$inferSelect;

// Documentation types
export type InsertDocCategory = z.infer<typeof insertDocCategorySchema>;
export type DocCategory = typeof docCategories.$inferSelect;
export type InsertDocArticle = z.infer<typeof insertDocArticleSchema>;
export type DocArticle = typeof docArticles.$inferSelect;

// Webhook and API Key types
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhookDelivery = z.infer<typeof insertWebhookDeliverySchema>;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertCustomerApiKey = z.infer<typeof insertCustomerApiKeySchema>;
export type CustomerApiKey = typeof customerApiKeys.$inferSelect;

// Dev Tests types
export type InsertDevTest = z.infer<typeof insertDevTestSchema>;
export type DevTest = typeof devTests.$inferSelect;

// E2E Testing Engine types
export type InsertE2eRun = z.infer<typeof insertE2eRunSchema>;
export type E2eRun = typeof e2eRuns.$inferSelect;
export type InsertE2eResult = z.infer<typeof insertE2eResultSchema>;
export type E2eResult = typeof e2eResults.$inferSelect;

// Auth models (for Replit Auth sessions)
export * from "./models/auth";

// ==================== CONNEXCS SYNC TABLES ====================

export const connexcsSyncStatusEnum = pgEnum("connexcs_sync_status", [
  "pending",
  "syncing",
  "completed",
  "failed",
  "partial",
]);

export const connexcsEntityTypeEnum = pgEnum("connexcs_entity_type", [
  "customer",
  "carrier",
  "ratecard",
  "cdr",
  "balance",
  "route",
  "script",
]);

export const connexcsSyncJobs = pgTable("connexcs_sync_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: connexcsEntityTypeEnum("entity_type").notNull(),
  status: connexcsSyncStatusEnum("status").default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  totalRecords: integer("total_records").default(0),
  importedRecords: integer("imported_records").default(0),
  updatedRecords: integer("updated_records").default(0),
  failedRecords: integer("failed_records").default(0),
  errors: jsonb("errors"),
  params: jsonb("params"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connexcsEntityMap = pgTable("connexcs_entity_map", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: connexcsEntityTypeEnum("entity_type").notNull(),
  connexcsId: text("connexcs_id").notNull(),
  didtronId: varchar("didtron_id").notNull(),
  connexcsData: jsonb("connexcs_data"),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connexcsImportCustomers = pgTable("connexcs_import_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  connexcsId: integer("connexcs_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  status: text("status"),
  balance: decimal("balance", { precision: 14, scale: 4 }),
  creditLimit: decimal("credit_limit", { precision: 14, scale: 4 }),
  currency: text("currency"),
  billingType: text("billing_type"),
  rateCardId: integer("rate_card_id"),
  rateCardName: text("rate_card_name"),
  channels: integer("channels"),
  cps: integer("cps"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  phone: text("phone"),
  rawData: jsonb("raw_data"),
  mappedToId: varchar("mapped_to_id").references(() => customers.id),
  importStatus: text("import_status").default("pending"),
  importError: text("import_error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connexcsImportCarriers = pgTable("connexcs_import_carriers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  connexcsId: integer("connexcs_id").notNull(),
  name: text("name").notNull(),
  status: text("status"),
  channels: integer("channels"),
  cps: integer("cps"),
  host: text("host"),
  port: integer("port"),
  ip: text("ip"),
  protocol: text("protocol"),
  currency: text("currency"),
  rateCardId: integer("rate_card_id"),
  rateCardName: text("rate_card_name"),
  billingType: text("billing_type"),
  balance: decimal("balance", { precision: 14, scale: 4 }),
  creditLimit: decimal("credit_limit", { precision: 14, scale: 4 }),
  rawData: jsonb("raw_data"),
  mappedToId: varchar("mapped_to_id").references(() => carriers.id),
  importStatus: text("import_status").default("pending"),
  importError: text("import_error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connexcsImportRateCards = pgTable("connexcs_import_rate_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  connexcsId: text("connexcs_id").notNull(), // ConnexCS rate cards have string IDs like "6IAK-MhWJ"
  name: text("name").notNull(),
  direction: text("direction"),
  currency: text("currency"),
  status: text("status"),
  rateCount: integer("rate_count").default(0),
  rawData: jsonb("raw_data"),
  mappedToId: varchar("mapped_to_id").references(() => rateCards.id),
  importStatus: text("import_status").default("pending"),
  importError: text("import_error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connexcsImportCdrs = pgTable("connexcs_import_cdrs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  connexcsId: text("connexcs_id").notNull(),
  callId: text("call_id"),
  src: text("src"),
  dst: text("dst"),
  duration: integer("duration"),
  billsec: integer("billsec"),
  callTime: timestamp("call_time"),
  cost: decimal("cost", { precision: 12, scale: 6 }),
  rate: decimal("rate", { precision: 10, scale: 6 }),
  buyRate: decimal("buy_rate", { precision: 10, scale: 6 }),
  buyAmount: decimal("buy_amount", { precision: 12, scale: 6 }),
  sellRate: decimal("sell_rate", { precision: 10, scale: 6 }),
  sellAmount: decimal("sell_amount", { precision: 12, scale: 6 }),
  status: text("status"),
  hangupCause: text("hangup_cause"),
  direction: text("direction"),
  customerId: integer("customer_id"),
  customerName: text("customer_name"),
  carrierId: integer("carrier_id"),
  carrierName: text("carrier_name"),
  prefix: text("prefix"),
  destination: text("destination"),
  currency: text("currency"),
  year: integer("year"),
  month: integer("month"),
  rawData: jsonb("raw_data"),
  mappedToId: varchar("mapped_to_id").references(() => cdrs.id),
  importStatus: text("import_status").default("pending"),
  importError: text("import_error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connexcsSyncLogs = pgTable("connexcs_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  level: text("level").default("info"),
  message: text("message").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ConnexCS Routes table
export const connexcsImportRoutes = pgTable("connexcs_import_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  connexcsId: integer("connexcs_id").notNull(),
  name: text("name").notNull(),
  customerId: integer("customer_id"),
  customerName: text("customer_name"),
  prefix: text("prefix"),
  techPrefix: text("tech_prefix"),
  routingType: text("routing_type"),
  status: text("status"),
  priority: integer("priority"),
  weight: integer("weight"),
  rateCardId: text("rate_card_id"),
  carrierId: integer("carrier_id"),
  carrierName: text("carrier_name"),
  channels: integer("channels"),
  cps: integer("cps"),
  rawData: jsonb("raw_data"),
  importStatus: text("import_status").default("imported"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ConnexCS Balance Snapshots table
export const connexcsImportBalances = pgTable("connexcs_import_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  connexcsCustomerId: integer("connexcs_customer_id").notNull(),
  customerName: text("customer_name"),
  balance: decimal("balance", { precision: 14, scale: 4 }),
  creditLimit: decimal("credit_limit", { precision: 14, scale: 4 }),
  availableCredit: decimal("available_credit", { precision: 14, scale: 4 }),
  currency: text("currency"),
  billingType: text("billing_type"),
  lastUpdated: timestamp("last_updated"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ConnexCS ScriptForge Scripts table
export const connexcsImportScripts = pgTable("connexcs_import_scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").references(() => connexcsSyncJobs.id),
  connexcsId: text("connexcs_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  scriptType: text("script_type"),
  language: text("language"),
  code: text("code"),
  enabled: boolean("enabled").default(true),
  version: integer("version"),
  lastModified: timestamp("last_modified"),
  rawData: jsonb("raw_data"),
  importStatus: text("import_status").default("imported"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ConnexCS CDR Sync State - tracks high-water mark for incremental sync
export const connexcsCdrSyncState = pgTable("connexcs_cdr_sync_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncType: text("sync_type").notNull().default("incremental"), // 'incremental', 'full', 'historical'
  lastSyncedTimestamp: timestamp("last_synced_timestamp"), // High-water mark - last CDR timestamp synced
  lastSyncedCallId: text("last_synced_call_id"), // Last CDR call ID synced (for deduplication)
  currentOffset: integer("current_offset").default(0), // Current offset for resumable sync
  batchSize: integer("batch_size").default(500), // Records per batch
  totalSynced: integer("total_synced").default(0), // Total CDRs synced in current run
  status: text("status").default("idle"), // 'idle', 'running', 'paused', 'completed', 'failed'
  lastError: text("last_error"),
  lastRunStartedAt: timestamp("last_run_started_at"),
  lastRunCompletedAt: timestamp("last_run_completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ConnexCS CDR Statistics cache table
export const connexcsCdrStats = pgTable("connexcs_cdr_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodType: text("period_type").notNull(), // 'daily', 'monthly', 'yearly'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalCalls: integer("total_calls").default(0),
  answeredCalls: integer("answered_calls").default(0),
  failedCalls: integer("failed_calls").default(0),
  totalDuration: integer("total_duration").default(0), // in seconds
  totalMinutes: decimal("total_minutes", { precision: 14, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 14, scale: 4 }),
  totalRevenue: decimal("total_revenue", { precision: 14, scale: 4 }),
  asr: decimal("asr", { precision: 6, scale: 2 }), // Answer Seizure Ratio
  acd: decimal("acd", { precision: 8, scale: 2 }), // Average Call Duration
  pdd: decimal("pdd", { precision: 8, scale: 2 }), // Post Dial Delay
  ner: decimal("ner", { precision: 6, scale: 2 }), // Network Effectiveness Ratio
  topDestinations: jsonb("top_destinations"),
  topCustomers: jsonb("top_customers"),
  topCarriers: jsonb("top_carriers"),
  hourlyDistribution: jsonb("hourly_distribution"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for ConnexCS sync
export const insertConnexcsSyncJobSchema = createInsertSchema(connexcsSyncJobs).omit({ id: true, createdAt: true });
export const insertConnexcsEntityMapSchema = createInsertSchema(connexcsEntityMap).omit({ id: true, createdAt: true });
export const insertConnexcsImportCustomerSchema = createInsertSchema(connexcsImportCustomers).omit({ id: true, createdAt: true });
export const insertConnexcsImportCarrierSchema = createInsertSchema(connexcsImportCarriers).omit({ id: true, createdAt: true });
export const insertConnexcsImportRateCardSchema = createInsertSchema(connexcsImportRateCards).omit({ id: true, createdAt: true });
export const insertConnexcsImportCdrSchema = createInsertSchema(connexcsImportCdrs).omit({ id: true, createdAt: true });
export const insertConnexcsSyncLogSchema = createInsertSchema(connexcsSyncLogs).omit({ id: true, createdAt: true });
export const insertConnexcsImportRouteSchema = createInsertSchema(connexcsImportRoutes).omit({ id: true, createdAt: true });
export const insertConnexcsImportBalanceSchema = createInsertSchema(connexcsImportBalances).omit({ id: true, createdAt: true });
export const insertConnexcsImportScriptSchema = createInsertSchema(connexcsImportScripts).omit({ id: true, createdAt: true });
export const insertConnexcsCdrStatsSchema = createInsertSchema(connexcsCdrStats).omit({ id: true, createdAt: true });
export const insertConnexcsCdrSyncStateSchema = createInsertSchema(connexcsCdrSyncState).omit({ id: true, createdAt: true });

// ConnexCS sync types
export type InsertConnexcsSyncJob = z.infer<typeof insertConnexcsSyncJobSchema>;
export type ConnexcsSyncJob = typeof connexcsSyncJobs.$inferSelect;
export type InsertConnexcsEntityMap = z.infer<typeof insertConnexcsEntityMapSchema>;
export type ConnexcsEntityMap = typeof connexcsEntityMap.$inferSelect;
export type InsertConnexcsImportCustomer = z.infer<typeof insertConnexcsImportCustomerSchema>;
export type ConnexcsImportCustomer = typeof connexcsImportCustomers.$inferSelect;
export type InsertConnexcsImportCarrier = z.infer<typeof insertConnexcsImportCarrierSchema>;
export type ConnexcsImportCarrier = typeof connexcsImportCarriers.$inferSelect;
export type InsertConnexcsImportRateCard = z.infer<typeof insertConnexcsImportRateCardSchema>;
export type ConnexcsImportRateCard = typeof connexcsImportRateCards.$inferSelect;
export type InsertConnexcsImportCdr = z.infer<typeof insertConnexcsImportCdrSchema>;
export type ConnexcsImportCdr = typeof connexcsImportCdrs.$inferSelect;
export type InsertConnexcsSyncLog = z.infer<typeof insertConnexcsSyncLogSchema>;
export type ConnexcsSyncLog = typeof connexcsSyncLogs.$inferSelect;
export type InsertConnexcsImportRoute = z.infer<typeof insertConnexcsImportRouteSchema>;
export type ConnexcsImportRoute = typeof connexcsImportRoutes.$inferSelect;
export type InsertConnexcsImportBalance = z.infer<typeof insertConnexcsImportBalanceSchema>;
export type ConnexcsImportBalance = typeof connexcsImportBalances.$inferSelect;
export type InsertConnexcsImportScript = z.infer<typeof insertConnexcsImportScriptSchema>;
export type ConnexcsImportScript = typeof connexcsImportScripts.$inferSelect;
export type InsertConnexcsCdrStats = z.infer<typeof insertConnexcsCdrStatsSchema>;
export type ConnexcsCdrStats = typeof connexcsCdrStats.$inferSelect;
export type InsertConnexcsCdrSyncState = z.infer<typeof insertConnexcsCdrSyncStateSchema>;
export type ConnexcsCdrSyncState = typeof connexcsCdrSyncState.$inferSelect;

// ==================== SYSTEM MONITORING ENUMS ====================

export const systemAlertSeverityEnum = pgEnum("system_alert_severity", ["critical", "warning", "info"]);
export const systemAlertStatusEnum = pgEnum("system_alert_status", ["active", "resolved", "acknowledged", "snoozed"]);
export const healthStatusEnum = pgEnum("health_status", ["healthy", "degraded", "down"]);
export const metricsSnapshotTypeEnum = pgEnum("metrics_snapshot_type", ["api", "database", "redis", "r2", "job_queue", "integration", "portal", "storage"]);
export const auditEventTypeEnum = pgEnum("audit_event_type", ["deployment", "migration", "config_change", "admin_action"]);
export const portalTypeEnum = pgEnum("portal_type", ["super_admin", "customer", "marketing"]);

// ==================== SYSTEM MONITORING TABLES ====================

// Metrics Snapshots - stores periodic system metrics collected by DataQueue job every 60s
export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  snapshotType: metricsSnapshotTypeEnum("snapshot_type").notNull(),
  metrics: jsonb("metrics").notNull(), // Type-specific metrics payload
  collectedAt: timestamp("collected_at").notNull(), // UTC timestamp when metrics were collected
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_metrics_snapshots_type_collected").on(table.snapshotType, table.collectedAt),
  index("idx_metrics_snapshots_collected").on(table.collectedAt),
]);

// System Alerts - active and resolved performance/health alerts
export const systemAlerts = pgTable("system_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  severity: systemAlertSeverityEnum("severity").notNull(),
  source: text("source").notNull(), // api | database | redis | job | integration | portal
  title: text("title").notNull(),
  description: text("description"),
  metricName: text("metric_name"),
  actualValue: decimal("actual_value", { precision: 14, scale: 4 }),
  threshold: decimal("threshold", { precision: 14, scale: 4 }),
  breachDuration: integer("breach_duration"), // seconds
  firstSeenAt: timestamp("first_seen_at").notNull(),
  lastSeenAt: timestamp("last_seen_at").notNull(),
  status: systemAlertStatusEnum("status").notNull().default("active"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  snoozeUntil: timestamp("snooze_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_system_alerts_status").on(table.status),
  index("idx_system_alerts_severity_status").on(table.severity, table.status),
  index("idx_system_alerts_source").on(table.source),
  index("idx_system_alerts_first_seen").on(table.firstSeenAt),
]);

// Integration Health - health status for each external integration
export const integrationHealth = pgTable("integration_health", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationName: text("integration_name").notNull().unique(), // connexcs, brevo, nowpayments, ayrshare, openexchangerates, openai
  status: healthStatusEnum("status").notNull().default("healthy"),
  latencyP95: integer("latency_p95"), // ms
  errorRate: decimal("error_rate", { precision: 6, scale: 4 }), // percentage as decimal
  lastSuccessAt: timestamp("last_success_at"),
  lastFailureAt: timestamp("last_failure_at"),
  lastFailureReason: text("last_failure_reason"),
  checkedAt: timestamp("checked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Metrics - DataQueue job performance metrics
export const jobMetrics = pgTable("job_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobType: text("job_type").notNull(),
  queuedCount: integer("queued_count").default(0),
  runningCount: integer("running_count").default(0),
  failedCount15m: integer("failed_count_15m").default(0),
  failedCount24h: integer("failed_count_24h").default(0),
  oldestJobAge: integer("oldest_job_age"), // seconds
  stuckJobCount: integer("stuck_job_count").default(0),
  averageDuration: integer("average_duration"), // ms
  collectedAt: timestamp("collected_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_job_metrics_type_collected").on(table.jobType, table.collectedAt),
  index("idx_job_metrics_collected").on(table.collectedAt),
]);

// Portal Metrics - portal-specific health and performance metrics
export const portalMetrics = pgTable("portal_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  portalType: portalTypeEnum("portal_type").notNull(),
  routeTransitionP95: integer("route_transition_p95"), // ms
  routeTransitionP99: integer("route_transition_p99"), // ms
  jsErrorCount: integer("js_error_count").default(0),
  assetLoadFailures: integer("asset_load_failures").default(0),
  lastPageLoadSample: timestamp("last_page_load_sample"),
  healthStatus: healthStatusEnum("health_status").notNull().default("healthy"),
  collectedAt: timestamp("collected_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_portal_metrics_type_collected").on(table.portalType, table.collectedAt),
  index("idx_portal_metrics_collected").on(table.collectedAt),
]);

// Audit Records - system changes for correlation with performance issues
export const auditRecords = pgTable("audit_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: auditEventTypeEnum("event_type").notNull(),
  actorId: varchar("actor_id").references(() => users.id),
  actorEmail: text("actor_email"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  occurredAt: timestamp("occurred_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_audit_records_type").on(table.eventType),
  index("idx_audit_records_occurred").on(table.occurredAt),
  index("idx_audit_records_actor").on(table.actorId),
]);

// Module Registry - registry of all modules for auto-monitoring
export const moduleRegistry = pgTable("module_registry", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleKey: text("module_key").notNull().unique(),
  displayName: text("display_name").notNull(),
  routesPrefix: text("routes_prefix"),
  apiPrefix: text("api_prefix"),
  criticalEndpoints: jsonb("critical_endpoints"), // array of endpoint patterns
  jobTypes: jsonb("job_types"), // array of job type names
  integrationsUsed: jsonb("integrations_used"), // array of integration names
  portalVisibility: jsonb("portal_visibility"), // array: ["admin", "customer", "marketing"]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== SYSTEM MONITORING ZOD SCHEMAS ====================

export const insertMetricsSnapshotSchema = createInsertSchema(metricsSnapshots).omit({ id: true, createdAt: true });
export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationHealthSchema = createInsertSchema(integrationHealth).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobMetricsSchema = createInsertSchema(jobMetrics).omit({ id: true, createdAt: true });
export const insertPortalMetricsSchema = createInsertSchema(portalMetrics).omit({ id: true, createdAt: true });
export const insertAuditRecordSchema = createInsertSchema(auditRecords).omit({ id: true, createdAt: true });
export const insertModuleRegistrySchema = createInsertSchema(moduleRegistry).omit({ id: true, createdAt: true, updatedAt: true });

// ==================== SYSTEM MONITORING TYPES ====================

export type InsertMetricsSnapshot = z.infer<typeof insertMetricsSnapshotSchema>;
export type MetricsSnapshot = typeof metricsSnapshots.$inferSelect;
export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertIntegrationHealth = z.infer<typeof insertIntegrationHealthSchema>;
export type IntegrationHealth = typeof integrationHealth.$inferSelect;
export type InsertJobMetrics = z.infer<typeof insertJobMetricsSchema>;
export type JobMetrics = typeof jobMetrics.$inferSelect;
export type InsertPortalMetrics = z.infer<typeof insertPortalMetricsSchema>;
export type PortalMetrics = typeof portalMetrics.$inferSelect;
export type InsertAuditRecord = z.infer<typeof insertAuditRecordSchema>;
export type AuditRecord = typeof auditRecords.$inferSelect;
export type InsertModuleRegistry = z.infer<typeof insertModuleRegistrySchema>;
export type ModuleRegistry = typeof moduleRegistry.$inferSelect;
