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

async function ProductColor(page: Page) {
  if (checkModuleStart("Product Color", "color")) {
    return;
  }

  //# Product Color
  // click submenu product: color
  await buttonClick(page, ".sidebar-menu-product-color");

  // click button add
  await buttonClick(page, ".product-color-pagination-button-add");

  // input color name and hex code
  await inputFill(page, ".field-text-name", "Space Grey");
  await inputFill(page, ".field-color-hex_code", "#3c3c3c");

  // click button save
  await buttonClick(page, ".product-color-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductColor;
