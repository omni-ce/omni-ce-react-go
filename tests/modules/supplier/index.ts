import type { Page } from "@playwright/test";
import { checkModuleStart } from "../../variable";

import SupplierEntity from "./supplier_entity";
import SupplierProduct from "./supplier_product";

async function Supplier(page: Page) {
  if (checkModuleStart("Supplier", "supplier", true)) {
    return;
  }

  await SupplierEntity(page);
  await SupplierProduct(page);
}

export default Supplier;
