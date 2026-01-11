import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Softswitch Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should navigate to carriers page", async ({ page }) => {
    await page.goto("/admin/softswitch/carriers");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /carrier/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to routing plans page", async ({ page }) => {
    await page.goto("/admin/softswitch/routing-plans");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /routing|plan/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to rating plans page", async ({ page }) => {
    await page.goto("/admin/softswitch/rating-plans");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /rating|plan/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to services page", async ({ page }) => {
    await page.goto("/admin/softswitch/services");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("h1, h2").filter({ hasText: /service/i })).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan on carriers page", async ({ page }) => {
    await page.goto("/admin/softswitch/carriers");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should pass accessibility scan on routing plans page", async ({ page }) => {
    await page.goto("/admin/softswitch/routing-plans");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should pass accessibility scan on services page", async ({ page }) => {
    await page.goto("/admin/softswitch/services");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
