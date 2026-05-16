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

  // click button add
  await buttonClick(page, ".product-condition-pagination-button-add");

  // input condition name (multi-language)
  await inputFill(page, ".field-text-name-id", "Baru");
  await inputFill(page, ".field-text-name-en", "New");
  await inputFill(
    page,
    ".field-textarea-description",
    "Produk dalam kondisi segel dan baru",
  );

  // click button save
  await buttonClick(page, ".product-condition-pagination-button-save", 1000);

  await inputNewCondition(
    page,
    "Baru",
    "New",
    "Produk dalam kondisi segel dan baru",
  );
  await inputNewCondition(
    page,
    "Bekas",
    "Used",
    "Produk yang sudah pernah digunakan atau dibuka segelnya",
  );
  await inputNewCondition(
    page,
    "Perbaikan",
    "Refurbished",
    "Produk yang sudah pernah diperbaiki atau dimodifikasi",
  );

  //# end delay
  await playNotification("section");
}

export default ProductCondition;

const inputNewCondition = async (
  page: Page,
  name_id: string,
  name_en: string,
  description: string,
) => {
  // click button add
  await buttonClick(page, ".product-condition-pagination-button-add");

  // input condition name (multi-language)
  await inputFill(page, ".field-text-name-id", name_id);
  await inputFill(page, ".field-text-name-en", name_en);
  await inputFill(page, ".field-textarea-description", description);

  // click button save
  await buttonClick(page, ".product-condition-pagination-button-save", 1000);
};
