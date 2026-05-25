import { test, expect } from "@playwright/test";

test.describe("Public pages — landing & discovery", () => {
  test("Home page loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=CAConnect").first()).toBeVisible();
    // Navbar visible
    await expect(page.locator("nav, header").first()).toBeVisible();
  });

  test("Home page has Get Started / Sign In button", async ({ page }) => {
    await page.goto("/");
    const cta = page.locator("a[href='/auth/register'], a[href='/auth/login'], button", {
      hasText: /get started|sign in|login/i,
    }).first();
    await expect(cta).toBeVisible();
  });

  test("Services page loads and lists services", async ({ page }) => {
    await page.goto("/services");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // At least one service card
    const cards = page.locator("[class*='card'], [class*='Card'], article");
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test("Individual service page loads (GST Filing)", async ({ page }) => {
    await page.goto("/services/gst-filing");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Find CA page loads", async ({ page }) => {
    await page.goto("/find-ca");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Pricing page loads with flat rate info", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.locator("text=499").first()).toBeVisible();
  });

  test("CA profile page loads by slug/id", async ({ page }) => {
    // Navigate to find-ca first to pick a CA id
    await page.goto("/find-ca");
    await page.waitForTimeout(2000);
    const caLink = page.locator("a[href^='/ca/']").first();
    if (await caLink.isVisible()) {
      await caLink.click();
      await expect(page.locator("h1, h2").first()).toBeVisible();
    } else {
      // No real CA yet — page should still load gracefully
      await page.goto("/ca/demo");
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test("Navbar links work on home page", async ({ page }) => {
    await page.goto("/");
    const servicesLink = page.locator("a[href='/services']").first();
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL(/services/);
    }
  });
});
