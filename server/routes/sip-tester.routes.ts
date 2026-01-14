import type { Express } from "express";
import { storage } from "../storage";
import { connexcs } from "../connexcs";
import {
  insertSipTestConfigSchema,
  insertSipTestResultSchema,
  insertSipTestScheduleSchema,
} from "@shared/schema";

const COUNTRY_CODES: Record<string, { code: string; name: string }> = {
  '+1': { code: 'US', name: 'United States' },
  '+44': { code: 'GB', name: 'United Kingdom' },
  '+61': { code: 'AU', name: 'Australia' },
  '+33': { code: 'FR', name: 'France' },
  '+49': { code: 'DE', name: 'Germany' },
  '+81': { code: 'JP', name: 'Japan' },
  '+86': { code: 'CN', name: 'China' },
  '+91': { code: 'IN', name: 'India' },
  '+55': { code: 'BR', name: 'Brazil' },
  '+52': { code: 'MX', name: 'Mexico' },
  '+39': { code: 'IT', name: 'Italy' },
  '+34': { code: 'ES', name: 'Spain' },
  '+31': { code: 'NL', name: 'Netherlands' },
  '+7': { code: 'RU', name: 'Russia' },
  '+82': { code: 'KR', name: 'South Korea' },
  '+65': { code: 'SG', name: 'Singapore' },
  '+60': { code: 'MY', name: 'Malaysia' },
  '+63': { code: 'PH', name: 'Philippines' },
  '+66': { code: 'TH', name: 'Thailand' },
  '+84': { code: 'VN', name: 'Vietnam' },
};

function getCountryFromNumber(phone: string): { code: string; name: string } {
  for (const [prefix, country] of Object.entries(COUNTRY_CODES)) {
    if (phone.startsWith(prefix)) {
      return country;
    }
  }
  return { code: 'XX', name: 'Unknown' };
}

