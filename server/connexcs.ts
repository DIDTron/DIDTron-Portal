interface ConnexCSConfig {
  username?: string;
  password?: string;
  baseUrl: string;
}

interface ConnexCSCarrier {
  id: string;
  name: string;
  status: string;
  ip_address?: string;
  port?: number;
  channels?: number;
  cps?: number;
  tech_prefix?: string;
}

interface ConnexCSRoute {
  id: string;
  name: string;
  prefix: string;
  carrier_id: string;
  priority: number;
  weight: number;
  status: string;
}

interface ConnexCSCustomer {
  id: string;
  name: string;
  balance: number;
  credit_limit: number;
  status: string;
  channels?: number;
  cps?: number;
  currency?: string;
}

interface ConnexCSRateCard {
  id: string;
  name: string;
  direction?: string;
  currency?: string;
  carrier_id?: string;
  status?: string;
}

interface ConnexCSDID {
  id: string;
  number: string;
  customer_id?: string;
  destination?: string;
  status?: string;
}

interface ConnexCSCDR {
  id: string;
  call_id: string;
  destination: string;
  duration: number;
  cost: number;
  status: string;
  timestamp: string;
  asr?: number;
  acd?: number;
  mos?: number;
}

interface ConnexCSMetrics {
  active_channels: number;
  cps: number;
  total_calls_24h: number;
  asr: number;
  acd: number;
  revenue_24h: number;
  cost_24h: number;
}

class ConnexCSClient {
  private config: ConnexCSConfig;
  private mockMode: boolean;
  private jwtToken: string | null = null;
  private tokenExpiry: number = 0;
  private credentialsLoaded: boolean = false;

  constructor() {
    this.config = {
      username: process.env.CONNEXCS_USERNAME,
      password: process.env.CONNEXCS_PASSWORD,
      baseUrl: process.env.CONNEXCS_API_URL || "https://app.connexcs.com",
    };
    this.mockMode = !this.config.username || !this.config.password;

    if (this.mockMode) {
      console.log("[ConnexCS] Running in mock mode - no username/password configured");
    }
  }

  async loadCredentialsFromStorage(storage: { getIntegrationByProvider: (provider: string) => Promise<{ credentials?: unknown; isEnabled?: boolean | null } | undefined> }): Promise<void> {
    if (this.credentialsLoaded && !this.mockMode) return;
    
    try {
      const integration = await storage.getIntegrationByProvider("connexcs");
      if (integration?.credentials && integration.isEnabled) {
        const creds = integration.credentials as { username?: string; password?: string };
        if (creds.username && creds.password) {
          this.config.username = creds.username;
          this.config.password = creds.password;
          this.mockMode = false;
          this.credentialsLoaded = true;
          console.log("[ConnexCS] Loaded credentials from integrations database");
        }
      }
    } catch (error) {
      console.error("[ConnexCS] Failed to load credentials from storage:", error);
    }
  }

  isConfigured(): boolean {
    return !this.mockMode;
  }

