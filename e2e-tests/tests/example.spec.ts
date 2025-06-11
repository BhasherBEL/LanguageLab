import { test, expect } from "@playwright/test";

test("has login page", async ({ page }) => {
  await page.goto("./login");

  await expect(page).toHaveTitle(/LanguageLab/);
});
