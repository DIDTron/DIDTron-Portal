import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Interconnects List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to interconnects page", async ({ page }) => {
    await page.goto("/admin/softswitch/interconnects");
    
    await expect(page.locator("h1, h2, h3").filter({ hasText: /interconnect/i })).toBeVisible({ timeout: 10000 });
  });

  test("should display interconnects data table or empty state", async ({ page }) => {
    await page.goto("/admin/softswitch/interconnects");
    await page.waitForLoadState("networkidle");
    
    const tableOrEmpty = page.locator("table, [role='table'], [data-testid*='empty'], .empty-state");
    await expect(tableOrEmpty.first()).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on interconnects page", async ({ page }) => {
    await page.goto("/admin/softswitch/interconnects");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Interconnect Detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should handle non-existent interconnect gracefully", async ({ page }) => {
    await page.goto("/admin/softswitch/interconnects/999999");
    await page.waitForLoadState("networkidle");
    
    const errorOrRedirect = page.locator("[data-testid*='error'], [data-testid*='not-found'], .error, h1, h2");
    await expect(errorOrRedirect.first()).toBeVisible({ timeout: 10000 });
  });
});
