import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
  selectAddress,
} from "../../function";
import { checkModuleStart } from "../../variable";

async function CompanyBranch(page: Page) {
  if (checkModuleStart("Company Branch", "branch")) {
    return;
  }

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

  await selectAddress(page, "jawa", "kota ban", "gede", "ranca");

  await scrollDown(page, ".company-pagination-dialog");

  // input phone, class: field-phone-phone
  await inputFill(page, ".field-phone-phone", "8123456789");

  // click button map
  await buttonClick(page, ".field-group-map-map .field-map-map");
  // click on center page
  await page.mouse.click(300, 300);
  // click map picker button confirm
  await buttonClick(page, ".map-picker-button-confirm");

  // click button save
  await buttonClick(page, ".company-branch-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default CompanyBranch;
