import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Carriers List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to carriers page", async ({ page }) => {
    await page.goto("/admin/softswitch/carriers");
    
    await expect(page.locator("h1, h2").filter({ hasText: /carrier/i })).toBeVisible({ timeout: 10000 });
  });

  test("should display carriers data table", async ({ page }) => {
    await page.goto("/admin/softswitch/carriers");
    
    await expect(page.locator("table, [role='table']")).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on carriers page", async ({ page }) => {
    await page.goto("/admin/softswitch/carriers");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Rate Plans List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to rate plans page", async ({ page }) => {
    await page.goto("/admin/softswitch/rating-plans");
    
    await expect(page.locator("h1, h2").filter({ hasText: /rate|rating|plan/i })).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on rate plans page", async ({ page }) => {
    await page.goto("/admin/softswitch/rating-plans");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