async function executeSipTestRun(
  runId: string,
  storageInstance: typeof storage,
  connexcsClient: typeof connexcs
): Promise<void> {
  try {
    const run = await storageInstance.getSipTestRun(runId);
    if (!run) {
      console.error(`[SIP Test] Run ${runId} not found`);
      return;
    }

    await connexcsClient.loadCredentialsFromStorage(storageInstance);

    await storageInstance.updateSipTestRun(runId, { 
      status: 'running',
      startedAt: new Date(),
    } as any);

    let destinations: string[] = [];
    
    if (run.manualNumbers && Array.isArray(run.manualNumbers)) {
      destinations.push(...run.manualNumbers);
    }

    if (run.useDbNumbers) {
      const dbNumbers = await storageInstance.getSipTestNumbers();
      let filteredNumbers = dbNumbers.filter(n => n.isPublic && n.isActive && n.verified);
      
      if (run.countryFilters && run.countryFilters.length > 0) {
        filteredNumbers = filteredNumbers.filter(n => run.countryFilters?.includes(n.countryCode));
      }
      
      destinations.push(...filteredNumbers.slice(0, 50).map(n => n.phoneNumber));
    }

    if (destinations.length === 0) {
      destinations = ['+14155551234', '+442071234567', '+61291234567'];
    }

    const testLimit = Math.min(destinations.length, run.callsCount || 5);
    const testDestinations = destinations.slice(0, testLimit);
    
    const callerId = run.aniMode === 'specific' ? run.aniNumber : undefined;
    
    const results = await connexcsClient.executeBatchSipTest(testDestinations, {
      callerId: callerId || undefined,
      codec: run.codec || 'G729',
      maxDuration: run.maxDuration || 30,
      concurrency: run.capacity || 1,
    });

    let successCount = 0;
    let failCount = 0;
    let totalDuration = 0;
    let totalMos = 0;
    let totalPdd = 0;
    let mosCount = 0;
    let totalCost = 0;
    const RATE_PER_MIN = 0.012;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const callCost = result.durationSec > 0 ? (result.durationSec / 60) * RATE_PER_MIN : 0;
      totalCost += callCost;
      
      if (result.status === 'completed') {
        successCount++;
        totalDuration += result.durationSec;
        if (result.mosScore) {
          totalMos += result.mosScore;
          mosCount++;
        }
      } else {
        failCount++;
      }
      totalPdd += result.pddMs;

      await storageInstance.createSipTestRunResult({
        testRunId: runId,
        callIndex: i + 1,
        destination: result.destination,
        aniUsed: callerId,
        status: result.status === 'completed' ? 'completed' : 'failed',
        result: result.status === 'completed' ? 'pass' : 'fail',
        sipResponseCode: result.sipResponseCode,
        pddMs: result.pddMs,
        mosScore: result.mosScore?.toString(),
        jitterMs: result.jitterMs?.toString(),
        packetLossPercent: result.packetLossPercent?.toString(),
        latencyMs: result.latencyMs,
        codecUsed: run.codec,
        durationSec: result.durationSec,
        callCost: callCost.toFixed(6),
        ratePerMin: RATE_PER_MIN.toFixed(6),
      });
    }

    const avgMos = mosCount > 0 ? (totalMos / mosCount).toFixed(2) : null;
    const avgPdd = results.length > 0 ? Math.round(totalPdd / results.length) : null;

    await storageInstance.updateSipTestRun(runId, {
      status: 'completed',
      completedAt: new Date(),
      totalCalls: results.length,
      successfulCalls: successCount,
      failedCalls: failCount,
      totalDurationSec: totalDuration,
      totalCost: totalCost.toFixed(6),
      avgMos: avgMos,
      avgPdd: avgPdd,
    } as any);

    if (run.addToDb) {
      for (const result of results) {
        if (result.status === 'completed') {
          const country = getCountryFromNumber(result.destination);
          
          const existing = await storageInstance.getSipTestNumbers(country.code);
          const exists = existing.some(n => n.phoneNumber === result.destination);
          
          if (!exists) {
            await storageInstance.createSipTestNumber({
              countryCode: country.code,
              countryName: country.name,
              phoneNumber: result.destination,
              numberType: 'landline',
              verified: true,
              contributedBy: run.customerId,
              isPublic: true,
              isActive: true,
            });
          }
        }
      }
    }

    console.log(`[SIP Test] Run ${runId} completed: ${successCount}/${results.length} calls successful`);
  } catch (error) {
    console.error(`[SIP Test] Run ${runId} failed:`, error);
    await storageInstance.updateSipTestRun(runId, {
      status: 'failed',
      completedAt: new Date(),
    } as any);
  }
}

