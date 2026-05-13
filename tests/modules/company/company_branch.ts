import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
} from "../../function";

async function CompanyBranch(page: Page) {
  //# Company Branch
  // click submenu company: branch
  await buttonClick(page, ".sidebar-menu-company-branch");

  // click button add
  await buttonClick(page, ".company-branch-pagination-button-add");

  // click dropdown entity
  await buttonClick(page, ".company-branch-pagination-dialog #field-entity_id");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button > div > div > div",
  );

  // click dropdown pic
  await buttonClick(page, ".company-branch-pagination-dialog #field-pic_id");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button",
  );

  // input branch name
  await inputFill(page, ".field-text-name", "Discord");

  // input branch code
  await inputFill(page, ".field-text-code", "discord");

  await scrollDown(page, ".user-pagination-dialog", 300);

  // input address
  await inputFill(page, ".field-textarea-address", "Jl. lupa titik koma");

  // click province: Jawa Barat
  await buttonClick(page, "#province", 1000);
  await inputFill(page, ".province-searchable-select-input", "jawa");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  await scrollDown(page, ".company-pagination-dialog");

  // click regency: Kota Bandung
  await buttonClick(page, "#regency", 1000);
  await inputFill(page, ".regency-searchable-select-input", "kota");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click district: Gedebage
  await buttonClick(page, "#district", 1000);
  await inputFill(page, ".district-searchable-select-input", "gede");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click village: Rancabolang
  await buttonClick(page, "#village", 1000);
  await inputFill(page, ".village-searchable-select-input", "ranca");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  await scrollDown(page, ".company-pagination-dialog");

  // input phone, class: field-phone-phone
  await inputFill(page, ".field-phone-phone", "8123456789");

  // click button map
  await buttonClick(page, ".field-group-map-map button");
  // click on center page
  await page.mouse.click(300, 300);
}

export default CompanyBranch;
