import { 
  type User, type InsertUser,
  type CustomerCategory, type InsertCustomerCategory,
  type CustomerGroup, type InsertCustomerGroup,
  type Customer, type InsertCustomer,
  type Pop, type InsertPop,
  type VoiceTier, type InsertVoiceTier,
  type Codec, type InsertCodec,
  type ChannelPlan, type InsertChannelPlan,
  type Carrier, type InsertCarrier,
  type Route, type InsertRoute,
  type RouteGroup, type InsertRouteGroup,
  type MonitoringRule, type InsertMonitoringRule,
  type Alert, type InsertAlert,
  type DidCountry, type InsertDidCountry,
  type Did, type InsertDid,
  type SipTrunk, type InsertSipTrunk,
  type Extension, type InsertExtension,
  type Ticket, type InsertTicket,
  type Currency, type InsertCurrency,
  type FxRate, type InsertFxRate,
  type LedgerEntry, type InsertLedgerEntry,
  type SipTestConfig, type InsertSipTestConfig,
  type SipTestResult, type InsertSipTestResult,
  type SipTestSchedule, type InsertSipTestSchedule,
  type Class4Customer, type InsertClass4Customer,
  type Class4Carrier, type InsertClass4Carrier,
  type AiVoiceAgent, type InsertAiVoiceAgent,
  type CmsTheme, type InsertCmsTheme,
  type TenantBranding, type InsertTenantBranding
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
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined>;
  moveCustomer(id: string, categoryId: string, groupId?: string): Promise<Customer | undefined>;

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

  // Tickets
  getTickets(customerId?: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, data: Partial<InsertTicket>): Promise<Ticket | undefined>;

  // Dashboard Stats
  getCategoryStats(): Promise<{ categoryId: string; customerCount: number; revenue: number }[]>;

  // Currencies
  getCurrencies(): Promise<Currency[]>;
  getCurrency(id: string): Promise<Currency | undefined>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;

  // FX Rates
  getFxRates(quoteCurrency?: string): Promise<FxRate[]>;
  getLatestFxRate(quoteCurrency: string): Promise<FxRate | undefined>;
  createFxRate(rate: InsertFxRate): Promise<FxRate>;

  // SIP Test Configs
  getSipTestConfigs(customerId?: string): Promise<SipTestConfig[]>;
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
  createSipTestSchedule(schedule: InsertSipTestSchedule): Promise<SipTestSchedule>;
  updateSipTestSchedule(id: string, data: Partial<InsertSipTestSchedule>): Promise<SipTestSchedule | undefined>;
  deleteSipTestSchedule(id: string): Promise<boolean>;

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

  // AI Voice Agents
  getAiVoiceAgents(customerId: string): Promise<AiVoiceAgent[]>;
  getAiVoiceAgent(id: string): Promise<AiVoiceAgent | undefined>;
  createAiVoiceAgent(agent: InsertAiVoiceAgent): Promise<AiVoiceAgent>;
  updateAiVoiceAgent(id: string, data: Partial<InsertAiVoiceAgent>): Promise<AiVoiceAgent | undefined>;

  // CMS Themes
  getCmsThemes(): Promise<CmsTheme[]>;
  getCmsTheme(id: string): Promise<CmsTheme | undefined>;
  createCmsTheme(theme: InsertCmsTheme): Promise<CmsTheme>;
  updateCmsTheme(id: string, data: Partial<InsertCmsTheme>): Promise<CmsTheme | undefined>;

  // Tenant Branding
  getTenantBranding(customerId: string): Promise<TenantBranding | undefined>;
  createTenantBranding(branding: InsertTenantBranding): Promise<TenantBranding>;
  updateTenantBranding(id: string, data: Partial<InsertTenantBranding>): Promise<TenantBranding | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customerCategories: Map<string, CustomerCategory>;
  private customerGroups: Map<string, CustomerGroup>;
  private customers: Map<string, Customer>;
  private pops: Map<string, Pop>;
  private voiceTiers: Map<string, VoiceTier>;
  private codecs: Map<string, Codec>;
  private channelPlans: Map<string, ChannelPlan>;
  private carriers: Map<string, Carrier>;
  private routes: Map<string, Route>;
  private monitoringRules: Map<string, MonitoringRule>;
  private alerts: Map<string, Alert>;
  private didCountries: Map<string, DidCountry>;
  private dids: Map<string, Did>;
  private sipTrunks: Map<string, SipTrunk>;
  private extensions: Map<string, Extension>;
  private tickets: Map<string, Ticket>;
  private currencies: Map<string, Currency>;
  private fxRates: Map<string, FxRate>;
  private sipTestConfigs: Map<string, SipTestConfig>;
  private sipTestResults: Map<string, SipTestResult>;
  private sipTestSchedules: Map<string, SipTestSchedule>;
  private class4Customers: Map<string, Class4Customer>;
  private class4Carriers: Map<string, Class4Carrier>;
  private aiVoiceAgents: Map<string, AiVoiceAgent>;
  private cmsThemes: Map<string, CmsTheme>;
  private tenantBrandings: Map<string, TenantBranding>;

  constructor() {
    this.users = new Map();
    this.customerCategories = new Map();
    this.customerGroups = new Map();
    this.customers = new Map();
    this.pops = new Map();
    this.voiceTiers = new Map();
    this.codecs = new Map();
    this.channelPlans = new Map();
    this.carriers = new Map();
    this.routes = new Map();
    this.monitoringRules = new Map();
    this.alerts = new Map();
    this.didCountries = new Map();
    this.dids = new Map();
    this.sipTrunks = new Map();
    this.extensions = new Map();
    this.tickets = new Map();
    this.currencies = new Map();
    this.fxRates = new Map();
    this.sipTestConfigs = new Map();
    this.sipTestResults = new Map();
    this.sipTestSchedules = new Map();
    this.class4Customers = new Map();
    this.class4Carriers = new Map();
    this.aiVoiceAgents = new Map();
    this.cmsThemes = new Map();
    this.tenantBrandings = new Map();

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
  }

  // Users
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

  async moveCustomer(id: string, categoryId: string, groupId?: string): Promise<Customer | undefined> {
    return this.updateCustomer(id, { categoryId, groupId: groupId ?? null });
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
      isActive: currency.isActive ?? true,
      createdAt: now
    };
    this.currencies.set(id, c);
    return c;
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

  // AI Voice Agents
  async getAiVoiceAgents(customerId: string): Promise<AiVoiceAgent[]> {
    return Array.from(this.aiVoiceAgents.values()).filter(a => a.customerId === customerId);
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

  // Tenant Branding
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
}

export const storage = new MemStorage();
