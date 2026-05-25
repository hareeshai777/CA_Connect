# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-ca.spec.ts >> CA PROFESSIONAL workflow >> Cases page has Open New Case button
- Location: tests/e2e/04-ca.spec.ts:51:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /new case|open case/i }).first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('button').filter({ hasText: /new case|open case/i }).first()

```

```yaml
- link "CAConnect":
  - /url: /
  - img
  - text: CAConnect
- heading "India's Most Trusted CA Platform" [level=1]
- paragraph: Connect with verified Chartered Accountants for all your financial and compliance needs.
- text: 500+ Verified CAs 10,000+ Happy Clients ₹50Cr+ Tax Saved 4.9★ Avg Rating © 2026 CAConnect Platform. All rights reserved.
- heading "Welcome back" [level=1]
- paragraph: Sign in to your CA Pro account
- button "Continue with Google":
  - img
  - text: Continue with Google
- text: Or continue with email Email address
- img
- textbox "you@example.com"
- text: Password
- link "Forgot password?":
  - /url: /auth/forgot-password
- img
- textbox "••••••••"
- button:
  - img
- button "Sign In"
- paragraph:
  - text: Don't have an account?
  - link "Create account":
    - /url: /auth/register
- paragraph:
  - text: Are you a CA professional?
  - link "Register here":
    - /url: /ca/register
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { loginAs } from "../helpers/auth.helper";
  3   | 
  4   | test.describe("CA PROFESSIONAL workflow", () => {
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await loginAs(page, "ca");
  7   |   });
  8   | 
  9   |   // ── Dashboard ─────────────────────────────────────────────────────────────
  10  |   test("CA dashboard loads with stat cards", async ({ page }) => {
  11  |     await expect(page).toHaveURL(/ca\/dashboard/);
  12  |     await expect(page.locator("main").first()).toBeVisible();
  13  |   });
  14  | 
  15  |   test("CA sidebar has all required nav items", async ({ page }) => {
  16  |     const nav = page.locator("aside nav").first();
  17  |     await expect(nav.locator("a[href='/ca/bookings']")).toBeVisible();
  18  |     await expect(nav.locator("a[href='/ca/cases']")).toBeVisible();
  19  |     await expect(nav.locator("a[href='/ca/schedule']")).toBeVisible();
  20  |     await expect(nav.locator("a[href='/ca/clients']")).toBeVisible();
  21  |     await expect(nav.locator("a[href='/ca/earnings']")).toBeVisible();
  22  |     await expect(nav.locator("a[href='/ca/tasks']")).toBeVisible();
  23  |     await expect(nav.locator("a[href='/ca/documents']")).toBeVisible();
  24  |   });
  25  | 
  26  |   test("AI Assistant tab is NOT in CA sidebar", async ({ page }) => {
  27  |     const aiLink = page.locator("aside nav a[href='/ca/ai-assistant']");
  28  |     await expect(aiLink).not.toBeVisible();
  29  |   });
  30  | 
  31  |   // ── Bookings ───────────────────────────────────────────────────────────────
  32  |   test("CA Bookings page loads", async ({ page }) => {
  33  |     await page.click("a[href='/ca/bookings']");
  34  |     await expect(page).toHaveURL(/ca\/bookings/);
  35  |     await expect(page.locator("h1").first()).toBeVisible();
  36  |   });
  37  | 
  38  |   test("CA Bookings page shows filter tabs", async ({ page }) => {
  39  |     await page.goto("/ca/bookings");
  40  |     const allTab = page.locator("button", { hasText: /^all$/i });
  41  |     await expect(allTab.first()).toBeVisible({ timeout: 8_000 });
  42  |   });
  43  | 
  44  |   // ── Cases ──────────────────────────────────────────────────────────────────
  45  |   test("Cases list page loads", async ({ page }) => {
  46  |     await page.click("a[href='/ca/cases']");
  47  |     await expect(page).toHaveURL(/ca\/cases/);
  48  |     await expect(page.locator("h1, h2").first()).toBeVisible();
  49  |   });
  50  | 
  51  |   test("Cases page has Open New Case button", async ({ page }) => {
  52  |     await page.goto("/ca/cases");
  53  |     const newCaseBtn = page.locator("button", { hasText: /new case|open case/i });
> 54  |     await expect(newCaseBtn.first()).toBeVisible({ timeout: 8_000 });
      |                                      ^ Error: expect(locator).toBeVisible() failed
  55  |   });
  56  | 
  57  |   // ── Task Dashboard ─────────────────────────────────────────────────────────
  58  |   test("Task Dashboard page loads", async ({ page }) => {
  59  |     await page.click("a[href='/ca/tasks']");
  60  |     await expect(page).toHaveURL(/ca\/tasks/);
  61  |     await expect(page.locator("h1", { hasText: /task dashboard/i })).toBeVisible();
  62  |   });
  63  | 
  64  |   test("Assign New Task button opens form", async ({ page }) => {
  65  |     await page.goto("/ca/tasks");
  66  |     await page.click("button", { hasText: /assign new task/i });
  67  |     await expect(page.locator("input[placeholder*='task title' i], input[placeholder*='collect' i]")).toBeVisible({ timeout: 5_000 });
  68  |   });
  69  | 
  70  |   test("Task form shows multi-member selector", async ({ page }) => {
  71  |     await page.goto("/ca/tasks");
  72  |     await page.click("button", { hasText: /assign new task/i });
  73  |     // The "Assign To" section with member cards or placeholder
  74  |     await expect(page.locator("text=Assign To")).toBeVisible({ timeout: 5_000 });
  75  |   });
  76  | 
  77  |   test("Task form submit with title creates task", async ({ page }) => {
  78  |     await page.goto("/ca/tasks");
  79  |     await page.click("button", { hasText: /assign new task/i });
  80  |     await page.fill("input[placeholder*='task title' i], input[placeholder*='collect' i]", "Test task from Playwright");
  81  |     await page.click("button[type='submit']", { timeout: 5_000 });
  82  |     // Should show success toast or close form
  83  |     await page.waitForTimeout(2000);
  84  |   });
  85  | 
  86  |   // ── Schedule ───────────────────────────────────────────────────────────────
  87  |   test("My Schedule page loads", async ({ page }) => {
  88  |     await page.click("a[href='/ca/schedule']");
  89  |     await expect(page).toHaveURL(/ca\/schedule/);
  90  |     await expect(page.locator("h1").first()).toBeVisible();
  91  |   });
  92  | 
  93  |   test("Schedule page shows Add Slot button", async ({ page }) => {
  94  |     await page.goto("/ca/schedule");
  95  |     const addBtn = page.locator("button", { hasText: /add slot|new slot/i });
  96  |     await expect(addBtn.first()).toBeVisible({ timeout: 8_000 });
  97  |   });
  98  | 
  99  |   // ── Clients ────────────────────────────────────────────────────────────────
  100 |   test("Clients page loads", async ({ page }) => {
  101 |     await page.click("a[href='/ca/clients']");
  102 |     await expect(page).toHaveURL(/ca\/clients/);
  103 |     await expect(page.locator("h1").first()).toBeVisible();
  104 |   });
  105 | 
  106 |   // ── Earnings ───────────────────────────────────────────────────────────────
  107 |   test("Earnings page loads with stats", async ({ page }) => {
  108 |     await page.click("a[href='/ca/earnings']");
  109 |     await expect(page).toHaveURL(/ca\/earnings/);
  110 |     await expect(page.locator("h1").first()).toBeVisible();
  111 |   });
  112 | 
  113 |   // ── Documents ──────────────────────────────────────────────────────────────
  114 |   test("CA Documents page loads", async ({ page }) => {
  115 |     await page.click("a[href='/ca/documents']");
  116 |     await expect(page).toHaveURL(/ca\/documents/);
  117 |     await expect(page.locator("h1").first()).toBeVisible();
  118 |   });
  119 | 
  120 |   // ── Settings ───────────────────────────────────────────────────────────────
  121 |   test("CA Settings page loads", async ({ page }) => {
  122 |     await page.goto("/ca/settings");
  123 |     await expect(page.locator("h1").first()).toBeVisible();
  124 |   });
  125 | });
  126 | 
```