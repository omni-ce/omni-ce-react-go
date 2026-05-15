import type { Page } from "@playwright/test";
import { checkModuleStart } from "../../variable";

import ProductCategory from "./product_category";
import ProductType from "./product_type";
import ProductBrand from "./product_brand";

async function Product(page: Page) {
  if (checkModuleStart("Product", "product")) {
    return;
  }

  await ProductCategory(page);
  await ProductType(page);
  await ProductBrand(page);
}

export default Product;
