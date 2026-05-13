import fs from "fs";
import path from "path";
import { expect, type Page } from "@playwright/test";
import { backendUrl, module_selected, started_exist } from "./variable";

export async function Prepare(page: Page) {
  if (started_exist.length === 0 && module_selected.length > 0) {
    console.log("Prepare skip, module already selected ...");
    return;
  }
  started_exist.push(true);

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
}

export default Prepare;
