export interface ProductCategory {
  id: number;
  key: string;
  icon: string;
  name: string;
  is_active: boolean;
}
export interface ProductType {
  id: number;
  key: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  name: string;
  description: string;
  is_active: boolean;
}
export interface ProductCategoryOption {
  label: string;
  value: number;
  meta: {
    icon: string;
  };
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
  category_id: number;
  category_name: string;
  category_icon: string;
  type_id: number;
  type_name: string;
  brand_id: number;
  brand_name: string;
  brand_logo: string;
  name: string;
  description: string;
  is_active: boolean;
}
export interface ProductBrandOption {
  label: string;
  value: number;
  meta: {
    logo: string;
  };
}
export interface ProductMemory {
  id: number;
  key: string;
  ram: string;
  internal_storage: string;
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
  sku_imei?: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  type_id: number;
  type_name: string;
  varian_id: number;
  brand_name: string;
  brand_logo: string;
  varian_name: string;
  memory_id?: number;
  memory_name?: string;
  color_id?: number;
  color_name?: string;
  color_hex?: string;
  qty: number;
  price: number;
  is_active: boolean;
}

export interface ProductItemOption {
  label: string;
  value: number;
  meta: {
    sku: string;
    sku_imei?: string;
    category: string;
    type: string;
    brand: string;
    varian: string;
    memory?: string;
    color?: string;
    color_hex?: string;
    qty: number;
    price: number;
  };
}
