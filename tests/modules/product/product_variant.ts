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

async function ProductVariant(page: Page) {
  if (checkModuleStart("Product Variant", "variant")) {
    return;
  }

  //# Product Variant
  // click submenu product: variant
  await buttonClick(page, ".sidebar-menu-product-variant");

  //# end delay
  await playNotification("section");
}

export default ProductVariant;
