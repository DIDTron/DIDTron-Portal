import type { CrmConnection, CrmSyncSettings, CrmContactMapping, AiVoiceCallLog } from "@shared/schema";

export interface CrmContact {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  ownerId?: string;
  raw: Record<string, unknown>;
}

export interface CrmActivity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  contactId?: string;
  accountId?: string;
  durationMinutes?: number;
  callDisposition?: string;
  raw: Record<string, unknown>;
}

export interface CrmSyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: Array<{ record?: string; error: string }>;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  instance_url?: string;
}

abstract class BaseCrmClient {
  protected connection: CrmConnection;
  protected settings?: CrmSyncSettings;

  constructor(connection: CrmConnection, settings?: CrmSyncSettings) {
    this.connection = connection;
    this.settings = settings;
  }

  abstract testConnection(): Promise<{ success: boolean; error?: string }>;
  abstract refreshToken(): Promise<TokenResponse | null>;
  abstract searchContacts(query: string, limit?: number): Promise<CrmContact[]>;
  abstract getContactByPhone(phone: string): Promise<CrmContact | null>;
  abstract getContactByEmail(email: string): Promise<CrmContact | null>;
  abstract createContact(data: Partial<CrmContact>): Promise<CrmContact>;
  abstract updateContact(id: string, data: Partial<CrmContact>): Promise<CrmContact>;
  abstract logCallActivity(callLog: AiVoiceCallLog, contactId?: string): Promise<CrmActivity>;
  abstract getRecentActivities(contactId: string, limit?: number): Promise<CrmActivity[]>;
}

export class SalesforceClient extends BaseCrmClient {
  private get baseUrl(): string {
    return this.connection.instanceUrl || "https://login.salesforce.com";
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/services/data/v59.0`;
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith("http") ? endpoint : `${this.apiUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.connection.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    return response;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.connection.accessToken) {
        return { success: false, error: "No access token configured" };
      }
      const response = await this.fetch("/query?q=SELECT+Id+FROM+User+LIMIT+1");
      if (response.ok) {
        return { success: true };
      }
      const error = await response.text();
      return { success: false, error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Connection failed" };
    }
  }

