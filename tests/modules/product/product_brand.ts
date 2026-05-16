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

  await inputNewBrand(page, "Apple", "company-apple.jpeg");
  await inputNewBrand(page, "Samsung", "company-samsung.png");

  //# end delay
  await playNotification("section");
}

export default ProductBrand;

const inputNewBrand = async (page: Page, name: string, logo: string) => {
  // click button add
  await buttonClick(page, ".product-brand-pagination-button-add");

  // input brand logo
  await inputFile(page, ".field-file-logo", logo);

  // input brand name
  await inputFill(page, ".field-text-name", name);

  // click button save
  await buttonClick(page, ".product-brand-pagination-button-save", 1000);
};
