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

  // click button add
  await buttonClick(page, ".product-memory-pagination-button-add");

  // input RAM and Internal Storage
  await inputFill(page, ".field-number-ram", "8");
  await inputFill(page, ".field-number-internal_storage", "256");

  // click button save
  await buttonClick(page, ".product-memory-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default ProductMemory;
