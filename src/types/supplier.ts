export interface SupplierEntity {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  map: {
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface SupplierProduct {
  id: number;
  supplier_id: number;
  supplier_name: string;
  product_id: number;
  product_name: string;
  is_active: boolean;
}

export interface SupplierProductOption {
  label: string;
  value: number;
  meta: {
    sku: string;
    category: string;
    type: string;
    brand: string;
    varian: string;
    memory?: string;
    color?: string;
    color_hex?: string;
    qty: number;
    buy_price: number;
  };
}
