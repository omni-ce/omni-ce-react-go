export interface WarehouseLocation {
  id: number;
  entity_name: string;
  entity_logo: string;
  branch_id: number;
  branch_name: string;
  role_id: number;
  role_name: string;
  division_id: number;
  division_name: string;
  name: string;
  map: {
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
}
export interface WarehouseLocationOption {
  label: string;
  value: number;
  meta: {
    entity_logo: string;
  };
}

export interface WarehouseProduct {
  id: number;
  entity_name: string;
  entity_logo: string;
  branch_name: string;
  warehouse_location_id: number;
  warehouse_location_name: string;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_category_name: string;
  product_type_name: string;
  product_brand_logo: string;
  qty: number;
  is_active: boolean;
}
