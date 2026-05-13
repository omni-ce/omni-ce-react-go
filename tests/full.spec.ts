import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("Full Testing", async ({ page }) => {
  // 0. Prepare
  const frontendUrl = "http://127.0.0.1:5173";
  const backendUrl = "http://127.0.0.1:3000";

  // hit ke endpoint backend di port 3000 untuk code refresh
  const refreshRes = await page.request.get(
    `${backendUrl}/api/test/code-refresh`,
  );
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
  await page.goto(frontendUrl);

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

  // 1:end delay
  await page.waitForTimeout(2000);

  // 2. Access Login
  const loginButton = page
    .locator('a[href*="login"], a[href*="dashboard"]')
    .first();
  await loginButton.click();

  // ambil username dan password memakai fs
  const userModelPath = path.resolve(
    process.cwd(),
    "core/modules/user/model/user.model.go",
  );
  const userModelContent = fs.readFileSync(userModelPath, "utf-8");

  const usernameMatch = /Username:\s*"([^"]+)"/.exec(userModelContent);
  const passwordMatch = /Password:\s*hash\.Password\("([^"]+)"\)/.exec(
    userModelContent,
  );

  const username = usernameMatch ? usernameMatch[1] : "";
  const password = passwordMatch ? passwordMatch[1] : "";

  // insert ke field
  await page.fill(".field-username", username);
  await page.fill(".field-password", password);
  await page.waitForTimeout(1000);
  await page.click('button[type="submit"]');

  // 3. Role Check

  // click menu role: #root > div.h-screen.overflow-hidden.bg-dark-900.flex > aside > nav > a.w-full.flex.items-center.gap-3.px-3.py-2\.5.rounded-xl.text-sm.font-medium.transition-all.duration-200.bg-badge-light-blue.text-accent-500.border.border-accent-500\/20

  // click expand role admin: #root > div.h-screen.overflow-hidden.bg-dark-900.flex > div > main > div > div.space-y-4 > div > div.px-6.py-4.space-y-3.pt-2 > div:nth-child(2) > div

  // click checklist menu user: #root > div.h-screen.overflow-hidden.bg-dark-900.flex > div > main > div > div.space-y-4 > div > div.px-6.py-4.space-y-3.pt-2 > div:nth-child(2) > div.border-t.border-dark-600\/40.px-4.py-3 > div > div:nth-child(3) > div.flex.items-center.gap-2.px-2 > input

  // ---------------------------------------------- //
  // wait for navigation or success
  // await expect(page).toHaveURL(/.*select-role/); // for user not su

  // Keep the browser open after finish
  await page.pause();
});
