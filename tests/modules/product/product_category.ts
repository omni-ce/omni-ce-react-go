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

async function ProductCategory(page: Page) {
  // click menu product
  await buttonClick(page, ".sidebar-menu-product");

  if (checkModuleStart("Product Category", "category")) {
    return;
  }

  //# Product Category
  // click submenu product: category
  await buttonClick(page, ".sidebar-menu-product-category");

  await insertNewProductCategory(
    page,
    "Elektronik",
    "Electronic",
    "Md",
    "electrical",
  );

  //# end delay
  await playNotification("section");
}

export default ProductCategory;

const insertNewProductCategory = async (
  page: Page,
  name_id: string,
  name_en: string,
  icon_library: string,
  icon_search: string,
) => {
  // click button add
  await buttonClick(page, ".product-category-pagination-button-add");

  // input category name
  await inputFill(page, ".field-text-name-id", name_id);
  await inputFill(page, ".field-text-name-en", name_en);

  // click icon selector
  await buttonClick(page, ".field-icon-icon");
  await selectOption(page, ".icon-selector-library-select", icon_library);
  await inputFill(
    page,
    "#icon-dropdown-portal > div.p-3.space-y-2.bg-dark-900.border-b.border-dark-600 > div.relative.flex.items-center.gap-2 > input",
    icon_search,
  );
  await buttonClick(page, "#icon-dropdown-portal .grid button");

  // click button save
  await buttonClick(page, ".product-category-pagination-button-save", 1000);
};
