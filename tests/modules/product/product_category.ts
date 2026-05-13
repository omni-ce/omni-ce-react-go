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
  await buttonClick(page, ".sidebar-menu-product-category");

  if (!module_selected.includes("category")) {
    console.log("Product Category skip ...");
    return;
  }

  //# product: category
  // click submenu product: category
  await buttonClick(page, ".sidebar-menu-product-category");

  // click button add
  await buttonClick(page, ".product-category-pagination-button-add");

  // click button save
  // await buttonClick(page, ".product-category-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductCategory;
