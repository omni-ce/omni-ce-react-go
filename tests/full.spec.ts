import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

import audio from "sound-play";

const pwd = process.cwd();
const asset_test = path.join(pwd, "assets", "test");

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
    await audio.play(soundPath, 0.5);
  }
  try {
    await page.waitForTimeout(1500);
  } catch {
    // Ignore if test ends during timeout
  }
};

const buttonClick = async (page: Page, className: string) => {
  await page.locator(className).first().click();
  await page.waitForTimeout(2000);
};

const inputFill = async (page: Page, className: string, value: string) => {
  await page.fill(className, value);
  await page.waitForTimeout(500);
};

const inputFile = async (page: Page, className: string, fileName: string) => {
  const file = path.join(asset_test, fileName);
  await page.setInputFiles(className, file);
  await page.waitForTimeout(1000);
};

test("Full Testing", async ({ page }) => {
  try {
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
    await buttonClick(page, 'a[href*="login"], a[href*="dashboard"]');

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
    await inputFill(page, ".field-username", username);
    await inputFill(page, ".field-password", password);
    await buttonClick(page, 'button[type="submit"]');

    // 2:end delay
    await playNotification(page, "section");

    // ---------------------------------------------- //

    // 3. Role Check
    // click menu role
    await buttonClick(page, ".sidebar-menu-role");

    // click expand role admin
    await buttonClick(page, ".role-item-Admin");

    // click checklist menu user
    await buttonClick(page, ".role-check-admin-user");

    // click button save
    await buttonClick(page, ".role-button-save");

    // 3:end delay
    await playNotification(page, "section");

    // ---------------------------------------------- //

    // 4. Add New User
    // click menu user
    await buttonClick(page, ".sidebar-menu-user");

    // click button add
    await buttonClick(page, ".user-pagination-button-add");

    // upload foto user, class: field-file-avatar
    await inputFile(page, ".field-file-avatar", "sandhika-galih.jpeg");

    // input nama lengkap user, class: field-text-name
    await inputFill(page, ".field-text-name", "Sandhika Galih");

    // input username, class: field-text-username
    await inputFill(page, ".field-text-username", "sandhikagalih");

    // input password, class: field-text-password
    await inputFill(page, ".field-text-password", "SandhikaGalih@123");

    // scroll dialog kebawah sedikit agar bisa melihat field dibawah
    await page.evaluate(() => {
      const dialog = document.querySelector(
        "body > div.fixed.inset-0.z-50.flex.items-center.justify-center > div.relative.z-10.w-full.mx-4.animate-fade-in > div > div.overflow-y-auto.-mx-6.px-6.py-1.max-h-[60vh]",
      );
      if (dialog) {
        dialog.scrollTop = dialog.scrollHeight;
      }
    });

    // ---------------------------------------------- //
    // wait for navigation or success
    // await expect(page).toHaveURL(/.*select-role/); // for user not su

    // Keep the browser open after finish
    await playNotification(page, "finish");
    await page.pause();
  } catch (err) {
    await playNotification(page, "error");
    throw err;
  }
});
