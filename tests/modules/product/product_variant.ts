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

async function ProductVariant(page: Page) {
  if (checkModuleStart("Product Variant", "variant")) {
    return;
  }

  //# Product Variant
  // click submenu product: variant
  await buttonClick(page, ".sidebar-menu-product-variant");

  // click button add
  await buttonClick(page, ".product-variant-pagination-button-add");

  // select category
  await buttonClick(page, "#field-category_id", 1000);
  await inputFill(page, ".field-category_id-searchable-select-input", "ele");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select type
  await buttonClick(page, "#field-type_id", 1000);
  await inputFill(page, ".field-type_id-searchable-select-input", "smart");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select brand
  await buttonClick(page, "#field-brand_id", 1000);
  await inputFill(page, ".field-brand_id-searchable-select-input", "apple");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // input variant name
  await inputFill(page, ".field-text-name", "iPhone 15 Pro Max");
  await inputFill(
    page,
    ".field-text-description",
    "Flagship smartphone from Apple",
  );

  // click button save
  await buttonClick(page, ".product-variant-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductVariant;
