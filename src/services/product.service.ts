import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";

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
