import type { Express } from "express";
import { auditService } from "../audit-service";

export function registerAdminAuditRoutes(app: Express): void {
  // ==================== AUDIT LOGS ====================

  app.get("/api/audit/logs", async (req, res) => {
    try {
      const { limit, entityType, entityId, userId, search } = req.query;
      
      let logs;
      if (search) {
        logs = await auditService.searchLogs(String(search));
      } else if (entityType) {
        logs = await auditService.getLogsByEntity(String(entityType), entityId ? String(entityId) : undefined);
      } else if (userId) {
        logs = await auditService.getLogsByUser(String(userId));
      } else {
        logs = await auditService.getRecentLogs(limit ? parseInt(String(limit)) : 100);
      }
      
      res.json(logs);
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  app.delete("/api/audit/logs", async (req, res) => {
    try {
      const count = await auditService.deleteAllAuditLogs();
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "bulk_delete_completed",
        tableName: "audit_logs",
        newValues: { deletedCount: count },
      });
      res.json({ success: true, deletedCount: count });
    } catch (error) {
      console.error("Audit logs delete error:", error);
      res.status(500).json({ error: "Failed to delete audit logs" });
    }
  });

  // ==================== TRASH MANAGEMENT ====================

  app.get("/api/trash", async (req, res) => {
    try {
      const { tableName, limit, offset } = req.query;
      const result = await auditService.getTrashItems({
        tableName: tableName ? String(tableName) : undefined,
        limit: limit ? parseInt(String(limit)) : 50,
        offset: offset ? parseInt(String(offset)) : 0,
      });
      res.json(result);
    } catch (error) {
      console.error("Trash fetch error:", error);
      res.status(500).json({ error: "Failed to fetch trash items" });
    }
  });

  app.post("/api/trash/:id/restore", async (req, res) => {
    try {
      const restored = await auditService.restoreFromTrash(req.params.id, req.session?.userId);
      if (!restored) {
        return res.status(404).json({ error: "Trash item not found" });
      }
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "trash_restored",
        tableName: restored.tableName,
        recordId: restored.recordId,
        newValues: restored.recordData,
      });
      res.json({ success: true, restored });
    } catch (error) {
      console.error("Trash restore error:", error);
      res.status(500).json({ error: "Failed to restore from trash" });
    }
  });

  app.delete("/api/trash/expired", async (req, res) => {
    try {
      const count = await auditService.purgeExpiredTrash();
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "trash_purged",
        tableName: "trash",
        newValues: { purgeType: "expired", purgedCount: count },
      });
      res.json({ success: true, purgedCount: count });
    } catch (error) {
      console.error("Trash purge expired error:", error);
      res.status(500).json({ error: "Failed to purge expired trash" });
    }
  });

  app.delete("/api/trash/all", async (req, res) => {
    try {
      const count = await auditService.purgeAllTrash();
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "trash_purged",
        tableName: "trash",
        newValues: { purgeType: "all", purgedCount: count },
      });
      res.json({ success: true, purgedCount: count });
    } catch (error) {
      console.error("Trash purge all error:", error);
      res.status(500).json({ error: "Failed to purge all trash" });
    }
  });

  // ==================== PLATFORM SETTINGS ====================

  app.get("/api/settings/platform", async (req, res) => {
    try {
      const settings = await auditService.getAllPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error("Platform settings fetch error:", error);
      res.status(500).json({ error: "Failed to fetch platform settings" });
    }
  });

  app.get("/api/settings/platform/:key", async (req, res) => {
    try {
      const value = await auditService.getPlatformSetting(req.params.key);
      res.json({ key: req.params.key, value });
    } catch (error) {
      console.error("Platform setting fetch error:", error);
      res.status(500).json({ error: "Failed to fetch platform setting" });
    }
  });

  app.put("/api/settings/platform/:key", async (req, res) => {
    try {
      const { value } = req.body;
      if (value === undefined) {
        return res.status(400).json({ error: "value is required" });
      }
      await auditService.setPlatformSetting(req.params.key, value);
      res.json({ success: true, key: req.params.key, value });
    } catch (error) {
      console.error("Platform setting update error:", error);
      res.status(500).json({ error: "Failed to update platform setting" });
    }
  });
}
