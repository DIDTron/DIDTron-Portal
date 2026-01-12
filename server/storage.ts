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
  type AuditLog,
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
  type EmContentItem, type InsertEmContentItem,
  type EmContentVersion, type InsertEmContentVersion,
  type EmValidationResult, type InsertEmValidationResult,
  type EmPublishHistory, type InsertEmPublishHistory,
  type DevTest, type InsertDevTest,
  type BillingTerm, type InsertBillingTerm,
  type CarrierInterconnect, type InsertCarrierInterconnect,
  type CarrierService, type InsertCarrierService,
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
  fileTemplates
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, ilike } from "drizzle-orm";

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
  getCarrier(id: string): Promise<Carrier | undefined>;
  getCarrierByCode(code: string): Promise<Carrier | undefined>;
  resolveCarrier(identifier: string): Promise<Carrier | undefined>;
  createCarrier(carrier: InsertCarrier): Promise<Carrier>;
  updateCarrier(id: string, data: Partial<InsertCarrier>): Promise<Carrier | undefined>;
  deleteCarrier(id: string): Promise<boolean>;

  // Customer Rating Plans
  getCustomerRatingPlans(): Promise<CustomerRatingPlan[]>;
  getCustomerRatingPlan(id: string): Promise<CustomerRatingPlan | undefined>;
  getCustomerRatingPlanByShortCode(shortCode: string): Promise<CustomerRatingPlan | undefined>;
  resolveCustomerRatingPlan(identifier: string): Promise<CustomerRatingPlan | undefined>;
  createCustomerRatingPlan(plan: InsertCustomerRatingPlan): Promise<CustomerRatingPlan>;
  updateCustomerRatingPlan(id: string, data: Partial<InsertCustomerRatingPlan>): Promise<CustomerRatingPlan | undefined>;
  deleteCustomerRatingPlan(id: string): Promise<boolean>;

  // Customer Rating Plan Rates
  getRatingPlanRates(ratingPlanId: string): Promise<CustomerRatingPlanRate[]>;
  getRatingPlanRate(id: string): Promise<CustomerRatingPlanRate | undefined>;
  createRatingPlanRate(rate: InsertCustomerRatingPlanRate): Promise<CustomerRatingPlanRate>;
  updateRatingPlanRate(id: string, data: Partial<InsertCustomerRatingPlanRate>): Promise<CustomerRatingPlanRate | undefined>;
  deleteRatingPlanRate(id: string): Promise<boolean>;
  searchZonesFromAZ(searchTerm: string): Promise<string[]>;
  expandWildcardZones(wildcardPattern: string): Promise<string[]>;
  getCodesForZone(zone: string): Promise<string[]>;
  getCodesWithIntervalsForZone(zone: string): Promise<{ codes: string[], billingIncrement: string | null }>;
  lookupZoneByCode(code: string): Promise<string | null>;

  // Carrier Assignments
  getCarrierAssignment(carrierId: string): Promise<CarrierAssignment | undefined>;
  upsertCarrierAssignment(assignment: InsertCarrierAssignment): Promise<CarrierAssignment>;

  // Carrier Interconnects
  getAllCarrierInterconnects(): Promise<CarrierInterconnect[]>;
  getCarrierInterconnects(carrierId: string): Promise<CarrierInterconnect[]>;
  getCarrierInterconnect(id: string): Promise<CarrierInterconnect | undefined>;
  getCarrierInterconnectByShortCode(shortCode: string): Promise<CarrierInterconnect | undefined>;
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
  resolveCarrierService(identifier: string): Promise<CarrierService | undefined>;
  createCarrierService(service: InsertCarrierService): Promise<CarrierService>;
  updateCarrierService(id: string, data: Partial<InsertCarrierService>): Promise<CarrierService | undefined>;
  deleteCarrierService(id: string): Promise<boolean>;

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
  private users: Map<string, User>;
  private customerCategories: Map<string, CustomerCategory>;
  private customerGroups: Map<string, CustomerGroup>;
  private customers: Map<string, Customer>;
  private customerKyc: Map<string, CustomerKyc>;
  private pops: Map<string, Pop>;
  private voiceTiers: Map<string, VoiceTier>;
  private codecs: Map<string, Codec>;
  private channelPlans: Map<string, ChannelPlan>;
  private carriers: Map<string, Carrier>;
  private carrierInterconnects: Map<string, CarrierInterconnect>;
  private carrierContacts: Map<string, CarrierContact>;
  private carrierCreditAlerts: Map<string, CarrierCreditAlert>;
  private carrierAssignments: Map<string, CarrierAssignment>;
  private auditLogs: Map<string, AuditLog>;
  private routes: Map<string, Route>;
  private monitoringRules: Map<string, MonitoringRule>;
  private alerts: Map<string, Alert>;
  private didCountries: Map<string, DidCountry>;
  private didProviders: Map<string, DidProvider>;
  private dids: Map<string, Did>;
  private sipTrunks: Map<string, SipTrunk>;
  private extensions: Map<string, Extension>;
  private ivrs: Map<string, Ivr>;
  private ringGroups: Map<string, RingGroup>;
  private queues: Map<string, Queue>;
  // Stage 5-6: tickets, ticketReplies, invoices, payments, promoCodes, referrals - MIGRATED TO POSTGRESQL
  private currencies: Map<string, Currency>;
  private fxRates: Map<string, FxRate>;
  private sipTestConfigs: Map<string, SipTestConfig>;
  private sipTestResults: Map<string, SipTestResult>;
  private sipTestSchedules: Map<string, SipTestSchedule>;
  private class4Customers: Map<string, Class4Customer>;
  private class4Carriers: Map<string, Class4Carrier>;
  private class4ProviderRateCards: Map<string, Class4ProviderRateCard>;
  private class4CustomerRateCards: Map<string, Class4CustomerRateCard>;
  private aiVoiceAgents: Map<string, AiVoiceAgent>;
  private aiVoiceFlows: Map<string, AiVoiceFlow>;
  private aiVoiceTrainingData: Map<string, AiVoiceTrainingData>;
  private aiVoiceCampaigns: Map<string, AiVoiceCampaign>;
  private aiVoiceKnowledgeBases: Map<string, AiVoiceKnowledgeBase>;
  private aiVoiceKbSources: Map<string, AiVoiceKbSource>;
  private aiVoicePhonebooks: Map<string, AiVoicePhonebook>;
  private aiVoiceContacts: Map<string, AiVoiceContact>;
  private aiVoiceCallLogs: Map<string, AiVoiceCallLog>;
  private crmConnections: Map<string, CrmConnection>;
  private crmFieldMappings: Map<string, CrmFieldMapping>;
  private crmSyncSettings: Map<string, CrmSyncSettings>;
  private crmSyncLogs: Map<string, CrmSyncLog>;
  private crmContactMappings: Map<string, CrmContactMapping>;
  private cmsThemes: Map<string, CmsTheme>;
  private cmsPages: Map<string, CmsPage>;
  private cmsMediaItems: Map<string, CmsMediaItem>;
  private tenantBrandings: Map<string, TenantBranding>;
  private portalLoginPages: Map<string, PortalLoginPage>;
  private siteSettings: Map<string, SiteSetting>;
  private websiteSections: Map<string, WebsiteSection>;
  // integrations are stored in PostgreSQL via integrationsRepository
  private bonusTypes: Map<string, BonusType>;
  private emailTemplates: Map<string, EmailTemplate>;
  private emailLogs: Map<string, EmailLog>;
  private socialAccounts: Map<string, SocialAccount>;
  private socialPosts: Map<string, SocialPost>;
  private rateCards: Map<string, RateCard>;
  private rateCardRates: Map<string, RateCardRate>;
  private docCategories: Map<string, DocCategory>;
  private docArticles: Map<string, DocArticle>;
  private webhooks: Map<string, Webhook>;
  private customerApiKeys: Map<string, CustomerApiKey>;
  // billingTerms - MIGRATED TO POSTGRESQL

  constructor() {
    this.users = new Map();
    this.customerCategories = new Map();
    this.customerGroups = new Map();
    this.customers = new Map();
    this.customerKyc = new Map();
    this.pops = new Map();
    this.voiceTiers = new Map();
    this.codecs = new Map();
    this.channelPlans = new Map();
    this.carriers = new Map();
    this.carrierInterconnects = new Map();
    this.carrierContacts = new Map();
    this.carrierCreditAlerts = new Map();
    this.carrierAssignments = new Map();
    this.auditLogs = new Map();
    this.routes = new Map();
    this.monitoringRules = new Map();
    this.alerts = new Map();
    this.didCountries = new Map();
    this.didProviders = new Map();
    this.dids = new Map();
    this.sipTrunks = new Map();
    this.extensions = new Map();
    this.ivrs = new Map();
    this.ringGroups = new Map();
    this.queues = new Map();
    // Stage 5-6: tickets, ticketReplies, invoices, payments, promoCodes, referrals - now in PostgreSQL
    this.currencies = new Map();
    this.fxRates = new Map();
    this.sipTestConfigs = new Map();
    this.sipTestResults = new Map();
    this.sipTestSchedules = new Map();
    this.class4Customers = new Map();
    this.class4Carriers = new Map();
    this.class4ProviderRateCards = new Map();
    this.class4CustomerRateCards = new Map();
    this.aiVoiceAgents = new Map();
    this.aiVoiceFlows = new Map();
    this.aiVoiceTrainingData = new Map();
    this.aiVoiceCampaigns = new Map();
    this.aiVoiceKnowledgeBases = new Map();
    this.aiVoiceKbSources = new Map();
    this.aiVoicePhonebooks = new Map();
    this.aiVoiceContacts = new Map();
    this.aiVoiceCallLogs = new Map();
    this.crmConnections = new Map();
    this.crmFieldMappings = new Map();
    this.crmSyncSettings = new Map();
    this.crmSyncLogs = new Map();
    this.crmContactMappings = new Map();
    this.cmsThemes = new Map();
    this.cmsPages = new Map();
    this.cmsMediaItems = new Map();
    this.tenantBrandings = new Map();
    this.portalLoginPages = new Map();
    this.siteSettings = new Map();
    this.websiteSections = new Map();
    // integrations are now stored in PostgreSQL via integrationsRepository
    this.bonusTypes = new Map();
    this.emailTemplates = new Map();
    this.emailLogs = new Map();
    this.socialAccounts = new Map();
    this.socialPosts = new Map();
    this.rateCards = new Map();
    this.rateCardRates = new Map();
    this.docCategories = new Map();
    this.docArticles = new Map();
    this.webhooks = new Map();
    this.customerApiKeys = new Map();
    // billingTerms - now in PostgreSQL

    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Customer categories, groups, and currencies are now seeded via PostgreSQL
    // See seedReferenceData() function which runs on app startup
    // Only seed entities that still use in-memory storage here
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

  // Customer KYC
  async getCustomerKycRequests(status?: string): Promise<CustomerKyc[]> {
    let requests = Array.from(this.customerKyc.values());
    if (status) requests = requests.filter(k => k.status === status);
    return requests.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getCustomerKyc(id: string): Promise<CustomerKyc | undefined> {
    return this.customerKyc.get(id);
  }

  async getCustomerKycByCustomerId(customerId: string): Promise<CustomerKyc | undefined> {
    return Array.from(this.customerKyc.values()).find(k => k.customerId === customerId);
  }

  async createCustomerKyc(kyc: InsertCustomerKyc): Promise<CustomerKyc> {
    const id = randomUUID();
    const now = new Date();
    const newKyc: CustomerKyc = {
      id,
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
      createdAt: now,
      updatedAt: now,
    };
    this.customerKyc.set(id, newKyc);
    return newKyc;
  }

  async updateCustomerKyc(id: string, data: Partial<InsertCustomerKyc>): Promise<CustomerKyc | undefined> {
    const existing = this.customerKyc.get(id);
    if (!existing) return undefined;
    const updated: CustomerKyc = { ...existing, ...data, updatedAt: new Date() };
    this.customerKyc.set(id, updated);
    return updated;
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

  async getCarrier(id: string): Promise<Carrier | undefined> {
    const results = await db.select().from(carriersTable).where(eq(carriersTable.id, id));
    return results[0];
  }

  async getCarrierByCode(code: string): Promise<Carrier | undefined> {
    const results = await db.select().from(carriersTable).where(eq(carriersTable.code, code));
    return results[0];
  }

  async resolveCarrier(identifier: string): Promise<Carrier | undefined> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(identifier)) {
      return this.getCarrier(identifier);
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

  async resolveCarrierInterconnect(identifier: string): Promise<CarrierInterconnect | undefined> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(identifier)) {
      return this.getCarrierInterconnect(identifier);
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

  async resolveCarrierService(identifier: string): Promise<CarrierService | undefined> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(identifier)) {
      return this.getCarrierService(identifier);
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

  // Audit Logs
  async getAuditLogs(tableName?: string, recordId?: string, limit?: number): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    if (tableName) logs = logs.filter(l => l.tableName === tableName);
    if (recordId) logs = logs.filter(l => l.recordId === recordId);
    logs.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    if (limit) logs = logs.slice(0, limit);
    return logs;
  }

  async createAuditLog(log: { userId?: string; action: string; tableName?: string; recordId?: string; oldValues?: unknown; newValues?: unknown; ipAddress?: string; }): Promise<AuditLog> {
    const id = randomUUID();
    const now = new Date();
    const entry: AuditLog = {
      id,
      userId: log.userId ?? null,
      action: log.action,
      tableName: log.tableName ?? null,
      recordId: log.recordId ?? null,
      oldValues: log.oldValues ?? null,
      newValues: log.newValues ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: null,
      createdAt: now,
    };
    this.auditLogs.set(id, entry);
    return entry;
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

  // Monitoring Rules
  async getMonitoringRules(): Promise<MonitoringRule[]> {
    return Array.from(this.monitoringRules.values());
  }

  async getMonitoringRule(id: string): Promise<MonitoringRule | undefined> {
    return this.monitoringRules.get(id);
  }

  async createMonitoringRule(rule: InsertMonitoringRule): Promise<MonitoringRule> {
    const id = randomUUID();
    const now = new Date();
    const r: MonitoringRule = {
      id,
      name: rule.name,
      carrierId: rule.carrierId ?? null,
      prefix: rule.prefix ?? null,
      destination: rule.destination ?? null,
      checkIntervalMinutes: rule.checkIntervalMinutes ?? 30,
      minimumCalls: rule.minimumCalls ?? 50,
      isActive: rule.isActive ?? true,
      businessHoursOnly: rule.businessHoursOnly ?? false,
      businessHoursStart: rule.businessHoursStart ?? "08:00",
      businessHoursEnd: rule.businessHoursEnd ?? "22:00",
      createdAt: now,
      updatedAt: now
    };
    this.monitoringRules.set(id, r);
    return r;
  }

  async updateMonitoringRule(id: string, data: Partial<InsertMonitoringRule>): Promise<MonitoringRule | undefined> {
    const rule = this.monitoringRules.get(id);
    if (!rule) return undefined;
    const updated = { ...rule, ...data, updatedAt: new Date() };
    this.monitoringRules.set(id, updated);
    return updated;
  }

  async deleteMonitoringRule(id: string): Promise<boolean> {
    return this.monitoringRules.delete(id);
  }

  // Alerts
  async getAlerts(status?: string): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values());
    if (status) return alerts.filter(a => a.status === status);
    return alerts;
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const now = new Date();
    const a: Alert = {
      id,
      ruleId: alert.ruleId ?? null,
      carrierId: alert.carrierId ?? null,
      routeId: alert.routeId ?? null,
      metric: alert.metric ?? null,
      currentValue: alert.currentValue ?? null,
      threshold: alert.threshold ?? null,
      severity: alert.severity ?? "warning",
      status: alert.status ?? "active",
      message: alert.message ?? null,
      actionsTaken: alert.actionsTaken ?? null,
      acknowledgedBy: alert.acknowledgedBy ?? null,
      acknowledgedAt: alert.acknowledgedAt ?? null,
      resolvedAt: alert.resolvedAt ?? null,
      createdAt: now
    };
    this.alerts.set(id, a);
    return a;
  }

  async updateAlert(id: string, data: Partial<InsertAlert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    const updated = { ...alert, ...data };
    this.alerts.set(id, updated);
    return updated;
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

  // Bonus Types
  async getBonusTypes(): Promise<BonusType[]> {
    return Array.from(this.bonusTypes.values());
  }
  async getBonusType(id: string): Promise<BonusType | undefined> {
    return this.bonusTypes.get(id);
  }
  async createBonusType(bonusType: InsertBonusType): Promise<BonusType> {
    const id = randomUUID();
    const now = new Date();
    const newBonusType: BonusType = {
      id,
      name: bonusType.name,
      code: bonusType.code,
      type: bonusType.type || "signup",
      amount: bonusType.amount ?? null,
      percentage: bonusType.percentage ?? null,
      conditions: bonusType.conditions ?? null,
      isActive: bonusType.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.bonusTypes.set(id, newBonusType);
    return newBonusType;
  }
  async updateBonusType(id: string, data: Partial<InsertBonusType>): Promise<BonusType | undefined> {
    const existing = this.bonusTypes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.bonusTypes.set(id, updated);
    return updated;
  }
  async deleteBonusType(id: string): Promise<boolean> {
    return this.bonusTypes.delete(id);
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }
  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }
  async getEmailTemplateBySlug(slug: string): Promise<EmailTemplate | undefined> {
    return Array.from(this.emailTemplates.values()).find(t => t.slug === slug);
  }
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = randomUUID();
    const now = new Date();
    const newTemplate: EmailTemplate = {
      id,
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      htmlContent: template.htmlContent ?? null,
      textContent: template.textContent ?? null,
      category: template.category || "general",
      variables: template.variables ?? null,
      isActive: template.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.emailTemplates.set(id, newTemplate);
    return newTemplate;
  }
  async updateEmailTemplate(id: string, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const existing = this.emailTemplates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.emailTemplates.set(id, updated);
    return updated;
  }
  async deleteEmailTemplate(id: string): Promise<boolean> {
    return this.emailTemplates.delete(id);
  }

  // Email Logs
  async getEmailLogs(): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const id = randomUUID();
    const now = new Date();
    const newLog: EmailLog = {
      id,
      templateId: log.templateId ?? null,
      customerId: log.customerId ?? null,
      recipient: log.recipient,
      subject: log.subject,
      status: log.status || "pending",
      provider: log.provider || "brevo",
      providerMessageId: log.providerMessageId ?? null,
      errorMessage: log.errorMessage ?? null,
      sentAt: log.sentAt ?? null,
      deliveredAt: log.deliveredAt ?? null,
      openedAt: log.openedAt ?? null,
      clickedAt: log.clickedAt ?? null,
      createdAt: now,
    };
    this.emailLogs.set(id, newLog);
    return newLog;
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

  // Social Accounts
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values());
  }
  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    return this.socialAccounts.get(id);
  }
  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const id = randomUUID();
    const now = new Date();
    const newAccount: SocialAccount = {
      id,
      platform: account.platform,
      accountName: account.accountName ?? null,
      accountId: account.accountId ?? null,
      accessToken: account.accessToken ?? null,
      refreshToken: account.refreshToken ?? null,
      tokenExpiresAt: account.tokenExpiresAt ?? null,
      isActive: account.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.socialAccounts.set(id, newAccount);
    return newAccount;
  }
  async updateSocialAccount(id: string, data: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const existing = this.socialAccounts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.socialAccounts.set(id, updated);
    return updated;
  }
  async deleteSocialAccount(id: string): Promise<boolean> {
    return this.socialAccounts.delete(id);
  }

  // Social Posts
  async getSocialPosts(): Promise<SocialPost[]> {
    return Array.from(this.socialPosts.values());
  }
  async getSocialPost(id: string): Promise<SocialPost | undefined> {
    return this.socialPosts.get(id);
  }
  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const id = randomUUID();
    const now = new Date();
    const newPost: SocialPost = {
      id,
      content: post.content,
      platforms: post.platforms ?? null,
      mediaUrls: post.mediaUrls ?? null,
      status: post.status || "draft",
      scheduledAt: post.scheduledAt ?? null,
      publishedAt: post.publishedAt ?? null,
      ayrsharePostId: post.ayrsharePostId ?? null,
      engagement: post.engagement ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.socialPosts.set(id, newPost);
    return newPost;
  }
  async updateSocialPost(id: string, data: Partial<InsertSocialPost>): Promise<SocialPost | undefined> {
    const existing = this.socialPosts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.socialPosts.set(id, updated);
    return updated;
  }
  async deleteSocialPost(id: string): Promise<boolean> {
    return this.socialPosts.delete(id);
  }

  // Rate Cards - Persisted to PostgreSQL (FOREVER POLICY)
  async getRateCards(type?: string): Promise<RateCard[]> {
    if (type) {
      return await db.select().from(rateCardsTable).where(eq(rateCardsTable.type, type));
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
    const customerArray = Array.from(this.customers.values());
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

  // SIP Test Audio Files
  sipTestAudioFiles = new Map<string, SipTestAudioFile>();
  
  async getSipTestAudioFiles(): Promise<SipTestAudioFile[]> {
    return Array.from(this.sipTestAudioFiles.values());
  }

  async getSipTestAudioFile(id: string): Promise<SipTestAudioFile | undefined> {
    return this.sipTestAudioFiles.get(id);
  }

  async createSipTestAudioFile(file: InsertSipTestAudioFile): Promise<SipTestAudioFile> {
    const id = randomUUID();
    const now = new Date();
    const f: SipTestAudioFile = {
      id,
      name: file.name,
      description: file.description ?? null,
      filename: file.filename,
      fileUrl: file.fileUrl ?? null,
      fileSize: file.fileSize ?? null,
      duration: file.duration ?? null,
      format: file.format ?? 'wav',
      isDefault: file.isDefault ?? false,
      isActive: file.isActive ?? true,
      createdBy: file.createdBy ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.sipTestAudioFiles.set(id, f);
    return f;
  }

  async updateSipTestAudioFile(id: string, data: Partial<InsertSipTestAudioFile>): Promise<SipTestAudioFile | undefined> {
    const file = this.sipTestAudioFiles.get(id);
    if (!file) return undefined;
    const updated = { ...file, ...data, updatedAt: new Date() };
    this.sipTestAudioFiles.set(id, updated);
    return updated;
  }

  async deleteSipTestAudioFile(id: string): Promise<boolean> {
    return this.sipTestAudioFiles.delete(id);
  }

  // SIP Test Numbers (Crowdsourced)
  sipTestNumbers = new Map<string, SipTestNumber>();

  async getSipTestNumbers(countryCode?: string): Promise<SipTestNumber[]> {
    const numbers = Array.from(this.sipTestNumbers.values());
    if (countryCode) return numbers.filter(n => n.countryCode === countryCode);
    return numbers;
  }

  async getSipTestNumber(id: string): Promise<SipTestNumber | undefined> {
    return this.sipTestNumbers.get(id);
  }

  async createSipTestNumber(number: InsertSipTestNumber): Promise<SipTestNumber> {
    const id = randomUUID();
    const now = new Date();
    const n: SipTestNumber = {
      id,
      countryCode: number.countryCode,
      countryName: number.countryName,
      phoneNumber: number.phoneNumber,
      numberType: number.numberType ?? 'landline',
      carrier: number.carrier ?? null,
      verified: number.verified ?? false,
      lastTestedAt: null,
      successRate: null,
      avgMos: null,
      avgPdd: null,
      testCount: 0,
      contributedBy: number.contributedBy ?? null,
      isPublic: number.isPublic ?? true,
      isActive: number.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.sipTestNumbers.set(id, n);
    return n;
  }

  async updateSipTestNumber(id: string, data: Partial<InsertSipTestNumber>): Promise<SipTestNumber | undefined> {
    const number = this.sipTestNumbers.get(id);
    if (!number) return undefined;
    const updated = { ...number, ...data, updatedAt: new Date() };
    this.sipTestNumbers.set(id, updated);
    return updated;
  }

  async deleteSipTestNumber(id: string): Promise<boolean> {
    return this.sipTestNumbers.delete(id);
  }

  // SIP Test Profiles
  sipTestProfiles = new Map<string, SipTestProfile>();

  async getSipTestProfiles(customerId?: string): Promise<SipTestProfile[]> {
    const profiles = Array.from(this.sipTestProfiles.values());
    if (customerId) return profiles.filter(p => p.customerId === customerId);
    return profiles;
  }

  async createSipTestProfile(profile: InsertSipTestProfile): Promise<SipTestProfile> {
    const id = randomUUID();
    const now = new Date();
    const p: SipTestProfile = {
      id,
      customerId: profile.customerId ?? null,
      name: profile.name,
      ip: profile.ip,
      port: profile.port ?? 5060,
      protocol: profile.protocol ?? 'SIP',
      username: profile.username ?? null,
      password: profile.password ?? null,
      isDefault: profile.isDefault ?? false,
      isActive: profile.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.sipTestProfiles.set(id, p);
    return p;
  }

  async deleteSipTestProfile(id: string): Promise<boolean> {
    return this.sipTestProfiles.delete(id);
  }

  // SIP Test Suppliers
  sipTestSuppliers = new Map<string, SipTestSupplier>();

  async getSipTestSuppliers(customerId?: string): Promise<SipTestSupplier[]> {
    const suppliers = Array.from(this.sipTestSuppliers.values());
    if (customerId) return suppliers.filter(s => s.customerId === customerId);
    return suppliers;
  }

  async createSipTestSupplier(supplier: InsertSipTestSupplier): Promise<SipTestSupplier> {
    const id = randomUUID();
    const now = new Date();
    const s: SipTestSupplier = {
      id,
      customerId: supplier.customerId ?? null,
      name: supplier.name,
      codec: supplier.codec ?? 'G729',
      prefix: supplier.prefix ?? null,
      protocol: supplier.protocol ?? 'SIP',
      email: supplier.email ?? null,
      isOurTier: supplier.isOurTier ?? false,
      tierId: supplier.tierId ?? null,
      isActive: supplier.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.sipTestSuppliers.set(id, s);
    return s;
  }

  async deleteSipTestSupplier(id: string): Promise<boolean> {
    return this.sipTestSuppliers.delete(id);
  }

  // SIP Test Settings
  sipTestSettings = new Map<string, SipTestSettings>();

  async getSipTestSettings(customerId?: string): Promise<SipTestSettings | undefined> {
    if (!customerId) return undefined;
    return Array.from(this.sipTestSettings.values()).find(s => s.customerId === customerId);
  }

  async upsertSipTestSettings(settings: InsertSipTestSettings): Promise<SipTestSettings> {
    const existing = settings.customerId 
      ? Array.from(this.sipTestSettings.values()).find(s => s.customerId === settings.customerId)
      : undefined;
    
    const id = existing?.id || randomUUID();
    const now = new Date();
    const s: SipTestSettings = {
      id,
      customerId: settings.customerId ?? null,
      concurrentCalls: settings.concurrentCalls ?? 10,
      cliAcceptablePrefixes: settings.cliAcceptablePrefixes ?? '+00',
      defaultAudioId: settings.defaultAudioId ?? null,
      maxWaitAnswer: settings.maxWaitAnswer ?? 80,
      defaultCallsCount: settings.defaultCallsCount ?? 5,
      defaultCodec: settings.defaultCodec ?? 'G729',
      defaultDuration: settings.defaultDuration ?? 30,
      timezone: settings.timezone ?? 'UTC',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.sipTestSettings.set(id, s);
    return s;
  }

  // SIP Test Runs (Admin)
  async getAllSipTestRuns(): Promise<SipTestRun[]> {
    return Array.from(this.sipTestRuns.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  // SIP Test Runs
  sipTestRuns = new Map<string, SipTestRun>();

  async getSipTestRuns(customerId: string): Promise<SipTestRun[]> {
    return Array.from(this.sipTestRuns.values()).filter(r => r.customerId === customerId);
  }

  async getSipTestRun(id: string): Promise<SipTestRun | undefined> {
    return this.sipTestRuns.get(id);
  }

  async createSipTestRun(run: InsertSipTestRun): Promise<SipTestRun> {
    const id = randomUUID();
    const now = new Date();
    const r: SipTestRun = {
      id,
      customerId: run.customerId,
      testName: run.testName ?? null,
      testMode: run.testMode ?? 'standard',
      routeSource: run.routeSource ?? null,
      tierId: run.tierId ?? null,
      supplierIds: run.supplierIds ?? null,
      countryFilters: run.countryFilters ?? null,
      manualNumbers: run.manualNumbers ?? null,
      useDbNumbers: run.useDbNumbers ?? true,
      addToDb: run.addToDb ?? false,
      codec: run.codec ?? 'G729',
      audioFileId: run.audioFileId ?? null,
      aniMode: run.aniMode ?? 'any',
      aniNumber: run.aniNumber ?? null,
      aniCountries: run.aniCountries ?? null,
      callsCount: run.callsCount ?? 5,
      maxDuration: run.maxDuration ?? 30,
      capacity: run.capacity ?? 1,
      status: run.status ?? 'pending',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      avgMos: null,
      avgPdd: null,
      avgJitter: null,
      avgPacketLoss: null,
      totalDurationSec: 0,
      totalCost: '0',
      startedAt: null,
      completedAt: null,
      createdAt: now
    };
    this.sipTestRuns.set(id, r);
    return r;
  }

  async updateSipTestRun(id: string, data: Partial<InsertSipTestRun>): Promise<SipTestRun | undefined> {
    const run = this.sipTestRuns.get(id);
    if (!run) return undefined;
    const updated = { ...run, ...data };
    this.sipTestRuns.set(id, updated);
    return updated;
  }

  // SIP Test Run Results (Individual call results)
  sipTestRunResults = new Map<string, SipTestRunResult>();

  async getSipTestRunResults(testRunId: string): Promise<SipTestRunResult[]> {
    return Array.from(this.sipTestRunResults.values()).filter(r => r.testRunId === testRunId);
  }

  async createSipTestRunResult(result: InsertSipTestRunResult): Promise<SipTestRunResult> {
    const id = randomUUID();
    const now = new Date();
    const r: SipTestRunResult = {
      id,
      testRunId: result.testRunId,
      callIndex: result.callIndex,
      destination: result.destination,
      aniUsed: result.aniUsed ?? null,
      supplierName: result.supplierName ?? null,
      tierName: result.tierName ?? null,
      status: result.status ?? 'pending',
      result: result.result ?? null,
      sipResponseCode: result.sipResponseCode ?? null,
      pddMs: result.pddMs ?? null,
      mosScore: result.mosScore ?? null,
      jitterMs: result.jitterMs ?? null,
      packetLossPercent: result.packetLossPercent ?? null,
      latencyMs: result.latencyMs ?? null,
      codecUsed: result.codecUsed ?? null,
      durationSec: result.durationSec ?? null,
      callCost: result.callCost ?? null,
      ratePerMin: result.ratePerMin ?? null,
      errorMessage: result.errorMessage ?? null,
      createdAt: now,
    };
    this.sipTestRunResults.set(id, r);
    return r;
  }

  // Webhooks
  async getWebhooks(customerId: string): Promise<Webhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.customerId === customerId);
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    return this.webhooks.get(id);
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const id = randomUUID();
    const now = new Date();
    const w: Webhook = {
      id,
      customerId: webhook.customerId ?? null,
      url: webhook.url,
      events: webhook.events ?? null,
      secret: webhook.secret ?? null,
      isActive: webhook.isActive ?? true,
      lastDeliveryAt: null,
      lastDeliveryStatus: null,
      createdAt: now,
      updatedAt: now
    };
    this.webhooks.set(id, w);
    return w;
  }

  async updateWebhook(id: string, data: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return undefined;
    const updated = { ...webhook, ...data, updatedAt: new Date() };
    this.webhooks.set(id, updated);
    return updated;
  }

  async deleteWebhook(id: string): Promise<boolean> {
    return this.webhooks.delete(id);
  }

  // Webhook Deliveries
  private webhookDeliveries = new Map<string, WebhookDelivery>();

  async getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return Array.from(this.webhookDeliveries.values())
      .filter(d => d.webhookId === webhookId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createWebhookDelivery(delivery: InsertWebhookDelivery): Promise<WebhookDelivery> {
    const id = randomUUID();
    const now = new Date();
    const newDelivery: WebhookDelivery = {
      id,
      webhookId: delivery.webhookId,
      event: delivery.event,
      payload: delivery.payload ?? null,
      responseStatus: delivery.responseStatus ?? null,
      responseBody: delivery.responseBody ?? null,
      deliveredAt: delivery.deliveredAt ?? null,
      retryCount: delivery.retryCount ?? 0,
      createdAt: now,
    };
    this.webhookDeliveries.set(id, newDelivery);
    return newDelivery;
  }

  async updateWebhookDelivery(id: string, data: Partial<InsertWebhookDelivery>): Promise<WebhookDelivery | undefined> {
    const existing = this.webhookDeliveries.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.webhookDeliveries.set(id, updated);
    return updated;
  }

  // Customer API Keys
  async getCustomerApiKeys(customerId: string): Promise<CustomerApiKey[]> {
    return Array.from(this.customerApiKeys.values()).filter(k => k.customerId === customerId);
  }

  async getCustomerApiKey(id: string): Promise<CustomerApiKey | undefined> {
    return this.customerApiKeys.get(id);
  }

  async createCustomerApiKey(apiKey: InsertCustomerApiKey): Promise<CustomerApiKey> {
    const id = randomUUID();
    const now = new Date();
    const k: CustomerApiKey = {
      id,
      customerId: apiKey.customerId,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      keyHash: apiKey.keyHash,
      permissions: apiKey.permissions ?? null,
      rateLimitPerMinute: apiKey.rateLimitPerMinute ?? 60,
      lastUsedAt: null,
      expiresAt: apiKey.expiresAt ?? null,
      isActive: apiKey.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.customerApiKeys.set(id, k);
    return k;
  }

  async updateCustomerApiKey(id: string, data: Partial<InsertCustomerApiKey>): Promise<CustomerApiKey | undefined> {
    const apiKey = this.customerApiKeys.get(id);
    if (!apiKey) return undefined;
    const updated = { ...apiKey, ...data, updatedAt: new Date() };
    this.customerApiKeys.set(id, updated);
    return updated;
  }

  async deleteCustomerApiKey(id: string): Promise<boolean> {
    return this.customerApiKeys.delete(id);
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

  // AI Voice Agents
  async getAiVoiceAgents(customerId: string): Promise<AiVoiceAgent[]> {
    return Array.from(this.aiVoiceAgents.values()).filter(a => a.customerId === customerId);
  }

  async getAllAiVoiceAgents(): Promise<AiVoiceAgent[]> {
    return Array.from(this.aiVoiceAgents.values());
  }

  async getAiVoiceAgent(id: string): Promise<AiVoiceAgent | undefined> {
    return this.aiVoiceAgents.get(id);
  }

  async createAiVoiceAgent(agent: InsertAiVoiceAgent): Promise<AiVoiceAgent> {
    const id = randomUUID();
    const now = new Date();
    const a: AiVoiceAgent = {
      id,
      customerId: agent.customerId,
      name: agent.name,
      description: agent.description ?? null,
      type: agent.type ?? "inbound",
      voiceId: agent.voiceId ?? null,
      voiceProvider: agent.voiceProvider ?? "openai",
      systemPrompt: agent.systemPrompt ?? null,
      greetingMessage: agent.greetingMessage ?? null,
      fallbackMessage: agent.fallbackMessage ?? null,
      maxCallDuration: agent.maxCallDuration ?? 600,
      status: agent.status ?? "draft",
      didId: agent.didId ?? null,
      webhookUrl: agent.webhookUrl ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoiceAgents.set(id, a);
    return a;
  }

  async updateAiVoiceAgent(id: string, data: Partial<InsertAiVoiceAgent>): Promise<AiVoiceAgent | undefined> {
    const agent = this.aiVoiceAgents.get(id);
    if (!agent) return undefined;
    const updated = { ...agent, ...data, updatedAt: new Date() };
    this.aiVoiceAgents.set(id, updated);
    return updated;
  }

  async deleteAiVoiceAgent(id: string): Promise<boolean> {
    return this.aiVoiceAgents.delete(id);
  }

  // AI Voice Flows
  async getAiVoiceFlows(agentId: string): Promise<AiVoiceFlow[]> {
    return Array.from(this.aiVoiceFlows.values()).filter(f => f.agentId === agentId);
  }

  async getAiVoiceFlow(id: string): Promise<AiVoiceFlow | undefined> {
    return this.aiVoiceFlows.get(id);
  }

  async createAiVoiceFlow(flow: InsertAiVoiceFlow): Promise<AiVoiceFlow> {
    const id = randomUUID();
    const now = new Date();
    const f: AiVoiceFlow = {
      id,
      agentId: flow.agentId,
      name: flow.name,
      flowData: flow.flowData ?? null,
      isDefault: flow.isDefault ?? false,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoiceFlows.set(id, f);
    return f;
  }

  async updateAiVoiceFlow(id: string, data: Partial<InsertAiVoiceFlow>): Promise<AiVoiceFlow | undefined> {
    const flow = this.aiVoiceFlows.get(id);
    if (!flow) return undefined;
    const updated = { ...flow, ...data, updatedAt: new Date() };
    this.aiVoiceFlows.set(id, updated);
    return updated;
  }

  async deleteAiVoiceFlow(id: string): Promise<boolean> {
    return this.aiVoiceFlows.delete(id);
  }

  // AI Voice Training Data
  async getAiVoiceTrainingData(agentId: string): Promise<AiVoiceTrainingData[]> {
    return Array.from(this.aiVoiceTrainingData.values()).filter(t => t.agentId === agentId);
  }

  async getAiVoiceTrainingDataItem(id: string): Promise<AiVoiceTrainingData | undefined> {
    return this.aiVoiceTrainingData.get(id);
  }

  async createAiVoiceTrainingData(data: InsertAiVoiceTrainingData): Promise<AiVoiceTrainingData> {
    const id = randomUUID();
    const now = new Date();
    const t: AiVoiceTrainingData = {
      id,
      agentId: data.agentId,
      category: data.category ?? null,
      question: data.question,
      answer: data.answer,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoiceTrainingData.set(id, t);
    return t;
  }

  async updateAiVoiceTrainingData(id: string, data: Partial<InsertAiVoiceTrainingData>): Promise<AiVoiceTrainingData | undefined> {
    const item = this.aiVoiceTrainingData.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data, updatedAt: new Date() };
    this.aiVoiceTrainingData.set(id, updated);
    return updated;
  }

  async deleteAiVoiceTrainingData(id: string): Promise<boolean> {
    return this.aiVoiceTrainingData.delete(id);
  }

  // AI Voice Campaigns
  async getAiVoiceCampaigns(customerId: string): Promise<AiVoiceCampaign[]> {
    return Array.from(this.aiVoiceCampaigns.values()).filter(c => c.customerId === customerId);
  }

  async getAiVoiceCampaign(id: string): Promise<AiVoiceCampaign | undefined> {
    return this.aiVoiceCampaigns.get(id);
  }

  async createAiVoiceCampaign(campaign: InsertAiVoiceCampaign): Promise<AiVoiceCampaign> {
    const id = randomUUID();
    const now = new Date();
    const c: AiVoiceCampaign = {
      id,
      customerId: campaign.customerId,
      agentId: campaign.agentId,
      name: campaign.name,
      description: campaign.description ?? null,
      contactList: campaign.contactList ?? null,
      scheduledAt: campaign.scheduledAt ?? null,
      maxConcurrentCalls: campaign.maxConcurrentCalls ?? 5,
      callsCompleted: campaign.callsCompleted ?? 0,
      callsTotal: campaign.callsTotal ?? 0,
      status: campaign.status ?? "draft",
      startedAt: campaign.startedAt ?? null,
      completedAt: campaign.completedAt ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoiceCampaigns.set(id, c);
    return c;
  }

  async updateAiVoiceCampaign(id: string, data: Partial<InsertAiVoiceCampaign>): Promise<AiVoiceCampaign | undefined> {
    const campaign = this.aiVoiceCampaigns.get(id);
    if (!campaign) return undefined;
    const updated = { ...campaign, ...data, updatedAt: new Date() };
    this.aiVoiceCampaigns.set(id, updated);
    return updated;
  }

  async deleteAiVoiceCampaign(id: string): Promise<boolean> {
    return this.aiVoiceCampaigns.delete(id);
  }

  // AI Voice Knowledge Bases
  async getAiVoiceKnowledgeBases(customerId?: string): Promise<AiVoiceKnowledgeBase[]> {
    let all = Array.from(this.aiVoiceKnowledgeBases.values());
    if (customerId) all = all.filter(kb => kb.customerId === customerId);
    return all;
  }

  async getAiVoiceKnowledgeBase(id: string): Promise<AiVoiceKnowledgeBase | undefined> {
    return this.aiVoiceKnowledgeBases.get(id);
  }

  async createAiVoiceKnowledgeBase(kb: InsertAiVoiceKnowledgeBase): Promise<AiVoiceKnowledgeBase> {
    const id = randomUUID();
    const now = new Date();
    const k: AiVoiceKnowledgeBase = {
      id,
      customerId: kb.customerId,
      name: kb.name,
      description: kb.description ?? null,
      connexcsKbId: kb.connexcsKbId ?? null,
      status: kb.status ?? "pending",
      documentCount: kb.documentCount ?? 0,
      totalTokens: kb.totalTokens ?? 0,
      learnedTopics: kb.learnedTopics ?? null,
      extractedFaqs: kb.extractedFaqs ?? null,
      keyPhrases: kb.keyPhrases ?? null,
      confidenceScore: kb.confidenceScore ?? null,
      trainingSummary: kb.trainingSummary ?? null,
      lastTrainedAt: kb.lastTrainedAt ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoiceKnowledgeBases.set(id, k);
    return k;
  }

  async updateAiVoiceKnowledgeBase(id: string, data: Partial<InsertAiVoiceKnowledgeBase>): Promise<AiVoiceKnowledgeBase | undefined> {
    const kb = this.aiVoiceKnowledgeBases.get(id);
    if (!kb) return undefined;
    const updated = { ...kb, ...data, updatedAt: new Date() };
    this.aiVoiceKnowledgeBases.set(id, updated);
    return updated;
  }

  async deleteAiVoiceKnowledgeBase(id: string): Promise<boolean> {
    return this.aiVoiceKnowledgeBases.delete(id);
  }

  // AI Voice KB Sources
  async getAiVoiceKbSources(knowledgeBaseId: string): Promise<AiVoiceKbSource[]> {
    return Array.from(this.aiVoiceKbSources.values()).filter(s => s.knowledgeBaseId === knowledgeBaseId);
  }

  async getAiVoiceKbSource(id: string): Promise<AiVoiceKbSource | undefined> {
    return this.aiVoiceKbSources.get(id);
  }

  async createAiVoiceKbSource(source: InsertAiVoiceKbSource): Promise<AiVoiceKbSource> {
    const id = randomUUID();
    const now = new Date();
    const s: AiVoiceKbSource = {
      id,
      knowledgeBaseId: source.knowledgeBaseId,
      name: source.name,
      sourceType: source.sourceType,
      content: source.content ?? null,
      fileUrl: source.fileUrl ?? null,
      mimeType: source.mimeType ?? null,
      fileSize: source.fileSize ?? null,
      status: source.status ?? "pending",
      tokenCount: source.tokenCount ?? 0,
      lastIndexedAt: source.lastIndexedAt ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoiceKbSources.set(id, s);
    return s;
  }

  async updateAiVoiceKbSource(id: string, data: Partial<InsertAiVoiceKbSource>): Promise<AiVoiceKbSource | undefined> {
    const s = this.aiVoiceKbSources.get(id);
    if (!s) return undefined;
    const updated = { ...s, ...data, updatedAt: new Date() };
    this.aiVoiceKbSources.set(id, updated);
    return updated;
  }

  async deleteAiVoiceKbSource(id: string): Promise<boolean> {
    return this.aiVoiceKbSources.delete(id);
  }

  // AI Voice Phonebooks
  async getAiVoicePhonebooks(customerId: string): Promise<AiVoicePhonebook[]> {
    return Array.from(this.aiVoicePhonebooks.values()).filter(p => p.customerId === customerId);
  }

  async getAiVoicePhonebook(id: string): Promise<AiVoicePhonebook | undefined> {
    return this.aiVoicePhonebooks.get(id);
  }

  async createAiVoicePhonebook(phonebook: InsertAiVoicePhonebook): Promise<AiVoicePhonebook> {
    const id = randomUUID();
    const now = new Date();
    const p: AiVoicePhonebook = {
      id,
      customerId: phonebook.customerId,
      name: phonebook.name,
      description: phonebook.description ?? null,
      contactCount: phonebook.contactCount ?? 0,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoicePhonebooks.set(id, p);
    return p;
  }

  async updateAiVoicePhonebook(id: string, data: Partial<InsertAiVoicePhonebook>): Promise<AiVoicePhonebook | undefined> {
    const p = this.aiVoicePhonebooks.get(id);
    if (!p) return undefined;
    const updated = { ...p, ...data, updatedAt: new Date() };
    this.aiVoicePhonebooks.set(id, updated);
    return updated;
  }

  async deleteAiVoicePhonebook(id: string): Promise<boolean> {
    return this.aiVoicePhonebooks.delete(id);
  }

  // AI Voice Contacts
  async getAiVoiceContacts(phonebookId: string): Promise<AiVoiceContact[]> {
    return Array.from(this.aiVoiceContacts.values()).filter(c => c.phonebookId === phonebookId);
  }

  async getAiVoiceContact(id: string): Promise<AiVoiceContact | undefined> {
    return this.aiVoiceContacts.get(id);
  }

  async createAiVoiceContact(contact: InsertAiVoiceContact): Promise<AiVoiceContact> {
    const id = randomUUID();
    const now = new Date();
    const c: AiVoiceContact = {
      id,
      phonebookId: contact.phonebookId,
      phoneNumber: contact.phoneNumber,
      firstName: contact.firstName ?? null,
      lastName: contact.lastName ?? null,
      email: contact.email ?? null,
      company: contact.company ?? null,
      customFields: contact.customFields ?? null,
      isActive: contact.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.aiVoiceContacts.set(id, c);
    return c;
  }

  async updateAiVoiceContact(id: string, data: Partial<InsertAiVoiceContact>): Promise<AiVoiceContact | undefined> {
    const c = this.aiVoiceContacts.get(id);
    if (!c) return undefined;
    const updated = { ...c, ...data, updatedAt: new Date() };
    this.aiVoiceContacts.set(id, updated);
    return updated;
  }

  async deleteAiVoiceContact(id: string): Promise<boolean> {
    return this.aiVoiceContacts.delete(id);
  }

  // AI Voice Call Logs
  async getAiVoiceCallLogs(agentId?: string, campaignId?: string): Promise<AiVoiceCallLog[]> {
    let logs = Array.from(this.aiVoiceCallLogs.values());
    if (agentId) {
      logs = logs.filter(l => l.agentId === agentId);
    }
    if (campaignId) {
      logs = logs.filter(l => l.campaignId === campaignId);
    }
    return logs;
  }

  async getAiVoiceCallLog(id: string): Promise<AiVoiceCallLog | undefined> {
    return this.aiVoiceCallLogs.get(id);
  }

  async createAiVoiceCallLog(log: InsertAiVoiceCallLog): Promise<AiVoiceCallLog> {
    const id = randomUUID();
    const now = new Date();
    const l: AiVoiceCallLog = {
      id,
      agentId: log.agentId,
      campaignId: log.campaignId ?? null,
      callId: log.callId ?? null,
      callerNumber: log.callerNumber ?? null,
      calledNumber: log.calledNumber ?? null,
      direction: log.direction ?? null,
      duration: log.duration ?? null,
      transcript: log.transcript ?? null,
      summary: log.summary ?? null,
      sentiment: log.sentiment ?? null,
      outcome: log.outcome ?? null,
      tokensUsed: log.tokensUsed ?? null,
      cost: log.cost ?? null,
      recordingUrl: log.recordingUrl ?? null,
      createdAt: now
    };
    this.aiVoiceCallLogs.set(id, l);
    return l;
  }

  async updateAiVoiceCallLog(id: string, data: Partial<InsertAiVoiceCallLog>): Promise<AiVoiceCallLog | undefined> {
    const l = this.aiVoiceCallLogs.get(id);
    if (!l) return undefined;
    const updated = { ...l, ...data };
    this.aiVoiceCallLogs.set(id, updated);
    return updated;
  }

  // CRM Connections
  async getCrmConnections(customerId: string): Promise<CrmConnection[]> {
    return Array.from(this.crmConnections.values()).filter(c => c.customerId === customerId);
  }

  async getCrmConnection(id: string): Promise<CrmConnection | undefined> {
    return this.crmConnections.get(id);
  }

  async createCrmConnection(connection: InsertCrmConnection): Promise<CrmConnection> {
    const id = randomUUID();
    const now = new Date();
    const c: CrmConnection = {
      id,
      customerId: connection.customerId,
      provider: connection.provider,
      name: connection.name,
      status: connection.status ?? "pending",
      instanceUrl: connection.instanceUrl ?? null,
      accessToken: connection.accessToken ?? null,
      refreshToken: connection.refreshToken ?? null,
      tokenExpiresAt: connection.tokenExpiresAt ?? null,
      scopes: connection.scopes ?? null,
      settings: connection.settings ?? null,
      lastSyncAt: connection.lastSyncAt ?? null,
      lastError: connection.lastError ?? null,
      isActive: connection.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.crmConnections.set(id, c);
    return c;
  }

  async updateCrmConnection(id: string, data: Partial<InsertCrmConnection>): Promise<CrmConnection | undefined> {
    const c = this.crmConnections.get(id);
    if (!c) return undefined;
    const updated = { ...c, ...data, updatedAt: new Date() };
    this.crmConnections.set(id, updated);
    return updated;
  }

  async deleteCrmConnection(id: string): Promise<boolean> {
    return this.crmConnections.delete(id);
  }

  // CRM Field Mappings
  async getCrmFieldMappings(connectionId: string): Promise<CrmFieldMapping[]> {
    return Array.from(this.crmFieldMappings.values()).filter(m => m.connectionId === connectionId);
  }

  async createCrmFieldMapping(mapping: InsertCrmFieldMapping): Promise<CrmFieldMapping> {
    const id = randomUUID();
    const now = new Date();
    const m: CrmFieldMapping = {
      id,
      connectionId: mapping.connectionId,
      localEntity: mapping.localEntity,
      localField: mapping.localField,
      crmEntity: mapping.crmEntity,
      crmField: mapping.crmField,
      direction: mapping.direction ?? "bidirectional",
      transformFunction: mapping.transformFunction ?? null,
      isActive: mapping.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.crmFieldMappings.set(id, m);
    return m;
  }

  async updateCrmFieldMapping(id: string, data: Partial<InsertCrmFieldMapping>): Promise<CrmFieldMapping | undefined> {
    const m = this.crmFieldMappings.get(id);
    if (!m) return undefined;
    const updated = { ...m, ...data, updatedAt: new Date() };
    this.crmFieldMappings.set(id, updated);
    return updated;
  }

  async deleteCrmFieldMapping(id: string): Promise<boolean> {
    return this.crmFieldMappings.delete(id);
  }

  // CRM Sync Settings
  async getCrmSyncSettings(connectionId: string): Promise<CrmSyncSettings | undefined> {
    return Array.from(this.crmSyncSettings.values()).find(s => s.connectionId === connectionId);
  }

  async upsertCrmSyncSettings(settings: InsertCrmSyncSettings): Promise<CrmSyncSettings> {
    const existing = await this.getCrmSyncSettings(settings.connectionId);
    const now = new Date();
    if (existing) {
      const updated = { ...existing, ...settings, updatedAt: now };
      this.crmSyncSettings.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const s: CrmSyncSettings = {
      id,
      connectionId: settings.connectionId,
      syncCallLogs: settings.syncCallLogs ?? true,
      syncContacts: settings.syncContacts ?? true,
      syncCampaigns: settings.syncCampaigns ?? false,
      syncInterval: settings.syncInterval ?? 15,
      autoCreateContacts: settings.autoCreateContacts ?? false,
      autoLogActivities: settings.autoLogActivities ?? true,
      contactMatchField: settings.contactMatchField ?? "phone",
      defaultOwnerEmail: settings.defaultOwnerEmail ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.crmSyncSettings.set(id, s);
    return s;
  }

  // CRM Sync Logs
  async getCrmSyncLogs(connectionId: string, limit = 50): Promise<CrmSyncLog[]> {
    const logs = Array.from(this.crmSyncLogs.values())
      .filter(l => l.connectionId === connectionId)
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0));
    return logs.slice(0, limit);
  }

  async createCrmSyncLog(log: InsertCrmSyncLog): Promise<CrmSyncLog> {
    const id = randomUUID();
    const l: CrmSyncLog = {
      id,
      connectionId: log.connectionId,
      syncType: log.syncType,
      direction: log.direction,
      status: log.status,
      recordsProcessed: log.recordsProcessed ?? 0,
      recordsCreated: log.recordsCreated ?? 0,
      recordsUpdated: log.recordsUpdated ?? 0,
      recordsFailed: log.recordsFailed ?? 0,
      errorDetails: log.errorDetails ?? null,
      startedAt: new Date(),
      completedAt: log.completedAt ?? null
    };
    this.crmSyncLogs.set(id, l);
    return l;
  }

  async updateCrmSyncLog(id: string, data: Partial<InsertCrmSyncLog>): Promise<CrmSyncLog | undefined> {
    const l = this.crmSyncLogs.get(id);
    if (!l) return undefined;
    const updated = { ...l, ...data };
    this.crmSyncLogs.set(id, updated);
    return updated;
  }

  // CRM Contact Mappings
  async getCrmContactMappings(connectionId: string): Promise<CrmContactMapping[]> {
    return Array.from(this.crmContactMappings.values()).filter(m => m.connectionId === connectionId);
  }

  async getCrmContactMappingByPhone(connectionId: string, phone: string): Promise<CrmContactMapping | undefined> {
    const normalized = phone.replace(/\D/g, "");
    return Array.from(this.crmContactMappings.values()).find(
      m => m.connectionId === connectionId && m.phoneNumber?.replace(/\D/g, "") === normalized
    );
  }

  async getCrmContactMappingByEmail(connectionId: string, email: string): Promise<CrmContactMapping | undefined> {
    return Array.from(this.crmContactMappings.values()).find(
      m => m.connectionId === connectionId && m.email?.toLowerCase() === email.toLowerCase()
    );
  }

  async createCrmContactMapping(mapping: InsertCrmContactMapping): Promise<CrmContactMapping> {
    const id = randomUUID();
    const now = new Date();
    const m: CrmContactMapping = {
      id,
      connectionId: mapping.connectionId,
      localContactId: mapping.localContactId ?? null,
      crmContactId: mapping.crmContactId,
      crmContactType: mapping.crmContactType ?? "Contact",
      phoneNumber: mapping.phoneNumber ?? null,
      email: mapping.email ?? null,
      fullName: mapping.fullName ?? null,
      crmData: mapping.crmData ?? null,
      lastSyncAt: now,
      createdAt: now
    };
    this.crmContactMappings.set(id, m);
    return m;
  }

  async updateCrmContactMapping(id: string, data: Partial<InsertCrmContactMapping>): Promise<CrmContactMapping | undefined> {
    const m = this.crmContactMappings.get(id);
    if (!m) return undefined;
    const updated = { ...m, ...data, lastSyncAt: new Date() };
    this.crmContactMappings.set(id, updated);
    return updated;
  }

  // CMS Themes
  async getCmsThemes(): Promise<CmsTheme[]> {
    return Array.from(this.cmsThemes.values());
  }

  async getCmsTheme(id: string): Promise<CmsTheme | undefined> {
    return this.cmsThemes.get(id);
  }

  async createCmsTheme(theme: InsertCmsTheme): Promise<CmsTheme> {
    const id = randomUUID();
    const now = new Date();
    const t: CmsTheme = {
      id,
      name: theme.name,
      description: theme.description ?? null,
      colors: theme.colors ?? null,
      typography: theme.typography ?? null,
      spacing: theme.spacing ?? null,
      borderRadius: theme.borderRadius ?? "md",
      logoUrl: theme.logoUrl ?? null,
      faviconUrl: theme.faviconUrl ?? null,
      isDefault: theme.isDefault ?? false,
      customerId: theme.customerId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.cmsThemes.set(id, t);
    return t;
  }

  async updateCmsTheme(id: string, data: Partial<InsertCmsTheme>): Promise<CmsTheme | undefined> {
    const theme = this.cmsThemes.get(id);
    if (!theme) return undefined;
    const updated = { ...theme, ...data, updatedAt: new Date() };
    this.cmsThemes.set(id, updated);
    return updated;
  }
  async deleteCmsTheme(id: string): Promise<boolean> {
    return this.cmsThemes.delete(id);
  }

  // CMS Pages
  async getCmsPages(): Promise<CmsPage[]> {
    return Array.from(this.cmsPages.values());
  }
  async getCmsPage(id: string): Promise<CmsPage | undefined> {
    return this.cmsPages.get(id);
  }
  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const id = randomUUID();
    const now = new Date();
    const newPage: CmsPage = {
      id,
      portalId: page.portalId,
      slug: page.slug,
      title: page.title,
      metaDescription: page.metaDescription ?? null,
      metaKeywords: page.metaKeywords ?? null,
      content: page.content ?? null,
      isPublished: page.isPublished ?? false,
      publishedAt: page.publishedAt ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.cmsPages.set(id, newPage);
    return newPage;
  }
  async updateCmsPage(id: string, data: Partial<InsertCmsPage>): Promise<CmsPage | undefined> {
    const page = this.cmsPages.get(id);
    if (!page) return undefined;
    const updated = { ...page, ...data, updatedAt: new Date() };
    this.cmsPages.set(id, updated);
    return updated;
  }
  async deleteCmsPage(id: string): Promise<boolean> {
    return this.cmsPages.delete(id);
  }

  // CMS Media Library
  async getCmsMediaItems(): Promise<CmsMediaItem[]> {
    return Array.from(this.cmsMediaItems.values());
  }
  async getCmsMediaItem(id: string): Promise<CmsMediaItem | undefined> {
    return this.cmsMediaItems.get(id);
  }
  async createCmsMediaItem(item: InsertCmsMediaItem): Promise<CmsMediaItem> {
    const id = randomUUID();
    const newItem: CmsMediaItem = {
      id,
      customerId: item.customerId ?? null,
      name: item.name,
      type: item.type,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl ?? null,
      altText: item.altText ?? null,
      folder: item.folder ?? null,
      size: item.size ?? null,
      tags: item.tags ?? null,
      createdAt: new Date(),
    };
    this.cmsMediaItems.set(id, newItem);
    return newItem;
  }
  async updateCmsMediaItem(id: string, data: Partial<InsertCmsMediaItem>): Promise<CmsMediaItem | undefined> {
    const item = this.cmsMediaItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.cmsMediaItems.set(id, updated);
    return updated;
  }
  async deleteCmsMediaItem(id: string): Promise<boolean> {
    return this.cmsMediaItems.delete(id);
  }

  // Tenant Branding
  async listTenantBrandings(): Promise<TenantBranding[]> {
    return Array.from(this.tenantBrandings.values());
  }

  async getTenantBranding(customerId: string): Promise<TenantBranding | undefined> {
    return Array.from(this.tenantBrandings.values()).find(b => b.customerId === customerId);
  }

  async createTenantBranding(branding: InsertTenantBranding): Promise<TenantBranding> {
    const id = randomUUID();
    const now = new Date();
    const b: TenantBranding = {
      id,
      customerId: branding.customerId,
      companyName: branding.companyName ?? null,
      logoUrl: branding.logoUrl ?? null,
      faviconUrl: branding.faviconUrl ?? null,
      primaryColor: branding.primaryColor ?? null,
      secondaryColor: branding.secondaryColor ?? null,
      customDomain: branding.customDomain ?? null,
      customDomainVerified: branding.customDomainVerified ?? false,
      emailFromName: branding.emailFromName ?? null,
      emailFromAddress: branding.emailFromAddress ?? null,
      footerText: branding.footerText ?? null,
      termsUrl: branding.termsUrl ?? null,
      privacyUrl: branding.privacyUrl ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.tenantBrandings.set(id, b);
    return b;
  }

  async updateTenantBranding(id: string, data: Partial<InsertTenantBranding>): Promise<TenantBranding | undefined> {
    const branding = this.tenantBrandings.get(id);
    if (!branding) return undefined;
    const updated = { ...branding, ...data, updatedAt: new Date() };
    this.tenantBrandings.set(id, updated);
    return updated;
  }

  // Portal Login Pages
  async getPortalLoginPages(): Promise<PortalLoginPage[]> {
    return Array.from(this.portalLoginPages.values());
  }

  async getPortalLoginPage(portalType: string): Promise<PortalLoginPage | undefined> {
    return Array.from(this.portalLoginPages.values()).find(p => p.portalType === portalType);
  }

  async createPortalLoginPage(page: InsertPortalLoginPage): Promise<PortalLoginPage> {
    const id = randomUUID();
    const now = new Date();
    const p: PortalLoginPage = {
      id,
      portalType: page.portalType,
      title: page.title,
      subtitle: page.subtitle ?? null,
      logoUrl: page.logoUrl ?? null,
      backgroundImageUrl: page.backgroundImageUrl ?? null,
      backgroundColor: page.backgroundColor ?? null,
      primaryColor: page.primaryColor ?? null,
      textColor: page.textColor ?? null,
      welcomeMessage: page.welcomeMessage ?? null,
      footerText: page.footerText ?? null,
      showSocialLogin: page.showSocialLogin ?? false,
      showRememberMe: page.showRememberMe ?? true,
      showForgotPassword: page.showForgotPassword ?? true,
      customCss: page.customCss ?? null,
      isActive: page.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.portalLoginPages.set(id, p);
    return p;
  }

  async updatePortalLoginPage(id: string, data: Partial<InsertPortalLoginPage>): Promise<PortalLoginPage | undefined> {
    const page = this.portalLoginPages.get(id);
    if (!page) return undefined;
    const updated = { ...page, ...data, updatedAt: new Date() };
    this.portalLoginPages.set(id, updated);
    return updated;
  }

  // Site Settings
  async getSiteSettings(category?: string): Promise<SiteSetting[]> {
    const all = Array.from(this.siteSettings.values());
    return category ? all.filter(s => s.category === category) : all;
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return Array.from(this.siteSettings.values()).find(s => s.key === key);
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(setting.key);
    const now = new Date();
    if (existing) {
      const updated = { ...existing, ...setting, updatedAt: now };
      this.siteSettings.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const s: SiteSetting = {
      id,
      key: setting.key,
      value: setting.value ?? null,
      category: setting.category,
      label: setting.label,
      description: setting.description ?? null,
      inputType: setting.inputType ?? "text",
      isPublic: setting.isPublic ?? false,
      createdAt: now,
      updatedAt: now
    };
    this.siteSettings.set(id, s);
    return s;
  }

  // Website Sections
  async getWebsiteSections(pageSlug?: string): Promise<WebsiteSection[]> {
    const all = Array.from(this.websiteSections.values());
    const filtered = pageSlug ? all.filter(s => s.pageSlug === pageSlug) : all;
    return filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getWebsiteSection(id: string): Promise<WebsiteSection | undefined> {
    return this.websiteSections.get(id);
  }

  async createWebsiteSection(section: InsertWebsiteSection): Promise<WebsiteSection> {
    const id = randomUUID();
    const now = new Date();
    const s: WebsiteSection = {
      id,
      pageSlug: section.pageSlug,
      sectionType: section.sectionType,
      title: section.title ?? null,
      subtitle: section.subtitle ?? null,
      content: section.content ?? null,
      backgroundImage: section.backgroundImage ?? null,
      backgroundColor: section.backgroundColor ?? null,
      displayOrder: section.displayOrder ?? 0,
      isVisible: section.isVisible ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.websiteSections.set(id, s);
    return s;
  }

  async updateWebsiteSection(id: string, data: Partial<InsertWebsiteSection>): Promise<WebsiteSection | undefined> {
    const section = this.websiteSections.get(id);
    if (!section) return undefined;
    const updated = { ...section, ...data, updatedAt: new Date() };
    this.websiteSections.set(id, updated);
    return updated;
  }

  async deleteWebsiteSection(id: string): Promise<boolean> {
    return this.websiteSections.delete(id);
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
    return Array.from(this.docCategories.values()).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getDocCategory(id: string): Promise<DocCategory | undefined> {
    return this.docCategories.get(id);
  }

  async createDocCategory(category: InsertDocCategory): Promise<DocCategory> {
    const id = randomUUID();
    const now = new Date();
    const c: DocCategory = {
      id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      icon: category.icon ?? null,
      displayOrder: category.displayOrder ?? 0,
      isPublished: category.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.docCategories.set(id, c);
    return c;
  }

  async updateDocCategory(id: string, data: Partial<InsertDocCategory>): Promise<DocCategory | undefined> {
    const category = this.docCategories.get(id);
    if (!category) return undefined;
    const updated = { ...category, ...data, updatedAt: new Date() };
    this.docCategories.set(id, updated);
    return updated;
  }

  async deleteDocCategory(id: string): Promise<boolean> {
    return this.docCategories.delete(id);
  }

  // Documentation Articles
  async getDocArticles(categoryId?: string): Promise<DocArticle[]> {
    const articles = Array.from(this.docArticles.values());
    const filtered = categoryId ? articles.filter(a => a.categoryId === categoryId) : articles;
    return filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getDocArticle(id: string): Promise<DocArticle | undefined> {
    return this.docArticles.get(id);
  }

  async getDocArticleBySlug(categorySlug: string, articleSlug: string): Promise<DocArticle | undefined> {
    const category = Array.from(this.docCategories.values()).find(c => c.slug === categorySlug);
    if (!category) return undefined;
    return Array.from(this.docArticles.values()).find(a => a.categoryId === category.id && a.slug === articleSlug);
  }

  async createDocArticle(article: InsertDocArticle): Promise<DocArticle> {
    const id = randomUUID();
    const now = new Date();
    const a: DocArticle = {
      id,
      categoryId: article.categoryId,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt ?? null,
      content: article.content ?? null,
      author: article.author ?? null,
      tags: article.tags ?? null,
      displayOrder: article.displayOrder ?? 0,
      isPublished: article.isPublished ?? false,
      publishedAt: article.publishedAt ?? null,
      viewCount: article.viewCount ?? 0,
      helpfulCount: article.helpfulCount ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    this.docArticles.set(id, a);
    return a;
  }

  async updateDocArticle(id: string, data: Partial<InsertDocArticle>): Promise<DocArticle | undefined> {
    const article = this.docArticles.get(id);
    if (!article) return undefined;
    const updated = { ...article, ...data, updatedAt: new Date() };
    this.docArticles.set(id, updated);
    return updated;
  }

  async deleteDocArticle(id: string): Promise<boolean> {
    return this.docArticles.delete(id);
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

  // Experience Manager (delegated to database repository)
  private emContentItems: Map<string, EmContentItem> = new Map();
  private emContentVersions: Map<string, EmContentVersion> = new Map();
  private emValidationResults: Map<string, EmValidationResult> = new Map();
  private emPublishHistory: Map<string, EmPublishHistory> = new Map();

  async getAllEmContentItems(): Promise<EmContentItem[]> {
    return Array.from(this.emContentItems.values());
  }

  async getEmContentItem(section: string, entityType: string, slug: string): Promise<EmContentItem | undefined> {
    const items = Array.from(this.emContentItems.values());
    for (const item of items) {
      if (item.section === section && item.entityType === entityType && item.slug === slug) {
        return item;
      }
    }
    return undefined;
  }

  async getEmContentItemById(id: string): Promise<EmContentItem | undefined> {
    return this.emContentItems.get(id);
  }

  async createEmContentItem(item: InsertEmContentItem): Promise<EmContentItem> {
    const id = randomUUID();
    const now = new Date();
    const contentItem: EmContentItem = {
      id,
      section: item.section,
      entityType: item.entityType,
      slug: item.slug,
      name: item.name,
      status: item.status ?? "draft",
      draftVersionId: item.draftVersionId ?? null,
      previewVersionId: item.previewVersionId ?? null,
      publishedVersionId: item.publishedVersionId ?? null,
      previewToken: item.previewToken ?? null,
      previewExpiresAt: item.previewExpiresAt ?? null,
      lastPublishedAt: item.lastPublishedAt ?? null,
      lastPublishedBy: item.lastPublishedBy ?? null,
      createdBy: item.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.emContentItems.set(id, contentItem);
    return contentItem;
  }

  async updateEmContentItem(id: string, data: Partial<InsertEmContentItem>): Promise<EmContentItem | undefined> {
    const item = this.emContentItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data, updatedAt: new Date() };
    this.emContentItems.set(id, updated as EmContentItem);
    return updated as EmContentItem;
  }

  async getEmContentVersion(id: string): Promise<EmContentVersion | undefined> {
    return this.emContentVersions.get(id);
  }

  async getLatestEmContentVersion(contentItemId: string): Promise<EmContentVersion | undefined> {
    let latest: EmContentVersion | undefined;
    const versions = Array.from(this.emContentVersions.values());
    for (const version of versions) {
      if (version.contentItemId === contentItemId) {
        if (!latest || version.version > latest.version) {
          latest = version;
        }
      }
    }
    return latest;
  }

  async createEmContentVersion(version: InsertEmContentVersion): Promise<EmContentVersion> {
    const id = randomUUID();
    const now = new Date();
    const contentVersion: EmContentVersion = {
      id,
      contentItemId: version.contentItemId,
      version: version.version,
      data: version.data,
      changeDescription: version.changeDescription ?? null,
      createdBy: version.createdBy ?? null,
      createdAt: now,
    };
    this.emContentVersions.set(id, contentVersion);
    return contentVersion;
  }

  async createEmValidationResult(result: InsertEmValidationResult): Promise<EmValidationResult> {
    const id = randomUUID();
    const now = new Date();
    const validationResult: EmValidationResult = {
      id,
      contentItemId: result.contentItemId,
      versionId: result.versionId,
      validationType: result.validationType,
      passed: result.passed,
      errors: result.errors ?? null,
      warnings: result.warnings ?? null,
      createdAt: now,
    };
    this.emValidationResults.set(id, validationResult);
    return validationResult;
  }

  async getEmPublishHistory(contentItemId: string): Promise<EmPublishHistory[]> {
    const history: EmPublishHistory[] = [];
    const entries = Array.from(this.emPublishHistory.values());
    for (const entry of entries) {
      if (entry.contentItemId === contentItemId) {
        history.push(entry);
      }
    }
    return history.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createEmPublishHistory(entry: InsertEmPublishHistory): Promise<EmPublishHistory> {
    const id = randomUUID();
    const now = new Date();
    const publishHistory: EmPublishHistory = {
      id,
      contentItemId: entry.contentItemId,
      fromVersionId: entry.fromVersionId ?? null,
      toVersionId: entry.toVersionId,
      action: entry.action,
      publishedBy: entry.publishedBy ?? null,
      note: entry.note ?? null,
      createdAt: now,
    };
    this.emPublishHistory.set(id, publishHistory);
    return publishHistory;
  }

  // Dev Tests
  private devTests: Map<string, DevTest> = new Map();

  async getDevTests(): Promise<DevTest[]> {
    return Array.from(this.devTests.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getDevTest(id: string): Promise<DevTest | undefined> {
    return this.devTests.get(id);
  }

  async createDevTest(test: InsertDevTest): Promise<DevTest> {
    const id = randomUUID();
    const now = new Date();
    const devTest: DevTest = {
      id,
      name: test.name,
      description: test.description ?? null,
      module: test.module,
      testSteps: test.testSteps ?? null,
      expectedResult: test.expectedResult ?? null,
      actualResult: test.actualResult ?? null,
      status: test.status,
      duration: test.duration ?? null,
      errorMessage: test.errorMessage ?? null,
      createdTestData: test.createdTestData ?? null,
      cleanedUp: test.cleanedUp ?? false,
      testedBy: test.testedBy ?? null,
      testedAt: test.testedAt ?? now,
      createdAt: now,
    };
    this.devTests.set(id, devTest);
    return devTest;
  }

  async updateDevTest(id: string, data: Partial<InsertDevTest>): Promise<DevTest | undefined> {
    const test = this.devTests.get(id);
    if (!test) return undefined;
    const updated = { ...test, ...data };
    this.devTests.set(id, updated as DevTest);
    return updated as DevTest;
  }

  async deleteDevTest(id: string): Promise<boolean> {
    return this.devTests.delete(id);
  }
}

export const storage = new MemStorage();
