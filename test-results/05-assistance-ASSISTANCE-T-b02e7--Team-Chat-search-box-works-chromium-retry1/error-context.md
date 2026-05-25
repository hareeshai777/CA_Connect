# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-assistance.spec.ts >> ASSISTANCE TEAM workflow >> Team Chat search box works
- Location: tests/e2e/05-assistance.spec.ts:136:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[placeholder*=\'search\' i]')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('input[placeholder*=\'search\' i]')

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
  40  |   });
  41  | 
  42  |   // ── Tasks ──────────────────────────────────────────────────────────────────
  43  |   test("My Tasks page loads", async ({ page }) => {
  44  |     await page.click("a[href='/assistance/tasks']");
  45  |     await expect(page).toHaveURL(/assistance\/tasks/);
  46  |     await expect(page.locator("h1", { hasText: /my tasks/i })).toBeVisible();
  47  |   });
  48  | 
  49  |   test("Tasks page shows priority filter", async ({ page }) => {
  50  |     await page.goto("/assistance/tasks");
  51  |     const allBtn = page.locator("button", { hasText: /^all$/i });
  52  |     await expect(allBtn.first()).toBeVisible({ timeout: 8_000 });
  53  |   });
  54  | 
  55  |   test("Tasks page shows task cards (demo or real)", async ({ page }) => {
  56  |     await page.goto("/assistance/tasks");
  57  |     await page.waitForTimeout(2000);
  58  |     // Either task cards or the "No tasks match" empty state
  59  |     const hasCards = await page.locator("[class*='card'], [class*='Card']").count() > 0;
  60  |     expect(hasCards).toBe(true);
  61  |   });
  62  | 
  63  |   test("Expanding a task shows instructions", async ({ page }) => {
  64  |     await page.goto("/assistance/tasks");
  65  |     await page.waitForTimeout(2000);
  66  |     const expandBtn = page.locator("button[class*='chevron'], button svg[class*='ChevronDown']").first();
  67  |     const taskCard = page.locator("[class*='Card'], [class*='card']").nth(1);
  68  |     if (await taskCard.isVisible()) {
  69  |       await taskCard.click();
  70  |       await page.waitForTimeout(500);
  71  |       await expect(page.locator("text=Instructions from CA")).toBeVisible({ timeout: 5_000 });
  72  |     }
  73  |   });
  74  | 
  75  |   test("Clear filters button appears when filter applied", async ({ page }) => {
  76  |     await page.goto("/assistance/tasks");
  77  |     await page.waitForTimeout(1500);
  78  |     const urgentFilter = page.locator("button", { hasText: /urgent/i }).first();
  79  |     if (await urgentFilter.isVisible()) {
  80  |       await urgentFilter.click();
  81  |       await expect(page.locator("button", { hasText: /clear filters/i })).toBeVisible({ timeout: 5_000 });
  82  |     }
  83  |   });
  84  | 
  85  |   // ── Cases ──────────────────────────────────────────────────────────────────
  86  |   test("My Assigned Cases page loads", async ({ page }) => {
  87  |     await page.click("a[href='/assistance/cases']");
  88  |     await expect(page).toHaveURL(/assistance\/cases/);
  89  |     await expect(page.locator("h1", { hasText: /assigned cases/i })).toBeVisible();
  90  |   });
  91  | 
  92  |   test("Cases page shows role clarity banner", async ({ page }) => {
  93  |     await page.goto("/assistance/cases");
  94  |     await expect(page.locator("text=Your role")).toBeVisible({ timeout: 8_000 });
  95  |   });
  96  | 
  97  |   test("Cases page shows status filter chips", async ({ page }) => {
  98  |     await page.goto("/assistance/cases");
  99  |     await expect(page.locator("button", { hasText: /^all$/i }).first()).toBeVisible({ timeout: 8_000 });
  100 |   });
  101 | 
  102 |   // ── Documents ─────────────────────────────────────────────────────────────
  103 |   test("Document Verification page loads", async ({ page }) => {
  104 |     await page.click("a[href='/assistance/documents']");
  105 |     await expect(page).toHaveURL(/assistance\/documents/);
  106 |     await expect(page.locator("h1", { hasText: /document verification/i })).toBeVisible();
  107 |   });
  108 | 
  109 |   test("Documents page shows scoping notice", async ({ page }) => {
  110 |     await page.goto("/assistance/documents");
  111 |     await expect(page.locator("text=only see documents").first()).toBeVisible({ timeout: 8_000 });
  112 |   });
  113 | 
  114 |   test("Documents page shows status summary cards", async ({ page }) => {
  115 |     await page.goto("/assistance/documents");
  116 |     await page.waitForTimeout(2000);
  117 |     await expect(page.locator("text=Pending").first()).toBeVisible();
  118 |     await expect(page.locator("text=Verified").first()).toBeVisible();
  119 |   });
  120 | 
  121 |   // ── Team Chat (Communication) ──────────────────────────────────────────────
  122 |   test("Team Chat page loads", async ({ page }) => {
  123 |     await page.click("a[href='/assistance/communication']");
  124 |     await expect(page).toHaveURL(/assistance\/communication/);
  125 |     await expect(page.locator("text=Team Chat")).toBeVisible({ timeout: 8_000 });
  126 |   });
  127 | 
  128 |   test("Team Chat shows contacts list", async ({ page }) => {
  129 |     await page.goto("/assistance/communication");
  130 |     await page.waitForTimeout(2000);
  131 |     // Either real cases or demo contacts in sidebar
  132 |     const sidebar = page.locator("div").filter({ hasText: /CA |CASE-/i }).first();
  133 |     await expect(sidebar).toBeVisible({ timeout: 10_000 });
  134 |   });
  135 | 
  136 |   test("Team Chat search box works", async ({ page }) => {
  137 |     await page.goto("/assistance/communication");
  138 |     await page.waitForTimeout(1500);
  139 |     const searchBox = page.locator("input[placeholder*='search' i]");
> 140 |     await expect(searchBox).toBeVisible({ timeout: 8_000 });
      |                             ^ Error: expect(locator).toBeVisible() failed
  141 |     await searchBox.fill("CA Priya");
  142 |     await page.waitForTimeout(500);
  143 |   });
  144 | 
  145 |   test("Team Chat message input is present", async ({ page }) => {
  146 |     await page.goto("/assistance/communication");
  147 |     await page.waitForTimeout(2000);
  148 |     const msgInput = page.locator("input[placeholder*='message' i]");
  149 |     await expect(msgInput).toBeVisible({ timeout: 10_000 });
  150 |   });
  151 | 
  152 |   // ── Settings ───────────────────────────────────────────────────────────────
  153 |   test("Settings page loads", async ({ page }) => {
  154 |     await page.goto("/assistance/settings");
  155 |     await expect(page.locator("h1").first()).toBeVisible();
  156 |   });
  157 | });
  158 | 
```