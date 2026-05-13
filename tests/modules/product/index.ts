import type { Page } from "@playwright/test";
import { module_selected, started_exist } from "../../variable";

import ProductCategory from "./product_category";

async function Product(page: Page) {
  if (
    started_exist.length === 0 &&
    module_selected.length > 0 &&
    !module_selected.includes("product")
  ) {
    console.log("Product skip ...");
    return;
  }

  await ProductCategory(page);
}

export default Product;
