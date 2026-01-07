const CX_BASE_URL = "https://app.connexcs.com/api/cp/";

interface StorageInterface {
  getIntegrationByProvider: (provider: string) => Promise<{ credentials?: unknown; isEnabled?: boolean | null } | undefined>;
}

interface ConnexCSCredentials {
  username: string;
  password: string;
  refreshToken?: string;
  accessToken?: string;
  tokenExpiry?: number;
}

interface ConnexCSTokenResponse {
  token: string;
}

interface ConnexCSStatus {
  connected: boolean;
  mockMode: boolean;
  message: string;
  tokenDaysRemaining?: number;
  lastSync?: string;
  error?: string;
  warning?: string;
  tokenExpiringSoon?: boolean;
}

interface ConnexCSCarrier {
  id: number;
  name: string;
  status: string;
  channels?: number;
  cps?: number;
}

interface ConnexCSCustomer {
  id: number;
  name: string;
  status: string;
  balance?: number;
}

interface ConnexCSRateCard {
  id: number;
  name: string;
  direction?: string;
}

interface ConnexCSRoute {
  id: number;
  name: string;
  prefix?: string;
}

interface ConnexCSCDR {
  id: string;
  call_id: string;
  src: string;
  dst: string;
  duration: number;
  billsec: number;
  dt: string;
  cost?: number;
  status?: string;
  hangup_cause?: string;
  direction?: string;
}

interface ConnexCSKVRecord {
  id: string;
  key: string;
  value: any;
}

class ConnexCSToolsService {
  private credentials: ConnexCSCredentials | null = null;
  private mockMode = true;

  async loadCredentialsFromStorage(storage: StorageInterface): Promise<void> {
    try {
      const integration = await storage.getIntegrationByProvider("connexcs");
      if (integration?.credentials && integration.isEnabled) {
        const creds = integration.credentials as { username?: string; password?: string; refreshToken?: string };
        if (creds.username && creds.password) {
          this.credentials = {
            username: creds.username,
            password: creds.password,
            refreshToken: creds.refreshToken,
          };
          this.mockMode = false;
          return;
        }
      }
    } catch (error) {
      console.error("[ConnexCS Tools] Failed to load credentials:", error);
    }
    this.mockMode = true;
    console.log("[ConnexCS Tools] Running in mock mode - no credentials configured");
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  private createBasicAuthHeader(username: string, password: string): string {
    return Buffer.from(`${username}:${password}`).toString("base64");
  }

  private decodeJWT(token: string): { exp?: number; aud?: string } {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return {};
      return JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    } catch {
      return {};
    }
  }

  private checkTokenExpiration(token: string): { 
    needsRenewal: boolean; 
    daysRemaining: number; 
    isExpired: boolean;
    expiringSoon: boolean;
  } {
    const payload = this.decodeJWT(token);
    if (!payload.exp) return { needsRenewal: false, daysRemaining: 30, isExpired: false, expiringSoon: false };

    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = payload.exp - now;
    const daysRemaining = Math.floor(secondsRemaining / (24 * 60 * 60));

    return {
      needsRenewal: daysRemaining < 15,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: secondsRemaining <= 0,
      expiringSoon: daysRemaining > 0 && daysRemaining <= 7,
    };
  }

