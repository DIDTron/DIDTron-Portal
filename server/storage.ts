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
  type BonusType, type EmailTemplate, type EmailLog,
  type InsertBonusType, type InsertEmailTemplate, type InsertEmailLog,
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
  type EmContentItem, type InsertEmContentItem,
  type EmContentVersion, type InsertEmContentVersion,
  type EmValidationResult, type InsertEmValidationResult,
  type EmPublishHistory, type InsertEmPublishHistory,
  type DevTest, type InsertDevTest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

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
  createCarrier(carrier: InsertCarrier): Promise<Carrier>;
  updateCarrier(id: string, data: Partial<InsertCarrier>): Promise<Carrier | undefined>;
  deleteCarrier(id: string): Promise<boolean>;

  // Carrier Assignments
  getCarrierAssignment(carrierId: string): Promise<CarrierAssignment | undefined>;
  upsertCarrierAssignment(assignment: InsertCarrierAssignment): Promise<CarrierAssignment>;

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
  private tickets: Map<string, Ticket>;
  private ticketReplies: Map<string, TicketReply>;
  private invoices: Map<string, Invoice>;
  private payments: Map<string, Payment>;
  private promoCodes: Map<string, PromoCode>;
  private referrals: Map<string, Referral>;
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
    this.tickets = new Map();
    this.ticketReplies = new Map();
    this.invoices = new Map();
    this.payments = new Map();
    this.promoCodes = new Map();
    this.referrals = new Map();
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

    this.seedDefaultData();
  }

  private seedDefaultData() {
    const now = new Date();

    // Seed default customer categories
    const categories: CustomerCategory[] = [
      { id: randomUUID(), name: "SIP Trunk", code: "sip-trunk", description: "Wholesale SIP termination services", icon: "phone", displayOrder: 1, isActive: true, showOnWebsite: true, defaultBillingType: "prepaid", createdAt: now, updatedAt: now },
      { id: randomUUID(), name: "Enterprise", code: "enterprise", description: "Business PBX and unified communications", icon: "building", displayOrder: 2, isActive: true, showOnWebsite: true, defaultBillingType: "postpaid", createdAt: now, updatedAt: now },
      { id: randomUUID(), name: "Call Center", code: "call-center", description: "Inbound/outbound call center solutions", icon: "headphones", displayOrder: 3, isActive: true, showOnWebsite: true, defaultBillingType: "postpaid", createdAt: now, updatedAt: now },
      { id: randomUUID(), name: "Individual", code: "individual", description: "Personal VoIP services", icon: "user", displayOrder: 4, isActive: true, showOnWebsite: true, defaultBillingType: "prepaid", createdAt: now, updatedAt: now },
    ];
    categories.forEach(cat => this.customerCategories.set(cat.id, cat));

    // Seed default groups for each category
    const sipTrunkCat = categories[0];
    const enterpriseCat = categories[1];
    const callCenterCat = categories[2];
    const individualCat = categories[3];

    const groups: CustomerGroup[] = [
      { id: randomUUID(), categoryId: sipTrunkCat.id, name: "Standard", code: "sip-standard", description: "Standard SIP trunk customers", displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: sipTrunkCat.id, name: "Premium", code: "sip-premium", description: "Premium SIP trunk customers", displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: sipTrunkCat.id, name: "Wholesale", code: "sip-wholesale", description: "Wholesale partners", displayOrder: 3, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: enterpriseCat.id, name: "Small Business", code: "ent-smb", description: "Small business customers", displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: enterpriseCat.id, name: "Mid-Market", code: "ent-mid", description: "Mid-market enterprises", displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: enterpriseCat.id, name: "Large Enterprise", code: "ent-large", description: "Large enterprise accounts", displayOrder: 3, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: callCenterCat.id, name: "Inbound", code: "cc-inbound", description: "Inbound call centers", displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: callCenterCat.id, name: "Outbound", code: "cc-outbound", description: "Outbound call centers", displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: callCenterCat.id, name: "Blended", code: "cc-blended", description: "Blended call centers", displayOrder: 3, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: individualCat.id, name: "Basic", code: "ind-basic", description: "Basic individual users", displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), categoryId: individualCat.id, name: "Power User", code: "ind-power", description: "Power users", displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
    ];
    groups.forEach(grp => this.customerGroups.set(grp.id, grp));

    // Integrations are now seeded in PostgreSQL via seedIntegrations() in index.ts
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
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
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Customer Categories
  async getCustomerCategories(): Promise<CustomerCategory[]> {
    return Array.from(this.customerCategories.values()).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getCustomerCategory(id: string): Promise<CustomerCategory | undefined> {
    return this.customerCategories.get(id);
  }

  async createCustomerCategory(category: InsertCustomerCategory): Promise<CustomerCategory> {
    const id = randomUUID();
    const now = new Date();
    const cat: CustomerCategory = {
      id,
      name: category.name,
      code: category.code,
      description: category.description ?? null,
      icon: category.icon ?? null,
      displayOrder: category.displayOrder ?? 0,
      isActive: category.isActive ?? true,
      showOnWebsite: category.showOnWebsite ?? true,
      defaultBillingType: category.defaultBillingType ?? "prepaid",
      createdAt: now,
      updatedAt: now
    };
    this.customerCategories.set(id, cat);
    return cat;
  }

  async updateCustomerCategory(id: string, data: Partial<InsertCustomerCategory>): Promise<CustomerCategory | undefined> {
    const cat = this.customerCategories.get(id);
    if (!cat) return undefined;
    const updated = { ...cat, ...data, updatedAt: new Date() };
    this.customerCategories.set(id, updated);
    return updated;
  }

  async deleteCustomerCategory(id: string): Promise<boolean> {
    return this.customerCategories.delete(id);
  }

  // Customer Groups
  async getCustomerGroups(categoryId?: string): Promise<CustomerGroup[]> {
    const groups = Array.from(this.customerGroups.values());
    if (categoryId) {
      return groups.filter(g => g.categoryId === categoryId).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }
    return groups.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getCustomerGroup(id: string): Promise<CustomerGroup | undefined> {
    return this.customerGroups.get(id);
  }

  async createCustomerGroup(group: InsertCustomerGroup): Promise<CustomerGroup> {
    const id = randomUUID();
    const now = new Date();
    const grp: CustomerGroup = {
      id,
      categoryId: group.categoryId ?? null,
      name: group.name,
      code: group.code,
      description: group.description ?? null,
      displayOrder: group.displayOrder ?? 0,
      isActive: group.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.customerGroups.set(id, grp);
    return grp;
  }

  async updateCustomerGroup(id: string, data: Partial<InsertCustomerGroup>): Promise<CustomerGroup | undefined> {
    const grp = this.customerGroups.get(id);
    if (!grp) return undefined;
    const updated = { ...grp, ...data, updatedAt: new Date() };
    this.customerGroups.set(id, updated);
    return updated;
  }

  async deleteCustomerGroup(id: string): Promise<boolean> {
    return this.customerGroups.delete(id);
  }

  // Customers
  async getCustomers(categoryId?: string, groupId?: string): Promise<Customer[]> {
    let customers = Array.from(this.customers.values());
    if (categoryId) customers = customers.filter(c => c.categoryId === categoryId);
    if (groupId) customers = customers.filter(c => c.groupId === groupId);
    return customers;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  async getCustomerByReferralCode(code: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.referralCode === code);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const now = new Date();
    const accountNumber = `DT${Date.now().toString(36).toUpperCase()}`;
    const referralCode = `REF${randomUUID().slice(0, 8).toUpperCase()}`;
    const cust: Customer = {
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
      createdAt: now,
      updatedAt: now
    };
    this.customers.set(id, cust);
    return cust;
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const cust = this.customers.get(id);
    if (!cust) return undefined;
    const updated = { ...cust, ...data, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
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

  // POPs
  async getPops(): Promise<Pop[]> {
    return Array.from(this.pops.values()).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getPop(id: string): Promise<Pop | undefined> {
    return this.pops.get(id);
  }

  async createPop(pop: InsertPop): Promise<Pop> {
    const id = randomUUID();
    const now = new Date();
    const p: Pop = {
      id,
      name: pop.name,
      code: pop.code,
      fqdn: pop.fqdn,
      ipAddress: pop.ipAddress ?? null,
      region: pop.region ?? null,
      country: pop.country ?? null,
      city: pop.city ?? null,
      description: pop.description ?? null,
      isActive: pop.isActive ?? true,
      displayOrder: pop.displayOrder ?? 0,
      connexcsPopId: pop.connexcsPopId ?? null,
      status: pop.status ?? "active",
      createdAt: now,
      updatedAt: now
    };
    this.pops.set(id, p);
    return p;
  }

  async updatePop(id: string, data: Partial<InsertPop>): Promise<Pop | undefined> {
    const pop = this.pops.get(id);
    if (!pop) return undefined;
    const updated = { ...pop, ...data, updatedAt: new Date() };
    this.pops.set(id, updated);
    return updated;
  }

  async deletePop(id: string): Promise<boolean> {
    return this.pops.delete(id);
  }

  // Voice Tiers
  async getVoiceTiers(): Promise<VoiceTier[]> {
    return Array.from(this.voiceTiers.values()).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getVoiceTier(id: string): Promise<VoiceTier | undefined> {
    return this.voiceTiers.get(id);
  }

  async createVoiceTier(tier: InsertVoiceTier): Promise<VoiceTier> {
    const id = randomUUID();
    const now = new Date();
    const t: VoiceTier = {
      id,
      name: tier.name,
      code: tier.code,
      description: tier.description ?? null,
      asrPercent: tier.asrPercent ?? null,
      acdSeconds: tier.acdSeconds ?? null,
      pddMs: tier.pddMs ?? null,
      baseRate: tier.baseRate ?? null,
      displayOrder: tier.displayOrder ?? 0,
      isActive: tier.isActive ?? true,
      showOnWebsite: tier.showOnWebsite ?? true,
      status: tier.status ?? "active",
      createdAt: now,
      updatedAt: now
    };
    this.voiceTiers.set(id, t);
    return t;
  }

  async updateVoiceTier(id: string, data: Partial<InsertVoiceTier>): Promise<VoiceTier | undefined> {
    const tier = this.voiceTiers.get(id);
    if (!tier) return undefined;
    const updated = { ...tier, ...data, updatedAt: new Date() };
    this.voiceTiers.set(id, updated);
    return updated;
  }

  async deleteVoiceTier(id: string): Promise<boolean> {
    return this.voiceTiers.delete(id);
  }

  // Codecs
  async getCodecs(): Promise<Codec[]> {
    return Array.from(this.codecs.values()).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }

  async getCodec(id: string): Promise<Codec | undefined> {
    return this.codecs.get(id);
  }

  async createCodec(codec: InsertCodec): Promise<Codec> {
    const id = randomUUID();
    const now = new Date();
    const c: Codec = {
      id,
      name: codec.name,
      code: codec.code,
      description: codec.description ?? null,
      priority: codec.priority ?? 0,
      isActive: codec.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.codecs.set(id, c);
    return c;
  }

  async updateCodec(id: string, data: Partial<InsertCodec>): Promise<Codec | undefined> {
    const codec = this.codecs.get(id);
    if (!codec) return undefined;
    const updated = { ...codec, ...data, updatedAt: new Date() };
    this.codecs.set(id, updated);
    return updated;
  }

  async deleteCodec(id: string): Promise<boolean> {
    return this.codecs.delete(id);
  }

  // Channel Plans
  async getChannelPlans(): Promise<ChannelPlan[]> {
    return Array.from(this.channelPlans.values()).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getChannelPlan(id: string): Promise<ChannelPlan | undefined> {
    return this.channelPlans.get(id);
  }

  async createChannelPlan(plan: InsertChannelPlan): Promise<ChannelPlan> {
    const id = randomUUID();
    const now = new Date();
    const p: ChannelPlan = {
      id,
      name: plan.name,
      code: plan.code,
      description: plan.description ?? null,
      channels: plan.channels,
      cps: plan.cps,
      monthlyPrice: plan.monthlyPrice ?? null,
      setupFee: plan.setupFee ?? "0",
      displayOrder: plan.displayOrder ?? 0,
      isActive: plan.isActive ?? true,
      showOnWebsite: plan.showOnWebsite ?? true,
      status: plan.status ?? "active",
      createdAt: now,
      updatedAt: now
    };
    this.channelPlans.set(id, p);
    return p;
  }

  async updateChannelPlan(id: string, data: Partial<InsertChannelPlan>): Promise<ChannelPlan | undefined> {
    const plan = this.channelPlans.get(id);
    if (!plan) return undefined;
    const updated = { ...plan, ...data, updatedAt: new Date() };
    this.channelPlans.set(id, updated);
    return updated;
  }

  async deleteChannelPlan(id: string): Promise<boolean> {
    return this.channelPlans.delete(id);
  }

  // Carriers
  async getCarriers(): Promise<Carrier[]> {
    return Array.from(this.carriers.values());
  }

  async getCarrier(id: string): Promise<Carrier | undefined> {
    return this.carriers.get(id);
  }

  async createCarrier(carrier: InsertCarrier): Promise<Carrier> {
    const id = randomUUID();
    const now = new Date();
    const c: Carrier = {
      id,
      name: carrier.name,
      code: carrier.code,
      type: carrier.type ?? "wholesale",
      description: carrier.description ?? null,
      status: carrier.status ?? "active",
      sipHost: carrier.sipHost ?? null,
      sipPort: carrier.sipPort ?? 5060,
      sipUsername: carrier.sipUsername ?? null,
      sipPassword: carrier.sipPassword ?? null,
      techPrefix: carrier.techPrefix ?? null,
      connexcsCarrierId: carrier.connexcsCarrierId ?? null,
      billingEmail: carrier.billingEmail ?? null,
      technicalEmail: carrier.technicalEmail ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.carriers.set(id, c);
    return c;
  }

  async updateCarrier(id: string, data: Partial<InsertCarrier>): Promise<Carrier | undefined> {
    const carrier = this.carriers.get(id);
    if (!carrier) return undefined;
    const updated = { ...carrier, ...data, updatedAt: new Date() };
    this.carriers.set(id, updated);
    return updated;
  }

  async deleteCarrier(id: string): Promise<boolean> {
    return this.carriers.delete(id);
  }

  // Carrier Assignments
  async getCarrierAssignment(carrierId: string): Promise<CarrierAssignment | undefined> {
    return Array.from(this.carrierAssignments.values()).find(a => a.carrierId === carrierId);
  }

  async upsertCarrierAssignment(assignment: InsertCarrierAssignment): Promise<CarrierAssignment> {
    const existing = Array.from(this.carrierAssignments.values()).find(a => a.carrierId === assignment.carrierId);
    if (existing) {
      const updated: CarrierAssignment = { ...existing, ...assignment };
      this.carrierAssignments.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const now = new Date();
    const a: CarrierAssignment = {
      id,
      carrierId: assignment.carrierId,
      assignmentType: assignment.assignmentType ?? "all",
      categoryIds: assignment.categoryIds ?? null,
      groupIds: assignment.groupIds ?? null,
      customerIds: assignment.customerIds ?? null,
      createdAt: now,
    };
    this.carrierAssignments.set(id, a);
    return a;
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

  // Routes
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const now = new Date();
    const r: Route = {
      id,
      name: route.name,
      prefix: route.prefix,
      destination: route.destination ?? null,
      carrierId: route.carrierId ?? null,
      voiceTierId: route.voiceTierId ?? null,
      priority: route.priority ?? 1,
      weight: route.weight ?? 100,
      rate: route.rate ?? null,
      status: route.status ?? "active",
      connexcsRouteId: route.connexcsRouteId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.routes.set(id, r);
    return r;
  }

  async updateRoute(id: string, data: Partial<InsertRoute>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;
    const updated = { ...route, ...data, updatedAt: new Date() };
    this.routes.set(id, updated);
    return updated;
  }

  async deleteRoute(id: string): Promise<boolean> {
    return this.routes.delete(id);
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

  // DID Countries
  async getDidCountries(): Promise<DidCountry[]> {
    return Array.from(this.didCountries.values()).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getDidCountry(id: string): Promise<DidCountry | undefined> {
    return this.didCountries.get(id);
  }

  async createDidCountry(country: InsertDidCountry): Promise<DidCountry> {
    const id = randomUUID();
    const now = new Date();
    const c: DidCountry = {
      id,
      name: country.name,
      isoCode: country.isoCode,
      dialCode: country.dialCode,
      kycRequired: country.kycRequired ?? false,
      kycDocuments: country.kycDocuments ?? null,
      isActive: country.isActive ?? true,
      displayOrder: country.displayOrder ?? 0,
      createdAt: now,
      updatedAt: now
    };
    this.didCountries.set(id, c);
    return c;
  }

  async updateDidCountry(id: string, data: Partial<InsertDidCountry>): Promise<DidCountry | undefined> {
    const country = this.didCountries.get(id);
    if (!country) return undefined;
    const updated = { ...country, ...data, updatedAt: new Date() };
    this.didCountries.set(id, updated);
    return updated;
  }

  async deleteDidCountry(id: string): Promise<boolean> {
    return this.didCountries.delete(id);
  }

  // DID Providers
  async getDidProviders(): Promise<DidProvider[]> {
    return Array.from(this.didProviders.values());
  }

  async getDidProvider(id: string): Promise<DidProvider | undefined> {
    return this.didProviders.get(id);
  }

  async createDidProvider(provider: InsertDidProvider): Promise<DidProvider> {
    const id = randomUUID();
    const now = new Date();
    const p: DidProvider = {
      id,
      name: provider.name,
      code: provider.code,
      apiEndpoint: provider.apiEndpoint ?? null,
      apiKey: provider.apiKey ?? null,
      countryIds: provider.countryIds ?? null,
      isActive: provider.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.didProviders.set(id, p);
    return p;
  }

  async updateDidProvider(id: string, data: Partial<InsertDidProvider>): Promise<DidProvider | undefined> {
    const provider = this.didProviders.get(id);
    if (!provider) return undefined;
    const updated = { ...provider, ...data, updatedAt: new Date() };
    this.didProviders.set(id, updated);
    return updated;
  }

  async deleteDidProvider(id: string): Promise<boolean> {
    return this.didProviders.delete(id);
  }

  // DIDs
  async getDids(customerId?: string): Promise<Did[]> {
    const dids = Array.from(this.dids.values());
    if (customerId) return dids.filter(d => d.customerId === customerId);
    return dids;
  }

  async getDid(id: string): Promise<Did | undefined> {
    return this.dids.get(id);
  }

  async createDid(did: InsertDid): Promise<Did> {
    const id = randomUUID();
    const now = new Date();
    const d: Did = {
      id,
      number: did.number,
      countryId: did.countryId ?? null,
      providerId: did.providerId ?? null,
      customerId: did.customerId ?? null,
      status: did.status ?? "available",
      monthlyPrice: did.monthlyPrice ?? null,
      setupFee: did.setupFee ?? "0",
      destinationType: did.destinationType ?? null,
      destination: did.destination ?? null,
      failoverDestination: did.failoverDestination ?? null,
      ringTimeout: did.ringTimeout ?? 30,
      connexcsDidId: did.connexcsDidId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.dids.set(id, d);
    return d;
  }

  async updateDid(id: string, data: Partial<InsertDid>): Promise<Did | undefined> {
    const did = this.dids.get(id);
    if (!did) return undefined;
    const updated = { ...did, ...data, updatedAt: new Date() };
    this.dids.set(id, updated);
    return updated;
  }

  // SIP Trunks
  async getSipTrunks(customerId: string): Promise<SipTrunk[]> {
    return Array.from(this.sipTrunks.values()).filter(t => t.customerId === customerId);
  }

  async getSipTrunk(id: string): Promise<SipTrunk | undefined> {
    return this.sipTrunks.get(id);
  }

  async createSipTrunk(trunk: InsertSipTrunk): Promise<SipTrunk> {
    const id = randomUUID();
    const now = new Date();
    const t: SipTrunk = {
      id,
      customerId: trunk.customerId,
      name: trunk.name,
      username: trunk.username,
      password: trunk.password,
      popId: trunk.popId ?? null,
      voiceTierId: trunk.voiceTierId ?? null,
      channelPlanId: trunk.channelPlanId ?? null,
      ipWhitelist: trunk.ipWhitelist ?? null,
      codecIds: trunk.codecIds ?? null,
      authMethod: trunk.authMethod ?? "user_pass",
      status: trunk.status ?? "active",
      connexcsTrunkId: trunk.connexcsTrunkId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.sipTrunks.set(id, t);
    return t;
  }

  async updateSipTrunk(id: string, data: Partial<InsertSipTrunk>): Promise<SipTrunk | undefined> {
    const trunk = this.sipTrunks.get(id);
    if (!trunk) return undefined;
    const updated = { ...trunk, ...data, updatedAt: new Date() };
    this.sipTrunks.set(id, updated);
    return updated;
  }

  async deleteSipTrunk(id: string): Promise<boolean> {
    return this.sipTrunks.delete(id);
  }

  // Extensions
  async getExtensions(customerId: string): Promise<Extension[]> {
    return Array.from(this.extensions.values()).filter(e => e.customerId === customerId);
  }

  async getExtension(id: string): Promise<Extension | undefined> {
    return this.extensions.get(id);
  }

  async createExtension(ext: InsertExtension): Promise<Extension> {
    const id = randomUUID();
    const now = new Date();
    const e: Extension = {
      id,
      customerId: ext.customerId,
      extension: ext.extension,
      name: ext.name,
      email: ext.email ?? null,
      sipUsername: ext.sipUsername,
      sipPassword: ext.sipPassword,
      callerId: ext.callerId ?? null,
      outboundDidId: ext.outboundDidId ?? null,
      voicemailEnabled: ext.voicemailEnabled ?? true,
      voicemailPin: ext.voicemailPin ?? null,
      voicemailEmail: ext.voicemailEmail ?? null,
      voicemailAttachAudio: ext.voicemailAttachAudio ?? true,
      ringTimeout: ext.ringTimeout ?? 20,
      dndEnabled: ext.dndEnabled ?? false,
      callWaitingEnabled: ext.callWaitingEnabled ?? true,
      forwardingEnabled: ext.forwardingEnabled ?? false,
      forwardingDestination: ext.forwardingDestination ?? null,
      status: ext.status ?? "active",
      connexcsExtensionId: ext.connexcsExtensionId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.extensions.set(id, e);
    return e;
  }

  async updateExtension(id: string, data: Partial<InsertExtension>): Promise<Extension | undefined> {
    const ext = this.extensions.get(id);
    if (!ext) return undefined;
    const updated = { ...ext, ...data, updatedAt: new Date() };
    this.extensions.set(id, updated);
    return updated;
  }

  async deleteExtension(id: string): Promise<boolean> {
    return this.extensions.delete(id);
  }

  // IVRs
  async getIvrs(customerId: string): Promise<Ivr[]> {
    return Array.from(this.ivrs.values()).filter(i => i.customerId === customerId);
  }

  async getIvr(id: string): Promise<Ivr | undefined> {
    return this.ivrs.get(id);
  }

  async createIvr(ivr: InsertIvr): Promise<Ivr> {
    const id = randomUUID();
    const now = new Date();
    const i: Ivr = {
      id,
      customerId: ivr.customerId,
      name: ivr.name,
      description: ivr.description ?? null,
      greetingType: ivr.greetingType ?? "tts",
      greetingText: ivr.greetingText ?? null,
      greetingAudioUrl: ivr.greetingAudioUrl ?? null,
      timeout: ivr.timeout ?? 10,
      maxRetries: ivr.maxRetries ?? 3,
      invalidDestination: ivr.invalidDestination ?? null,
      timeoutDestination: ivr.timeoutDestination ?? null,
      isActive: ivr.isActive ?? true,
      connexcsIvrId: ivr.connexcsIvrId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.ivrs.set(id, i);
    return i;
  }

  async updateIvr(id: string, data: Partial<InsertIvr>): Promise<Ivr | undefined> {
    const ivr = this.ivrs.get(id);
    if (!ivr) return undefined;
    const updated = { ...ivr, ...data, updatedAt: new Date() };
    this.ivrs.set(id, updated);
    return updated;
  }

  async deleteIvr(id: string): Promise<boolean> {
    return this.ivrs.delete(id);
  }

  // Ring Groups
  async getRingGroups(customerId: string): Promise<RingGroup[]> {
    return Array.from(this.ringGroups.values()).filter(r => r.customerId === customerId);
  }

  async getRingGroup(id: string): Promise<RingGroup | undefined> {
    return this.ringGroups.get(id);
  }

  async createRingGroup(rg: InsertRingGroup): Promise<RingGroup> {
    const id = randomUUID();
    const now = new Date();
    const r: RingGroup = {
      id,
      customerId: rg.customerId,
      name: rg.name,
      extension: rg.extension ?? null,
      strategy: rg.strategy ?? "ring_all",
      ringTimeout: rg.ringTimeout ?? 20,
      noAnswerDestination: rg.noAnswerDestination ?? null,
      isActive: rg.isActive ?? true,
      connexcsRingGroupId: rg.connexcsRingGroupId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.ringGroups.set(id, r);
    return r;
  }

  async updateRingGroup(id: string, data: Partial<InsertRingGroup>): Promise<RingGroup | undefined> {
    const rg = this.ringGroups.get(id);
    if (!rg) return undefined;
    const updated = { ...rg, ...data, updatedAt: new Date() };
    this.ringGroups.set(id, updated);
    return updated;
  }

  async deleteRingGroup(id: string): Promise<boolean> {
    return this.ringGroups.delete(id);
  }

  // Queues
  async getQueues(customerId: string): Promise<Queue[]> {
    return Array.from(this.queues.values()).filter(q => q.customerId === customerId);
  }

  async getQueue(id: string): Promise<Queue | undefined> {
    return this.queues.get(id);
  }

  async createQueue(queue: InsertQueue): Promise<Queue> {
    const id = randomUUID();
    const now = new Date();
    const q: Queue = {
      id,
      customerId: queue.customerId,
      name: queue.name,
      extension: queue.extension ?? null,
      strategy: queue.strategy ?? "round_robin",
      maxWaitTime: queue.maxWaitTime ?? 300,
      announcePosition: queue.announcePosition ?? true,
      holdMusicUrl: queue.holdMusicUrl ?? null,
      timeoutDestination: queue.timeoutDestination ?? null,
      isActive: queue.isActive ?? true,
      connexcsQueueId: queue.connexcsQueueId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.queues.set(id, q);
    return q;
  }

  async updateQueue(id: string, data: Partial<InsertQueue>): Promise<Queue | undefined> {
    const queue = this.queues.get(id);
    if (!queue) return undefined;
    const updated = { ...queue, ...data, updatedAt: new Date() };
    this.queues.set(id, updated);
    return updated;
  }

  async deleteQueue(id: string): Promise<boolean> {
    return this.queues.delete(id);
  }

  // Tickets
  async getTickets(customerId?: string): Promise<Ticket[]> {
    const tickets = Array.from(this.tickets.values());
    if (customerId) return tickets.filter(t => t.customerId === customerId);
    return tickets;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const now = new Date();
    const ticketNumber = `TKT${Date.now().toString(36).toUpperCase()}`;
    const t: Ticket = {
      id,
      ticketNumber,
      customerId: ticket.customerId ?? null,
      userId: ticket.userId ?? null,
      subject: ticket.subject,
      description: ticket.description ?? null,
      category: ticket.category ?? null,
      priority: ticket.priority ?? "medium",
      status: ticket.status ?? "open",
      assignedTo: ticket.assignedTo ?? null,
      resolvedAt: ticket.resolvedAt ?? null,
      closedAt: ticket.closedAt ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.tickets.set(id, t);
    return t;
  }

  async updateTicket(id: string, data: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    const updated = { ...ticket, ...data, updatedAt: new Date() };
    this.tickets.set(id, updated);
    return updated;
  }

  // Ticket Replies
  async getTicketReplies(ticketId: string): Promise<TicketReply[]> {
    return Array.from(this.ticketReplies.values())
      .filter(r => r.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createTicketReply(reply: InsertTicketReply): Promise<TicketReply> {
    const id = randomUUID();
    const now = new Date();
    const r: TicketReply = {
      id,
      ticketId: reply.ticketId,
      userId: reply.userId ?? null,
      message: reply.message,
      isInternal: reply.isInternal ?? false,
      attachments: reply.attachments ?? null,
      createdAt: now
    };
    this.ticketReplies.set(id, r);
    return r;
  }

  // Invoices
  async getInvoices(customerId?: string): Promise<Invoice[]> {
    const all = Array.from(this.invoices.values());
    if (customerId) return all.filter(i => i.customerId === customerId);
    return all;
  }
  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    const id = randomUUID();
    const now = new Date();
    const inv: Invoice = {
      id,
      customerId: invoice.customerId || "",
      invoiceNumber: invoice.invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}`,
      amount: invoice.amount || "0",
      tax: invoice.tax || "0",
      total: invoice.total || "0",
      currency: invoice.currency || "USD",
      status: invoice.status || "pending",
      dueDate: invoice.dueDate || null,
      paidAt: invoice.paidAt || null,
      pdfUrl: invoice.pdfUrl || null,
      createdAt: now,
    };
    this.invoices.set(id, inv);
    return inv;
  }
  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined> {
    const inv = this.invoices.get(id);
    if (!inv) return undefined;
    const updated = { ...inv, ...data };
    this.invoices.set(id, updated);
    return updated;
  }
  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Payments
  async getPayments(customerId?: string): Promise<Payment[]> {
    const all = Array.from(this.payments.values());
    if (customerId) return all.filter(p => p.customerId === customerId);
    return all;
  }
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const now = new Date();
    const pay: Payment = {
      id,
      customerId: payment.customerId,
      amount: payment.amount,
      currency: payment.currency || "USD",
      paymentMethod: payment.paymentMethod || null,
      transactionId: payment.transactionId || null,
      stripePaymentIntentId: payment.stripePaymentIntentId || null,
      paypalTransactionId: payment.paypalTransactionId || null,
      status: payment.status || "pending",
      description: payment.description || null,
      createdAt: now,
    };
    this.payments.set(id, pay);
    return pay;
  }
  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const pay = this.payments.get(id);
    if (!pay) return undefined;
    const updated = { ...pay, ...data };
    this.payments.set(id, updated);
    return updated;
  }
  async deletePayment(id: string): Promise<boolean> {
    return this.payments.delete(id);
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return Array.from(this.promoCodes.values());
  }
  async getPromoCode(id: string): Promise<PromoCode | undefined> {
    return this.promoCodes.get(id);
  }
  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    return Array.from(this.promoCodes.values()).find(p => p.code === code);
  }
  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const id = randomUUID();
    const now = new Date();
    const promo: PromoCode = {
      id,
      code: promoCode.code,
      description: promoCode.description || null,
      discountType: promoCode.discountType || "percentage",
      discountValue: promoCode.discountValue,
      applyTo: promoCode.applyTo || "all",
      maxUses: promoCode.maxUses || null,
      usedCount: promoCode.usedCount || 0,
      minPurchase: promoCode.minPurchase || null,
      validFrom: promoCode.validFrom || null,
      validUntil: promoCode.validUntil || null,
      isActive: promoCode.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.promoCodes.set(id, promo);
    return promo;
  }
  async updatePromoCode(id: string, data: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const promo = this.promoCodes.get(id);
    if (!promo) return undefined;
    const updated = { ...promo, ...data, updatedAt: new Date() };
    this.promoCodes.set(id, updated);
    return updated;
  }
  async deletePromoCode(id: string): Promise<boolean> {
    return this.promoCodes.delete(id);
  }

  // Referrals
  async getReferrals(referrerId?: string): Promise<Referral[]> {
    const all = Array.from(this.referrals.values());
    if (referrerId) return all.filter(r => r.referrerId === referrerId);
    return all;
  }
  async getReferral(id: string): Promise<Referral | undefined> {
    return this.referrals.get(id);
  }
  async createReferral(referral: Partial<Referral>): Promise<Referral> {
    const id = randomUUID();
    const now = new Date();
    const ref: Referral = {
      id,
      referrerId: referral.referrerId || "",
      referredId: referral.referredId || null,
      referralCode: referral.referralCode || `REF${randomUUID().slice(0, 8).toUpperCase()}`,
      status: referral.status || "pending",
      tier: referral.tier || 1,
      commission: referral.commission || "0",
      paidAt: referral.paidAt || null,
      createdAt: now,
    };
    this.referrals.set(id, ref);
    return ref;
  }
  async updateReferral(id: string, data: Partial<Referral>): Promise<Referral | undefined> {
    const ref = this.referrals.get(id);
    if (!ref) return undefined;
    const updated = { ...ref, ...data };
    this.referrals.set(id, updated);
    return updated;
  }
  async deleteReferral(id: string): Promise<boolean> {
    return this.referrals.delete(id);
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

  // Rate Cards
  async getRateCards(type?: string): Promise<RateCard[]> {
    const cards = Array.from(this.rateCards.values());
    if (type) {
      return cards.filter(c => c.type === type);
    }
    return cards;
  }

  async getRateCard(id: string): Promise<RateCard | undefined> {
    return this.rateCards.get(id);
  }

  async createRateCard(card: InsertRateCard): Promise<RateCard> {
    const id = randomUUID();
    const now = new Date();
    const newCard: RateCard = {
      id,
      name: card.name,
      code: card.code ?? null,
      description: card.description ?? null,
      type: card.type ?? "provider",
      status: card.status ?? "active",
      direction: card.direction ?? "outbound",
      currency: card.currency ?? "USD",
      carrierId: card.carrierId ?? null,
      profitMargin: card.profitMargin ?? "0",
      profitType: card.profitType ?? "percentage",
      billingPrecision: card.billingPrecision ?? 6,
      techPrefix: card.techPrefix ?? null,
      ratesCount: card.ratesCount ?? 0,
      revisionCount: card.revisionCount ?? 1,
      connexcsRateCardId: card.connexcsRateCardId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.rateCards.set(id, newCard);
    return newCard;
  }

  async updateRateCard(id: string, data: Partial<InsertRateCard>): Promise<RateCard | undefined> {
    const existing = this.rateCards.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.rateCards.set(id, updated);
    return updated;
  }

  async deleteRateCard(id: string): Promise<boolean> {
    // Also delete associated rates
    const ratesToDelete = Array.from(this.rateCardRates.values()).filter(r => r.rateCardId === id);
    ratesToDelete.forEach(r => this.rateCardRates.delete(r.id));
    return this.rateCards.delete(id);
  }

  // Rate Card Rates
  async getRateCardRates(rateCardId: string): Promise<RateCardRate[]> {
    return Array.from(this.rateCardRates.values()).filter(r => r.rateCardId === rateCardId);
  }

  async createRateCardRate(rate: InsertRateCardRate): Promise<RateCardRate> {
    const id = randomUUID();
    const now = new Date();
    const newRate: RateCardRate = {
      id,
      rateCardId: rate.rateCardId,
      prefix: rate.prefix,
      destination: rate.destination ?? null,
      country: rate.country ?? null,
      rate: rate.rate,
      connectionFee: rate.connectionFee ?? "0",
      minDuration: rate.minDuration ?? 0,
      interval: rate.interval ?? 60,
      asr: rate.asr ?? null,
      acd: rate.acd ?? null,
      pdd: rate.pdd ?? null,
      effectiveDate: rate.effectiveDate ?? null,
      expiryDate: rate.expiryDate ?? null,
      createdAt: now,
    };
    this.rateCardRates.set(id, newRate);
    return newRate;
  }

  async createRateCardRatesBulk(rates: InsertRateCardRate[]): Promise<RateCardRate[]> {
    const created: RateCardRate[] = [];
    for (const rate of rates) {
      const newRate = await this.createRateCardRate(rate);
      created.push(newRate);
    }
    return created;
  }

  async deleteRateCardRates(rateCardId: string): Promise<boolean> {
    const ratesToDelete = Array.from(this.rateCardRates.values()).filter(r => r.rateCardId === rateCardId);
    ratesToDelete.forEach(r => this.rateCardRates.delete(r.id));
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

  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    return Array.from(this.currencies.values());
  }

  async getCurrency(id: string): Promise<Currency | undefined> {
    return this.currencies.get(id);
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const id = randomUUID();
    const now = new Date();
    const c: Currency = {
      id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol ?? null,
      decimals: currency.decimals ?? 2,
      markup: currency.markup ?? "0",
      isActive: currency.isActive ?? true,
      createdAt: now
    };
    this.currencies.set(id, c);
    return c;
  }

  async updateCurrency(id: string, data: Partial<InsertCurrency>): Promise<Currency | undefined> {
    const existing = this.currencies.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.currencies.set(id, updated);
    return updated;
  }

  async deleteCurrency(id: string): Promise<boolean> {
    return this.currencies.delete(id);
  }

  // FX Rates
  async getFxRates(quoteCurrency?: string): Promise<FxRate[]> {
    const rates = Array.from(this.fxRates.values());
    if (quoteCurrency) return rates.filter(r => r.quoteCurrency === quoteCurrency);
    return rates;
  }

  async getLatestFxRate(quoteCurrency: string): Promise<FxRate | undefined> {
    const rates = Array.from(this.fxRates.values())
      .filter(r => r.quoteCurrency === quoteCurrency)
      .sort((a, b) => (b.effectiveAt?.getTime() || 0) - (a.effectiveAt?.getTime() || 0));
    return rates[0];
  }

  async createFxRate(rate: InsertFxRate): Promise<FxRate> {
    const id = randomUUID();
    const now = new Date();
    const r: FxRate = {
      id,
      baseCurrency: rate.baseCurrency ?? "USD",
      quoteCurrency: rate.quoteCurrency,
      rate: rate.rate,
      source: rate.source ?? "openexchangerates",
      effectiveAt: rate.effectiveAt ?? now,
      createdAt: now
    };
    this.fxRates.set(id, r);
    return r;
  }

  // SIP Test Configs
  async getSipTestConfigs(customerId?: string): Promise<SipTestConfig[]> {
    const configs = Array.from(this.sipTestConfigs.values());
    if (customerId) return configs.filter(c => c.customerId === customerId);
    return configs;
  }

  async getSharedSipTestConfigs(): Promise<SipTestConfig[]> {
    return Array.from(this.sipTestConfigs.values()).filter(c => c.isShared === true);
  }

  async getSipTestConfig(id: string): Promise<SipTestConfig | undefined> {
    return this.sipTestConfigs.get(id);
  }

  async createSipTestConfig(config: InsertSipTestConfig): Promise<SipTestConfig> {
    const id = randomUUID();
    const now = new Date();
    const c: SipTestConfig = {
      id,
      name: config.name,
      description: config.description ?? null,
      testType: config.testType ?? "quick",
      destinations: config.destinations ?? null,
      cliNumber: config.cliNumber ?? null,
      carrierId: config.carrierId ?? null,
      customerId: config.customerId ?? null,
      provider: config.provider ?? "connexcs",
      isAdvancedMode: config.isAdvancedMode ?? false,
      advancedSettings: config.advancedSettings ?? null,
      alertThresholds: config.alertThresholds ?? null,
      isActive: config.isActive ?? true,
      isShared: config.isShared ?? false,
      createdBy: config.createdBy ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.sipTestConfigs.set(id, c);
    return c;
  }

  async updateSipTestConfig(id: string, data: Partial<InsertSipTestConfig>): Promise<SipTestConfig | undefined> {
    const config = this.sipTestConfigs.get(id);
    if (!config) return undefined;
    const updated = { ...config, ...data, updatedAt: new Date() };
    this.sipTestConfigs.set(id, updated);
    return updated;
  }

  async deleteSipTestConfig(id: string): Promise<boolean> {
    return this.sipTestConfigs.delete(id);
  }

  // SIP Test Results
  async getSipTestResults(configId?: string): Promise<SipTestResult[]> {
    const results = Array.from(this.sipTestResults.values());
    if (configId) return results.filter(r => r.configId === configId);
    return results;
  }

  async getSipTestResult(id: string): Promise<SipTestResult | undefined> {
    return this.sipTestResults.get(id);
  }

  async createSipTestResult(result: InsertSipTestResult): Promise<SipTestResult> {
    const id = randomUUID();
    const now = new Date();
    const r: SipTestResult = {
      id,
      configId: result.configId ?? null,
      scheduleId: result.scheduleId ?? null,
      testType: result.testType,
      destination: result.destination ?? null,
      cliSent: result.cliSent ?? null,
      cliReceived: result.cliReceived ?? null,
      status: result.status ?? "pending",
      result: result.result ?? null,
      pddMs: result.pddMs ?? null,
      mosScore: result.mosScore ?? null,
      jitterMs: result.jitterMs ?? null,
      packetLossPercent: result.packetLossPercent ?? null,
      latencyMs: result.latencyMs ?? null,
      sipResponseCode: result.sipResponseCode ?? null,
      sipTrace: result.sipTrace ?? null,
      rtpStats: result.rtpStats ?? null,
      codecNegotiated: result.codecNegotiated ?? null,
      dtmfResult: result.dtmfResult ?? null,
      failoverTime: result.failoverTime ?? null,
      errorMessage: result.errorMessage ?? null,
      aiAnalysis: result.aiAnalysis ?? null,
      aiSuggestions: result.aiSuggestions ?? null,
      provider: result.provider ?? "connexcs",
      providerTestId: result.providerTestId ?? null,
      durationMs: result.durationMs ?? null,
      testedAt: result.testedAt ?? now,
      createdAt: now
    };
    this.sipTestResults.set(id, r);
    return r;
  }

  // SIP Test Schedules
  async getSipTestSchedules(configId?: string): Promise<SipTestSchedule[]> {
    const schedules = Array.from(this.sipTestSchedules.values());
    if (configId) return schedules.filter(s => s.configId === configId);
    return schedules;
  }

  async getSipTestSchedule(id: string): Promise<SipTestSchedule | undefined> {
    return this.sipTestSchedules.get(id);
  }

  async createSipTestSchedule(schedule: InsertSipTestSchedule): Promise<SipTestSchedule> {
    const id = randomUUID();
    const now = new Date();
    const s: SipTestSchedule = {
      id,
      configId: schedule.configId,
      name: schedule.name,
      cronExpression: schedule.cronExpression,
      timezone: schedule.timezone ?? "UTC",
      portalType: schedule.portalType ?? "admin",
      customerId: schedule.customerId ?? null,
      isActive: schedule.isActive ?? true,
      lastRunAt: schedule.lastRunAt ?? null,
      nextRunAt: schedule.nextRunAt ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.sipTestSchedules.set(id, s);
    return s;
  }

  async updateSipTestSchedule(id: string, data: Partial<InsertSipTestSchedule>): Promise<SipTestSchedule | undefined> {
    const schedule = this.sipTestSchedules.get(id);
    if (!schedule) return undefined;
    const updated = { ...schedule, ...data, updatedAt: new Date() };
    this.sipTestSchedules.set(id, updated);
    return updated;
  }

  async deleteSipTestSchedule(id: string): Promise<boolean> {
    return this.sipTestSchedules.delete(id);
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

  // Class 4 Customers
  async getClass4Customers(parentCustomerId: string): Promise<Class4Customer[]> {
    return Array.from(this.class4Customers.values()).filter(c => c.parentCustomerId === parentCustomerId);
  }

  async getClass4Customer(id: string): Promise<Class4Customer | undefined> {
    return this.class4Customers.get(id);
  }

  async createClass4Customer(customer: InsertClass4Customer): Promise<Class4Customer> {
    const id = randomUUID();
    const now = new Date();
    const c: Class4Customer = {
      id,
      parentCustomerId: customer.parentCustomerId,
      name: customer.name,
      code: customer.code,
      companyName: customer.companyName ?? null,
      billingEmail: customer.billingEmail ?? null,
      technicalEmail: customer.technicalEmail ?? null,
      balance: customer.balance ?? "0",
      creditLimit: customer.creditLimit ?? "0",
      billingType: customer.billingType ?? "prepaid",
      displayCurrency: customer.displayCurrency ?? "USD",
      status: customer.status ?? "active",
      connexcsCustomerId: customer.connexcsCustomerId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.class4Customers.set(id, c);
    return c;
  }

  async updateClass4Customer(id: string, data: Partial<InsertClass4Customer>): Promise<Class4Customer | undefined> {
    const customer = this.class4Customers.get(id);
    if (!customer) return undefined;
    const updated = { ...customer, ...data, updatedAt: new Date() };
    this.class4Customers.set(id, updated);
    return updated;
  }

  // Class 4 Carriers
  async getClass4Carriers(parentCustomerId: string): Promise<Class4Carrier[]> {
    return Array.from(this.class4Carriers.values()).filter(c => c.parentCustomerId === parentCustomerId);
  }

  async getClass4Carrier(id: string): Promise<Class4Carrier | undefined> {
    return this.class4Carriers.get(id);
  }

  async createClass4Carrier(carrier: InsertClass4Carrier): Promise<Class4Carrier> {
    const id = randomUUID();
    const now = new Date();
    const c: Class4Carrier = {
      id,
      parentCustomerId: carrier.parentCustomerId,
      name: carrier.name,
      code: carrier.code,
      sipHost: carrier.sipHost ?? null,
      sipPort: carrier.sipPort ?? 5060,
      techPrefix: carrier.techPrefix ?? null,
      maxChannels: carrier.maxChannels ?? null,
      maxCps: carrier.maxCps ?? null,
      failoverIps: carrier.failoverIps ?? null,
      status: carrier.status ?? "active",
      connexcsCarrierId: carrier.connexcsCarrierId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.class4Carriers.set(id, c);
    return c;
  }

  async updateClass4Carrier(id: string, data: Partial<InsertClass4Carrier>): Promise<Class4Carrier | undefined> {
    const carrier = this.class4Carriers.get(id);
    if (!carrier) return undefined;
    const updated = { ...carrier, ...data, updatedAt: new Date() };
    this.class4Carriers.set(id, updated);
    return updated;
  }

  // Class 4 Provider Rate Cards
  async getClass4ProviderRateCards(carrierId?: string): Promise<Class4ProviderRateCard[]> {
    const all = Array.from(this.class4ProviderRateCards.values());
    if (carrierId) return all.filter(r => r.carrierId === carrierId);
    return all;
  }

  async getClass4ProviderRateCard(id: string): Promise<Class4ProviderRateCard | undefined> {
    return this.class4ProviderRateCards.get(id);
  }

  async createClass4ProviderRateCard(card: InsertClass4ProviderRateCard): Promise<Class4ProviderRateCard> {
    const id = randomUUID();
    const now = new Date();
    const r: Class4ProviderRateCard = {
      id,
      parentCustomerId: card.parentCustomerId,
      carrierId: card.carrierId,
      name: card.name,
      currency: card.currency ?? "USD",
      effectiveDate: card.effectiveDate ?? null,
      expiryDate: card.expiryDate ?? null,
      isActive: card.isActive ?? true,
      connexcsRateCardId: card.connexcsRateCardId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.class4ProviderRateCards.set(id, r);
    return r;
  }

  async updateClass4ProviderRateCard(id: string, data: Partial<InsertClass4ProviderRateCard>): Promise<Class4ProviderRateCard | undefined> {
    const card = this.class4ProviderRateCards.get(id);
    if (!card) return undefined;
    const updated = { ...card, ...data, updatedAt: new Date() };
    this.class4ProviderRateCards.set(id, updated);
    return updated;
  }

  async deleteClass4ProviderRateCard(id: string): Promise<boolean> {
    return this.class4ProviderRateCards.delete(id);
  }

  // Class 4 Customer Rate Cards
  async getClass4CustomerRateCards(class4CustomerId?: string): Promise<Class4CustomerRateCard[]> {
    const all = Array.from(this.class4CustomerRateCards.values());
    if (class4CustomerId) return all.filter(r => r.class4CustomerId === class4CustomerId);
    return all;
  }

  async getClass4CustomerRateCard(id: string): Promise<Class4CustomerRateCard | undefined> {
    return this.class4CustomerRateCards.get(id);
  }

  async createClass4CustomerRateCard(card: InsertClass4CustomerRateCard): Promise<Class4CustomerRateCard> {
    const id = randomUUID();
    const now = new Date();
    const r: Class4CustomerRateCard = {
      id,
      parentCustomerId: card.parentCustomerId,
      class4CustomerId: card.class4CustomerId ?? null,
      name: card.name,
      sourceRateCardId: card.sourceRateCardId ?? null,
      markupType: card.markupType ?? "percentage",
      markupValue: card.markupValue ?? "10",
      profitAssuranceEnabled: card.profitAssuranceEnabled ?? true,
      currency: card.currency ?? "USD",
      isActive: card.isActive ?? true,
      connexcsRateCardId: card.connexcsRateCardId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.class4CustomerRateCards.set(id, r);
    return r;
  }

  async updateClass4CustomerRateCard(id: string, data: Partial<InsertClass4CustomerRateCard>): Promise<Class4CustomerRateCard | undefined> {
    const card = this.class4CustomerRateCards.get(id);
    if (!card) return undefined;
    const updated = { ...card, ...data, updatedAt: new Date() };
    this.class4CustomerRateCards.set(id, updated);
    return updated;
  }

  async deleteClass4CustomerRateCard(id: string): Promise<boolean> {
    return this.class4CustomerRateCards.delete(id);
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
