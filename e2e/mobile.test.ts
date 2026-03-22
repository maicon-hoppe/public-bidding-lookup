import { expect, test } from '@playwright/test';

test("Homepage has popup navigation menu", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 914 });

    await page.goto('/');
    await expect(page.locator('header details', { has: page.locator('nav') })).toHaveCount(1);
});

test("Locate contract info from homepage", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 914 });

    await page.goto("/");
    await page.click("header details summary");
    await page.click("header details a[href='/contratos']");
    await page.locator("#contract-list > a:first-child").click();

    await expect(page.locator("#table-container")).toHaveCount(1);
});