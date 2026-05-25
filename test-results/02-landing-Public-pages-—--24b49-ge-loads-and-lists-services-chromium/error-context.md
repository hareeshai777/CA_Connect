# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-landing.spec.ts >> Public pages — landing & discovery >> Services page loads and lists services
- Location: tests/e2e/02-landing.spec.ts:19:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*=\'card\'], [class*=\'Card\'], article').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[class*=\'card\'], [class*=\'Card\'], article').first()

```

```yaml
- navigation:
  - link "CAConnect":
    - /url: /
    - img
    - text: CAConnect
  - link "Home":
    - /url: /
  - link "Services":
    - /url: /services
  - link "About":
    - /url: /about
  - link "Pricing":
    - /url: /pricing
  - link "Contact":
    - /url: /contact
  - link "Sign in":
    - /url: /auth/login
  - link "Get Started":
    - /url: /auth/register
- main:
  - heading "All CA Services" [level=1]
  - paragraph: Expert financial and compliance services for individuals, startups & enterprises
  - img
  - textbox "Search services..."
  - img
  - text: 10 Service Categories
  - img
  - text: 500+ Verified CA Experts
  - img
  - text: 4.9 Average Rating
  - img
  - text: Same-day Booking
  - button "All"
  - button "TAX"
  - button "GST"
  - button "AUDIT"
  - button "REGISTRATION"
  - button "COMPLIANCE"
  - button "CONSULTING"
  - button "ACCOUNTING"
  - button "PAYROLL"
  - button "FINANCIAL PLANNING"
  - paragraph: 10 services found
  - link "Featured GST GST Filing Complete GST registration and filing services Starting from ₹1,499 1+ CAs View details":
    - /url: /services/gst-filing
    - img
    - text: Featured GST
    - heading "GST Filing" [level=3]
    - paragraph: Complete GST registration and filing services
    - text: Starting from
    - paragraph: ₹1,499
    - img
    - text: 1+ CAs View details
    - img
  - link "Featured TAX Income Tax Filing Individual and corporate income tax returns Starting from ₹999 1+ CAs View details":
    - /url: /services/income-tax-filing
    - img
    - text: Featured TAX
    - heading "Income Tax Filing" [level=3]
    - paragraph: Individual and corporate income tax returns
    - text: Starting from
    - paragraph: ₹999
    - img
    - text: 1+ CAs View details
    - img
  - link "Featured REGISTRATION Company Registration Private limited, LLP, and OPC registration Starting from ₹4,999 0+ CAs View details":
    - /url: /services/company-registration
    - img
    - text: Featured REGISTRATION
    - heading "Company Registration" [level=3]
    - paragraph: Private limited, LLP, and OPC registration
    - text: Starting from
    - paragraph: ₹4,999
    - img
    - text: 0+ CAs View details
    - img
  - link "AUDIT Audit Services Statutory, tax, and internal audits Starting from ₹9,999 0+ CAs View details":
    - /url: /services/audit-services
    - img
    - text: AUDIT
    - heading "Audit Services" [level=3]
    - paragraph: Statutory, tax, and internal audits
    - text: Starting from
    - paragraph: ₹9,999
    - img
    - text: 0+ CAs View details
    - img
  - link "REGISTRATION Trademark Registration Protect your brand with trademark filing Starting from ₹2,999 0+ CAs View details":
    - /url: /services/trademark-registration
    - img
    - text: REGISTRATION
    - heading "Trademark Registration" [level=3]
    - paragraph: Protect your brand with trademark filing
    - text: Starting from
    - paragraph: ₹2,999
    - img
    - text: 0+ CAs View details
    - img
  - link "COMPLIANCE Business Compliance ROC filings and compliance management Starting from ₹2,999 0+ CAs View details":
    - /url: /services/business-compliance
    - img
    - text: COMPLIANCE
    - heading "Business Compliance" [level=3]
    - paragraph: ROC filings and compliance management
    - text: Starting from
    - paragraph: ₹2,999
    - img
    - text: 0+ CAs View details
    - img
  - link "Featured CONSULTING Startup Consulting Expert guidance for new businesses Starting from ₹1,999 0+ CAs View details":
    - /url: /services/startup-consulting
    - img
    - text: Featured CONSULTING
    - heading "Startup Consulting" [level=3]
    - paragraph: Expert guidance for new businesses
    - text: Starting from
    - paragraph: ₹1,999
    - img
    - text: 0+ CAs View details
    - img
  - link "FINANCIAL PLANNING Financial Planning Personal and business financial planning Starting from ₹1,499 0+ CAs View details":
    - /url: /services/financial-planning
    - img
    - text: FINANCIAL PLANNING
    - heading "Financial Planning" [level=3]
    - paragraph: Personal and business financial planning
    - text: Starting from
    - paragraph: ₹1,499
    - img
    - text: 0+ CAs View details
    - img
  - link "ACCOUNTING Accounting Services Bookkeeping and accounting management Starting from ₹1,999 0+ CAs View details":
    - /url: /services/accounting-services
    - img
    - text: ACCOUNTING
    - heading "Accounting Services" [level=3]
    - paragraph: Bookkeeping and accounting management
    - text: Starting from
    - paragraph: ₹1,999
    - img
    - text: 0+ CAs View details
    - img
  - link "PAYROLL Payroll Services End-to-end payroll processing Starting from ₹1,499 0+ CAs View details":
    - /url: /services/payroll-services
    - img
    - text: PAYROLL
    - heading "Payroll Services" [level=3]
    - paragraph: End-to-end payroll processing
    - text: Starting from
    - paragraph: ₹1,499
    - img
    - text: 0+ CAs View details
    - img
  - heading "Can't find what you need?" [level=2]
  - paragraph: Talk to our AI assistant or browse all verified CA professionals to find the right expert for your specific requirement.
  - link "Book Consultation — ₹499":
    - /url: /services
    - text: Book Consultation — ₹499
    - img
  - link "Ask AI Assistant":
    - /url: /client/ai-chat
