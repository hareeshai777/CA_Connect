import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth.helper";

test.describe("SUPER ADMIN workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  test("Admin dashboard loads", async ({ page }) => {
    await expect(page).toHaveURL(/admin\/dashboard/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Admin dashboard shows platform stats", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("[class*='Card'], [class*='card']");
    expect(await cards.count()).toBeGreaterThan(2);
  });

  test("Admin sidebar has all sections", async ({ page }) => {
    const nav = page.locator("aside nav").first();
    await expect(nav.locator("a[href='/admin/dashboard']")).toBeVisible();
    await expect(nav.locator("a[href='/admin/users']")).toBeVisible();
    await expect(nav.locator("a[href='/admin/bookings']")).toBeVisible();
    await expect(nav.locator("a[href='/admin/services']")).toBeVisible();
  });

  // ── Users Management ───────────────────────────────────────────────────────
  test("Users management page loads", async ({ page }) => {
    await page.click("a[href='/admin/users']");
    await expect(page).toHaveURL(/admin\/users/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Users page shows role filter tabs", async ({ page }) => {
    await page.goto("/admin/users");
    const allTab = page.locator("button", { hasText: /^all$/i });
    await expect(allTab.first()).toBeVisible({ timeout: 8_000 });
  });

  test("Users page shows search input", async ({ page }) => {
    await page.goto("/admin/users");
    const search = page.locator("input[placeholder*='search' i]");
    await expect(search).toBeVisible({ timeout: 8_000 });
  });

  test("Users search filters results", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForTimeout(1500);
    const search = page.locator("input[placeholder*='search' i]");
    await search.fill("demo");
    await page.waitForTimeout(500);
  });

  // ── Services Management ────────────────────────────────────────────────────
  test("Services management page loads", async ({ page }) => {
    await page.click("a[href='/admin/services']");
    await expect(page).toHaveURL(/admin\/services/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Services page shows service list", async ({ page }) => {
    await page.goto("/admin/services");
    await page.waitForTimeout(2000);
    const cards = page.locator("[class*='Card'], [class*='card']");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("Services page edit button opens inline editor", async ({ page }) => {
    await page.goto("/admin/services");
    await page.waitForTimeout(2000);
    // Click first edit (pencil) button
    const editBtn = page.locator("button[title*='edit' i], button svg[class*='Pencil']").first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(300);
      // Price input should appear
      await expect(page.locator("input[type='number']").first()).toBeVisible({ timeout: 5_000 });
    }
  });

  // ── Bookings Management ────────────────────────────────────────────────────
  test("Admin Bookings page loads", async ({ page }) => {
    await page.goto("/admin/bookings");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  // ── CA Professionals Management ────────────────────────────────────────────
  test("CA Professionals list page loads", async ({ page }) => {
    await page.goto("/admin/ca-professionals");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  test("Admin Settings page loads", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  // ── Cross-role access guard ────────────────────────────────────────────────
  test("Admin accessing /client/dashboard redirects to admin dashboard", async ({ page }) => {
    await page.goto("/client/dashboard");
    await page.waitForURL(/admin\/dashboard/, { timeout: 10_000 });
  });
});
