import type { Page } from "@playwright/test";
import { buttonClick, playNotification } from "../../function";
import { checkModuleStart } from "../../variable";

async function WarehouseHistory(page: Page) {
  if (checkModuleStart("Warehouse History", "history")) {
    return;
  }

  //# Warehouse History
  // click submenu warehouse: history
  await buttonClick(page, ".sidebar-menu-warehouse-history");

  //# end delay
  await playNotification("section");
}

export default WarehouseHistory;
