# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> Authentication — all roles >> Register page loads correctly
- Location: tests/e2e/01-auth.spec.ts:13:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[type=\'password\']')
Expected: visible
Error: strict mode violation: locator('input[type=\'password\']') resolved to 2 elements:
    1) <input type="password" name="password" placeholder="Min 8 chars, 1 uppercase, 1 number" class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 h-11"/> aka getByRole('textbox', { name: 'Min 8 chars, 1 uppercase, 1' })
    2) <input type="password" name="confirmPassword" placeholder="Repeat your password" class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-11"/> aka getByRole('textbox', { name: 'Repeat your password' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[type=\'password\']')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - link "CAConnect" [ref=e9] [cursor=pointer]:
        - /url: /
        - img [ref=e11]
        - generic [ref=e14]: CAConnect
      - generic [ref=e15]:
        - heading "India's Most Trusted CA Platform" [level=1] [ref=e16]:
          - text: India's Most Trusted
          - text: CA Platform
        - paragraph [ref=e17]: Connect with verified Chartered Accountants for all your financial and compliance needs.
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: 500+
            - generic [ref=e21]: Verified CAs
          - generic [ref=e22]:
            - generic [ref=e23]: 10,000+
            - generic [ref=e24]: Happy Clients
          - generic [ref=e25]:
            - generic [ref=e26]: ₹50Cr+
            - generic [ref=e27]: Tax Saved
          - generic [ref=e28]:
            - generic [ref=e29]: 4.9★
            - generic [ref=e30]: Avg Rating
      - generic [ref=e31]: © 2026 CAConnect Platform. All rights reserved.
    - generic [ref=e34]:
      - generic [ref=e35]:
        - heading "Create your account" [level=1] [ref=e36]
        - paragraph [ref=e37]: Join CA Pro and connect with expert CAs
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - text: First Name
            - generic [ref=e41]:
              - img [ref=e42]
              - textbox "Rahul" [ref=e45]
          - generic [ref=e46]:
            - text: Last Name
            - textbox "Sharma" [ref=e47]
        - generic [ref=e48]:
          - text: Email address
          - generic [ref=e49]:
            - img [ref=e50]
            - textbox "you@example.com" [ref=e53]
        - generic [ref=e54]:
          - text: Phone (optional)
          - generic [ref=e55]:
            - img [ref=e56]
            - textbox "+91 98765 43210" [ref=e58]
        - generic [ref=e59]:
          - text: Password
          - generic [ref=e60]:
            - img [ref=e61]
            - textbox "Min 8 chars, 1 uppercase, 1 number" [ref=e64]
            - button [ref=e65] [cursor=pointer]:
              - img [ref=e66]
        - generic [ref=e69]:
          - text: Confirm Password
          - textbox "Repeat your password" [ref=e70]
        - paragraph [ref=e71]:
          - text: By registering, you agree to our
          - link "Terms of Service" [ref=e72] [cursor=pointer]:
            - /url: /terms
          - text: and
          - link "Privacy Policy" [ref=e73] [cursor=pointer]:
            - /url: /privacy
          - text: .
        - button "Create Account" [ref=e74] [cursor=pointer]
      - paragraph [ref=e75]:
        - text: Already have an account?
        - link "Sign in" [ref=e76] [cursor=pointer]:
          - /url: /auth/login
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e82] [cursor=pointer]:
    - img [ref=e83]
  - alert [ref=e86]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAs, logout } from "../helpers/auth.helper";
  3  | import { USERS } from "../helpers/constants";
  4  | 
  5  | test.describe("Authentication — all roles", () => {
  6  |   test("Login page loads correctly", async ({ page }) => {
  7  |     await page.goto("/auth/login");
  8  |     await expect(page.locator("input[type='email']")).toBeVisible();
  9  |     await expect(page.locator("input[type='password']")).toBeVisible();
  10 |     await expect(page.locator("button[type='submit']")).toBeVisible();
  11 |   });
  12 | 
  13 |   test("Register page loads correctly", async ({ page }) => {
  14 |     await page.goto("/auth/register");
  15 |     await expect(page.locator("input[type='email']")).toBeVisible();
> 16 |     await expect(page.locator("input[type='password']")).toBeVisible();
     |                                                          ^ Error: expect(locator).toBeVisible() failed
  17 |   });
  18 | 
  19 |   test("Forgot password page loads", async ({ page }) => {
  20 |     await page.goto("/auth/forgot-password");
  21 |     await expect(page.locator("input[type='email']")).toBeVisible();
  22 |   });
  23 | 
  24 |   test("Invalid credentials shows error", async ({ page }) => {
  25 |     await page.goto("/auth/login");
  26 |     await page.fill("input[type='email']", "wrong@email.com");
  27 |     await page.fill("input[type='password']", "wrongpassword");
  28 |     await page.click("button[type='submit']");
  29 |     // Should not navigate away and should show error
  30 |     await expect(page).toHaveURL(/auth\/login/);
  31 |   });
  32 | 
  33 |   test("CLIENT login → client dashboard → logout", async ({ page }) => {
  34 |     await loginAs(page, "client");
  35 |     await expect(page).toHaveURL(/client\/dashboard/);
  36 |     await expect(page.locator("text=Dashboard").first()).toBeVisible();
  37 |     await logout(page);
  38 |     await expect(page).toHaveURL("/");
  39 |   });
  40 | 
  41 |   test("CA PROFESSIONAL login → CA dashboard → logout", async ({ page }) => {
  42 |     await loginAs(page, "ca");
  43 |     await expect(page).toHaveURL(/ca\/dashboard/);
  44 |     await logout(page);
  45 |     await expect(page).toHaveURL("/");
  46 |   });
  47 | 
  48 |   test("ASSISTANCE TEAM login → assistance dashboard → logout", async ({ page }) => {
  49 |     await loginAs(page, "assistance");
  50 |     await expect(page).toHaveURL(/assistance\/dashboard/);
  51 |     await logout(page);
  52 |     await expect(page).toHaveURL("/");
  53 |   });
  54 | 
  55 |   test("SUPER ADMIN login → admin dashboard → logout", async ({ page }) => {
  56 |     await loginAs(page, "admin");
  57 |     await expect(page).toHaveURL(/admin\/dashboard/);
  58 |     await logout(page);
  59 |     await expect(page).toHaveURL("/");
  60 |   });
  61 | 
  62 |   test("Unauthenticated access to /client/dashboard redirects to login", async ({ page }) => {
  63 |     await page.goto("/client/dashboard");
  64 |     await page.waitForURL(/auth\/login/, { timeout: 10_000 });
  65 |   });
  66 | 
  67 |   test("Unauthenticated access to /ca/dashboard redirects to login", async ({ page }) => {
  68 |     await page.goto("/ca/dashboard");
  69 |     await page.waitForURL(/auth\/login/, { timeout: 10_000 });
  70 |   });
  71 | 
  72 |   test("CA user accessing /client/dashboard redirects to CA dashboard", async ({ page }) => {
  73 |     await loginAs(page, "ca");
  74 |     await page.goto("/client/dashboard");
  75 |     await page.waitForURL(/ca\/dashboard/, { timeout: 10_000 });
  76 |   });
  77 | });
  78 | 
```