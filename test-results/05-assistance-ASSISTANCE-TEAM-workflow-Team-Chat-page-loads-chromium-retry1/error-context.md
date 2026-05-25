# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-assistance.spec.ts >> ASSISTANCE TEAM workflow >> Team Chat page loads
- Location: tests/e2e/05-assistance.spec.ts:122:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Team Chat')
Expected: visible
Error: strict mode violation: locator('text=Team Chat') resolved to 2 elements:
    1) <a href="/assistance/communication" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group bg-emerald-50 text-emerald-700">…</a> aka getByRole('link', { name: 'Team Chat' })
    2) <h2 class="font-bold font-heading text-base flex items-center gap-2">…</h2> aka getByRole('heading', { name: 'Team Chat' })

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('text=Team Chat')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e4]:
      - link "CAConnect Assistance Team" [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
        - generic [ref=e11]:
          - generic [ref=e12]: CAConnect
          - paragraph [ref=e13]: Assistance Team
      - navigation [ref=e14]:
        - link "Dashboard" [ref=e15] [cursor=pointer]:
          - /url: /assistance/dashboard
          - img [ref=e16]
          - text: Dashboard
        - link "Cases" [ref=e21] [cursor=pointer]:
          - /url: /assistance/cases
          - img [ref=e22]
          - text: Cases
        - link "Tasks" [ref=e24] [cursor=pointer]:
          - /url: /assistance/tasks
          - img [ref=e25]
          - text: Tasks
        - link "Documents" [ref=e28] [cursor=pointer]:
          - /url: /assistance/documents
          - img [ref=e29]
          - text: Documents
        - link "Team Chat" [ref=e32] [cursor=pointer]:
          - /url: /assistance/communication
          - img [ref=e33]
          - text: Team Chat
          - img [ref=e35]
        - link "Settings" [ref=e37] [cursor=pointer]:
          - /url: /assistance/settings
          - img [ref=e38]
          - text: Settings
      - generic [ref=e42]:
        - generic [ref=e44]: AS
        - generic [ref=e45]:
          - paragraph [ref=e46]: Anjali
          - paragraph [ref=e47]: Senior Document Verifier
        - button [ref=e48] [cursor=pointer]:
          - img [ref=e49]
    - generic [ref=e52]:
      - banner [ref=e53]:
        - paragraph [ref=e55]: assistance › communication
        - button "Notifications" [ref=e57] [cursor=pointer]:
          - img [ref=e58]
      - main [ref=e61]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - generic [ref=e65]:
              - heading "Team Chat 3" [level=2] [ref=e67]:
                - img [ref=e68]
                - text: Team Chat
                - generic [ref=e70]: "3"
              - generic [ref=e71]:
                - img [ref=e72]
                - textbox "Search cases or CA..." [ref=e75]
            - generic [ref=e76]:
              - button "CP CA Priya Menon 2m CASE-0001 GST Filing Please check the documents I shared 2" [ref=e77] [cursor=pointer]:
                - generic [ref=e79]: CP
                - generic [ref=e80]:
                  - generic [ref=e81]:
                    - paragraph [ref=e82]: CA Priya Menon
                    - generic [ref=e83]: 2m
                  - generic [ref=e84]:
                    - generic [ref=e85]: CASE-0001
                    - generic [ref=e86]: GST Filing
                  - paragraph [ref=e87]: Please check the documents I shared
                - generic [ref=e88]: "2"
              - button "CA CA Arjun Patel 1h CASE-0002 Company Registration When can you verify the docs? 1" [ref=e89] [cursor=pointer]:
                - generic [ref=e91]: CA
                - generic [ref=e92]:
                  - generic [ref=e93]:
                    - paragraph [ref=e94]: CA Arjun Patel
                    - generic [ref=e95]: 1h
                  - generic [ref=e96]:
                    - generic [ref=e97]: CASE-0002
                    - generic [ref=e98]: Company Registration
                  - paragraph [ref=e99]: When can you verify the docs?
                - generic [ref=e100]: "1"
              - button "CV CA Vikram Singh 3h CASE-0003 Income Tax Filing Thanks, reviewing by EOD" [ref=e101] [cursor=pointer]:
                - generic [ref=e103]: CV
                - generic [ref=e104]:
                  - generic [ref=e105]:
                    - paragraph [ref=e106]: CA Vikram Singh
                    - generic [ref=e107]: 3h
                  - generic [ref=e108]:
                    - generic [ref=e109]: CASE-0003
                    - generic [ref=e110]: Income Tax Filing
                  - paragraph [ref=e111]: Thanks, reviewing by EOD
            - paragraph [ref=e113]:
              - img [ref=e114]
              - text: Internal CA — Assistance chat only
          - generic [ref=e117]:
            - generic [ref=e118]:
              - generic [ref=e120]: CP
              - generic [ref=e121]:
                - paragraph [ref=e122]: CA Priya Menon
                - paragraph [ref=e123]: "Case: CASE-0001 · GST Filing"
            - generic [ref=e124]:
              - generic [ref=e126]:
                - generic [ref=e127]: Hi, I've received the GST documents from Rahul Sharma.
                - generic [ref=e128]:
                  - generic [ref=e129]: 03:44 pm
                  - img [ref=e130]
              - generic [ref=e133]:
                - generic [ref=e135]: CP
                - generic [ref=e136]:
                  - generic [ref=e137]: Great! Are they all complete? We need PAN, Aadhaar and bank statement.
                  - generic [ref=e139]: 03:54 pm
              - generic [ref=e141]:
                - generic [ref=e142]: PAN and Aadhaar are clear. Bank statement needs a better scan — last 2 pages blurry.
                - generic [ref=e143]:
                  - generic [ref=e144]: 04:04 pm
                  - img [ref=e145]
              - generic [ref=e148]:
                - generic [ref=e150]: CP
                - generic [ref=e151]:
                  - generic [ref=e152]: Please check the documents I shared
                  - generic [ref=e154]: 04:42 pm
            - generic [ref=e155]:
              - generic [ref=e156]:
                - textbox "Message CA Priya Menon…" [ref=e157]
                - button [disabled]:
                  - img
              - paragraph [ref=e158]: Messages are internal between you and the CA — clients cannot see this chat
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e159]:
        - button "Close toast" [ref=e160] [cursor=pointer]:
          - img [ref=e161]
        - img [ref=e165]
        - generic [ref=e168]: Welcome back!
  - generic [ref=e173] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e174]:
      - img [ref=e175]
    - generic [ref=e178]:
      - button "Open issues overlay" [ref=e179]:
        - generic [ref=e180]:
          - generic [ref=e181]: "1"
          - generic [ref=e182]: "2"
        - generic [ref=e183]:
          - text: Issue
          - generic [ref=e184]: s
      - button "Collapse issues badge" [ref=e185]:
        - img [ref=e186]
  - alert [ref=e188]
