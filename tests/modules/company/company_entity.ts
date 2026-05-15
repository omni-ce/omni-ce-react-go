import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
  selectAddress,
} from "../../function";
import { module_selected, started_exist } from "../../variable";

async function CompanyEntity(page: Page) {
  // click menu company
  await buttonClick(page, ".sidebar-menu-company");

  if (
    started_exist.length === 0 &&
    module_selected.length > 0 &&
    !module_selected.includes("entity")
  ) {
    console.log("Company Entity skip ...");
    return;
  }
  started_exist.push(true);

  //# Company Entity
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

  await selectAddress(page, "jawa", "kota ban", "kiara", "cica");

  // click button save
  await buttonClick(page, ".company-entity-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default CompanyEntity;
