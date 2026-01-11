import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Login Page", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");
    
    await expect(page.getByTestId("input-email")).toBeVisible();
    await expect(page.getByTestId("input-password")).toBeVisible();
    await expect(page.getByTestId("button-login")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    
    await page.getByTestId("input-email").fill("invalid@test.com");
    await page.getByTestId("input-password").fill("wrongpassword");
    await page.getByTestId("button-login").click();
    
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 5000 });
  });

  test("should pass accessibility scan", async ({ page }) => {
    await page.goto("/login");
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "Admin@0903");
    await page.getByTestId("button-login").click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test("should display dashboard after login", async ({ page }) => {
    await expect(page.getByTestId("sidebar-trigger") || page.locator("[data-testid='button-sidebar-toggle']")).toBeVisible({ timeout: 5000 });
  });

  test("should pass accessibility scan on dashboard", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
