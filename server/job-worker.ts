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
} from "./job-queue";
import { AzDestinationsRepository } from "./az-destinations-repository";
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
    const repo = new AzDestinationsRepository();
    
    try {
      if (payload.mode === "replace") {
        console.log("[AZImportJob] Deleting all existing destinations...");
        await repo.deleteAll();
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
        
        const result = await repo.bulkUpsert(batch.map(d => ({
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
    } catch (error) {
      console.error("[AZImportJob] Import failed:", error);
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

export async function startJobWorker(): Promise<void> {
  if (isRunning) {
    console.log("[JobWorker] Worker already running");
    return;
  }
  
  try {
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
