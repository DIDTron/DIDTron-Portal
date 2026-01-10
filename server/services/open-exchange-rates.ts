import { storage } from "../storage";

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

  return { synced };
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
