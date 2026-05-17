import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFill,
  playNotification,
} from "../../function";
import { checkModuleStart } from "../../variable";

async function SupplierProduct(page: Page) {
  if (checkModuleStart("Supplier Product", "product")) {
    return;
  }

  //# Supplier Product
  // click submenu supplier: product
  await buttonClick(page, ".sidebar-menu-supplier-product");

  // click button add
  await buttonClick(page, ".supplier-product-pagination-button-add");

  // select supplier_id
  await buttonClick(page, "#field-supplier_id", 1000);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1)",
  );

  // select product_id
  await buttonClick(page, "#field-product_id", 1000);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1)",
  );

  // click button save
  await buttonClick(page, ".supplier-product-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default SupplierProduct;
