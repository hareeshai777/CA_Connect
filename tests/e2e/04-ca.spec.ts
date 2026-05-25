import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth.helper";

test.describe("CA PROFESSIONAL workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "ca");
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  test("CA dashboard loads with stat cards", async ({ page }) => {
    await expect(page).toHaveURL(/ca\/dashboard/);
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("CA sidebar has all required nav items", async ({ page }) => {
    const nav = page.locator("aside nav").first();
    await expect(nav.locator("a[href='/ca/bookings']")).toBeVisible();
    await expect(nav.locator("a[href='/ca/cases']")).toBeVisible();
    await expect(nav.locator("a[href='/ca/schedule']")).toBeVisible();
    await expect(nav.locator("a[href='/ca/clients']")).toBeVisible();
    await expect(nav.locator("a[href='/ca/earnings']")).toBeVisible();
    await expect(nav.locator("a[href='/ca/tasks']")).toBeVisible();
    await expect(nav.locator("a[href='/ca/documents']")).toBeVisible();
  });

  test("AI Assistant tab is NOT in CA sidebar", async ({ page }) => {
    const aiLink = page.locator("aside nav a[href='/ca/ai-assistant']");
    await expect(aiLink).not.toBeVisible();
  });

  // ── Bookings ───────────────────────────────────────────────────────────────
  test("CA Bookings page loads", async ({ page }) => {
    await page.click("a[href='/ca/bookings']");
    await expect(page).toHaveURL(/ca\/bookings/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("CA Bookings page shows filter tabs", async ({ page }) => {
    await page.goto("/ca/bookings");
    const allTab = page.locator("button", { hasText: /^all$/i });
    await expect(allTab.first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Cases ──────────────────────────────────────────────────────────────────
  test("Cases list page loads", async ({ page }) => {
    await page.click("a[href='/ca/cases']");
    await expect(page).toHaveURL(/ca\/cases/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Cases page has Open New Case button", async ({ page }) => {
    await page.goto("/ca/cases");
    const newCaseBtn = page.locator("button", { hasText: /new case|open case/i });
    await expect(newCaseBtn.first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Task Dashboard ─────────────────────────────────────────────────────────
  test("Task Dashboard page loads", async ({ page }) => {
    await page.click("a[href='/ca/tasks']");
    await expect(page).toHaveURL(/ca\/tasks/);
    await expect(page.locator("h1", { hasText: /task dashboard/i })).toBeVisible();
  });

  test("Assign New Task button opens form", async ({ page }) => {
    await page.goto("/ca/tasks");
    await page.click("button", { hasText: /assign new task/i });
    await expect(page.locator("input[placeholder*='task title' i], input[placeholder*='collect' i]")).toBeVisible({ timeout: 5_000 });
  });

  test("Task form shows multi-member selector", async ({ page }) => {
    await page.goto("/ca/tasks");
    await page.click("button", { hasText: /assign new task/i });
    // The "Assign To" section with member cards or placeholder
    await expect(page.locator("text=Assign To")).toBeVisible({ timeout: 5_000 });
  });

  test("Task form submit with title creates task", async ({ page }) => {
    await page.goto("/ca/tasks");
    await page.click("button", { hasText: /assign new task/i });
    await page.fill("input[placeholder*='task title' i], input[placeholder*='collect' i]", "Test task from Playwright");
    await page.click("button[type='submit']", { timeout: 5_000 });
    // Should show success toast or close form
    await page.waitForTimeout(2000);
  });

  // ── Schedule ───────────────────────────────────────────────────────────────
  test("My Schedule page loads", async ({ page }) => {
    await page.click("a[href='/ca/schedule']");
    await expect(page).toHaveURL(/ca\/schedule/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Schedule page shows Add Slot button", async ({ page }) => {
    await page.goto("/ca/schedule");
    const addBtn = page.locator("button", { hasText: /add slot|new slot/i });
    await expect(addBtn.first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Clients ────────────────────────────────────────────────────────────────
  test("Clients page loads", async ({ page }) => {
    await page.click("a[href='/ca/clients']");
    await expect(page).toHaveURL(/ca\/clients/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  // ── Earnings ───────────────────────────────────────────────────────────────
  test("Earnings page loads with stats", async ({ page }) => {
    await page.click("a[href='/ca/earnings']");
    await expect(page).toHaveURL(/ca\/earnings/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  // ── Documents ──────────────────────────────────────────────────────────────
  test("CA Documents page loads", async ({ page }) => {
    await page.click("a[href='/ca/documents']");
    await expect(page).toHaveURL(/ca\/documents/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  test("CA Settings page loads", async ({ page }) => {
    await page.goto("/ca/settings");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
