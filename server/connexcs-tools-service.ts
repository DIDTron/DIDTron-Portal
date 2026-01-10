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
  host?: string;
  port?: number;
  ip?: string;
  prefix?: string;
  tech_prefix?: string;
  strip?: number;
  protocol?: string;
  codecs?: string[];
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

interface ConnexCSCarrierFull extends ConnexCSCarrier {
  ratecard_id?: number;
  ratecard_name?: string;
  payment_type?: string;
  billing_type?: string;
  invoice_cycle?: string;
  payment_terms?: number;
  credit_limit?: number;
  balance?: number;
}

interface ConnexCSCustomer {
  id: number;
  name: string;
  status: string;
  balance?: number;
  credit_limit?: number;
  currency?: string;
  email?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  postcode?: string;
  phone?: string;
  payment_type?: string;
  tax_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ConnexCSCustomerFull extends ConnexCSCustomer {
  ratecard_id?: number;
  ratecard_name?: string;
  did_ratecard_id?: number;
  channels?: number;
  cps?: number;
  account_class?: string;
  billing_type?: string;
  invoice_cycle?: string;
  payment_terms?: number;
  tax_rate?: number;
}

interface ConnexCSRateCard {
  id: string | number; // ConnexCS rate cards can have string IDs like "6IAK-MhWJ"
  name: string;
  direction?: string;
  currency?: string;
  status?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

interface ConnexCSRateCardFull extends ConnexCSRateCard {
  rates?: ConnexCSRate[];
}

interface ConnexCSRate {
  id: number;
  prefix: string;
  destination: string;
  rate: number;
  connection_fee?: number;
  billing_increment?: string;
  min_duration?: number;
  status?: string;
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
  customer_id?: number;
  customer_name?: string;
  carrier_id?: number;
  carrier_name?: string;
  ratecard_id?: number;
  rate?: number;
  prefix?: string;
  destination?: string;
  currency?: string;
  pdd?: number;
  codec?: string;
  lnp?: boolean;
  src_ip?: string;
  dst_ip?: string;
}

interface ConnexCSBalance {
  customer_id: number;
  customer_name: string;
  balance: number;
  credit_limit: number;
  currency: string;
  available_credit: number;
}

interface ConnexCSSyncResult {
  success: boolean;
  entity: string;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
  duration_ms: number;
}

interface ConnexCSCDRQueryParams {
  startDate: string;
  endDate: string;
  customerId?: number;
  carrierId?: number;
  direction?: 'inbound' | 'outbound';
  limit?: number;
  offset?: number;
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

    // Rate limit to avoid session overflow errors
    await this.rateLimit();

    // Add timeout to prevent hanging on CDR queries
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      const accessToken = await this.getAccessToken(storage);
      const url = `${CX_BASE_URL}cdr`;
      
      console.log(`[ConnexCS CDR] Executing SQL query to ${url}`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ sql }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`[ConnexCS CDR] API error ${response.status}: ${errorText.substring(0, 200)}`);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      const text = await response.text();
      console.log(`[ConnexCS CDR] Response received: ${text.substring(0, 200)}...`);
      
