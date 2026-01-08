import { db } from "./db";
import { auditLogs, trash, platformSettings } from "@shared/schema";
import { eq, sql, and, lt, isNull } from "drizzle-orm";
import type { Request } from "express";

export type AuditAction = 
  | "login_success" | "login_failed" | "logout" | "session_timeout" | "password_reset" | "password_changed"
  | "create" | "update" | "delete" | "status_changed" | "import_started" | "import_completed" | "import_failed"
  | "balance_adjusted" | "payment_received" | "payment_refunded" | "invoice_sent" | "invoice_paid"
  | "config_changed" | "integration_enabled" | "integration_disabled" | "api_key_rotated"
  | "job_created" | "job_completed" | "job_failed" | "job_retried" | "job_cancelled" | "job_undo"
  | "trash_moved" | "trash_restored" | "trash_purged"
  | "bulk_delete_queued" | "bulk_delete_completed"
  | "rollback" | "assignment_changed" | "export";

interface AuditLogParams {
  userId?: string | null;
  action: AuditAction | string;
  tableName?: string;
  recordId?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const enabled = await getPlatformSetting("audit_log_enabled");
    if (enabled === "false") return;

    await db.insert(auditLogs).values({
      userId: params.userId || null,
      action: params.action,
      tableName: params.tableName || null,
      recordId: params.recordId || null,
      oldValues: params.oldValues || null,
      newValues: params.newValues || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
  } catch (error) {
    console.error("[AuditService] Failed to create audit log:", error);
  }
}

export function getRequestContext(req: Request): { ipAddress: string; userAgent: string; userId?: string } {
  return {
    ipAddress: req.ip || req.socket?.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    userId: req.session?.userId,
  };
}

export async function logWithRequest(
  req: Request,
  action: AuditAction | string,
  tableName: string,
  recordId?: string,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null
): Promise<void> {
  const ctx = getRequestContext(req);
  await createAuditLog({
    userId: ctx.userId,
    action,
    tableName,
    recordId,
    oldValues,
    newValues,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });
}

export async function moveToTrash(
  tableName: string,
  recordId: string,
  recordData: Record<string, unknown>,
  deletedBy?: string | null
): Promise<void> {
  const retentionDays = parseInt(await getPlatformSetting("trash_retention_days") || "30", 10);
  const restorableUntil = new Date();
  restorableUntil.setDate(restorableUntil.getDate() + retentionDays);

  await db.insert(trash).values({
    tableName,
    recordId,
    recordData,
    deletedBy: deletedBy || null,
    restorableUntil,
  });
}

export async function restoreFromTrash(trashId: string, restoredBy?: string | null): Promise<{
  tableName: string;
  recordId: string;
  recordData: Record<string, unknown>;
} | null> {
  const [trashRecord] = await db
    .select()
    .from(trash)
    .where(and(eq(trash.id, trashId), eq(trash.isRestored, false)));

  if (!trashRecord) return null;

  await db
    .update(trash)
    .set({
      isRestored: true,
      restoredAt: new Date(),
      restoredBy: restoredBy || null,
    })
    .where(eq(trash.id, trashId));

  return {
    tableName: trashRecord.tableName,
    recordId: trashRecord.recordId,
    recordData: trashRecord.recordData as Record<string, unknown>,
  };
}

export async function getTrashItems(options?: {
  tableName?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: Array<typeof trash.$inferSelect>; total: number }> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  let query = db
    .select()
    .from(trash)
    .where(eq(trash.isRestored, false))
    .orderBy(sql`${trash.deletedAt} DESC`)
    .limit(limit)
    .offset(offset);

  if (options?.tableName) {
    query = db
      .select()
      .from(trash)
      .where(and(eq(trash.isRestored, false), eq(trash.tableName, options.tableName)))
      .orderBy(sql`${trash.deletedAt} DESC`)
      .limit(limit)
      .offset(offset);
  }

  const items = await query;
  
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(trash)
    .where(eq(trash.isRestored, false));

  return {
    items,
    total: countResult[0]?.count || 0,
  };
}

export async function purgeExpiredTrash(): Promise<number> {
  const result = await db
    .delete(trash)
    .where(and(
      eq(trash.isRestored, false),
      lt(trash.restorableUntil, new Date())
    ))
    .returning();

  return result.length;
}

export async function purgeAllTrash(): Promise<number> {
  const result = await db
    .delete(trash)
    .where(eq(trash.isRestored, false))
    .returning();

  return result.length;
}

export async function deleteAllAuditLogs(): Promise<number> {
  const result = await db.delete(auditLogs).returning();
  return result.length;
}

export async function getPlatformSetting(key: string): Promise<string | null> {
  const [setting] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, key));
  
  return setting?.value || null;
}

export async function setPlatformSetting(
  key: string,
  value: string,
  updatedBy?: string | null
): Promise<void> {
  await db
    .insert(platformSettings)
    .values({
      key,
      value,
      updatedBy: updatedBy || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: platformSettings.key,
      set: {
        value,
        updatedBy: updatedBy || null,
        updatedAt: new Date(),
      },
    });
}

export async function getRetentionDays(): Promise<number> {
  const value = await getPlatformSetting("trash_retention_days");
  return parseInt(value || "30", 10);
}

export async function setRetentionDays(days: number, updatedBy?: string | null): Promise<void> {
  await setPlatformSetting("trash_retention_days", String(days), updatedBy);
}

export async function getRecentLogs(limit: number = 100): Promise<Array<typeof auditLogs.$inferSelect>> {
  return db
    .select()
    .from(auditLogs)
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(limit);
}

export async function getLogsByEntity(entityType: string, entityId?: string): Promise<Array<typeof auditLogs.$inferSelect>> {
  if (entityId) {
    return db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.tableName, entityType), eq(auditLogs.recordId, entityId)))
      .orderBy(sql`${auditLogs.createdAt} DESC`)
      .limit(100);
  }
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.tableName, entityType))
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(100);
}

export async function getLogsByUser(userId: string): Promise<Array<typeof auditLogs.$inferSelect>> {
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(100);
}

export async function searchLogs(searchTerm: string): Promise<Array<typeof auditLogs.$inferSelect>> {
  return db
    .select()
    .from(auditLogs)
    .where(sql`
      ${auditLogs.action} ILIKE ${'%' + searchTerm + '%'} OR
      ${auditLogs.tableName} ILIKE ${'%' + searchTerm + '%'} OR
      ${auditLogs.recordId} ILIKE ${'%' + searchTerm + '%'}
    `)
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(100);
}

export async function getAllPlatformSettings(): Promise<Array<{ key: string; value: string | null }>> {
  return db.select({ key: platformSettings.key, value: platformSettings.value }).from(platformSettings);
}

export const auditService = {
  createAuditLog,
  logWithRequest,
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
  getRecentLogs,
  getLogsByEntity,
  getLogsByUser,
  searchLogs,
  getAllPlatformSettings,
};

export default auditService;