  async refreshToken(): Promise<TokenResponse | null> {
    if (!this.connection.refreshToken) return null;
    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.connection.refreshToken,
        client_id: process.env.SALESFORCE_CLIENT_ID || "",
        client_secret: process.env.SALESFORCE_CLIENT_SECRET || "",
      });
      const response = await fetch(`${this.baseUrl}/services/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async searchContacts(query: string, limit = 10): Promise<CrmContact[]> {
    const sosl = `FIND {${query}} IN ALL FIELDS RETURNING Contact(Id,Email,Phone,FirstName,LastName,Account.Name,Title,OwnerId LIMIT ${limit})`;
    const response = await this.fetch(`/search/?q=${encodeURIComponent(sosl)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.searchRecords || []).map((r: any) => this.mapContact(r));
  }

  async getContactByPhone(phone: string): Promise<CrmContact | null> {
    const normalized = phone.replace(/\D/g, "");
    const soql = `SELECT Id,Email,Phone,FirstName,LastName,Account.Name,Title,OwnerId FROM Contact WHERE Phone LIKE '%${normalized}%' LIMIT 1`;
    const response = await this.fetch(`/query?q=${encodeURIComponent(soql)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.records?.length > 0) {
      return this.mapContact(data.records[0]);
    }
    return null;
  }

  async getContactByEmail(email: string): Promise<CrmContact | null> {
    const soql = `SELECT Id,Email,Phone,FirstName,LastName,Account.Name,Title,OwnerId FROM Contact WHERE Email = '${email}' LIMIT 1`;
    const response = await this.fetch(`/query?q=${encodeURIComponent(soql)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.records?.length > 0) {
      return this.mapContact(data.records[0]);
    }
    return null;
  }

  async createContact(data: Partial<CrmContact>): Promise<CrmContact> {
    const payload = {
      FirstName: data.firstName,
      LastName: data.lastName || "Unknown",
      Email: data.email,
      Phone: data.phone,
      Title: data.title,
    };
    const response = await this.fetch("/sobjects/Contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create contact");
    return { ...data, id: result.id, raw: result } as CrmContact;
  }

  async updateContact(id: string, data: Partial<CrmContact>): Promise<CrmContact> {
    const payload: Record<string, unknown> = {};
    if (data.firstName) payload.FirstName = data.firstName;
    if (data.lastName) payload.LastName = data.lastName;
    if (data.email) payload.Email = data.email;
    if (data.phone) payload.Phone = data.phone;
    if (data.title) payload.Title = data.title;
    
    await this.fetch(`/sobjects/Contact/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return { ...data, id, raw: payload } as CrmContact;
  }

  async logCallActivity(callLog: AiVoiceCallLog, contactId?: string): Promise<CrmActivity> {
    const durationMinutes = Math.ceil((callLog.duration || 0) / 60);
    const payload = {
      Subject: `AI Voice Call - ${callLog.direction || "inbound"}`,
      Description: callLog.transcript || `Call duration: ${durationMinutes} minutes`,
      WhoId: contactId,
      TaskSubtype: "Call",
      Status: "Completed",
      Type: "Call",
      CallDurationInSeconds: callLog.duration,
      CallType: callLog.direction === "outbound" ? "Outbound" : "Inbound",
      CallDisposition: callLog.outcome || "Completed",
    };
    const response = await this.fetch("/sobjects/Task", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to log activity");
    return {
      id: result.id,
      type: "Call",
      subject: payload.Subject,
      description: payload.Description || undefined,
      contactId,
      durationMinutes,
      callDisposition: callLog.outcome || undefined,
      raw: result,
    };
  }

  async getRecentActivities(contactId: string, limit = 10): Promise<CrmActivity[]> {
    const soql = `SELECT Id,Subject,Description,Type,Status,CreatedDate FROM Task WHERE WhoId = '${contactId}' ORDER BY CreatedDate DESC LIMIT ${limit}`;
    const response = await this.fetch(`/query?q=${encodeURIComponent(soql)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.records || []).map((r: any) => ({
      id: r.Id,
      type: r.Type,
      subject: r.Subject,
      description: r.Description,
      contactId,
      raw: r,
    }));
  }

  private mapContact(record: any): CrmContact {
    return {
      id: record.Id,
      email: record.Email,
      phone: record.Phone,
      firstName: record.FirstName,
      lastName: record.LastName,
      company: record.Account?.Name,
      title: record.Title,
      ownerId: record.OwnerId,
      raw: record,
    };
  }
}

export class HubSpotClient extends BaseCrmClient {
  private readonly baseUrl = "https://api.hubapi.com";

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.connection.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    return response;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.connection.accessToken) {
        return { success: false, error: "No access token configured" };
      }
      const response = await this.fetch("/crm/v3/objects/contacts?limit=1");
      if (response.ok) {
        return { success: true };
      }
      const error = await response.text();
      return { success: false, error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Connection failed" };
    }
  }

  async refreshToken(): Promise<TokenResponse | null> {
    if (!this.connection.refreshToken) return null;
    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.connection.refreshToken,
        client_id: process.env.HUBSPOT_CLIENT_ID || "",
        client_secret: process.env.HUBSPOT_CLIENT_SECRET || "",
      });
      const response = await fetch("https://api.hubapi.com/oauth/v1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async searchContacts(query: string, limit = 10): Promise<CrmContact[]> {
    const response = await this.fetch("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify({
        query,
        limit,
        properties: ["email", "phone", "firstname", "lastname", "company", "jobtitle", "hubspot_owner_id"],
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map((r: any) => this.mapContact(r));
  }

  async getContactByPhone(phone: string): Promise<CrmContact | null> {
    const normalized = phone.replace(/\D/g, "");
    const response = await this.fetch("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: "phone",
            operator: "CONTAINS_TOKEN",
            value: normalized,
          }],
        }],
        properties: ["email", "phone", "firstname", "lastname", "company", "jobtitle", "hubspot_owner_id"],
        limit: 1,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.results?.length > 0) {
      return this.mapContact(data.results[0]);
    }
    return null;
  }

  async getContactByEmail(email: string): Promise<CrmContact | null> {
    const response = await this.fetch("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: "email",
            operator: "EQ",
            value: email,
          }],
        }],
        properties: ["email", "phone", "firstname", "lastname", "company", "jobtitle", "hubspot_owner_id"],
        limit: 1,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.results?.length > 0) {
      return this.mapContact(data.results[0]);
    }
    return null;
  }

  async createContact(data: Partial<CrmContact>): Promise<CrmContact> {
    const properties: Record<string, string> = {};
    if (data.email) properties.email = data.email;
    if (data.phone) properties.phone = data.phone;
    if (data.firstName) properties.firstname = data.firstName;
    if (data.lastName) properties.lastname = data.lastName;
    if (data.company) properties.company = data.company;
    if (data.title) properties.jobtitle = data.title;

    const response = await this.fetch("/crm/v3/objects/contacts", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create contact");
    return this.mapContact(result);
  }

  async updateContact(id: string, data: Partial<CrmContact>): Promise<CrmContact> {
    const properties: Record<string, string> = {};
    if (data.email) properties.email = data.email;
    if (data.phone) properties.phone = data.phone;
    if (data.firstName) properties.firstname = data.firstName;
    if (data.lastName) properties.lastname = data.lastName;
    if (data.company) properties.company = data.company;
    if (data.title) properties.jobtitle = data.title;

    const response = await this.fetch(`/crm/v3/objects/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update contact");
    return this.mapContact(result);
  }

  async logCallActivity(callLog: AiVoiceCallLog, contactId?: string): Promise<CrmActivity> {
    const durationMinutes = Math.ceil((callLog.duration || 0) / 60);
    const timestamp = callLog.createdAt ? new Date(callLog.createdAt).getTime() : Date.now();
    
    const properties = {
      hs_call_title: `AI Voice Call - ${callLog.direction || "inbound"}`,
      hs_call_body: callLog.transcript || `Call duration: ${durationMinutes} minutes`,
      hs_call_direction: callLog.direction === "outbound" ? "OUTBOUND" : "INBOUND",
      hs_call_duration: String((callLog.duration || 0) * 1000),
      hs_call_status: "COMPLETED",
      hs_call_disposition: callLog.outcome || "completed",
      hs_timestamp: String(timestamp),
    };

    const response = await this.fetch("/crm/v3/objects/calls", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to log call");

    if (contactId) {
      await this.fetch(`/crm/v3/objects/calls/${result.id}/associations/contacts/${contactId}/194`, {
        method: "PUT",
      });
    }

    return {
      id: result.id,
      type: "Call",
      subject: properties.hs_call_title,
      description: properties.hs_call_body,
      contactId,
      durationMinutes,
      callDisposition: callLog.outcome || undefined,
      raw: result,
    };
  }

  async getRecentActivities(contactId: string, limit = 10): Promise<CrmActivity[]> {
    const response = await this.fetch(`/crm/v3/objects/contacts/${contactId}/associations/calls`);
    if (!response.ok) return [];
    const data = await response.json();
    const callIds = (data.results || []).slice(0, limit).map((r: any) => r.id);
    
    if (callIds.length === 0) return [];

    const batchResponse = await this.fetch("/crm/v3/objects/calls/batch/read", {
      method: "POST",
      body: JSON.stringify({
        inputs: callIds.map((id: string) => ({ id })),
        properties: ["hs_call_title", "hs_call_body", "hs_call_direction", "hs_call_duration"],
      }),
    });
    if (!batchResponse.ok) return [];
    const batchData = await batchResponse.json();
    
    return (batchData.results || []).map((r: any) => ({
      id: r.id,
      type: "Call",
      subject: r.properties.hs_call_title,
      description: r.properties.hs_call_body,
      contactId,
      durationMinutes: Math.ceil((parseInt(r.properties.hs_call_duration) || 0) / 60000),
      raw: r,
    }));
  }

  private mapContact(record: any): CrmContact {
    const props = record.properties || {};
    return {
      id: record.id,
      email: props.email,
      phone: props.phone,
      firstName: props.firstname,
      lastName: props.lastname,
      company: props.company,
      title: props.jobtitle,
      ownerId: props.hubspot_owner_id,
      raw: record,
    };
  }
}

export function getCrmClient(connection: CrmConnection, settings?: CrmSyncSettings): BaseCrmClient {
  switch (connection.provider) {
    case "salesforce":
      return new SalesforceClient(connection, settings);
    case "hubspot":
      return new HubSpotClient(connection, settings);
    default:
      throw new Error(`Unsupported CRM provider: ${connection.provider}`);
  }
}

export async function syncCallLogToCrm(
  connection: CrmConnection,
  settings: CrmSyncSettings,
  callLog: AiVoiceCallLog,
  customerId: string,
  existingMapping?: CrmContactMapping
): Promise<{ activity?: CrmActivity; contact?: CrmContact; error?: string }> {
  try {
    console.log(`[CRMSync] Syncing call for customer ${customerId} to ${connection.provider}`);
    const client = getCrmClient(connection, settings);
    let contact: CrmContact | null = null;
    let contactId: string | undefined;

    if (existingMapping?.crmContactId) {
      contactId = existingMapping.crmContactId;
    } else if (callLog.callerNumber || callLog.calledNumber) {
      const phoneToSearch = callLog.direction === "inbound" ? callLog.callerNumber : callLog.calledNumber;
      if (phoneToSearch) {
        contact = await client.getContactByPhone(phoneToSearch);
        if (!contact && settings.autoCreateContacts) {
          contact = await client.createContact({
            phone: phoneToSearch,
            lastName: "Unknown Caller",
          });
        }
        contactId = contact?.id;
      }
    }

    if (settings.autoLogActivities) {
      const activity = await client.logCallActivity(callLog, contactId);
      console.log(`[CRMSync] Logged call activity for customer ${customerId}`);
      return { activity, contact: contact || undefined };
    }

    return { contact: contact || undefined };
  } catch (err) {
    console.error(`[CRMSync] Failed for customer ${customerId}:`, err);
    return { error: err instanceof Error ? err.message : "Sync failed" };
  }
}
