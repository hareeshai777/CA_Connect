# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-admin.spec.ts >> SUPER ADMIN workflow >> Admin Bookings page loads
- Location: tests/e2e/06-admin.spec.ts:84:7

# Error details

```
TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
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
        - heading "Welcome back" [level=1] [ref=e36]
        - paragraph [ref=e37]: Sign in to your CA Pro account
      - button "Continue with Google" [ref=e38] [cursor=pointer]:
        - img [ref=e39]
        - text: Continue with Google
      - generic [ref=e48]: Or continue with email
      - generic [ref=e49]:
        - generic [ref=e50]:
          - text: Email address
          - generic [ref=e51]:
            - img [ref=e52]
            - textbox "you@example.com" [ref=e55]: admin@casaas.com
        - generic [ref=e56]:
          - generic [ref=e57]:
            - generic [ref=e58]: Password
            - link "Forgot password?" [ref=e59] [cursor=pointer]:
              - /url: /auth/forgot-password
          - generic [ref=e60]:
            - img [ref=e61]
            - textbox "••••••••" [ref=e64]: Admin@123456
            - button [ref=e65] [cursor=pointer]:
              - img [ref=e66]
        - button "Sign In" [ref=e69] [cursor=pointer]
      - paragraph [ref=e70]:
        - text: Don't have an account?
        - link "Create account" [ref=e71] [cursor=pointer]:
          - /url: /auth/register
      - paragraph [ref=e72]:
        - text: Are you a CA professional?
        - link "Register here" [ref=e73] [cursor=pointer]:
          - /url: /ca/register
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e79] [cursor=pointer]:
    - img [ref=e80]
  - alert [ref=e83]
```

# Test source

```ts
  1  | import { Page, expect } from "@playwright/test";
  2  | import { USERS, Role } from "./constants";
  3  | 
  4  | export async function loginAs(page: Page, role: Role) {
  5  |   const { email, password } = USERS[role];
  6  |   await page.goto("/auth/login");
  7  |   await expect(page.locator("input[type='email']")).toBeVisible({ timeout: 10_000 });
  8  |   await page.fill("input[type='email']", email);
  9  |   await page.fill("input[type='password']", password);
  10 |   await page.click("button[type='submit']");
  11 |   // Wait for navigation away from login page
> 12 |   await page.waitForFunction(
     |              ^ TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
  13 |     () => !window.location.pathname.includes("/auth/login"),
  14 |     { timeout: 25_000 }
  15 |   );
  16 |   // Give Next.js router + zustand rehydration a moment
  17 |   await page.waitForTimeout(1000);
  18 |   // Confirm we landed on the right dashboard (or at least not on login)
  19 |   await expect(page).not.toHaveURL(/auth\/login/);
  20 | }
  21 | 
  22 | export async function logout(page: Page) {
  23 |   const logoutBtn = page.locator("button", { hasText: "Log out" }).first();
  24 |   await expect(logoutBtn).toBeVisible({ timeout: 5_000 });
  25 |   await logoutBtn.click();
  26 |   await page.waitForURL("**/", { timeout: 10_000 });
  27 | }
  28 | 
```