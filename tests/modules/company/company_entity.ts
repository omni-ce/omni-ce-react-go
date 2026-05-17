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

async function CompanyEntity(page: Page) {
  // click menu company
  await buttonClick(page, ".sidebar-menu-company");

  if (checkModuleStart("Company Entity", "entity")) {
    return;
  }

  //# Company Entity
  // click submenu company: entity
  await buttonClick(page, ".sidebar-menu-company-entity");

  await insertNewCompanyEntity(
    page,
    "company-wpu.jpeg",
    "WPU Community",
    "1234567890123456",
    "Sandhika Galih",
    "Jl. lupa titik koma",
    ["jawa", "kota ban", "kiara", "cica"],
  );

  //# end delay
  await playNotification("section");
}

export default CompanyEntity;

const insertNewCompanyEntity = async (
  page: Page,
  file_logo: string,
  name: string,
  npwp_code: string,
  npwp_alias: string,
  address: string,
  addressSelects: string[],
) => {
  // click button add
  await buttonClick(page, ".company-entity-pagination-button-add");

  // upload logo
  await inputFile(page, ".field-file-logo", file_logo);

  // input company name
  await inputFill(page, ".field-text-name", name);

  // input company npwp
  await inputFill(page, ".field-text-npwp_code", npwp_code);

  // input company npwp alias
  await inputFill(page, ".field-text-npwp_alias", npwp_alias);

  await scrollDown(page, ".company-entity-pagination-dialog", 500);

  // input alamat
  await inputFill(page, ".field-textarea-address", address);

  await selectAddress(
    page,
    addressSelects[0],
    addressSelects[1],
    addressSelects[2],
    addressSelects[3],
  );

  // click button save
  await buttonClick(page, ".company-entity-pagination-button-save", 1000);
};
