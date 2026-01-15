import { 
  type User, type InsertUser,
  type CustomerCategory, type InsertCustomerCategory,
  type CustomerGroup, type InsertCustomerGroup,
  type Customer, type InsertCustomer,
  type CustomerKyc, type InsertCustomerKyc,
  type Pop, type InsertPop,
  type VoiceTier, type InsertVoiceTier,
  type Codec, type InsertCodec,
  type ChannelPlan, type InsertChannelPlan,
  type Carrier, type InsertCarrier,
  type CarrierAssignment, type InsertCarrierAssignment,
  type CustomerRatingPlan, type InsertCustomerRatingPlan,
  customerRatingPlans as customerRatingPlansTable,
  type CustomerRatingPlanRate, type InsertCustomerRatingPlanRate,
  customerRatingPlanRates as customerRatingPlanRatesTable,
  type SupplierRatingPlan, type InsertSupplierRatingPlan,
  supplierRatingPlans as supplierRatingPlansTable,
  type SupplierRatingPlanRate, type InsertSupplierRatingPlanRate,
  supplierRatingPlanRates as supplierRatingPlanRatesTable,
  type AuditLog,
  auditLogs as auditLogsTable,
  type Route, type InsertRoute,
  type RouteGroup, type InsertRouteGroup,
  type MonitoringRule, type InsertMonitoringRule,
  type Alert, type InsertAlert,
  type DidCountry, type InsertDidCountry,
  type DidProvider, type InsertDidProvider,
  type Did, type InsertDid,
  type SipTrunk, type InsertSipTrunk,
  type Extension, type InsertExtension,
  type Ivr, type InsertIvr,
  type RingGroup, type InsertRingGroup,
  type Queue, type InsertQueue,
  type Ticket, type InsertTicket, type TicketReply, type InsertTicketReply,
  type Currency, type InsertCurrency,
  type FxRate, type InsertFxRate,
  type LedgerEntry, type InsertLedgerEntry,
  type SipTestConfig, type InsertSipTestConfig,
  type SipTestResult, type InsertSipTestResult,
  type SipTestSchedule, type InsertSipTestSchedule,
  type SipTestAudioFile, type InsertSipTestAudioFile,
  type SipTestNumber, type InsertSipTestNumber,
  type SipTestRun, type InsertSipTestRun,
  type SipTestRunResult, type InsertSipTestRunResult,
  type SipTestProfile, type InsertSipTestProfile,
  type SipTestSupplier, type InsertSipTestSupplier,
  type SipTestSettings, type InsertSipTestSettings,
  type Class4Customer, type InsertClass4Customer,
  type Class4Carrier, type InsertClass4Carrier,
  type Class4ProviderRateCard, type InsertClass4ProviderRateCard,
  type Class4CustomerRateCard, type InsertClass4CustomerRateCard,
  type AiVoiceAgent, type InsertAiVoiceAgent,
  type AiVoiceFlow, type InsertAiVoiceFlow,
  type AiVoiceTrainingData, type InsertAiVoiceTrainingData,
  type AiVoiceCampaign, type InsertAiVoiceCampaign,
  type AiVoiceKnowledgeBase, type InsertAiVoiceKnowledgeBase,
  type AiVoiceKbSource, type InsertAiVoiceKbSource,
  type AiVoicePhonebook, type InsertAiVoicePhonebook,
  type AiVoiceContact, type InsertAiVoiceContact,
  type AiVoiceCallLog, type InsertAiVoiceCallLog,
  type CrmConnection, type InsertCrmConnection,
  type CrmFieldMapping, type InsertCrmFieldMapping,
  type CrmSyncSettings, type InsertCrmSyncSettings,
  type CrmSyncLog, type InsertCrmSyncLog,
  type CrmContactMapping, type InsertCrmContactMapping,
  type CmsTheme, type InsertCmsTheme,
  type CmsPage, type InsertCmsPage,
  type CmsMediaItem, type InsertCmsMediaItem,
  type TenantBranding, type InsertTenantBranding,
  type PortalLoginPage, type InsertPortalLoginPage,
  type SiteSetting, type InsertSiteSetting,
  type WebsiteSection, type InsertWebsiteSection,
  type Integration, type InsertIntegration,
  type Invoice, type Payment, type PromoCode, type Referral,
  type InsertPayment, type InsertPromoCode,
  type BonusType, type EmailTemplate, type EmailLog, type FileTemplate,
  type InsertBonusType, type InsertEmailTemplate, type InsertEmailLog, type InsertFileTemplate,
  type SocialAccount, type InsertSocialAccount,
  type SocialPost, type InsertSocialPost,
  type RateCard, type InsertRateCard,
  type RateCardRate, type InsertRateCardRate,
  type DocCategory, type InsertDocCategory,
  type DocArticle, type InsertDocArticle,
  type Webhook, type InsertWebhook,
  type WebhookDelivery, type InsertWebhookDelivery,
  type CustomerApiKey, type InsertCustomerApiKey,
  type AzDestination, type InsertAzDestination,
  azDestinations,
  type BusinessRule, type InsertBusinessRule,
  businessRules as businessRulesTable,
  type EmContentItem, type InsertEmContentItem,
  type EmContentVersion, type InsertEmContentVersion,
  type EmValidationResult, type InsertEmValidationResult,
  type EmPublishHistory, type InsertEmPublishHistory,
  type DevTest, type InsertDevTest,
  type BillingTerm, type InsertBillingTerm,
  type CarrierInterconnect, type InsertCarrierInterconnect,
  type CarrierService, type InsertCarrierService,
  type ServiceMatchList, type InsertServiceMatchList,
  type CarrierContact, type InsertCarrierContact,
  type CarrierCreditAlert, type InsertCarrierCreditAlert,
  type InterconnectIpAddress, type InsertInterconnectIpAddress,
  type InterconnectValidationSettings, type InsertInterconnectValidationSettings,
  type InterconnectTranslationSettings, type InsertInterconnectTranslationSettings,
  type InterconnectCodec, type InsertInterconnectCodec,
  type InterconnectMediaSettings, type InsertInterconnectMediaSettings,
  type InterconnectSignallingSettings, type InsertInterconnectSignallingSettings,
  type InterconnectMonitoringSettings, type InsertInterconnectMonitoringSettings,
  interconnectIpAddresses as interconnectIpAddressesTable,
  interconnectValidationSettings as interconnectValidationSettingsTable,
  interconnectTranslationSettings as interconnectTranslationSettingsTable,
  interconnectCodecs as interconnectCodecsTable,
  interconnectMediaSettings as interconnectMediaSettingsTable,
  interconnectSignallingSettings as interconnectSignallingSettingsTable,
  interconnectMonitoringSettings as interconnectMonitoringSettingsTable,
  customers as customersTable,
  carriers as carriersTable,
  carrierInterconnects as carrierInterconnectsTable,
  carrierServices as carrierServicesTable,
  serviceMatchLists as serviceMatchListsTable,
  carrierContacts as carrierContactsTable,
  carrierCreditAlerts as carrierCreditAlertsTable,
  carrierAssignments as carrierAssignmentsTable,
  customerCategories as customerCategoriesTable,
  customerGroups as customerGroupsTable,
  users as usersTable,
  pops as popsTable,
  voiceTiers as voiceTiersTable,
  codecs as codecsTable,
  channelPlans as channelPlansTable,
  didCountries as didCountriesTable,
  didProviders as didProvidersTable,
  dids as didsTable,
  sipTrunks as sipTrunksTable,
  extensions as extensionsTable,
  ivrs as ivrsTable,
  ringGroups as ringGroupsTable,
  queues as queuesTable,
  billingTerms as billingTermsTable,
  invoices as invoicesTable,
  payments as paymentsTable,
  promoCodes as promoCodesTable,
  referrals as referralsTable,
  tickets as ticketsTable,
  ticketReplies as ticketRepliesTable,
  currencies as currenciesTable,
  fxRates as fxRatesTable,
  sipTestConfigs as sipTestConfigsTable,
  sipTestResults as sipTestResultsTable,
  sipTestSchedules as sipTestSchedulesTable,
  class4Customers as class4CustomersTable,
  class4Carriers as class4CarriersTable,
  class4ProviderRateCards as class4ProviderRateCardsTable,
  class4CustomerRateCards as class4CustomerRateCardsTable,
  rateCards as rateCardsTable,
  rateCardRates as rateCardRatesTable,
  routes as routesTable,
  routeGroups as routeGroupsTable,
  monitoringRules as monitoringRulesTable,
  alerts as alertsTable,
  fileTemplates,
  aiVoiceAgents as aiVoiceAgentsTable,
  aiVoiceFlows as aiVoiceFlowsTable,
  aiVoiceTrainingData as aiVoiceTrainingDataTable,
  aiVoiceCampaigns as aiVoiceCampaignsTable,
  aiVoiceKnowledgeBases as aiVoiceKnowledgeBasesTable,
  aiVoiceKbSources as aiVoiceKbSourcesTable,
  aiVoicePhonebooks as aiVoicePhonebooksTable,
  aiVoiceContacts as aiVoiceContactsTable,
  aiVoiceCallLogs as aiVoiceCallLogsTable,
  crmConnections as crmConnectionsTable,
  crmFieldMappings as crmFieldMappingsTable,
  crmSyncSettings as crmSyncSettingsTable,
  crmSyncLogs as crmSyncLogsTable,
  crmContactMappings as crmContactMappingsTable,
  cmsThemes as cmsThemesTable,
  cmsPages as cmsPagesTable,
  cmsMediaLibrary as cmsMediaItemsTable,
  tenantBranding as tenantBrandingsTable,
  portalLoginPages as portalLoginPagesTable,
  siteSettings as siteSettingsTable,
  websiteSections as websiteSectionsTable,
  docCategories as docCategoriesTable,
  docArticles as docArticlesTable,
  emContentItems as emContentItemsTable,
  emContentVersions as emContentVersionsTable,
  emValidationResults as emValidationResultsTable,
  emPublishHistory as emPublishHistoryTable,
  devTests as devTestsTable,
  customerKyc as customerKycTable,
  bonusTypes as bonusTypesTable,
  emailTemplates as emailTemplatesTable,
  emailLogs as emailLogsTable,
  socialAccounts as socialAccountsTable,
  socialPosts as socialPostsTable,
  webhooks as webhooksTable,
  webhookDeliveries as webhookDeliveriesTable,
  customerApiKeys as customerApiKeysTable,
  sipTestAudioFiles as sipTestAudioFilesTable,
  sipTestNumbers as sipTestNumbersTable,
  sipTestRuns as sipTestRunsTable,
  sipTestRunResults as sipTestRunResultsTable,
  sipTestProfiles as sipTestProfilesTable,
  sipTestSuppliers as sipTestSuppliersTable,
  sipTestSettings as sipTestSettingsTable
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, or, ne, ilike, gt, asc, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Billing Terms
  getBillingTerms(): Promise<BillingTerm[]>;
  getBillingTerm(id: string): Promise<BillingTerm | undefined>;
  createBillingTerm(term: InsertBillingTerm): Promise<BillingTerm>;
  updateBillingTerm(id: string, data: Partial<InsertBillingTerm>): Promise<BillingTerm | undefined>;
  deleteBillingTerm(id: string): Promise<boolean>;
  setDefaultBillingTerm(id: string): Promise<BillingTerm | undefined>;

  // Customer Categories
  getCustomerCategories(): Promise<CustomerCategory[]>;
  getCustomerCategory(id: string): Promise<CustomerCategory | undefined>;
  createCustomerCategory(category: InsertCustomerCategory): Promise<CustomerCategory>;
  updateCustomerCategory(id: string, data: Partial<InsertCustomerCategory>): Promise<CustomerCategory | undefined>;
  deleteCustomerCategory(id: string): Promise<boolean>;

  // Customer Groups
  getCustomerGroups(categoryId?: string): Promise<CustomerGroup[]>;
  getCustomerGroup(id: string): Promise<CustomerGroup | undefined>;
  createCustomerGroup(group: InsertCustomerGroup): Promise<CustomerGroup>;
  updateCustomerGroup(id: string, data: Partial<InsertCustomerGroup>): Promise<CustomerGroup | undefined>;
  deleteCustomerGroup(id: string): Promise<boolean>;

  // Customers
  getCustomers(categoryId?: string, groupId?: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByReferralCode(code: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  moveCustomer(id: string, categoryId: string, groupId?: string): Promise<Customer | undefined>;

  // Customer KYC
  getCustomerKycRequests(status?: string): Promise<CustomerKyc[]>;
  getCustomerKyc(id: string): Promise<CustomerKyc | undefined>;
  getCustomerKycByCustomerId(customerId: string): Promise<CustomerKyc | undefined>;
  createCustomerKyc(kyc: InsertCustomerKyc): Promise<CustomerKyc>;
  updateCustomerKyc(id: string, data: Partial<InsertCustomerKyc>): Promise<CustomerKyc | undefined>;

  // POPs
  getPops(): Promise<Pop[]>;
  getPop(id: string): Promise<Pop | undefined>;
  createPop(pop: InsertPop): Promise<Pop>;
  updatePop(id: string, data: Partial<InsertPop>): Promise<Pop | undefined>;
  deletePop(id: string): Promise<boolean>;

  // Voice Tiers
  getVoiceTiers(): Promise<VoiceTier[]>;
  getVoiceTier(id: string): Promise<VoiceTier | undefined>;
  createVoiceTier(tier: InsertVoiceTier): Promise<VoiceTier>;
  updateVoiceTier(id: string, data: Partial<InsertVoiceTier>): Promise<VoiceTier | undefined>;
  deleteVoiceTier(id: string): Promise<boolean>;

  // Codecs
  getCodecs(): Promise<Codec[]>;
  getCodec(id: string): Promise<Codec | undefined>;
  createCodec(codec: InsertCodec): Promise<Codec>;
  updateCodec(id: string, data: Partial<InsertCodec>): Promise<Codec | undefined>;
  deleteCodec(id: string): Promise<boolean>;

  // Channel Plans
  getChannelPlans(): Promise<ChannelPlan[]>;
  getChannelPlan(id: string): Promise<ChannelPlan | undefined>;
  createChannelPlan(plan: InsertChannelPlan): Promise<ChannelPlan>;
  updateChannelPlan(id: string, data: Partial<InsertChannelPlan>): Promise<ChannelPlan | undefined>;
  deleteChannelPlan(id: string): Promise<boolean>;

  // Carriers
  getCarriers(): Promise<Carrier[]>;
  getCarriersWithCursor(cursor: string | null, limit: number): Promise<Carrier[]>;
  getCarrier(id: string): Promise<Carrier | undefined>;
  getCarrierByCode(code: string): Promise<Carrier | undefined>;
  getCarrierByShortId(shortId: number): Promise<Carrier | undefined>;
  resolveCarrier(identifier: string): Promise<Carrier | undefined>;
  createCarrier(carrier: InsertCarrier): Promise<Carrier>;
  updateCarrier(id: string, data: Partial<InsertCarrier>): Promise<Carrier | undefined>;
  deleteCarrier(id: string): Promise<boolean>;

  // Customer Rating Plans
  getCustomerRatingPlans(): Promise<CustomerRatingPlan[]>;
  getCustomerRatingPlansWithCursor(cursor: string | null, limit: number): Promise<CustomerRatingPlan[]>;
  getCustomerRatingPlan(id: string): Promise<CustomerRatingPlan | undefined>;
  getCustomerRatingPlanByShortCode(shortCode: string): Promise<CustomerRatingPlan | undefined>;
  resolveCustomerRatingPlan(identifier: string): Promise<CustomerRatingPlan | undefined>;
  createCustomerRatingPlan(plan: InsertCustomerRatingPlan): Promise<CustomerRatingPlan>;
  updateCustomerRatingPlan(id: string, data: Partial<InsertCustomerRatingPlan>): Promise<CustomerRatingPlan | undefined>;
  deleteCustomerRatingPlan(id: string): Promise<boolean>;

  // Customer Rating Plan Rates
  getRatingPlanRates(ratingPlanId: string): Promise<CustomerRatingPlanRate[]>;
  getRatingPlanRatesWithCursor(ratingPlanId: string, cursor: string | null, limit: number): Promise<CustomerRatingPlanRate[]>;
  getRatingPlanRate(id: string): Promise<CustomerRatingPlanRate | undefined>;
  createRatingPlanRate(rate: InsertCustomerRatingPlanRate): Promise<CustomerRatingPlanRate>;
  updateRatingPlanRate(id: string, data: Partial<InsertCustomerRatingPlanRate>): Promise<CustomerRatingPlanRate | undefined>;
  deleteRatingPlanRate(id: string): Promise<boolean>;
  searchZonesFromAZ(searchTerm: string): Promise<string[]>;
  expandWildcardZones(wildcardPattern: string): Promise<string[]>;
  getCodesForZone(zone: string): Promise<string[]>;
  getCodesWithIntervalsForZone(zone: string): Promise<{ codes: string[], billingIncrement: string | null }>;
  lookupZoneByCode(code: string): Promise<string | null>;

  // Supplier Rating Plans
  getSupplierRatingPlans(): Promise<SupplierRatingPlan[]>;
  getSupplierRatingPlansWithCursor(cursor: string | null, limit: number): Promise<SupplierRatingPlan[]>;
  getSupplierRatingPlan(id: string): Promise<SupplierRatingPlan | undefined>;
  getSupplierRatingPlanByShortCode(shortCode: string): Promise<SupplierRatingPlan | undefined>;
  resolveSupplierRatingPlan(identifier: string): Promise<SupplierRatingPlan | undefined>;
  createSupplierRatingPlan(plan: InsertSupplierRatingPlan): Promise<SupplierRatingPlan>;
  updateSupplierRatingPlan(id: string, data: Partial<InsertSupplierRatingPlan>): Promise<SupplierRatingPlan | undefined>;
  deleteSupplierRatingPlan(id: string): Promise<boolean>;

  // Supplier Rating Plan Rates
  getSupplierRatingPlanRates(ratingPlanId: string): Promise<SupplierRatingPlanRate[]>;
  getSupplierRatingPlanRatesWithCursor(ratingPlanId: string, cursor: string | null, limit: number): Promise<SupplierRatingPlanRate[]>;
  getSupplierRatingPlanRate(id: string): Promise<SupplierRatingPlanRate | undefined>;
  createSupplierRatingPlanRate(rate: InsertSupplierRatingPlanRate): Promise<SupplierRatingPlanRate>;
  updateSupplierRatingPlanRate(id: string, data: Partial<InsertSupplierRatingPlanRate>): Promise<SupplierRatingPlanRate | undefined>;
  deleteSupplierRatingPlanRate(id: string): Promise<boolean>;

  // Business Rules
  getBusinessRules(): Promise<BusinessRule[]>;
  getBusinessRule(id: string): Promise<BusinessRule | undefined>;
  createBusinessRule(rule: InsertBusinessRule): Promise<BusinessRule>;
  updateBusinessRule(id: string, data: Partial<InsertBusinessRule>): Promise<BusinessRule | undefined>;
  deleteBusinessRule(id: string): Promise<boolean>;

  // Carrier Assignments
  getCarrierAssignment(carrierId: string): Promise<CarrierAssignment | undefined>;
  upsertCarrierAssignment(assignment: InsertCarrierAssignment): Promise<CarrierAssignment>;

  // Carrier Interconnects
  getAllCarrierInterconnects(): Promise<CarrierInterconnect[]>;
  getCarrierInterconnects(carrierId: string): Promise<CarrierInterconnect[]>;
  getCarrierInterconnect(id: string): Promise<CarrierInterconnect | undefined>;
  getCarrierInterconnectByShortCode(shortCode: string): Promise<CarrierInterconnect | undefined>;
  getCarrierInterconnectByShortId(shortId: number): Promise<CarrierInterconnect | undefined>;
  resolveCarrierInterconnect(identifier: string): Promise<CarrierInterconnect | undefined>;
  createCarrierInterconnect(interconnect: InsertCarrierInterconnect): Promise<CarrierInterconnect>;
  updateCarrierInterconnect(id: string, data: Partial<InsertCarrierInterconnect>): Promise<CarrierInterconnect | undefined>;
  deleteCarrierInterconnect(id: string): Promise<boolean>;

  // Carrier Services (THE KEY LINKAGE: Interconnect → Rating Plan + Routing Plan)
  getAllCarrierServices(): Promise<CarrierService[]>;
  getCarrierServices(carrierId: string): Promise<CarrierService[]>;
  getInterconnectServices(interconnectId: string): Promise<CarrierService[]>;
  getCarrierService(id: string): Promise<CarrierService | undefined>;
  getCarrierServiceByShortCode(shortCode: string): Promise<CarrierService | undefined>;
  getCarrierServiceByShortId(shortId: number): Promise<CarrierService | undefined>;
  resolveCarrierService(identifier: string): Promise<CarrierService | undefined>;
  createCarrierService(service: InsertCarrierService): Promise<CarrierService>;
  updateCarrierService(id: string, data: Partial<InsertCarrierService>): Promise<CarrierService | undefined>;
  deleteCarrierService(id: string): Promise<boolean>;
  getSupplierInterconnects(excludeCarrierId?: string): Promise<CarrierInterconnect[]>;

  // Service Match Lists
  getAllServiceMatchLists(): Promise<ServiceMatchList[]>;
  getServiceMatchList(id: string): Promise<ServiceMatchList | undefined>;
  createServiceMatchList(matchList: InsertServiceMatchList): Promise<ServiceMatchList>;
  updateServiceMatchList(id: string, data: Partial<InsertServiceMatchList>): Promise<ServiceMatchList | undefined>;
  deleteServiceMatchList(id: string): Promise<boolean>;

  // Carrier Contacts
  getCarrierContacts(carrierId: string): Promise<CarrierContact[]>;
  getCarrierContact(id: string): Promise<CarrierContact | undefined>;
  createCarrierContact(contact: InsertCarrierContact): Promise<CarrierContact>;
  updateCarrierContact(id: string, data: Partial<InsertCarrierContact>): Promise<CarrierContact | undefined>;
  deleteCarrierContact(id: string): Promise<boolean>;

  // Carrier Credit Alerts
  getCarrierCreditAlerts(carrierId: string): Promise<CarrierCreditAlert[]>;
  getCarrierCreditAlert(id: string): Promise<CarrierCreditAlert | undefined>;
  createCarrierCreditAlert(alert: InsertCarrierCreditAlert): Promise<CarrierCreditAlert>;
  updateCarrierCreditAlert(id: string, data: Partial<InsertCarrierCreditAlert>): Promise<CarrierCreditAlert | undefined>;
  deleteCarrierCreditAlert(id: string): Promise<boolean>;

  // Interconnect IP Addresses
  getInterconnectIpAddresses(interconnectId: string): Promise<InterconnectIpAddress[]>;
  createInterconnectIpAddress(data: InsertInterconnectIpAddress): Promise<InterconnectIpAddress>;
  deleteInterconnectIpAddress(id: string): Promise<boolean>;

  // Interconnect Validation Settings
  getInterconnectValidationSettings(interconnectId: string): Promise<InterconnectValidationSettings | undefined>;
  upsertInterconnectValidationSettings(data: InsertInterconnectValidationSettings): Promise<InterconnectValidationSettings>;

  // Interconnect Translation Settings
  getInterconnectTranslationSettings(interconnectId: string): Promise<InterconnectTranslationSettings | undefined>;
  upsertInterconnectTranslationSettings(data: InsertInterconnectTranslationSettings): Promise<InterconnectTranslationSettings>;

  // Interconnect Codecs
  getInterconnectCodecs(interconnectId: string): Promise<InterconnectCodec[]>;
  upsertInterconnectCodecs(interconnectId: string, codecs: InsertInterconnectCodec[]): Promise<InterconnectCodec[]>;

  // Interconnect Media Settings
  getInterconnectMediaSettings(interconnectId: string): Promise<InterconnectMediaSettings | undefined>;
  upsertInterconnectMediaSettings(data: InsertInterconnectMediaSettings): Promise<InterconnectMediaSettings>;

  // Interconnect Signalling Settings
  getInterconnectSignallingSettings(interconnectId: string): Promise<InterconnectSignallingSettings | undefined>;
  upsertInterconnectSignallingSettings(data: InsertInterconnectSignallingSettings): Promise<InterconnectSignallingSettings>;

  // Interconnect Monitoring Settings
  getInterconnectMonitoringSettings(interconnectId: string): Promise<InterconnectMonitoringSettings | undefined>;
  upsertInterconnectMonitoringSettings(data: InsertInterconnectMonitoringSettings): Promise<InterconnectMonitoringSettings>;

  // Audit Logs
  getAuditLogs(tableName?: string, recordId?: string, limit?: number): Promise<AuditLog[]>;
  createAuditLog(log: { userId?: string; action: string; tableName?: string; recordId?: string; oldValues?: unknown; newValues?: unknown; ipAddress?: string; }): Promise<AuditLog>;

  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, data: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: string): Promise<boolean>;

  // Monitoring Rules
  getMonitoringRules(): Promise<MonitoringRule[]>;
  getMonitoringRule(id: string): Promise<MonitoringRule | undefined>;
  createMonitoringRule(rule: InsertMonitoringRule): Promise<MonitoringRule>;
  updateMonitoringRule(id: string, data: Partial<InsertMonitoringRule>): Promise<MonitoringRule | undefined>;
  deleteMonitoringRule(id: string): Promise<boolean>;

  // Alerts
  getAlerts(status?: string): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, data: Partial<InsertAlert>): Promise<Alert | undefined>;

  // DID Countries
  getDidCountries(): Promise<DidCountry[]>;
  getDidCountry(id: string): Promise<DidCountry | undefined>;
  createDidCountry(country: InsertDidCountry): Promise<DidCountry>;
  updateDidCountry(id: string, data: Partial<InsertDidCountry>): Promise<DidCountry | undefined>;
  deleteDidCountry(id: string): Promise<boolean>;

  // DID Providers
  getDidProviders(): Promise<DidProvider[]>;
  getDidProvider(id: string): Promise<DidProvider | undefined>;
  createDidProvider(provider: InsertDidProvider): Promise<DidProvider>;
  updateDidProvider(id: string, data: Partial<InsertDidProvider>): Promise<DidProvider | undefined>;
  deleteDidProvider(id: string): Promise<boolean>;

  // DIDs
  getDids(customerId?: string): Promise<Did[]>;
  getDid(id: string): Promise<Did | undefined>;
  createDid(did: InsertDid): Promise<Did>;
  updateDid(id: string, data: Partial<InsertDid>): Promise<Did | undefined>;

  // SIP Trunks
  getSipTrunks(customerId: string): Promise<SipTrunk[]>;
  getSipTrunk(id: string): Promise<SipTrunk | undefined>;
  createSipTrunk(trunk: InsertSipTrunk): Promise<SipTrunk>;
  updateSipTrunk(id: string, data: Partial<InsertSipTrunk>): Promise<SipTrunk | undefined>;
  deleteSipTrunk(id: string): Promise<boolean>;

  // Extensions
  getExtensions(customerId: string): Promise<Extension[]>;
  getExtension(id: string): Promise<Extension | undefined>;
  createExtension(ext: InsertExtension): Promise<Extension>;
  updateExtension(id: string, data: Partial<InsertExtension>): Promise<Extension | undefined>;
  deleteExtension(id: string): Promise<boolean>;

  // IVRs
  getIvrs(customerId: string): Promise<Ivr[]>;
  getIvr(id: string): Promise<Ivr | undefined>;
  createIvr(ivr: InsertIvr): Promise<Ivr>;
  updateIvr(id: string, data: Partial<InsertIvr>): Promise<Ivr | undefined>;
  deleteIvr(id: string): Promise<boolean>;

  // Ring Groups
  getRingGroups(customerId: string): Promise<RingGroup[]>;
  getRingGroup(id: string): Promise<RingGroup | undefined>;
  createRingGroup(rg: InsertRingGroup): Promise<RingGroup>;
  updateRingGroup(id: string, data: Partial<InsertRingGroup>): Promise<RingGroup | undefined>;
  deleteRingGroup(id: string): Promise<boolean>;

  // Queues
  getQueues(customerId: string): Promise<Queue[]>;
  getQueue(id: string): Promise<Queue | undefined>;
  createQueue(queue: InsertQueue): Promise<Queue>;
  updateQueue(id: string, data: Partial<InsertQueue>): Promise<Queue | undefined>;
  deleteQueue(id: string): Promise<boolean>;

  // Tickets
  getTickets(customerId?: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, data: Partial<InsertTicket>): Promise<Ticket | undefined>;

  // Invoices
  getInvoices(customerId?: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: Partial<Invoice>): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;

  // Payments
  getPayments(customerId?: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;

  // Promo Codes
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(id: string): Promise<PromoCode | undefined>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: string, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: string): Promise<boolean>;

  // Referrals
  getReferrals(referrerId?: string): Promise<Referral[]>;
  getReferral(id: string): Promise<Referral | undefined>;
  createReferral(referral: Partial<Referral>): Promise<Referral>;
  updateReferral(id: string, data: Partial<Referral>): Promise<Referral | undefined>;
  deleteReferral(id: string): Promise<boolean>;

  // Bonus Types
  getBonusTypes(): Promise<BonusType[]>;
  getBonusType(id: string): Promise<BonusType | undefined>;
  createBonusType(bonusType: InsertBonusType): Promise<BonusType>;
  updateBonusType(id: string, data: Partial<InsertBonusType>): Promise<BonusType | undefined>;
  deleteBonusType(id: string): Promise<boolean>;

  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  getEmailTemplateBySlug(slug: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;

  // Email Logs
  getEmailLogs(): Promise<EmailLog[]>;
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;

  // File Templates
  getFileTemplates(): Promise<FileTemplate[]>;
  getFileTemplate(id: string): Promise<FileTemplate | undefined>;
  createFileTemplate(template: InsertFileTemplate): Promise<FileTemplate>;
  updateFileTemplate(id: string, data: Partial<InsertFileTemplate>): Promise<FileTemplate | undefined>;
  deleteFileTemplate(id: string): Promise<boolean>;

  // Social Accounts
  getSocialAccounts(): Promise<SocialAccount[]>;
  getSocialAccount(id: string): Promise<SocialAccount | undefined>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: string, data: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: string): Promise<boolean>;

  // Social Posts
  getSocialPosts(): Promise<SocialPost[]>;
  getSocialPost(id: string): Promise<SocialPost | undefined>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  updateSocialPost(id: string, data: Partial<InsertSocialPost>): Promise<SocialPost | undefined>;
  deleteSocialPost(id: string): Promise<boolean>;

  // Rate Cards
  getRateCards(type?: string): Promise<RateCard[]>;
  getRateCard(id: string): Promise<RateCard | undefined>;
  createRateCard(card: InsertRateCard): Promise<RateCard>;
  updateRateCard(id: string, data: Partial<InsertRateCard>): Promise<RateCard | undefined>;
  deleteRateCard(id: string): Promise<boolean>;

  // Rate Card Rates
  getRateCardRates(rateCardId: string): Promise<RateCardRate[]>;
  createRateCardRate(rate: InsertRateCardRate): Promise<RateCardRate>;
  createRateCardRatesBulk(rates: InsertRateCardRate[]): Promise<RateCardRate[]>;
  deleteRateCardRates(rateCardId: string): Promise<boolean>;

  // Dashboard Stats
  getCategoryStats(): Promise<{ categoryId: string; customerCount: number; revenue: number }[]>;

  // Currencies
  getCurrencies(): Promise<Currency[]>;
  getCurrency(id: string): Promise<Currency | undefined>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  updateCurrency(id: string, data: Partial<InsertCurrency>): Promise<Currency | undefined>;
  deleteCurrency(id: string): Promise<boolean>;

  // FX Rates
  getFxRates(quoteCurrency?: string): Promise<FxRate[]>;
  getLatestFxRate(quoteCurrency: string): Promise<FxRate | undefined>;
  createFxRate(rate: InsertFxRate): Promise<FxRate>;

  // SIP Test Configs
  getSipTestConfigs(customerId?: string): Promise<SipTestConfig[]>;
  getSharedSipTestConfigs(): Promise<SipTestConfig[]>;
  getSipTestConfig(id: string): Promise<SipTestConfig | undefined>;
  createSipTestConfig(config: InsertSipTestConfig): Promise<SipTestConfig>;
  updateSipTestConfig(id: string, data: Partial<InsertSipTestConfig>): Promise<SipTestConfig | undefined>;
  deleteSipTestConfig(id: string): Promise<boolean>;

  // SIP Test Results
  getSipTestResults(configId?: string): Promise<SipTestResult[]>;
  getSipTestResult(id: string): Promise<SipTestResult | undefined>;
  createSipTestResult(result: InsertSipTestResult): Promise<SipTestResult>;

  // SIP Test Schedules
  getSipTestSchedules(configId?: string): Promise<SipTestSchedule[]>;
  getSipTestSchedule(id: string): Promise<SipTestSchedule | undefined>;
  createSipTestSchedule(schedule: InsertSipTestSchedule): Promise<SipTestSchedule>;
  updateSipTestSchedule(id: string, data: Partial<InsertSipTestSchedule>): Promise<SipTestSchedule | undefined>;
  deleteSipTestSchedule(id: string): Promise<boolean>;

  // SIP Test Audio Files
  getSipTestAudioFiles(): Promise<SipTestAudioFile[]>;
  getSipTestAudioFile(id: string): Promise<SipTestAudioFile | undefined>;
  createSipTestAudioFile(file: InsertSipTestAudioFile): Promise<SipTestAudioFile>;
  updateSipTestAudioFile(id: string, data: Partial<InsertSipTestAudioFile>): Promise<SipTestAudioFile | undefined>;
  deleteSipTestAudioFile(id: string): Promise<boolean>;

  // SIP Test Numbers (Crowdsourced)
  getSipTestNumbers(countryCode?: string): Promise<SipTestNumber[]>;
  getSipTestNumber(id: string): Promise<SipTestNumber | undefined>;
  createSipTestNumber(number: InsertSipTestNumber): Promise<SipTestNumber>;
  updateSipTestNumber(id: string, data: Partial<InsertSipTestNumber>): Promise<SipTestNumber | undefined>;
  deleteSipTestNumber(id: string): Promise<boolean>;

  // SIP Test Profiles
  getSipTestProfiles(customerId?: string): Promise<SipTestProfile[]>;
  createSipTestProfile(profile: InsertSipTestProfile): Promise<SipTestProfile>;
  deleteSipTestProfile(id: string): Promise<boolean>;

  // SIP Test Suppliers
  getSipTestSuppliers(customerId?: string): Promise<SipTestSupplier[]>;
  createSipTestSupplier(supplier: InsertSipTestSupplier): Promise<SipTestSupplier>;
  deleteSipTestSupplier(id: string): Promise<boolean>;

  // SIP Test Settings
  getSipTestSettings(customerId?: string): Promise<SipTestSettings | undefined>;
  upsertSipTestSettings(settings: InsertSipTestSettings): Promise<SipTestSettings>;

  // SIP Test Runs (Admin)
  getAllSipTestRuns(): Promise<SipTestRun[]>;

  // SIP Test Runs
  getSipTestRuns(customerId: string): Promise<SipTestRun[]>;
  getSipTestRun(id: string): Promise<SipTestRun | undefined>;
  createSipTestRun(run: InsertSipTestRun): Promise<SipTestRun>;
  updateSipTestRun(id: string, data: Partial<InsertSipTestRun>): Promise<SipTestRun | undefined>;

  // SIP Test Run Results (Individual call results)
  getSipTestRunResults(testRunId: string): Promise<SipTestRunResult[]>;
  createSipTestRunResult(result: InsertSipTestRunResult): Promise<SipTestRunResult>;

  // Webhooks
  getWebhooks(customerId: string): Promise<Webhook[]>;
  getWebhook(id: string): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: string, data: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: string): Promise<boolean>;

  // Webhook Deliveries
  getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]>;
  createWebhookDelivery(delivery: InsertWebhookDelivery): Promise<WebhookDelivery>;
  updateWebhookDelivery(id: string, data: Partial<InsertWebhookDelivery>): Promise<WebhookDelivery | undefined>;

  // Customer API Keys
  getCustomerApiKeys(customerId: string): Promise<CustomerApiKey[]>;
  getCustomerApiKey(id: string): Promise<CustomerApiKey | undefined>;
  createCustomerApiKey(apiKey: InsertCustomerApiKey): Promise<CustomerApiKey>;
  updateCustomerApiKey(id: string, data: Partial<InsertCustomerApiKey>): Promise<CustomerApiKey | undefined>;
  deleteCustomerApiKey(id: string): Promise<boolean>;

  // Class 4 Customers
  getClass4Customers(parentCustomerId: string): Promise<Class4Customer[]>;
  getClass4Customer(id: string): Promise<Class4Customer | undefined>;
  createClass4Customer(customer: InsertClass4Customer): Promise<Class4Customer>;
  updateClass4Customer(id: string, data: Partial<InsertClass4Customer>): Promise<Class4Customer | undefined>;

  // Class 4 Carriers
  getClass4Carriers(parentCustomerId: string): Promise<Class4Carrier[]>;
  getClass4Carrier(id: string): Promise<Class4Carrier | undefined>;
  createClass4Carrier(carrier: InsertClass4Carrier): Promise<Class4Carrier>;
  updateClass4Carrier(id: string, data: Partial<InsertClass4Carrier>): Promise<Class4Carrier | undefined>;

  // Class 4 Provider Rate Cards
  getClass4ProviderRateCards(carrierId?: string): Promise<Class4ProviderRateCard[]>;
  getClass4ProviderRateCard(id: string): Promise<Class4ProviderRateCard | undefined>;
  createClass4ProviderRateCard(card: InsertClass4ProviderRateCard): Promise<Class4ProviderRateCard>;
  updateClass4ProviderRateCard(id: string, data: Partial<InsertClass4ProviderRateCard>): Promise<Class4ProviderRateCard | undefined>;
  deleteClass4ProviderRateCard(id: string): Promise<boolean>;

  // Class 4 Customer Rate Cards
  getClass4CustomerRateCards(class4CustomerId?: string): Promise<Class4CustomerRateCard[]>;
  getClass4CustomerRateCard(id: string): Promise<Class4CustomerRateCard | undefined>;
  createClass4CustomerRateCard(card: InsertClass4CustomerRateCard): Promise<Class4CustomerRateCard>;
  updateClass4CustomerRateCard(id: string, data: Partial<InsertClass4CustomerRateCard>): Promise<Class4CustomerRateCard | undefined>;
  deleteClass4CustomerRateCard(id: string): Promise<boolean>;

  // AI Voice Agents
  getAiVoiceAgents(customerId: string): Promise<AiVoiceAgent[]>;
  getAllAiVoiceAgents(): Promise<AiVoiceAgent[]>;
  getAiVoiceAgent(id: string): Promise<AiVoiceAgent | undefined>;
  createAiVoiceAgent(agent: InsertAiVoiceAgent): Promise<AiVoiceAgent>;
  updateAiVoiceAgent(id: string, data: Partial<InsertAiVoiceAgent>): Promise<AiVoiceAgent | undefined>;
  deleteAiVoiceAgent(id: string): Promise<boolean>;

  // AI Voice Flows
  getAiVoiceFlows(agentId: string): Promise<AiVoiceFlow[]>;
  getAiVoiceFlow(id: string): Promise<AiVoiceFlow | undefined>;
  createAiVoiceFlow(flow: InsertAiVoiceFlow): Promise<AiVoiceFlow>;
  updateAiVoiceFlow(id: string, data: Partial<InsertAiVoiceFlow>): Promise<AiVoiceFlow | undefined>;
  deleteAiVoiceFlow(id: string): Promise<boolean>;

  // AI Voice Training Data
  getAiVoiceTrainingData(agentId: string): Promise<AiVoiceTrainingData[]>;
  getAiVoiceTrainingDataItem(id: string): Promise<AiVoiceTrainingData | undefined>;
  createAiVoiceTrainingData(data: InsertAiVoiceTrainingData): Promise<AiVoiceTrainingData>;
  updateAiVoiceTrainingData(id: string, data: Partial<InsertAiVoiceTrainingData>): Promise<AiVoiceTrainingData | undefined>;
  deleteAiVoiceTrainingData(id: string): Promise<boolean>;

  // AI Voice Campaigns
  getAiVoiceCampaigns(customerId: string): Promise<AiVoiceCampaign[]>;
  getAiVoiceCampaign(id: string): Promise<AiVoiceCampaign | undefined>;
  createAiVoiceCampaign(campaign: InsertAiVoiceCampaign): Promise<AiVoiceCampaign>;
  updateAiVoiceCampaign(id: string, data: Partial<InsertAiVoiceCampaign>): Promise<AiVoiceCampaign | undefined>;
  deleteAiVoiceCampaign(id: string): Promise<boolean>;

  // AI Voice Knowledge Bases
  getAiVoiceKnowledgeBases(customerId?: string): Promise<AiVoiceKnowledgeBase[]>;
  getAiVoiceKnowledgeBase(id: string): Promise<AiVoiceKnowledgeBase | undefined>;
  createAiVoiceKnowledgeBase(kb: InsertAiVoiceKnowledgeBase): Promise<AiVoiceKnowledgeBase>;
  updateAiVoiceKnowledgeBase(id: string, data: Partial<InsertAiVoiceKnowledgeBase>): Promise<AiVoiceKnowledgeBase | undefined>;
  deleteAiVoiceKnowledgeBase(id: string): Promise<boolean>;

  // AI Voice KB Sources
  getAiVoiceKbSources(knowledgeBaseId: string): Promise<AiVoiceKbSource[]>;
  getAiVoiceKbSource(id: string): Promise<AiVoiceKbSource | undefined>;
  createAiVoiceKbSource(source: InsertAiVoiceKbSource): Promise<AiVoiceKbSource>;
  updateAiVoiceKbSource(id: string, data: Partial<InsertAiVoiceKbSource>): Promise<AiVoiceKbSource | undefined>;
  deleteAiVoiceKbSource(id: string): Promise<boolean>;

  // AI Voice Phonebooks
  getAiVoicePhonebooks(customerId: string): Promise<AiVoicePhonebook[]>;
  getAiVoicePhonebook(id: string): Promise<AiVoicePhonebook | undefined>;
  createAiVoicePhonebook(phonebook: InsertAiVoicePhonebook): Promise<AiVoicePhonebook>;
  updateAiVoicePhonebook(id: string, data: Partial<InsertAiVoicePhonebook>): Promise<AiVoicePhonebook | undefined>;
  deleteAiVoicePhonebook(id: string): Promise<boolean>;

  // AI Voice Contacts
  getAiVoiceContacts(phonebookId: string): Promise<AiVoiceContact[]>;
  getAiVoiceContact(id: string): Promise<AiVoiceContact | undefined>;
  createAiVoiceContact(contact: InsertAiVoiceContact): Promise<AiVoiceContact>;
  updateAiVoiceContact(id: string, data: Partial<InsertAiVoiceContact>): Promise<AiVoiceContact | undefined>;
  deleteAiVoiceContact(id: string): Promise<boolean>;

  // AI Voice Call Logs
  getAiVoiceCallLogs(agentId?: string, campaignId?: string): Promise<AiVoiceCallLog[]>;
  getAiVoiceCallLog(id: string): Promise<AiVoiceCallLog | undefined>;
  createAiVoiceCallLog(log: InsertAiVoiceCallLog): Promise<AiVoiceCallLog>;
  updateAiVoiceCallLog(id: string, data: Partial<InsertAiVoiceCallLog>): Promise<AiVoiceCallLog | undefined>;

  // CRM Connections
  getCrmConnections(customerId: string): Promise<CrmConnection[]>;
  getCrmConnection(id: string): Promise<CrmConnection | undefined>;
  createCrmConnection(connection: InsertCrmConnection): Promise<CrmConnection>;
  updateCrmConnection(id: string, data: Partial<InsertCrmConnection>): Promise<CrmConnection | undefined>;
  deleteCrmConnection(id: string): Promise<boolean>;

  // CRM Field Mappings
  getCrmFieldMappings(connectionId: string): Promise<CrmFieldMapping[]>;
  createCrmFieldMapping(mapping: InsertCrmFieldMapping): Promise<CrmFieldMapping>;
  updateCrmFieldMapping(id: string, data: Partial<InsertCrmFieldMapping>): Promise<CrmFieldMapping | undefined>;
  deleteCrmFieldMapping(id: string): Promise<boolean>;

  // CRM Sync Settings
  getCrmSyncSettings(connectionId: string): Promise<CrmSyncSettings | undefined>;
  upsertCrmSyncSettings(settings: InsertCrmSyncSettings): Promise<CrmSyncSettings>;

  // CRM Sync Logs
  getCrmSyncLogs(connectionId: string, limit?: number): Promise<CrmSyncLog[]>;
  createCrmSyncLog(log: InsertCrmSyncLog): Promise<CrmSyncLog>;
  updateCrmSyncLog(id: string, data: Partial<InsertCrmSyncLog>): Promise<CrmSyncLog | undefined>;

  // CRM Contact Mappings
  getCrmContactMappings(connectionId: string): Promise<CrmContactMapping[]>;
  getCrmContactMappingByPhone(connectionId: string, phone: string): Promise<CrmContactMapping | undefined>;
  getCrmContactMappingByEmail(connectionId: string, email: string): Promise<CrmContactMapping | undefined>;
  createCrmContactMapping(mapping: InsertCrmContactMapping): Promise<CrmContactMapping>;
  updateCrmContactMapping(id: string, data: Partial<InsertCrmContactMapping>): Promise<CrmContactMapping | undefined>;

  // CMS Themes
  getCmsThemes(): Promise<CmsTheme[]>;
  getCmsTheme(id: string): Promise<CmsTheme | undefined>;
  createCmsTheme(theme: InsertCmsTheme): Promise<CmsTheme>;
  updateCmsTheme(id: string, data: Partial<InsertCmsTheme>): Promise<CmsTheme | undefined>;
  deleteCmsTheme(id: string): Promise<boolean>;

  // CMS Pages
  getCmsPages(): Promise<CmsPage[]>;
  getCmsPage(id: string): Promise<CmsPage | undefined>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(id: string, data: Partial<InsertCmsPage>): Promise<CmsPage | undefined>;
  deleteCmsPage(id: string): Promise<boolean>;

  // Tenant Branding
  listTenantBrandings(): Promise<TenantBranding[]>;
  getTenantBranding(customerId: string): Promise<TenantBranding | undefined>;
  createTenantBranding(branding: InsertTenantBranding): Promise<TenantBranding>;
  updateTenantBranding(id: string, data: Partial<InsertTenantBranding>): Promise<TenantBranding | undefined>;

  // Portal Login Pages
  getPortalLoginPages(): Promise<PortalLoginPage[]>;
  getPortalLoginPage(portalType: string): Promise<PortalLoginPage | undefined>;
  createPortalLoginPage(page: InsertPortalLoginPage): Promise<PortalLoginPage>;
  updatePortalLoginPage(id: string, data: Partial<InsertPortalLoginPage>): Promise<PortalLoginPage | undefined>;

  // Site Settings
  getSiteSettings(category?: string): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;

  // Website Sections
  getWebsiteSections(pageSlug?: string): Promise<WebsiteSection[]>;
  getWebsiteSection(id: string): Promise<WebsiteSection | undefined>;
  createWebsiteSection(section: InsertWebsiteSection): Promise<WebsiteSection>;
  updateWebsiteSection(id: string, data: Partial<InsertWebsiteSection>): Promise<WebsiteSection | undefined>;
  deleteWebsiteSection(id: string): Promise<boolean>;

  // Integrations
  getIntegrations(): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  getIntegrationByProvider(provider: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, data: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;

  // Documentation Categories
  getDocCategories(): Promise<DocCategory[]>;
  getDocCategory(id: string): Promise<DocCategory | undefined>;
  createDocCategory(category: InsertDocCategory): Promise<DocCategory>;
  updateDocCategory(id: string, data: Partial<InsertDocCategory>): Promise<DocCategory | undefined>;
  deleteDocCategory(id: string): Promise<boolean>;

  // Documentation Articles
  getDocArticles(categoryId?: string): Promise<DocArticle[]>;
  getDocArticle(id: string): Promise<DocArticle | undefined>;
  getDocArticleBySlug(categorySlug: string, articleSlug: string): Promise<DocArticle | undefined>;
  createDocArticle(article: InsertDocArticle): Promise<DocArticle>;
  updateDocArticle(id: string, data: Partial<InsertDocArticle>): Promise<DocArticle | undefined>;
  deleteDocArticle(id: string): Promise<boolean>;

  // A-Z Destinations
  getAzDestinations(options?: { search?: string; region?: string; limit?: number; offset?: number }): Promise<{ destinations: AzDestination[]; total: number }>;
  getAzDestination(id: string): Promise<AzDestination | undefined>;
  getAzDestinationByCode(code: string): Promise<AzDestination | undefined>;
  createAzDestination(dest: InsertAzDestination): Promise<AzDestination>;
  createAzDestinationsBulk(dests: InsertAzDestination[]): Promise<number>;
  upsertAzDestinationsBulk(dests: InsertAzDestination[]): Promise<{ inserted: number; updated: number; skipped: number }>;
  updateAzDestination(id: string, data: Partial<InsertAzDestination>): Promise<AzDestination | undefined>;
  deleteAzDestination(id: string): Promise<boolean>;
  deleteAllAzDestinations(): Promise<number>;
  getAzRegions(): Promise<string[]>;
  normalizeCode(dialCode: string): Promise<AzDestination | undefined>;

  // Experience Manager
  getAllEmContentItems(): Promise<EmContentItem[]>;
  getEmContentItem(section: string, entityType: string, slug: string): Promise<EmContentItem | undefined>;
  getEmContentItemById(id: string): Promise<EmContentItem | undefined>;
  createEmContentItem(item: InsertEmContentItem): Promise<EmContentItem>;
  updateEmContentItem(id: string, data: Partial<InsertEmContentItem>): Promise<EmContentItem | undefined>;
  getEmContentVersion(id: string): Promise<EmContentVersion | undefined>;
  getLatestEmContentVersion(contentItemId: string): Promise<EmContentVersion | undefined>;
  createEmContentVersion(version: InsertEmContentVersion): Promise<EmContentVersion>;
  createEmValidationResult(result: InsertEmValidationResult): Promise<EmValidationResult>;
  getEmPublishHistory(contentItemId: string): Promise<EmPublishHistory[]>;
  createEmPublishHistory(entry: InsertEmPublishHistory): Promise<EmPublishHistory>;

  // Dev Tests
  getDevTests(): Promise<DevTest[]>;
  getDevTest(id: string): Promise<DevTest | undefined>;
  createDevTest(test: InsertDevTest): Promise<DevTest>;
  updateDevTest(id: string, data: Partial<InsertDevTest>): Promise<DevTest | undefined>;
  deleteDevTest(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  // All business entities are now stored in PostgreSQL via Drizzle ORM
  // This class implements IStorage interface with database operations
  // See docs/DECISIONS.md for migration details

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Customer categories, groups, and currencies are now seeded via PostgreSQL
    // See seedReferenceData() function which runs on app startup
  }

  // Seed reference data to PostgreSQL - called from server startup
  async seedReferenceDataToPostgres(): Promise<void> {
    // Check if categories already exist
    const existingCategories = await db.select().from(customerCategoriesTable);
    if (existingCategories.length === 0) {
      console.log("[Seed] Seeding customer categories to PostgreSQL...");
      const sipTrunkId = randomUUID();
      const enterpriseId = randomUUID();
      const callCenterId = randomUUID();
      const individualId = randomUUID();
      
      await db.insert(customerCategoriesTable).values([
        { id: sipTrunkId, name: "SIP Trunk", code: "sip-trunk", description: "Wholesale SIP termination services", icon: "phone", displayOrder: 1, isActive: true, showOnWebsite: true, defaultBillingType: "prepaid" },
        { id: enterpriseId, name: "Enterprise", code: "enterprise", description: "Business PBX and unified communications", icon: "building", displayOrder: 2, isActive: true, showOnWebsite: true, defaultBillingType: "postpaid" },
        { id: callCenterId, name: "Call Center", code: "call-center", description: "Inbound/outbound call center solutions", icon: "headphones", displayOrder: 3, isActive: true, showOnWebsite: true, defaultBillingType: "postpaid" },
        { id: individualId, name: "Individual", code: "individual", description: "Personal VoIP services", icon: "user", displayOrder: 4, isActive: true, showOnWebsite: true, defaultBillingType: "prepaid" },
      ]);

      // Seed groups after categories
      const existingGroups = await db.select().from(customerGroupsTable);
      if (existingGroups.length === 0) {
        console.log("[Seed] Seeding customer groups to PostgreSQL...");
        await db.insert(customerGroupsTable).values([
          { id: randomUUID(), categoryId: sipTrunkId, name: "Standard", code: "sip-standard", description: "Standard SIP trunk customers", displayOrder: 1, isActive: true },
          { id: randomUUID(), categoryId: sipTrunkId, name: "Premium", code: "sip-premium", description: "Premium SIP trunk customers", displayOrder: 2, isActive: true },
          { id: randomUUID(), categoryId: sipTrunkId, name: "Wholesale", code: "sip-wholesale", description: "Wholesale partners", displayOrder: 3, isActive: true },
          { id: randomUUID(), categoryId: enterpriseId, name: "Small Business", code: "ent-smb", description: "Small business customers", displayOrder: 1, isActive: true },
          { id: randomUUID(), categoryId: enterpriseId, name: "Mid-Market", code: "ent-mid", description: "Mid-market enterprises", displayOrder: 2, isActive: true },
          { id: randomUUID(), categoryId: enterpriseId, name: "Large Enterprise", code: "ent-large", description: "Large enterprise accounts", displayOrder: 3, isActive: true },
          { id: randomUUID(), categoryId: callCenterId, name: "Inbound", code: "cc-inbound", description: "Inbound call centers", displayOrder: 1, isActive: true },
          { id: randomUUID(), categoryId: callCenterId, name: "Outbound", code: "cc-outbound", description: "Outbound call centers", displayOrder: 2, isActive: true },
          { id: randomUUID(), categoryId: callCenterId, name: "Blended", code: "cc-blended", description: "Blended call centers", displayOrder: 3, isActive: true },
          { id: randomUUID(), categoryId: individualId, name: "Basic", code: "ind-basic", description: "Basic individual users", displayOrder: 1, isActive: true },
          { id: randomUUID(), categoryId: individualId, name: "Power User", code: "ind-power", description: "Power users", displayOrder: 2, isActive: true },
        ]);
      }
    }
  }

  // Users - Using PostgreSQL database
  async getUsers(): Promise<User[]> {
    return await db.select().from(usersTable);
  }

  async getUser(id: string): Promise<User | undefined> {
    const results = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const results = await db.insert(usersTable).values({
      id,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? "customer_viewer",
      status: insertUser.status ?? "pending",
      emailVerified: insertUser.emailVerified ?? false,
      twoFactorEnabled: insertUser.twoFactorEnabled ?? false,
      twoFactorSecret: insertUser.twoFactorSecret ?? null,
      customerId: insertUser.customerId ?? null,
      carrierId: insertUser.carrierId ?? null,
    }).returning();
    return results[0];
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const results = await db.update(usersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return results[0];
  }

  // Billing Terms - Persisted to PostgreSQL (FOREVER POLICY)
  async getBillingTerms(): Promise<BillingTerm[]> {
    const results = await db.select().from(billingTermsTable);
    return results.sort((a, b) => a.cycleDays - b.cycleDays || a.dueDays - b.dueDays);
  }

  async getBillingTerm(id: string): Promise<BillingTerm | undefined> {
    const results = await db.select().from(billingTermsTable).where(eq(billingTermsTable.id, id));
    return results[0];
  }

  async createBillingTerm(term: InsertBillingTerm): Promise<BillingTerm> {
    const results = await db.insert(billingTermsTable).values(term).returning();
    return results[0];
  }

  async updateBillingTerm(id: string, data: Partial<InsertBillingTerm>): Promise<BillingTerm | undefined> {
    const results = await db.update(billingTermsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(billingTermsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteBillingTerm(id: string): Promise<boolean> {
    const results = await db.delete(billingTermsTable).where(eq(billingTermsTable.id, id)).returning();
    return results.length > 0;
  }

  async setDefaultBillingTerm(id: string): Promise<BillingTerm | undefined> {
    // Remove default from all other terms
    const allTerms = await db.select().from(billingTermsTable).where(eq(billingTermsTable.isDefault, true));
    for (const t of allTerms) {
      await db.update(billingTermsTable)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(billingTermsTable.id, t.id));
    }
    // Set this one as default
    const results = await db.update(billingTermsTable)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(billingTermsTable.id, id))
      .returning();
    return results[0];
  }

  // Customer Categories - Using PostgreSQL database
  async getCustomerCategories(): Promise<CustomerCategory[]> {
    const results = await db.select().from(customerCategoriesTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getCustomerCategory(id: string): Promise<CustomerCategory | undefined> {
    const results = await db.select().from(customerCategoriesTable).where(eq(customerCategoriesTable.id, id));
    return results[0];
  }

  async createCustomerCategory(category: InsertCustomerCategory): Promise<CustomerCategory> {
    const id = randomUUID();
    const results = await db.insert(customerCategoriesTable).values({
      id,
      name: category.name,
      code: category.code,
      description: category.description ?? null,
      icon: category.icon ?? null,
      displayOrder: category.displayOrder ?? 0,
      isActive: category.isActive ?? true,
      showOnWebsite: category.showOnWebsite ?? true,
      defaultBillingType: category.defaultBillingType ?? "prepaid",
    }).returning();
    return results[0];
  }

  async updateCustomerCategory(id: string, data: Partial<InsertCustomerCategory>): Promise<CustomerCategory | undefined> {
    const results = await db.update(customerCategoriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerCategoriesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCustomerCategory(id: string): Promise<boolean> {
    const results = await db.delete(customerCategoriesTable).where(eq(customerCategoriesTable.id, id)).returning();
    return results.length > 0;
  }

  // Customer Groups - Using PostgreSQL database
  async getCustomerGroups(categoryId?: string): Promise<CustomerGroup[]> {
    if (categoryId) {
      const results = await db.select().from(customerGroupsTable).where(eq(customerGroupsTable.categoryId, categoryId));
      return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }
    const results = await db.select().from(customerGroupsTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getCustomerGroup(id: string): Promise<CustomerGroup | undefined> {
    const results = await db.select().from(customerGroupsTable).where(eq(customerGroupsTable.id, id));
    return results[0];
  }

  async createCustomerGroup(group: InsertCustomerGroup): Promise<CustomerGroup> {
    const id = randomUUID();
    const results = await db.insert(customerGroupsTable).values({
      id,
      categoryId: group.categoryId ?? null,
      name: group.name,
      code: group.code,
      description: group.description ?? null,
      displayOrder: group.displayOrder ?? 0,
      isActive: group.isActive ?? true,
    }).returning();
    return results[0];
  }

  async updateCustomerGroup(id: string, data: Partial<InsertCustomerGroup>): Promise<CustomerGroup | undefined> {
    const results = await db.update(customerGroupsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerGroupsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCustomerGroup(id: string): Promise<boolean> {
    const results = await db.delete(customerGroupsTable).where(eq(customerGroupsTable.id, id)).returning();
    return results.length > 0;
  }

  // Customers - Using PostgreSQL database
  async getCustomers(categoryId?: string, groupId?: string): Promise<Customer[]> {
    let query = db.select().from(customersTable);
    if (categoryId && groupId) {
      const results = await db.select().from(customersTable).where(
        and(eq(customersTable.categoryId, categoryId), eq(customersTable.groupId, groupId))
      );
      return results;
    } else if (categoryId) {
      const results = await db.select().from(customersTable).where(eq(customersTable.categoryId, categoryId));
      return results;
    } else if (groupId) {
      const results = await db.select().from(customersTable).where(eq(customersTable.groupId, groupId));
      return results;
    }
    return await db.select().from(customersTable);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const results = await db.select().from(customersTable).where(eq(customersTable.id, id));
    return results[0];
  }
  
  async getCustomerByReferralCode(code: string): Promise<Customer | undefined> {
    const results = await db.select().from(customersTable).where(eq(customersTable.referralCode, code));
    return results[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const accountNumber = `DT${Date.now().toString(36).toUpperCase()}`;
    const referralCode = `REF${randomUUID().slice(0, 8).toUpperCase()}`;
    const results = await db.insert(customersTable).values({
      id,
      accountNumber,
      companyName: customer.companyName,
      categoryId: customer.categoryId ?? null,
      groupId: customer.groupId ?? null,
      status: customer.status ?? "pending_approval",
      billingType: customer.billingType ?? "prepaid",
      balance: customer.balance ?? "0",
      creditLimit: customer.creditLimit ?? "0",
      billingEmail: customer.billingEmail ?? null,
      technicalEmail: customer.technicalEmail ?? null,
      address: customer.address ?? null,
      city: customer.city ?? null,
      state: customer.state ?? null,
      country: customer.country ?? null,
      postalCode: customer.postalCode ?? null,
      taxId: customer.taxId ?? null,
      referralCode,
      referredBy: customer.referredBy ?? null,
      connexcsCustomerId: customer.connexcsCustomerId ?? null,
      kycStatus: customer.kycStatus ?? "not_started",
      lowBalanceThreshold1: customer.lowBalanceThreshold1 ?? "50",
      lowBalanceThreshold2: customer.lowBalanceThreshold2 ?? "20",
      lowBalanceThreshold3: customer.lowBalanceThreshold3 ?? "5",
      autoTopUpEnabled: customer.autoTopUpEnabled ?? false,
      autoTopUpAmount: customer.autoTopUpAmount ?? null,
      autoTopUpThreshold: customer.autoTopUpThreshold ?? null,
      billingTermId: customer.billingTermId ?? null,
    }).returning();
    return results[0];
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const results = await db.update(customersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customersTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const results = await db.delete(customersTable).where(eq(customersTable.id, id)).returning();
    return results.length > 0;
  }

  async moveCustomer(id: string, categoryId: string, groupId?: string): Promise<Customer | undefined> {
    return this.updateCustomer(id, { categoryId, groupId: groupId ?? null });
  }

  // Customer KYC - Persisted to PostgreSQL (FOREVER POLICY)
  async getCustomerKycRequests(status?: string): Promise<CustomerKyc[]> {
    if (status) {
      const results = await db.select().from(customerKycTable)
        .where(eq(customerKycTable.status, status as any))
        .orderBy(desc(customerKycTable.createdAt));
      return results;
    }
    return await db.select().from(customerKycTable).orderBy(desc(customerKycTable.createdAt));
  }

  async getCustomerKyc(id: string): Promise<CustomerKyc | undefined> {
    const results = await db.select().from(customerKycTable).where(eq(customerKycTable.id, id));
    return results[0];
  }

  async getCustomerKycByCustomerId(customerId: string): Promise<CustomerKyc | undefined> {
    const results = await db.select().from(customerKycTable).where(eq(customerKycTable.customerId, customerId));
    return results[0];
  }

  async createCustomerKyc(kyc: InsertCustomerKyc): Promise<CustomerKyc> {
    const results = await db.insert(customerKycTable).values({
      customerId: kyc.customerId,
      stripeIdentityId: kyc.stripeIdentityId ?? null,
      documentType: kyc.documentType ?? null,
      documentUrl: kyc.documentUrl ?? null,
      addressDocumentUrl: kyc.addressDocumentUrl ?? null,
      businessDocumentUrl: kyc.businessDocumentUrl ?? null,
      status: kyc.status ?? "not_started",
      verifiedAt: kyc.verifiedAt ?? null,
      expiresAt: kyc.expiresAt ?? null,
      rejectionReason: kyc.rejectionReason ?? null,
      reviewedBy: kyc.reviewedBy ?? null,
    }).returning();
    return results[0];
  }

  async updateCustomerKyc(id: string, data: Partial<InsertCustomerKyc>): Promise<CustomerKyc | undefined> {
    const results = await db.update(customerKycTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerKycTable.id, id))
      .returning();
    return results[0];
  }

  // POPs - Persisted to PostgreSQL (FOREVER POLICY)
  async getPops(): Promise<Pop[]> {
    const results = await db.select().from(popsTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getPop(id: string): Promise<Pop | undefined> {
    const results = await db.select().from(popsTable).where(eq(popsTable.id, id));
    return results[0];
  }

  async createPop(pop: InsertPop): Promise<Pop> {
    const results = await db.insert(popsTable).values(pop).returning();
    return results[0];
  }

  async updatePop(id: string, data: Partial<InsertPop>): Promise<Pop | undefined> {
    const results = await db.update(popsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(popsTable.id, id))
      .returning();
    return results[0];
  }

  async deletePop(id: string): Promise<boolean> {
    const results = await db.delete(popsTable).where(eq(popsTable.id, id)).returning();
    return results.length > 0;
  }

  // Voice Tiers - Persisted to PostgreSQL (FOREVER POLICY)
  async getVoiceTiers(): Promise<VoiceTier[]> {
    const results = await db.select().from(voiceTiersTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getVoiceTier(id: string): Promise<VoiceTier | undefined> {
    const results = await db.select().from(voiceTiersTable).where(eq(voiceTiersTable.id, id));
    return results[0];
  }

  async createVoiceTier(tier: InsertVoiceTier): Promise<VoiceTier> {
    const results = await db.insert(voiceTiersTable).values(tier).returning();
    return results[0];
  }

  async updateVoiceTier(id: string, data: Partial<InsertVoiceTier>): Promise<VoiceTier | undefined> {
    const results = await db.update(voiceTiersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(voiceTiersTable.id, id))
      .returning();
    return results[0];
  }

  async deleteVoiceTier(id: string): Promise<boolean> {
    const results = await db.delete(voiceTiersTable).where(eq(voiceTiersTable.id, id)).returning();
    return results.length > 0;
  }

  // Codecs - Persisted to PostgreSQL (FOREVER POLICY)
  async getCodecs(): Promise<Codec[]> {
    const results = await db.select().from(codecsTable);
    return results.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }

  async getCodec(id: string): Promise<Codec | undefined> {
    const results = await db.select().from(codecsTable).where(eq(codecsTable.id, id));
    return results[0];
  }

  async createCodec(codec: InsertCodec): Promise<Codec> {
    const results = await db.insert(codecsTable).values(codec).returning();
    return results[0];
  }

  async updateCodec(id: string, data: Partial<InsertCodec>): Promise<Codec | undefined> {
    const results = await db.update(codecsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(codecsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCodec(id: string): Promise<boolean> {
    const results = await db.delete(codecsTable).where(eq(codecsTable.id, id)).returning();
    return results.length > 0;
  }

  // Channel Plans - Persisted to PostgreSQL (FOREVER POLICY)
  async getChannelPlans(): Promise<ChannelPlan[]> {
    const results = await db.select().from(channelPlansTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getChannelPlan(id: string): Promise<ChannelPlan | undefined> {
    const results = await db.select().from(channelPlansTable).where(eq(channelPlansTable.id, id));
    return results[0];
  }

  async createChannelPlan(plan: InsertChannelPlan): Promise<ChannelPlan> {
    const results = await db.insert(channelPlansTable).values(plan).returning();
    return results[0];
  }

  async updateChannelPlan(id: string, data: Partial<InsertChannelPlan>): Promise<ChannelPlan | undefined> {
    const results = await db.update(channelPlansTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(channelPlansTable.id, id))
      .returning();
    return results[0];
  }

  async deleteChannelPlan(id: string): Promise<boolean> {
    const results = await db.delete(channelPlansTable).where(eq(channelPlansTable.id, id)).returning();
    return results.length > 0;
  }

  // Carriers (Wholesale Partners) - Persisted to Database
  async getCarriers(): Promise<Carrier[]> {
    return await db.select().from(carriersTable);
  }

  async getCarriersWithCursor(cursor: string | null, limit: number): Promise<Carrier[]> {
    if (cursor) {
      return await db.select()
        .from(carriersTable)
        .where(gt(carriersTable.id, cursor))
        .orderBy(asc(carriersTable.id))
        .limit(limit);
    }
    return await db.select()
      .from(carriersTable)
      .orderBy(asc(carriersTable.id))
      .limit(limit);
  }

  async getCarrier(id: string): Promise<Carrier | undefined> {
    const results = await db.select().from(carriersTable).where(eq(carriersTable.id, id));
    return results[0];
  }

  async getCarrierByCode(code: string): Promise<Carrier | undefined> {
    const results = await db.select().from(carriersTable).where(eq(carriersTable.code, code));
    return results[0];
  }

  async getCarrierByShortId(shortId: number): Promise<Carrier | undefined> {
    const results = await db.select().from(carriersTable).where(eq(carriersTable.shortId, shortId));
    return results[0];
  }

  async resolveCarrier(identifier: string): Promise<Carrier | undefined> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(identifier)) {
      return this.getCarrier(identifier);
    }
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum) && identifier === String(shortIdNum)) {
      const byShortId = await this.getCarrierByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    return this.getCarrierByCode(identifier);
  }

  async createCarrier(carrier: InsertCarrier): Promise<Carrier> {
    const results = await db.insert(carriersTable).values(carrier).returning();
    return results[0];
  }

  async updateCarrier(id: string, data: Partial<InsertCarrier>): Promise<Carrier | undefined> {
    const results = await db.update(carriersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(carriersTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCarrier(id: string): Promise<boolean> {
    const results = await db.delete(carriersTable).where(eq(carriersTable.id, id)).returning();
    return results.length > 0;
  }

  // Customer Rating Plans
  async getCustomerRatingPlans(): Promise<CustomerRatingPlan[]> {
    return await db.select().from(customerRatingPlansTable);
  }

  async getCustomerRatingPlansWithCursor(cursor: string | null, limit: number): Promise<CustomerRatingPlan[]> {
    if (cursor) {
      return await db.select()
        .from(customerRatingPlansTable)
        .where(gt(customerRatingPlansTable.id, cursor))
        .orderBy(asc(customerRatingPlansTable.id))
        .limit(limit);
    }
    return await db.select()
      .from(customerRatingPlansTable)
      .orderBy(asc(customerRatingPlansTable.id))
      .limit(limit);
  }

  async getCustomerRatingPlan(id: string): Promise<CustomerRatingPlan | undefined> {
    const results = await db.select().from(customerRatingPlansTable).where(eq(customerRatingPlansTable.id, id));
    return results[0];
  }

  async getCustomerRatingPlanByShortCode(shortCode: string): Promise<CustomerRatingPlan | undefined> {
    const results = await db.select().from(customerRatingPlansTable).where(eq(customerRatingPlansTable.shortCode, shortCode));
    return results[0];
  }

  async resolveCustomerRatingPlan(identifier: string): Promise<CustomerRatingPlan | undefined> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(identifier)) {
      return this.getCustomerRatingPlan(identifier);
    }
    return this.getCustomerRatingPlanByShortCode(identifier);
  }

  private async getNextRatingPlanShortCode(): Promise<string> {
    const result = await db.select({ shortCode: customerRatingPlansTable.shortCode })
      .from(customerRatingPlansTable)
      .where(ilike(customerRatingPlansTable.shortCode, 'P%'));
    const maxNum = result.reduce((max, r) => {
      const match = r.shortCode?.match(/^P(\d+)$/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `P${maxNum + 1}`;
  }

  async createCustomerRatingPlan(plan: InsertCustomerRatingPlan): Promise<CustomerRatingPlan> {
    const shortCode = await this.getNextRatingPlanShortCode();
    const results = await db.insert(customerRatingPlansTable).values({ ...plan, shortCode }).returning();
    return results[0];
  }

  async updateCustomerRatingPlan(id: string, data: Partial<InsertCustomerRatingPlan>): Promise<CustomerRatingPlan | undefined> {
    const results = await db.update(customerRatingPlansTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerRatingPlansTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCustomerRatingPlan(id: string): Promise<boolean> {
    const results = await db.delete(customerRatingPlansTable).where(eq(customerRatingPlansTable.id, id)).returning();
    return results.length > 0;
  }

  // Customer Rating Plan Rates
  async getRatingPlanRates(ratingPlanId: string): Promise<CustomerRatingPlanRate[]> {
    return await db.select().from(customerRatingPlanRatesTable)
      .where(eq(customerRatingPlanRatesTable.ratingPlanId, ratingPlanId))
      .orderBy(customerRatingPlanRatesTable.zone);
  }

  async getRatingPlanRatesWithCursor(ratingPlanId: string, cursor: string | null, limit: number): Promise<CustomerRatingPlanRate[]> {
    if (cursor) {
      return await db.select()
        .from(customerRatingPlanRatesTable)
        .where(and(
          eq(customerRatingPlanRatesTable.ratingPlanId, ratingPlanId),
          gt(customerRatingPlanRatesTable.id, cursor)
        ))
        .orderBy(asc(customerRatingPlanRatesTable.id))
        .limit(limit);
    }
    return await db.select()
      .from(customerRatingPlanRatesTable)
      .where(eq(customerRatingPlanRatesTable.ratingPlanId, ratingPlanId))
      .orderBy(asc(customerRatingPlanRatesTable.id))
      .limit(limit);
  }

  async getRatingPlanRate(id: string): Promise<CustomerRatingPlanRate | undefined> {
    const results = await db.select().from(customerRatingPlanRatesTable)
      .where(eq(customerRatingPlanRatesTable.id, id));
    return results[0];
  }

  async createRatingPlanRate(rate: InsertCustomerRatingPlanRate): Promise<CustomerRatingPlanRate> {
    const results = await db.insert(customerRatingPlanRatesTable).values(rate).returning();
    return results[0];
  }

  async updateRatingPlanRate(id: string, data: Partial<InsertCustomerRatingPlanRate>): Promise<CustomerRatingPlanRate | undefined> {
    const results = await db.update(customerRatingPlanRatesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerRatingPlanRatesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteRatingPlanRate(id: string): Promise<boolean> {
    const results = await db.delete(customerRatingPlanRatesTable)
      .where(eq(customerRatingPlanRatesTable.id, id))
      .returning();
    return results.length > 0;
  }

  // Supplier Rating Plans
  async getSupplierRatingPlans(): Promise<SupplierRatingPlan[]> {
    return await db.select().from(supplierRatingPlansTable);
  }

  async getSupplierRatingPlansWithCursor(cursor: string | null, limit: number): Promise<SupplierRatingPlan[]> {
    if (cursor) {
      return await db.select()
        .from(supplierRatingPlansTable)
        .where(gt(supplierRatingPlansTable.id, cursor))
        .orderBy(asc(supplierRatingPlansTable.id))
        .limit(limit);
    }
    return await db.select()
      .from(supplierRatingPlansTable)
      .orderBy(asc(supplierRatingPlansTable.id))
      .limit(limit);
  }

  async getSupplierRatingPlan(id: string): Promise<SupplierRatingPlan | undefined> {
    const results = await db.select().from(supplierRatingPlansTable).where(eq(supplierRatingPlansTable.id, id));
    return results[0];
  }

  async getSupplierRatingPlanByShortCode(shortCode: string): Promise<SupplierRatingPlan | undefined> {
    const results = await db.select().from(supplierRatingPlansTable).where(eq(supplierRatingPlansTable.shortCode, shortCode));
    return results[0];
  }

  async resolveSupplierRatingPlan(identifier: string): Promise<SupplierRatingPlan | undefined> {
    const byId = await this.getSupplierRatingPlan(identifier);
    if (byId) return byId;
    return await this.getSupplierRatingPlanByShortCode(identifier);
  }

  private async getNextSupplierRatingPlanShortCode(): Promise<string> {
    const results = await db.select({ shortCode: supplierRatingPlansTable.shortCode })
      .from(supplierRatingPlansTable)
      .orderBy(supplierRatingPlansTable.shortCode);
    const codes = results.map(r => r.shortCode).filter(Boolean) as string[];
    if (codes.length === 0) return "SRP-0001";
    const lastCode = codes[codes.length - 1];
    const num = parseInt(lastCode.replace("SRP-", ""), 10);
    return `SRP-${(num + 1).toString().padStart(4, "0")}`;
  }

  async createSupplierRatingPlan(plan: InsertSupplierRatingPlan): Promise<SupplierRatingPlan> {
    const shortCode = await this.getNextSupplierRatingPlanShortCode();
    const results = await db.insert(supplierRatingPlansTable).values({ ...plan, shortCode }).returning();
    return results[0];
  }

  async updateSupplierRatingPlan(id: string, data: Partial<InsertSupplierRatingPlan>): Promise<SupplierRatingPlan | undefined> {
    const results = await db.update(supplierRatingPlansTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supplierRatingPlansTable.id, id))
      .returning();
    return results[0];
  }

  async deleteSupplierRatingPlan(id: string): Promise<boolean> {
    const results = await db.delete(supplierRatingPlansTable).where(eq(supplierRatingPlansTable.id, id)).returning();
    return results.length > 0;
  }

  // Supplier Rating Plan Rates
  async getSupplierRatingPlanRates(ratingPlanId: string): Promise<SupplierRatingPlanRate[]> {
    return await db.select().from(supplierRatingPlanRatesTable)
      .where(eq(supplierRatingPlanRatesTable.ratingPlanId, ratingPlanId))
      .orderBy(supplierRatingPlanRatesTable.zone);
  }

  async getSupplierRatingPlanRatesWithCursor(ratingPlanId: string, cursor: string | null, limit: number): Promise<SupplierRatingPlanRate[]> {
    if (cursor) {
      return await db.select()
        .from(supplierRatingPlanRatesTable)
        .where(and(
          eq(supplierRatingPlanRatesTable.ratingPlanId, ratingPlanId),
          gt(supplierRatingPlanRatesTable.id, cursor)
        ))
        .orderBy(asc(supplierRatingPlanRatesTable.id))
        .limit(limit);
    }
    return await db.select()
      .from(supplierRatingPlanRatesTable)
      .where(eq(supplierRatingPlanRatesTable.ratingPlanId, ratingPlanId))
      .orderBy(asc(supplierRatingPlanRatesTable.id))
      .limit(limit);
  }

  async getSupplierRatingPlanRate(id: string): Promise<SupplierRatingPlanRate | undefined> {
    const results = await db.select().from(supplierRatingPlanRatesTable)
      .where(eq(supplierRatingPlanRatesTable.id, id));
    return results[0];
  }

  async createSupplierRatingPlanRate(rate: InsertSupplierRatingPlanRate): Promise<SupplierRatingPlanRate> {
    const results = await db.insert(supplierRatingPlanRatesTable).values(rate).returning();
    return results[0];
  }

  async updateSupplierRatingPlanRate(id: string, data: Partial<InsertSupplierRatingPlanRate>): Promise<SupplierRatingPlanRate | undefined> {
    const results = await db.update(supplierRatingPlanRatesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supplierRatingPlanRatesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteSupplierRatingPlanRate(id: string): Promise<boolean> {
    const results = await db.delete(supplierRatingPlanRatesTable)
      .where(eq(supplierRatingPlanRatesTable.id, id))
      .returning();
    return results.length > 0;
  }

  async searchZonesFromAZ(searchTerm: string): Promise<string[]> {
    const term = searchTerm.replace(/%/g, '');
    const results = await db.selectDistinct({ destination: azDestinations.destination })
      .from(azDestinations)
      .where(ilike(azDestinations.destination, `%${term}%`))
      .orderBy(azDestinations.destination)
      .limit(50);
    return results.map(r => r.destination);
  }

  async expandWildcardZones(wildcardPattern: string): Promise<string[]> {
    const term = wildcardPattern.replace(/%/g, '');
    const results = await db.selectDistinct({ destination: azDestinations.destination })
      .from(azDestinations)
      .where(ilike(azDestinations.destination, `${term}%`))
      .orderBy(azDestinations.destination);
    return results.map(r => r.destination);
  }

  async getCodesForZone(zone: string): Promise<string[]> {
    const isWildcard = zone.includes('%');
    const searchTerm = zone.replace(/%/g, '');
    
    let results;
    if (isWildcard) {
      results = await db.select({ code: azDestinations.code })
        .from(azDestinations)
        .where(ilike(azDestinations.destination, `${searchTerm}%`))
        .orderBy(azDestinations.code);
    } else {
      results = await db.select({ code: azDestinations.code })
        .from(azDestinations)
        .where(eq(azDestinations.destination, zone))
        .orderBy(azDestinations.code);
    }
    return results.map(r => r.code);
  }

  async getCodesWithIntervalsForZone(zone: string): Promise<{ codes: string[], billingIncrement: string | null }> {
    const isWildcard = zone.includes('%');
    const searchTerm = zone.replace(/%/g, '');
    
    let results;
    if (isWildcard) {
      results = await db.select({ code: azDestinations.code, billingIncrement: azDestinations.billingIncrement })
        .from(azDestinations)
        .where(ilike(azDestinations.destination, `${searchTerm}%`))
        .orderBy(azDestinations.code);
    } else {
      results = await db.select({ code: azDestinations.code, billingIncrement: azDestinations.billingIncrement })
        .from(azDestinations)
        .where(eq(azDestinations.destination, zone))
        .orderBy(azDestinations.code);
    }
    const codes = results.map(r => r.code);
    const billingIncrement = results.length > 0 ? results[0].billingIncrement : null;
    return { codes, billingIncrement };
  }

  async lookupZoneByCode(code: string): Promise<string | null> {
    const results = await db.select({ destination: azDestinations.destination })
      .from(azDestinations)
      .where(eq(azDestinations.code, code))
      .limit(1);
    return results[0]?.destination ?? null;
  }

  // Business Rules - Using PostgreSQL database
  async getBusinessRules(): Promise<BusinessRule[]> {
    return await db.select().from(businessRulesTable);
  }

  async getBusinessRule(id: string): Promise<BusinessRule | undefined> {
    const results = await db.select().from(businessRulesTable).where(eq(businessRulesTable.id, id));
    return results[0];
  }

  async createBusinessRule(rule: InsertBusinessRule): Promise<BusinessRule> {
    const result = await db.insert(businessRulesTable).values(rule).returning();
    return result[0];
  }

  async updateBusinessRule(id: string, data: Partial<InsertBusinessRule>): Promise<BusinessRule | undefined> {
    const result = await db.update(businessRulesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(businessRulesTable.id, id))
      .returning();
    return result[0];
  }

  async deleteBusinessRule(id: string): Promise<boolean> {
    const result = await db.delete(businessRulesTable).where(eq(businessRulesTable.id, id)).returning();
    return result.length > 0;
  }

  // Carrier Assignments - Using PostgreSQL database
  async getCarrierAssignment(carrierId: string): Promise<CarrierAssignment | undefined> {
    const results = await db.select().from(carrierAssignmentsTable).where(eq(carrierAssignmentsTable.carrierId, carrierId));
    return results[0];
  }

  async upsertCarrierAssignment(assignment: InsertCarrierAssignment): Promise<CarrierAssignment> {
    const existingResults = await db.select().from(carrierAssignmentsTable).where(eq(carrierAssignmentsTable.carrierId, assignment.carrierId));
    const existing = existingResults[0];
    if (existing) {
      // Only update fields that are explicitly provided
      const updateData: Partial<CarrierAssignment> = {};
      if (assignment.assignmentType !== undefined) updateData.assignmentType = assignment.assignmentType;
      if (assignment.categoryIds !== undefined) updateData.categoryIds = assignment.categoryIds;
      if (assignment.groupIds !== undefined) updateData.groupIds = assignment.groupIds;
      if (assignment.customerIds !== undefined) updateData.customerIds = assignment.customerIds;
      
      const results = await db.update(carrierAssignmentsTable)
        .set(updateData)
        .where(eq(carrierAssignmentsTable.id, existing.id))
        .returning();
      return results[0];
    }
    const id = randomUUID();
    const results = await db.insert(carrierAssignmentsTable).values({
      id,
      carrierId: assignment.carrierId,
      assignmentType: assignment.assignmentType ?? "all",
      categoryIds: assignment.categoryIds ?? null,
      groupIds: assignment.groupIds ?? null,
      customerIds: assignment.customerIds ?? null,
    }).returning();
    return results[0];
  }

  // Carrier Interconnects - Persisted to Database
  async getAllCarrierInterconnects(): Promise<CarrierInterconnect[]> {
    return await db.select().from(carrierInterconnectsTable);
  }

  async getCarrierInterconnects(carrierId: string): Promise<CarrierInterconnect[]> {
    return await db.select().from(carrierInterconnectsTable).where(eq(carrierInterconnectsTable.carrierId, carrierId));
  }

  async getCarrierInterconnect(id: string): Promise<CarrierInterconnect | undefined> {
    const results = await db.select().from(carrierInterconnectsTable).where(eq(carrierInterconnectsTable.id, id));
    return results[0];
  }

  async getCarrierInterconnectByShortCode(shortCode: string): Promise<CarrierInterconnect | undefined> {
    const results = await db.select().from(carrierInterconnectsTable).where(eq(carrierInterconnectsTable.shortCode, shortCode));
    return results[0];
  }

  async getCarrierInterconnectByShortId(shortId: number): Promise<CarrierInterconnect | undefined> {
    const results = await db.select().from(carrierInterconnectsTable).where(eq(carrierInterconnectsTable.shortId, shortId));
    return results[0];
  }

  async resolveCarrierInterconnect(identifier: string): Promise<CarrierInterconnect | undefined> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(identifier)) {
      return this.getCarrierInterconnect(identifier);
    }
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum) && identifier === String(shortIdNum)) {
      const byShortId = await this.getCarrierInterconnectByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    return this.getCarrierInterconnectByShortCode(identifier);
  }

  private async getNextInterconnectShortCode(): Promise<string> {
    const result = await db.select({ shortCode: carrierInterconnectsTable.shortCode })
      .from(carrierInterconnectsTable)
      .where(ilike(carrierInterconnectsTable.shortCode, 'I%'));
    const maxNum = result.reduce((max, r) => {
      const match = r.shortCode?.match(/^I(\d+)$/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `I${maxNum + 1}`;
  }

  async createCarrierInterconnect(interconnect: InsertCarrierInterconnect): Promise<CarrierInterconnect> {
    const shortCode = await this.getNextInterconnectShortCode();
    const results = await db.insert(carrierInterconnectsTable).values({ ...interconnect, shortCode }).returning();
    return results[0];
  }

  async updateCarrierInterconnect(id: string, data: Partial<InsertCarrierInterconnect>): Promise<CarrierInterconnect | undefined> {
    const results = await db.update(carrierInterconnectsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(carrierInterconnectsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCarrierInterconnect(id: string): Promise<boolean> {
    const results = await db.delete(carrierInterconnectsTable).where(eq(carrierInterconnectsTable.id, id)).returning();
    return results.length > 0;
  }

  // Carrier Services - THE KEY LINKAGE: Interconnect → Rating Plan + Routing Plan
  async getAllCarrierServices(): Promise<CarrierService[]> {
    return await db.select().from(carrierServicesTable);
  }

  async getCarrierServices(carrierId: string): Promise<CarrierService[]> {
    return await db.select().from(carrierServicesTable).where(eq(carrierServicesTable.carrierId, carrierId));
  }

  async getInterconnectServices(interconnectId: string): Promise<CarrierService[]> {
    return await db.select().from(carrierServicesTable).where(eq(carrierServicesTable.interconnectId, interconnectId));
  }

  async getCarrierService(id: string): Promise<CarrierService | undefined> {
    const results = await db.select().from(carrierServicesTable).where(eq(carrierServicesTable.id, id));
    return results[0];
  }

  async getCarrierServiceByShortCode(shortCode: string): Promise<CarrierService | undefined> {
    const results = await db.select().from(carrierServicesTable).where(eq(carrierServicesTable.shortCode, shortCode));
    return results[0];
  }

  async getCarrierServiceByShortId(shortId: number): Promise<CarrierService | undefined> {
    const results = await db.select().from(carrierServicesTable).where(eq(carrierServicesTable.shortId, shortId));
    return results[0];
  }

  async resolveCarrierService(identifier: string): Promise<CarrierService | undefined> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(identifier)) {
      return this.getCarrierService(identifier);
    }
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum) && identifier === String(shortIdNum)) {
      const byShortId = await this.getCarrierServiceByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    return this.getCarrierServiceByShortCode(identifier);
  }

  private async getNextServiceShortCode(): Promise<string> {
    const result = await db.select({ shortCode: carrierServicesTable.shortCode })
      .from(carrierServicesTable)
      .where(ilike(carrierServicesTable.shortCode, 'S%'));
    const maxNum = result.reduce((max, r) => {
      const match = r.shortCode?.match(/^S(\d+)$/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `S${maxNum + 1}`;
  }

  async createCarrierService(service: InsertCarrierService): Promise<CarrierService> {
    const shortCode = await this.getNextServiceShortCode();
    const results = await db.insert(carrierServicesTable).values({ ...service, shortCode }).returning();
    return results[0];
  }

  async updateCarrierService(id: string, data: Partial<InsertCarrierService>): Promise<CarrierService | undefined> {
    const results = await db.update(carrierServicesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(carrierServicesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCarrierService(id: string): Promise<boolean> {
    const results = await db.delete(carrierServicesTable).where(eq(carrierServicesTable.id, id)).returning();
    return results.length > 0;
  }

  async getSupplierInterconnects(excludeCarrierId?: string): Promise<CarrierInterconnect[]> {
    const allInterconnects = await db
      .select({
        interconnect: carrierInterconnectsTable,
        carrier: carriersTable,
      })
      .from(carrierInterconnectsTable)
      .innerJoin(carriersTable, eq(carrierInterconnectsTable.carrierId, carriersTable.id))
      .where(
        and(
          or(
            eq(carriersTable.partnerType, "supplier"),
            eq(carriersTable.partnerType, "bilateral")
          ),
          excludeCarrierId ? ne(carriersTable.id, excludeCarrierId) : undefined
        )
      );
    return allInterconnects.map(row => row.interconnect);
  }

  // Service Match Lists - Persisted to Database
  async getAllServiceMatchLists(): Promise<ServiceMatchList[]> {
    return await db.select().from(serviceMatchListsTable);
  }

  async getServiceMatchList(id: string): Promise<ServiceMatchList | undefined> {
    const results = await db.select().from(serviceMatchListsTable).where(eq(serviceMatchListsTable.id, id));
    return results[0];
  }

  async createServiceMatchList(matchList: InsertServiceMatchList): Promise<ServiceMatchList> {
    const results = await db.insert(serviceMatchListsTable).values(matchList).returning();
    return results[0];
  }

  async updateServiceMatchList(id: string, data: Partial<InsertServiceMatchList>): Promise<ServiceMatchList | undefined> {
    const results = await db.update(serviceMatchListsTable).set({ ...data, updatedAt: new Date() }).where(eq(serviceMatchListsTable.id, id)).returning();
    return results[0];
  }

  async deleteServiceMatchList(id: string): Promise<boolean> {
    const results = await db.delete(serviceMatchListsTable).where(eq(serviceMatchListsTable.id, id)).returning();
    return results.length > 0;
  }

  // Carrier Contacts - Persisted to Database
  async getCarrierContacts(carrierId: string): Promise<CarrierContact[]> {
    return await db.select().from(carrierContactsTable).where(eq(carrierContactsTable.carrierId, carrierId));
  }

  async getCarrierContact(id: string): Promise<CarrierContact | undefined> {
    const results = await db.select().from(carrierContactsTable).where(eq(carrierContactsTable.id, id));
    return results[0];
  }

  async createCarrierContact(contact: InsertCarrierContact): Promise<CarrierContact> {
    const results = await db.insert(carrierContactsTable).values(contact).returning();
    return results[0];
  }

  async updateCarrierContact(id: string, data: Partial<InsertCarrierContact>): Promise<CarrierContact | undefined> {
    const results = await db.update(carrierContactsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(carrierContactsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCarrierContact(id: string): Promise<boolean> {
    const results = await db.delete(carrierContactsTable).where(eq(carrierContactsTable.id, id)).returning();
    return results.length > 0;
  }

  // Carrier Credit Alerts - Persisted to Database
  async getCarrierCreditAlerts(carrierId: string): Promise<CarrierCreditAlert[]> {
    return await db.select().from(carrierCreditAlertsTable).where(eq(carrierCreditAlertsTable.carrierId, carrierId));
  }

  async getCarrierCreditAlert(id: string): Promise<CarrierCreditAlert | undefined> {
    const results = await db.select().from(carrierCreditAlertsTable).where(eq(carrierCreditAlertsTable.id, id));
    return results[0];
  }

  async createCarrierCreditAlert(alert: InsertCarrierCreditAlert): Promise<CarrierCreditAlert> {
    const results = await db.insert(carrierCreditAlertsTable).values(alert).returning();
    return results[0];
  }

  async updateCarrierCreditAlert(id: string, data: Partial<InsertCarrierCreditAlert>): Promise<CarrierCreditAlert | undefined> {
    const results = await db.update(carrierCreditAlertsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(carrierCreditAlertsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCarrierCreditAlert(id: string): Promise<boolean> {
    const results = await db.delete(carrierCreditAlertsTable).where(eq(carrierCreditAlertsTable.id, id)).returning();
    return results.length > 0;
  }

  // Interconnect IP Addresses - Persisted to Database
  async getInterconnectIpAddresses(interconnectId: string): Promise<InterconnectIpAddress[]> {
    return await db.select().from(interconnectIpAddressesTable).where(eq(interconnectIpAddressesTable.interconnectId, interconnectId));
  }

  async createInterconnectIpAddress(data: InsertInterconnectIpAddress): Promise<InterconnectIpAddress> {
    const results = await db.insert(interconnectIpAddressesTable).values(data).returning();
    return results[0];
  }

  async deleteInterconnectIpAddress(id: string): Promise<boolean> {
    const results = await db.delete(interconnectIpAddressesTable).where(eq(interconnectIpAddressesTable.id, id)).returning();
    return results.length > 0;
  }

  // Interconnect Validation Settings - Persisted to Database
  async getInterconnectValidationSettings(interconnectId: string): Promise<InterconnectValidationSettings | undefined> {
    const results = await db.select().from(interconnectValidationSettingsTable).where(eq(interconnectValidationSettingsTable.interconnectId, interconnectId));
    return results[0];
  }

  async upsertInterconnectValidationSettings(data: InsertInterconnectValidationSettings): Promise<InterconnectValidationSettings> {
    const existing = await this.getInterconnectValidationSettings(data.interconnectId);
    if (existing) {
      const results = await db.update(interconnectValidationSettingsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(interconnectValidationSettingsTable.interconnectId, data.interconnectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(interconnectValidationSettingsTable).values(data).returning();
      return results[0];
    }
  }

  // Interconnect Translation Settings - Persisted to Database
  async getInterconnectTranslationSettings(interconnectId: string): Promise<InterconnectTranslationSettings | undefined> {
    const results = await db.select().from(interconnectTranslationSettingsTable).where(eq(interconnectTranslationSettingsTable.interconnectId, interconnectId));
    return results[0];
  }

  async upsertInterconnectTranslationSettings(data: InsertInterconnectTranslationSettings): Promise<InterconnectTranslationSettings> {
    const existing = await this.getInterconnectTranslationSettings(data.interconnectId);
    if (existing) {
      const results = await db.update(interconnectTranslationSettingsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(interconnectTranslationSettingsTable.interconnectId, data.interconnectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(interconnectTranslationSettingsTable).values(data).returning();
      return results[0];
    }
  }

  // Interconnect Codecs - Persisted to Database
  async getInterconnectCodecs(interconnectId: string): Promise<InterconnectCodec[]> {
    return await db.select().from(interconnectCodecsTable).where(eq(interconnectCodecsTable.interconnectId, interconnectId));
  }

  async upsertInterconnectCodecs(interconnectId: string, codecs: InsertInterconnectCodec[]): Promise<InterconnectCodec[]> {
    await db.delete(interconnectCodecsTable).where(eq(interconnectCodecsTable.interconnectId, interconnectId));
    if (codecs.length === 0) return [];
    const results = await db.insert(interconnectCodecsTable).values(codecs).returning();
    return results;
  }

  // Interconnect Media Settings - Persisted to Database
  async getInterconnectMediaSettings(interconnectId: string): Promise<InterconnectMediaSettings | undefined> {
    const results = await db.select().from(interconnectMediaSettingsTable).where(eq(interconnectMediaSettingsTable.interconnectId, interconnectId));
    return results[0];
  }

  async upsertInterconnectMediaSettings(data: InsertInterconnectMediaSettings): Promise<InterconnectMediaSettings> {
    const existing = await this.getInterconnectMediaSettings(data.interconnectId);
    if (existing) {
      const results = await db.update(interconnectMediaSettingsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(interconnectMediaSettingsTable.interconnectId, data.interconnectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(interconnectMediaSettingsTable).values(data).returning();
      return results[0];
    }
  }

  // Interconnect Signalling Settings - Persisted to Database
  async getInterconnectSignallingSettings(interconnectId: string): Promise<InterconnectSignallingSettings | undefined> {
    const results = await db.select().from(interconnectSignallingSettingsTable).where(eq(interconnectSignallingSettingsTable.interconnectId, interconnectId));
    return results[0];
  }

  async upsertInterconnectSignallingSettings(data: InsertInterconnectSignallingSettings): Promise<InterconnectSignallingSettings> {
    const existing = await this.getInterconnectSignallingSettings(data.interconnectId);
    if (existing) {
      const results = await db.update(interconnectSignallingSettingsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(interconnectSignallingSettingsTable.interconnectId, data.interconnectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(interconnectSignallingSettingsTable).values(data).returning();
      return results[0];
    }
  }

  // Interconnect Monitoring Settings - Persisted to Database
  async getInterconnectMonitoringSettings(interconnectId: string): Promise<InterconnectMonitoringSettings | undefined> {
    const results = await db.select().from(interconnectMonitoringSettingsTable).where(eq(interconnectMonitoringSettingsTable.interconnectId, interconnectId));
    return results[0];
  }

  async upsertInterconnectMonitoringSettings(data: InsertInterconnectMonitoringSettings): Promise<InterconnectMonitoringSettings> {
    const existing = await this.getInterconnectMonitoringSettings(data.interconnectId);
    if (existing) {
      const results = await db.update(interconnectMonitoringSettingsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(interconnectMonitoringSettingsTable.interconnectId, data.interconnectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(interconnectMonitoringSettingsTable).values(data).returning();
      return results[0];
    }
  }

  // Audit Logs - Persisted to PostgreSQL (FOREVER POLICY)
  async getAuditLogs(tableName?: string, recordId?: string, limit?: number): Promise<AuditLog[]> {
    let query = db.select().from(auditLogsTable);
    if (tableName) {
      query = query.where(eq(auditLogsTable.tableName, tableName)) as any;
    }
    if (recordId) {
      query = query.where(eq(auditLogsTable.recordId, recordId)) as any;
    }
    let results = await query.orderBy(desc(auditLogsTable.createdAt));
    if (limit) {
      results = results.slice(0, limit);
    }
    return results;
  }

  async createAuditLog(log: { userId?: string; action: string; tableName?: string; recordId?: string; oldValues?: unknown; newValues?: unknown; ipAddress?: string; }): Promise<AuditLog> {
    const results = await db.insert(auditLogsTable).values({
      userId: log.userId ?? null,
      action: log.action,
      tableName: log.tableName ?? null,
      recordId: log.recordId ?? null,
      oldValues: log.oldValues ?? null,
      newValues: log.newValues ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: null,
    }).returning();
    return results[0];
  }

  // Routes - Persisted to PostgreSQL (FOREVER POLICY)
  async getRoutes(): Promise<Route[]> {
    return await db.select().from(routesTable);
  }

  async getRoute(id: string): Promise<Route | undefined> {
    const results = await db.select().from(routesTable).where(eq(routesTable.id, id));
    return results[0];
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const results = await db.insert(routesTable).values(route).returning();
    return results[0];
  }

  async updateRoute(id: string, data: Partial<InsertRoute>): Promise<Route | undefined> {
    const results = await db.update(routesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(routesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteRoute(id: string): Promise<boolean> {
    const results = await db.delete(routesTable).where(eq(routesTable.id, id)).returning();
    return results.length > 0;
  }

  // Monitoring Rules - Persisted to PostgreSQL (FOREVER POLICY)
  async getMonitoringRules(): Promise<MonitoringRule[]> {
    return await db.select().from(monitoringRulesTable);
  }

  async getMonitoringRule(id: string): Promise<MonitoringRule | undefined> {
    const results = await db.select().from(monitoringRulesTable).where(eq(monitoringRulesTable.id, id));
    return results[0];
  }

  async createMonitoringRule(rule: InsertMonitoringRule): Promise<MonitoringRule> {
    const results = await db.insert(monitoringRulesTable).values(rule).returning();
    return results[0];
  }

  async updateMonitoringRule(id: string, data: Partial<InsertMonitoringRule>): Promise<MonitoringRule | undefined> {
    const results = await db.update(monitoringRulesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(monitoringRulesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteMonitoringRule(id: string): Promise<boolean> {
    const results = await db.delete(monitoringRulesTable).where(eq(monitoringRulesTable.id, id)).returning();
    return results.length > 0;
  }

  // Alerts - Persisted to PostgreSQL (FOREVER POLICY)
  async getAlerts(status?: string): Promise<Alert[]> {
    if (status) {
      return await db.select().from(alertsTable).where(eq(alertsTable.status, status as any));
    }
    return await db.select().from(alertsTable);
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    const results = await db.select().from(alertsTable).where(eq(alertsTable.id, id));
    return results[0];
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const results = await db.insert(alertsTable).values(alert).returning();
    return results[0];
  }

  async updateAlert(id: string, data: Partial<InsertAlert>): Promise<Alert | undefined> {
    const results = await db.update(alertsTable)
      .set(data)
      .where(eq(alertsTable.id, id))
      .returning();
    return results[0];
  }

  // DID Countries - Persisted to PostgreSQL (FOREVER POLICY)
  async getDidCountries(): Promise<DidCountry[]> {
    const results = await db.select().from(didCountriesTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getDidCountry(id: string): Promise<DidCountry | undefined> {
    const results = await db.select().from(didCountriesTable).where(eq(didCountriesTable.id, id));
    return results[0];
  }

  async createDidCountry(country: InsertDidCountry): Promise<DidCountry> {
    const results = await db.insert(didCountriesTable).values(country).returning();
    return results[0];
  }

  async updateDidCountry(id: string, data: Partial<InsertDidCountry>): Promise<DidCountry | undefined> {
    const results = await db.update(didCountriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(didCountriesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteDidCountry(id: string): Promise<boolean> {
    const results = await db.delete(didCountriesTable).where(eq(didCountriesTable.id, id)).returning();
    return results.length > 0;
  }

  // DID Providers - Persisted to PostgreSQL (FOREVER POLICY)
  async getDidProviders(): Promise<DidProvider[]> {
    return await db.select().from(didProvidersTable);
  }

  async getDidProvider(id: string): Promise<DidProvider | undefined> {
    const results = await db.select().from(didProvidersTable).where(eq(didProvidersTable.id, id));
    return results[0];
  }

  async createDidProvider(provider: InsertDidProvider): Promise<DidProvider> {
    const results = await db.insert(didProvidersTable).values(provider).returning();
    return results[0];
  }

  async updateDidProvider(id: string, data: Partial<InsertDidProvider>): Promise<DidProvider | undefined> {
    const results = await db.update(didProvidersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(didProvidersTable.id, id))
      .returning();
    return results[0];
  }

  async deleteDidProvider(id: string): Promise<boolean> {
    const results = await db.delete(didProvidersTable).where(eq(didProvidersTable.id, id)).returning();
    return results.length > 0;
  }

  // DIDs - Persisted to PostgreSQL (FOREVER POLICY)
  async getDids(customerId?: string): Promise<Did[]> {
    if (customerId) {
      return await db.select().from(didsTable).where(eq(didsTable.customerId, customerId));
    }
    return await db.select().from(didsTable);
  }

  async getDid(id: string): Promise<Did | undefined> {
    const results = await db.select().from(didsTable).where(eq(didsTable.id, id));
    return results[0];
  }

  async createDid(did: InsertDid): Promise<Did> {
    const results = await db.insert(didsTable).values(did).returning();
    return results[0];
  }

  async updateDid(id: string, data: Partial<InsertDid>): Promise<Did | undefined> {
    const results = await db.update(didsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(didsTable.id, id))
      .returning();
    return results[0];
  }

  // SIP Trunks - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTrunks(customerId: string): Promise<SipTrunk[]> {
    return await db.select().from(sipTrunksTable).where(eq(sipTrunksTable.customerId, customerId));
  }

  async getSipTrunk(id: string): Promise<SipTrunk | undefined> {
    const results = await db.select().from(sipTrunksTable).where(eq(sipTrunksTable.id, id));
    return results[0];
  }

  async createSipTrunk(trunk: InsertSipTrunk): Promise<SipTrunk> {
    const results = await db.insert(sipTrunksTable).values(trunk).returning();
    return results[0];
  }

  async updateSipTrunk(id: string, data: Partial<InsertSipTrunk>): Promise<SipTrunk | undefined> {
    const results = await db.update(sipTrunksTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sipTrunksTable.id, id))
      .returning();
    return results[0];
  }

  async deleteSipTrunk(id: string): Promise<boolean> {
    const results = await db.delete(sipTrunksTable).where(eq(sipTrunksTable.id, id)).returning();
    return results.length > 0;
  }

  // Extensions - Persisted to PostgreSQL (FOREVER POLICY)
  async getExtensions(customerId: string): Promise<Extension[]> {
    return await db.select().from(extensionsTable).where(eq(extensionsTable.customerId, customerId));
  }

  async getExtension(id: string): Promise<Extension | undefined> {
    const results = await db.select().from(extensionsTable).where(eq(extensionsTable.id, id));
    return results[0];
  }

  async createExtension(ext: InsertExtension): Promise<Extension> {
    const results = await db.insert(extensionsTable).values(ext).returning();
    return results[0];
  }

  async updateExtension(id: string, data: Partial<InsertExtension>): Promise<Extension | undefined> {
    const results = await db.update(extensionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(extensionsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteExtension(id: string): Promise<boolean> {
    const results = await db.delete(extensionsTable).where(eq(extensionsTable.id, id)).returning();
    return results.length > 0;
  }

  // IVRs - Persisted to PostgreSQL (FOREVER POLICY)
  async getIvrs(customerId: string): Promise<Ivr[]> {
    return await db.select().from(ivrsTable).where(eq(ivrsTable.customerId, customerId));
  }

  async getIvr(id: string): Promise<Ivr | undefined> {
    const results = await db.select().from(ivrsTable).where(eq(ivrsTable.id, id));
    return results[0];
  }

  async createIvr(ivr: InsertIvr): Promise<Ivr> {
    const results = await db.insert(ivrsTable).values(ivr).returning();
    return results[0];
  }

  async updateIvr(id: string, data: Partial<InsertIvr>): Promise<Ivr | undefined> {
    const results = await db.update(ivrsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ivrsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteIvr(id: string): Promise<boolean> {
    const results = await db.delete(ivrsTable).where(eq(ivrsTable.id, id)).returning();
    return results.length > 0;
  }

  // Ring Groups - Persisted to PostgreSQL (FOREVER POLICY)
  async getRingGroups(customerId: string): Promise<RingGroup[]> {
    return await db.select().from(ringGroupsTable).where(eq(ringGroupsTable.customerId, customerId));
  }

  async getRingGroup(id: string): Promise<RingGroup | undefined> {
    const results = await db.select().from(ringGroupsTable).where(eq(ringGroupsTable.id, id));
    return results[0];
  }

  async createRingGroup(rg: InsertRingGroup): Promise<RingGroup> {
    const results = await db.insert(ringGroupsTable).values(rg).returning();
    return results[0];
  }

  async updateRingGroup(id: string, data: Partial<InsertRingGroup>): Promise<RingGroup | undefined> {
    const results = await db.update(ringGroupsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ringGroupsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteRingGroup(id: string): Promise<boolean> {
    const results = await db.delete(ringGroupsTable).where(eq(ringGroupsTable.id, id)).returning();
    return results.length > 0;
  }

  // Queues - Persisted to PostgreSQL (FOREVER POLICY)
  async getQueues(customerId: string): Promise<Queue[]> {
    return await db.select().from(queuesTable).where(eq(queuesTable.customerId, customerId));
  }

  async getQueue(id: string): Promise<Queue | undefined> {
    const results = await db.select().from(queuesTable).where(eq(queuesTable.id, id));
    return results[0];
  }

  async createQueue(queue: InsertQueue): Promise<Queue> {
    const results = await db.insert(queuesTable).values(queue).returning();
    return results[0];
  }

  async updateQueue(id: string, data: Partial<InsertQueue>): Promise<Queue | undefined> {
    const results = await db.update(queuesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(queuesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteQueue(id: string): Promise<boolean> {
    const results = await db.delete(queuesTable).where(eq(queuesTable.id, id)).returning();
    return results.length > 0;
  }

  // Tickets - Persisted to PostgreSQL (FOREVER POLICY)
  async getTickets(customerId?: string): Promise<Ticket[]> {
    if (customerId) {
      return await db.select().from(ticketsTable).where(eq(ticketsTable.customerId, customerId));
    }
    return await db.select().from(ticketsTable);
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const results = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id));
    return results[0];
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const ticketNumber = `TKT${Date.now().toString(36).toUpperCase()}`;
    const results = await db.insert(ticketsTable).values({ ...ticket, ticketNumber }).returning();
    return results[0];
  }

  async updateTicket(id: string, data: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const results = await db.update(ticketsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ticketsTable.id, id))
      .returning();
    return results[0];
  }

  // Ticket Replies - Persisted to PostgreSQL (FOREVER POLICY)
  async getTicketReplies(ticketId: string): Promise<TicketReply[]> {
    const results = await db.select().from(ticketRepliesTable).where(eq(ticketRepliesTable.ticketId, ticketId));
    return results.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    const results = await db.insert(ticketRepliesTable).values(reply).returning();
    return results[0];
  }

  // Invoices - Persisted to PostgreSQL (FOREVER POLICY)
  async getInvoices(customerId?: string): Promise<Invoice[]> {
    if (customerId) {
      return await db.select().from(invoicesTable).where(eq(invoicesTable.customerId, customerId));
    }
    return await db.select().from(invoicesTable);
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const results = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
    return results[0];
  }

  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    const invoiceNumber = invoice.invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}`;
    const results = await db.insert(invoicesTable).values({ ...invoice as any, invoiceNumber }).returning();
    return results[0];
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined> {
    const results = await db.update(invoicesTable)
      .set(data)
      .where(eq(invoicesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const results = await db.delete(invoicesTable).where(eq(invoicesTable.id, id)).returning();
    return results.length > 0;
  }

  // Payments - Persisted to PostgreSQL (FOREVER POLICY)
  async getPayments(customerId?: string): Promise<Payment[]> {
    if (customerId) {
      return await db.select().from(paymentsTable).where(eq(paymentsTable.customerId, customerId));
    }
    return await db.select().from(paymentsTable);
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const results = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
    return results[0];
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const results = await db.insert(paymentsTable).values(payment).returning();
    return results[0];
  }

  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const results = await db.update(paymentsTable)
      .set(data)
      .where(eq(paymentsTable.id, id))
      .returning();
    return results[0];
  }

  async deletePayment(id: string): Promise<boolean> {
    const results = await db.delete(paymentsTable).where(eq(paymentsTable.id, id)).returning();
    return results.length > 0;
  }

  // Promo Codes - Persisted to PostgreSQL (FOREVER POLICY)
  async getPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodesTable);
  }

  async getPromoCode(id: string): Promise<PromoCode | undefined> {
    const results = await db.select().from(promoCodesTable).where(eq(promoCodesTable.id, id));
    return results[0];
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const results = await db.select().from(promoCodesTable).where(eq(promoCodesTable.code, code));
    return results[0];
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const results = await db.insert(promoCodesTable).values(promoCode).returning();
    return results[0];
  }

  async updatePromoCode(id: string, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const results = await db.update(promoCodesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promoCodesTable.id, id))
      .returning();
    return results[0];
  }

  async deletePromoCode(id: string): Promise<boolean> {
    const results = await db.delete(promoCodesTable).where(eq(promoCodesTable.id, id)).returning();
    return results.length > 0;
  }

  // Referrals - Persisted to PostgreSQL (FOREVER POLICY)
  async getReferrals(referrerId?: string): Promise<Referral[]> {
    if (referrerId) {
      return await db.select().from(referralsTable).where(eq(referralsTable.referrerId, referrerId));
    }
    return await db.select().from(referralsTable);
  }

  async getReferral(id: string): Promise<Referral | undefined> {
    const results = await db.select().from(referralsTable).where(eq(referralsTable.id, id));
    return results[0];
  }

  async createReferral(referral: Partial<Referral>): Promise<Referral> {
    const referralCode = referral.referralCode || `REF${randomUUID().slice(0, 8).toUpperCase()}`;
    const results = await db.insert(referralsTable).values({ ...referral as any, referralCode }).returning();
    return results[0];
  }

  async updateReferral(id: string, data: Partial<Referral>): Promise<Referral | undefined> {
    const results = await db.update(referralsTable)
      .set(data)
      .where(eq(referralsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteReferral(id: string): Promise<boolean> {
    const results = await db.delete(referralsTable).where(eq(referralsTable.id, id)).returning();
    return results.length > 0;
  }

  // Bonus Types - Persisted to PostgreSQL (FOREVER POLICY)
  async getBonusTypes(): Promise<BonusType[]> {
    return await db.select().from(bonusTypesTable);
  }
  async getBonusType(id: string): Promise<BonusType | undefined> {
    const results = await db.select().from(bonusTypesTable).where(eq(bonusTypesTable.id, id));
    return results[0];
  }
  async createBonusType(bonusType: InsertBonusType): Promise<BonusType> {
    const results = await db.insert(bonusTypesTable).values(bonusType).returning();
    return results[0];
  }
  async updateBonusType(id: string, data: Partial<InsertBonusType>): Promise<BonusType | undefined> {
    const results = await db.update(bonusTypesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bonusTypesTable.id, id))
      .returning();
    return results[0];
  }
  async deleteBonusType(id: string): Promise<boolean> {
    const results = await db.delete(bonusTypesTable).where(eq(bonusTypesTable.id, id)).returning();
    return results.length > 0;
  }

  // Email Templates - Persisted to PostgreSQL (FOREVER POLICY)
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplatesTable);
  }
  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const results = await db.select().from(emailTemplatesTable).where(eq(emailTemplatesTable.id, id));
    return results[0];
  }
  async getEmailTemplateBySlug(slug: string): Promise<EmailTemplate | undefined> {
    const results = await db.select().from(emailTemplatesTable).where(eq(emailTemplatesTable.slug, slug));
    return results[0];
  }
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const results = await db.insert(emailTemplatesTable).values(template).returning();
    return results[0];
  }
  async updateEmailTemplate(id: string, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const results = await db.update(emailTemplatesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(emailTemplatesTable.id, id))
      .returning();
    return results[0];
  }
  async deleteEmailTemplate(id: string): Promise<boolean> {
    const results = await db.delete(emailTemplatesTable).where(eq(emailTemplatesTable.id, id)).returning();
    return results.length > 0;
  }

  // Email Logs - Persisted to PostgreSQL (FOREVER POLICY)
  async getEmailLogs(): Promise<EmailLog[]> {
    return await db.select().from(emailLogsTable).orderBy(desc(emailLogsTable.createdAt));
  }
  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const results = await db.insert(emailLogsTable).values(log).returning();
    return results[0];
  }

  // File Templates
  async getFileTemplates(): Promise<FileTemplate[]> {
    return db.select().from(fileTemplates).orderBy(fileTemplates.name);
  }
  async getFileTemplate(id: string): Promise<FileTemplate | undefined> {
    const [template] = await db.select().from(fileTemplates).where(eq(fileTemplates.id, id));
    return template;
  }
  async createFileTemplate(template: InsertFileTemplate): Promise<FileTemplate> {
    const [created] = await db.insert(fileTemplates).values(template).returning();
    return created;
  }
  async updateFileTemplate(id: string, data: Partial<InsertFileTemplate>): Promise<FileTemplate | undefined> {
    const [updated] = await db
      .update(fileTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fileTemplates.id, id))
      .returning();
    return updated;
  }
  async deleteFileTemplate(id: string): Promise<boolean> {
    const result = await db.delete(fileTemplates).where(eq(fileTemplates.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Social Accounts - Persisted to PostgreSQL (FOREVER POLICY)
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return await db.select().from(socialAccountsTable);
  }
  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    const results = await db.select().from(socialAccountsTable).where(eq(socialAccountsTable.id, id));
    return results[0];
  }
  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const results = await db.insert(socialAccountsTable).values(account).returning();
    return results[0];
  }
  async updateSocialAccount(id: string, data: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const results = await db.update(socialAccountsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(socialAccountsTable.id, id))
      .returning();
    return results[0];
  }
  async deleteSocialAccount(id: string): Promise<boolean> {
    const results = await db.delete(socialAccountsTable).where(eq(socialAccountsTable.id, id)).returning();
    return results.length > 0;
  }

  // Social Posts - Persisted to PostgreSQL (FOREVER POLICY)
  async getSocialPosts(): Promise<SocialPost[]> {
    return await db.select().from(socialPostsTable);
  }
  async getSocialPost(id: string): Promise<SocialPost | undefined> {
    const results = await db.select().from(socialPostsTable).where(eq(socialPostsTable.id, id));
    return results[0];
  }
  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const results = await db.insert(socialPostsTable).values(post).returning();
    return results[0];
  }
  async updateSocialPost(id: string, data: Partial<InsertSocialPost>): Promise<SocialPost | undefined> {
    const results = await db.update(socialPostsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(socialPostsTable.id, id))
      .returning();
    return results[0];
  }
  async deleteSocialPost(id: string): Promise<boolean> {
    const results = await db.delete(socialPostsTable).where(eq(socialPostsTable.id, id)).returning();
    return results.length > 0;
  }

  // Rate Cards - Persisted to PostgreSQL (FOREVER POLICY)
  async getRateCards(type?: string): Promise<RateCard[]> {
    if (type) {
      return await db.select().from(rateCardsTable).where(eq(rateCardsTable.type, type as any));
    }
    return await db.select().from(rateCardsTable);
  }

  async getRateCard(id: string): Promise<RateCard | undefined> {
    const results = await db.select().from(rateCardsTable).where(eq(rateCardsTable.id, id));
    return results[0];
  }

  async createRateCard(card: InsertRateCard): Promise<RateCard> {
    const results = await db.insert(rateCardsTable).values(card).returning();
    return results[0];
  }

  async updateRateCard(id: string, data: Partial<InsertRateCard>): Promise<RateCard | undefined> {
    const results = await db.update(rateCardsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rateCardsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteRateCard(id: string): Promise<boolean> {
    // Also delete associated rates
    await db.delete(rateCardRatesTable).where(eq(rateCardRatesTable.rateCardId, id));
    const results = await db.delete(rateCardsTable).where(eq(rateCardsTable.id, id)).returning();
    return results.length > 0;
  }

  // Rate Card Rates - Persisted to PostgreSQL (FOREVER POLICY)
  async getRateCardRates(rateCardId: string): Promise<RateCardRate[]> {
    return await db.select().from(rateCardRatesTable).where(eq(rateCardRatesTable.rateCardId, rateCardId));
  }

  async createRateCardRate(rate: InsertRateCardRate): Promise<RateCardRate> {
    const results = await db.insert(rateCardRatesTable).values(rate).returning();
    return results[0];
  }

  async createRateCardRatesBulk(rates: InsertRateCardRate[]): Promise<RateCardRate[]> {
    if (rates.length === 0) return [];
    const results = await db.insert(rateCardRatesTable).values(rates).returning();
    return results;
  }

  async deleteRateCardRates(rateCardId: string): Promise<boolean> {
    await db.delete(rateCardRatesTable).where(eq(rateCardRatesTable.rateCardId, rateCardId));
    return true;
  }

  // Dashboard Stats
  async getCategoryStats(): Promise<{ categoryId: string; customerCount: number; revenue: number }[]> {
    const stats: Map<string, { customerCount: number; revenue: number }> = new Map();
    const customerArray = await db.select().from(customersTable);
    for (const customer of customerArray) {
      if (customer.categoryId) {
        const existing = stats.get(customer.categoryId) || { customerCount: 0, revenue: 0 };
        existing.customerCount++;
        stats.set(customer.categoryId, existing);
      }
    }
    return Array.from(stats.entries()).map(([categoryId, data]) => ({ categoryId, ...data }));
  }

  // Currencies - Persisted to PostgreSQL (FOREVER POLICY)
  async getCurrencies(): Promise<Currency[]> {
    return await db.select().from(currenciesTable);
  }

  async getCurrency(id: string): Promise<Currency | undefined> {
    const results = await db.select().from(currenciesTable).where(eq(currenciesTable.id, id));
    return results[0];
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const results = await db.insert(currenciesTable).values(currency).returning();
    return results[0];
  }

  async updateCurrency(id: string, data: Partial<InsertCurrency>): Promise<Currency | undefined> {
    const results = await db.update(currenciesTable)
      .set(data)
      .where(eq(currenciesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCurrency(id: string): Promise<boolean> {
    const results = await db.delete(currenciesTable).where(eq(currenciesTable.id, id)).returning();
    return results.length > 0;
  }

  // FX Rates - Persisted to PostgreSQL (FOREVER POLICY)
  async getFxRates(quoteCurrency?: string): Promise<FxRate[]> {
    if (quoteCurrency) {
      return await db.select().from(fxRatesTable).where(eq(fxRatesTable.quoteCurrency, quoteCurrency));
    }
    return await db.select().from(fxRatesTable);
  }

  async getLatestFxRate(quoteCurrency: string): Promise<FxRate | undefined> {
    const rates = await db.select().from(fxRatesTable).where(eq(fxRatesTable.quoteCurrency, quoteCurrency));
    const sorted = rates.sort((a, b) => (b.effectiveAt?.getTime() || 0) - (a.effectiveAt?.getTime() || 0));
    return sorted[0];
  }

  async createFxRate(rate: InsertFxRate): Promise<FxRate> {
    const results = await db.insert(fxRatesTable).values(rate).returning();
    return results[0];
  }

  // SIP Test Configs - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestConfigs(customerId?: string): Promise<SipTestConfig[]> {
    if (customerId) {
      return await db.select().from(sipTestConfigsTable).where(eq(sipTestConfigsTable.customerId, customerId));
    }
    return await db.select().from(sipTestConfigsTable);
  }

  async getSharedSipTestConfigs(): Promise<SipTestConfig[]> {
    return await db.select().from(sipTestConfigsTable).where(eq(sipTestConfigsTable.isShared, true));
  }

  async getSipTestConfig(id: string): Promise<SipTestConfig | undefined> {
    const results = await db.select().from(sipTestConfigsTable).where(eq(sipTestConfigsTable.id, id));
    return results[0];
  }

  async createSipTestConfig(config: InsertSipTestConfig): Promise<SipTestConfig> {
    const results = await db.insert(sipTestConfigsTable).values(config).returning();
    return results[0];
  }

  async updateSipTestConfig(id: string, data: Partial<InsertSipTestConfig>): Promise<SipTestConfig | undefined> {
    const results = await db.update(sipTestConfigsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sipTestConfigsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteSipTestConfig(id: string): Promise<boolean> {
    const results = await db.delete(sipTestConfigsTable).where(eq(sipTestConfigsTable.id, id)).returning();
    return results.length > 0;
  }

  // SIP Test Results - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestResults(configId?: string): Promise<SipTestResult[]> {
    if (configId) {
      return await db.select().from(sipTestResultsTable).where(eq(sipTestResultsTable.configId, configId));
    }
    return await db.select().from(sipTestResultsTable);
  }

  async getSipTestResult(id: string): Promise<SipTestResult | undefined> {
    const results = await db.select().from(sipTestResultsTable).where(eq(sipTestResultsTable.id, id));
    return results[0];
  }

  async createSipTestResult(result: InsertSipTestResult): Promise<SipTestResult> {
    const results = await db.insert(sipTestResultsTable).values(result).returning();
    return results[0];
  }

  // SIP Test Schedules - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestSchedules(configId?: string): Promise<SipTestSchedule[]> {
    if (configId) {
      return await db.select().from(sipTestSchedulesTable).where(eq(sipTestSchedulesTable.configId, configId));
    }
    return await db.select().from(sipTestSchedulesTable);
  }

  async getSipTestSchedule(id: string): Promise<SipTestSchedule | undefined> {
    const results = await db.select().from(sipTestSchedulesTable).where(eq(sipTestSchedulesTable.id, id));
    return results[0];
  }

  async createSipTestSchedule(schedule: InsertSipTestSchedule): Promise<SipTestSchedule> {
    const results = await db.insert(sipTestSchedulesTable).values(schedule).returning();
    return results[0];
  }

  async updateSipTestSchedule(id: string, data: Partial<InsertSipTestSchedule>): Promise<SipTestSchedule | undefined> {
    const results = await db.update(sipTestSchedulesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sipTestSchedulesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteSipTestSchedule(id: string): Promise<boolean> {
    const results = await db.delete(sipTestSchedulesTable).where(eq(sipTestSchedulesTable.id, id)).returning();
    return results.length > 0;
  }

  // SIP Test Audio Files - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestAudioFiles(): Promise<SipTestAudioFile[]> {
    return await db.select().from(sipTestAudioFilesTable);
  }

  async getSipTestAudioFile(id: string): Promise<SipTestAudioFile | undefined> {
    const results = await db.select().from(sipTestAudioFilesTable).where(eq(sipTestAudioFilesTable.id, id));
    return results[0];
  }

  async createSipTestAudioFile(file: InsertSipTestAudioFile): Promise<SipTestAudioFile> {
    const results = await db.insert(sipTestAudioFilesTable).values(file).returning();
    return results[0];
  }

  async updateSipTestAudioFile(id: string, data: Partial<InsertSipTestAudioFile>): Promise<SipTestAudioFile | undefined> {
    const results = await db.update(sipTestAudioFilesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sipTestAudioFilesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteSipTestAudioFile(id: string): Promise<boolean> {
    const results = await db.delete(sipTestAudioFilesTable).where(eq(sipTestAudioFilesTable.id, id)).returning();
    return results.length > 0;
  }

  // SIP Test Numbers (Crowdsourced) - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestNumbers(countryCode?: string): Promise<SipTestNumber[]> {
    if (countryCode) {
      return await db.select().from(sipTestNumbersTable).where(eq(sipTestNumbersTable.countryCode, countryCode));
    }
    return await db.select().from(sipTestNumbersTable);
  }

  async getSipTestNumber(id: string): Promise<SipTestNumber | undefined> {
    const results = await db.select().from(sipTestNumbersTable).where(eq(sipTestNumbersTable.id, id));
    return results[0];
  }

  async createSipTestNumber(number: InsertSipTestNumber): Promise<SipTestNumber> {
    const results = await db.insert(sipTestNumbersTable).values(number).returning();
    return results[0];
  }

  async updateSipTestNumber(id: string, data: Partial<InsertSipTestNumber>): Promise<SipTestNumber | undefined> {
    const results = await db.update(sipTestNumbersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sipTestNumbersTable.id, id))
      .returning();
    return results[0];
  }

  async deleteSipTestNumber(id: string): Promise<boolean> {
    const results = await db.delete(sipTestNumbersTable).where(eq(sipTestNumbersTable.id, id)).returning();
    return results.length > 0;
  }

  // SIP Test Profiles - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestProfiles(customerId?: string): Promise<SipTestProfile[]> {
    if (customerId) {
      return await db.select().from(sipTestProfilesTable).where(eq(sipTestProfilesTable.customerId, customerId));
    }
    return await db.select().from(sipTestProfilesTable);
  }

  async createSipTestProfile(profile: InsertSipTestProfile): Promise<SipTestProfile> {
    const results = await db.insert(sipTestProfilesTable).values(profile).returning();
    return results[0];
  }

  async deleteSipTestProfile(id: string): Promise<boolean> {
    const results = await db.delete(sipTestProfilesTable).where(eq(sipTestProfilesTable.id, id)).returning();
    return results.length > 0;
  }

  // SIP Test Suppliers - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestSuppliers(customerId?: string): Promise<SipTestSupplier[]> {
    if (customerId) {
      return await db.select().from(sipTestSuppliersTable).where(eq(sipTestSuppliersTable.customerId, customerId));
    }
    return await db.select().from(sipTestSuppliersTable);
  }

  async createSipTestSupplier(supplier: InsertSipTestSupplier): Promise<SipTestSupplier> {
    const results = await db.insert(sipTestSuppliersTable).values(supplier).returning();
    return results[0];
  }

  async deleteSipTestSupplier(id: string): Promise<boolean> {
    const results = await db.delete(sipTestSuppliersTable).where(eq(sipTestSuppliersTable.id, id)).returning();
    return results.length > 0;
  }

  // SIP Test Settings - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestSettings(customerId?: string): Promise<SipTestSettings | undefined> {
    if (!customerId) return undefined;
    const results = await db.select().from(sipTestSettingsTable).where(eq(sipTestSettingsTable.customerId, customerId));
    return results[0];
  }

  async upsertSipTestSettings(settings: InsertSipTestSettings): Promise<SipTestSettings> {
    if (settings.customerId) {
      const existing = await this.getSipTestSettings(settings.customerId);
      if (existing) {
        const results = await db.update(sipTestSettingsTable)
          .set({ ...settings, updatedAt: new Date() })
          .where(eq(sipTestSettingsTable.customerId, settings.customerId))
          .returning();
        return results[0];
      }
    }
    const results = await db.insert(sipTestSettingsTable).values(settings).returning();
    return results[0];
  }

  // SIP Test Runs (Admin) - Persisted to PostgreSQL (FOREVER POLICY)
  async getAllSipTestRuns(): Promise<SipTestRun[]> {
    return await db.select().from(sipTestRunsTable).orderBy(desc(sipTestRunsTable.createdAt));
  }

  // SIP Test Runs - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestRuns(customerId: string): Promise<SipTestRun[]> {
    return await db.select().from(sipTestRunsTable).where(eq(sipTestRunsTable.customerId, customerId));
  }

  async getSipTestRun(id: string): Promise<SipTestRun | undefined> {
    const results = await db.select().from(sipTestRunsTable).where(eq(sipTestRunsTable.id, id));
    return results[0];
  }

  async createSipTestRun(run: InsertSipTestRun): Promise<SipTestRun> {
    const results = await db.insert(sipTestRunsTable).values(run).returning();
    return results[0];
  }

  async updateSipTestRun(id: string, data: Partial<InsertSipTestRun>): Promise<SipTestRun | undefined> {
    const results = await db.update(sipTestRunsTable)
      .set(data)
      .where(eq(sipTestRunsTable.id, id))
      .returning();
    return results[0];
  }

  // SIP Test Run Results - Persisted to PostgreSQL (FOREVER POLICY)
  async getSipTestRunResults(testRunId: string): Promise<SipTestRunResult[]> {
    return await db.select().from(sipTestRunResultsTable).where(eq(sipTestRunResultsTable.testRunId, testRunId));
  }

  async createSipTestRunResult(result: InsertSipTestRunResult): Promise<SipTestRunResult> {
    const results = await db.insert(sipTestRunResultsTable).values(result).returning();
    return results[0];
  }

  // Webhooks - Persisted to PostgreSQL (FOREVER POLICY)
  async getWebhooks(customerId: string): Promise<Webhook[]> {
    return await db.select().from(webhooksTable).where(eq(webhooksTable.customerId, customerId));
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    const results = await db.select().from(webhooksTable).where(eq(webhooksTable.id, id));
    return results[0];
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const results = await db.insert(webhooksTable).values(webhook).returning();
    return results[0];
  }

  async updateWebhook(id: string, data: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const results = await db.update(webhooksTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(webhooksTable.id, id))
      .returning();
    return results[0];
  }

  async deleteWebhook(id: string): Promise<boolean> {
    const results = await db.delete(webhooksTable).where(eq(webhooksTable.id, id)).returning();
    return results.length > 0;
  }

  // Webhook Deliveries - Persisted to PostgreSQL (FOREVER POLICY)
  async getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return await db.select().from(webhookDeliveriesTable)
      .where(eq(webhookDeliveriesTable.webhookId, webhookId))
      .orderBy(desc(webhookDeliveriesTable.createdAt));
  }

  async createWebhookDelivery(delivery: InsertWebhookDelivery): Promise<WebhookDelivery> {
    const results = await db.insert(webhookDeliveriesTable).values(delivery).returning();
    return results[0];
  }

  async updateWebhookDelivery(id: string, data: Partial<InsertWebhookDelivery>): Promise<WebhookDelivery | undefined> {
    const results = await db.update(webhookDeliveriesTable)
      .set(data)
      .where(eq(webhookDeliveriesTable.id, id))
      .returning();
    return results[0];
  }

  // Customer API Keys - Persisted to PostgreSQL (FOREVER POLICY)
  async getCustomerApiKeys(customerId: string): Promise<CustomerApiKey[]> {
    return await db.select().from(customerApiKeysTable).where(eq(customerApiKeysTable.customerId, customerId));
  }

  async getCustomerApiKey(id: string): Promise<CustomerApiKey | undefined> {
    const results = await db.select().from(customerApiKeysTable).where(eq(customerApiKeysTable.id, id));
    return results[0];
  }

  async createCustomerApiKey(apiKey: InsertCustomerApiKey): Promise<CustomerApiKey> {
    const results = await db.insert(customerApiKeysTable).values(apiKey).returning();
    return results[0];
  }

  async updateCustomerApiKey(id: string, data: Partial<InsertCustomerApiKey>): Promise<CustomerApiKey | undefined> {
    const results = await db.update(customerApiKeysTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerApiKeysTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCustomerApiKey(id: string): Promise<boolean> {
    const results = await db.delete(customerApiKeysTable).where(eq(customerApiKeysTable.id, id)).returning();
    return results.length > 0;
  }

  // Class 4 Customers - Persisted to PostgreSQL (FOREVER POLICY)
  async getClass4Customers(parentCustomerId: string): Promise<Class4Customer[]> {
    return await db.select().from(class4CustomersTable).where(eq(class4CustomersTable.parentCustomerId, parentCustomerId));
  }

  async getClass4Customer(id: string): Promise<Class4Customer | undefined> {
    const results = await db.select().from(class4CustomersTable).where(eq(class4CustomersTable.id, id));
    return results[0];
  }

  async createClass4Customer(customer: InsertClass4Customer): Promise<Class4Customer> {
    const results = await db.insert(class4CustomersTable).values(customer).returning();
    return results[0];
  }

  async updateClass4Customer(id: string, data: Partial<InsertClass4Customer>): Promise<Class4Customer | undefined> {
    const results = await db.update(class4CustomersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(class4CustomersTable.id, id))
      .returning();
    return results[0];
  }

  // Class 4 Carriers - Persisted to PostgreSQL (FOREVER POLICY)
  async getClass4Carriers(parentCustomerId: string): Promise<Class4Carrier[]> {
    return await db.select().from(class4CarriersTable).where(eq(class4CarriersTable.parentCustomerId, parentCustomerId));
  }

  async getClass4Carrier(id: string): Promise<Class4Carrier | undefined> {
    const results = await db.select().from(class4CarriersTable).where(eq(class4CarriersTable.id, id));
    return results[0];
  }

  async createClass4Carrier(carrier: InsertClass4Carrier): Promise<Class4Carrier> {
    const results = await db.insert(class4CarriersTable).values(carrier).returning();
    return results[0];
  }

  async updateClass4Carrier(id: string, data: Partial<InsertClass4Carrier>): Promise<Class4Carrier | undefined> {
    const results = await db.update(class4CarriersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(class4CarriersTable.id, id))
      .returning();
    return results[0];
  }

  // Class 4 Provider Rate Cards - Persisted to PostgreSQL (FOREVER POLICY)
  async getClass4ProviderRateCards(carrierId?: string): Promise<Class4ProviderRateCard[]> {
    if (carrierId) {
      return await db.select().from(class4ProviderRateCardsTable).where(eq(class4ProviderRateCardsTable.carrierId, carrierId));
    }
    return await db.select().from(class4ProviderRateCardsTable);
  }

  async getClass4ProviderRateCard(id: string): Promise<Class4ProviderRateCard | undefined> {
    const results = await db.select().from(class4ProviderRateCardsTable).where(eq(class4ProviderRateCardsTable.id, id));
    return results[0];
  }

  async createClass4ProviderRateCard(card: InsertClass4ProviderRateCard): Promise<Class4ProviderRateCard> {
    const results = await db.insert(class4ProviderRateCardsTable).values(card).returning();
    return results[0];
  }

  async updateClass4ProviderRateCard(id: string, data: Partial<InsertClass4ProviderRateCard>): Promise<Class4ProviderRateCard | undefined> {
    const results = await db.update(class4ProviderRateCardsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(class4ProviderRateCardsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteClass4ProviderRateCard(id: string): Promise<boolean> {
    const results = await db.delete(class4ProviderRateCardsTable).where(eq(class4ProviderRateCardsTable.id, id)).returning();
    return results.length > 0;
  }

  // Class 4 Customer Rate Cards - Persisted to PostgreSQL (FOREVER POLICY)
  async getClass4CustomerRateCards(class4CustomerId?: string): Promise<Class4CustomerRateCard[]> {
    if (class4CustomerId) {
      return await db.select().from(class4CustomerRateCardsTable).where(eq(class4CustomerRateCardsTable.class4CustomerId, class4CustomerId));
    }
    return await db.select().from(class4CustomerRateCardsTable);
  }

  async getClass4CustomerRateCard(id: string): Promise<Class4CustomerRateCard | undefined> {
    const results = await db.select().from(class4CustomerRateCardsTable).where(eq(class4CustomerRateCardsTable.id, id));
    return results[0];
  }

  async createClass4CustomerRateCard(card: InsertClass4CustomerRateCard): Promise<Class4CustomerRateCard> {
    const results = await db.insert(class4CustomerRateCardsTable).values(card).returning();
    return results[0];
  }

  async updateClass4CustomerRateCard(id: string, data: Partial<InsertClass4CustomerRateCard>): Promise<Class4CustomerRateCard | undefined> {
    const results = await db.update(class4CustomerRateCardsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(class4CustomerRateCardsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteClass4CustomerRateCard(id: string): Promise<boolean> {
    const results = await db.delete(class4CustomerRateCardsTable).where(eq(class4CustomerRateCardsTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Agents - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceAgents(customerId: string): Promise<AiVoiceAgent[]> {
    return await db.select().from(aiVoiceAgentsTable).where(eq(aiVoiceAgentsTable.customerId, customerId));
  }

  async getAllAiVoiceAgents(): Promise<AiVoiceAgent[]> {
    return await db.select().from(aiVoiceAgentsTable);
  }

  async getAiVoiceAgent(id: string): Promise<AiVoiceAgent | undefined> {
    const results = await db.select().from(aiVoiceAgentsTable).where(eq(aiVoiceAgentsTable.id, id));
    return results[0];
  }

  async createAiVoiceAgent(agent: InsertAiVoiceAgent): Promise<AiVoiceAgent> {
    const results = await db.insert(aiVoiceAgentsTable).values(agent).returning();
    return results[0];
  }

  async updateAiVoiceAgent(id: string, data: Partial<InsertAiVoiceAgent>): Promise<AiVoiceAgent | undefined> {
    const results = await db.update(aiVoiceAgentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoiceAgentsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoiceAgent(id: string): Promise<boolean> {
    const results = await db.delete(aiVoiceAgentsTable).where(eq(aiVoiceAgentsTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Flows - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceFlows(agentId: string): Promise<AiVoiceFlow[]> {
    return await db.select().from(aiVoiceFlowsTable).where(eq(aiVoiceFlowsTable.agentId, agentId));
  }

  async getAiVoiceFlow(id: string): Promise<AiVoiceFlow | undefined> {
    const results = await db.select().from(aiVoiceFlowsTable).where(eq(aiVoiceFlowsTable.id, id));
    return results[0];
  }

  async createAiVoiceFlow(flow: InsertAiVoiceFlow): Promise<AiVoiceFlow> {
    const results = await db.insert(aiVoiceFlowsTable).values(flow).returning();
    return results[0];
  }

  async updateAiVoiceFlow(id: string, data: Partial<InsertAiVoiceFlow>): Promise<AiVoiceFlow | undefined> {
    const results = await db.update(aiVoiceFlowsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoiceFlowsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoiceFlow(id: string): Promise<boolean> {
    const results = await db.delete(aiVoiceFlowsTable).where(eq(aiVoiceFlowsTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Training Data - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceTrainingData(agentId: string): Promise<AiVoiceTrainingData[]> {
    return await db.select().from(aiVoiceTrainingDataTable).where(eq(aiVoiceTrainingDataTable.agentId, agentId));
  }

  async getAiVoiceTrainingDataItem(id: string): Promise<AiVoiceTrainingData | undefined> {
    const results = await db.select().from(aiVoiceTrainingDataTable).where(eq(aiVoiceTrainingDataTable.id, id));
    return results[0];
  }

  async createAiVoiceTrainingData(data: InsertAiVoiceTrainingData): Promise<AiVoiceTrainingData> {
    const results = await db.insert(aiVoiceTrainingDataTable).values(data).returning();
    return results[0];
  }

  async updateAiVoiceTrainingData(id: string, data: Partial<InsertAiVoiceTrainingData>): Promise<AiVoiceTrainingData | undefined> {
    const results = await db.update(aiVoiceTrainingDataTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoiceTrainingDataTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoiceTrainingData(id: string): Promise<boolean> {
    const results = await db.delete(aiVoiceTrainingDataTable).where(eq(aiVoiceTrainingDataTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Campaigns - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceCampaigns(customerId: string): Promise<AiVoiceCampaign[]> {
    return await db.select().from(aiVoiceCampaignsTable).where(eq(aiVoiceCampaignsTable.customerId, customerId));
  }

  async getAiVoiceCampaign(id: string): Promise<AiVoiceCampaign | undefined> {
    const results = await db.select().from(aiVoiceCampaignsTable).where(eq(aiVoiceCampaignsTable.id, id));
    return results[0];
  }

  async createAiVoiceCampaign(campaign: InsertAiVoiceCampaign): Promise<AiVoiceCampaign> {
    const results = await db.insert(aiVoiceCampaignsTable).values(campaign).returning();
    return results[0];
  }

  async updateAiVoiceCampaign(id: string, data: Partial<InsertAiVoiceCampaign>): Promise<AiVoiceCampaign | undefined> {
    const results = await db.update(aiVoiceCampaignsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoiceCampaignsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoiceCampaign(id: string): Promise<boolean> {
    const results = await db.delete(aiVoiceCampaignsTable).where(eq(aiVoiceCampaignsTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Knowledge Bases - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceKnowledgeBases(customerId?: string): Promise<AiVoiceKnowledgeBase[]> {
    if (customerId) {
      return await db.select().from(aiVoiceKnowledgeBasesTable).where(eq(aiVoiceKnowledgeBasesTable.customerId, customerId));
    }
    return await db.select().from(aiVoiceKnowledgeBasesTable);
  }

  async getAiVoiceKnowledgeBase(id: string): Promise<AiVoiceKnowledgeBase | undefined> {
    const results = await db.select().from(aiVoiceKnowledgeBasesTable).where(eq(aiVoiceKnowledgeBasesTable.id, id));
    return results[0];
  }

  async createAiVoiceKnowledgeBase(kb: InsertAiVoiceKnowledgeBase): Promise<AiVoiceKnowledgeBase> {
    const results = await db.insert(aiVoiceKnowledgeBasesTable).values(kb).returning();
    return results[0];
  }

  async updateAiVoiceKnowledgeBase(id: string, data: Partial<InsertAiVoiceKnowledgeBase>): Promise<AiVoiceKnowledgeBase | undefined> {
    const results = await db.update(aiVoiceKnowledgeBasesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoiceKnowledgeBasesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoiceKnowledgeBase(id: string): Promise<boolean> {
    const results = await db.delete(aiVoiceKnowledgeBasesTable).where(eq(aiVoiceKnowledgeBasesTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice KB Sources - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceKbSources(knowledgeBaseId: string): Promise<AiVoiceKbSource[]> {
    return await db.select().from(aiVoiceKbSourcesTable).where(eq(aiVoiceKbSourcesTable.knowledgeBaseId, knowledgeBaseId));
  }

  async getAiVoiceKbSource(id: string): Promise<AiVoiceKbSource | undefined> {
    const results = await db.select().from(aiVoiceKbSourcesTable).where(eq(aiVoiceKbSourcesTable.id, id));
    return results[0];
  }

  async createAiVoiceKbSource(source: InsertAiVoiceKbSource): Promise<AiVoiceKbSource> {
    const results = await db.insert(aiVoiceKbSourcesTable).values(source).returning();
    return results[0];
  }

  async updateAiVoiceKbSource(id: string, data: Partial<InsertAiVoiceKbSource>): Promise<AiVoiceKbSource | undefined> {
    const results = await db.update(aiVoiceKbSourcesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoiceKbSourcesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoiceKbSource(id: string): Promise<boolean> {
    const results = await db.delete(aiVoiceKbSourcesTable).where(eq(aiVoiceKbSourcesTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Phonebooks - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoicePhonebooks(customerId: string): Promise<AiVoicePhonebook[]> {
    return await db.select().from(aiVoicePhonebooksTable).where(eq(aiVoicePhonebooksTable.customerId, customerId));
  }

  async getAiVoicePhonebook(id: string): Promise<AiVoicePhonebook | undefined> {
    const results = await db.select().from(aiVoicePhonebooksTable).where(eq(aiVoicePhonebooksTable.id, id));
    return results[0];
  }

  async createAiVoicePhonebook(phonebook: InsertAiVoicePhonebook): Promise<AiVoicePhonebook> {
    const results = await db.insert(aiVoicePhonebooksTable).values(phonebook).returning();
    return results[0];
  }

  async updateAiVoicePhonebook(id: string, data: Partial<InsertAiVoicePhonebook>): Promise<AiVoicePhonebook | undefined> {
    const results = await db.update(aiVoicePhonebooksTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoicePhonebooksTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoicePhonebook(id: string): Promise<boolean> {
    const results = await db.delete(aiVoicePhonebooksTable).where(eq(aiVoicePhonebooksTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Contacts - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceContacts(phonebookId: string): Promise<AiVoiceContact[]> {
    return await db.select().from(aiVoiceContactsTable).where(eq(aiVoiceContactsTable.phonebookId, phonebookId));
  }

  async getAiVoiceContact(id: string): Promise<AiVoiceContact | undefined> {
    const results = await db.select().from(aiVoiceContactsTable).where(eq(aiVoiceContactsTable.id, id));
    return results[0];
  }

  async createAiVoiceContact(contact: InsertAiVoiceContact): Promise<AiVoiceContact> {
    const results = await db.insert(aiVoiceContactsTable).values(contact).returning();
    return results[0];
  }

  async updateAiVoiceContact(id: string, data: Partial<InsertAiVoiceContact>): Promise<AiVoiceContact | undefined> {
    const results = await db.update(aiVoiceContactsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiVoiceContactsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteAiVoiceContact(id: string): Promise<boolean> {
    const results = await db.delete(aiVoiceContactsTable).where(eq(aiVoiceContactsTable.id, id)).returning();
    return results.length > 0;
  }

  // AI Voice Call Logs - Persisted to PostgreSQL (FOREVER POLICY)
  async getAiVoiceCallLogs(agentId?: string, campaignId?: string): Promise<AiVoiceCallLog[]> {
    if (agentId && campaignId) {
      return await db.select().from(aiVoiceCallLogsTable).where(and(eq(aiVoiceCallLogsTable.agentId, agentId), eq(aiVoiceCallLogsTable.campaignId, campaignId)));
    }
    if (agentId) {
      return await db.select().from(aiVoiceCallLogsTable).where(eq(aiVoiceCallLogsTable.agentId, agentId));
    }
    if (campaignId) {
      return await db.select().from(aiVoiceCallLogsTable).where(eq(aiVoiceCallLogsTable.campaignId, campaignId));
    }
    return await db.select().from(aiVoiceCallLogsTable);
  }

  async getAiVoiceCallLog(id: string): Promise<AiVoiceCallLog | undefined> {
    const results = await db.select().from(aiVoiceCallLogsTable).where(eq(aiVoiceCallLogsTable.id, id));
    return results[0];
  }

  async createAiVoiceCallLog(log: InsertAiVoiceCallLog): Promise<AiVoiceCallLog> {
    const results = await db.insert(aiVoiceCallLogsTable).values(log).returning();
    return results[0];
  }

  async updateAiVoiceCallLog(id: string, data: Partial<InsertAiVoiceCallLog>): Promise<AiVoiceCallLog | undefined> {
    const results = await db.update(aiVoiceCallLogsTable)
      .set(data)
      .where(eq(aiVoiceCallLogsTable.id, id))
      .returning();
    return results[0];
  }

  // CRM Connections - Persisted to PostgreSQL (FOREVER POLICY)
  async getCrmConnections(customerId: string): Promise<CrmConnection[]> {
    return await db.select().from(crmConnectionsTable).where(eq(crmConnectionsTable.customerId, customerId));
  }

  async getCrmConnection(id: string): Promise<CrmConnection | undefined> {
    const results = await db.select().from(crmConnectionsTable).where(eq(crmConnectionsTable.id, id));
    return results[0];
  }

  async createCrmConnection(connection: InsertCrmConnection): Promise<CrmConnection> {
    const results = await db.insert(crmConnectionsTable).values(connection).returning();
    return results[0];
  }

  async updateCrmConnection(id: string, data: Partial<InsertCrmConnection>): Promise<CrmConnection | undefined> {
    const results = await db.update(crmConnectionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(crmConnectionsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCrmConnection(id: string): Promise<boolean> {
    const results = await db.delete(crmConnectionsTable).where(eq(crmConnectionsTable.id, id)).returning();
    return results.length > 0;
  }

  // CRM Field Mappings - Persisted to PostgreSQL (FOREVER POLICY)
  async getCrmFieldMappings(connectionId: string): Promise<CrmFieldMapping[]> {
    return await db.select().from(crmFieldMappingsTable).where(eq(crmFieldMappingsTable.connectionId, connectionId));
  }

  async createCrmFieldMapping(mapping: InsertCrmFieldMapping): Promise<CrmFieldMapping> {
    const results = await db.insert(crmFieldMappingsTable).values(mapping).returning();
    return results[0];
  }

  async updateCrmFieldMapping(id: string, data: Partial<InsertCrmFieldMapping>): Promise<CrmFieldMapping | undefined> {
    const results = await db.update(crmFieldMappingsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(crmFieldMappingsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCrmFieldMapping(id: string): Promise<boolean> {
    const results = await db.delete(crmFieldMappingsTable).where(eq(crmFieldMappingsTable.id, id)).returning();
    return results.length > 0;
  }

  // CRM Sync Settings - Persisted to PostgreSQL (FOREVER POLICY)
  async getCrmSyncSettings(connectionId: string): Promise<CrmSyncSettings | undefined> {
    const results = await db.select().from(crmSyncSettingsTable).where(eq(crmSyncSettingsTable.connectionId, connectionId));
    return results[0];
  }

  async upsertCrmSyncSettings(settings: InsertCrmSyncSettings): Promise<CrmSyncSettings> {
    const existing = await this.getCrmSyncSettings(settings.connectionId);
    if (existing) {
      const results = await db.update(crmSyncSettingsTable)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(crmSyncSettingsTable.id, existing.id))
        .returning();
      return results[0];
    }
    const results = await db.insert(crmSyncSettingsTable).values(settings).returning();
    return results[0];
  }

  // CRM Sync Logs - Persisted to PostgreSQL (FOREVER POLICY)
  async getCrmSyncLogs(connectionId: string, limit = 50): Promise<CrmSyncLog[]> {
    const results = await db.select().from(crmSyncLogsTable)
      .where(eq(crmSyncLogsTable.connectionId, connectionId))
      .limit(limit);
    return results;
  }

  async createCrmSyncLog(log: InsertCrmSyncLog): Promise<CrmSyncLog> {
    const results = await db.insert(crmSyncLogsTable).values(log).returning();
    return results[0];
  }

  async updateCrmSyncLog(id: string, data: Partial<InsertCrmSyncLog>): Promise<CrmSyncLog | undefined> {
    const results = await db.update(crmSyncLogsTable)
      .set(data)
      .where(eq(crmSyncLogsTable.id, id))
      .returning();
    return results[0];
  }

  // CRM Contact Mappings - Persisted to PostgreSQL (FOREVER POLICY)
  async getCrmContactMappings(connectionId: string): Promise<CrmContactMapping[]> {
    return await db.select().from(crmContactMappingsTable).where(eq(crmContactMappingsTable.connectionId, connectionId));
  }

  async getCrmContactMappingByPhone(connectionId: string, phone: string): Promise<CrmContactMapping | undefined> {
    const results = await db.select().from(crmContactMappingsTable)
      .where(and(eq(crmContactMappingsTable.connectionId, connectionId), eq(crmContactMappingsTable.phoneNumber, phone)));
    return results[0];
  }

  async getCrmContactMappingByEmail(connectionId: string, email: string): Promise<CrmContactMapping | undefined> {
    const results = await db.select().from(crmContactMappingsTable)
      .where(and(eq(crmContactMappingsTable.connectionId, connectionId), eq(crmContactMappingsTable.email, email)));
    return results[0];
  }

  async createCrmContactMapping(mapping: InsertCrmContactMapping): Promise<CrmContactMapping> {
    const results = await db.insert(crmContactMappingsTable).values(mapping).returning();
    return results[0];
  }

  async updateCrmContactMapping(id: string, data: Partial<InsertCrmContactMapping>): Promise<CrmContactMapping | undefined> {
    const results = await db.update(crmContactMappingsTable)
      .set({ ...data, lastSyncAt: new Date() })
      .where(eq(crmContactMappingsTable.id, id))
      .returning();
    return results[0];
  }

  // CMS Themes - Persisted to PostgreSQL (FOREVER POLICY)
  async getCmsThemes(): Promise<CmsTheme[]> {
    return await db.select().from(cmsThemesTable);
  }

  async getCmsTheme(id: string): Promise<CmsTheme | undefined> {
    const results = await db.select().from(cmsThemesTable).where(eq(cmsThemesTable.id, id));
    return results[0];
  }

  async createCmsTheme(theme: InsertCmsTheme): Promise<CmsTheme> {
    const results = await db.insert(cmsThemesTable).values(theme).returning();
    return results[0];
  }

  async updateCmsTheme(id: string, data: Partial<InsertCmsTheme>): Promise<CmsTheme | undefined> {
    const results = await db.update(cmsThemesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cmsThemesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCmsTheme(id: string): Promise<boolean> {
    const results = await db.delete(cmsThemesTable).where(eq(cmsThemesTable.id, id)).returning();
    return results.length > 0;
  }

  // CMS Pages - Persisted to PostgreSQL (FOREVER POLICY)
  async getCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPagesTable);
  }

  async getCmsPage(id: string): Promise<CmsPage | undefined> {
    const results = await db.select().from(cmsPagesTable).where(eq(cmsPagesTable.id, id));
    return results[0];
  }

  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const results = await db.insert(cmsPagesTable).values(page).returning();
    return results[0];
  }

  async updateCmsPage(id: string, data: Partial<InsertCmsPage>): Promise<CmsPage | undefined> {
    const results = await db.update(cmsPagesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cmsPagesTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCmsPage(id: string): Promise<boolean> {
    const results = await db.delete(cmsPagesTable).where(eq(cmsPagesTable.id, id)).returning();
    return results.length > 0;
  }

  // CMS Media Library - Persisted to PostgreSQL (FOREVER POLICY)
  async getCmsMediaItems(): Promise<CmsMediaItem[]> {
    return await db.select().from(cmsMediaItemsTable);
  }

  async getCmsMediaItem(id: string): Promise<CmsMediaItem | undefined> {
    const results = await db.select().from(cmsMediaItemsTable).where(eq(cmsMediaItemsTable.id, id));
    return results[0];
  }

  async createCmsMediaItem(item: InsertCmsMediaItem): Promise<CmsMediaItem> {
    const results = await db.insert(cmsMediaItemsTable).values(item).returning();
    return results[0];
  }

  async updateCmsMediaItem(id: string, data: Partial<InsertCmsMediaItem>): Promise<CmsMediaItem | undefined> {
    const results = await db.update(cmsMediaItemsTable)
      .set(data)
      .where(eq(cmsMediaItemsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteCmsMediaItem(id: string): Promise<boolean> {
    const results = await db.delete(cmsMediaItemsTable).where(eq(cmsMediaItemsTable.id, id)).returning();
    return results.length > 0;
  }

  // Tenant Branding - Persisted to PostgreSQL (FOREVER POLICY)
  async listTenantBrandings(): Promise<TenantBranding[]> {
    return await db.select().from(tenantBrandingsTable);
  }

  async getTenantBranding(customerId: string): Promise<TenantBranding | undefined> {
    const results = await db.select().from(tenantBrandingsTable).where(eq(tenantBrandingsTable.customerId, customerId));
    return results[0];
  }

  async createTenantBranding(branding: InsertTenantBranding): Promise<TenantBranding> {
    const results = await db.insert(tenantBrandingsTable).values(branding).returning();
    return results[0];
  }

  async updateTenantBranding(id: string, data: Partial<InsertTenantBranding>): Promise<TenantBranding | undefined> {
    const results = await db.update(tenantBrandingsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenantBrandingsTable.id, id))
      .returning();
    return results[0];
  }

  // Portal Login Pages - Persisted to PostgreSQL (FOREVER POLICY)
  async getPortalLoginPages(): Promise<PortalLoginPage[]> {
    return await db.select().from(portalLoginPagesTable);
  }

  async getPortalLoginPage(portalType: string): Promise<PortalLoginPage | undefined> {
    const results = await db.select().from(portalLoginPagesTable).where(eq(portalLoginPagesTable.portalType, portalType));
    return results[0];
  }

  async createPortalLoginPage(page: InsertPortalLoginPage): Promise<PortalLoginPage> {
    const results = await db.insert(portalLoginPagesTable).values(page).returning();
    return results[0];
  }

  async updatePortalLoginPage(id: string, data: Partial<InsertPortalLoginPage>): Promise<PortalLoginPage | undefined> {
    const results = await db.update(portalLoginPagesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(portalLoginPagesTable.id, id))
      .returning();
    return results[0];
  }

  // Site Settings - Persisted to PostgreSQL (FOREVER POLICY)
  async getSiteSettings(category?: string): Promise<SiteSetting[]> {
    if (category) {
      return await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.category, category));
    }
    return await db.select().from(siteSettingsTable);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const results = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    return results[0];
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(setting.key);
    if (existing) {
      const results = await db.update(siteSettingsTable)
        .set({ ...setting, updatedAt: new Date() })
        .where(eq(siteSettingsTable.id, existing.id))
        .returning();
      return results[0];
    }
    const results = await db.insert(siteSettingsTable).values(setting).returning();
    return results[0];
  }

  // Website Sections - Persisted to PostgreSQL (FOREVER POLICY)
  async getWebsiteSections(pageSlug?: string): Promise<WebsiteSection[]> {
    if (pageSlug) {
      return await db.select().from(websiteSectionsTable).where(eq(websiteSectionsTable.pageSlug, pageSlug));
    }
    return await db.select().from(websiteSectionsTable);
  }

  async getWebsiteSection(id: string): Promise<WebsiteSection | undefined> {
    const results = await db.select().from(websiteSectionsTable).where(eq(websiteSectionsTable.id, id));
    return results[0];
  }

  async createWebsiteSection(section: InsertWebsiteSection): Promise<WebsiteSection> {
    const results = await db.insert(websiteSectionsTable).values(section).returning();
    return results[0];
  }

  async updateWebsiteSection(id: string, data: Partial<InsertWebsiteSection>): Promise<WebsiteSection | undefined> {
    const results = await db.update(websiteSectionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(websiteSectionsTable.id, id))
      .returning();
    return results[0];
  }

  async deleteWebsiteSection(id: string): Promise<boolean> {
    const results = await db.delete(websiteSectionsTable).where(eq(websiteSectionsTable.id, id)).returning();
    return results.length > 0;
  }

  // Integrations - delegated to database repository
  async getIntegrations(): Promise<Integration[]> {
    const { integrationsRepository } = await import("./integrations-repository");
    return integrationsRepository.getIntegrations();
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    const { integrationsRepository } = await import("./integrations-repository");
    return integrationsRepository.getIntegration(id);
  }

  async getIntegrationByProvider(provider: string): Promise<Integration | undefined> {
    const { integrationsRepository } = await import("./integrations-repository");
    return integrationsRepository.getIntegrationByProvider(provider);
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const { integrationsRepository } = await import("./integrations-repository");
    return integrationsRepository.createIntegration(integration);
  }

  async updateIntegration(id: string, data: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const { integrationsRepository } = await import("./integrations-repository");
    return integrationsRepository.updateIntegration(id, data);
  }

  async deleteIntegration(id: string): Promise<boolean> {
    const { integrationsRepository } = await import("./integrations-repository");
    return integrationsRepository.deleteIntegration(id);
  }

  // Documentation Categories
  async getDocCategories(): Promise<DocCategory[]> {
    const results = await db.select().from(docCategoriesTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getDocCategory(id: string): Promise<DocCategory | undefined> {
    const results = await db.select().from(docCategoriesTable).where(eq(docCategoriesTable.id, id));
    return results[0];
  }

  async createDocCategory(category: InsertDocCategory): Promise<DocCategory> {
    const id = randomUUID();
    const results = await db.insert(docCategoriesTable).values({ id, ...category }).returning();
    return results[0];
  }

  async updateDocCategory(id: string, data: Partial<InsertDocCategory>): Promise<DocCategory | undefined> {
    const results = await db.update(docCategoriesTable).set({ ...data, updatedAt: new Date() }).where(eq(docCategoriesTable.id, id)).returning();
    return results[0];
  }

  async deleteDocCategory(id: string): Promise<boolean> {
    const results = await db.delete(docCategoriesTable).where(eq(docCategoriesTable.id, id)).returning();
    return results.length > 0;
  }

  // Documentation Articles
  async getDocArticles(categoryId?: string): Promise<DocArticle[]> {
    const results = categoryId
      ? await db.select().from(docArticlesTable).where(eq(docArticlesTable.categoryId, categoryId))
      : await db.select().from(docArticlesTable);
    return results.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getDocArticle(id: string): Promise<DocArticle | undefined> {
    const results = await db.select().from(docArticlesTable).where(eq(docArticlesTable.id, id));
    return results[0];
  }

  async getDocArticleBySlug(categorySlug: string, articleSlug: string): Promise<DocArticle | undefined> {
    const categoryResults = await db.select().from(docCategoriesTable).where(eq(docCategoriesTable.slug, categorySlug));
    const category = categoryResults[0];
    if (!category) return undefined;
    const results = await db.select().from(docArticlesTable).where(and(eq(docArticlesTable.categoryId, category.id), eq(docArticlesTable.slug, articleSlug)));
    return results[0];
  }

  async createDocArticle(article: InsertDocArticle): Promise<DocArticle> {
    const id = randomUUID();
    const results = await db.insert(docArticlesTable).values({ id, ...article }).returning();
    return results[0];
  }

  async updateDocArticle(id: string, data: Partial<InsertDocArticle>): Promise<DocArticle | undefined> {
    const results = await db.update(docArticlesTable).set({ ...data, updatedAt: new Date() }).where(eq(docArticlesTable.id, id)).returning();
    return results[0];
  }

  async deleteDocArticle(id: string): Promise<boolean> {
    const results = await db.delete(docArticlesTable).where(eq(docArticlesTable.id, id)).returning();
    return results.length > 0;
  }

  // A-Z Destinations (delegated to database repository)
  async getAzDestinations(options?: { search?: string; region?: string; limit?: number; offset?: number }): Promise<{ destinations: AzDestination[]; total: number }> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.getDestinations(options);
  }

  async getAzDestination(id: string): Promise<AzDestination | undefined> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.getDestination(id);
  }

  async getAzDestinationByCode(code: string): Promise<AzDestination | undefined> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.getDestinationByCode(code);
  }

  async createAzDestination(dest: InsertAzDestination): Promise<AzDestination> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.createDestination(dest);
  }

  async createAzDestinationsBulk(dests: InsertAzDestination[]): Promise<number> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.createDestinationsBulk(dests);
  }

  async upsertAzDestinationsBulk(dests: InsertAzDestination[]): Promise<{ inserted: number; updated: number; skipped: number }> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.upsertDestinationsBulk(dests);
  }

  async updateAzDestination(id: string, data: Partial<InsertAzDestination>): Promise<AzDestination | undefined> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.updateDestination(id, data);
  }

  async deleteAzDestination(id: string): Promise<boolean> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.deleteDestination(id);
  }

  async deleteAllAzDestinations(): Promise<number> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.deleteAllDestinations();
  }

  async getAzRegions(): Promise<string[]> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.getRegions();
  }

  async normalizeCode(dialCode: string): Promise<AzDestination | undefined> {
    const { azDestinationsRepository } = await import("./az-destinations-repository");
    return azDestinationsRepository.normalizeCode(dialCode);
  }

  // Experience Manager (PostgreSQL)
  async getAllEmContentItems(): Promise<EmContentItem[]> {
    return await db.select().from(emContentItemsTable);
  }

  async getEmContentItem(section: string, entityType: string, slug: string): Promise<EmContentItem | undefined> {
    const results = await db.select().from(emContentItemsTable).where(
      and(
        eq(emContentItemsTable.section, section as any),
        eq(emContentItemsTable.entityType, entityType as any),
        eq(emContentItemsTable.slug, slug)
      )
    );
    return results[0];
  }

  async getEmContentItemById(id: string): Promise<EmContentItem | undefined> {
    const results = await db.select().from(emContentItemsTable).where(eq(emContentItemsTable.id, id));
    return results[0];
  }

  async createEmContentItem(item: InsertEmContentItem): Promise<EmContentItem> {
    const id = randomUUID();
    const results = await db.insert(emContentItemsTable).values({ id, ...item }).returning();
    return results[0];
  }

  async updateEmContentItem(id: string, data: Partial<InsertEmContentItem>): Promise<EmContentItem | undefined> {
    const results = await db.update(emContentItemsTable).set({ ...data, updatedAt: new Date() }).where(eq(emContentItemsTable.id, id)).returning();
    return results[0];
  }

  async getEmContentVersion(id: string): Promise<EmContentVersion | undefined> {
    const results = await db.select().from(emContentVersionsTable).where(eq(emContentVersionsTable.id, id));
    return results[0];
  }

  async getLatestEmContentVersion(contentItemId: string): Promise<EmContentVersion | undefined> {
    const results = await db.select().from(emContentVersionsTable)
      .where(eq(emContentVersionsTable.contentItemId, contentItemId));
    if (results.length === 0) return undefined;
    return results.reduce((latest, current) => 
      current.version > latest.version ? current : latest
    );
  }

  async createEmContentVersion(version: InsertEmContentVersion): Promise<EmContentVersion> {
    const id = randomUUID();
    const results = await db.insert(emContentVersionsTable).values({ id, ...version }).returning();
    return results[0];
  }

  async createEmValidationResult(result: InsertEmValidationResult): Promise<EmValidationResult> {
    const id = randomUUID();
    const results = await db.insert(emValidationResultsTable).values({ id, ...result }).returning();
    return results[0];
  }

  async getEmPublishHistory(contentItemId: string): Promise<EmPublishHistory[]> {
    const results = await db.select().from(emPublishHistoryTable)
      .where(eq(emPublishHistoryTable.contentItemId, contentItemId));
    return results.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createEmPublishHistory(entry: InsertEmPublishHistory): Promise<EmPublishHistory> {
    const id = randomUUID();
    const results = await db.insert(emPublishHistoryTable).values({ id, ...entry }).returning();
    return results[0];
  }

  // Dev Tests (PostgreSQL)
  async getDevTests(): Promise<DevTest[]> {
    const results = await db.select().from(devTestsTable);
    return results.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getDevTest(id: string): Promise<DevTest | undefined> {
    const results = await db.select().from(devTestsTable).where(eq(devTestsTable.id, id));
    return results[0];
  }

  async createDevTest(test: InsertDevTest): Promise<DevTest> {
    const id = randomUUID();
    const results = await db.insert(devTestsTable).values({ id, ...test }).returning();
    return results[0];
  }

  async updateDevTest(id: string, data: Partial<InsertDevTest>): Promise<DevTest | undefined> {
    const results = await db.update(devTestsTable).set(data).where(eq(devTestsTable.id, id)).returning();
    return results[0];
  }

  async deleteDevTest(id: string): Promise<boolean> {
    const results = await db.delete(devTestsTable).where(eq(devTestsTable.id, id)).returning();
    return results.length > 0;
  }
}

export const storage = new MemStorage();
