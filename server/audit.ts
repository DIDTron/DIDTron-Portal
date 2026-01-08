import { aiService } from "./ai-service";
import { 
  createAuditLog as dbCreateAuditLog,
  logWithRequest as dbLogWithRequest,
  getRequestContext,
  moveToTrash,
  restoreFromTrash,
  getTrashItems,
  purgeExpiredTrash,
  purgeAllTrash,
  deleteAllAuditLogs,
  getPlatformSetting,
  setPlatformSetting,
  getRetentionDays,
  setRetentionDays,
  getRecentLogs as dbGetRecentLogs,
  getLogsByEntity as dbGetLogsByEntity,
  getLogsByUser as dbGetLogsByUser,
  searchLogs as dbSearchLogs,
  getAllPlatformSettings,
  type AuditAction,
} from "./audit-service";
import type { Request } from "express";

export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  action: "create" | "update" | "delete";
  userId?: string;
  userEmail?: string;
  changes: Array<{
    field: string;
    oldValue?: string;
    newValue?: string;
  }>;
  aiSummary?: string;
  timestamp: Date;
  ipAddress?: string;
}

class AuditService {
  private logs: AuditEntry[] = [];

  async log(entry: Omit<AuditEntry, "id" | "timestamp" | "aiSummary">): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    if (entry.changes.length > 0 || entry.action !== "update") {
      try {
        auditEntry.aiSummary = await aiService.generateAuditSummary(
          entry.changes.map(c => ({
            entity: entry.entityType,
            action: entry.action,
            field: c.field,
            oldValue: c.oldValue,
            newValue: c.newValue,
          }))
        );
      } catch (error) {
        console.error("[Audit] Failed to generate AI summary:", error);
        auditEntry.aiSummary = this.generateFallbackSummary(entry);
      }
    }

    this.logs.unshift(auditEntry);
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(0, 10000);
    }

    try {
      await dbCreateAuditLog({
        userId: entry.userId || null,
        action: entry.action as AuditAction,
        tableName: entry.entityType,
        recordId: entry.entityId,
        oldValues: entry.changes.reduce((acc, c) => ({ ...acc, [c.field]: c.oldValue }), {}),
        newValues: { ...entry.changes.reduce((acc, c) => ({ ...acc, [c.field]: c.newValue }), {}), aiSummary: auditEntry.aiSummary },
        ipAddress: entry.ipAddress,
      });
    } catch (error) {
      console.error("[Audit] Failed to persist to database:", error);
    }

    console.log(`[Audit] ${entry.action.toUpperCase()} ${entry.entityType}:${entry.entityId} by ${entry.userEmail || "system"}`);
    return auditEntry;
  }

  private generateFallbackSummary(entry: Omit<AuditEntry, "id" | "timestamp" | "aiSummary">): string {
    const { entityType, entityName, action, changes, userEmail } = entry;
    const name = entityName || entry.entityId;

    switch (action) {
      case "create":
        return `${userEmail || "System"} created new ${entityType}: ${name}`;
      case "delete":
        return `${userEmail || "System"} deleted ${entityType}: ${name}`;
      case "update":
        const fieldList = changes.map(c => c.field).join(", ");
        return `${userEmail || "System"} updated ${entityType} ${name}: modified ${fieldList}`;
    }
  }

  async logCreate(
    entityType: string,
    entityId: string,
    entityName: string,
    data: Record<string, unknown>,
    userId?: string,
    userEmail?: string,
    ipAddress?: string
  ): Promise<AuditEntry> {
    return this.log({
      entityType,
      entityId,
      entityName,
      action: "create",
      userId,
      userEmail,
      changes: Object.entries(data).map(([field, value]) => ({
        field,
        newValue: String(value),
      })),
      ipAddress,
    });
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    entityName: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    userId?: string,
    userEmail?: string,
    ipAddress?: string
  ): Promise<AuditEntry> {
    const changes: AuditEntry["changes"] = [];

    for (const key of Object.keys(newData)) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push({
          field: key,
          oldValue: oldData[key] !== undefined ? String(oldData[key]) : undefined,
          newValue: newData[key] !== undefined ? String(newData[key]) : undefined,
        });
      }
    }

    if (changes.length === 0) {
      return this.log({
        entityType,
        entityId,
        entityName,
        action: "update",
        userId,
        userEmail,
        changes: [{ field: "no changes", oldValue: "", newValue: "" }],
        ipAddress,
      });
    }

    return this.log({
      entityType,
      entityId,
      entityName,
      action: "update",
      userId,
      userEmail,
      changes,
      ipAddress,
    });
  }

  async logDelete(
    entityType: string,
    entityId: string,
    entityName: string,
    userId?: string,
    userEmail?: string,
    ipAddress?: string
  ): Promise<AuditEntry> {
    return this.log({
      entityType,
      entityId,
      entityName,
      action: "delete",
      userId,
      userEmail,
      changes: [],
      ipAddress,
    });
  }

  getRecentLogs(limit = 100): AuditEntry[] {
    return this.logs.slice(0, limit);
  }

  getLogsByEntity(entityType: string, entityId?: string): AuditEntry[] {
    return this.logs.filter(
      l => l.entityType === entityType && (entityId ? l.entityId === entityId : true)
    );
  }

  getLogsByUser(userId: string): AuditEntry[] {
    return this.logs.filter(l => l.userId === userId);
  }

  searchLogs(query: string): AuditEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(
      l =>
        l.entityType.toLowerCase().includes(lowerQuery) ||
        l.entityName?.toLowerCase().includes(lowerQuery) ||
        l.aiSummary?.toLowerCase().includes(lowerQuery) ||
        l.userEmail?.toLowerCase().includes(lowerQuery)
    );
  }

  async createAuditLog(params: {
    userId?: string | null;
    action: string;
    tableName?: string;
    recordId?: string;
    oldValues?: Record<string, unknown> | null;
    newValues?: Record<string, unknown> | null;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    return dbCreateAuditLog(params);
  }

  async logWithRequest(
    req: Request,
    action: string,
    tableName: string,
    recordId?: string,
    oldValues?: Record<string, unknown> | null,
    newValues?: Record<string, unknown> | null
  ): Promise<void> {
    return dbLogWithRequest(req, action, tableName, recordId, oldValues, newValues);
  }

  getRequestContext = getRequestContext;
  moveToTrash = moveToTrash;
  restoreFromTrash = restoreFromTrash;
  getTrashItems = getTrashItems;
  purgeExpiredTrash = purgeExpiredTrash;
  purgeAllTrash = purgeAllTrash;
  deleteAllAuditLogs = deleteAllAuditLogs;
  getPlatformSetting = getPlatformSetting;
  setPlatformSetting = setPlatformSetting;
  getRetentionDays = getRetentionDays;
  setRetentionDays = setRetentionDays;
  getAllPlatformSettings = getAllPlatformSettings;
}

export const auditService = new AuditService();
export default auditService;
