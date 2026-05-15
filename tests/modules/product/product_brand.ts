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

async function ProductBrand(page: Page) {
  if (checkModuleStart("Product Brand", "brand")) {
    return;
  }

  //# Product Brand
  // click submenu product: brand
  await buttonClick(page, ".sidebar-menu-product-brand");

  //# end delay
  await playNotification("section");
}

export default ProductBrand;
