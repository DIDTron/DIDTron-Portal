import type { JobHandler, JobHandlers } from "@nicnocquee/dataqueue";
import { 
  getJobQueue, 
  isMockQueueMode,
  DIDTronPayloadMap, 
  DIDTronJobType,
  RateCardImportPayload,
  RateCardExportPayload,
  ConnexCSSyncPayload,
  DIDProvisionPayload,
  DIDBulkProvisionPayload,
  DIDReleasePayload,
  InvoiceGeneratePayload,
  InvoiceBulkGeneratePayload,
  EmailSendPayload,
  EmailBulkSendPayload,
  ReportGeneratePayload,
  AIVoiceKBTrainPayload,
  AIVoiceKBIndexPayload,
  AIVoiceCampaignStartPayload,
  AIVoiceCampaignCallPayload,
  AIVoiceAgentSyncPayload,
  WebhookDeliverPayload,
  FXRateUpdatePayload,
  BillingReconcilePayload,
  AuditCleanupPayload,
  CDRProcessPayload,
  AZDestinationImportPayload,
  AZDestinationDeleteAllPayload,
  TrashRestorePayload,
  TrashPurgePayload,
} from "./job-queue";
import { azDestinationsRepository } from "./az-destinations-repository";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { auditService } from "./audit-service";
import {
  handleKBTrain,
  handleKBIndex,
  handleCampaignStart,
  handleCampaignCall,
  handleAgentSync,
} from "./ai-voice-handlers";

