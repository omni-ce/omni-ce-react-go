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

  await inputNewVariant(
    page,
    "ele",
    "lap",
    "apple",
    "Macbook M5 14-inch",
    "Apple M5 chip dengan layar 14-inch",
    "Apple M5 chip with 14-inch display",
  );

  await inputNewVariant(
    page,
    "ele",
    "tele",
    "sam",
    "Galaxy Z-Fold 8",
    "Galaxy Z-Fold 8 dengan layar 8-inch",
    "Galaxy Z-Fold 8 with 8 inch display",
  );

  //# end delay
  await playNotification("section");
}

export default ProductVariant;

const inputNewVariant = async (
  page: Page,
  category: string,
  type: string,
  brand: string,
  variant: string,
  description_id: string,
  description_en: string,
) => {
  // click button add
  await buttonClick(page, ".product-variant-pagination-button-add");

  // select category
  await buttonClick(page, "#field-category_id", 1000);
  await inputFill(page, ".field-category_id-searchable-select-input", category);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select type
  await buttonClick(page, "#field-type_id", 1000);
  await inputFill(page, ".field-type_id-searchable-select-input", type);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select brand
  await buttonClick(page, "#field-brand_id", 1000);
  await inputFill(page, ".field-brand_id-searchable-select-input", brand);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // input variant name
  await inputFill(page, ".field-text-name", variant);
  await inputFill(page, ".field-textarea-description-id", description_id);
  await inputFill(page, ".field-textarea-description-en", description_en);

  // click button save
  await buttonClick(page, ".product-variant-pagination-button-save", 1000);
};
