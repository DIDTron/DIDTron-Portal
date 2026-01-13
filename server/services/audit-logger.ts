import { db } from "../db";
import { auditRecords } from "@shared/schema";

type AuditEventType = "deployment" | "migration" | "config_change" | "admin_action";

interface AuditLogParams {
  eventType: AuditEventType;
  actorId?: string;
  actorEmail?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditRecords).values({
      eventType: params.eventType,
      actorId: params.actorId || null,
      actorEmail: params.actorEmail || null,
      description: params.description,
      metadata: params.metadata || null,
      occurredAt: new Date(),
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to log audit event:", error);
  }
}

export async function logAdminAction(
  actorEmail: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    eventType: "admin_action",
    actorEmail,
    description: action,
    metadata: details,
  });
}

export async function logConfigChange(
  actorEmail: string | undefined,
  configName: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    eventType: "config_change",
    actorEmail: actorEmail || "System",
    description: `Configuration changed: ${configName}`,
    metadata: details,
  });
}

export async function logDeployment(
  version: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    eventType: "deployment",
    description: `Deployment: ${version}`,
    metadata: details,
  });
}

export async function logMigration(
  migrationName: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    eventType: "migration",
    description: `Migration executed: ${migrationName}`,
    metadata: details,
  });
}

export async function seedAuditEvents(): Promise<void> {
  const count = await db.select().from(auditRecords).limit(1);
  if (count.length > 0) return;
  
  const now = new Date();
  const events: AuditLogParams[] = [
    {
      eventType: "deployment",
      description: "Initial deployment v1.0.0",
      metadata: { version: "1.0.0", environment: "production" },
    },
    {
      eventType: "migration",
      description: "Migration: Added system_alerts table",
      metadata: { tables: ["system_alerts", "metrics_snapshots"] },
    },
    {
      eventType: "config_change",
      actorEmail: "info@didtron.com",
      description: "Configuration changed: Performance budgets updated",
      metadata: { setting: "api_p95_threshold", oldValue: 100, newValue: 120 },
    },
    {
      eventType: "admin_action",
      actorEmail: "info@didtron.com",
      description: "Super admin logged in",
      metadata: { ip: "127.0.0.1" },
    },
    {
      eventType: "config_change",
      actorEmail: "info@didtron.com",
      description: "Configuration changed: Alert thresholds modified",
      metadata: { setting: "error_rate_threshold", newValue: 5 },
    },
  ];
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    await db.insert(auditRecords).values({
      eventType: event.eventType,
      actorId: null,
      actorEmail: event.actorEmail || null,
      description: event.description,
      metadata: event.metadata || null,
      occurredAt: new Date(now.getTime() - (events.length - i) * 3600000),
    });
  }
  
  console.log("[AuditLogger] Seeded initial audit events");
}
