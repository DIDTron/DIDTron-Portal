import { connexcsTools, type ConnexCSCustomerFull, type ConnexCSCarrierFull, type ConnexCSRateCard, type ConnexCSCDR, type ConnexCSRoute, type ConnexCSScript } from "../connexcs-tools-service";
import { storage } from "../storage";
import { db } from "../db";
import { 
  connexcsSyncJobs, 
  connexcsImportCustomers, 
  connexcsImportCarriers,
  connexcsImportRateCards,
  connexcsImportCdrs,
  connexcsImportRoutes,
  connexcsImportBalances,
  connexcsImportScripts,
  connexcsCdrStats,
  connexcsSyncLogs,
  connexcsEntityMap,
  customers,
  carriers,
} from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

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
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${lastDay}`;
    
    await log(job.id, "info", `Starting CDR sync for ${year}-${monthStr}`);
    
    // Use the REST API to fetch CDRs for all customers
    const cdrs = await connexcsTools.getAllCustomerCDRs(storage, startDate, endDate);
    await log(job.id, "info", `Fetched ${cdrs.length} CDRs for ${year}-${monthStr}`);

    await db.update(connexcsSyncJobs)
      .set({ totalRecords: cdrs.length })
      .where(eq(connexcsSyncJobs.id, job.id));

    const batchSize = 500;
    for (let i = 0; i < cdrs.length; i += batchSize) {
      const batch = cdrs.slice(i, i + batchSize);
      
      try {
        // Map ConnexCS CDR fields to our database schema
        // ConnexCS actual columns: dt, callid, source_cli, dest_number, duration,
        // customer_id, provider_id, customer_charge, customer_card_rate, sip_code, etc.
        // NOTE: Duration can be decimal in ConnexCS, convert to integer for our schema
        const values = batch.map(cdr => ({
          syncJobId: job.id,
          connexcsId: cdr.callid || cdr.id || `${cdr.dt}-${cdr.customer_id}`,
          callId: cdr.callid,
          src: cdr.source_cli,
          dst: cdr.dest_number,
          duration: cdr.duration != null ? Math.round(Number(cdr.duration)) : (cdr.customer_duration != null ? Math.round(Number(cdr.customer_duration)) : null),
          billsec: cdr.customer_duration != null ? Math.round(Number(cdr.customer_duration)) : (cdr.duration != null ? Math.round(Number(cdr.duration)) : null),
          callTime: cdr.dt ? new Date(cdr.dt) : null,
          cost: cdr.customer_charge?.toString() || cdr.customer_card_charge?.toString(),
          rate: cdr.customer_card_rate?.toString(),
          status: cdr.sip_code?.toString() === "200" ? "ANSWERED" : (cdr.sip_code ? "FAILED" : null),
          hangupCause: cdr.release_reason || cdr.sip_reason,
          direction: cdr.direction,
          customerId: cdr.customer_id != null ? parseInt(String(cdr.customer_id), 10) : null,
          customerName: cdr.cx_name,
          carrierId: cdr.provider_id != null ? parseInt(String(cdr.provider_id), 10) : null,
          carrierName: null,
          prefix: cdr.customer_card_dest_code || cdr.tech_prefix,
          destination: cdr.customer_card_dest_name,
          currency: cdr.customer_currency,
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
        console.error(`[ConnexCS Sync] CDR batch insert error: ${errorMsg}`);
        if (i === 0 && batch.length > 0) {
          console.error(`[ConnexCS Sync] First batch sample:`, JSON.stringify(batch[0]).substring(0, 500));
        }
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

// ==================== BALANCE SYNC ====================

export async function syncBalances(userId?: string): Promise<SyncJobResult> {
  const startTime = Date.now();
  
  const [job] = await db.insert(connexcsSyncJobs).values({
    entityType: "balance",
    status: "syncing",
    startedAt: new Date(),
    ...(userId ? { createdBy: userId } : {}),
  }).returning();

  const result: SyncJobResult = {
    jobId: job.id,
    entityType: "balance",
    status: "completed",
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    await log(job.id, "info", "Starting balance sync from ConnexCS");
    
    // Get balances from the already-synced customers
    const cxCustomers = await connexcsTools.getAllCustomersFull(storage);
    await log(job.id, "info", `Fetched ${cxCustomers.length} customer balances from ConnexCS`);

    for (const customer of cxCustomers) {
      try {
        const [existing] = await db.select()
          .from(connexcsImportBalances)
          .where(eq(connexcsImportBalances.connexcsCustomerId, customer.id))
          .limit(1);

        const balanceData = {
          syncJobId: job.id,
          connexcsCustomerId: customer.id,
          customerName: customer.name,
          balance: customer.balance?.toString(),
          creditLimit: customer.credit_limit?.toString(),
          availableCredit: customer.credit_limit != null && customer.balance != null 
            ? (customer.credit_limit + customer.balance).toString() 
            : null,
          currency: customer.currency,
          billingType: customer.billing_type || customer.payment_type,
          lastUpdated: new Date(),
          rawData: JSON.stringify(customer),
        };

        if (existing) {
          await db.update(connexcsImportBalances)
            .set(balanceData)
            .where(eq(connexcsImportBalances.id, existing.id));
          result.updated++;
        } else {
          await db.insert(connexcsImportBalances).values(balanceData);
          result.imported++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`Customer ${customer.id}: ${err}`);
      }
    }

    await log(job.id, "info", `Balance sync completed: ${result.imported} imported, ${result.updated} updated, ${result.failed} failed`);
  } catch (err) {
    result.status = "failed";
    result.errors.push(String(err));
    await log(job.id, "error", "Balance sync failed", { error: String(err) });
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

// ==================== ROUTES SYNC ====================

export async function syncRoutes(userId?: string): Promise<SyncJobResult> {
  const startTime = Date.now();
  
  const [job] = await db.insert(connexcsSyncJobs).values({
    entityType: "route",
    status: "syncing",
    startedAt: new Date(),
    ...(userId ? { createdBy: userId } : {}),
  }).returning();

  const result: SyncJobResult = {
    jobId: job.id,
    entityType: "route",
    status: "completed",
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    await log(job.id, "info", "Starting route sync from ConnexCS");
    
    const routes = await connexcsTools.getRoutesFull(storage);
    await log(job.id, "info", `Fetched ${routes.length} routes from ConnexCS`);

    await db.update(connexcsSyncJobs)
      .set({ totalRecords: routes.length })
      .where(eq(connexcsSyncJobs.id, job.id));

    for (const route of routes) {
      try {
        const [existing] = await db.select()
          .from(connexcsImportRoutes)
          .where(eq(connexcsImportRoutes.connexcsId, route.id))
          .limit(1);

        const routeData = {
          syncJobId: job.id,
          connexcsId: route.id,
          name: route.name,
          customerId: route.customer_id,
          customerName: route.customer_name,
          prefix: route.prefix,
          techPrefix: route.tech_prefix,
          routingType: route.routing_type,
          status: route.status,
          priority: route.priority,
          weight: route.weight,
          rateCardId: route.rate_card_id,
          carrierId: route.carrier_id,
          carrierName: route.carrier_name,
          channels: route.channels,
          cps: route.cps,
          rawData: JSON.stringify(route),
          importStatus: "imported",
        };

        if (existing) {
          await db.update(connexcsImportRoutes)
            .set(routeData)
            .where(eq(connexcsImportRoutes.id, existing.id));
          result.updated++;
        } else {
          await db.insert(connexcsImportRoutes).values(routeData);
          result.imported++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`Route ${route.id}: ${err}`);
      }
    }

    await log(job.id, "info", `Route sync completed: ${result.imported} imported, ${result.updated} updated, ${result.failed} failed`);
  } catch (err) {
    result.status = "failed";
    result.errors.push(String(err));
    await log(job.id, "error", "Route sync failed", { error: String(err) });
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

// ==================== SCRIPTFORGE SYNC ====================

export async function syncScripts(userId?: string): Promise<SyncJobResult> {
  const startTime = Date.now();
  
  const [job] = await db.insert(connexcsSyncJobs).values({
    entityType: "script",
    status: "syncing",
    startedAt: new Date(),
    ...(userId ? { createdBy: userId } : {}),
  }).returning();

  const result: SyncJobResult = {
    jobId: job.id,
    entityType: "script",
    status: "completed",
    imported: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    await log(job.id, "info", "Starting ScriptForge sync from ConnexCS");
    
    const scripts = await connexcsTools.getScripts(storage);
    await log(job.id, "info", `Fetched ${scripts.length} scripts from ConnexCS`);

    await db.update(connexcsSyncJobs)
      .set({ totalRecords: scripts.length })
      .where(eq(connexcsSyncJobs.id, job.id));

    for (const script of scripts) {
      try {
        const [existing] = await db.select()
          .from(connexcsImportScripts)
          .where(eq(connexcsImportScripts.connexcsId, script.id))
          .limit(1);

        const scriptData = {
          syncJobId: job.id,
          connexcsId: script.id,
          name: script.name,
          description: script.description,
          scriptType: script.script_type,
          language: script.language,
          code: script.code,
          enabled: script.enabled,
          version: script.version,
          lastModified: script.last_modified ? new Date(script.last_modified) : null,
          rawData: JSON.stringify(script),
          importStatus: "imported",
        };

        if (existing) {
          await db.update(connexcsImportScripts)
            .set(scriptData)
            .where(eq(connexcsImportScripts.id, existing.id));
          result.updated++;
        } else {
          await db.insert(connexcsImportScripts).values(scriptData);
          result.imported++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(`Script ${script.id}: ${err}`);
      }
    }

    await log(job.id, "info", `ScriptForge sync completed: ${result.imported} imported, ${result.updated} updated, ${result.failed} failed`);
  } catch (err) {
    result.status = "failed";
    result.errors.push(String(err));
    await log(job.id, "error", "ScriptForge sync failed", { error: String(err) });
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

// ==================== HISTORICAL CDR SYNC ====================

export async function syncHistoricalCDRs(year: number, months: number[] = [1,2,3,4,5,6,7,8,9,10,11,12], userId?: string): Promise<{year: number; months: {month: number; result: SyncJobResult}[]}> {
  console.log(`[ConnexCS Sync] Starting historical CDR sync for ${year}, months: ${months.join(', ')}`);
  
  const results: {month: number; result: SyncJobResult}[] = [];
  
  for (const month of months) {
    console.log(`[ConnexCS Sync] Syncing ${year}-${String(month).padStart(2, '0')}...`);
    
    // Add delay between months to respect rate limits
    if (results.length > 0) {
      console.log(`[ConnexCS Sync] Waiting 15 seconds before next month...`);
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
    
    try {
      const result = await syncCDRs(year, month, userId);
      results.push({ month, result });
      console.log(`[ConnexCS Sync] ${year}-${String(month).padStart(2, '0')}: ${result.imported} CDRs imported`);
    } catch (err) {
      console.error(`[ConnexCS Sync] Failed to sync ${year}-${month}:`, err);
      results.push({ 
        month, 
        result: { 
          jobId: '', 
          entityType: 'cdr', 
          status: 'failed', 
          imported: 0, 
          updated: 0, 
          failed: 0, 
          errors: [String(err)], 
          durationMs: 0 
        } 
      });
    }
  }
  
  return { year, months: results };
}

// ==================== CDR STATISTICS ====================

export async function calculateCDRStats(periodType: 'daily' | 'monthly' | 'yearly', startDate: Date, endDate: Date): Promise<void> {
  const cdrs = await db.select()
    .from(connexcsImportCdrs)
    .where(
      and(
        gte(connexcsImportCdrs.callTime, startDate),
        lte(connexcsImportCdrs.callTime, endDate)
      )
    );

  let totalCalls = cdrs.length;
  let answeredCalls = 0;
  let failedCalls = 0;
  let totalDuration = 0;
  let totalCost = 0;
  let totalRevenue = 0;
  let totalPdd = 0;
  let pddCount = 0;

  const destinationCounts: Record<string, {count: number; minutes: number}> = {};
  const customerCounts: Record<string, {id: number | null; name: string | null; count: number; minutes: number}> = {};
  const carrierCounts: Record<string, {id: number | null; name: string | null; count: number; minutes: number}> = {};
  const hourlyDist: Record<number, number> = {};

  for (const cdr of cdrs) {
    if (cdr.status === "ANSWERED") {
      answeredCalls++;
    } else {
      failedCalls++;
    }

    if (cdr.duration) totalDuration += cdr.duration;
    if (cdr.cost) totalCost += parseFloat(cdr.cost);
    if (cdr.sellAmount) totalRevenue += parseFloat(cdr.sellAmount);

    // Destination stats
    const dest = cdr.destination || cdr.prefix || 'Unknown';
    if (!destinationCounts[dest]) destinationCounts[dest] = { count: 0, minutes: 0 };
    destinationCounts[dest].count++;
    destinationCounts[dest].minutes += (cdr.duration || 0) / 60;

    // Customer stats
    const custKey = cdr.customerId?.toString() || 'unknown';
    if (!customerCounts[custKey]) customerCounts[custKey] = { id: cdr.customerId, name: cdr.customerName, count: 0, minutes: 0 };
    customerCounts[custKey].count++;
    customerCounts[custKey].minutes += (cdr.duration || 0) / 60;

    // Carrier stats
    const carrKey = cdr.carrierId?.toString() || 'unknown';
    if (!carrierCounts[carrKey]) carrierCounts[carrKey] = { id: cdr.carrierId, name: cdr.carrierName, count: 0, minutes: 0 };
    carrierCounts[carrKey].count++;
    carrierCounts[carrKey].minutes += (cdr.duration || 0) / 60;

    // Hourly distribution
    if (cdr.callTime) {
      const hour = new Date(cdr.callTime).getHours();
      hourlyDist[hour] = (hourlyDist[hour] || 0) + 1;
    }
  }

  const asr = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
  const acd = answeredCalls > 0 ? totalDuration / answeredCalls : 0;
  const ner = totalCalls > 0 ? ((answeredCalls + failedCalls) / totalCalls) * 100 : 0;

  const topDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([dest, data]) => ({ destination: dest, ...data }));

  const topCustomers = Object.entries(customerCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([_, data]) => data);

  const topCarriers = Object.entries(carrierCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([_, data]) => data);

  // Check if stats exist for this period
  const [existing] = await db.select()
    .from(connexcsCdrStats)
    .where(
      and(
        eq(connexcsCdrStats.periodType, periodType),
        eq(connexcsCdrStats.periodStart, startDate),
        eq(connexcsCdrStats.periodEnd, endDate)
      )
    )
    .limit(1);

  const statsData = {
    periodType,
    periodStart: startDate,
    periodEnd: endDate,
    totalCalls,
    answeredCalls,
    failedCalls,
    totalDuration,
    totalMinutes: (totalDuration / 60).toFixed(2),
    totalCost: totalCost.toFixed(4),
    totalRevenue: totalRevenue.toFixed(4),
    asr: asr.toFixed(2),
    acd: acd.toFixed(2),
    pdd: pddCount > 0 ? (totalPdd / pddCount).toFixed(2) : '0',
    ner: ner.toFixed(2),
    topDestinations: JSON.stringify(topDestinations),
    topCustomers: JSON.stringify(topCustomers),
    topCarriers: JSON.stringify(topCarriers),
    hourlyDistribution: JSON.stringify(hourlyDist),
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(connexcsCdrStats)
      .set(statsData)
      .where(eq(connexcsCdrStats.id, existing.id));
  } else {
    await db.insert(connexcsCdrStats).values(statsData);
  }
}

// ==================== GET FUNCTIONS ====================

export async function getImportedRoutes(limit = 100) {
  return db.select()
    .from(connexcsImportRoutes)
    .orderBy(desc(connexcsImportRoutes.createdAt))
    .limit(limit);
}

export async function getImportedBalances(limit = 100) {
  return db.select()
    .from(connexcsImportBalances)
    .orderBy(desc(connexcsImportBalances.createdAt))
    .limit(limit);
}

export async function getImportedScripts(limit = 100) {
  return db.select()
    .from(connexcsImportScripts)
    .orderBy(desc(connexcsImportScripts.createdAt))
    .limit(limit);
}

export async function getCachedCDRStats(periodType?: string) {
  if (periodType) {
    return db.select()
      .from(connexcsCdrStats)
      .where(eq(connexcsCdrStats.periodType, periodType))
      .orderBy(desc(connexcsCdrStats.periodStart));
  }
  return db.select()
    .from(connexcsCdrStats)
    .orderBy(desc(connexcsCdrStats.periodStart));
}
