import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
  selectOption,
} from "../../function";
import { checkModuleStart } from "../../variable";

async function ProductType(page: Page) {
  if (checkModuleStart("Product Type", "type")) {
    return;
  }

  //# Product Type
  // click submenu product: type
  await buttonClick(page, ".sidebar-menu-product-type");

  // click button add
  await buttonClick(page, ".product-type-pagination-button-add");

  // input type name
  await inputFill(page, ".field-text-name-id", "Smartphone");
  await inputFill(page, ".field-text-name-en", "Smartphone");

  // select category
  await buttonClick(page, "#field-category_id", 1000);
  await inputFill(page, ".field-category_id-searchable-select-input", "elec");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // click button save
  await buttonClick(page, ".product-type-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductType;