  private async authenticate(): Promise<string> {
    if (this.jwtToken && Date.now() < this.tokenExpiry) {
      return this.jwtToken;
    }

    const response = await fetch(`${this.config.baseUrl}/api/cp/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.config.username,
        password: this.config.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`ConnexCS authentication failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.jwtToken = data.jwt || data.token;
    this.tokenExpiry = Date.now() + (55 * 60 * 1000); // Refresh 5 min before expiry (1 hour tokens)
    
    return this.jwtToken!;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    if (this.mockMode) {
      return this.getMockResponse<T>(endpoint, method);
    }

    const token = await this.authenticate();
    
    const response = await fetch(`${this.config.baseUrl}/api/cp${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`ConnexCS API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getMockResponse<T>(endpoint: string, _method: string): T {
    if (endpoint.includes("/carrier")) {
      return [
        { id: "mock-1", name: "Mock Carrier A", status: "active", ip_address: "192.168.1.1", port: 5060, channels: 100, cps: 10 },
        { id: "mock-2", name: "Mock Carrier B", status: "active", ip_address: "192.168.1.2", port: 5060, channels: 50, cps: 5 },
      ] as unknown as T;
    }

    if (endpoint.includes("/route")) {
      return [
        { id: "mock-r1", name: "US Default", prefix: "1", carrier_id: "mock-1", priority: 1, weight: 100, status: "active" },
        { id: "mock-r2", name: "UK Default", prefix: "44", carrier_id: "mock-2", priority: 1, weight: 100, status: "active" },
      ] as unknown as T;
    }

    if (endpoint.includes("/customer")) {
      return [
        { id: "mock-c1", name: "Demo Customer", balance: 100.00, credit_limit: 500, status: "active", channels: 10, cps: 2 },
      ] as unknown as T;
    }

    if (endpoint.includes("/card")) {
      return [
        { id: "mock-rc1", name: "Default Termination", direction: "termination", currency: "USD", status: "active" },
        { id: "mock-rc2", name: "Default Origination", direction: "origination", currency: "USD", status: "active" },
      ] as unknown as T;
    }

    if (endpoint.includes("/did")) {
      return [
        { id: "mock-did1", number: "+14155551234", status: "active" },
      ] as unknown as T;
    }

    if (endpoint.includes("/metrics")) {
      return {
        active_channels: 42,
        cps: 3.5,
        total_calls_24h: 15420,
        asr: 68.5,
        acd: 185,
        revenue_24h: 1250.00,
        cost_24h: 875.00,
      } as unknown as T;
    }

    if (endpoint.includes("/cdr")) {
      return [] as unknown as T;
    }

    return {} as T;
  }

  // Carrier endpoints
  async getCarriers(): Promise<ConnexCSCarrier[]> {
    return this.request<ConnexCSCarrier[]>("GET", "/carrier");
  }

  async getCarrier(id: string): Promise<ConnexCSCarrier> {
    return this.request<ConnexCSCarrier>("GET", `/carrier/${id}`);
  }

  async createCarrier(data: Partial<ConnexCSCarrier>): Promise<ConnexCSCarrier> {
    return this.request<ConnexCSCarrier>("POST", "/carrier", data);
  }

  async updateCarrier(id: string, data: Partial<ConnexCSCarrier>): Promise<ConnexCSCarrier> {
    return this.request<ConnexCSCarrier>("PUT", `/carrier/${id}`, data);
  }

  async deleteCarrier(id: string): Promise<void> {
    await this.request<void>("DELETE", `/carrier/${id}`);
  }

  // Customer endpoints
  async getCustomers(): Promise<ConnexCSCustomer[]> {
    return this.request<ConnexCSCustomer[]>("GET", "/customer");
  }

  async getCustomer(id: string): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("GET", `/customer/${id}`);
  }

  async createCustomer(data: Partial<ConnexCSCustomer>): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("POST", "/customer", data);
  }

  async updateCustomer(id: string, data: Partial<ConnexCSCustomer>): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("PUT", `/customer/${id}`, data);
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.request<void>("DELETE", `/customer/${id}`);
  }