const jobHandlers: JobHandlers<DIDTronPayloadMap> = {
  rate_card_import: async (payload: RateCardImportPayload, signal?: AbortSignal) => {
    console.log(`[RateCardJob] Importing rate card ${payload.rateCardId} from ${payload.fileUrl}`);
  },
  
  rate_card_export: async (payload: RateCardExportPayload, signal?: AbortSignal) => {
    console.log(`[RateCardJob] Exporting rate card ${payload.rateCardId} as ${payload.format}`);
  },
  
  connexcs_sync_customer: async (payload: ConnexCSSyncPayload, signal?: AbortSignal) => {
    console.log(`[ConnexCSJob] Syncing customer ${payload.customerId} (${payload.direction})`);
  },
  
  connexcs_sync_carrier: async (payload: ConnexCSSyncPayload, signal?: AbortSignal) => {
    console.log(`[ConnexCSJob] Syncing carrier ${payload.carrierId} (${payload.direction})`);
  },
  
  connexcs_sync_all: async (payload: ConnexCSSyncPayload, signal?: AbortSignal) => {
    console.log(`[ConnexCSJob] Full platform sync started (${payload.direction})`);
  },
  
  did_provision: async (payload: DIDProvisionPayload, signal?: AbortSignal) => {
    console.log(`[DIDJob] Provisioning DID ${payload.didId} for customer ${payload.customerId}`);
  },
  
  did_bulk_provision: async (payload: DIDBulkProvisionPayload, signal?: AbortSignal) => {
    console.log(`[DIDJob] Bulk provisioning ${payload.didIds.length} DIDs for customer ${payload.customerId}`);
  },
  
  did_release: async (payload: DIDReleasePayload, signal?: AbortSignal) => {
    console.log(`[DIDJob] Releasing DID ${payload.didId}`);
  },
  
  invoice_generate: async (payload: InvoiceGeneratePayload, signal?: AbortSignal) => {
    console.log(`[InvoiceJob] Generating invoice for customer ${payload.targetCustomerId} period ${payload.period}`);
  },
  
  invoice_bulk_generate: async (payload: InvoiceBulkGeneratePayload, signal?: AbortSignal) => {
    console.log(`[InvoiceJob] Generating ${payload.customerIds.length} invoices for period ${payload.period}`);
  },
  
  email_send: async (payload: EmailSendPayload, signal?: AbortSignal) => {
    console.log(`[EmailJob] Sending email to ${payload.to} with subject: ${payload.subject}`);
  },
  
  email_bulk_send: async (payload: EmailBulkSendPayload, signal?: AbortSignal) => {
    console.log(`[EmailJob] Sending bulk email to ${payload.recipients.length} recipients`);
  },
  
  report_generate: async (payload: ReportGeneratePayload, signal?: AbortSignal) => {
    console.log(`[ReportJob] Generating ${payload.reportType} report`);
  },
  
  ai_voice_kb_train: async (payload: AIVoiceKBTrainPayload, signal?: AbortSignal) => {
    await handleKBTrain(payload, signal);
  },
  
  ai_voice_kb_index: async (payload: AIVoiceKBIndexPayload, signal?: AbortSignal) => {
    await handleKBIndex(payload, signal);
  },
  
  ai_voice_campaign_start: async (payload: AIVoiceCampaignStartPayload, signal?: AbortSignal) => {
    await handleCampaignStart(payload, signal);
  },
  
  ai_voice_campaign_call: async (payload: AIVoiceCampaignCallPayload, signal?: AbortSignal) => {
    await handleCampaignCall(payload, signal);
  },
  
  ai_voice_agent_sync: async (payload: AIVoiceAgentSyncPayload, signal?: AbortSignal) => {
    await handleAgentSync(payload, signal);
  },
  
  webhook_deliver: async (payload: WebhookDeliverPayload, signal?: AbortSignal) => {
    console.log(`[WebhookJob] Delivering webhook ${payload.webhookId} to ${payload.url}`);
  },
  
  fx_rate_update: async (payload: FXRateUpdatePayload, signal?: AbortSignal) => {
    console.log(`[FXRateJob] Updating FX rates (base: ${payload.baseCurrency ?? "USD"})`);
  },
  
  billing_reconcile: async (payload: BillingReconcilePayload, signal?: AbortSignal) => {
    console.log(`[BillingJob] Reconciling billing for period ${payload.period}`);
  },
  
  audit_cleanup: async (payload: AuditCleanupPayload, signal?: AbortSignal) => {
    console.log(`[AuditJob] Cleaning up audit logs older than ${payload.olderThanDays} days`);
  },
  
  cdr_process: async (payload: CDRProcessPayload, signal?: AbortSignal) => {
    console.log(`[CDRJob] Processing CDR batch ${payload.batchId} with ${payload.recordCount} records`);
  },
  
  az_destination_import: async (payload: AZDestinationImportPayload, signal?: AbortSignal) => {
    console.log(`[AZImportJob] Starting import of ${payload.totalRecords} destinations (mode: ${payload.mode})`);
    
    try {
      if (payload.mode === "replace") {
        console.log("[AZImportJob] Deleting all existing destinations...");
        await azDestinationsRepository.deleteAllDestinations();
      }
      
      const batchSize = 500;
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      
      for (let i = 0; i < payload.destinations.length; i += batchSize) {
        if (signal?.aborted) {
          throw new Error("Job was cancelled");
        }
        
        const batch = payload.destinations.slice(i, i + batchSize);
        console.log(`[AZImportJob] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(payload.destinations.length / batchSize)}`);
        
        const result = await azDestinationsRepository.upsertDestinationsBulk(batch.map(d => ({
          code: d.code,
          destination: d.destination,
          region: d.region || null,
          billingIncrement: d.billingIncrement || "60/60",
        })));
        
        totalInserted += result.inserted;
        totalUpdated += result.updated;
        totalSkipped += result.skipped;
      }
      
      console.log(`[AZImportJob] Import complete: ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped`);
      
      await auditService.createAuditLog({
        userId: payload.userId,
        action: "import_completed",
        tableName: "az_destinations",
        newValues: { inserted: totalInserted, updated: totalUpdated, skipped: totalSkipped },
      });
    } catch (error) {
      console.error("[AZImportJob] Import failed:", error);
      await auditService.createAuditLog({
        userId: payload.userId,
        action: "import_failed",
        tableName: "az_destinations",
        newValues: { error: (error as Error).message },
      });
      throw error;
    }
  },

  az_destination_delete_all: async (payload: AZDestinationDeleteAllPayload, signal?: AbortSignal) => {
    console.log(`[AZDeleteJob] Starting delete all (${payload.totalRecords || 'unknown'} records)`);
    
    try {
      const count = await azDestinationsRepository.deleteAllDestinations();
      console.log(`[AZDeleteJob] Deleted ${count} destinations`);
      
      await auditService.createAuditLog({
        userId: payload.userId,
        action: "bulk_delete_completed",
        tableName: "az_destinations",
        newValues: { deletedCount: count },
      });
    } catch (error) {
      console.error("[AZDeleteJob] Delete all failed:", error);
      throw error;
    }
  },

  trash_restore: async (payload: TrashRestorePayload, signal?: AbortSignal) => {
    console.log(`[TrashJob] Restoring record ${payload.recordId} from ${payload.tableName}`);
    
    try {
      const restored = await auditService.restoreFromTrash(payload.trashId, payload.userId);
      
      if (restored) {
        await auditService.createAuditLog({
          userId: payload.userId,
          action: "trash_restored",
          tableName: restored.tableName,
          recordId: restored.recordId,
          newValues: restored.recordData,
        });
        console.log(`[TrashJob] Restored record ${restored.recordId} to ${restored.tableName}`);
      } else {
        console.log(`[TrashJob] Record not found in trash: ${payload.trashId}`);
      }
    } catch (error) {
      console.error("[TrashJob] Restore failed:", error);
      throw error;
    }
  },

  trash_purge: async (payload: TrashPurgePayload, signal?: AbortSignal) => {
    console.log(`[TrashJob] Purging trash (type: ${payload.purgeType})`);
    
    try {
      let count = 0;
      if (payload.purgeType === "expired") {
        count = await auditService.purgeExpiredTrash();
      } else {
        count = await auditService.purgeAllTrash();
      }
      
      await auditService.createAuditLog({
        userId: payload.userId,
        action: "trash_purged",
        tableName: "trash",
        newValues: { purgeType: payload.purgeType, purgedCount: count },
      });
      
      console.log(`[TrashJob] Purged ${count} records from trash`);
    } catch (error) {
      console.error("[TrashJob] Purge failed:", error);
      throw error;
    }
  },
};

