import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";

export interface ProductCategory {
  name: string;
  description: string;
  is_active: boolean;
}
export interface ProductBrand {
  logo: string;
  name: string;
  description: string;
  is_active: boolean;
}
export interface ProductVarian {
  brand_id: number;
  name: string;
  description: string;
  is_active: boolean;
}
export interface ProductColor {
  name: string;
  hex_code: string;
}
export interface ProductItem {
  sku: string;
  category_id: number;
  category_name: string;
  varian_id: number;
  brand_varian_name: string;
  color_id?: number;
  color_name?: string;
  color_hex_code?: string;
  is_active: boolean;
}

export const productService = {
  // Product
  product: async () => {
    const response = await satellite.get<Response<unknown>>("/api/product");
    return response.data;
  },

  // Product Category
  productCategory: async () => {
    const response = await satellite.get<Response<unknown>>(
      "/api/product/category",
    );
    return response.data;
  },
};