  async updateCustomerBalance(id: string, amount: number): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("POST", `/customer/${id}/balance`, { amount });
  }

  // Rate Card endpoints
  async getRateCards(): Promise<ConnexCSRateCard[]> {
    return this.request<ConnexCSRateCard[]>("GET", "/card");
  }

  async getRateCard(id: string): Promise<ConnexCSRateCard> {
    return this.request<ConnexCSRateCard>("GET", `/card/${id}`);
  }

  async createRateCard(data: Partial<ConnexCSRateCard>): Promise<ConnexCSRateCard> {
    return this.request<ConnexCSRateCard>("POST", "/card", data);
  }

  async updateRateCard(id: string, data: Partial<ConnexCSRateCard>): Promise<ConnexCSRateCard> {
    return this.request<ConnexCSRateCard>("PUT", `/card/${id}`, data);
  }

  async deleteRateCard(id: string): Promise<void> {
    await this.request<void>("DELETE", `/card/${id}`);
  }

  // DID endpoints
  async getDIDs(): Promise<ConnexCSDID[]> {
    return this.request<ConnexCSDID[]>("GET", "/did");
  }

  async getDID(id: string): Promise<ConnexCSDID> {
    return this.request<ConnexCSDID>("GET", `/did/${id}`);
  }

  async createDID(data: Partial<ConnexCSDID>): Promise<ConnexCSDID> {
    return this.request<ConnexCSDID>("POST", "/did", data);
  }

  async updateDID(id: string, data: Partial<ConnexCSDID>): Promise<ConnexCSDID> {
    return this.request<ConnexCSDID>("PUT", `/did/${id}`, data);
  }

  async deleteDID(id: string): Promise<void> {
    await this.request<void>("DELETE", `/did/${id}`);
  }

  // Route endpoints
  async getRoutes(): Promise<ConnexCSRoute[]> {
    return this.request<ConnexCSRoute[]>("GET", "/route");
  }

  async getRoute(id: string): Promise<ConnexCSRoute> {
    return this.request<ConnexCSRoute>("GET", `/route/${id}`);
  }

  async createRoute(data: Partial<ConnexCSRoute>): Promise<ConnexCSRoute> {
    return this.request<ConnexCSRoute>("POST", "/route", data);
  }

  async updateRoute(id: string, data: Partial<ConnexCSRoute>): Promise<ConnexCSRoute> {
    return this.request<ConnexCSRoute>("PUT", `/route/${id}`, data);
  }

  async deleteRoute(id: string): Promise<void> {
    await this.request<void>("DELETE", `/route/${id}`);
  }

  async getCDRs(params?: {
    start_date?: string;
    end_date?: string;
    customer_id?: string;
    carrier_id?: string;
    destination?: string;
    limit?: number;
  }): Promise<ConnexCSCDR[]> {
    const queryString = params
      ? "?" + Object.entries(params)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return this.request<ConnexCSCDR[]>("GET", `/cdr${queryString}`);
  }

  async getMetrics(): Promise<ConnexCSMetrics> {
    return this.request<ConnexCSMetrics>("GET", "/metrics");
  }

  async getCarrierMetrics(carrierId: string): Promise<{
    asr: number;
    acd: number;
    mos: number;
    pdd: number;
    calls_24h: number;
  }> {
    if (this.mockMode) {
      return {
        asr: 65 + Math.random() * 20,
        acd: 120 + Math.random() * 120,
        mos: 4.0 + Math.random() * 0.4,
        pdd: 1 + Math.random() * 2,
        calls_24h: Math.floor(1000 + Math.random() * 5000),
      };
    }
    return this.request("GET", `/carrier/${carrierId}/metrics`);
  }

  async testRoute(destination: string): Promise<{
    success: boolean;
    latency_ms: number;
    carrier_used: string;
    sip_code: number;
  }> {
    if (this.mockMode) {
      return {
        success: Math.random() > 0.1,
        latency_ms: 50 + Math.floor(Math.random() * 200),
        carrier_used: "Mock Carrier A",
        sip_code: 200,
      };
    }
    return this.request("POST", "/route/test", { destination });
  }

  async syncCarrier(localCarrier: {
    id: string;
    name: string;
    sipHost?: string | null;
    sipPort?: number | null;
  }): Promise<{ connexcsId: string; synced: boolean }> {
    if (this.mockMode) {
      return {
        connexcsId: `cx-${localCarrier.id}`,
        synced: true,
      };
    }

    const existingCarriers = await this.getCarriers();
    const existing = existingCarriers.find(c => c.name === localCarrier.name);

    if (existing) {
      await this.updateCarrier(existing.id, {
        ip_address: localCarrier.sipHost || undefined,
        port: localCarrier.sipPort || undefined,
      });
      return { connexcsId: existing.id, synced: true };
    }

    const created = await this.createCarrier({
      name: localCarrier.name,
      ip_address: localCarrier.sipHost || undefined,
      port: localCarrier.sipPort || undefined,
    });
    return { connexcsId: created.id, synced: true };
  }

  async syncRoute(localRoute: {
    id: string;
    name: string;
    prefix?: string | null;
    priority?: number | null;
    weight?: number | null;
    connexcsCarrierId?: string;
  }): Promise<{ connexcsId: string; synced: boolean }> {
    if (this.mockMode) {
      return {
        connexcsId: `cx-route-${localRoute.id}`,
        synced: true,
      };
    }

    const existingRoutes = await this.getRoutes();
    const existing = existingRoutes.find(r => r.name === localRoute.name);

    if (existing) {
      await this.updateRoute(existing.id, {
        prefix: localRoute.prefix || undefined,
        priority: localRoute.priority || undefined,
        weight: localRoute.weight || undefined,
      });
      return { connexcsId: existing.id, synced: true };
    }

    const created = await this.createRoute({
      name: localRoute.name,
      prefix: localRoute.prefix || "",
      carrier_id: localRoute.connexcsCarrierId || "",
      priority: localRoute.priority || 1,
      weight: localRoute.weight || 100,
    });
    return { connexcsId: created.id, synced: true };
  }

  async syncCustomer(localCustomer: {
    id: string;
    name: string;
    accountNumber?: string | null;
    creditLimit?: number;
    currency?: string;
  }): Promise<{ connexcsId: string; synced: boolean }> {
    if (this.mockMode) {
      return {
        connexcsId: `cx-cust-${localCustomer.id}`,
        synced: true,
      };
    }

    const existingCustomers = await this.getCustomers();
    const existing = existingCustomers.find(c => c.name === localCustomer.name);

    if (existing) {
      return { connexcsId: existing.id, synced: true };
    }

    const created = await this.createCustomer({
      name: localCustomer.name,
      credit_limit: localCustomer.creditLimit || 0,
      currency: localCustomer.currency || "USD",
    });
    return { connexcsId: created.id, synced: true };
  }

  async syncRateCard(localRateCard: {
    id: string;
    name: string;
    direction?: string | null;
    currency?: string | null;
    carrierId?: string | null;
  }): Promise<{ connexcsId: string; synced: boolean }> {
    if (this.mockMode) {
      return {
        connexcsId: `cx-rc-${localRateCard.id}`,
        synced: true,
      };
    }

    const existingCards = await this.getRateCards();
    const existing = existingCards.find(c => c.name === localRateCard.name);

    if (existing) {
      await this.updateRateCard(existing.id, {
        direction: localRateCard.direction || undefined,
        currency: localRateCard.currency || undefined,
      });
      return { connexcsId: existing.id, synced: true };
    }

    const created = await this.createRateCard({
      name: localRateCard.name,
      direction: localRateCard.direction || "termination",
      currency: localRateCard.currency || "USD",
      carrier_id: localRateCard.carrierId || undefined,
    });
    return { connexcsId: created.id, synced: true };
  }

  async syncDID(localDID: {
    id: string;
    number: string;
    customerId?: string | null;
    destination?: string | null;
  }): Promise<{ connexcsId: string; synced: boolean }> {
    if (this.mockMode) {
      return {
        connexcsId: `cx-did-${localDID.id}`,
        synced: true,
      };
    }

    const existingDIDs = await this.getDIDs();
    const existing = existingDIDs.find(d => d.number === localDID.number);

    if (existing) {
      await this.updateDID(existing.id, {
        customer_id: localDID.customerId || undefined,
        destination: localDID.destination || undefined,
      });
      return { connexcsId: existing.id, synced: true };
    }

    const created = await this.createDID({
      number: localDID.number,
      customer_id: localDID.customerId || undefined,
      destination: localDID.destination || undefined,
    });
    return { connexcsId: created.id, synced: true };
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  async executeSipTest(params: {
    destination: string;
    callerId?: string;
    codec?: string;
    maxDuration?: number;
    routeId?: string;
    carrierId?: string;
  }): Promise<{
    callId: string;
    destination: string;
    status: "completed" | "failed" | "no_answer" | "busy";
    sipResponseCode: number;
    pddMs: number;
    durationSec: number;
    mosScore: number | null;
    jitterMs: number | null;
    packetLossPercent: number | null;
    latencyMs: number | null;
    cliReceived: string | null;
  }> {
    const callId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    if (this.mockMode) {
      const success = Math.random() > 0.15;
      const noAnswer = !success && Math.random() > 0.5;
      
      return {
        callId,
        destination: params.destination,
        status: success ? "completed" : noAnswer ? "no_answer" : "failed",
        sipResponseCode: success ? 200 : noAnswer ? 408 : 503,
        pddMs: Math.floor(100 + Math.random() * 300),
        durationSec: success ? Math.floor(5 + Math.random() * (params.maxDuration || 30)) : 0,
        mosScore: success ? Number((3.5 + Math.random() * 1.0).toFixed(2)) : null,
        jitterMs: success ? Number((5 + Math.random() * 25).toFixed(2)) : null,
        packetLossPercent: success ? Number((Math.random() * 2).toFixed(2)) : null,
        latencyMs: success ? Math.floor(20 + Math.random() * 100) : null,
        cliReceived: params.callerId || null,
      };
    }

    try {
      const token = await this.authenticate();
      const response = await fetch(`${this.config.baseUrl}/api/test/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: params.destination,
          caller_id: params.callerId,
          codec: params.codec || "G729",
          max_duration: params.maxDuration || 30,
          route_id: params.routeId,
          carrier_id: params.carrierId,
        }),
      });

      if (!response.ok) {
        return {
          callId,
          destination: params.destination,
          status: "failed",
          sipResponseCode: 500,
          pddMs: 0,
          durationSec: 0,
          mosScore: null,
          jitterMs: null,
          packetLossPercent: null,
          latencyMs: null,
          cliReceived: null,
        };
      }

      const result = await response.json();
      return {
        callId: result.call_id || callId,
        destination: params.destination,
        status: result.status || "completed",
        sipResponseCode: result.sip_code || 200,
        pddMs: result.pdd_ms || 0,
        durationSec: result.duration || 0,
        mosScore: result.mos || null,
        jitterMs: result.jitter || null,
        packetLossPercent: result.packet_loss || null,
        latencyMs: result.latency || null,
        cliReceived: result.cli_received || null,
      };
    } catch (error) {
      console.error("[ConnexCS] Test call error:", error);
      return {
        callId,
        destination: params.destination,
        status: "failed",
        sipResponseCode: 500,
        pddMs: 0,
        durationSec: 0,
        mosScore: null,
        jitterMs: null,
        packetLossPercent: null,
        latencyMs: null,
        cliReceived: null,
      };
    }
  }

  async executeBatchSipTest(destinations: string[], options: {
    callerId?: string;
    codec?: string;
    maxDuration?: number;
    routeId?: string;
    carrierId?: string;
    concurrency?: number;
  } = {}): Promise<Array<Awaited<ReturnType<ConnexCSClient["executeSipTest"]>>>> {
    const concurrency = options.concurrency || 1;
    const results: Array<Awaited<ReturnType<ConnexCSClient["executeSipTest"]>>> = [];
    
    for (let i = 0; i < destinations.length; i += concurrency) {
      const batch = destinations.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(destination => 
          this.executeSipTest({
            destination,
            callerId: options.callerId,
            codec: options.codec,
            maxDuration: options.maxDuration,
            routeId: options.routeId,
            carrierId: options.carrierId,
          })
        )
      );
      results.push(...batchResults);
    }
    
    return results;
  }
}

export const connexcs = new ConnexCSClient();
export default connexcs;
