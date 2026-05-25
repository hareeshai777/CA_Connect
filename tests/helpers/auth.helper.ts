import { Page, expect } from "@playwright/test";
import { USERS, Role } from "./constants";

export async function loginAs(page: Page, role: Role) {
  const { email, password } = USERS[role];
  await page.goto("/auth/login");
  await expect(page.locator("input[type='email']")).toBeVisible({ timeout: 10_000 });
  await page.fill("input[type='email']", email);
  await page.fill("input[type='password']", password);
  await page.click("button[type='submit']");
  // Wait for navigation away from login page
  await page.waitForFunction(
    () => !window.location.pathname.includes("/auth/login"),
    { timeout: 25_000 }
  );
  // Give Next.js router + zustand rehydration a moment
  await page.waitForTimeout(1000);
  // Confirm we landed on the right dashboard (or at least not on login)
  await expect(page).not.toHaveURL(/auth\/login/);
}

export async function logout(page: Page) {
  const logoutBtn = page.locator("button", { hasText: "Log out" }).first();
  await expect(logoutBtn).toBeVisible({ timeout: 5_000 });
  await logoutBtn.click();
  await page.waitForURL("**/", { timeout: 10_000 });
}