```

# Test source

```ts
  25  |     await expect(page.locator("text=Your Workflow")).toBeVisible({ timeout: 8_000 });
  26  |   });
  27  | 
  28  |   test("Dashboard has quick action links", async ({ page }) => {
  29  |     await expect(page.locator("a[href='/assistance/tasks']").first()).toBeVisible();
  30  |     await expect(page.locator("a[href='/assistance/documents']").first()).toBeVisible();
  31  |   });
  32  | 
  33  |   test("Sidebar has all nav items", async ({ page }) => {
  34  |     const nav = page.locator("aside nav, [class*='sidebar'] nav").first();
  35  |     await expect(nav.locator("a[href='/assistance/cases']")).toBeVisible();
  36  |     await expect(nav.locator("a[href='/assistance/tasks']")).toBeVisible();
  37  |     await expect(nav.locator("a[href='/assistance/documents']")).toBeVisible();
  38  |     await expect(nav.locator("a[href='/assistance/communication']")).toBeVisible();
  39  |     await expect(nav.locator("a[href='/assistance/settings']")).toBeVisible();
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
> 125 |     await expect(page.locator("text=Team Chat")).toBeVisible({ timeout: 8_000 });
      |                                                  ^ Error: expect(locator).toBeVisible() failed
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
  140 |     await expect(searchBox).toBeVisible({ timeout: 8_000 });
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