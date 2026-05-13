import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("Full Testing", async ({ page }) => {
  // 0. Prepare
  const backendUrl = "http://127.0.0.1:3000";

  // hit ke endpoint backend di port 3000 untuk code refresh
  const refreshRes = await page.request.get(`${backendUrl}/api/test/code-refresh`);
  expect(refreshRes.ok()).toBeTruthy();

  // ambil code menggunakan fs di file app_back_code.txt
  const codePath = path.resolve(process.cwd(), "app_back_code.txt");
  const code = fs.readFileSync(codePath, "utf-8").trim();

  // code di pakai untuk body hit ke apocalypse-tables
  const apocalypseRes = await page.request.post(
    `${backendUrl}/api/test/apocalypse-tables`,
    {
      data: { code },
    },
  );
  expect(apocalypseRes.ok()).toBeTruthy();

  // 1. Access First Time
  await page.goto("http://127.0.0.1:5173/");

  // 1.1. Check Heading
  const heading = page.locator("h1");
  await expect(heading).toBeVisible();
  await expect(heading).toContainText(
    /Build Full-Stack Apps|Bangun Aplikasi Full-Stack/i,
  );
  await expect(heading).toContainText(/React \+ Go/i);

  // 1.2. Check Primary CTA (Login or Dashboard)
  const ctaButton = page
    .locator('a[href*="login"], a[href*="dashboard"]')
    .first();
  await expect(ctaButton).toBeVisible();
  await expect(ctaButton).toContainText(
    /Login Now|Masuk Sekarang|Go to Dashboard|Ke Dashboard/i,
  );

  // 1.3. Check GitHub Link
  const githubLink = page.locator('a[href*="github.com"]').first();
  await expect(githubLink).toBeVisible();
  await expect(githubLink).toContainText(/GitHub/i);

  // Keep the browser open after finish
  await page.pause();
});
