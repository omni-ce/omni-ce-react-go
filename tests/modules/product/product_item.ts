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

async function ProductItem(page: Page) {
  if (checkModuleStart("Product Item", "item")) {
    return;
  }

  //# Product Item
  // click submenu product: item
  await buttonClick(page, ".sidebar-menu-product-item");

  await insertNewItem(
    page,
    "ele",
    "lap",
    "Apple",
    "mac",
    "1024",
    "grey",
    "Baru",
    "221",
    "IP15PM-256-SG",
  );
  await insertNewItem(
    page,
    "ele",
    "tele",
    "sam",
    "fold",
    "512",
    "black",
    "Baru",
    "190",
    "ZFold5-512-BK",
  );

  //# end delay
  await playNotification("section");
}

export default ProductItem;

const insertNewItem = async (
  page: Page,
  category_id: string,
  type_id: string,
  brand_id: string,
  variant_id: string,
  memory_id: string,
  color_id: string,
  condition_id: string,
  weight: string,
  sku: string,
) => {
  // click button add
  await buttonClick(page, ".product-item-pagination-button-add");

  // select category
  await buttonClick(page, "#field-category_id", 1000);
  await inputFill(
    page,
    ".field-category_id-searchable-select-input",
    category_id,
  );
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select type
  await buttonClick(page, "#field-type_id", 1000);
  await inputFill(page, ".field-type_id-searchable-select-input", type_id);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select brand
  await buttonClick(page, "#field-brand_id", 1000);
  await inputFill(page, ".field-brand_id-searchable-select-input", brand_id);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select variant
  await buttonClick(page, "#field-variant_id", 1000);
  await inputFill(
    page,
    ".field-variant_id-searchable-select-input",
    variant_id,
  );
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select memory
  await buttonClick(page, "#field-memory_id", 1000);
  await inputFill(page, ".field-memory_id-searchable-select-input", memory_id);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select color
  await buttonClick(page, "#field-color_id", 1000);
  await inputFill(page, ".field-color_id-searchable-select-input", color_id);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select condition
  await buttonClick(page, "#field-condition_id", 1000);
  await inputFill(
    page,
    ".field-condition_id-searchable-select-input",
    condition_id,
  );
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // input weight
  await inputFill(page, ".field-weight-weight", weight);
  await buttonClick(page, ".field-weight-unit-weight-weight_unit_id", 1000);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // input SKU
  await inputFill(page, ".field-text-sku", sku);

  // click button save
  await buttonClick(page, ".product-item-pagination-button-save", 1000);
};
