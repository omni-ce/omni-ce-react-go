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

async function ProductMemory(page: Page) {
  if (checkModuleStart("Product Memory", "memory")) {
    return;
  }

  //# Product Memory
  // click submenu product: memory
  await buttonClick(page, ".sidebar-menu-product-memory");

  //# end delay
  await playNotification("section");
}

export default ProductMemory;
