import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
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
});

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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// ==================== CARRIERS / PROVIDERS ====================

export const carriers = pgTable("carriers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  type: text("type").default("wholesale"),
  description: text("description"),
  status: routeStatusEnum("status").default("active"),
  sipHost: text("sip_host"),
  sipPort: integer("sip_port").default(5060),
  sipUsername: text("sip_username"),
  sipPassword: text("sip_password"),
  techPrefix: text("tech_prefix"),
  connexcsCarrierId: text("connexcs_carrier_id"),
  billingEmail: text("billing_email"),
  technicalEmail: text("technical_email"),
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
  name: text("name").notNull(),
  carrierId: varchar("carrier_id").references(() => carriers.id),
  effectiveDate: timestamp("effective_date"),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
});

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
});

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
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  tableName: text("table_name"),
  recordId: text("record_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// ==================== CURRENCIES & FX RATES ====================

export const currencies = pgTable("currencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  decimals: integer("decimals").default(2),
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
  contactList: jsonb("contact_list"),
  scheduledAt: timestamp("scheduled_at"),
  maxConcurrentCalls: integer("max_concurrent_calls").default(5),
  callsCompleted: integer("calls_completed").default(0),
  callsTotal: integer("calls_total").default(0),
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
export const insertClass4CustomerSchema = createInsertSchema(class4Customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClass4CarrierSchema = createInsertSchema(class4Carriers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClass4ProviderRateCardSchema = createInsertSchema(class4ProviderRateCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClass4CustomerRateCardSchema = createInsertSchema(class4CustomerRateCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceAgentSchema = createInsertSchema(aiVoiceAgents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiVoiceCampaignSchema = createInsertSchema(aiVoiceCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsPortalSchema = createInsertSchema(cmsPortals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsThemeSchema = createInsertSchema(cmsThemes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTenantBrandingSchema = createInsertSchema(tenantBranding).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCustomerCategorySchema = createInsertSchema(customerCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerGroupSchema = createInsertSchema(customerGroups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true }).partial({
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
});
export const insertCarrierSchema = createInsertSchema(carriers).omit({ id: true, createdAt: true, updatedAt: true });
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
export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });

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
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type CustomerKyc = typeof customerKyc.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ConfigVersion = typeof configVersions.$inferSelect;
export type Cdr = typeof cdrs.$inferSelect;
export type Voicemail = typeof voicemails.$inferSelect;
export type CallRecording = typeof callRecordings.$inferSelect;
export type AiAgentAction = typeof aiAgentActions.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;

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
export type AiVoiceFlow = typeof aiVoiceFlows.$inferSelect;
export type AiVoiceTrainingData = typeof aiVoiceTrainingData.$inferSelect;
export type InsertAiVoiceCampaign = z.infer<typeof insertAiVoiceCampaignSchema>;
export type AiVoiceCampaign = typeof aiVoiceCampaigns.$inferSelect;
export type AiVoiceCallLog = typeof aiVoiceCallLogs.$inferSelect;

// CMS & White-label types
export type InsertCmsPortal = z.infer<typeof insertCmsPortalSchema>;
export type CmsPortal = typeof cmsPortals.$inferSelect;
export type InsertCmsTheme = z.infer<typeof insertCmsThemeSchema>;
export type CmsTheme = typeof cmsThemes.$inferSelect;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;
export type CmsMenu = typeof cmsMenus.$inferSelect;
export type CmsMediaItem = typeof cmsMediaLibrary.$inferSelect;
export type InsertTenantBranding = z.infer<typeof insertTenantBrandingSchema>;
export type TenantBranding = typeof tenantBranding.$inferSelect;

// Integration types
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

// Email System types
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;

// Bonus types
export type BonusType = typeof bonusTypes.$inferSelect;