interface ProcessorLike {
  start(): void;
  stop(): void | Promise<void>;
  isRunning?(): boolean;
}

let processorInstance: ProcessorLike | null = null;
let isRunning = false;

async function recoverStaleJobs(): Promise<number> {
  if (isMockQueueMode()) {
    return 0;
  }
  
  try {
    const result = await db.execute(sql`
      UPDATE job_queue 
      SET status = 'pending', locked_at = NULL, locked_by = NULL, started_at = NULL
      WHERE status = 'processing' AND locked_at < NOW() - INTERVAL '5 minutes'
    `);
    const recoveredCount = (result as any).rowCount || 0;
    if (recoveredCount > 0) {
      console.log(`[JobWorker] Recovered ${recoveredCount} stale jobs back to pending`);
    }
    return recoveredCount;
  } catch (error) {
    console.error("[JobWorker] Failed to recover stale jobs:", error);
    return 0;
  }
}

export async function startJobWorker(): Promise<void> {
  if (isRunning) {
    console.log("[JobWorker] Worker already running");
    return;
  }
  
  try {
    await recoverStaleJobs();
    
    const queue = getJobQueue();
    const isMock = isMockQueueMode();
    
    processorInstance = queue.createProcessor(jobHandlers, {
      pollInterval: 1000,
      concurrency: 5,
      batchSize: 10,
    });
    
    processorInstance.start();
    isRunning = true;
    
    console.log(`[JobWorker] Job worker started successfully (mode: ${isMock ? "in-memory" : "database"})`);
  } catch (error) {
    console.error("[JobWorker] Failed to start job worker:", error);
    isRunning = false;
  }
}

export async function stopJobWorker(): Promise<void> {
  if (!isRunning || !processorInstance) {
    return;
  }
  
  console.log("[JobWorker] Stopping job worker...");
  
  try {
    await processorInstance.stop();
    isRunning = false;
    processorInstance = null;
    console.log("[JobWorker] Job worker stopped");
  } catch (error) {
    console.error("[JobWorker] Error stopping worker:", error);
  }
}

export function isWorkerRunning(): boolean {
  return isRunning;
}

export function getProcessor(): ProcessorLike | null {
  return processorInstance;
}

export function registerCustomHandler<T extends DIDTronJobType>(
  jobType: T,
  handler: JobHandler<DIDTronPayloadMap, T>
): void {
  (jobHandlers as Record<DIDTronJobType, JobHandler<DIDTronPayloadMap, DIDTronJobType>>)[jobType] = handler as JobHandler<DIDTronPayloadMap, DIDTronJobType>;
}
