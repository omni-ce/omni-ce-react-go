import { expect, type Page } from "@playwright/test";
import { playNotification } from "./function";
import { frontendUrl } from "./variable";

export async function Landing(page: Page) {
  //# Access First Time
  await page.addInitScript(() => {
    const shield = document.createElement("div");
    shield.id = "playwright-shield";
    shield.style.position = "fixed";
    shield.style.top = "0";
    shield.style.left = "0";
    shield.style.width = "100%";
    shield.style.height = "100%";
    shield.style.zIndex = "999999";
    shield.style.backgroundColor = "transparent";
    shield.style.pointerEvents = "auto";
    document.body.appendChild(shield);
  });

  await page.goto(frontendUrl);

  // Check Heading
  const heading = page.locator("h1");
  await expect(heading).toBeVisible();
  await expect(heading).toContainText(
    /Build Full-Stack Apps|Bangun Aplikasi Full-Stack/i,
  );
  await expect(heading).toContainText(/React \+ Go/i);

  // Check Primary CTA (Login or Dashboard)
  const ctaButton = page
    .locator('a[href*="login"], a[href*="dashboard"]')
    .first();
  await expect(ctaButton).toBeVisible();
  await expect(ctaButton).toContainText(
    /Login Now|Masuk Sekarang|Go to Dashboard|Ke Dashboard/i,
  );

  // Check GitHub Link
  const githubLink = page.locator('a[href*="github.com"]').first();
  await expect(githubLink).toBeVisible();
  await expect(githubLink).toContainText(/GitHub/i);

  //# end delay
  await playNotification("section");
}

export default Landing;
