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

async function ProductCondition(page: Page) {
  if (checkModuleStart("Product Condition", "condition")) {
    return;
  }

  //# Product Condition
  // click submenu product: condition
  await buttonClick(page, ".sidebar-menu-product-condition");

  // click button add
  await buttonClick(page, ".product-condition-pagination-button-add");

  // input condition name (multi-language)
  await inputFill(page, ".field-text-name-id", "Baru");
  await inputFill(page, ".field-text-name-en", "New");
  await inputFill(page, ".field-textarea-description", "Produk dalam kondisi segel dan baru");

  // click button save
  await buttonClick(page, ".product-condition-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductCondition;
