import { 
  initJobQueue, 
  type JobQueue as DataQueueJobQueue, 
  type JobRecord, 
  type JobStatus,
  type JobHandler,
  type JobHandlers,
  type Processor 
} from "@nicnocquee/dataqueue";

export type DIDTronJobType = 
  | "rate_card_import"
  | "rate_card_export"
  | "connexcs_sync_customer"
  | "connexcs_sync_carrier"
  | "connexcs_sync_all"
  | "did_provision"
  | "did_bulk_provision"
  | "did_release"
  | "invoice_generate"
  | "invoice_bulk_generate"
  | "email_send"
  | "email_bulk_send"
  | "report_generate"
  | "ai_voice_kb_train"
  | "ai_voice_kb_index"
  | "ai_voice_campaign_start"
  | "ai_voice_campaign_call"
  | "ai_voice_agent_sync"
  | "webhook_deliver"
  | "fx_rate_update"
  | "billing_reconcile"
  | "audit_cleanup"
  | "cdr_process"
  | "az_destination_import"
  | "az_destination_delete_all"
  | "trash_restore"
  | "trash_purge";

export interface BaseJobPayload {
  userId?: string;
  customerId?: string;
  enqueuedAt?: string;
}

export interface RateCardImportPayload extends BaseJobPayload {
  rateCardId: string;
  fileUrl: string;
  options?: Record<string, unknown>;
}

export interface RateCardExportPayload extends BaseJobPayload {
  rateCardId: string;
  format: "csv" | "xlsx";
}

export interface ConnexCSSyncPayload extends BaseJobPayload {
  customerId?: string;
  carrierId?: string;
  direction: "push" | "pull" | "bidirectional";
}

export interface DIDProvisionPayload extends BaseJobPayload {
  didId: string;
  providerId?: string;
}

export interface DIDBulkProvisionPayload extends BaseJobPayload {
  didIds: string[];
}

export interface DIDReleasePayload extends BaseJobPayload {
  didId: string;
}

export interface InvoiceGeneratePayload extends BaseJobPayload {
  period: string;
  targetCustomerId?: string;
}

export interface InvoiceBulkGeneratePayload extends BaseJobPayload {
  period: string;
  customerIds: string[];
}

export interface EmailSendPayload extends BaseJobPayload {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, unknown>;
}

export interface EmailBulkSendPayload extends BaseJobPayload {
  recipients: string[];
  template: string;
  variables?: Record<string, unknown>;
}

export interface ReportGeneratePayload extends BaseJobPayload {
  reportType: string;
  parameters?: Record<string, unknown>;
}

export interface AIVoiceKBTrainPayload extends BaseJobPayload {
  knowledgeBaseId: string;
  agentId: string;
}

export interface AIVoiceKBIndexPayload extends BaseJobPayload {
  knowledgeBaseId: string;
  sourceId: string;
  sourceType: "document" | "url" | "text";
}

export interface AIVoiceCampaignStartPayload extends BaseJobPayload {
  campaignId: string;
}

export interface AIVoiceCampaignCallPayload extends BaseJobPayload {
  campaignId: string;
  contactId: string;
  phoneNumber: string;
}

export interface AIVoiceAgentSyncPayload extends BaseJobPayload {
  agentId: string;
  direction: "push" | "pull";
}

export interface WebhookDeliverPayload extends BaseJobPayload {
  webhookId: string;
  url: string;
  eventType: string;
  eventData: Record<string, unknown>;
}

export interface FXRateUpdatePayload extends BaseJobPayload {
  baseCurrency?: string;
}

export interface BillingReconcilePayload extends BaseJobPayload {
  period: string;
}

export interface AuditCleanupPayload extends BaseJobPayload {
  olderThanDays: number;
}

export interface CDRProcessPayload extends BaseJobPayload {
  batchId: string;
  recordCount: number;
}

export interface AZDestinationImportPayload extends BaseJobPayload {
  mode: "update" | "replace";
  destinations: Array<{
    code: string;
    destination: string;
    region?: string | null;
    billingIncrement?: string | null;
  }>;
  totalRecords: number;
}

export interface AZDestinationDeleteAllPayload extends BaseJobPayload {
  totalRecords?: number;
}

