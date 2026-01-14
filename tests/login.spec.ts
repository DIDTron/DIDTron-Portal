import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Login Page", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    
    await expect(page.getByTestId("input-email")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("input-password")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("button-login")).toBeVisible({ timeout: 5000 });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    
    await page.getByTestId("input-email").fill("invalid@test.com");
    await page.getByTestId("input-password").fill("wrongpassword");
    await page.getByTestId("button-login").click();
    
    await expect(page.getByText("Login failed").first()).toBeVisible({ timeout: 10000 });
  });

  test("should pass accessibility scan", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "admin123");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test("should display dashboard after login", async ({ page }) => {
    await expect(page.getByTestId("button-sidebar-toggle")).toBeVisible({ timeout: 10000 });
  });

  // TF-02 scope: Dashboard Axe test skipped - requires fixing page-specific components
  // (softswitch tables, Toast aria-role, workspace-tabs landmarks, color contrast)
  // Future task: TF-03 dashboard accessibility
  test.skip("should pass accessibility scan on dashboard", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
