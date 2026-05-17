import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
  selectAddress,
  selectMap,
} from "../../function";
import { checkModuleStart } from "../../variable";

async function CompanyBranch(page: Page) {
  if (checkModuleStart("Company Branch", "branch")) {
    return;
  }

  //# Company Branch
  // click submenu company: branch
  await buttonClick(page, ".sidebar-menu-company-branch");

  await insertNewCompanyBranch(
    page,
    "WPU Community",
    "Sandhika Galih",
    "Jl. lupa titik koma",
    ["jawa", "kota ban", "gede", "ranca"],
    "8123456789",
  );

  //# end delay
  await playNotification("section");
}

export default CompanyBranch;

const insertNewCompanyBranch = async (
  page: Page,
  name: string,
  code: string,
  address: string,
  addressSelects: string[],
  phone: string,
) => {
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
  await inputFill(page, ".field-text-name", name);

  // input branch code
  await inputFill(page, ".field-text-code", code);

  await scrollDown(page, ".user-pagination-dialog", 300);

  // input address
  await inputFill(page, ".field-textarea-address", address);

  await selectAddress(
    page,
    addressSelects[0],
    addressSelects[1],
    addressSelects[2],
    addressSelects[3],
  );

  await scrollDown(page, ".company-pagination-dialog");

  // input phone, class: field-phone-phone
  await inputFill(page, ".field-phone-phone", phone);

  // click button map
  await selectMap(page, "rancabolang");

  // click button save
  await buttonClick(page, ".company-branch-pagination-button-save", 1000);
};