export interface TrashRestorePayload extends BaseJobPayload {
  trashId: string;
  tableName: string;
  recordId: string;
}

export interface TrashPurgePayload extends BaseJobPayload {
  purgeType: "expired" | "all";
}

export interface DIDTronPayloadMap {
  rate_card_import: RateCardImportPayload;
  rate_card_export: RateCardExportPayload;
  connexcs_sync_customer: ConnexCSSyncPayload;
  connexcs_sync_carrier: ConnexCSSyncPayload;
  connexcs_sync_all: ConnexCSSyncPayload;
  did_provision: DIDProvisionPayload;
  did_bulk_provision: DIDBulkProvisionPayload;
  did_release: DIDReleasePayload;
  invoice_generate: InvoiceGeneratePayload;
  invoice_bulk_generate: InvoiceBulkGeneratePayload;
  email_send: EmailSendPayload;
  email_bulk_send: EmailBulkSendPayload;
  report_generate: ReportGeneratePayload;
  ai_voice_kb_train: AIVoiceKBTrainPayload;
  ai_voice_kb_index: AIVoiceKBIndexPayload;
  ai_voice_campaign_start: AIVoiceCampaignStartPayload;
  ai_voice_campaign_call: AIVoiceCampaignCallPayload;
  ai_voice_agent_sync: AIVoiceAgentSyncPayload;
  webhook_deliver: WebhookDeliverPayload;
  fx_rate_update: FXRateUpdatePayload;
  billing_reconcile: BillingReconcilePayload;
  audit_cleanup: AuditCleanupPayload;
  cdr_process: CDRProcessPayload;
  az_destination_import: AZDestinationImportPayload;
  az_destination_delete_all: AZDestinationDeleteAllPayload;
  trash_restore: TrashRestorePayload;
  trash_purge: TrashPurgePayload;
}

interface InMemoryJob {
  id: number;
  jobType: DIDTronJobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  priority: number;
  createdAt: Date;
  runAt: Date | null;
  lockedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  error: string | null;
  tags: string[];
}

class InMemoryJobQueue {
  private jobs: Map<number, InMemoryJob> = new Map();
  private nextId = 1;
  private useMockMode = true;

  constructor() {
    console.log("[JobQueue] Running in in-memory mode (development)");
  }

  async addJob(options: {
    jobType: DIDTronJobType;
    payload: Record<string, unknown>;
    priority?: number;
    runAt?: Date | null;
    maxAttempts?: number;
    timeoutMs?: number;
    tags?: string[];
  }): Promise<number> {
    const id = this.nextId++;
    this.jobs.set(id, {
      id,
      jobType: options.jobType,
      payload: options.payload,
      status: "pending",
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
      priority: options.priority ?? 0,
      createdAt: new Date(),
      runAt: options.runAt ?? null,
      lockedAt: null,
      completedAt: null,
      failedAt: null,
      error: null,
      tags: options.tags ?? [],
    });
    return id;
  }

  async getJobsByStatus(status: JobStatus): Promise<InMemoryJob[]> {
    return Array.from(this.jobs.values()).filter(j => j.status === status);
  }

  async getJobById(id: number): Promise<InMemoryJob | null> {
    return this.jobs.get(id) || null;
  }

