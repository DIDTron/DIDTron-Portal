import { eq } from "drizzle-orm";
import { db } from "./db";
import { integrations, type Integration, type InsertIntegration } from "@shared/schema";

const DEFAULT_INTEGRATIONS: InsertIntegration[] = [
  {
    provider: "connexcs",
    displayName: "ConnexCS",
    description: "VoIP switching and routing platform",
    category: "voip",
    icon: "phone",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "stripe",
    displayName: "Stripe",
    description: "Payment processing",
    category: "payments",
    icon: "credit-card",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "paypal",
    displayName: "PayPal",
    description: "Alternative payments",
    category: "payments",
    icon: "wallet",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "nowpayments",
    displayName: "NOWPayments",
    description: "Cryptocurrency payments",
    category: "payments",
    icon: "bitcoin",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "brevo",
    displayName: "Brevo",
    description: "Email service (Sendinblue)",
    category: "email",
    icon: "mail",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "ayrshare",
    displayName: "Ayrshare",
    description: "Social media management",
    category: "social",
    icon: "share-2",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "openexchangerates",
    displayName: "Open Exchange Rates",
    description: "Currency conversion",
    category: "finance",
    icon: "dollar-sign",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "cloudflare_r2",
    displayName: "Cloudflare R2",
    description: "Object storage",
    category: "storage",
    icon: "hard-drive",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "upstash_redis",
    displayName: "Upstash Redis",
    description: "Caching and sessions",
    category: "cache",
    icon: "database",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "twilio",
    displayName: "Twilio",
    description: "SIP testing (premium)",
    category: "sip_testing",
    icon: "phone-call",
    status: "not_configured",
    isEnabled: false,
  },
  {
    provider: "signalwire",
    displayName: "SignalWire",
    description: "SIP testing (budget)",
    category: "sip_testing",
    icon: "phone-forwarded",
    status: "not_configured",
    isEnabled: false,
  },
];

export class IntegrationsRepository {
  async getIntegrations(): Promise<Integration[]> {
    return await db.select().from(integrations);
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    const [result] = await db.select().from(integrations).where(eq(integrations.id, id));
    return result;
  }

  async getIntegrationByProvider(provider: string): Promise<Integration | undefined> {
    const [result] = await db.select().from(integrations).where(eq(integrations.provider, provider));
    return result;
  }

  async createIntegration(data: InsertIntegration): Promise<Integration> {
    const [result] = await db.insert(integrations).values(data).returning();
    return result;
  }

  async updateIntegration(id: string, data: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const [result] = await db
      .update(integrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return result;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    const result = await db.delete(integrations).where(eq(integrations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async seedIntegrationsIfMissing(): Promise<void> {
    const existing = await this.getIntegrations();
    const existingProviders = new Set(existing.map(i => i.provider));

    for (const defaultIntegration of DEFAULT_INTEGRATIONS) {
      if (!existingProviders.has(defaultIntegration.provider)) {
        await this.createIntegration(defaultIntegration);
        console.log(`[Integrations] Seeded: ${defaultIntegration.displayName}`);
      }
    }
  }
}

export const integrationsRepository = new IntegrationsRepository();
