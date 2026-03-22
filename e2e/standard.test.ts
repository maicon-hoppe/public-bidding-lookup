import { expect, test } from '@playwright/test';

test("Homepage has navigation options", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header > div > nav")).toHaveCount(1);
});

test("Locate contract info from homepage", async ({ page }) => {
    await page.goto("/");
    await page.click("main > #intro > a[href='/contratos']");
    await page.locator("#contract-list > a:first-child").click();

    await expect(page.locator("#table-container")).toHaveCount(1);
});