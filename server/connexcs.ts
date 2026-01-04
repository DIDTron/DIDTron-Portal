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
    if (endpoint.includes("/carriers")) {
      return [
        { id: "mock-1", name: "Mock Carrier A", status: "active", ip_address: "192.168.1.1", port: 5060, channels: 100, cps: 10 },
        { id: "mock-2", name: "Mock Carrier B", status: "active", ip_address: "192.168.1.2", port: 5060, channels: 50, cps: 5 },
      ] as unknown as T;
    }

    if (endpoint.includes("/routes")) {
      return [
        { id: "mock-r1", name: "US Default", prefix: "1", carrier_id: "mock-1", priority: 1, weight: 100, status: "active" },
        { id: "mock-r2", name: "UK Default", prefix: "44", carrier_id: "mock-2", priority: 1, weight: 100, status: "active" },
      ] as unknown as T;
    }

    if (endpoint.includes("/customers")) {
      return [
        { id: "mock-c1", name: "Demo Customer", balance: 100.00, credit_limit: 500, status: "active", channels: 10, cps: 2 },
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

  async getCarriers(): Promise<ConnexCSCarrier[]> {
    return this.request<ConnexCSCarrier[]>("GET", "/carriers");
  }

  async getCarrier(id: string): Promise<ConnexCSCarrier> {
    return this.request<ConnexCSCarrier>("GET", `/carriers/${id}`);
  }

  async createCarrier(data: Partial<ConnexCSCarrier>): Promise<ConnexCSCarrier> {
    return this.request<ConnexCSCarrier>("POST", "/carriers", data);
  }

  async updateCarrier(id: string, data: Partial<ConnexCSCarrier>): Promise<ConnexCSCarrier> {
    return this.request<ConnexCSCarrier>("PUT", `/carriers/${id}`, data);
  }

  async deleteCarrier(id: string): Promise<void> {
    await this.request<void>("DELETE", `/carriers/${id}`);
  }

  async getRoutes(): Promise<ConnexCSRoute[]> {
    return this.request<ConnexCSRoute[]>("GET", "/routes");
  }

  async getRoute(id: string): Promise<ConnexCSRoute> {
    return this.request<ConnexCSRoute>("GET", `/routes/${id}`);
  }

  async createRoute(data: Partial<ConnexCSRoute>): Promise<ConnexCSRoute> {
    return this.request<ConnexCSRoute>("POST", "/routes", data);
  }

  async updateRoute(id: string, data: Partial<ConnexCSRoute>): Promise<ConnexCSRoute> {
    return this.request<ConnexCSRoute>("PUT", `/routes/${id}`, data);
  }

  async deleteRoute(id: string): Promise<void> {
    await this.request<void>("DELETE", `/routes/${id}`);
  }

  async getCustomers(): Promise<ConnexCSCustomer[]> {
    return this.request<ConnexCSCustomer[]>("GET", "/customers");
  }

  async getCustomer(id: string): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("GET", `/customers/${id}`);
  }

  async createCustomer(data: Partial<ConnexCSCustomer>): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("POST", "/customers", data);
  }

  async updateCustomer(id: string, data: Partial<ConnexCSCustomer>): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("PUT", `/customers/${id}`, data);
  }

  async updateCustomerBalance(id: string, amount: number): Promise<ConnexCSCustomer> {
    return this.request<ConnexCSCustomer>("POST", `/customers/${id}/balance`, { amount });
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
    return this.request("GET", `/carriers/${carrierId}/metrics`);
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
    return this.request("POST", "/routes/test", { destination });
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

  isMockMode(): boolean {
    return this.mockMode;
  }
}

export const connexcs = new ConnexCSClient();
export default connexcs;
