import { IStorage } from "../storage";

interface IntegrationCredentials {
  brevo: { api_key: string } | null;
  ayrshare: { api_key: string } | null;
  upstash_redis: { redis_url: string; redis_token: string } | null;
  cloudflare_r2: { 
    account_id: string; 
    bucket_name: string; 
    access_key_id: string; 
    secret_access_key: string 
  } | null;
  connexcs: { username: string; password: string } | null;
  openexchangerates: { app_id: string } | null;
  nowpayments: { apiKey: string; ipnSecret: string } | null;
  stripe: { secret_key: string; publishable_key: string } | null;
  paypal: { client_id: string; client_secret: string } | null;
}

let cachedCredentials: IntegrationCredentials | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getIntegrationCredentials(storage: IStorage): Promise<IntegrationCredentials> {
  const now = Date.now();
  
  if (cachedCredentials && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedCredentials;
  }
  
  const integrations = await storage.getIntegrations();
  
  const credentials: IntegrationCredentials = {
    brevo: null,
    ayrshare: null,
    upstash_redis: null,
    cloudflare_r2: null,
    connexcs: null,
    openexchangerates: null,
    nowpayments: null,
    stripe: null,
    paypal: null,
  };
  
  for (const integration of integrations) {
    if (!integration.isEnabled || !integration.credentials) continue;
    
    switch (integration.provider) {
      case "brevo":
        credentials.brevo = integration.credentials as { api_key: string };
        break;
      case "ayrshare":
        credentials.ayrshare = integration.credentials as { api_key: string };
        break;
      case "upstash_redis":
        credentials.upstash_redis = integration.credentials as { redis_url: string; redis_token: string };
        break;
      case "cloudflare_r2":
        credentials.cloudflare_r2 = integration.credentials as { 
          account_id: string; bucket_name: string; 
          access_key_id: string; secret_access_key: string 
        };
        break;
      case "connexcs":
        credentials.connexcs = integration.credentials as { username: string; password: string };
        break;
      case "openexchangerates":
        credentials.openexchangerates = integration.credentials as { app_id: string };
        break;
      case "nowpayments":
        credentials.nowpayments = integration.credentials as { apiKey: string; ipnSecret: string };
        break;
      case "stripe":
        credentials.stripe = integration.credentials as { secret_key: string; publishable_key: string };
        break;
      case "paypal":
        credentials.paypal = integration.credentials as { client_id: string; client_secret: string };
        break;
    }
  }
  
  cachedCredentials = credentials;
  cacheTimestamp = now;
  
  return credentials;
}

export function clearCredentialsCache(): void {
  cachedCredentials = null;
  cacheTimestamp = 0;
}

// Helper functions for specific integrations
export async function getBrevoApiKey(storage: IStorage): Promise<string | null> {
  const creds = await getIntegrationCredentials(storage);
  return creds.brevo?.api_key || null;
}

export async function getAyrshareApiKey(storage: IStorage): Promise<string | null> {
  const creds = await getIntegrationCredentials(storage);
  return creds.ayrshare?.api_key || null;
}

export async function getUpstashRedis(storage: IStorage): Promise<{ url: string; token: string } | null> {
  const creds = await getIntegrationCredentials(storage);
  if (!creds.upstash_redis) return null;
  return { url: creds.upstash_redis.redis_url, token: creds.upstash_redis.redis_token };
}

export async function getCloudflareR2(storage: IStorage): Promise<{
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
} | null> {
  const creds = await getIntegrationCredentials(storage);
  if (!creds.cloudflare_r2) return null;
  return {
    accountId: creds.cloudflare_r2.account_id,
    bucketName: creds.cloudflare_r2.bucket_name,
    accessKeyId: creds.cloudflare_r2.access_key_id,
    secretAccessKey: creds.cloudflare_r2.secret_access_key,
    endpoint: `https://${creds.cloudflare_r2.account_id}.r2.cloudflarestorage.com`,
  };
}

export async function getConnexCS(storage: IStorage): Promise<{ username: string; password: string } | null> {
  const creds = await getIntegrationCredentials(storage);
  return creds.connexcs || null;
}

export async function getOpenExchangeRatesAppId(storage: IStorage): Promise<string | null> {
  const creds = await getIntegrationCredentials(storage);
  return creds.openexchangerates?.app_id || null;
}

export async function getNowPayments(storage: IStorage): Promise<{ apiKey: string; ipnSecret: string } | null> {
  const creds = await getIntegrationCredentials(storage);
  return creds.nowpayments || null;
}

export async function getStripe(storage: IStorage): Promise<{ secretKey: string; publishableKey: string } | null> {
  const creds = await getIntegrationCredentials(storage);
  if (!creds.stripe) return null;
  return {
    secretKey: creds.stripe.secret_key,
    publishableKey: creds.stripe.publishable_key,
  };
}

export async function getPayPal(storage: IStorage): Promise<{ clientId: string; clientSecret: string } | null> {
  const creds = await getIntegrationCredentials(storage);
  if (!creds.paypal) return null;
  return {
    clientId: creds.paypal.client_id,
    clientSecret: creds.paypal.client_secret,
  };
}

// Initialize and validate all integrations on startup
export async function initializeIntegrations(storage: IStorage): Promise<{
  loaded: string[];
  failed: string[];
}> {
  const creds = await getIntegrationCredentials(storage);
  const loaded: string[] = [];
  const failed: string[] = [];
  
  if (creds.brevo?.api_key) loaded.push("brevo");
  else failed.push("brevo");
  
  if (creds.ayrshare?.api_key) loaded.push("ayrshare");
  else failed.push("ayrshare");
  
  if (creds.upstash_redis?.redis_url && creds.upstash_redis?.redis_token) loaded.push("upstash_redis");
  else failed.push("upstash_redis");
  
  if (creds.cloudflare_r2?.access_key_id) loaded.push("cloudflare_r2");
  else failed.push("cloudflare_r2");
  
  if (creds.connexcs?.username) loaded.push("connexcs");
  else failed.push("connexcs");
  
  if (creds.openexchangerates?.app_id) loaded.push("openexchangerates");
  else failed.push("openexchangerates");
  
  if (creds.nowpayments?.apiKey) loaded.push("nowpayments");
  else failed.push("nowpayments");
  
  console.log(`[Integrations] Loaded ${loaded.length} integrations: ${loaded.join(", ")}`);
  if (failed.length > 0) {
    console.log(`[Integrations] Not configured: ${failed.join(", ")}`);
  }
  
  return { loaded, failed };
}
