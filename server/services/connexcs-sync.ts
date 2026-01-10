import { connexcsTools, type ConnexCSCustomerFull, type ConnexCSCarrierFull, type ConnexCSRateCard, type ConnexCSCDR } from "../connexcs-tools-service";
import { storage } from "../storage";
import { db } from "../db";
import { 
  connexcsSyncJobs, 
  connexcsImportCustomers, 
  connexcsImportCarriers,
  connexcsImportRateCards,
  connexcsImportCdrs,
  connexcsSyncLogs,
  connexcsEntityMap,
  customers,
  carriers,
} from "@shared/schema";
import { eq } from "drizzle-orm";

interface SyncJobResult {
  jobId: string;
  entityType: string;
  status: "completed" | "failed" | "partial";
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
  durationMs: number;
}

async function log(jobId: string, level: "info" | "warn" | "error", message: string, details?: unknown) {
  await db.insert(connexcsSyncLogs).values({
    syncJobId: jobId,
    level,
    message,
    details: details ? JSON.stringify(details) : null,
  });
  console.log(`[ConnexCS Sync] [${level.toUpperCase()}] ${message}`);
}

export async function syncCustomers(userId?: string): Promise<SyncJobResult> {
  const startTime = Date.now();
  
  const [job] = await db.insert(connexcsSyncJobs).values({
    entityType: "customer",
    status: "syncing",
    startedAt: new Date(),
    ...(userId ? { createdBy: userId } : {}),
  }).returning();

  const result: SyncJobResult = {
    jobId: job.id,
    entityType: "customer",
    status: "completed",
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    await log(job.id, "info", "Starting customer sync from ConnexCS");
    
    const cxCustomers = await connexcsTools.getAllCustomersFull(storage);
    await log(job.id, "info", `Fetched ${cxCustomers.length} customers from ConnexCS`);

    await db.update(connexcsSyncJobs)
      .set({ totalRecords: cxCustomers.length })
      .where(eq(connexcsSyncJobs.id, job.id));

    for (const cxCustomer of cxCustomers) {
      try {
        const [existing] = await db.select()
          .from(connexcsImportCustomers)
          .where(eq(connexcsImportCustomers.connexcsId, cxCustomer.id))
          .limit(1);

        if (existing) {
          await db.update(connexcsImportCustomers)
            .set({
              name: cxCustomer.name,
              email: cxCustomer.email,
              company: cxCustomer.company,
              status: cxCustomer.status,
              balance: cxCustomer.balance?.toString(),
              creditLimit: cxCustomer.credit_limit?.toString(),
              currency: cxCustomer.currency,
              billingType: cxCustomer.billing_type || cxCustomer.payment_type,
              rateCardId: cxCustomer.ratecard_id,
              rateCardName: cxCustomer.ratecard_name,
              channels: cxCustomer.channels,
              cps: cxCustomer.cps,
              address: cxCustomer.address,
              city: cxCustomer.city,
              country: cxCustomer.country,
              phone: cxCustomer.phone,
              rawData: JSON.stringify(cxCustomer),
              importStatus: existing.importStatus === "mapped" || existing.importStatus === "linked" 
                ? existing.importStatus // Preserve mapped/linked status
                : "imported", // Reset to imported for re-mapping (including failed)
            })
            .where(eq(connexcsImportCustomers.id, existing.id));
          result.updated++;
        } else {
          await db.insert(connexcsImportCustomers).values({
            syncJobId: job.id,
            connexcsId: cxCustomer.id,
            name: cxCustomer.name,
            email: cxCustomer.email,
            company: cxCustomer.company,
            status: cxCustomer.status,
            balance: cxCustomer.balance?.toString(),
            creditLimit: cxCustomer.credit_limit?.toString(),
            currency: cxCustomer.currency,
            billingType: cxCustomer.billing_type || cxCustomer.payment_type,
            rateCardId: cxCustomer.ratecard_id,
            rateCardName: cxCustomer.ratecard_name,
            channels: cxCustomer.channels,
            cps: cxCustomer.cps,
            address: cxCustomer.address,
            city: cxCustomer.city,
            country: cxCustomer.country,
            phone: cxCustomer.phone,
            rawData: JSON.stringify(cxCustomer),
            importStatus: "imported",
          });
          result.imported++;
        }
      } catch (err) {
        result.failed++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Customer ${cxCustomer.id}: ${errorMsg}`);
        await log(job.id, "error", `Failed to import customer ${cxCustomer.id}`, { error: errorMsg });
      }
    }

    await log(job.id, "info", `Sync completed: ${result.imported} imported, ${result.updated} updated, ${result.failed} failed`);

  } catch (err) {
    result.status = "failed";
    const errorMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(errorMsg);
    await log(job.id, "error", "Customer sync failed", { error: errorMsg });
  }

  result.durationMs = Date.now() - startTime;

  await db.update(connexcsSyncJobs)
    .set({
      status: result.status,
      completedAt: new Date(),
      importedRecords: result.imported,
      updatedRecords: result.updated,
      failedRecords: result.failed,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    })
    .where(eq(connexcsSyncJobs.id, job.id));

  return result;
}

export async function syncCarriers(userId?: string): Promise<SyncJobResult> {
  const startTime = Date.now();
  
  const [job] = await db.insert(connexcsSyncJobs).values({
    entityType: "carrier",
    status: "syncing",
    startedAt: new Date(),
    ...(userId ? { createdBy: userId } : {}),
  }).returning();

  const result: SyncJobResult = {
    jobId: job.id,
    entityType: "carrier",
    status: "completed",
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    await log(job.id, "info", "Starting carrier sync from ConnexCS");
    
    const cxCarriers = await connexcsTools.getAllCarriersFull(storage);
    await log(job.id, "info", `Fetched ${cxCarriers.length} carriers from ConnexCS`);

    await db.update(connexcsSyncJobs)
      .set({ totalRecords: cxCarriers.length })
      .where(eq(connexcsSyncJobs.id, job.id));

    for (const cxCarrier of cxCarriers) {
      try {
        const [existing] = await db.select()
          .from(connexcsImportCarriers)
          .where(eq(connexcsImportCarriers.connexcsId, cxCarrier.id))
          .limit(1);

        if (existing) {
          await db.update(connexcsImportCarriers)
            .set({
              name: cxCarrier.name,
              status: cxCarrier.status,
              channels: cxCarrier.channels,
              cps: cxCarrier.cps,
              host: cxCarrier.host,
              port: cxCarrier.port,
              ip: cxCarrier.ip,
              protocol: cxCarrier.protocol,
              currency: cxCarrier.currency,
              rateCardId: cxCarrier.ratecard_id,
              rateCardName: cxCarrier.ratecard_name,
              billingType: cxCarrier.billing_type,
              balance: cxCarrier.balance?.toString(),
              creditLimit: cxCarrier.credit_limit?.toString(),
              rawData: JSON.stringify(cxCarrier),
              importStatus: existing.importStatus === "mapped" || existing.importStatus === "linked"
                ? existing.importStatus
                : "imported",
            })
            .where(eq(connexcsImportCarriers.id, existing.id));
          result.updated++;
        } else {
          await db.insert(connexcsImportCarriers).values({
            syncJobId: job.id,
            connexcsId: cxCarrier.id,
            name: cxCarrier.name,
            status: cxCarrier.status,
            channels: cxCarrier.channels,
            cps: cxCarrier.cps,
            host: cxCarrier.host,
            port: cxCarrier.port,
            ip: cxCarrier.ip,
            protocol: cxCarrier.protocol,
            currency: cxCarrier.currency,
            rateCardId: cxCarrier.ratecard_id,
            rateCardName: cxCarrier.ratecard_name,
            billingType: cxCarrier.billing_type,
            balance: cxCarrier.balance?.toString(),
            creditLimit: cxCarrier.credit_limit?.toString(),
            rawData: JSON.stringify(cxCarrier),
            importStatus: "imported",
          });
          result.imported++;
        }
      } catch (err) {
        result.failed++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Carrier ${cxCarrier.id}: ${errorMsg}`);
        await log(job.id, "error", `Failed to import carrier ${cxCarrier.id}`, { error: errorMsg });
      }
    }

    await log(job.id, "info", `Sync completed: ${result.imported} imported, ${result.updated} updated, ${result.failed} failed`);

  } catch (err) {
    result.status = "failed";
    const errorMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(errorMsg);
    await log(job.id, "error", "Carrier sync failed", { error: errorMsg });
  }

  result.durationMs = Date.now() - startTime;

  await db.update(connexcsSyncJobs)
    .set({
      status: result.status,
      completedAt: new Date(),
      importedRecords: result.imported,
      updatedRecords: result.updated,
      failedRecords: result.failed,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    })
    .where(eq(connexcsSyncJobs.id, job.id));

  return result;
}