  async updateJob(id: number, updates: Partial<InMemoryJob>): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) return false;
    Object.assign(job, updates);
    return true;
  }

  async getAllJobs(): Promise<InMemoryJob[]> {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteOldJobs(olderThanDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    let count = 0;
    for (const [id, job] of this.jobs.entries()) {
      if (job.completedAt && job.completedAt < cutoff) {
        this.jobs.delete(id);
        count++;
      }
    }
    return count;
  }

  async cleanupOldJobs(olderThanDays: number): Promise<number> {
    return this.deleteOldJobs(olderThanDays);
  }

  async retryJob(id: number): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) throw new Error("Job not found");
    if (job.status !== "failed" && job.status !== "cancelled") {
      throw new Error("Can only retry failed or cancelled jobs");
    }
    job.status = "pending";
    job.attempts = 0;
    job.error = null;
    job.failedAt = null;
    job.lockedAt = null;
  }

  async cancelJob(id: number): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) throw new Error("Job not found");
    if (job.status === "completed") {
      throw new Error("Cannot cancel completed job");
    }
    job.status = "cancelled";
  }

  async getJob(id: number): Promise<InMemoryJob | null> {
    return this.getJobById(id);
  }

  async reclaimStuckJobs(maxProcessingMinutes: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - maxProcessingMinutes);
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.status === "processing" && job.lockedAt && job.lockedAt < cutoff) {
        job.status = "pending";
        job.lockedAt = null;
        count++;
      }
    }
    return count;
  }

  async getJobsByTags(tags: string[], mode: "all" | "any", limit?: number, offset?: number): Promise<InMemoryJob[]> {
    let results = Array.from(this.jobs.values()).filter(j => {
      if (mode === "all") {
        return tags.every(t => j.tags.includes(t));
      } else {
        return tags.some(t => j.tags.includes(t));
      }
    });
    results = results.slice(offset ?? 0, (offset ?? 0) + (limit ?? 50));
    return results;
  }

  async getJobs(options: { jobType?: DIDTronJobType }): Promise<InMemoryJob[]> {
    if (options.jobType) {
      return Array.from(this.jobs.values()).filter(j => j.jobType === options.jobType);
    }
    return Array.from(this.jobs.values());
  }

  createProcessor(handlers: JobHandlers<DIDTronPayloadMap>, options?: { pollInterval?: number; concurrency?: number; batchSize?: number }): MockProcessor {
    return new MockProcessor(this, handlers, options);
  }
}

class MockProcessor {
  private running = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(
    private queue: InMemoryJobQueue,
    private handlers: JobHandlers<DIDTronPayloadMap>,
    private options?: { pollInterval?: number; concurrency?: number; batchSize?: number }
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    console.log("[JobQueue] Mock processor started");
    
    this.intervalId = setInterval(async () => {
      await this.processNext();
    }, this.options?.pollInterval ?? 1000);
  }

  stop(): void {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("[JobQueue] Mock processor stopped");
  }

  isRunning(): boolean {
    return this.running;
  }

  private async processNext(): Promise<void> {
    const pending = await this.queue.getJobsByStatus("pending");
    const job = pending[0];
    if (!job) return;

    const handler = this.handlers[job.jobType];
    if (!handler) {
      await this.queue.updateJob(job.id, { 
        status: "failed", 
        error: `No handler for job type: ${job.jobType}`,
        failedAt: new Date()
      });
      return;
    }

    await this.queue.updateJob(job.id, { 
      status: "processing", 
      lockedAt: new Date(),
      attempts: job.attempts + 1
    });

    try {
      await handler(job.payload as any);
      await this.queue.updateJob(job.id, { 
        status: "completed", 
        completedAt: new Date() 
      });
    } catch (err: any) {
      const updatedJob = await this.queue.getJobById(job.id);
      if (updatedJob && updatedJob.attempts >= updatedJob.maxAttempts) {
        await this.queue.updateJob(job.id, { 
          status: "failed", 
          error: err.message,
          failedAt: new Date()
        });
      } else {
        await this.queue.updateJob(job.id, { 
          status: "pending", 
          error: err.message,
          lockedAt: null
        });
      }
    }
  }
}

type JobQueue = DataQueueJobQueue<DIDTronPayloadMap> | InMemoryJobQueue;
let queueInstance: JobQueue | null = null;
let isUsingMockQueue = true;
let initPromise: Promise<JobQueue> | null = null;

async function initializeJobQueue(): Promise<JobQueue> {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const queue = initJobQueue<DIDTronPayloadMap>({
        databaseConfig: {
          connectionString: databaseUrl,
        },
        tableName: "job_queue",
      });
      isUsingMockQueue = false;
      console.log("[JobQueue] Running in database mode (PostgreSQL)");
      return queue;
    } catch (error) {
      console.error("[JobQueue] Failed to initialize database queue, falling back to in-memory:", error);
    }
  }
  isUsingMockQueue = true;
  console.log("[JobQueue] Running in in-memory mode (development)");
  return new InMemoryJobQueue();
}

