import { storage } from "../storage";
import { brevoService } from "../brevo";

interface OpenExchangeCurrencies {
  [code: string]: string;
}

interface OpenExchangeRates {
  disclaimer: string;
  license: string;
  timestamp: number;
  base: string;
  rates: { [code: string]: number };
}

const OPEN_EXCHANGE_API_BASE = "https://openexchangerates.org/api";
const SYNC_INTERVAL_MS = 60 * 60 * 1000;

let schedulerStarted = false;
let lastSyncTime: Date | null = null;
let lastSyncError: string | null = null;

async function getAppId(): Promise<string | null> {
  if (process.env.OPEN_EXCHANGE_RATES_APP_ID) {
    return process.env.OPEN_EXCHANGE_RATES_APP_ID;
  }
  
  const integration = await storage.getIntegrationByProvider("open_exchange_rates");
  if (!integration || !integration.credentials) {
    return null;
  }
  const credentials = integration.credentials as { appId?: string };
  return credentials.appId || null;
}

async function sendErrorNotification(error: string): Promise<void> {
  try {
    await brevoService.loadCredentialsFromStorage(storage);
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || "info@didtron.com";
    await brevoService.sendEmail({
      to: adminEmail,
      subject: "[DIDTron] Open Exchange Rates Sync Failed",
      htmlContent: `
        <h2>Currency Sync Error</h2>
        <p>The automatic currency sync from Open Exchange Rates failed.</p>
        <p><strong>Error:</strong> ${error}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>Please check the Open Exchange Rates API configuration in Admin > Settings > Integrations.</p>
      `,
    });
    console.log("[OpenExchange] Error notification sent to", adminEmail);
  } catch (emailError) {
    console.error("[OpenExchange] Failed to send error notification:", emailError);
  }
}

export function getLastSyncStatus(): { lastSyncTime: Date | null; lastSyncError: string | null; schedulerActive: boolean } {
  return { lastSyncTime, lastSyncError, schedulerActive: schedulerStarted };
}

export async function fetchCurrenciesFromOpenExchange(): Promise<{ code: string; name: string }[]> {
  const appId = await getAppId();
  if (!appId) {
    throw new Error("Open Exchange Rates API key not configured");
  }

  const response = await fetch(`${OPEN_EXCHANGE_API_BASE}/currencies.json?app_id=${appId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch currencies: ${response.statusText}`);
  }

  const data: OpenExchangeCurrencies = await response.json();
  return Object.entries(data).map(([code, name]) => ({ code, name }));
}

export async function fetchExchangeRates(baseCurrency: string = "USD"): Promise<{ quoteCurrency: string; rate: number }[]> {
  const appId = await getAppId();
  if (!appId) {
    throw new Error("Open Exchange Rates API key not configured");
  }

  const response = await fetch(`${OPEN_EXCHANGE_API_BASE}/latest.json?app_id=${appId}&base=${baseCurrency}`);
  if (!response.ok) {
    if (response.status === 403) {
      const fallbackResponse = await fetch(`${OPEN_EXCHANGE_API_BASE}/latest.json?app_id=${appId}`);
      if (!fallbackResponse.ok) {
        throw new Error(`Failed to fetch exchange rates: ${fallbackResponse.statusText}`);
      }
      const data: OpenExchangeRates = await fallbackResponse.json();
      return Object.entries(data.rates).map(([quoteCurrency, rate]) => ({ quoteCurrency, rate }));
    }
    throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
  }

  const data: OpenExchangeRates = await response.json();
  return Object.entries(data.rates).map(([quoteCurrency, rate]) => ({ quoteCurrency, rate }));
}

export async function syncCurrencies(): Promise<{ added: number; updated: number; total: number }> {
  const currencies = await fetchCurrenciesFromOpenExchange();
  const existingCurrencies = await storage.getCurrencies();
  const existingCodes = new Set(existingCurrencies.map(c => c.code));
  
  let added = 0;
  let updated = 0;

  for (const { code, name } of currencies) {
    if (!existingCodes.has(code)) {
      await storage.createCurrency({ code, name, isActive: true });
      added++;
    }
  }

  const integration = await storage.getIntegrationByProvider("open_exchange_rates");
  if (integration) {
    await storage.updateIntegration(integration.id, {
      lastSyncedAt: new Date(),
      status: "connected",
      testResult: `Synced ${currencies.length} currencies successfully`,
    });
  }

  return { added, updated, total: currencies.length };
}

export async function syncExchangeRates(): Promise<{ synced: number }> {
  try {
    const rates = await fetchExchangeRates("USD");
    
    let synced = 0;
    for (const { quoteCurrency, rate } of rates) {
      await storage.createFxRate({
        baseCurrency: "USD",
        quoteCurrency,
        rate: rate.toString(),
        source: "openexchangerates",
        effectiveAt: new Date(),
      });
      synced++;
    }

    lastSyncTime = new Date();
    lastSyncError = null;
    console.log(`[OpenExchange] Synced ${synced} exchange rates`);
    return { synced };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    lastSyncError = errorMessage;
    console.error("[OpenExchange] Exchange rate sync failed:", errorMessage);
    await sendErrorNotification(errorMessage);
    throw error;
  }
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const appId = await getAppId();
    if (!appId) {
      return { success: false, message: "API key not configured" };
    }

    const response = await fetch(`${OPEN_EXCHANGE_API_BASE}/currencies.json?app_id=${appId}`);
    if (!response.ok) {
      return { success: false, message: `API error: ${response.statusText}` };
    }

    const data = await response.json();
    const currencyCount = Object.keys(data).length;
    return { success: true, message: `Connected successfully. ${currencyCount} currencies available.` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function runScheduledSync(): Promise<void> {
  console.log("[OpenExchange] Running scheduled currency/rates sync...");
  
  // Import distributed lock functions
  const { acquireDistributedLock, releaseDistributedLock } = await import("./redis-session");
  const lockKey = "didtron:lock:openexchange-sync";
  
  const lockAcquired = await acquireDistributedLock(lockKey, 300); // 5 minute TTL
  if (!lockAcquired) {
    console.log("[OpenExchange] Sync skipped - another instance holds the lock");
    return;
  }
  
  try {
    const appId = await getAppId();
    if (!appId) {
      console.log("[OpenExchange] No API key configured, skipping sync");
      return;
    }

    await syncCurrencies();
    await syncExchangeRates();
    console.log("[OpenExchange] Scheduled sync completed successfully");
  } catch (error) {
    console.error("[OpenExchange] Scheduled sync failed:", error);
  } finally {
    await releaseDistributedLock(lockKey);
  }
}

export function startScheduler(): void {
  if (schedulerStarted) {
    console.log("[OpenExchange] Scheduler already running");
    return;
  }

  console.log("[OpenExchange] Starting hourly currency sync scheduler (every 60 minutes)");
  schedulerStarted = true;

  setTimeout(() => {
    runScheduledSync();
  }, 5000);

  setInterval(() => {
    runScheduledSync();
  }, SYNC_INTERVAL_MS);
}
