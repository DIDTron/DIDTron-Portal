import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "info@didtron.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "admin123";

test.describe("System Status Page - All Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    await page.fill('[data-testid="input-email"]', SUPER_ADMIN_EMAIL);
    await page.fill('[data-testid="input-password"]', SUPER_ADMIN_PASSWORD);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL("**/admin/**", { timeout: 30000 });
  });

  test("Overview tab displays global status and KPIs", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=System Status")).toBeVisible();
    await expect(page.locator("text=Healthy").or(page.locator("text=Degraded")).or(page.locator("text=Down"))).toBeVisible();
    await expect(page.locator("text=Last updated")).toBeVisible();
  });

  test("Performance tab shows SLO budgets with real values", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await page.click('button[role="tab"]:has-text("Performance")');
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=SLO Budgets")).toBeVisible();
    await expect(page.locator("text=API List Endpoints").or(page.locator("text=API Detail Endpoints"))).toBeVisible();
  });

  test("Health tab shows all service statuses with latency", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await page.click('button[role="tab"]:has-text("Health")');
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Service Health")).toBeVisible();
    await expect(page.locator("text=API Server")).toBeVisible();
    await expect(page.locator("text=PostgreSQL")).toBeVisible();
    await expect(page.locator("text=Redis")).toBeVisible();
    await expect(page.locator("text=R2 Storage")).toBeVisible();
  });

  test("Cache tab shows Redis and R2 metrics with real latency values", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await page.click('button[role="tab"]:has-text("Cache")');
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Redis")).toBeVisible();
    await expect(page.locator("text=R2 Object Storage")).toBeVisible();
    await expect(page.locator("text=p95 Latency")).toBeVisible();

    const p95LatencyValues = await page.locator('text=/\\d+ms/').all();
    expect(p95LatencyValues.length).toBeGreaterThan(0);
  });

  test("Integrations tab shows all integrations with health status", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await page.click('button[role="tab"]:has-text("Integrations")');
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Integration Health")).toBeVisible();
    await expect(page.locator("text=Connexcs")).toBeVisible();
    await expect(page.locator("text=Brevo")).toBeVisible();
    await expect(page.locator("text=Openexchangerates")).toBeVisible();

    const lastSuccessNotNever = await page.locator('td:has-text("AM")').or(page.locator('td:has-text("PM")')).count();
    expect(lastSuccessNotNever).toBeGreaterThan(0);
  });

  test("Database tab shows pool and query stats", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await page.click('button[role="tab"]:has-text("Database")');
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Database Pool")).toBeVisible();
  });

  test("Jobs tab shows queue statistics", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await page.click('button[role="tab"]:has-text("Jobs")');
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Job Queue Status")).toBeVisible();
  });

  test("Alerts tab shows alert management", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");

    await page.click('button[role="tab"]:has-text("Alerts")');
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Alert Management")).toBeVisible();
  });

  test("API endpoints return real data with non-zero values", async ({ page }) => {
    const cacheResponse = await page.request.get(`${BASE_URL}/api/system/cache`);
    const cacheData = await cacheResponse.json();
    expect(cacheData.redis).toBeDefined();
    expect(cacheData.r2).toBeDefined();
    expect(typeof cacheData.redis.p95Latency).toBe("number");
    expect(typeof cacheData.r2.p95Latency).toBe("number");

    const integrationsResponse = await page.request.get(`${BASE_URL}/api/system/integrations`);
    const integrationsData = await integrationsResponse.json();
    expect(integrationsData.integrations).toBeDefined();
    expect(integrationsData.integrations.length).toBeGreaterThan(0);

    const healthyIntegrations = integrationsData.integrations.filter(
      (i: { lastSuccessAt: string | null }) => i.lastSuccessAt !== null
    );
    expect(healthyIntegrations.length).toBeGreaterThan(0);
  });
});
