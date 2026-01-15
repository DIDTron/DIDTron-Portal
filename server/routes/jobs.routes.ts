import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "../storage";

const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = await storage.getUser(userId);
  if (!user || user.role !== "super_admin") {
    return res.status(403).json({ error: "Forbidden: Super Admin access required" });
  }
  next();
};

export function registerJobsRoutes(app: Express) {
  app.use("/api/admin/jobs", requireSuperAdmin);

  app.get("/api/admin/jobs/stats", async (req, res) => {
    try {
      const { getJobStats } = await import("../job-queue");
      const stats = await getJobStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Failed to get job stats:", error);
      res.status(500).json({ error: "Failed to get job stats", details: error.message });
    }
  });
  
  app.get("/api/admin/jobs", async (req, res) => {
    try {
      const { getJobs, JOB_TYPE_LABELS, JOB_TYPE_CATEGORIES } = await import("../job-queue");
      const { status, jobType, limit, offset, tags } = req.query;
      
      const jobs = await getJobs({
        status: status as any,
        jobType: jobType as any,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
        tags: tags ? (tags as string).split(",") : undefined,
      });
      
      res.json({
        jobs,
        labels: JOB_TYPE_LABELS,
        categories: JOB_TYPE_CATEGORIES,
      });
    } catch (error: any) {
      console.error("Failed to get jobs:", error);
      res.status(500).json({ error: "Failed to get jobs", details: error.message });
    }
  });
  
  app.get("/api/admin/jobs/:id", async (req, res) => {
    try {
      const { getJob } = await import("../job-queue");
      const jobId = parseInt(req.params.id);
      const job = await getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      console.error("Failed to get job:", error);
      res.status(500).json({ error: "Failed to get job", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/:id/retry", async (req, res) => {
    try {
      const { retryJob } = await import("../job-queue");
      const jobId = parseInt(req.params.id);
      const success = await retryJob(jobId);
      if (!success) {
        return res.status(400).json({ error: "Failed to retry job" });
      }
      res.json({ success: true, message: "Job queued for retry" });
    } catch (error: any) {
      console.error("Failed to retry job:", error);
      res.status(500).json({ error: "Failed to retry job", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/:id/cancel", async (req, res) => {
    try {
      const { cancelJob } = await import("../job-queue");
      const jobId = parseInt(req.params.id);
      const success = await cancelJob(jobId);
      if (!success) {
        return res.status(400).json({ error: "Failed to cancel job" });
      }
      res.json({ success: true, message: "Job cancelled" });
    } catch (error: any) {
      console.error("Failed to cancel job:", error);
      res.status(500).json({ error: "Failed to cancel job", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/retry-all-failed", async (req, res) => {
    try {
      const { retryAllFailedJobs } = await import("../job-queue");
      const count = await retryAllFailedJobs();
      res.json({ success: true, message: `${count} jobs queued for retry` });
    } catch (error: any) {
      console.error("Failed to retry all failed jobs:", error);
      res.status(500).json({ error: "Failed to retry all failed jobs", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/cleanup", async (req, res) => {
    try {
      const { cleanupOldJobs } = await import("../job-queue");
      const { olderThanDays } = req.body;
      const count = await cleanupOldJobs(olderThanDays ?? 30);
      res.json({ success: true, message: `${count} old jobs cleaned up` });
    } catch (error: any) {
      console.error("Failed to cleanup jobs:", error);
      res.status(500).json({ error: "Failed to cleanup jobs", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/reclaim-stuck", async (req, res) => {
    try {
      const { reclaimStuckJobs } = await import("../job-queue");
      const { maxProcessingMinutes } = req.body;
      const count = await reclaimStuckJobs(maxProcessingMinutes ?? 10);
      res.json({ success: true, message: `${count} stuck jobs reclaimed` });
    } catch (error: any) {
      console.error("Failed to reclaim stuck jobs:", error);
      res.status(500).json({ error: "Failed to reclaim stuck jobs", details: error.message });
    }
  });
  
  app.get("/api/admin/jobs/worker/status", async (req, res) => {
    try {
      const { isWorkerRunning } = await import("../job-worker");
      res.json({ running: isWorkerRunning() });
    } catch (error: any) {
      console.error("Failed to get worker status:", error);
      res.status(500).json({ error: "Failed to get worker status", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/worker/start", async (req, res) => {
    try {
      const { startJobWorker, isWorkerRunning } = await import("../job-worker");
      if (isWorkerRunning()) {
        return res.json({ success: true, message: "Worker already running" });
      }
      await startJobWorker();
      res.json({ success: true, message: "Worker started" });
    } catch (error: any) {
      console.error("Failed to start worker:", error);
      res.status(500).json({ error: "Failed to start worker", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/worker/stop", async (req, res) => {
    try {
      const { stopJobWorker } = await import("../job-worker");
      await stopJobWorker();
      res.json({ success: true, message: "Worker stopped" });
    } catch (error: any) {
      console.error("Failed to stop worker:", error);
      res.status(500).json({ error: "Failed to stop worker", details: error.message });
    }
  });
  
  app.post("/api/admin/jobs/test", async (req, res) => {
    try {
      const { enqueueJob } = await import("../job-queue");
      const { jobType, payload } = req.body;
      
      if (!jobType) {
        return res.status(400).json({ error: "jobType is required" });
      }
      
      const jobId = await enqueueJob(jobType, payload ?? {}, {
        tags: ["test"],
      });
      
      res.json({ success: true, jobId, message: `Test job ${jobType} enqueued` });
    } catch (error: any) {
      console.error("Failed to enqueue test job:", error);
      res.status(500).json({ error: "Failed to enqueue test job", details: error.message });
    }
  });

  app.get("/api/admin/jobs/az-import-status", async (req, res) => {
    try {
      const { getJobs } = await import("../job-queue");
      const pendingJobs = await getJobs({ status: "pending" });
      const processingJobs = await getJobs({ status: "processing" });
      const azPending = pendingJobs.filter(j => j.jobType === "az_destination_import").length;
      const azProcessing = processingJobs.filter(j => j.jobType === "az_destination_import").length;
      res.json({ pending: azPending + azProcessing });
    } catch (error: any) {
      console.error("Failed to get A-Z import status:", error);
      res.json({ pending: 0 });
    }
  });
}