      const result = text ? JSON.parse(text) : [];
      return Array.isArray(result) ? result : [];
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log(`[ConnexCS CDR] Query timed out after 60 seconds`);
        return [];
      }
      console.log(`[ConnexCS CDR] Query error: ${error.message}`);
      throw error;
    }
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
    // ConnexCS uses "card" endpoint for rate cards, not "ratecard"
    return this.makeAuthenticatedRequest<ConnexCSRateCard[]>(storage, "card");
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

  // Extended API methods for full sync
  async getCustomerById(storage: StorageInterface, id: number): Promise<ConnexCSCustomerFull | null> {
    if (this.mockMode) {
      return null;
    }
    try {
      return await this.makeAuthenticatedRequest<ConnexCSCustomerFull>(storage, `customer/${id}`);
    } catch {
      return null;
    }
  }

  async getCarrierById(storage: StorageInterface, id: number): Promise<ConnexCSCarrierFull | null> {
    if (this.mockMode) {
      return null;
    }
    try {
      return await this.makeAuthenticatedRequest<ConnexCSCarrierFull>(storage, `carrier/${id}`);
    } catch {
      return null;
    }
  }

  async getRateCardById(storage: StorageInterface, id: string | number): Promise<ConnexCSRateCardFull | null> {
    if (this.mockMode) {
      return null;
    }
    try {
      // ConnexCS uses "card" endpoint for rate cards
      return await this.makeAuthenticatedRequest<ConnexCSRateCardFull>(storage, `card/${id}`);
    } catch {
      return null;
    }
  }

  async getRateCardRates(storage: StorageInterface, rateCardId: string | number): Promise<ConnexCSRate[]> {
    if (this.mockMode) {
      return [];
    }
    try {
      // ConnexCS uses "card" endpoint for rate cards - rates are under card/{id}/rate
      return await this.makeAuthenticatedRequest<ConnexCSRate[]>(storage, `card/${rateCardId}/rate`);
    } catch {
      return [];
    }
  }

  async getAllCustomersFull(storage: StorageInterface): Promise<ConnexCSCustomerFull[]> {
    if (this.mockMode) {
      return this.getMockCustomers() as ConnexCSCustomerFull[];
    }
    
    const customers = await this.getCustomers(storage);
    const fullCustomers: ConnexCSCustomerFull[] = [];
    
    for (const customer of customers) {
      const full = await this.getCustomerById(storage, customer.id);
      if (full) {
        fullCustomers.push(full);
      } else {
        fullCustomers.push(customer as ConnexCSCustomerFull);
      }
    }
    
    return fullCustomers;
  }

  async getAllCarriersFull(storage: StorageInterface): Promise<ConnexCSCarrierFull[]> {
    if (this.mockMode) {
      return this.getMockCarriers() as ConnexCSCarrierFull[];
    }
    
    const carriers = await this.getCarriers(storage);
    const fullCarriers: ConnexCSCarrierFull[] = [];
    
    for (const carrier of carriers) {
      const full = await this.getCarrierById(storage, carrier.id);
      if (full) {
        fullCarriers.push(full);
      } else {
        fullCarriers.push(carrier as ConnexCSCarrierFull);
      }
    }
    
    return fullCarriers;
  }

  // Cache for discovered CDR schema (columns and date field)
  private cdrSchemaCache: { 
    table: string;
    columns: string[];
    dateColumn: string;
    discoveredAt?: Date;
  } | null = null;
  
  // Rate limiting: wait between API calls to avoid session overflow
  private lastApiCallTime = 0;
  private readonly minApiInterval = 2000; // 2 seconds between calls
  
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCallTime;
    if (timeSinceLastCall < this.minApiInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minApiInterval - timeSinceLastCall));
    }
    this.lastApiCallTime = Date.now();
  }

  // Discover CDR schema using metadata queries (no data scan required)
  async discoverCDRSchema(storage: StorageInterface): Promise<{
    table: string;
    columns: string[];
    dateColumn: string;
  } | null> {
    // Check cache first (valid for 1 hour)
    if (this.cdrSchemaCache && this.cdrSchemaCache.discoveredAt) {
      const ageMs = Date.now() - this.cdrSchemaCache.discoveredAt.getTime();
      if (ageMs < 60 * 60 * 1000) {
        return this.cdrSchemaCache;
      }
    }
    
    // For now, use hardcoded column names based on standard ConnexCS schema
    // This avoids the schema discovery queries that are causing rate limiting issues
    // The user can customize this if their schema is different
    console.log(`[ConnexCS CDR] Using default CDR schema (dt column for dates)`);
    this.cdrSchemaCache = {
      table: 'cdr',
      columns: ['dt', 'src', 'dst', 'duration', 'billsec', 'cost', 'customer_id', 'carrier_id'],
      dateColumn: 'dt',
      discoveredAt: new Date()
    };
    return this.cdrSchemaCache;
  }
  
  // Helper to find date column from a list of column names
  private findDateColumn(columns: string[]): string | null {
    const dateColumnCandidates = ['dt', 'datetime', 'date', 'call_date', 'start_time', 
                                  'created_at', 'timestamp', 'time', 'call_datetime'];
    
    for (const candidate of dateColumnCandidates) {
      if (columns.includes(candidate)) {
        return candidate;
      }
    }
    return null;
  }
  
  // Fetch CDRs using discovered schema
  async getCDRsViaSQL(
    storage: StorageInterface,
    startDate: string,
    endDate: string
  ): Promise<ConnexCSCDR[]> {
    // First discover the schema
    const schema = await this.discoverCDRSchema(storage);
    
    if (!schema) {
      console.log(`[ConnexCS CDR] Cannot fetch CDRs - schema discovery failed`);
      return [];
    }
    
    // Build query with discovered schema
    const { table, dateColumn } = schema;
    const sql = `SELECT * FROM ${table} WHERE ${dateColumn} >= '${startDate}' AND ${dateColumn} <= '${endDate} 23:59:59' ORDER BY ${dateColumn} ASC LIMIT 5000`;
    
    console.log(`[ConnexCS CDR] Querying ${table}: ${sql.substring(0, 120)}...`);
    
    try {
      const cdrs = await this.executeSQLQuery(storage, sql);
      if (Array.isArray(cdrs) && cdrs.length > 0) {
        console.log(`[ConnexCS CDR] SQL returned ${cdrs.length} CDRs`);
        return cdrs;
      }
    } catch (error: any) {
      console.log(`[ConnexCS CDR] SQL query error: ${error.message?.substring(0, 150)}`);
    }
    
    return [];
  }

  async getCDRsPaginated(storage: StorageInterface, params: ConnexCSCDRQueryParams): Promise<{
    cdrs: ConnexCSCDR[];
    hasMore: boolean;
    total?: number;
  }> {
    if (this.mockMode) {
      return { cdrs: this.getMockCDRs(), hasMore: false };
    }

    const { startDate, endDate, customerId, limit = 1000, offset = 0 } = params;
    
    // Discover schema first
    const schema = await this.discoverCDRSchema(storage);
    if (!schema) {
      console.log(`[ConnexCS CDR] Cannot fetch CDRs - schema discovery failed`);
      return { cdrs: [], hasMore: false };
    }
    
    const { table, dateColumn } = schema;
    
    // Build WHERE clause with discovered date column
    let whereClause = `${dateColumn} >= '${startDate}' AND ${dateColumn} <= '${endDate} 23:59:59'`;
    if (customerId) {
      whereClause += ` AND customer_id = ${customerId}`;
    }

    const sql = `SELECT * FROM ${table} WHERE ${whereClause} ORDER BY ${dateColumn} ASC LIMIT ${limit + 1} OFFSET ${offset}`;
    console.log(`[ConnexCS CDR] SQL query: ${sql.substring(0, 120)}...`);
    
    try {
      const cdrs = await this.executeSQLQuery(storage, sql);
      
      if (Array.isArray(cdrs) && cdrs.length > 0) {
        console.log(`[ConnexCS CDR] SQL returned ${cdrs.length} CDRs`);
        const hasMore = cdrs.length > limit;
        if (hasMore) cdrs.pop();
        return { cdrs, hasMore };
      }
      
      console.log(`[ConnexCS CDR] SQL returned 0 CDRs`);
    } catch (error) {
      console.log(`[ConnexCS CDR] SQL query error: ${error}`);
    }
    
    return { cdrs: [], hasMore: false };
  }
  
  // Fetch CDRs for a date range using SQL with schema discovery
  async getAllCustomerCDRs(storage: StorageInterface, startDate: string, endDate: string): Promise<ConnexCSCDR[]> {
    console.log(`[ConnexCS CDR] Fetching all CDRs from ${startDate} to ${endDate}`);
    
    // Use the SQL-based approach with schema discovery
    const cdrs = await this.getCDRsViaSQL(storage, startDate, endDate);
    
    console.log(`[ConnexCS CDR] Total CDRs fetched: ${cdrs.length}`);
    return cdrs;
  }
  
  // Alias for carrier CDRs - same approach works for both since CDR table contains all records
  async getAllCarrierCDRs(storage: StorageInterface, startDate: string, endDate: string): Promise<ConnexCSCDR[]> {
    console.log(`[ConnexCS CDR] Fetching carrier CDRs from ${startDate} to ${endDate}`);
    // In ConnexCS, CDRs are stored in a single table with customer_id and carrier_id columns
    // The SQL approach fetches all CDRs which include carrier information
    return this.getCDRsViaSQL(storage, startDate, endDate);
  }

  async getCDRsByMonth(storage: StorageInterface, year: number, month: number): Promise<ConnexCSCDR[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    
    // Use the SQL-based approach with schema discovery
    return this.getCDRsViaSQL(storage, startDate, endDate);
  }

  async getCustomerBalances(storage: StorageInterface): Promise<ConnexCSBalance[]> {
    if (this.mockMode) {
      return [
        { customer_id: 1, customer_name: "Acme Corp", balance: 1500, credit_limit: 5000, currency: "USD", available_credit: 3500 },
        { customer_id: 2, customer_name: "TechStart Inc", balance: 750, credit_limit: 2000, currency: "USD", available_credit: 1250 },
      ];
    }

    const customers = await this.getCustomers(storage);
    return customers.map(c => ({
      customer_id: c.id,
      customer_name: c.name,
      balance: c.balance || 0,
      credit_limit: c.credit_limit || 0,
      currency: c.currency || "USD",
      available_credit: (c.credit_limit || 0) - (c.balance || 0),
    }));
  }

  async getCDRStats(storage: StorageInterface, startDate: string, endDate: string): Promise<{
    totalCalls: number;
    totalMinutes: number;
    totalCost: number;
    answeredCalls: number;
    failedCalls: number;
  }> {
    if (this.mockMode) {
      return { totalCalls: 1000, totalMinutes: 5000, totalCost: 250.50, answeredCalls: 900, failedCalls: 100 };
    }

    const sql = `
      SELECT 
        COUNT(*) as total_calls,
        SUM(billsec) / 60.0 as total_minutes,
        SUM(cost) as total_cost,
        SUM(CASE WHEN status = 'ANSWERED' THEN 1 ELSE 0 END) as answered_calls,
        SUM(CASE WHEN status != 'ANSWERED' THEN 1 ELSE 0 END) as failed_calls
      FROM cdr 
      WHERE dt >= '${startDate}' AND dt <= '${endDate} 23:59:59'
    `;
    
    const result = await this.executeSQLQuery(storage, sql);
    const stats = result[0] as any;
    
    return {
      totalCalls: parseInt(stats?.total_calls || '0'),
      totalMinutes: parseFloat(stats?.total_minutes || '0'),
      totalCost: parseFloat(stats?.total_cost || '0'),
      answeredCalls: parseInt(stats?.answered_calls || '0'),
      failedCalls: parseInt(stats?.failed_calls || '0'),
    };
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
  ConnexCSCarrierFull,
  ConnexCSCustomer,
  ConnexCSCustomerFull,
  ConnexCSRateCard,
  ConnexCSRateCardFull,
  ConnexCSRate,
  ConnexCSRoute,
  ConnexCSCDR,
  ConnexCSKVRecord,
  ConnexCSBalance,
  ConnexCSSyncResult,
  ConnexCSCDRQueryParams,
};
