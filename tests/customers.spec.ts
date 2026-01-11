import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Customers Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to customers page", async ({ page }) => {
    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /customer/i })).toBeVisible({ timeout: 10000 });
  });

  test("should display customers data table or empty state", async ({ page }) => {
    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");
    
    const tableOrEmpty = page.locator("table, [role='table'], [data-testid*='empty'], .empty-state, tbody");
    await expect(tableOrEmpty.first()).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on customers page", async ({ page }) => {
    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Customers Categories", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to categories page", async ({ page }) => {
    await page.goto("/admin/customers/categories");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2, h3").filter({ hasText: /categor/i })).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on categories page", async ({ page }) => {
    await page.goto("/admin/customers/categories");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
