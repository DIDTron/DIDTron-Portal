import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Billing Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to currencies page", async ({ page }) => {
    await page.goto("/admin/billing/currencies");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /currenc/i })).toBeVisible({ timeout: 10000 });
  });

  test("should display currencies table or list", async ({ page }) => {
    await page.goto("/admin/billing/currencies");
    await page.waitForLoadState("networkidle");
    
    const tableOrList = page.locator("table, [role='table'], tbody, [data-testid*='currency']");
    await expect(tableOrList.first()).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on currencies page", async ({ page }) => {
    await page.goto("/admin/billing/currencies");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Billing Terms", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to billing terms page", async ({ page }) => {
    await page.goto("/admin/billing/billing-terms");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /billing|term/i })).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on billing terms page", async ({ page }) => {
    await page.goto("/admin/billing/billing-terms");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
