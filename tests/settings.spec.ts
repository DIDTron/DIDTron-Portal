import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Settings Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to integrations settings", async ({ page }) => {
    await page.goto("/admin/settings/integrations");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /integration/i })).toBeVisible({ timeout: 10000 });
  });

  test("should display integration cards or list", async ({ page }) => {
    await page.goto("/admin/settings/integrations");
    await page.waitForLoadState("networkidle");
    
    const integrationElements = page.locator("[data-testid*='integration'], .card, [class*='card']");
    await expect(integrationElements.first()).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on integrations page", async ({ page }) => {
    await page.goto("/admin/settings/integrations");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Audit Logs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to audit logs page", async ({ page }) => {
    await page.goto("/admin/settings/audit-logs");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /audit|log/i })).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on audit logs page", async ({ page }) => {
    await page.goto("/admin/settings/audit-logs");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
