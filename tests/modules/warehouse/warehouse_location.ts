import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFill,
  playNotification,
  scrollDown,
  selectAddress,
} from "../../function";
import { checkModuleStart } from "../../variable";

async function WarehouseLocation(page: Page) {
  // click menu warehouse
  await buttonClick(page, ".sidebar-menu-warehouse");

  if (checkModuleStart("Warehouse Location", "location")) {
    return;
  }

  //# Warehouse Location
  // click submenu warehouse: location
  await buttonClick(page, ".sidebar-menu-warehouse-location");

  // click button add
  await buttonClick(page, ".warehouse-location-pagination-button-add");

  // select branch_id
  await buttonClick(page, "#field-branch_id", 1000);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1)",
  );

  // select role_id
  await buttonClick(page, "#field-role_id", 1000);
  await buttonClick(
    page,
    "#searchable-select-portal > div.overflow-y-auto.p-1.flex-1 > button:nth-child(1)",
  );

  // input location name (multi-language)
  await inputFill(page, ".field-text-name", "Gudang Utama");

  // click button map
  await buttonClick(page, ".field-group-map-map .field-map-map");
  // click on center page
  await page.mouse.click(300, 300);
  // click map picker button confirm
  await buttonClick(page, ".map-picker-button-confirm");

  // click button save
  await buttonClick(page, ".warehouse-location-pagination-button-save", 1000);

  //# end delay
  await playNotification("section");
}

export default WarehouseLocation;