export async function syncRateCards(userId?: string): Promise<SyncJobResult> {
  const startTime = Date.now();
  
  const [job] = await db.insert(connexcsSyncJobs).values({
    entityType: "ratecard",
    status: "syncing",
    startedAt: new Date(),
    ...(userId ? { createdBy: userId } : {}),
  }).returning();

  const result: SyncJobResult = {
    jobId: job.id,
    entityType: "ratecard",
    status: "completed",
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    await log(job.id, "info", "Starting rate card sync from ConnexCS");
    
    const cxRateCards = await connexcsTools.getRateCards(storage);
    await log(job.id, "info", `Fetched ${cxRateCards.length} rate cards from ConnexCS`);

    await db.update(connexcsSyncJobs)
      .set({ totalRecords: cxRateCards.length })
      .where(eq(connexcsSyncJobs.id, job.id));

    for (const cxRateCard of cxRateCards) {
      try {
        // Convert ID to string since ConnexCS rate cards have string IDs
        const rateCardId = String(cxRateCard.id);
        const rates = await connexcsTools.getRateCardRates(storage, cxRateCard.id);
        
        const [existing] = await db.select()
          .from(connexcsImportRateCards)
          .where(eq(connexcsImportRateCards.connexcsId, rateCardId))
          .limit(1);

        if (existing) {
          await db.update(connexcsImportRateCards)
            .set({
              name: cxRateCard.name,
              direction: cxRateCard.direction,
              currency: cxRateCard.currency,
              status: cxRateCard.status,
              rateCount: rates.length,
              rawData: JSON.stringify({ ...cxRateCard, rates }),
              importStatus: existing.importStatus === "mapped" || existing.importStatus === "linked"
                ? existing.importStatus
                : "imported",
            })
            .where(eq(connexcsImportRateCards.id, existing.id));
          result.updated++;
        } else {
          await db.insert(connexcsImportRateCards).values({
            syncJobId: job.id,
            connexcsId: rateCardId,
            name: cxRateCard.name,
            direction: cxRateCard.direction,
            currency: cxRateCard.currency,
            status: cxRateCard.status,
            rateCount: rates.length,
            rawData: JSON.stringify({ ...cxRateCard, rates }),
            importStatus: "imported",
          });
          result.imported++;
        }
      } catch (err) {
        result.failed++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`RateCard ${cxRateCard.id}: ${errorMsg}`);
        await log(job.id, "error", `Failed to import rate card ${cxRateCard.id}`, { error: errorMsg });
      }
    }

    await log(job.id, "info", `Sync completed: ${result.imported} imported, ${result.updated} updated, ${result.failed} failed`);

  } catch (err) {
    result.status = "failed";
    const errorMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(errorMsg);
    await log(job.id, "error", "Rate card sync failed", { error: errorMsg });
  }

  result.durationMs = Date.now() - startTime;

  await db.update(connexcsSyncJobs)
    .set({
      status: result.status,
      completedAt: new Date(),
      importedRecords: result.imported,
      updatedRecords: result.updated,
      failedRecords: result.failed,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    })
    .where(eq(connexcsSyncJobs.id, job.id));

  return result;
}

