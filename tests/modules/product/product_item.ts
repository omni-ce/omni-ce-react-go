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

  // click button add
  await buttonClick(page, ".product-item-pagination-button-add");

  // select category
  await buttonClick(page, "#category_id", 1000);
  await inputFill(page, ".category_id-searchable-select-input", "elektronik");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select type
  await buttonClick(page, "#type_id", 1000);
  await inputFill(page, ".type_id-searchable-select-input", "smartphone");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select brand
  await buttonClick(page, "#brand_id", 1000);
  await inputFill(page, ".brand_id-searchable-select-input", "apple");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select variant
  await buttonClick(page, "#variant_id", 1000);
  await inputFill(
    page,
    ".variant_id-searchable-select-input",
    "iphone 15 pro max",
  );
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select memory
  await buttonClick(page, "#memory_id", 1000);
  await inputFill(page, ".memory_id-searchable-select-input", "8 gb / 256 gb");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select color
  await buttonClick(page, "#color_id", 1000);
  await inputFill(page, ".color_id-searchable-select-input", "space grey");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // select condition
  await buttonClick(page, "#condition_id", 1000);
  await inputFill(page, ".condition_id-searchable-select-input", "baru");
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1) > div > div",
  );

  // input weight
  await inputFill(page, ".field-weight-weight", "221");
  await selectOption(page, ".weight-unit-select", "G");

  // input SKU
  await inputFill(page, ".field-text-sku", "IP15PM-256-SG");

  // click button save
  await buttonClick(page, ".product-item-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductItem;
