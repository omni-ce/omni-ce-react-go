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

  //# end delay
  await playNotification("section");
}

export default ProductCondition;
