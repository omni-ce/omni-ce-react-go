import type { Page } from "@playwright/test";
import { checkModuleStart } from "../../variable";

import ProductCategory from "./product_category";
import ProductType from "./product_type";
import ProductBrand from "./product_brand";
import ProductVariant from "./product_variant";
import ProductMemory from "./product_memory";
import ProductColor from "./product_color";
import ProductCondition from "./product_condition";
import ProductItem from "./product_item";

async function Product(page: Page) {
  if (checkModuleStart("Product", "product", true)) {
    return;
  }

  await ProductCategory(page);
  await ProductType(page);
  await ProductBrand(page);
  await ProductVariant(page);
  await ProductMemory(page);
  await ProductColor(page);
  await ProductCondition(page);
  await ProductItem(page);
}

export default Product;
