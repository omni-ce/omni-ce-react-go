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

async function SupplierEntity(page: Page) {
  // click menu supplier
  await buttonClick(page, ".sidebar-menu-supplier");

  if (checkModuleStart("Supplier Entity", "entity")) {
    return;
  }

  //# Supplier Entity
  // click submenu supplier: entity
  await buttonClick(page, ".sidebar-menu-supplier-entity");

  await insertNewSupplierEntity(
    page,
    "Global Supplier Corp",
    ["jawa", "kota ban", "gede", "ranca"],
    "Jl. Supplier Mandiri No. 45",
    "8123456789",
    "info@globalsupplier.com",
  );

  //# end delay
  await playNotification("section");
}

export default SupplierEntity;

const insertNewSupplierEntity = async (
  page: Page,
  name: string,
  addressSelects: string[],
  address: string,
  phone: string,
  email: string,
) => {
  // click button add
  await buttonClick(page, ".supplier-entity-pagination-button-add");

  // input supplier name
  await inputFill(page, ".field-text-name", name);

  await scrollDown(page, ".supplier-entity-pagination-dialog", 500);

  // input address
  await inputFill(page, ".field-textarea-address", address);

  await selectAddress(
    page,
    addressSelects[0],
    addressSelects[1],
    addressSelects[2],
    addressSelects[3],
  );

  await scrollDown(page, ".supplier-entity-pagination-dialog", 500);

  // input phone
  await inputFill(page, ".field-phone-phone", phone);

  // input email
  await inputFill(page, ".field-email-email", email);

  // click button map
  await buttonClick(page, ".field-group-map-map .field-map-map");
  // click on center page
  await page.mouse.click(300, 300);
  // click map picker button confirm
  await buttonClick(page, ".map-picker-button-confirm");

  // click button save
  await buttonClick(page, ".supplier-entity-pagination-button-save", 1000);
};
