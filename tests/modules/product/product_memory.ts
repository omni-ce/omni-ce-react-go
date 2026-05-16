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

  await inputNewMemory(page, "8", "512");
  await inputNewMemory(page, "24", "1024");

  //# end delay
  await playNotification("section");
}

export default ProductMemory;

const inputNewMemory = async (
  page: Page,
  ram: string,
  internal_storage: string,
) => {
  // click button add
  await buttonClick(page, ".product-memory-pagination-button-add");

  // input RAM and Internal Storage
  await inputFill(page, ".field-number-ram", ram);
  await inputFill(page, ".field-number-internal_storage", internal_storage);

  // click button save
  await buttonClick(page, ".product-memory-pagination-button-save", 1000);
};
