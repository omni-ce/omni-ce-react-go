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

async function ProductType(page: Page) {
  if (checkModuleStart("Product Type", "type")) {
    return;
  }

  //# Product Type
  // click submenu product: type
  await buttonClick(page, ".sidebar-menu-product-type");

  //# end delay
  await playNotification("section");
}

export default ProductType;
