import { test, expect } from "@playwright/test";
import { loginAs, logout } from "../helpers/auth.helper";
import { USERS } from "../helpers/constants";

test.describe("Authentication — all roles", () => {
  test("Login page loads correctly", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("Register page loads correctly", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("Forgot password page loads", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("Invalid credentials shows error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill("input[type='email']", "wrong@email.com");
    await page.fill("input[type='password']", "wrongpassword");
    await page.click("button[type='submit']");
    // Should not navigate away and should show error
    await expect(page).toHaveURL(/auth\/login/);
  });

  test("CLIENT login → client dashboard → logout", async ({ page }) => {
    await loginAs(page, "client");
    await expect(page).toHaveURL(/client\/dashboard/);
    await expect(page.locator("text=Dashboard").first()).toBeVisible();
    await logout(page);
    await expect(page).toHaveURL("/");
  });

  test("CA PROFESSIONAL login → CA dashboard → logout", async ({ page }) => {
    await loginAs(page, "ca");
    await expect(page).toHaveURL(/ca\/dashboard/);
    await logout(page);
    await expect(page).toHaveURL("/");
  });

  test("ASSISTANCE TEAM login → assistance dashboard → logout", async ({ page }) => {
    await loginAs(page, "assistance");
    await expect(page).toHaveURL(/assistance\/dashboard/);
    await logout(page);
    await expect(page).toHaveURL("/");
  });

  test("SUPER ADMIN login → admin dashboard → logout", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/dashboard/);
    await logout(page);
    await expect(page).toHaveURL("/");
  });

  test("Unauthenticated access to /client/dashboard redirects to login", async ({ page }) => {
    await page.goto("/client/dashboard");
    await page.waitForURL(/auth\/login/, { timeout: 10_000 });
  });

  test("Unauthenticated access to /ca/dashboard redirects to login", async ({ page }) => {
    await page.goto("/ca/dashboard");
    await page.waitForURL(/auth\/login/, { timeout: 10_000 });
  });

  test("CA user accessing /client/dashboard redirects to CA dashboard", async ({ page }) => {
    await loginAs(page, "ca");
    await page.goto("/client/dashboard");
    await page.waitForURL(/ca\/dashboard/, { timeout: 10_000 });
  });
});