export async function syncCDRs(
  year: number, 
  month: number, 
  userId?: string
): Promise<SyncJobResult> {
  const startTime = Date.now();
  
  const [job] = await db.insert(connexcsSyncJobs).values({
    entityType: "cdr",
    status: "syncing",
    startedAt: new Date(),
    params: JSON.stringify({ year, month }),
    ...(userId ? { createdBy: userId } : {}),
  }).returning();

  const result: SyncJobResult = {
    jobId: job.id,
    entityType: "cdr",
    status: "completed",
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    await log(job.id, "info", `Starting CDR sync for ${year}-${String(month).padStart(2, '0')}`);
    
    const cdrs = await connexcsTools.getCDRsByMonth(storage, year, month);
    await log(job.id, "info", `Fetched ${cdrs.length} CDRs for ${year}-${String(month).padStart(2, '0')}`);

    await db.update(connexcsSyncJobs)
      .set({ totalRecords: cdrs.length })
      .where(eq(connexcsSyncJobs.id, job.id));

    const batchSize = 500;
    for (let i = 0; i < cdrs.length; i += batchSize) {
      const batch = cdrs.slice(i, i + batchSize);
      
      try {
        const values = batch.map(cdr => ({
          syncJobId: job.id,
          connexcsId: cdr.id,
          callId: cdr.call_id,
          src: cdr.src,
          dst: cdr.dst,
          duration: cdr.duration,
          billsec: cdr.billsec,
          callTime: cdr.dt ? new Date(cdr.dt) : null,
          cost: cdr.cost?.toString(),
          rate: cdr.rate?.toString(),
          status: cdr.status,
          hangupCause: cdr.hangup_cause,
          direction: cdr.direction,
          customerId: cdr.customer_id,
          customerName: cdr.customer_name,
          carrierId: cdr.carrier_id,
          carrierName: cdr.carrier_name,
          prefix: cdr.prefix,
          destination: cdr.destination,
          currency: cdr.currency,
          rawData: JSON.stringify(cdr),
          importStatus: "imported",
        }));

        await db.insert(connexcsImportCdrs).values(values);
        result.imported += batch.length;
        
        if (i % 5000 === 0 && i > 0) {
          await log(job.id, "info", `Progress: ${i + batch.length}/${cdrs.length} CDRs imported`);
        }
      } catch (err) {
        result.failed += batch.length;
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Batch ${i}-${i + batchSize}: ${errorMsg}`);
        await log(job.id, "error", `Failed to import CDR batch`, { error: errorMsg, batchStart: i });
      }
    }

    await log(job.id, "info", `CDR sync completed: ${result.imported} imported, ${result.failed} failed`);

  } catch (err) {
    result.status = "failed";
    const errorMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(errorMsg);
    await log(job.id, "error", "CDR sync failed", { error: errorMsg });
  }

  result.durationMs = Date.now() - startTime;

  await db.update(connexcsSyncJobs)
    .set({
      status: result.status,
      completedAt: new Date(),
      importedRecords: result.imported,
      updatedRecords: result.updated,
      failedRecords: result.failed,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    })
    .where(eq(connexcsSyncJobs.id, job.id));

  return result;
}

export async function getSyncJobs(limit = 50) {
  return db.select()
    .from(connexcsSyncJobs)
    .orderBy(connexcsSyncJobs.createdAt)
    .limit(limit);
}

export async function getSyncJobLogs(jobId: string) {
  return db.select()
    .from(connexcsSyncLogs)
    .where(eq(connexcsSyncLogs.syncJobId, jobId))
    .orderBy(connexcsSyncLogs.createdAt);
}

export async function getImportedCustomers(limit = 100) {
  return db.select()
    .from(connexcsImportCustomers)
    .orderBy(connexcsImportCustomers.createdAt)
    .limit(limit);
}

export async function getImportedCarriers(limit = 100) {
  return db.select()
    .from(connexcsImportCarriers)
    .orderBy(connexcsImportCarriers.createdAt)
    .limit(limit);
}

export async function getImportedRateCards(limit = 100) {
  return db.select()
    .from(connexcsImportRateCards)
    .orderBy(connexcsImportRateCards.createdAt)
    .limit(limit);
}

export async function getImportedCDRs(jobId?: string, limit = 100) {
  if (jobId) {
    return db.select()
      .from(connexcsImportCdrs)
      .where(eq(connexcsImportCdrs.syncJobId, jobId))
      .limit(limit);
  }
  return db.select()
    .from(connexcsImportCdrs)
    .limit(limit);
}

export async function getCDRStats(jobId?: string) {
  const query = jobId 
    ? db.select().from(connexcsImportCdrs).where(eq(connexcsImportCdrs.syncJobId, jobId))
    : db.select().from(connexcsImportCdrs);
  
  const cdrs = await query;
  
  let totalCalls = cdrs.length;
  let totalMinutes = 0;
  let totalCost = 0;
  let answeredCalls = 0;
  let failedCalls = 0;

  for (const cdr of cdrs) {
    if (cdr.billsec) totalMinutes += cdr.billsec / 60;
    if (cdr.cost) totalCost += parseFloat(cdr.cost);
    if (cdr.status === "ANSWERED") answeredCalls++;
    else failedCalls++;
  }

  return {
    totalCalls,
    totalMinutes: Math.round(totalMinutes * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    answeredCalls,
    failedCalls,
    asr: totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 10000) / 100 : 0,
  };
}

export async function mapImportedCustomersToDIDTron() {
  const imported = await db.select()
    .from(connexcsImportCustomers)
    .where(eq(connexcsImportCustomers.importStatus, "imported"));

  let created = 0;
  let linked = 0;
  let failed = 0;

  for (const imp of imported) {
    try {
      const [existingByConnexcsId] = await db.select()
        .from(customers)
        .where(eq(customers.connexcsCustomerId, String(imp.connexcsId)))
        .limit(1);

      if (existingByConnexcsId) {
        await db.update(connexcsImportCustomers)
          .set({ mappedToId: existingByConnexcsId.id, importStatus: "linked" })
          .where(eq(connexcsImportCustomers.id, imp.id));
        linked++;
        continue;
      }

      const newCustomer = await storage.createCustomer({
        companyName: imp.company || imp.name,
        billingEmail: imp.email || `${imp.name.toLowerCase().replace(/\s+/g, '.')}@imported.local`,
        status: imp.status === "active" ? "active" : "pending_approval",
        balance: imp.balance || "0",
        creditLimit: imp.creditLimit || "0",
        billingType: (imp.billingType === "prepaid" || imp.billingType === "postpaid") ? imp.billingType : "prepaid",
        address: imp.address,
        city: imp.city,
        country: imp.country,
        connexcsCustomerId: String(imp.connexcsId),
      });

      await db.update(connexcsImportCustomers)
        .set({ mappedToId: newCustomer.id, importStatus: "mapped" })
        .where(eq(connexcsImportCustomers.id, imp.id));

      await db.insert(connexcsEntityMap).values({
        entityType: "customer",
        connexcsId: String(imp.connexcsId),
        didtronId: newCustomer.id,
        connexcsData: imp.rawData,
      });

      created++;
    } catch (err) {
      console.error(`Failed to map customer ${imp.connexcsId}:`, err);
      await db.update(connexcsImportCustomers)
        .set({ importStatus: "failed", importError: String(err) })
        .where(eq(connexcsImportCustomers.id, imp.id));
      failed++;
    }
  }

  return { created, linked, failed };
}

export async function mapImportedCarriersToDIDTron() {
  const imported = await db.select()
    .from(connexcsImportCarriers)
    .where(eq(connexcsImportCarriers.importStatus, "imported"));

  let created = 0;
  let linked = 0;
  let failed = 0;

  for (const imp of imported) {
    try {
      const [existingByConnexcsId] = await db.select()
        .from(carriers)
        .where(eq(carriers.connexcsCarrierId, String(imp.connexcsId)))
        .limit(1);

      if (existingByConnexcsId) {
        await db.update(connexcsImportCarriers)
          .set({ mappedToId: existingByConnexcsId.id, importStatus: "linked" })
          .where(eq(connexcsImportCarriers.id, imp.id));
        linked++;
        continue;
      }

      const code = imp.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) + String(imp.connexcsId);
      
      const newCarrier = await storage.createCarrier({
        name: imp.name,
        code,
        partnerType: "bilateral",
        status: imp.status === "active" ? "active" : "paused",
        currencyCode: imp.currency || "USD",
        connexcsCarrierId: String(imp.connexcsId),
      });

      await db.update(connexcsImportCarriers)
        .set({ mappedToId: newCarrier.id, importStatus: "mapped" })
        .where(eq(connexcsImportCarriers.id, imp.id));

      await db.insert(connexcsEntityMap).values({
        entityType: "carrier",
        connexcsId: String(imp.connexcsId),
        didtronId: newCarrier.id,
        connexcsData: imp.rawData,
      });

      created++;
    } catch (err) {
      console.error(`Failed to map carrier ${imp.connexcsId}:`, err);
      await db.update(connexcsImportCarriers)
        .set({ importStatus: "failed", importError: String(err) })
        .where(eq(connexcsImportCarriers.id, imp.id));
      failed++;
    }
  }

  return { created, linked, failed };
}

// Reconciliation Statistics - Compare ConnexCS imports vs DIDTron entities
export async function getReconciliationStats() {
  const { count, sum, sql } = await import("drizzle-orm");
  
  // Count imported records by status (imported = ready for mapping, pending = legacy status)
  const [importedCustomersResult] = await db.select({ 
    total: count(), 
    mapped: sum(sql`CASE WHEN ${connexcsImportCustomers.importStatus} = 'mapped' THEN 1 ELSE 0 END`),
    linked: sum(sql`CASE WHEN ${connexcsImportCustomers.importStatus} = 'linked' THEN 1 ELSE 0 END`),
    imported: sum(sql`CASE WHEN ${connexcsImportCustomers.importStatus} = 'imported' THEN 1 ELSE 0 END`),
    failed: sum(sql`CASE WHEN ${connexcsImportCustomers.importStatus} = 'failed' THEN 1 ELSE 0 END`),
  }).from(connexcsImportCustomers);

  const [importedCarriersResult] = await db.select({ 
    total: count(), 
    mapped: sum(sql`CASE WHEN ${connexcsImportCarriers.importStatus} = 'mapped' THEN 1 ELSE 0 END`),
    linked: sum(sql`CASE WHEN ${connexcsImportCarriers.importStatus} = 'linked' THEN 1 ELSE 0 END`),
    imported: sum(sql`CASE WHEN ${connexcsImportCarriers.importStatus} = 'imported' THEN 1 ELSE 0 END`),
    failed: sum(sql`CASE WHEN ${connexcsImportCarriers.importStatus} = 'failed' THEN 1 ELSE 0 END`),
  }).from(connexcsImportCarriers);

  const [importedRateCardsResult] = await db.select({ 
    total: count(), 
    mapped: sum(sql`CASE WHEN ${connexcsImportRateCards.importStatus} = 'mapped' THEN 1 ELSE 0 END`),
    imported: sum(sql`CASE WHEN ${connexcsImportRateCards.importStatus} = 'imported' THEN 1 ELSE 0 END`),
    failed: sum(sql`CASE WHEN ${connexcsImportRateCards.importStatus} = 'failed' THEN 1 ELSE 0 END`),
  }).from(connexcsImportRateCards);

  // CDR stats with aggregations
  const [cdrStatsResult] = await db.select({
    totalRecords: count(),
    totalMinutes: sum(connexcsImportCdrs.duration),
    totalBuyAmount: sum(connexcsImportCdrs.buyAmount),
    totalSellAmount: sum(connexcsImportCdrs.sellAmount),
  }).from(connexcsImportCdrs);

  // DIDTron entity counts
  const [didtronCustomers] = await db.select({ total: count() }).from(customers);
  const [didtronCarriers] = await db.select({ total: count() }).from(carriers);

  // Customers with ConnexCS links
  const [linkedCustomers] = await db.select({ 
    total: count() 
  }).from(customers).where(sql`${customers.connexcsCustomerId} IS NOT NULL`);

  const [linkedCarriers] = await db.select({ 
    total: count() 
  }).from(carriers).where(sql`${carriers.connexcsCarrierId} IS NOT NULL`);

  // Get monthly CDR breakdown
  const monthlyCdrs = await db.select({
    year: connexcsImportCdrs.year,
    month: connexcsImportCdrs.month,
    records: count(),
    minutes: sum(connexcsImportCdrs.duration),
    buyAmount: sum(connexcsImportCdrs.buyAmount),
    sellAmount: sum(connexcsImportCdrs.sellAmount),
  })
  .from(connexcsImportCdrs)
  .groupBy(connexcsImportCdrs.year, connexcsImportCdrs.month)
  .orderBy(connexcsImportCdrs.year, connexcsImportCdrs.month);

  return {
    imports: {
      customers: {
        total: Number(importedCustomersResult?.total || 0),
        mapped: Number(importedCustomersResult?.mapped || 0),
        linked: Number(importedCustomersResult?.linked || 0),
        readyToMap: Number(importedCustomersResult?.imported || 0),
        failed: Number(importedCustomersResult?.failed || 0),
      },
      carriers: {
        total: Number(importedCarriersResult?.total || 0),
        mapped: Number(importedCarriersResult?.mapped || 0),
        linked: Number(importedCarriersResult?.linked || 0),
        readyToMap: Number(importedCarriersResult?.imported || 0),
        failed: Number(importedCarriersResult?.failed || 0),
      },
      rateCards: {
        total: Number(importedRateCardsResult?.total || 0),
        mapped: Number(importedRateCardsResult?.mapped || 0),
        readyToMap: Number(importedRateCardsResult?.imported || 0),
        failed: Number(importedRateCardsResult?.failed || 0),
      },
      cdrs: {
        totalRecords: Number(cdrStatsResult?.totalRecords || 0),
        totalMinutes: Number(cdrStatsResult?.totalMinutes || 0) / 60, // Convert seconds to minutes
        totalBuyAmount: Number(cdrStatsResult?.totalBuyAmount || 0),
        totalSellAmount: Number(cdrStatsResult?.totalSellAmount || 0),
        grossMargin: Number(cdrStatsResult?.totalSellAmount || 0) - Number(cdrStatsResult?.totalBuyAmount || 0),
      },
    },
    didtron: {
      customers: {
        total: Number(didtronCustomers?.total || 0),
        linkedToConnexcs: Number(linkedCustomers?.total || 0),
      },
      carriers: {
        total: Number(didtronCarriers?.total || 0),
        linkedToConnexcs: Number(linkedCarriers?.total || 0),
      },
    },
    monthlyCdrs: monthlyCdrs.map(m => ({
      year: m.year,
      month: m.month,
      records: Number(m.records || 0),
      minutes: Number(m.minutes || 0) / 60,
      buyAmount: Number(m.buyAmount || 0),
      sellAmount: Number(m.sellAmount || 0),
      margin: Number(m.sellAmount || 0) - Number(m.buyAmount || 0),
    })),
  };
}
