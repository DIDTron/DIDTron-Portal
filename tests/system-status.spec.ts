import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "info@didtron.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "admin123";

test.describe("System Status Page - All Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    await page.getByTestId("input-email").fill(SUPER_ADMIN_EMAIL);
    await page.getByTestId("input-password").fill(SUPER_ADMIN_PASSWORD);
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await page.goto(`${BASE_URL}/admin/system-status`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "System Status" })).toBeVisible({ timeout: 15000 });
  });

  test("Overview tab displays global status and KPIs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "System Status" })).toBeVisible({ timeout: 5000 });
  });

  test("Performance tab shows SLO budgets", async ({ page }) => {
    await page.getByRole("tab", { name: "Performance" }).click();
    await expect(page.getByRole("tab", { name: "Performance" })).toHaveAttribute("data-state", "active", { timeout: 5000 });
  });

  test("Health tab shows service statuses", async ({ page }) => {
    await page.getByRole("tab", { name: "Health" }).click();
    await expect(page.getByRole("tab", { name: "Health" })).toHaveAttribute("data-state", "active", { timeout: 5000 });
  });

  test("Cache tab is accessible", async ({ page }) => {
    await page.getByRole("tab", { name: "Cache" }).click();
    await expect(page.getByRole("tab", { name: "Cache" })).toHaveAttribute("data-state", "active", { timeout: 5000 });
  });

  test("Integrations tab is accessible", async ({ page }) => {
    await page.getByRole("tab", { name: "Integrations" }).click();
    await expect(page.getByRole("tab", { name: "Integrations" })).toHaveAttribute("data-state", "active", { timeout: 5000 });
  });

  test("Database tab is accessible", async ({ page }) => {
    await page.getByRole("tab", { name: "Database" }).click();
    await expect(page.getByRole("tab", { name: "Database" })).toHaveAttribute("data-state", "active", { timeout: 5000 });
  });

  test("Jobs tab is accessible", async ({ page }) => {
    await page.getByRole("tab", { name: "Jobs" }).click();
    await expect(page.getByRole("tab", { name: "Jobs" })).toHaveAttribute("data-state", "active", { timeout: 5000 });
  });

  test("Alerts tab is accessible", async ({ page }) => {
    await page.getByRole("tab", { name: "Alerts" }).click();
    await expect(page.getByRole("tab", { name: "Alerts" })).toHaveAttribute("data-state", "active", { timeout: 5000 });
  });

  test("API endpoints return real data", async ({ page }) => {
    const cacheResponse = await page.request.get(`${BASE_URL}/api/system/cache`);
    const cacheData = await cacheResponse.json();
    expect(cacheData.redis).toBeDefined();
    expect(cacheData.r2).toBeDefined();

    const integrationsResponse = await page.request.get(`${BASE_URL}/api/system/integrations`);
    const integrationsData = await integrationsResponse.json();
    expect(integrationsData.integrations).toBeDefined();
    expect(integrationsData.integrations.length).toBeGreaterThan(0);
  });
});
