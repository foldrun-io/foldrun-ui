// The kit's demo pages against committed baselines (FOL-196): demo/ renders
// every Astro component once, so a change to any component, recipe or
// token shows here. Shot in full, not just the top. The React kit is
// covered where it is used, by foldrun-web's visual suite.
import { test, expect } from "@playwright/test";

const pages = [
  ["components", "/"],
  ["rtl", "/rtl/"],
];

for (const [name, path] of pages) {
  test(name, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, mask: [page.locator("time, [data-volatile]")] });
  });
}
