import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should display dashboard with key metrics", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("[data-testid='card-total-customers'], .card, [class*='card']").first()).toBeVisible({ timeout: 10000 });
  });

  test("should have working navigation sidebar", async ({ page }) => {
    await page.goto("/admin/dashboard");
    
    const sidebar = page.locator("[data-sidebar], nav, aside").first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test("should display recent activity or quick stats", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");
    
    const contentArea = page.locator("main, [role='main'], .content").first();
    await expect(contentArea).toBeVisible({ timeout: 5000 });
  });

  test("should pass accessibility scan", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude("[data-chart]")
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