export function getJobQueue(): JobQueue {
  if (!queueInstance) {
    console.warn("[JobQueue] getJobQueue() called before initialization - creating in-memory queue. Call ensureJobQueueInitialized() first.");
    isUsingMockQueue = true;
    queueInstance = new InMemoryJobQueue();
  }
  return queueInstance;
}

export async function getJobQueueAsync(): Promise<JobQueue> {
  return ensureJobQueueInitialized();
}

export async function ensureJobQueueInitialized(): Promise<JobQueue> {
  if (queueInstance) return queueInstance;
  if (!initPromise) {
    initPromise = initializeJobQueue().then(q => {
      queueInstance = q;
      return q;
    });
  }
  return initPromise;
}

export function isMockQueueMode(): boolean {
  getJobQueue();
  return isUsingMockQueue;
}

export async function enqueueJob<T extends DIDTronJobType>(
  jobType: T,
  payload: DIDTronPayloadMap[T],
  options?: {
    priority?: number;
    runAt?: Date;
    maxAttempts?: number;
    timeoutMs?: number;
    tags?: string[];
  }
): Promise<number> {
  const queue = await getJobQueueAsync();
  
  const enrichedPayload = {
    ...payload,
    enqueuedAt: new Date().toISOString(),
  };
  
  const jobId = await queue.addJob({
    jobType,
    payload: enrichedPayload as DIDTronPayloadMap[T],
    priority: options?.priority ?? 0,
    runAt: options?.runAt ?? null,
    maxAttempts: options?.maxAttempts ?? 3,
    timeoutMs: options?.timeoutMs ?? 300000,
    tags: options?.tags ?? [jobType],
  });
  
  return jobId;
}

export async function scheduleJob<T extends DIDTronJobType>(
  jobType: T,
  payload: DIDTronPayloadMap[T],
  runAt: Date,
  options?: {
    priority?: number;
    maxAttempts?: number;
    timeoutMs?: number;
    tags?: string[];
  }
): Promise<number> {
  return enqueueJob(jobType, payload, {
    ...options,
    runAt,
    tags: [...(options?.tags ?? []), "scheduled"],
  });
}

export async function getJobStats(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  successRate: number;
}> {
  const queue = getJobQueue();
  
  const [pending, processing, completed, failed, cancelled] = await Promise.all([
    queue.getJobsByStatus("pending"),
    queue.getJobsByStatus("processing"),
    queue.getJobsByStatus("completed"),
    queue.getJobsByStatus("failed"),
    queue.getJobsByStatus("cancelled"),
  ]);
  
  const total = completed.length + failed.length;
  const successRate = total > 0 ? (completed.length / total) * 100 : 100;
  
  return {
    pending: pending.length,
    processing: processing.length,
    completed: completed.length,
    failed: failed.length,
    cancelled: cancelled.length,
    successRate: Math.round(successRate * 100) / 100,
  };
}

export async function getJobs(
  options?: {
    status?: JobStatus;
    jobType?: DIDTronJobType;
    limit?: number;
    offset?: number;
    tags?: string[];
  }
): Promise<JobRecord<DIDTronPayloadMap, DIDTronJobType>[]> {
  const queue = getJobQueue();
  
  let jobs: JobRecord<DIDTronPayloadMap, DIDTronJobType>[];
  
  if (options?.status) {
    jobs = await queue.getJobsByStatus(options.status, options.limit ?? 50, options.offset ?? 0);
  } else if (options?.tags && options.tags.length > 0) {
    jobs = await queue.getJobsByTags(options.tags, "any", options.limit ?? 50, options.offset ?? 0);
  } else if (options?.jobType) {
    jobs = await queue.getJobs({ jobType: options.jobType });
  } else {
    jobs = await queue.getAllJobs(options?.limit ?? 50, options?.offset ?? 0);
  }
  
  return jobs;
}

export async function getFailedJobs(limit = 50): Promise<JobRecord<DIDTronPayloadMap, DIDTronJobType>[]> {
  return getJobs({ status: "failed", limit });
}

export async function getPendingJobs(limit = 50): Promise<JobRecord<DIDTronPayloadMap, DIDTronJobType>[]> {
  return getJobs({ status: "pending", limit });
}

