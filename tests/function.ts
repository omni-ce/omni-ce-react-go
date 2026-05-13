import { type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import audio from "sound-play";
import { asset_test, pwd } from "./variable";

export const playNotification = async (
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
    await audio.play(soundPath, 0.1);
  }
};

export const buttonClick = async (
  page: Page,
  className: string,
  delay = 1500,
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
  delay = 1000,
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
