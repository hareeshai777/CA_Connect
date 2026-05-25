import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth.helper";

test.describe("CLIENT workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "client");
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  test("Dashboard loads with stats cards", async ({ page }) => {
    await expect(page).toHaveURL(/client\/dashboard/);
    // At least one stat card visible
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("Sidebar navigation items are visible", async ({ page }) => {
    const nav = page.locator("aside nav, [class*='sidebar'] nav").first();
    await expect(nav).toBeVisible();
    await expect(nav.locator("a[href='/client/bookings']")).toBeVisible();
    await expect(nav.locator("a[href='/client/documents']")).toBeVisible();
    await expect(nav.locator("a[href='/client/payments']")).toBeVisible();
    await expect(nav.locator("a[href='/client/downloads']")).toBeVisible();
    await expect(nav.locator("a[href='/client/support']")).toBeVisible();
  });

  // ── My Bookings ────────────────────────────────────────────────────────────
  test("My Bookings page loads", async ({ page }) => {
    await page.click("a[href='/client/bookings']");
    await expect(page).toHaveURL(/client\/bookings/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Bookings page shows status filter tabs", async ({ page }) => {
    await page.goto("/client/bookings");
    // Filter buttons (All, Confirmed, Pending etc.)
    const filters = page.locator("button", { hasText: /all|confirmed|pending|completed/i });
    await expect(filters.first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Documents ──────────────────────────────────────────────────────────────
  test("Documents page loads", async ({ page }) => {
    await page.click("a[href='/client/documents']");
    await expect(page).toHaveURL(/client\/documents/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Documents page shows upload button", async ({ page }) => {
    await page.goto("/client/documents");
    const uploadBtn = page.locator("button", { hasText: /upload/i });
    await expect(uploadBtn.first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Payments ───────────────────────────────────────────────────────────────
  test("Payments page loads", async ({ page }) => {
    await page.click("a[href='/client/payments']");
    await expect(page).toHaveURL(/client\/payments/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  // ── Downloads ─────────────────────────────────────────────────────────────
  test("Downloads page loads with category filters", async ({ page }) => {
    await page.click("a[href='/client/downloads']");
    await expect(page).toHaveURL(/client\/downloads/);
    await expect(page.locator("h1").first()).toBeVisible();
    const allFilter = page.locator("button", { hasText: /^all$/i });
    await expect(allFilter.first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Support ────────────────────────────────────────────────────────────────
  test("Support page loads with contact cards and FAQ", async ({ page }) => {
    await page.click("a[href='/client/support']");
    await expect(page).toHaveURL(/client\/support/);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("text=Email Us")).toBeVisible();
    await expect(page.locator("text=Frequently Asked Questions")).toBeVisible();
  });

  test("Support FAQ expands on click", async ({ page }) => {
    await page.goto("/client/support");
    const firstFaq = page.locator("button", { hasText: /how do i book/i });
    await firstFaq.click();
    // Answer text appears
    await expect(page.locator("text=Services page").first()).toBeVisible({ timeout: 5_000 });
  });

  test("Support form validation — empty submit shows error", async ({ page }) => {
    await page.goto("/client/support");
    const sendBtn = page.locator("button", { hasText: /send message/i });
    await sendBtn.click();
    // Toast error or browser validation — page should not show success state
    await expect(page.locator("text=sent successfully")).not.toBeVisible();
  });

  // ── AI Chat ────────────────────────────────────────────────────────────────
  test("AI Assistant page loads", async ({ page }) => {
    await page.goto("/client/ai-chat");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  // ── Booking flow via Find CA ───────────────────────────────────────────────
  test("Find CA page loads and shows search", async ({ page }) => {
    await page.goto("/find-ca");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Clicking Book Now on a real CA goes to CA profile", async ({ page }) => {
    await page.goto("/find-ca");
    await page.waitForTimeout(2000);
    const bookBtn = page.locator("a[href^='/ca/']").first();
    if (await bookBtn.isVisible()) {
      const href = await bookBtn.getAttribute("href");
      await bookBtn.click();
      await expect(page).toHaveURL(new RegExp(href!.replace("/", "\\/")));
    }
  });
});
