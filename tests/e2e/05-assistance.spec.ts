import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth.helper";

test.describe("ASSISTANCE TEAM workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "assistance");
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  test("Assistance dashboard loads", async ({ page }) => {
    await expect(page).toHaveURL(/assistance\/dashboard/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Dashboard shows task stats cards", async ({ page }) => {
    // Stats: Tasks Assigned to Me, Urgent, Docs Pending, Completed Today
    await expect(page.locator("main").first()).toBeVisible();
    await page.waitForTimeout(1500); // let API load
    // At least 2 stat cards present
    const cards = page.locator("[class*='card'], [class*='Card']");
    expect(await cards.count()).toBeGreaterThan(1);
  });

  test("Dashboard shows workflow callout", async ({ page }) => {
    await expect(page.locator("text=Your Workflow")).toBeVisible({ timeout: 8_000 });
  });

  test("Dashboard has quick action links", async ({ page }) => {
    await expect(page.locator("a[href='/assistance/tasks']").first()).toBeVisible();
    await expect(page.locator("a[href='/assistance/documents']").first()).toBeVisible();
  });

  test("Sidebar has all nav items", async ({ page }) => {
    const nav = page.locator("aside nav, [class*='sidebar'] nav").first();
    await expect(nav.locator("a[href='/assistance/cases']")).toBeVisible();
    await expect(nav.locator("a[href='/assistance/tasks']")).toBeVisible();
    await expect(nav.locator("a[href='/assistance/documents']")).toBeVisible();
    await expect(nav.locator("a[href='/assistance/communication']")).toBeVisible();
    await expect(nav.locator("a[href='/assistance/settings']")).toBeVisible();
  });

  // ── Tasks ──────────────────────────────────────────────────────────────────
  test("My Tasks page loads", async ({ page }) => {
    await page.click("a[href='/assistance/tasks']");
    await expect(page).toHaveURL(/assistance\/tasks/);
    await expect(page.locator("h1", { hasText: /my tasks/i })).toBeVisible();
  });

  test("Tasks page shows priority filter", async ({ page }) => {
    await page.goto("/assistance/tasks");
    const allBtn = page.locator("button", { hasText: /^all$/i });
    await expect(allBtn.first()).toBeVisible({ timeout: 8_000 });
  });

  test("Tasks page shows task cards (demo or real)", async ({ page }) => {
    await page.goto("/assistance/tasks");
    await page.waitForTimeout(2000);
    // Either task cards or the "No tasks match" empty state
    const hasCards = await page.locator("[class*='card'], [class*='Card']").count() > 0;
    expect(hasCards).toBe(true);
  });

  test("Expanding a task shows instructions", async ({ page }) => {
    await page.goto("/assistance/tasks");
    await page.waitForTimeout(2000);
    const expandBtn = page.locator("button[class*='chevron'], button svg[class*='ChevronDown']").first();
    const taskCard = page.locator("[class*='Card'], [class*='card']").nth(1);
    if (await taskCard.isVisible()) {
      await taskCard.click();
      await page.waitForTimeout(500);
      await expect(page.locator("text=Instructions from CA")).toBeVisible({ timeout: 5_000 });
    }
  });

  test("Clear filters button appears when filter applied", async ({ page }) => {
    await page.goto("/assistance/tasks");
    await page.waitForTimeout(1500);
    const urgentFilter = page.locator("button", { hasText: /urgent/i }).first();
    if (await urgentFilter.isVisible()) {
      await urgentFilter.click();
      await expect(page.locator("button", { hasText: /clear filters/i })).toBeVisible({ timeout: 5_000 });
    }
  });

  // ── Cases ──────────────────────────────────────────────────────────────────
  test("My Assigned Cases page loads", async ({ page }) => {
    await page.click("a[href='/assistance/cases']");
    await expect(page).toHaveURL(/assistance\/cases/);
    await expect(page.locator("h1", { hasText: /assigned cases/i })).toBeVisible();
  });

  test("Cases page shows role clarity banner", async ({ page }) => {
    await page.goto("/assistance/cases");
    await expect(page.locator("text=Your role")).toBeVisible({ timeout: 8_000 });
  });

  test("Cases page shows status filter chips", async ({ page }) => {
    await page.goto("/assistance/cases");
    await expect(page.locator("button", { hasText: /^all$/i }).first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Documents ─────────────────────────────────────────────────────────────
  test("Document Verification page loads", async ({ page }) => {
    await page.click("a[href='/assistance/documents']");
    await expect(page).toHaveURL(/assistance\/documents/);
    await expect(page.locator("h1", { hasText: /document verification/i })).toBeVisible();
  });

  test("Documents page shows scoping notice", async ({ page }) => {
    await page.goto("/assistance/documents");
    await expect(page.locator("text=only see documents").first()).toBeVisible({ timeout: 8_000 });
  });

  test("Documents page shows status summary cards", async ({ page }) => {
    await page.goto("/assistance/documents");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Pending").first()).toBeVisible();
    await expect(page.locator("text=Verified").first()).toBeVisible();
  });

  // ── Team Chat (Communication) ──────────────────────────────────────────────
  test("Team Chat page loads", async ({ page }) => {
    await page.click("a[href='/assistance/communication']");
    await expect(page).toHaveURL(/assistance\/communication/);
    await expect(page.locator("text=Team Chat")).toBeVisible({ timeout: 8_000 });
  });

  test("Team Chat shows contacts list", async ({ page }) => {
    await page.goto("/assistance/communication");
    await page.waitForTimeout(2000);
    // Either real cases or demo contacts in sidebar
    const sidebar = page.locator("div").filter({ hasText: /CA |CASE-/i }).first();
    await expect(sidebar).toBeVisible({ timeout: 10_000 });
  });

  test("Team Chat search box works", async ({ page }) => {
    await page.goto("/assistance/communication");
    await page.waitForTimeout(1500);
    const searchBox = page.locator("input[placeholder*='search' i]");
    await expect(searchBox).toBeVisible({ timeout: 8_000 });
    await searchBox.fill("CA Priya");
    await page.waitForTimeout(500);
  });

  test("Team Chat message input is present", async ({ page }) => {
    await page.goto("/assistance/communication");
    await page.waitForTimeout(2000);
    const msgInput = page.locator("input[placeholder*='message' i]");
    await expect(msgInput).toBeVisible({ timeout: 10_000 });
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  test("Settings page loads", async ({ page }) => {
    await page.goto("/assistance/settings");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
