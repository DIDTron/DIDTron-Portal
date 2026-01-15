import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { connexcsTools } from "../connexcs-tools-service";
import { getCached, setCache, CACHE_KEYS, CACHE_TTL } from "../services/cache";

async function getValidUserId(sessionUserId?: string): Promise<string | undefined> {
  if (!sessionUserId) {
    console.log("[getValidUserId] No session user ID provided");
    return undefined;
  }
  try {
    const user = await storage.getUser(sessionUserId);
    if (user) {
      console.log(`[getValidUserId] User validated: ${user.id}`);
      return user.id;
    } else {
      console.log(`[getValidUserId] User not found in database: ${sessionUserId}`);
      return undefined;
    }
  } catch (err) {
    console.log(`[getValidUserId] Error looking up user: ${err}`);
    return undefined;
  }
}

export function registerConnexCSRoutes(app: Express): void {
  app.get("/api/connexcs/status", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      const mockMode = connexcsTools.isMockMode();
      if (mockMode) {
        res.json({
          connected: false,
          mockMode: true,
          message: "Running in mock mode - no credentials configured",
        });
      } else {
        try {
          const authResult = await connexcsTools.testAuth(storage);
          if (authResult.success) {
            const carriers = await connexcsTools.getCarriers(storage).catch(() => []);
            const response: any = {
              connected: true,
              mockMode: false,
              message: `Connected to ConnexCS (${carriers.length} carriers)`,
              tokenDaysRemaining: authResult.tokenDaysRemaining,
            };
            if (authResult.warning) response.warning = authResult.warning;
            if (authResult.tokenExpiringSoon) response.tokenExpiringSoon = authResult.tokenExpiringSoon;
            res.json(response);
          } else {
            res.json({
              connected: false,
              mockMode: false,
              message: "Failed to authenticate with ConnexCS",
              error: authResult.error,
            });
          }
        } catch (apiError) {
          res.json({
            connected: false,
            mockMode: false,
            message: "Failed to connect to ConnexCS API",
            error: apiError instanceof Error ? apiError.message : "Connection error",
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        connected: false,
        mockMode: true,
        message: "Error checking ConnexCS status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/connexcs/status/detailed", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      const mockMode = connexcsTools.isMockMode();
      
      if (mockMode) {
        res.json({
          connected: false,
          mockMode: true,
          message: "Running in mock mode - no credentials configured",
          stats: {
            carriers: 3,
            customers: 3,
            rateCards: 3,
            routes: 3,
            cdrs: 20,
          },
        });
      } else {
        try {
          const authResult = await connexcsTools.testAuth(storage);
          if (authResult.success) {
            let stats = { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 };
            
            try {
              const [carriers, customers, rateCards, routes] = await Promise.all([
                connexcsTools.getCarriers(storage).catch(() => []),
                connexcsTools.getCustomers(storage).catch(() => []),
                connexcsTools.getRateCards(storage).catch(() => []),
                connexcsTools.getRoutes(storage).catch(() => []),
              ]);
              stats = {
                carriers: carriers.length,
                customers: customers.length,
                rateCards: rateCards.length,
                routes: routes.length,
                cdrs: 0,
              };
            } catch {}
            
            const response: any = {
              connected: true,
              mockMode: false,
              message: "Connected to ConnexCS",
              tokenDaysRemaining: authResult.tokenDaysRemaining,
              lastSync: new Date().toISOString(),
              stats,
            };
            if (authResult.warning) response.warning = authResult.warning;
            if (authResult.tokenExpiringSoon) response.tokenExpiringSoon = authResult.tokenExpiringSoon;
            res.json(response);
          } else {
            res.json({
              connected: false,
              mockMode: false,
              message: "Failed to authenticate with ConnexCS",
              error: authResult.error,
              stats: { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 },
            });
          }
        } catch (apiError) {
          res.json({
            connected: false,
            mockMode: false,
            message: "Failed to connect to ConnexCS API",
            error: apiError instanceof Error ? apiError.message : "Connection error",
            stats: { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 },
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        connected: false,
        mockMode: true,
        message: "Error checking ConnexCS status",
        error: error instanceof Error ? error.message : "Unknown error",
        stats: { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 },
      });
    }
  });

  app.post("/api/connexcs/test-connection", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      if (connexcsTools.isMockMode()) {
        res.status(400).json({ error: "Cannot test connection in mock mode" });
        return;
      }
      
      const authResult = await connexcsTools.testAuth(storage);
      if (authResult.success) {
        const carriers = await connexcsTools.getCarriers(storage);
        res.json({ 
          success: true, 
          message: `Connection successful - found ${carriers.length} carriers`,
          tokenDaysRemaining: authResult.tokenDaysRemaining,
        });
      } else {
        res.status(400).json({
          success: false,
          error: authResult.error || "Authentication failed",
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Connection test failed" 
      });
    }
  });

  app.post("/api/connexcs/sync", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      if (connexcsTools.isMockMode()) {
        res.status(400).json({ error: "Cannot sync in mock mode" });
        return;
      }
      
      const [carriers, customers, rateCards, routes] = await Promise.all([
        connexcsTools.getCarriers(storage),
        connexcsTools.getCustomers(storage),
        connexcsTools.getRateCards(storage),
        connexcsTools.getRoutes(storage),
      ]);
      
      res.json({ 
        success: true, 
        message: "Data synchronized successfully",
        synced: {
          carriers: carriers.length,
          customers: customers.length,
          rateCards: rateCards.length,
          routes: routes.length,
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Sync failed" 
      });
    }
  });

  app.post("/api/connexcs/sql", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      if (connexcsTools.isMockMode()) {
        res.json({
          success: true,
          data: [
            { id: "mock-1", call_id: "abc123", src: "15551234567", dst: "15559876543", duration: 120, billsec: 118, dt: new Date().toISOString(), cost: 0.024, status: "ANSWERED" },
            { id: "mock-2", call_id: "def456", src: "15551234567", dst: "442071234567", duration: 90, billsec: 87, dt: new Date().toISOString(), cost: 0.045, status: "ANSWERED" },
            { id: "mock-3", call_id: "ghi789", src: "15559998888", dst: "15551112222", duration: 0, billsec: 0, dt: new Date().toISOString(), cost: 0, status: "NO ANSWER" },
          ],
          rowCount: 3,
          mockMode: true,
        });
        return;
      }
      
      const { sql } = req.body;
      if (!sql || typeof sql !== "string") {
        res.status(400).json({ success: false, error: "SQL query is required" });
        return;
      }
      
      const result = await connexcsTools.executeSQLQuery(storage, sql);
      res.json({ 
        success: true, 
        data: result,
        rowCount: result.length,
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Query failed" 
      });
    }
  });

  app.post("/api/connexcs/tools/test-auth", async (req, res) => {
    try {
      const result = await connexcsTools.testAuth(storage);
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          tokenDaysRemaining: result.tokenDaysRemaining,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authentication test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/connexcs/servers", async (req, res) => {
    try {
      const cacheKey = CACHE_KEYS.connexcsServers();
      const cached = await getCached<any>(cacheKey);
      if (cached) {
        return res.json({ ...cached, fromCache: true });
      }
      
      const servers = await connexcsTools.getServers(storage);
      const response = {
        success: true,
        data: servers,
        count: servers.length,
        mockMode: connexcsTools.isMockMode(),
      };
      
      await setCache(cacheKey, response, CACHE_TTL.CONNEXCS_DROPDOWNS);
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch servers",
      });
    }
  });

  app.get("/api/connexcs/account", async (req, res) => {
    try {
      const account = await connexcsTools.getAccountInfo(storage);
      res.json({
        success: true,
        data: account,
        mockMode: connexcsTools.isMockMode(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch account info",
      });
    }
  });

  app.post("/api/admin/connexcs/sync/customers", async (req, res) => {
    try {
      const { syncCustomers } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncCustomers(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/carriers", async (req, res) => {
    try {
      const { syncCarriers } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncCarriers(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/ratecards", async (req, res) => {
    try {
      const { syncRateCards } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncRateCards(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/cdrs", async (req, res) => {
    try {
      const { year, month } = req.body;
      if (!year || !month) {
        return res.status(400).json({ error: "Year and month are required" });
      }
      const { syncCDRs } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncCDRs(year, month, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/all", async (req, res) => {
    try {
      const { syncCustomers, syncCarriers, syncRateCards } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      
      const [customersResult, carriersResult, rateCardsResult] = await Promise.all([
        syncCustomers(userId),
        syncCarriers(userId),
        syncRateCards(userId),
      ]);
      
      res.json({
        success: true,
        customers: customersResult,
        carriers: carriersResult,
        rateCards: rateCardsResult,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.get("/api/admin/connexcs/sync/jobs", async (req, res) => {
    try {
      const { getSyncJobs } = await import("../services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 50;
      const jobs = await getSyncJobs(limit);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync jobs" });
    }
  });

  app.get("/api/admin/connexcs/sync/jobs/:id/logs", async (req, res) => {
    try {
      const { getSyncJobLogs } = await import("../services/connexcs-sync");
      const logs = await getSyncJobLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  app.get("/api/admin/connexcs/import/customers", async (req, res) => {
    try {
      const { getImportedCustomers } = await import("../services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const customers = await getImportedCustomers(limit);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported customers" });
    }
  });

  app.get("/api/admin/connexcs/import/carriers", async (req, res) => {
    try {
      const { getImportedCarriers } = await import("../services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const carriers = await getImportedCarriers(limit);
      res.json(carriers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported carriers" });
    }
  });

  app.get("/api/admin/connexcs/import/ratecards", async (req, res) => {
    try {
      const { getImportedRateCards } = await import("../services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const rateCards = await getImportedRateCards(limit);
      res.json(rateCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported rate cards" });
    }
  });

  app.get("/api/admin/connexcs/import/cdrs", async (req, res) => {
    try {
      const { getImportedCDRs } = await import("../services/connexcs-sync");
      const jobId = req.query.jobId as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const cdrs = await getImportedCDRs(jobId, limit);
      res.json(cdrs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported CDRs" });
    }
  });

  app.get("/api/admin/connexcs/import/cdrs/stats", async (req, res) => {
    try {
      const { getCDRStats } = await import("../services/connexcs-sync");
      const jobId = req.query.jobId as string;
      const stats = await getCDRStats(jobId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CDR stats" });
    }
  });

  app.post("/api/admin/connexcs/map/customers", async (req, res) => {
    try {
      const { mapImportedCustomersToDIDTron } = await import("../services/connexcs-sync");
      const result = await mapImportedCustomersToDIDTron();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Mapping failed" });
    }
  });

  app.post("/api/admin/connexcs/map/carriers", async (req, res) => {
    try {
      const { mapImportedCarriersToDIDTron } = await import("../services/connexcs-sync");
      const result = await mapImportedCarriersToDIDTron();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Mapping failed" });
    }
  });

  app.get("/api/admin/connexcs/reconciliation", async (req, res) => {
    try {
      const { getReconciliationStats } = await import("../services/connexcs-sync");
      const stats = await getReconciliationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get reconciliation stats" });
    }
  });

  app.post("/api/admin/connexcs/sync/balances", async (req, res) => {
    try {
      const { syncBalances } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncBalances(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Balance sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/routes", async (req, res) => {
    try {
      const { syncRoutes } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncRoutes(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Route sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/scripts", async (req, res) => {
    try {
      const { syncScripts } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncScripts(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Script sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/historical-cdrs", async (req, res) => {
    try {
      const { year, months } = req.body;
      if (!year) {
        return res.status(400).json({ error: "Year is required" });
      }
      const { syncHistoricalCDRs } = await import("../services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncHistoricalCDRs(year, months || [1,2,3,4,5,6,7,8,9,10,11,12], userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Historical CDR sync failed" });
    }
  });

  app.get("/api/admin/connexcs/import/balances", async (req, res) => {
    try {
      const { getImportedBalances } = await import("../services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const balances = await getImportedBalances(limit);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balances" });
    }
  });

  app.get("/api/admin/connexcs/import/routes", async (req, res) => {
    try {
      const { getImportedRoutes } = await import("../services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const routes = await getImportedRoutes(limit);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.get("/api/admin/connexcs/import/scripts", async (req, res) => {
    try {
      const { getImportedScripts } = await import("../services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const scripts = await getImportedScripts(limit);
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  app.get("/api/admin/connexcs/cdr-stats", async (req, res) => {
    try {
      const { getCachedCDRStats } = await import("../services/connexcs-sync");
      const periodType = req.query.periodType as string;
      const stats = await getCachedCDRStats(periodType);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CDR statistics" });
    }
  });

  app.post("/api/admin/connexcs/cdr-stats/calculate", async (req, res) => {
    try {
      const { periodType, startDate, endDate } = req.body;
      if (!periodType || !startDate || !endDate) {
        return res.status(400).json({ error: "periodType, startDate, and endDate are required" });
      }
      const { calculateCDRStats } = await import("../services/connexcs-sync");
      await calculateCDRStats(periodType, new Date(startDate), new Date(endDate));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to calculate CDR stats" });
    }
  });
}
