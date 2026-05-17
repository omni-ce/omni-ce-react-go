import type { Page } from "@playwright/test";
import { checkModuleStart } from "../../variable";

import WarehouseLocation from "./warehouse_location";
import WarehouseProduct from "./warehouse_product";
import WarehouseHistory from "./warehouse_history";

async function Warehouse(page: Page) {
  if (checkModuleStart("Warehouse", "warehouse", true)) {
    return;
  }

  await WarehouseLocation(page);
  await WarehouseProduct(page);
  // await WarehouseHistory(page);
}

export default Warehouse;
