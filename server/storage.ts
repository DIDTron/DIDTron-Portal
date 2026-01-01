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
  type Ticket, type InsertTicket
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
    for (const customer of this.customers.values()) {
      if (customer.categoryId) {
        const existing = stats.get(customer.categoryId) || { customerCount: 0, revenue: 0 };
        existing.customerCount++;
        stats.set(customer.categoryId, existing);
      }
    }
    return Array.from(stats.entries()).map(([categoryId, data]) => ({ categoryId, ...data }));
  }
}

export const storage = new MemStorage();
