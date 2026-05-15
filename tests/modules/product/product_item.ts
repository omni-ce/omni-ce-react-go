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

  //# end delay
  await playNotification("section");
}

export default ProductItem;
