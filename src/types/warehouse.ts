export interface WarehouseLocation {
  id: number;
  entity_name: string;
  branch_id: number;
  branch_name: string;
  pic_id: number;
  pic_name: string;
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
  branch_name: string;
  warehouse_location_id: number;
  warehouse_location_name: string;
  product_id: number;
  product_name: string;
  product_category_name: string;
  product_type_name: string;
  qty: number;
  is_active: boolean;
}
