import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
} from "../../function";
import { module_selected } from "../../variable";

async function ProductCategory(page: Page) {
  // click menu product
  await buttonClick(page, ".sidebar-menu-product");

  if (!module_selected.includes("category")) {
    console.log("Product Category skip ...");
    return;
  }

  //# Product Category
  // click submenu product: category
  await buttonClick(page, ".sidebar-menu-product-category");

  // click button add
  await buttonClick(page, ".product-category-pagination-button-add");

  // input category name
  await inputFill(page, ".field-text-name-id", "Elektronik");
  await inputFill(page, ".field-text-name-en", "Electronic");

  // click button save
  // await buttonClick(page, ".product-category-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductCategory;