  async getRefreshToken(storage: StorageInterface): Promise<string> {
    if (!this.credentials) {
      throw new Error("No credentials configured");
    }

    if (this.credentials.refreshToken) {
      const { needsRenewal, isExpired, expiringSoon } = this.checkTokenExpiration(this.credentials.refreshToken);
      
      if (isExpired) {
        console.log("[ConnexCS Tools] Token expired - auto re-authenticating with stored credentials");
        this.credentials.refreshToken = undefined;
      } else if (!needsRenewal) {
        if (expiringSoon) {
          console.log(`[ConnexCS Tools] Token expiring soon - will renew on next API call`);
        }
        return this.credentials.refreshToken;
      } else {
        console.log("[ConnexCS Tools] Token needs renewal - refreshing now");
      }
    }

    console.log("[ConnexCS Tools] Obtaining new refresh token with username/password");
    const url = `${CX_BASE_URL}auth/jwt/refresh`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${this.createBasicAuthHeader(this.credentials.username, this.credentials.password)}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        lifetime: 30 * 24 * 60 * 60,
        audience: "didtron-platform",
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid ConnexCS credentials - please update username/password");
      }
      throw new Error(`Failed to get refresh token: HTTP ${response.status}`);
    }

    const data = (await response.json()) as ConnexCSTokenResponse;
    this.credentials.refreshToken = data.token;
    console.log("[ConnexCS Tools] Successfully obtained new 30-day refresh token");

    return data.token;
  }

  async getAccessToken(storage: StorageInterface): Promise<string> {
    const refreshToken = await this.getRefreshToken(storage);

    const url = `${CX_BASE_URL}auth/jwt`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("[ConnexCS Tools] Access token request failed - attempting auto re-authentication");
        this.credentials!.refreshToken = undefined;
        const newRefreshToken = await this.getRefreshToken(storage);
        
        const retryResponse = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${newRefreshToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error("Auto re-authentication failed - please update credentials");
        }
        
        const retryData = (await retryResponse.json()) as ConnexCSTokenResponse;
        console.log("[ConnexCS Tools] Auto re-authentication successful");
        return retryData.token;
      }
      throw new Error(`Failed to get access token: HTTP ${response.status}`);
    }

    const data = (await response.json()) as ConnexCSTokenResponse;
    return data.token;
  }

  async makeAuthenticatedRequest<T>(
    storage: StorageInterface,
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any
  ): Promise<T> {
    if (this.mockMode) {
      throw new Error("Running in mock mode");
    }

    const accessToken = await this.getAccessToken(storage);
    const url = `${CX_BASE_URL}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  async executeSQLQuery(storage: StorageInterface, sql: string): Promise<ConnexCSCDR[]> {
    if (this.mockMode) {
      return this.getMockCDRs();
    }

    const result = await this.makeAuthenticatedRequest<ConnexCSCDR[]>(
      storage,
      "cdr",
      "POST",
      { sql }
    );
    return result;
  }

  async testAuth(storage: StorageInterface): Promise<{
    success: boolean;
    message: string;
    tokenDaysRemaining?: number;
    warning?: string;
    tokenExpiringSoon?: boolean;
    error?: string;
  }> {
    await this.loadCredentialsFromStorage(storage);

    if (this.mockMode) {
      return {
        success: false,
        message: "Cannot test authentication in mock mode - no credentials configured",
      };
    }

    try {
      const refreshToken = await this.getRefreshToken(storage);
      const { daysRemaining, expiringSoon } = this.checkTokenExpiration(refreshToken);
      
      const accessToken = await this.getAccessToken(storage);
      if (!accessToken) {
        return {
          success: false,
          message: "Failed to obtain access token",
          error: "Token exchange failed",
        };
      }

      const result: {
        success: boolean;
        message: string;
        tokenDaysRemaining?: number;
        warning?: string;
        tokenExpiringSoon?: boolean;
      } = {
        success: true,
        message: "JWT authentication successful",
        tokenDaysRemaining: daysRemaining,
      };

      if (expiringSoon) {
        result.warning = `Token expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} - will auto-renew on next API call`;
        result.tokenExpiringSoon = true;
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("401") || errorMessage.includes("Invalid")) {
        this.credentials = null;
        this.mockMode = true;
      }
      
      return {
        success: false,
        message: "Authentication failed",
        error: errorMessage,
      };
    }
  }

  async getStatus(storage: StorageInterface): Promise<ConnexCSStatus> {
    await this.loadCredentialsFromStorage(storage);

    if (this.mockMode) {
      return {
        connected: false,
        mockMode: true,
        message: "Running in mock mode - no credentials configured",
      };
    }

    try {
      const refreshToken = await this.getRefreshToken(storage);
      const { daysRemaining, expiringSoon } = this.checkTokenExpiration(refreshToken);

      const carriers = await this.getCarriers(storage).catch(() => []);

      const status: ConnexCSStatus = {
        connected: true,
        mockMode: false,
        message: `Connected to ConnexCS (${carriers.length} carriers)`,
        tokenDaysRemaining: daysRemaining,
        lastSync: new Date().toISOString(),
      };

      if (expiringSoon) {
        status.warning = `Token expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} - will auto-renew on next API call`;
        status.tokenExpiringSoon = true;
      }

      return status;
    } catch (error) {
      return {
        connected: false,
        mockMode: false,
        message: "Failed to connect to ConnexCS",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getCarriers(storage: StorageInterface): Promise<ConnexCSCarrier[]> {
    if (this.mockMode) {
      return this.getMockCarriers();
    }
    return this.makeAuthenticatedRequest<ConnexCSCarrier[]>(storage, "carrier");
  }

  async getCustomers(storage: StorageInterface): Promise<ConnexCSCustomer[]> {
    if (this.mockMode) {
      return this.getMockCustomers();
    }
    return this.makeAuthenticatedRequest<ConnexCSCustomer[]>(storage, "customer");
  }

  async getRateCards(storage: StorageInterface): Promise<ConnexCSRateCard[]> {
    if (this.mockMode) {
      return this.getMockRateCards();
    }
    return this.makeAuthenticatedRequest<ConnexCSRateCard[]>(storage, "ratecard");
  }

  async getRoutes(storage: StorageInterface): Promise<ConnexCSRoute[]> {
    if (this.mockMode) {
      return this.getMockRoutes();
    }
    return this.makeAuthenticatedRequest<ConnexCSRoute[]>(storage, "route");
  }

  async getCDRs(storage: StorageInterface, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ConnexCSCDR[]> {
    if (this.mockMode) {
      return this.getMockCDRs();
    }

    const endDate = params?.endDate || new Date().toISOString().split("T")[0];
    const startDate = params?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const limit = params?.limit || 100;

    const sql = `SELECT * FROM cdr WHERE dt >= '${startDate}' AND dt <= '${endDate}' ORDER BY dt DESC LIMIT ${limit}`;
    return this.executeSQLQuery(storage, sql);
  }

  async getKVList(storage: StorageInterface): Promise<ConnexCSKVRecord[]> {
    if (this.mockMode) {
      return [];
    }
    return this.makeAuthenticatedRequest<ConnexCSKVRecord[]>(storage, "data");
  }

  async getKVRecord(storage: StorageInterface, key: string): Promise<ConnexCSKVRecord | null> {
    if (this.mockMode) {
      return null;
    }
    try {
      return await this.makeAuthenticatedRequest<ConnexCSKVRecord>(storage, `data/${key}`);
    } catch {
      return null;
    }
  }

  async setKVRecord(storage: StorageInterface, key: string, value: any): Promise<void> {
    if (this.mockMode) {
      throw new Error("Cannot set KV in mock mode");
    }
    await this.makeAuthenticatedRequest(storage, `data/${key}`, "PUT", { value });
  }

  private getMockCarriers(): ConnexCSCarrier[] {
    return [
      { id: 1, name: "Premium Voice US", status: "active", channels: 100, cps: 50 },
      { id: 2, name: "Global Transit EU", status: "active", channels: 200, cps: 100 },
      { id: 3, name: "Asia Connect", status: "active", channels: 150, cps: 75 },
    ];
  }

  private getMockCustomers(): ConnexCSCustomer[] {
    return [
      { id: 1, name: "Acme Corp", status: "active", balance: 1500 },
      { id: 2, name: "TechStart Inc", status: "active", balance: 750 },
      { id: 3, name: "Global Telecom", status: "active", balance: 5000 },
    ];
  }

  private getMockRateCards(): ConnexCSRateCard[] {
    return [
      { id: 1, name: "Standard US Termination", direction: "termination" },
      { id: 2, name: "Premium EU Routes", direction: "termination" },
      { id: 3, name: "DID Origination US", direction: "origination" },
    ];
  }

  private getMockRoutes(): ConnexCSRoute[] {
    return [
      { id: 1, name: "US Route 1", prefix: "1" },
      { id: 2, name: "UK Route", prefix: "44" },
      { id: 3, name: "EU Route", prefix: "49" },
    ];
  }

  private getMockCDRs(): ConnexCSCDR[] {
    const now = new Date();
    return Array.from({ length: 20 }, (_, i) => ({
      id: `cdr-${i + 1}`,
      call_id: `call-${Date.now()}-${i}`,
      src: `1555${String(1000 + i).padStart(4, "0")}`,
      dst: `1888${String(2000 + i).padStart(4, "0")}`,
      duration: Math.floor(Math.random() * 300) + 10,
      billsec: Math.floor(Math.random() * 280) + 10,
      dt: new Date(now.getTime() - i * 3600000).toISOString(),
      cost: Math.random() * 0.5,
      status: "ANSWERED",
      hangup_cause: "NORMAL_CLEARING",
      direction: i % 2 === 0 ? "outbound" : "inbound",
    }));
  }
}

export const connexcsTools = new ConnexCSToolsService();
export type {
  ConnexCSStatus,
  ConnexCSCarrier,
  ConnexCSCustomer,
  ConnexCSRateCard,
  ConnexCSRoute,
  ConnexCSCDR,
  ConnexCSKVRecord,
};