export async function getCompletedJobs(limit = 50): Promise<JobRecord<DIDTronPayloadMap, DIDTronJobType>[]> {
  return getJobs({ status: "completed", limit });
}

export async function retryJob(jobId: number): Promise<boolean> {
  const queue = await getJobQueue();
  try {
    await queue.retryJob(jobId);
    return true;
  } catch (error) {
    console.error("Failed to retry job:", error);
    return false;
  }
}

export async function retryAllFailedJobs(): Promise<number> {
  const failedJobs = await getFailedJobs(1000);
  let retried = 0;
  
  for (const job of failedJobs) {
    if (await retryJob(job.id)) {
      retried++;
    }
  }
  
  return retried;
}

export async function cancelJob(jobId: number): Promise<boolean> {
  const queue = getJobQueue();
  try {
    await queue.cancelJob(jobId);
    return true;
  } catch (error) {
    console.error("Failed to cancel job:", error);
    return false;
  }
}

export async function getJob(jobId: number): Promise<JobRecord<DIDTronPayloadMap, DIDTronJobType> | null> {
  const queue = getJobQueue();
  const job = await queue.getJob(jobId);
  return job as JobRecord<DIDTronPayloadMap, DIDTronJobType> | null;
}

export async function cleanupOldJobs(olderThanDays = 30): Promise<number> {
  const queue = getJobQueue();
  return queue.cleanupOldJobs(olderThanDays);
}

export async function reclaimStuckJobs(maxProcessingMinutes = 10): Promise<number> {
  const queue = getJobQueue();
  return queue.reclaimStuckJobs(maxProcessingMinutes);
}

export const JOB_TYPE_LABELS: Record<DIDTronJobType, string> = {
  rate_card_import: "Rate Card Import",
  rate_card_export: "Rate Card Export",
  connexcs_sync_customer: "ConnexCS Customer Sync",
  connexcs_sync_carrier: "ConnexCS Carrier Sync",
  connexcs_sync_all: "ConnexCS Full Sync",
  did_provision: "DID Provision",
  did_bulk_provision: "DID Bulk Provision",
  did_release: "DID Release",
  invoice_generate: "Invoice Generation",
  invoice_bulk_generate: "Bulk Invoice Generation",
  email_send: "Email Send",
  email_bulk_send: "Bulk Email Send",
  report_generate: "Report Generation",
  ai_voice_kb_train: "AI Voice KB Training",
  ai_voice_kb_index: "AI Voice KB Indexing",
  ai_voice_campaign_start: "AI Voice Campaign Start",
  ai_voice_campaign_call: "AI Voice Campaign Call",
  ai_voice_agent_sync: "AI Voice Agent Sync",
  webhook_deliver: "Webhook Delivery",
  fx_rate_update: "FX Rate Update",
  billing_reconcile: "Billing Reconciliation",
  audit_cleanup: "Audit Log Cleanup",
  cdr_process: "CDR Processing",
  az_destination_import: "A-Z Destinations Import",
  az_destination_delete_all: "A-Z Destinations Delete All",
  trash_restore: "Trash Restore",
  trash_purge: "Trash Purge",
};

export const JOB_TYPE_CATEGORIES: Record<string, DIDTronJobType[]> = {
  "Rate Cards": ["rate_card_import", "rate_card_export"],
  "ConnexCS Sync": ["connexcs_sync_customer", "connexcs_sync_carrier", "connexcs_sync_all"],
  "DID Management": ["did_provision", "did_bulk_provision", "did_release"],
  "Billing": ["invoice_generate", "invoice_bulk_generate", "billing_reconcile"],
  "Communications": ["email_send", "email_bulk_send", "webhook_deliver"],
  "AI Voice": ["ai_voice_kb_train", "ai_voice_kb_index", "ai_voice_campaign_start", "ai_voice_campaign_call", "ai_voice_agent_sync"],
  "A-Z Database": ["az_destination_import", "az_destination_delete_all"],
  "Audit & Trash": ["audit_cleanup", "trash_restore", "trash_purge"],
  "System": ["report_generate", "fx_rate_update", "cdr_process"],
};

export type { JobQueue, JobRecord, JobStatus, JobHandler, JobHandlers, Processor };
