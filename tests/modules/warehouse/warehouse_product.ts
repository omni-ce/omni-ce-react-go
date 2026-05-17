import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFill,
  playNotification,
} from "../../function";
import { checkModuleStart } from "../../variable";

async function WarehouseProduct(page: Page) {
  if (checkModuleStart("Warehouse Product", "product")) {
    return;
  }

  //# Warehouse Product
  // click submenu warehouse: product
  await buttonClick(page, ".sidebar-menu-warehouse-product");

  // click button add
  await buttonClick(page, ".warehouse-product-pagination-button-add");

  // select warehouse_location_id
  await buttonClick(page, "#field-warehouse_location_id", 1000);
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

  // click switch conversion if needed
  await buttonClick(page, ".field-switch-is_converted button", 1000);

  // select unit_in
  await buttonClick(page, "#field-unit_in", 1000);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1)",
  );

  // select unit_out
  await buttonClick(page, "#field-unit_out", 1000);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1)",
  );

  // click button save
  await buttonClick(page, ".warehouse-product-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default WarehouseProduct;
