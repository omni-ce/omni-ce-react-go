import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

import player from "play-sound";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const audio = player();

const pwd = process.cwd();

const playNotification = async (
  page: Page,
  sound: "section" | "finish" | "error",
) => {
  let mp3Name = "";
  if (sound === "section") {
    mp3Name = "section-done.mp3";
  } else if (sound === "finish") {
    mp3Name = "testing-done.mp3";
  } else {
    mp3Name = "testing-error.mp3";
  }

  const soundPath = path.join(pwd, "public", mp3Name);

  if (fs.existsSync(soundPath)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    audio.play(soundPath, (err) => {
      if (err) console.error("Sound play error:", err);
    });
  }

  try {
    await page.waitForTimeout(2500);
  } catch {
    // Ignore if test ends during timeout
  }
};

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

  // ---------------------------------------------- //

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
  await playNotification(page, "section");

  // ---------------------------------------------- //

  // 2. Access Login
  const loginButton = page
    .locator('a[href*="login"], a[href*="dashboard"]')
    .first();
  await loginButton.click();

  // ambil username dan password memakai fs
  const userModelPath = path.resolve(
    pwd,
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
  await page.waitForTimeout(2000);
  await page.click('button[type="submit"]');

  // 2:end delay
  await playNotification(page, "section");

  // ---------------------------------------------- //

  // 3. Role Check
  // click menu role
  await page.click(".sidebar-menu-role");
  await page.waitForTimeout(1000);

  // click expand role admin
  await page.click(".role-item-Admin");
  await page.waitForTimeout(1000);

  // click checklist menu user
  await page.click(".role-check-admin-user");
  await page.waitForTimeout(1000);

  // click button save
  await page.click(".role-button-save");
  await page.waitForTimeout(1000);

  // 3:end delay
  await playNotification(page, "section");

  // ---------------------------------------------- //

  // 4. Add New User
  // click menu user
  await page.click(".sidebar-menu-user");
  await page.waitForTimeout(1000);

  // click button add
  await page.click(".user-pagination-button-add");
  await page.waitForTimeout(1000);

  // upload foto user, class: field-file-avatar
  const fotoUserPath = path.join(pwd, "assets", "test", "sandhika-galih.jpeg");
  await page.setInputFiles(".field-file-avatar", fotoUserPath);
  await page.waitForTimeout(1000);

  // ---------------------------------------------- //
  // wait for navigation or success
  // await expect(page).toHaveURL(/.*select-role/); // for user not su

  // Keep the browser open after finish
  await playNotification(page, "finish");
  await page.pause();
});
