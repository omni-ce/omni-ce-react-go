import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
} from "../function";

async function Company(page: Page) {
  // 5. Company
  // click menu company
  await buttonClick(page, ".sidebar-menu-company");
  // click submenu company: entity
  await buttonClick(page, ".sidebar-menu-company-entity");

  // click button add
  await buttonClick(page, ".company-entity-pagination-button-add");

  // upload logo
  await inputFile(page, ".field-file-logo", "company-wpu.jpeg");

  // input company name
  await inputFill(page, ".field-text-name", "WPU Community");

  // input company npwp
  await inputFill(page, ".field-text-npwp_code", "1234567890123456");

  // input company npwp alias
  await inputFill(page, ".field-text-npwp_alias", "Sandhika Galih");

  await scrollDown(page, ".company-entity-pagination-dialog", 500);

  // input alamat
  await inputFill(page, ".field-textarea-address", "Jl. lupa titik koma");

  // click province: Jawa Barat
  await buttonClick(page, "#province", 1000);
  await inputFill(page, ".province-searchable-select-input", "jawa");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // scroll dialog kebawah sedikit agar bisa melihat field dibawah
  await scrollDown(page, ".user-pagination-dialog");

  // click regency: Kota Bandung
  await buttonClick(page, "#regency", 1000);
  await inputFill(page, ".regency-searchable-select-input", "kota");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click district: Kiaracondong
  await buttonClick(page, "#district", 1000);
  await inputFill(page, ".district-searchable-select-input", "kiara");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click village: Cicaheum
  await buttonClick(page, "#village", 1000);
  await inputFill(page, ".village-searchable-select-input", "cica");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click button save
  await buttonClick(page, ".company-entity-pagination-button-save", 1000);

  // 5:end delay
  await playNotification("section");
}

export default Company;
