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

  await inputNewColor(page, "Black", "#000000");
  await inputNewColor(page, "White", "#ffffff");
  await inputNewColor(page, "Gold", "#ffd700");
  await inputNewColor(page, "Space Grey", "#9c9c9c");
  await inputNewColor(page, "Phantom Black", "#0d0d0d");

  //# end delay
  await playNotification("section");
}

export default ProductColor;

const inputNewColor = async (page: Page, name: string, hex_code: string) => {
  // click button add
  await buttonClick(page, ".product-color-pagination-button-add");

  // input color name and hex code
  await inputFill(page, ".field-text-name", name);
  await inputFill(page, ".field-color-hex_code-text", hex_code);

  // click button save
  await buttonClick(page, ".product-color-pagination-button-save", 1000);
};