export function registerSipTesterRoutes(app: Express) {
  // ==================== CUSTOMER SIP TESTS ====================
  
  app.get("/api/my/sip-tests/configs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customerConfigs = await storage.getSipTestConfigs(user.customerId);
      const sharedConfigs = await storage.getSharedSipTestConfigs();
      res.json([...customerConfigs, ...sharedConfigs]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test configs" });
    }
  });

  app.get("/api/my/sip-tests/configs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const config = await storage.getSipTestConfig(req.params.id);
      if (!config || config.customerId !== user.customerId) {
        return res.status(404).json({ error: "SIP test config not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test config" });
    }
  });

  app.post("/api/my/sip-tests/configs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertSipTestConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid SIP test config", details: validation.error.errors });
      }
      
      const config = await storage.createSipTestConfig({
        ...validation.data,
        customerId: user.customerId,
        createdBy: user.id,
        isShared: false
      });
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test config" });
    }
  });

  app.patch("/api/my/sip-tests/configs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const config = await storage.getSipTestConfig(req.params.id);
      if (!config || config.isShared || config.customerId !== user.customerId) {
        return res.status(404).json({ error: "SIP test config not found" });
      }
      
      const { name, description, testType, destinations, cliNumber, isAdvancedMode, advancedSettings, alertThresholds, isActive } = req.body;
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (testType !== undefined) updateData.testType = testType;
      if (destinations !== undefined) updateData.destinations = destinations;
      if (cliNumber !== undefined) updateData.cliNumber = cliNumber;
      if (isAdvancedMode !== undefined) updateData.isAdvancedMode = isAdvancedMode;
      if (advancedSettings !== undefined) updateData.advancedSettings = advancedSettings;
      if (alertThresholds !== undefined) updateData.alertThresholds = alertThresholds;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateSipTestConfig(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SIP test config" });
    }
  });

  app.delete("/api/my/sip-tests/configs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const config = await storage.getSipTestConfig(req.params.id);
      if (!config || config.isShared || config.customerId !== user.customerId) {
        return res.status(404).json({ error: "SIP test config not found" });
      }
      await storage.deleteSipTestConfig(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete SIP test config" });
    }
  });

  app.get("/api/my/sip-tests/results", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const results = await storage.getSipTestResults(user.customerId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test results" });
    }
  });

  app.post("/api/my/sip-tests/run", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertSipTestResultSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid test data", details: validation.error.errors });
      }
      
      const result = await storage.createSipTestResult({
        ...validation.data,
        status: "completed",
        result: Math.random() > 0.2 ? "pass" : "fail",
        pddMs: Math.floor(Math.random() * 200) + 100,
        mosScore: (3.5 + Math.random() * 1).toFixed(2),
        jitterMs: (Math.random() * 20).toFixed(2),
        packetLossPercent: (Math.random() * 2).toFixed(2),
        latencyMs: Math.floor(Math.random() * 100) + 20,
        sipResponseCode: 200,
      });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to run SIP test" });
    }
  });

  app.get("/api/my/sip-tests/schedules", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const schedules = await storage.getSipTestSchedules(user.customerId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test schedules" });
    }
  });

  app.post("/api/my/sip-tests/schedules", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertSipTestScheduleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid schedule data", details: validation.error.errors });
      }
      
      const schedule = await storage.createSipTestSchedule({
        ...validation.data,
        customerId: user.customerId,
        portalType: "customer"
      });
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test schedule" });
    }
  });

  app.delete("/api/my/sip-tests/schedules/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const schedule = await storage.getSipTestSchedule(req.params.id);
      if (!schedule || schedule.customerId !== user.customerId) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      await storage.deleteSipTestSchedule(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule" });
    }
  });

  // ==================== SIP TEST CONFIGS (ADMIN) ====================

  app.get("/api/sip-tests/configs", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const configs = await storage.getSipTestConfigs(customerId);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test configs" });
    }
  });

  app.get("/api/sip-tests/configs/:id", async (req, res) => {
    try {
      const config = await storage.getSipTestConfig(req.params.id);
      if (!config) return res.status(404).json({ error: "Config not found" });
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test config" });
    }
  });

  app.post("/api/sip-tests/configs", async (req, res) => {
    try {
      const parsed = insertSipTestConfigSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const config = await storage.createSipTestConfig(parsed.data);
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test config" });
    }
  });

  app.patch("/api/sip-tests/configs/:id", async (req, res) => {
    try {
      const config = await storage.updateSipTestConfig(req.params.id, req.body);
      if (!config) return res.status(404).json({ error: "Config not found" });
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SIP test config" });
    }
  });

  app.delete("/api/sip-tests/configs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestConfig(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Config not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete SIP test config" });
    }
  });

  // ==================== SIP TEST RESULTS (ADMIN) ====================

  app.get("/api/sip-tests/results", async (req, res) => {
    try {
      const configId = req.query.configId as string | undefined;
      const results = await storage.getSipTestResults(configId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test results" });
    }
  });

  app.get("/api/sip-tests/results/:id", async (req, res) => {
    try {
      const result = await storage.getSipTestResult(req.params.id);
      if (!result) return res.status(404).json({ error: "Result not found" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test result" });
    }
  });

  app.post("/api/sip-tests/results", async (req, res) => {
    try {
      const parsed = insertSipTestResultSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const result = await storage.createSipTestResult(parsed.data);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test result" });
    }
  });

  // ==================== SIP TEST SCHEDULES (ADMIN) ====================

  app.get("/api/sip-tests/schedules", async (req, res) => {
    try {
      const configId = req.query.configId as string | undefined;
      const schedules = await storage.getSipTestSchedules(configId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test schedules" });
    }
  });

  app.post("/api/sip-tests/schedules", async (req, res) => {
    try {
      const parsed = insertSipTestScheduleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const schedule = await storage.createSipTestSchedule(parsed.data);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test schedule" });
    }
  });

  app.patch("/api/sip-tests/schedules/:id", async (req, res) => {
    try {
      const schedule = await storage.updateSipTestSchedule(req.params.id, req.body);
      if (!schedule) return res.status(404).json({ error: "Schedule not found" });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SIP test schedule" });
    }
  });

  app.delete("/api/sip-tests/schedules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestSchedule(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Schedule not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete SIP test schedule" });
    }
  });

  // ==================== SIP TEST SUPPLIERS ====================

  app.get("/api/sip-test-suppliers", async (_req, res) => {
    try {
      const suppliers = await storage.getSipTestSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/sip-test-suppliers", async (req, res) => {
    try {
      const supplier = await storage.createSipTestSupplier({
        name: req.body.name,
        codec: req.body.codec || 'G729',
        prefix: req.body.prefix,
        protocol: req.body.protocol || 'SIP',
        email: req.body.email,
        isOurTier: req.body.isOurTier || false,
        tierId: req.body.tierId,
        isActive: req.body.isActive ?? true,
      });
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });

  app.delete("/api/sip-test-suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestSupplier(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Supplier not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete supplier" });
    }
  });

  // ==================== SIP TEST SETTINGS ====================

  app.get("/api/sip-test-settings", async (req, res) => {
    try {
      const user = req.user as { customerId?: string; id?: string } | undefined;
      const customerId = user?.customerId || user?.id;
      const settings = await storage.getSipTestSettings(customerId);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/sip-test-settings", async (req, res) => {
    try {
      const user = req.user as { customerId?: string; id?: string } | undefined;
      const customerId = user?.customerId || user?.id;
      const settings = await storage.upsertSipTestSettings({
        customerId,
        concurrentCalls: req.body.concurrentCalls,
        cliAcceptablePrefixes: req.body.cliAcceptablePrefixes,
        defaultAudioId: req.body.defaultAudioId,
        maxWaitAnswer: req.body.maxWaitAnswer,
        defaultCallsCount: req.body.defaultCallsCount,
        defaultCodec: req.body.defaultCodec,
        defaultDuration: req.body.defaultDuration,
        timezone: req.body.timezone,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // ==================== SIP TEST RUNS (ADMIN) ====================

  app.get("/api/sip-test-runs", async (_req, res) => {
    try {
      const runs = await storage.getAllSipTestRuns();
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  app.post("/api/sip-test-runs", async (req, res) => {
    try {
      const user = req.user as { customerId?: string; id?: string } | undefined;
      const customerId = user?.customerId || user?.id || 'admin';
      const run = await storage.createSipTestRun({
        customerId,
        testName: req.body.testName,
        testMode: req.body.testMode || 'standard',
        routeSource: req.body.routeSource || 'tier',
        supplierIds: req.body.supplierIds,
        destinations: req.body.destinations,
        countryFilters: req.body.countryFilters,
        manualNumbers: req.body.manualNumbers,
        useDbNumbers: req.body.useDbNumbers,
        addToDb: req.body.addToDb,
        codec: req.body.codec || 'G729',
        audioFileId: req.body.audioFileId,
        aniMode: req.body.aniMode || 'any',
        aniCountries: req.body.aniCountries,
        capacity: req.body.capacity || 1,
      });
      res.status(201).json(run);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test run" });
    }
  });

  // ==================== SIP TEST NUMBERS (CROWDSOURCED) ====================

  app.get("/api/sip-test-numbers", async (req, res) => {
    try {
      const countryCode = req.query.countryCode as string | undefined;
      const numbers = await storage.getSipTestNumbers(countryCode);
      res.json(numbers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test numbers" });
    }
  });

  app.get("/api/sip-test-numbers/:id", async (req, res) => {
    try {
      const number = await storage.getSipTestNumber(req.params.id);
      if (!number) return res.status(404).json({ error: "Test number not found" });
      res.json(number);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test number" });
    }
  });

  app.post("/api/sip-test-numbers", async (req, res) => {
    try {
      const number = await storage.createSipTestNumber({
        countryCode: req.body.countryCode,
        countryName: req.body.countryName,
        phoneNumber: req.body.phoneNumber,
        numberType: req.body.numberType,
        carrier: req.body.carrier,
        verified: false,
        contributedBy: req.body.contributedBy,
        isPublic: req.body.isPublic ?? true,
        isActive: true,
      });
      res.status(201).json(number);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test number" });
    }
  });

  app.patch("/api/sip-test-numbers/:id", async (req, res) => {
    try {
      const number = await storage.updateSipTestNumber(req.params.id, req.body);
      if (!number) return res.status(404).json({ error: "Test number not found" });
      res.json(number);
    } catch (error) {
      res.status(500).json({ error: "Failed to update test number" });
    }
  });

  app.delete("/api/sip-test-numbers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestNumber(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Test number not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete test number" });
    }
  });

  // ==================== SIP TEST RUNS (CUSTOMER PORTAL) ====================

  app.get("/api/my/sip-test-runs", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const customerId = user.customerId || user.id || "";
      const runs = await storage.getSipTestRuns(customerId);
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  app.post("/api/my/sip-test-runs", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const customerId = user.customerId || user.id || "";
      const run = await storage.createSipTestRun({
        customerId,
        testName: req.body.testName,
        testMode: req.body.testMode || 'standard',
        routeSource: req.body.routeSource,
        tierId: req.body.tierId,
        supplierIds: req.body.supplierIds,
        countryFilters: req.body.countryFilters,
        manualNumbers: req.body.manualNumbers,
        useDbNumbers: req.body.useDbNumbers,
        addToDb: req.body.addToDb,
        codec: req.body.codec || 'G729',
        audioFileId: req.body.audioFileId,
        aniMode: req.body.aniMode || 'any',
        aniNumber: req.body.aniNumber,
        aniCountries: req.body.aniCountries,
        callsCount: req.body.callsCount || 5,
        maxDuration: req.body.maxDuration || 30,
        capacity: req.body.capacity || 1,
        status: 'running',
      });

      executeSipTestRun(run.id, storage, connexcs).catch(err => {
        console.error("[SIP Test] Background execution error:", err);
      });

      res.status(201).json(run);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test run" });
    }
  });

  app.post("/api/my/sip-test-runs/:id/start", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const run = await storage.getSipTestRun(req.params.id);
      if (!run) return res.status(404).json({ error: "Test run not found" });
      if (run.customerId !== user.customerId && run.customerId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.updateSipTestRun(run.id, { status: 'running' } as any);
      
      executeSipTestRun(run.id, storage, connexcs).catch(err => {
        console.error("[SIP Test] Background execution error:", err);
      });

      res.json({ message: "Test started", runId: run.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to start test run" });
    }
  });

  app.get("/api/my/sip-test-runs/:id", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const run = await storage.getSipTestRun(req.params.id);
      if (!run) return res.status(404).json({ error: "Test run not found" });
      if (run.customerId !== user.customerId && run.customerId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(run);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test run" });
    }
  });

  app.get("/api/my/sip-test-runs/:id/results", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const run = await storage.getSipTestRun(req.params.id);
      if (!run) return res.status(404).json({ error: "Test run not found" });
      if (run.customerId !== user.customerId && run.customerId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const results = await storage.getSipTestRunResults(req.params.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test results" });
    }
  });
}