- contentinfo:
  - link "CAConnect":
    - /url: /
    - img
    - text: CAConnect
  - paragraph: India's most trusted platform connecting clients with verified Chartered Accountants for seamless financial and compliance services.
  - img
  - text: support@capro.in
  - img
  - text: +91 98765 43210
  - img
  - text: Mumbai, Maharashtra, India
  - link:
    - /url: "#"
    - img
  - link:
    - /url: "#"
    - img
  - link:
    - /url: "#"
    - img
  - link:
    - /url: "#"
    - img
  - heading "Services" [level=4]
  - list:
    - listitem:
      - link "GST Filing":
        - /url: /services/gst-filing
    - listitem:
      - link "Income Tax Filing":
        - /url: /services/income-tax-filing
    - listitem:
      - link "Company Registration":
        - /url: /services/company-registration
    - listitem:
      - link "Audit Services":
        - /url: /services/audit-services
    - listitem:
      - link "Trademark Registration":
        - /url: /services/trademark-registration
  - heading "Company" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: /about
    - listitem:
      - link "Blog":
        - /url: /blog
    - listitem:
      - link "Careers":
        - /url: /careers
    - listitem:
      - link "Press":
        - /url: /press
    - listitem:
      - link "Partners":
        - /url: /partners
  - heading "Support" [level=4]
  - list:
    - listitem:
      - link "Help Center":
        - /url: /help
    - listitem:
      - link "Contact Us":
        - /url: /contact
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy
    - listitem:
      - link "Terms of Service":
        - /url: /terms
    - listitem:
      - link "Refund Policy":
        - /url: /refund
  - heading "For CAs" [level=4]
  - list:
    - listitem:
      - link "Become a Partner":
        - /url: /ca/register
    - listitem:
      - link "CA Dashboard":
        - /url: /ca/dashboard
    - listitem:
      - link "Resources":
        - /url: /ca/resources
    - listitem:
      - link "Community":
        - /url: /ca/community
  - paragraph: © 2026 CAConnect Platform. All rights reserved.
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
  - link "Cookies":
    - /url: /cookies
  - img "Razorpay"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Public pages — landing & discovery", () => {
  4  |   test("Home page loads with hero section", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page.locator("text=CAConnect").first()).toBeVisible();
  7  |     // Navbar visible
  8  |     await expect(page.locator("nav, header").first()).toBeVisible();
  9  |   });
  10 | 
  11 |   test("Home page has Get Started / Sign In button", async ({ page }) => {
  12 |     await page.goto("/");
  13 |     const cta = page.locator("a[href='/auth/register'], a[href='/auth/login'], button", {
  14 |       hasText: /get started|sign in|login/i,
  15 |     }).first();
  16 |     await expect(cta).toBeVisible();
  17 |   });
  18 | 
  19 |   test("Services page loads and lists services", async ({ page }) => {
  20 |     await page.goto("/services");
  21 |     await expect(page.locator("h1, h2").first()).toBeVisible();
  22 |     // At least one service card
  23 |     const cards = page.locator("[class*='card'], [class*='Card'], article");
> 24 |     await expect(cards.first()).toBeVisible({ timeout: 10_000 });
     |                                 ^ Error: expect(locator).toBeVisible() failed
  25 |   });
  26 | 
  27 |   test("Individual service page loads (GST Filing)", async ({ page }) => {
  28 |     await page.goto("/services/gst-filing");
  29 |     await expect(page.locator("h1").first()).toBeVisible();
  30 |   });
  31 | 
  32 |   test("Find CA page loads", async ({ page }) => {
  33 |     await page.goto("/find-ca");
  34 |     await expect(page.locator("h1, h2").first()).toBeVisible();
  35 |   });
  36 | 
  37 |   test("Pricing page loads with flat rate info", async ({ page }) => {
  38 |     await page.goto("/pricing");
  39 |     await expect(page.locator("h1, h2").first()).toBeVisible();
  40 |     await expect(page.locator("text=499").first()).toBeVisible();
  41 |   });
  42 | 
  43 |   test("CA profile page loads by slug/id", async ({ page }) => {
  44 |     // Navigate to find-ca first to pick a CA id
  45 |     await page.goto("/find-ca");
  46 |     await page.waitForTimeout(2000);
  47 |     const caLink = page.locator("a[href^='/ca/']").first();
  48 |     if (await caLink.isVisible()) {
  49 |       await caLink.click();
  50 |       await expect(page.locator("h1, h2").first()).toBeVisible();
  51 |     } else {
  52 |       // No real CA yet — page should still load gracefully
  53 |       await page.goto("/ca/demo");
  54 |       await expect(page).not.toHaveURL(/error/);
  55 |     }
  56 |   });
  57 | 
  58 |   test("Navbar links work on home page", async ({ page }) => {
  59 |     await page.goto("/");
  60 |     const servicesLink = page.locator("a[href='/services']").first();
  61 |     if (await servicesLink.isVisible()) {
  62 |       await servicesLink.click();
  63 |       await expect(page).toHaveURL(/services/);
  64 |     }
  65 |   });
  66 | });
  67 | 
```