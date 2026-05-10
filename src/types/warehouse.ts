export interface WarehouseLocation {
  id: number;
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

export interface WarehouseProduct {
  id: number;
  warehouse_location_id: number;
  warehouse_location_name: string;
  product_id: number;
  product_name: string;
  qty: number;
  is_active: boolean;
}
