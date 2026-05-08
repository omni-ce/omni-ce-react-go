export interface ProductCategory {
  id: number;
  key: string;
  name: string;
  is_active: boolean;
}
export interface ProductBrand {
  id: number;
  key: string;
  logo: string;
  name: string;
  description: string;
  is_active: boolean;
}
export interface ProductVarian {
  id: number;
  key: string;
  brand_id: number;
  brand_name: string;
  name: string;
  description: string;
  is_active: boolean;
}
export interface ProductColor {
  id: number;
  key: string;
  name: string;
  hex_code: string;
}
export interface ProductItem {
  id: number;
  key: string;
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
