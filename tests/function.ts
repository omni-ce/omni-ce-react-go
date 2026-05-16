import { type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import audio from "sound-play";
import { asset_test, pwd } from "./variable";

export const playNotification = async (
  sound: "section" | "finish" | "error",
  volume = 0.1,
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
    await audio.play(soundPath, volume);
  }
};

export const buttonClick = async (
  page: Page,
  className: string,
  delay = 1000,
) => {
  await page.locator(className).first().click();
  await page.waitForTimeout(delay);
};

export const inputFill = async (
  page: Page,
  className: string,
  value: string,
  delay = 500,
) => {
  await page.locator(className).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.fill(className, value);
  await page.waitForTimeout(delay);
};

export const inputFile = async (
  page: Page,
  className: string,
  fileName: string,
  delay = 500,
) => {
  const file = path.join(asset_test, fileName);
  await page.setInputFiles(className, file);
  await page.waitForTimeout(delay);
};

export const scrollDown = async (page: Page, className: string, value = 50) => {
  await page.evaluate(
    ({ className, value }) => {
      const dialog = document.querySelector(className);
      if (dialog) {
        dialog.scrollTop += value;
      }
    },
    { className, value },
  );
};

export const selectOption = async (
  page: Page,
  className: string,
  value: string,
  delay = 500,
) => {
  await page.locator(className).first().selectOption(value);
  await page.waitForTimeout(delay);
};

export const selectAddress = async (
  page: Page,
  province: string,
  regency: string,
  district: string,
  village: string,
) => {
  // click province: Jawa Barat
  await buttonClick(page, "#province", 1000);
  await inputFill(page, ".province-searchable-select-input", province);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  await scrollDown(page, ".user-pagination-dialog");

  // click regency: Kota Bandung
  await buttonClick(page, "#regency", 1000);
  await inputFill(page, ".regency-searchable-select-input", regency);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click district: Antapani
  await buttonClick(page, "#district", 1000);
  await inputFill(page, ".district-searchable-select-input", district);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click village: Antapani
  await buttonClick(page, "#village", 1000);
  await inputFill(page, ".village-searchable-select-input", village);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );
};
